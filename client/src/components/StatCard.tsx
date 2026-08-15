import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  sub,
  small,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  small?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className={`value${small ? ' small' : ''}`}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
