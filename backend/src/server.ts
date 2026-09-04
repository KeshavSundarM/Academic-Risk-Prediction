import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { allowRoles, requireAuth, signUser } from './middleware/auth.js';
import { connectDatabase, databaseStatus } from './lib/database.js';
import { cacheStatus, connectRedis, getCache, invalidateCache, setCache } from './lib/cache.js';
import { addIntervention, addStudent, assessmentRecords, attendanceRecords, departments, getDepartmentAnalytics, getOverview, getPerformance, getRisk, getStudent, interventions, students, updateIntervention, updateStudent, users } from './lib/store.js';
import { calculateRisk } from './services/riskPredictionService.js';

export const app = express();
export default app;
const passwordHashes = new Map<string, string>([['admin@edurisk.ai', bcrypt.hashSync('password', 10)]]);
const port = Number(process.env.PORT || 4000);
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
const asyncRoute = (handler: (req: Request, res: Response, next: NextFunction) => unknown) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req, res, next)).catch(next);

app.get('/api/health', asyncRoute(async (_req, res) => res.json({ status: 'ok', services: { api: 'connected', postgres: databaseStatus, redis: cacheStatus() } })));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1), role: z.enum(['admin', 'faculty', 'mentor']).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Enter a valid email and password' });
  const user = users.find(item => item.email.toLowerCase() === parsed.data.email.toLowerCase()) || (parsed.data.email.toLowerCase() === 'admin@edurisk.ai' ? users[0] : undefined);
  if (!user || (parsed.data.role && user.role !== parsed.data.role)) return res.status(401).json({ message: 'We could not match those credentials. Try the demo admin account.' });
  const passwordHash = passwordHashes.get(user.email);
  if (passwordHash && !(await bcrypt.compare(parsed.data.password, passwordHash))) return res.status(401).json({ message: 'Incorrect password. Try the demo password: password' });
  const token = signUser(user); return res.json({ token, user });
}));
app.post('/api/auth/register', asyncRoute(async (req, res) => { const parsed = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), role: z.enum(['admin', 'faculty', 'mentor']) }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ message: 'Invalid registration details' }); const user = { id: `user-${Date.now()}`, name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, avatarColor: '#5b5bd6' as const }; users.push(user); passwordHashes.set(user.email, await bcrypt.hash(parsed.data.password, 10)); return res.status(201).json({ user, token: signUser(user) }); }));
app.get('/api/auth/me', requireAuth, asyncRoute(async (req, res) => res.json({ user: users.find(u => u.id === req.user?.id) || req.user })));

app.get('/api/departments', requireAuth, asyncRoute(async (_req, res) => res.json({ data: departments })));
app.get('/api/faculty', requireAuth, asyncRoute(async (_req, res) => res.json({ data: users.filter(u => u.role !== 'admin') })));

