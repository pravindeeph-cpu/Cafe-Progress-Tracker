import { useEffect, useState } from 'react';
import { apiUpdate, getGates } from '../api';
import type { Gate, GateItem } from '../types';
import { ProgressBar } from '../components/ProgressBar';

export function Gates() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGates().then((g) => {
      setGates(g as Gate[]);
      setLoading(false);
    });
  }, []);

  const toggleItem = async (gateId: number, item: GateItem) => {
    const nextComplete = item.complete ? 0 : 1;
    setGates((prev) =>
      prev.map((g) =>
        g.id !== gateId
          ? g
          : {
              ...g,
              items: g.items.map((i) => (i.id === item.id ? { ...i, complete: nextComplete } : i)),
              done: g.done + (nextComplete ? 1 : -1),
              completionPct: Math.round(((g.done + (nextComplete ? 1 : -1)) / g.total) * 1000) / 10,
              green: g.total > 0 && g.done + (nextComplete ? 1 : -1) === g.total,
            }
      )
    );
    await apiUpdate('gate-items', item.id, { complete: nextComplete });
  };

  const updateNotes = async (gateId: number, item: GateItem, notes: string) => {
    setGates((prev) =>
      prev.map((g) => (g.id !== gateId ? g : { ...g, items: g.items.map((i) => (i.id === item.id ? { ...i, notes } : i)) }))
    );
    await apiUpdate('gate-items', item.id, { notes });
  };

  if (loading) return <div className="loading-state">Loading gates…</div>;

  const greenCount = gates.filter((g) => g.green).length;
  const readyToOpen = gates.length > 0 && gates.every((g) => g.green);

  return (
    <div>
      <div className="page-header">
        <h1>Go/No-Go Gates</h1>
        <p>Six mandatory gates. All six must be fully green before the Command Centre will show "Ready to Open" — completion percentage alone is not enough.</p>
      </div>

      <div className={`ready-banner ${readyToOpen ? 'ready' : 'not-ready'}`}>
        {readyToOpen ? '🟢 All 6 gates are green — ready to open.' : `🟡 ${greenCount}/6 gates green.`}
      </div>

      <div className="gate-grid">
        {gates.map((gate) => (
          <div key={gate.id} className={`gate-card ${gate.green ? 'green' : ''}`}>
            <div className="gate-title">
              <span>{gate.name}</span>
              <span className={`badge ${gate.green ? 'green' : 'amber'}`}>
                {gate.done}/{gate.total}
              </span>
            </div>
            <ProgressBar pct={gate.completionPct} rag={gate.green ? 'Green' : gate.completionPct > 0 ? 'Amber' : 'Red'} />
            <ul className="gate-checklist">
              {gate.items.map((item) => (
                <li key={item.id} className={item.complete ? 'done' : ''}>
                  <input type="checkbox" checked={Boolean(item.complete)} onChange={() => toggleItem(gate.id, item)} style={{ marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div>{item.item}</div>
                    <input
                      className="cell-input"
                      placeholder="Notes / evidence…"
                      defaultValue={item.notes ?? ''}
                      style={{ fontSize: 11.5, marginTop: 2, padding: '3px 5px' }}
                      onBlur={(e) => e.target.value !== (item.notes ?? '') && updateNotes(gate.id, item, e.target.value)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
