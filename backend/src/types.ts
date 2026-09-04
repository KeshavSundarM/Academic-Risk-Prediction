export type Role = 'admin' | 'faculty' | 'mentor';
export type RiskLevel = 'low' | 'medium' | 'high';
export type InterventionStatus = 'pending' | 'in_progress' | 'completed';

export interface User { id: string; name: string; email: string; role: Role; title?: string; department?: string; avatarColor: string; }
export interface Department { id: string; name: string; code: string; }
export interface Student {
  id: string; studentId: string; name: string; email: string; phone: string; department: string; departmentId: string;
  year: number; semester: number; mentor: string; mentorId: string; avatarColor: string;
  attendance: number; assessment: number; assignment: number; exam: number; engagement: number; previousPerformance: number;
  riskScore: number; riskLevel: RiskLevel; lastUpdated: string;
}
export interface RiskAnalysis {
  studentId: string; attendance: number; assessment: number; assignment: number; exam: number; engagement: number;
  score: number; level: RiskLevel; factors: string[]; recommendations: string[]; calculatedAt: string;
}
export interface Intervention { id: string; studentId: string; studentName: string; assignedTo: string; type: string; notes: string; status: InterventionStatus; followUpDate: string; createdAt: string; completedAt?: string; }
export interface AttendanceRecord { id: string; studentId: string; studentName: string; subject: string; subjectId: string; date: string; status: 'present' | 'absent'; }
export interface AssessmentRecord { id: string; studentId: string; studentName: string; subject: string; type: string; marks: number; maxMarks: number; date: string; }