app.get('/api/students', requireAuth, asyncRoute(async (req, res) => {
  const q = String(req.query.search || '').toLowerCase(); const department = String(req.query.department || 'all'); const year = String(req.query.year || 'all'); const risk = String(req.query.risk || 'all');
  const sort = String(req.query.sort || 'risk'); const order = String(req.query.order || 'desc'); const page = Math.max(1, Number(req.query.page || 1)); const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
  let result = students.filter(s => (!q || `${s.name} ${s.studentId} ${s.email}`.toLowerCase().includes(q)) && (department === 'all' || s.departmentId === department || s.department === department) && (year === 'all' || String(s.year) === year) && (risk === 'all' || s.riskLevel === risk));
  result = [...result].sort((a, b) => { const av = sort === 'name' ? a.name : sort === 'attendance' ? a.attendance : sort === 'score' ? a.riskScore : a.riskScore; const bv = sort === 'name' ? b.name : sort === 'attendance' ? b.attendance : sort === 'score' ? b.riskScore : b.riskScore; return (av > bv ? 1 : av < bv ? -1 : 0) * (order === 'asc' ? 1 : -1); });
  const total = result.length; return res.json({ data: result.slice((page - 1) * limit, page * limit), pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
}));
app.get('/api/students/:id', requireAuth, asyncRoute(async (req, res) => {
  const student = getStudent(String(req.params.id));
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const periods = (values: number[], prefix: string) => values.map((value, i) => ({ period: `${prefix}${i + 1}`, value: Math.min(100, Math.max(0, value)) }));
  return res.json({ data: { student, risk: getRisk(student.id), interventions: interventions.filter(i => i.studentId === student.id), attendanceTrend: periods([student.attendance - 8, student.attendance - 5, student.attendance - 3, student.attendance - 1, student.attendance, student.attendance], 'W'), marksTrend: periods([student.previousPerformance, student.assessment + 4, student.assessment + 1, student.assessment - 2, student.assessment], 'M'), engagementTrend: periods([student.engagement - 12, student.engagement - 6, student.engagement - 4, student.engagement + 2, student.engagement], 'W') } });
}));
app.post('/api/students', requireAuth, allowRoles('admin'), asyncRoute(async (req, res) => { const parsed = z.object({ studentId: z.string().min(3), name: z.string().min(2), email: z.string().email(), departmentId: z.string(), year: z.number(), semester: z.number() }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ message: 'Check the student details and try again' }); const student = addStudent(parsed.data); return res.status(201).json({ data: student }); }));
app.put('/api/students/:id', requireAuth, allowRoles('admin', 'faculty', 'mentor'), asyncRoute(async (req, res) => { const student = updateStudent(String(req.params.id), req.body); if (!student) return res.status(404).json({ message: 'Student not found' }); await invalidateCache(`student:risk:${student.id}`); return res.json({ data: student }); }));
app.delete('/api/students/:id', requireAuth, allowRoles('admin'), asyncRoute(async (req, res) => { const index = students.findIndex(s => s.id === String(req.params.id)); if (index < 0) return res.status(404).json({ message: 'Student not found' }); students.splice(index, 1); return res.status(204).send(); }));

app.get('/api/risk/students', requireAuth, asyncRoute(async (req, res) => { const level = String(req.query.level || 'all'); return res.json({ data: students.filter(s => level === 'all' || s.riskLevel === level).sort((a, b) => b.riskScore - a.riskScore), summary: getOverview() }); }));
app.get('/api/risk/students/:id', requireAuth, asyncRoute(async (req, res) => { const key = `student:risk:${String(req.params.id)}`; const cached = await getCache(key); if (cached) return res.json({ data: JSON.parse(cached), cached: true }); const risk = getRisk(String(req.params.id)); if (!risk) return res.status(404).json({ message: 'Student not found' }); await setCache(key, risk, 120); return res.json({ data: risk, cached: false }); }));
app.post('/api/risk/calculate/:studentId', requireAuth, asyncRoute(async (req, res) => { const student = getStudent(String(req.params.studentId)); if (!student) return res.status(404).json({ message: 'Student not found' }); const result = calculateRisk(student); student.riskScore = result.score; student.riskLevel = result.level; student.lastUpdated = new Date().toISOString(); await invalidateCache(`student:risk:${student.id}`); return res.json({ data: getRisk(student.id) }); }));

app.get('/api/interventions', requireAuth, asyncRoute(async (req, res) => { const status = String(req.query.status || 'all'); return res.json({ data: interventions.filter(i => status === 'all' || i.status === status) }); }));
app.post('/api/interventions', requireAuth, allowRoles('admin', 'faculty', 'mentor'), asyncRoute(async (req, res) => { const parsed = z.object({ studentId: z.string(), assignedTo: z.string(), type: z.string(), notes: z.string().default(''), status: z.enum(['pending', 'in_progress', 'completed']).default('pending'), followUpDate: z.string() }).safeParse(req.body); if (!parsed.success || !getStudent(parsed.data.studentId)) return res.status(400).json({ message: 'Select a valid student and complete the intervention details' }); return res.status(201).json({ data: addIntervention(parsed.data) }); }));
app.put('/api/interventions/:id', requireAuth, allowRoles('admin', 'faculty', 'mentor'), asyncRoute(async (req, res) => { const item = updateIntervention(String(req.params.id), req.body); if (!item) return res.status(404).json({ message: 'Intervention not found' }); return res.json({ data: item }); }));
app.delete('/api/interventions/:id', requireAuth, allowRoles('admin', 'faculty', 'mentor'), asyncRoute(async (req, res) => { const index = interventions.findIndex(i => i.id === String(req.params.id)); if (index < 0) return res.status(404).json({ message: 'Intervention not found' }); interventions.splice(index, 1); await invalidateCache('dashboard:overview'); return res.status(204).send(); }));

app.get('/api/attendance', requireAuth, asyncRoute(async (req, res) => { const studentId = String(req.query.studentId || 'all'); return res.json({ data: attendanceRecords.filter(a => studentId === 'all' || a.studentId === studentId).slice(0, 100) }); }));
app.post('/api/attendance', requireAuth, allowRoles('admin', 'faculty'), asyncRoute(async (req, res) => { const parsed = z.object({ studentId: z.string(), subjectId: z.string(), date: z.string(), status: z.enum(['present', 'absent']) }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ message: 'Invalid attendance record' }); const student = getStudent(parsed.data.studentId); const subject = (await import('./lib/store.js')).subjectIds?.find((s: any) => s.id === parsed.data.subjectId); const record = { id: `att-${Date.now()}`, ...parsed.data, studentName: student?.name || '', subject: subject?.name || 'General' }; attendanceRecords.unshift(record); return res.status(201).json({ data: record }); }));
app.put('/api/attendance/:id', requireAuth, allowRoles('admin', 'faculty'), asyncRoute(async (req, res) => { const item = attendanceRecords.find(a => a.id === String(req.params.id)); if (!item) return res.status(404).json({ message: 'Attendance record not found' }); Object.assign(item, req.body); return res.json({ data: item }); }));
app.get('/api/assessments', requireAuth, asyncRoute(async (req, res) => { const studentId = String(req.query.studentId || 'all'); return res.json({ data: assessmentRecords.filter(a => studentId === 'all' || a.studentId === studentId).slice(0, 100) }); }));
app.post('/api/assessments', requireAuth, allowRoles('admin', 'faculty'), asyncRoute(async (req, res) => { const parsed = z.object({ studentId: z.string(), subject: z.string(), type: z.string(), marks: z.number(), maxMarks: z.number(), date: z.string() }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ message: 'Invalid assessment record' }); const student = getStudent(parsed.data.studentId); const record = { id: `asm-${Date.now()}`, ...parsed.data, studentName: student?.name || '' }; assessmentRecords.unshift(record); return res.status(201).json({ data: record }); }));
app.put('/api/assessments/:id', requireAuth, allowRoles('admin', 'faculty'), asyncRoute(async (req, res) => { const item = assessmentRecords.find(a => a.id === String(req.params.id)); if (!item) return res.status(404).json({ message: 'Assessment not found' }); Object.assign(item, req.body); return res.json({ data: item }); }));

