import { AssessmentRecord, Department, DepartmentStat, Intervention, Overview, RiskAnalysis, RiskLevel, Student, User } from '../types';

export const departmentSeed: Department[] = [
  { id: 'dept-1', name: 'Computer Science', code: 'CSE' },
  { id: 'dept-2', name: 'Artificial Intelligence & Data Science', code: 'AIDS' },
  { id: 'dept-3', name: 'Information Technology', code: 'IT' },
  { id: 'dept-4', name: 'Electronics & Communication', code: 'ECE' },
  { id: 'dept-5', name: 'Mechanical Engineering', code: 'MECH' }
];

const firstNames = ['Aarav','Aditi','Akash','Ananya','Arjun','Bhavya','Charan','Diya','Harish','Ishita','Karthik','Kavya','Lokesh','Meera','Naveen','Niharika','Pranav','Priya','Rahul','Riya','Rohan','Sahana','Sai','Sanjay','Shreya','Siddharth','Sneha','Surya','Tanvi','Varun','Vignesh','Yamini','Abhinav','Amritha','Deepak','Divya','Gokul','Keerthana','Manoj','Pooja','Sanjana','Tarun','Vasudha','Yash','Zoya','Advaith','Gayatri','Madhan','Nandhini','Vivek'];
const lastNames = ['Iyer','Sharma','Reddy','Krishnan','Nair','Patel','Menon','Rao','Kumar','Mishra'];
const avatarColors = ['#5b5bd6','#e87952','#2b9a8f','#d69e2e','#9b6bd2','#e45c81'];

export const defaultUsers: User[] = [
  { id: 'user-admin', name: 'Dr. Ananya Rao', email: 'admin@edurisk.ai', role: 'admin', title: 'Institution Administrator', avatarColor: '#5b5bd6' },
  { id: 'user-1', name: 'Dr. Kavita Menon', email: 'kavita.menon@edurisk.ai', role: 'faculty', title: 'Associate Professor', department: 'Computer Science', avatarColor: '#e87952' },
  { id: 'user-2', name: 'Prof. Arjun Iyer', email: 'arjun.iyer@edurisk.ai', role: 'faculty', title: 'Assistant Professor', department: 'Information Technology', avatarColor: '#2b9a8f' },
  { id: 'user-3', name: 'Dr. Meera Nair', email: 'meera.nair@edurisk.ai', role: 'mentor', title: 'Senior Mentor', department: 'Computer Science', avatarColor: '#d69e2e' }
];

export function calculateRisk(inputs: { attendance: number; assessment: number; assignment: number; exam: number; engagement: number }): { score: number; level: RiskLevel } {
  const weighted = inputs.attendance * 0.25 + inputs.assessment * 0.30 + inputs.assignment * 0.15 + inputs.exam * 0.20 + inputs.engagement * 0.10;
  const score = Math.round(Math.max(0, Math.min(100, 100 - weighted)));
  const level: RiskLevel = score <= 30 ? 'low' : score <= 60 ? 'medium' : 'high';
  return { score, level };
}

export function analyzeRisk(student: Student): RiskAnalysis {
  const result = calculateRisk(student);
  const factors: string[] = [];
  const recommendations: string[] = [];
  if (student.attendance < 75) { factors.push('Attendance below the recommended 75% threshold'); recommendations.push('Recommend attendance counseling and regular attendance monitoring.'); }
  if (student.assessment < 60) { factors.push('Assessment performance is below the academic benchmark'); recommendations.push('Recommend additional academic support and remedial classes.'); }
  if (student.assignment < 65) { factors.push('Assignment completion needs attention'); recommendations.push('Recommend assignment completion follow-up.'); }
  if (student.exam < 60) { factors.push('Exam readiness is trending below target'); recommendations.push('Create a focused exam preparation plan with subject faculty.'); }
  if (student.engagement < 60) { factors.push('Low classroom and platform engagement'); recommendations.push('Recommend mentor meeting and increased classroom participation.'); }
  if (student.previousPerformance - student.assessment >= 15) { factors.push('Assessment performance has declined versus previous term'); }
  if (result.level === 'high' || factors.length >= 3) recommendations.push('Recommend a one-to-one mentor intervention with a follow-up review.');
  return {
    studentId: student.id,
    attendance: student.attendance,
    assessment: student.assessment,
    assignment: student.assignment,
    exam: student.exam,
    engagement: student.engagement,
    score: result.score,
    level: result.level,
    factors: factors.length ? factors : ['No significant academic risk factors detected'],
    recommendations: recommendations.length ? recommendations : ['Continue current support plan and monitor progress monthly.'],
    calculatedAt: new Date().toISOString()
  };
}

