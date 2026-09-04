import { randomUUID } from 'node:crypto';
import { AssessmentRecord, AttendanceRecord, Department, Intervention, RiskAnalysis, Student, User } from '../types.js';
import { analyzeRisk, calculateRisk } from '../services/riskPredictionService.js';

const departmentSeed = [
  ['Computer Science', 'CSE'], ['Artificial Intelligence & Data Science', 'AIDS'], ['Information Technology', 'IT'], ['Electronics & Communication', 'ECE'], ['Mechanical Engineering', 'MECH']
];
const firstNames = ['Aarav','Aditi','Akash','Ananya','Arjun','Bhavya','Charan','Diya','Harish','Ishita','Karthik','Kavya','Lokesh','Meera','Naveen','Niharika','Pranav','Priya','Rahul','Riya','Rohan','Sahana','Sai','Sanjay','Shreya','Siddharth','Sneha','Surya','Tanvi','Varun','Vignesh','Yamini','Abhinav','Amritha','Deepak','Divya','Gokul','Keerthana','Manoj','Pooja','Sanjana','Tarun','Vasudha','Yash','Zoya','Advaith','Gayatri','Madhan','Nandhini','Vivek'];
const lastNames = ['Iyer','Sharma','Reddy','Krishnan','Nair','Patel','Menon','Rao','Kumar','Mishra'];
const subjects = ['Data Structures','Machine Learning','Database Systems','Digital Electronics','Engineering Mechanics','Web Technologies'];
export const subjectIds = subjects.map((name, i) => ({ id: `sub-${i + 1}`, name, code: `CS${i + 201}` }));
const avatarColors = ['#5b5bd6','#e87952','#2b9a8f','#d69e2e','#9b6bd2','#e45c81'];
export const departments: Department[] = departmentSeed.map(([name, code], i) => ({ id: `dept-${i + 1}`, name, code }));
export const users: User[] = [
  { id: 'user-admin', name: 'Dr. Ananya Rao', email: 'admin@edurisk.ai', role: 'admin', title: 'Institution Administrator', avatarColor: '#5b5bd6' },
  { id: 'user-1', name: 'Dr. Kavita Menon', email: 'kavita.menon@edurisk.ai', role: 'faculty', title: 'Associate Professor', department: 'Computer Science', avatarColor: '#e87952' },
  { id: 'user-2', name: 'Prof. Arjun Iyer', email: 'arjun.iyer@edurisk.ai', role: 'faculty', title: 'Assistant Professor', department: 'Information Technology', avatarColor: '#2b9a8f' },
  { id: 'user-3', name: 'Dr. Meera Nair', email: 'meera.nair@edurisk.ai', role: 'mentor', title: 'Senior Mentor', department: 'Computer Science', avatarColor: '#d69e2e' },
  ...Array.from({ length: 7 }, (_, i) => ({ id: `user-${i + 4}`, name: `Faculty Member ${i + 1}`, email: `faculty${i + 1}@edurisk.ai`, role: 'faculty' as const, title: 'Faculty member', department: departments[i % 5].name, avatarColor: avatarColors[i % avatarColors.length] }))
];
export const students: Student[] = Array.from({ length: 50 }, (_, i) => {
  const dept = departments[i % departments.length];
  const high = [3, 8, 10, 14, 17, 22, 27, 31, 38, 42, 46].includes(i);
  const medium = [1, 5, 12, 19, 24, 29, 34, 36, 40, 44, 48].includes(i);
  const attendance = high ? 38 + (i % 15) : medium ? 70 + (i % 7) : 82 + (i % 14);
  const assessment = high ? 28 + (i % 17) : medium ? 61 + (i % 12) : 76 + (i % 18);
  const assignment = high ? 26 + (i % 25) : medium ? 65 + (i % 13) : 80 + (i % 16);
  const exam = high ? 30 + (i % 21) : medium ? 58 + (i % 16) : 74 + (i % 20);
  const engagement = high ? 25 + (i % 28) : medium ? 60 + (i % 18) : 78 + (i % 16);
  const name = `${firstNames[i]} ${lastNames[i % lastNames.length]}`;
  const result = calculateRisk({ attendance, assessment, assignment, exam, engagement });
  return { id: `student-${i + 1}`, studentId: `ER202${i % 4 + 3}${String(i + 1).padStart(3, '0')}`, name, email: `${firstNames[i].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@students.edurisk.ai`, phone: `+91 98${String(10000000 + i * 17321).slice(0, 8)}`, department: dept.name, departmentId: dept.id, year: (i % 4) + 1, semester: (i % 8) + 1, mentor: i % 2 ? 'Dr. Meera Nair' : 'Dr. Kavita Menon', mentorId: i % 2 ? 'user-3' : 'user-1', avatarColor: avatarColors[i % avatarColors.length], attendance, assessment, assignment, exam, engagement, previousPerformance: Math.min(96, assessment + (i % 3 === 0 ? 17 : -3)), riskScore: result.score, riskLevel: result.level, lastUpdated: new Date(Date.now() - (i % 9) * 86400000).toISOString() };
});
export const attendanceRecords: AttendanceRecord[] = students.flatMap((student, si) => Array.from({ length: 6 }, (_, j) => ({ id: `att-${si}-${j}`, studentId: student.id, studentName: student.name, subject: subjects[(si + j) % subjects.length], subjectId: subjectIds[(si + j) % subjectIds.length].id, date: new Date(Date.now() - j * 86400000).toISOString().slice(0, 10), status: (j < Math.round(student.attendance / 20) ? 'present' : 'absent') as 'present' | 'absent' })));
export const assessmentRecords: AssessmentRecord[] = students.flatMap((student, si) => Array.from({ length: 3 }, (_, j) => ({ id: `asm-${si}-${j}`, studentId: student.id, studentName: student.name, subject: subjects[(si + j) % subjects.length], type: ['Internal Assessment 1', 'Assignment', 'Model Exam'][j], marks: Math.round((student.assessment + (j === 2 ? student.exam - student.assessment : 0) + (si % 7 - 3)) * 0.8), maxMarks: 80, date: new Date(Date.now() - (j + 1) * 12 * 86400000).toISOString().slice(0, 10) })));
export const interventions: Intervention[] = students.filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium').slice(0, 18).map((s, i) => ({ id: `int-${i + 1}`, studentId: s.id, studentName: s.name, assignedTo: i % 2 ? 'Dr. Meera Nair' : 'Dr. Kavita Menon', type: ['Academic Counseling', 'Attendance Counseling', 'Mentor Meeting', 'Assignment Follow-up'][i % 4], notes: i % 3 ? 'Initial check-in completed. Student has a clear next-step plan.' : 'Needs subject-wise support and weekly follow-up.', status: (i < 13 ? 'completed' : i % 2 ? 'in_progress' : 'pending'), followUpDate: new Date(Date.now() + (i + 2) * 86400000).toISOString().slice(0, 10), createdAt: new Date(Date.now() - (i + 4) * 86400000).toISOString(), completedAt: i < 13 ? new Date(Date.now() - (i + 1) * 86400000).toISOString() : undefined }));