app.get('/api/analytics/overview', requireAuth, asyncRoute(async (_req, res) => { const key = 'dashboard:overview'; const cached = await getCache(key); if (cached) return res.json({ data: JSON.parse(cached), cached: true }); const data = getOverview(); await setCache(key, data, 60); return res.json({ data, cached: false }); }));
app.get('/api/analytics/departments', requireAuth, asyncRoute(async (_req, res) => { const key = 'analytics:departments'; const cached = await getCache(key); if (cached) return res.json({ data: JSON.parse(cached), cached: true }); const data = getDepartmentAnalytics(); await setCache(key, data, 120); return res.json({ data, cached: false }); }));
app.get('/api/analytics/performance', requireAuth, asyncRoute(async (_req, res) => res.json({ data: getPerformance() })));
app.get('/api/alerts', requireAuth, asyncRoute(async (_req, res) => { const overview = getOverview(); return res.json({ data: [{ id: 'alert-1', type: 'high', title: `${overview.highRisk} students have entered the high-risk category`, detail: 'Review the priority queue and create an intervention plan.', time: 'Today, 9:42 AM', read: false }, { id: 'alert-2', type: 'medium', title: '5 students have attendance below 75%', detail: 'Attendance counseling is recommended for the affected cohort.', time: 'Yesterday, 4:18 PM', read: false }, { id: 'alert-3', type: 'high', title: '3 students show a significant decline in assessments', detail: 'The Risk Engine detected a 15%+ term-over-term decline.', time: 'Aug 31, 11:06 AM', read: true }, { id: 'alert-4', type: 'success', title: '8 students improved after intervention', detail: 'Their risk score improved by an average of 18 points.', time: 'Aug 29, 2:10 PM', read: true }] }); }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => { console.error(err); res.status(500).json({ message: 'Something went wrong on the server' }); });
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

await connectDatabase();
await connectRedis();
if (!process.env.VERCEL) app.listen(port, '0.0.0.0', () => console.log(`EduRisk API listening on http://0.0.0.0:${port}`));
