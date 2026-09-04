import { RiskLevel } from '../../types';
export function RiskBadge({ level, compact = false }: { level: RiskLevel; compact?: boolean }) { const label = level === 'low' ? 'Low risk' : level === 'medium' ? 'Medium risk' : 'High risk'; return <span className={`risk-badge ${level} ${compact ? 'compact' : ''}`}><i />{label}</span>; }
export function StatusBadge({ status }: { status: string }) { const label = status === 'in_progress' ? 'In progress' : status[0].toUpperCase() + status.slice(1); return <span className={`status-badge ${status}`}><i />{label}</span>; }