export function getStudent(id: string) { return students.find(s => s.id === id || s.studentId === id); }
export function getRisk(id: string): RiskAnalysis | undefined { const student = getStudent(id); return student ? analyzeRisk(student) : undefined; }
export function getOverview() {
  const counts = { low: students.filter(s => s.riskLevel === 'low').length, medium: students.filter(s => s.riskLevel === 'medium').length, high: students.filter(s => s.riskLevel === 'high').length };
  return { totalStudents: students.length, lowRisk: counts.low, mediumRisk: counts.medium, highRisk: counts.high, averageAttendance: Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length), averageScore: Math.round(students.reduce((a, s) => a + (100 - s.riskScore), 0) / students.length), interventionSuccess: Math.round(interventions.filter(i => i.status === 'completed').length / Math.max(1, interventions.length) * 100), riskDistribution: [{ name: 'Low risk', value: counts.low, color: '#2b9a8f' }, { name: 'Medium risk', value: counts.medium, color: '#d69e2e' }, { name: 'High risk', value: counts.high, color: '#e45c81' }], performanceTrend: [{ month: 'Jan', score: 68 }, { month: 'Feb', score: 71 }, { month: 'Mar', score: 69 }, { month: 'Apr', score: 74 }, { month: 'May', score: 76 }, { month: 'Jun', score: 78 }], weeklyRisk: [{ week: 'W1', high: 14, medium: 19, low: 17 }, { week: 'W2', high: 12, medium: 20, low: 18 }, { week: 'W3', high: 11, medium: 17, low: 22 }, { week: 'W4', high: 9, medium: 15, low: 26 }] };
}
export function getDepartmentAnalytics() { return departments.map(d => { const group = students.filter(s => s.departmentId === d.id); return { department: d.code, name: d.name, students: group.length, high: group.filter(s => s.riskLevel === 'high').length, medium: group.filter(s => s.riskLevel === 'medium').length, low: group.filter(s => s.riskLevel === 'low').length, attendance: Math.round(group.reduce((a, s) => a + s.attendance, 0) / group.length), score: Math.round(group.reduce((a, s) => a + s.assessment, 0) / group.length) }; }); }
export function getPerformance() { return [{ month: 'Jan', attendance: 78, assessment: 71, engagement: 64 }, { month: 'Feb', attendance: 80, assessment: 73, engagement: 67 }, { month: 'Mar', attendance: 79, assessment: 72, engagement: 70 }, { month: 'Apr', attendance: 83, assessment: 77, engagement: 74 }, { month: 'May', attendance: 85, assessment: 79, engagement: 76 }, { month: 'Jun', attendance: 87, assessment: 82, engagement: 80 }]; }
export function addIntervention(input: Omit<Intervention, 'id' | 'studentName' | 'createdAt'>) { const student = getStudent(input.studentId); const item: Intervention = { ...input, id: randomUUID(), studentName: student?.name || 'Unknown student', createdAt: new Date().toISOString() }; interventions.unshift(item); return item; }
export function updateIntervention(id: string, patch: Partial<Intervention>) { const item = interventions.find(i => i.id === id); if (!item) return undefined; Object.assign(item, patch); if (patch.status === 'completed') item.completedAt = new Date().toISOString(); return item; }
export function addStudent(input: { studentId: string; name: string; email: string; departmentId: string; year: number; semester: number }) {
  const department = departments.find(d => d.id === input.departmentId) || departments[0];
  const student: Student = { id: randomUUID(), studentId: input.studentId, name: input.name, email: input.email, phone: '', department: department.name, departmentId: department.id, year: input.year, semester: input.semester, mentor: 'Dr. Meera Nair', mentorId: 'user-3', avatarColor: avatarColors[students.length % avatarColors.length], attendance: 0, assessment: 0, assignment: 0, exam: 0, engagement: 0, previousPerformance: 0, riskScore: 100, riskLevel: 'high', lastUpdated: new Date().toISOString() };
  students.unshift(student); return student;
}
export function updateStudent(id: string, patch: Partial<Student>) { const student = getStudent(id); if (!student) return undefined; Object.assign(student, patch); const result = calculateRisk(student); student.riskScore = result.score; student.riskLevel = result.level; student.lastUpdated = new Date().toISOString(); return student; }
