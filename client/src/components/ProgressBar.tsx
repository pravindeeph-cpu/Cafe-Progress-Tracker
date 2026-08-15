import { ragClass } from './RagBadge';

export function ProgressBar({ pct, rag }: { pct: number; rag?: string }) {
  const cls = rag ? ragClass(rag) : pct >= 100 ? 'green' : pct >= 50 ? 'amber' : 'red';
  return (
    <div className="progress-track">
      <div className={`progress-fill ${cls}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}
