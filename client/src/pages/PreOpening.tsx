import { useMemo } from 'react';
import { useResource } from '../hooks/useResource';
import type { PreOpeningItem } from '../types';
import { DataTable, type Column } from '../components/DataTable';

const CATEGORIES = ['Equipment Testing', 'POS Testing', 'Soft Launch', 'Final Sign-off'];
const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Complete', 'Failed - Needs Retest'];

export function PreOpening() {
  const { rows, add, update, remove } = useResource<PreOpeningItem>('pre-opening');

  const byCategory = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c, rows.filter((r) => r.category === c)])),
    [rows]
  );

  const columns: Column<PreOpeningItem>[] = [
    { key: 'item', label: 'Item', type: 'text', width: '320px' },
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, width: '160px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '320px' },
  ];

  const total = rows.length;
  const done = rows.filter((r) => r.status === 'Complete').length;

  return (
    <div>
      <div className="page-header">
        <h1>Pre-Opening</h1>
        <p>
          The final stretch: {done}/{total} items complete. Equipment and POS must test clean end-to-end before the soft launch, and the soft
          launch feeds the final owner sign-off.
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <div className="subsection-title">{cat}</div>
          <div className="card">
            <DataTable
              columns={columns}
              rows={byCategory[cat] ?? []}
              onUpdate={update}
              onDelete={remove}
              onAdd={() => add({ category: cat, item: 'New item', status: 'Not Started', notes: '' })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
