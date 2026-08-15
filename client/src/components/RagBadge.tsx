const LABELS: Record<string, string> = { Green: 'On Track', Amber: 'At Risk', Red: 'Blocked' };

export function RagBadge({ rag, label }: { rag: string; label?: string }) {
  const cls = rag === 'Green' ? 'green' : rag === 'Amber' ? 'amber' : 'red';
  return <span className={`badge dot ${cls}`}>{label ?? LABELS[rag] ?? rag}</span>;
}

export function ragClass(rag: string) {
  return rag === 'Green' ? 'green' : rag === 'Amber' ? 'amber' : 'red';
}