export const initialStudents: Student[] = Array.from({ length: 50 }, (_, i) => {
  const dept = departmentSeed[i % departmentSeed.length];
  const high = [3, 8, 10, 14, 17, 22, 27, 31, 38, 42, 46].includes(i);
  const medium = [1, 5, 12, 19, 24, 29, 34, 36, 40, 44, 48].includes(i);
  const attendance = high ? 38 + (i % 15) : medium ? 70 + (i % 7) : 82 + (i % 14);
  const assessment = high ? 28 + (i % 17) : medium ? 61 + (i % 12) : 76 + (i % 18);
  const assignment = high ? 26 + (i % 25) : medium ? 65 + (i % 13) : 80 + (i % 16);
  const exam = high ? 30 + (i % 21) : medium ? 58 + (i % 16) : 74 + (i % 20);
  const engagement = high ? 25 + (i % 28) : medium ? 60 + (i % 18) : 78 + (i % 16);
  const name = `${firstNames[i]} ${lastNames[i % lastNames.length]}`;
  const result = calculateRisk({ attendance, assessment, assignment, exam, engagement });
  return {
    id: `student-${i + 1}`,
    studentId: `ER202${(i % 4) + 3}${String(i + 1).padStart(3, '0')}`,
    name,
    email: `${firstNames[i].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@students.edurisk.ai`,
    phone: `+91 98${String(10000000 + i * 17321).slice(0, 8)}`,
    department: dept.name,
    departmentId: dept.id,
    year: (i % 4) + 1,
    semester: (i % 8) + 1,
    mentor: i % 2 ? 'Dr. Meera Nair' : 'Dr. Kavita Menon',
    mentorId: i % 2 ? 'user-3' : 'user-1',
    avatarColor: avatarColors[i % avatarColors.length],
    attendance,
    assessment,
    assignment,
    exam,
    engagement,
    previousPerformance: Math.min(96, assessment + (i % 3 === 0 ? 17 : -3)),
    riskScore: result.score,
    riskLevel: result.level,
    lastUpdated: new Date(Date.now() - (i % 9) * 86400000).toISOString()
  };
});

export const initialInterventions: Intervention[] = initialStudents.filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium').slice(0, 18).map((s, i) => ({
  id: `int-${i + 1}`,
  studentId: s.id,
  studentName: s.name,
  assignedTo: i % 2 ? 'Dr. Meera Nair' : 'Dr. Kavita Menon',
  type: ['Academic Counseling', 'Attendance Counseling', 'Mentor Meeting', 'Assignment Follow-up'][i % 4],
  notes: i % 3 ? 'Initial check-in completed. Student has a clear next-step plan.' : 'Needs subject-wise support and weekly follow-up.',
  status: (i < 13 ? 'completed' : i % 2 ? 'in_progress' : 'pending'),
  followUpDate: new Date(Date.now() + (i + 2) * 86400000).toISOString().slice(0, 10),
  createdAt: new Date(Date.now() - (i + 4) * 86400000).toISOString(),
  completedAt: i < 13 ? new Date(Date.now() - (i + 1) * 86400000).toISOString() : undefined
}));

export const initialAssessments: AssessmentRecord[] = initialStudents.flatMap((student, si) => Array.from({ length: 3 }, (_, j) => ({
  id: `asm-${si}-${j}`,
  studentId: student.id,
  studentName: student.name,
  subject: ['Data Structures', 'Machine Learning', 'Database Systems', 'Digital Electronics', 'Engineering Mechanics', 'Web Technologies'][(si + j) % 6],
  type: ['Internal Assessment 1', 'Assignment', 'Model Exam'][j],
  marks: Math.round((student.assessment + (j === 2 ? student.exam - student.assessment : 0) + (si % 7 - 3)) * 0.8),
  maxMarks: 80,
  date: new Date(Date.now() - (j + 1) * 12 * 86400000).toISOString().slice(0, 10)
})));

let studentsStore = [...initialStudents];
let interventionsStore = [...initialInterventions];
let assessmentsStore = [...initialAssessments];
let currentUser: User = defaultUsers[0];

