import { RiskAnalysis, RiskLevel, Student } from '../types.js';

export interface RiskInputs { attendance: number; assessment: number; assignment: number; exam: number; engagement: number; }

/** Transparent baseline model. Replace this service with a model adapter when validated institutional data is available. */
export function calculateRisk(inputs: RiskInputs): { score: number; level: RiskLevel } {
  const weightedPerformance = inputs.attendance * 0.25 + inputs.assessment * 0.30 + inputs.assignment * 0.15 + inputs.exam * 0.20 + inputs.engagement * 0.10;
  const score = Math.round(Math.max(0, Math.min(100, 100 - weightedPerformance)));
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
  return { studentId: student.id, attendance: student.attendance, assessment: student.assessment, assignment: student.assignment, exam: student.exam, engagement: student.engagement, score: result.score, level: result.level, factors: factors.length ? factors : ['No significant academic risk factors detected'], recommendations: recommendations.length ? recommendations : ['Continue current support plan and monitor progress monthly.'], calculatedAt: new Date().toISOString() };
}
