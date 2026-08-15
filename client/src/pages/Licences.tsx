import { useMemo } from 'react';
import { useResource } from '../hooks/useResource';
import type { Licence } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { LICENCE_STATUS_OPTIONS } from '../constants';

export function Licences() {
  const { rows, add, update, remove } = useResource<Licence>('licences');

  const mandatory = useMemo(() => rows.filter((l) => l.category === 'Mandatory'), [rows]);
  const conditional = useMemo(() => rows.filter((l) => l.category === 'Conditional'), [rows]);

  const baseColumns: Column<Licence>[] = [
    { key: 'name', label: 'Licence / Registration', type: 'text', width: '260px' },
    { key: 'authority', label: 'Authority', type: 'text', width: '200px' },
    { key: 'status', label: 'Status', type: 'select', options: LICENCE_STATUS_OPTIONS, width: '120px' },
    { key: 'deadline', label: 'Deadline', type: 'date', width: '130px' },
    { key: 'cost', label: 'Cost (RM)', type: 'number', width: '100px' },
    { key: 'reference_no', label: 'Reference #', type: 'text', width: '130px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '220px' },
  ];

  const conditionalColumns: Column<Licence>[] = [
    { key: 'applicable', label: 'Applies to us?', type: 'checkbox', width: '110px' },
    ...baseColumns,
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Licences & Compliance</h1>
        <p>Malaysia-specific registrations and permits. Mandatory items apply to every food & beverage outlet; flag conditional items as applicable only if relevant to your concept.</p>
      </div>

      <div className="subsection-title">Mandatory</div>
      <div className="card">
        <DataTable
          columns={baseColumns}
          rows={mandatory}
          onUpdate={update}
          onDelete={remove}
          onAdd={() =>
            add({ name: 'New licence', authority: '', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: '' })
          }
        />
      </div>

      <div className="subsection-title">Conditional (tick "Applies to us?" to activate)</div>
      <div className="card">
        <DataTable
          columns={conditionalColumns}
          rows={conditional}
          onUpdate={update}
          onDelete={remove}
          onAdd={() =>
            add({ name: 'New conditional item', authority: '', category: 'Conditional', applicable: 0, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: '' })
          }
          rowClassName={(row) => (row.applicable ? '' : 'inactive-row')}
        />
      </div>
    </div>
  );
}