export function getMockOverview(): Overview {
  const counts = {
    low: studentsStore.filter(s => s.riskLevel === 'low').length,
    medium: studentsStore.filter(s => s.riskLevel === 'medium').length,
    high: studentsStore.filter(s => s.riskLevel === 'high').length
  };
  return {
    totalStudents: studentsStore.length,
    lowRisk: counts.low,
    mediumRisk: counts.medium,
    highRisk: counts.high,
    averageAttendance: Math.round(studentsStore.reduce((a, s) => a + s.attendance, 0) / studentsStore.length),
    averageScore: Math.round(studentsStore.reduce((a, s) => a + (100 - s.riskScore), 0) / studentsStore.length),
    interventionSuccess: Math.round((interventionsStore.filter(i => i.status === 'completed').length / Math.max(1, interventionsStore.length)) * 100),
    riskDistribution: [
      { name: 'Low risk', value: counts.low, color: '#2b9a8f' },
      { name: 'Medium risk', value: counts.medium, color: '#d69e2e' },
      { name: 'High risk', value: counts.high, color: '#e45c81' }
    ],
    performanceTrend: [
      { month: 'Jan', score: 68 },
      { month: 'Feb', score: 71 },
      { month: 'Mar', score: 69 },
      { month: 'Apr', score: 74 },
      { month: 'May', score: 76 },
      { month: 'Jun', score: 78 }
    ],
    weeklyRisk: [
      { week: 'W1', high: 14, medium: 19, low: 17 },
      { week: 'W2', high: 12, medium: 20, low: 18 },
      { week: 'W3', high: 11, medium: 17, low: 22 },
      { week: 'W4', high: 9, medium: 15, low: 26 }
    ]
  };
}

export function getMockDepartmentAnalytics(): DepartmentStat[] {
  return departmentSeed.map(d => {
    const group = studentsStore.filter(s => s.departmentId === d.id);
    return {
      department: d.code,
      name: d.name,
      students: group.length,
      high: group.filter(s => s.riskLevel === 'high').length,
      medium: group.filter(s => s.riskLevel === 'medium').length,
      low: group.filter(s => s.riskLevel === 'low').length,
      attendance: Math.round(group.reduce((a, s) => a + s.attendance, 0) / Math.max(1, group.length)),
      score: Math.round(group.reduce((a, s) => a + s.assessment, 0) / Math.max(1, group.length))
    };
  });
}

