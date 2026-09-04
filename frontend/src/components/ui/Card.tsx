import { ReactNode } from 'react';
export function Card({ children, className = '', noPadding = false }: { children: ReactNode; className?: string; noPadding?: boolean }) { return <section className={`card ${noPadding ? 'no-padding' : ''} ${className}`}>{children}</section>; }
export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) { return <div className="section-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>{action}</div>; }