export async function handleMockRequest<T>(rawPath: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = rawPath.split('?');
  const searchParams = new URLSearchParams(queryString || '');
  const body = options.body ? JSON.parse(String(options.body)) : {};

  if (path === '/auth/login' && method === 'POST') {
    const user = defaultUsers.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase()) || {
      id: `user-${Date.now()}`,
      name: body.email ? body.email.split('@')[0] : 'Demo Administrator',
      email: body.email || 'admin@edurisk.ai',
      role: body.role || 'admin',
      title: 'Administrator',
      avatarColor: '#5b5bd6'
    };
    currentUser = user as User;
    return { token: 'demo-token-active', user: currentUser } as T;
  }

  if (path === '/auth/me') {
    return { user: currentUser } as T;
  }

  if (path === '/analytics/overview') {
    return { data: getMockOverview() } as T;
  }

  if (path === '/analytics/departments') {
    return { data: getMockDepartmentAnalytics() } as T;
  }

  if (path === '/analytics/performance') {
    return {
      data: [
        { month: 'Jan', attendance: 78, assessment: 71, engagement: 64 },
        { month: 'Feb', attendance: 80, assessment: 73, engagement: 67 },
        { month: 'Mar', attendance: 79, assessment: 72, engagement: 70 },
        { month: 'Apr', attendance: 83, assessment: 77, engagement: 74 },
        { month: 'May', attendance: 85, assessment: 79, engagement: 76 },
        { month: 'Jun', attendance: 87, assessment: 82, engagement: 80 }
      ]
    } as T;
  }

  if (path === '/risk/students') {
    const level = searchParams.get('level') || 'all';
    const filtered = studentsStore.filter(s => level === 'all' || s.riskLevel === level).sort((a, b) => b.riskScore - a.riskScore);
    return { data: filtered, summary: getMockOverview() } as T;
  }

  if (path.startsWith('/students') && method === 'GET') {
    const id = path.replace('/students/', '').replace('/students', '');
    if (id && id !== '') {
      const student = studentsStore.find(s => s.id === id || s.studentId === id);
      if (!student) throw new Error('Student not found');
      const periods = (values: number[], prefix: string) => values.map((val, i) => ({ period: `${prefix}${i + 1}`, value: Math.min(100, Math.max(0, val)) }));
      return {
        data: {
          student,
          risk: analyzeRisk(student),
          interventions: interventionsStore.filter(i => i.studentId === student.id),
          attendanceTrend: periods([student.attendance - 8, student.attendance - 5, student.attendance - 3, student.attendance - 1, student.attendance, student.attendance], 'W'),
          marksTrend: periods([student.previousPerformance, student.assessment + 4, student.assessment + 1, student.assessment - 2, student.assessment], 'M'),
          engagementTrend: periods([student.engagement - 12, student.engagement - 6, student.engagement - 4, student.engagement + 2, student.engagement], 'W')
        }
      } as T;
    }

    const q = (searchParams.get('search') || '').toLowerCase();
    const department = searchParams.get('department') || 'all';
    const year = searchParams.get('year') || 'all';
    const risk = searchParams.get('risk') || 'all';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 10)));

    let list = studentsStore.filter(s =>
      (!q || `${s.name} ${s.studentId} ${s.email}`.toLowerCase().includes(q)) &&
      (department === 'all' || s.departmentId === department || s.department === department) &&
      (year === 'all' || String(s.year) === year) &&
      (risk === 'all' || s.riskLevel === risk)
    );

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);
    return { data: paginated, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } } as T;
  }

  if (path === '/interventions') {
    if (method === 'GET') {
      const status = searchParams.get('status') || 'all';
      return { data: interventionsStore.filter(i => status === 'all' || i.status === status) } as T;
    }
    if (method === 'POST') {
      const student = studentsStore.find(s => s.id === body.studentId);
      const newIntervention: Intervention = {
        id: `int-${Date.now()}`,
        studentId: body.studentId,
        studentName: student?.name || 'Selected Student',
        assignedTo: body.assignedTo || 'Dr. Meera Nair',
        type: body.type || 'Academic Counseling',
        notes: body.notes || '',
        status: body.status || 'pending',
        followUpDate: body.followUpDate || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      };
      interventionsStore.unshift(newIntervention);
      return { data: newIntervention } as T;
    }
  }

  if (path.startsWith('/interventions/') && method === 'PUT') {
    const id = path.replace('/interventions/', '');
    const item = interventionsStore.find(i => i.id === id);
    if (item) {
      Object.assign(item, body);
      if (body.status === 'completed') item.completedAt = new Date().toISOString();
    }
    return { data: item } as T;
  }

  if (path.startsWith('/interventions/') && method === 'DELETE') {
    const id = path.replace('/interventions/', '');
    interventionsStore = interventionsStore.filter(i => i.id !== id);
    return {} as T;
  }

  if (path === '/faculty') {
    return { data: defaultUsers.filter(u => u.role !== 'admin') } as T;
  }

  if (path === '/departments') {
    return { data: departmentSeed } as T;
  }

  if (path === '/assessments') {
    if (method === 'GET') {
      return { data: assessmentsStore } as T;
    }
    if (method === 'POST') {
      const student = studentsStore.find(s => s.id === body.studentId);
      const newRec: AssessmentRecord = {
        id: `asm-${Date.now()}`,
        studentId: body.studentId,
        studentName: student?.name || 'Student',
        subject: body.subject || 'Data Structures',
        type: body.type || 'Internal Assessment',
        marks: Number(body.marks) || 0,
        maxMarks: Number(body.maxMarks) || 80,
        date: body.date || new Date().toISOString().slice(0, 10)
      };
      assessmentsStore.unshift(newRec);
      return { data: newRec } as T;
    }
  }

  if (path === '/attendance' && method === 'POST') {
    const student = studentsStore.find(s => s.id === body.studentId);
    if (student) {
      student.attendance = Math.min(100, student.attendance + 1);
      const res = calculateRisk(student);
      student.riskScore = res.score;
      student.riskLevel = res.level;
    }
    return { message: 'Attendance recorded successfully' } as T;
  }

  if (path === '/alerts') {
    return {
      data: [
        { id: 'al-1', title: '3 students dropped below 75% attendance', detail: 'Charan Reddy and 2 others missed multiple lectures this week.', type: 'alert', time: '10m ago', read: false },
        { id: 'al-2', title: 'Intervention completed for Rahul Sharma', detail: 'Dr. Kavita Menon marked Academic Counseling as finished.', type: 'success', time: '1h ago', read: false },
        { id: 'al-3', title: 'Internal assessment scores uploaded', detail: 'Computer Science batch 2026 marks are ready for model review.', type: 'medium', time: '3h ago', read: true }
      ]
    } as T;
  }

  return {} as T;
}
