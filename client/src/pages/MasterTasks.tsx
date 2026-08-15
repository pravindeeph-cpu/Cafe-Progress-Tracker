import { useMemo, useState } from 'react';
import { useResource } from '../hooks/useResource';
import type { Task } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { RAG_OPTIONS, TASK_SECTION_OPTIONS, TASK_STATUS_OPTIONS } from '../constants';

const today = () => new Date().toISOString().slice(0, 10);

export function MasterTasks() {
  const { rows, add, update, remove } = useResource<Task>('tasks');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ragFilter, setRagFilter] = useState('All');

  const filtered = useMemo(
    () =>
      rows.filter(
        (t) =>
          (sectionFilter === 'All' || t.section === sectionFilter) &&
          (statusFilter === 'All' || t.status === statusFilter) &&
          (ragFilter === 'All' || t.rag === ragFilter)
      ),
    [rows, sectionFilter, statusFilter, ragFilter]
  );

  const columns: Column<Task>[] = [
    { key: 'task', label: 'Task', type: 'text', width: '220px' },
    { key: 'section', label: 'Section', type: 'select', options: TASK_SECTION_OPTIONS, width: '160px' },
    { key: 'owner', label: 'Owner', type: 'text', width: '110px' },
    { key: 'deadline', label: 'Deadline', type: 'date', width: '140px' },
    { key: 'status', label: 'Status', type: 'select', options: TASK_STATUS_OPTIONS, width: '130px' },
    { key: 'cost', label: 'Cost (RM)', type: 'number', width: '100px' },
    { key: 'dependency', label: 'Dependency', type: 'text', width: '140px' },
    { key: 'rag', label: 'Risk', type: 'select', options: RAG_OPTIONS, width: '90px' },
    { key: 'notes', label: 'Notes / Evidence', type: 'textarea', width: '260px' },
  ];

  const rowClassName = (row: Task) => {
    const overdue = row.deadline && row.status !== 'Complete' && row.deadline < today();
    const classes: string[] = [];
    if (row.rag === 'Red') classes.push('rag-red');
    else if (row.rag === 'Amber') classes.push('rag-amber');
    if (overdue) classes.push('overdue');
    return classes.join(' ');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Master Tasks</h1>
        <p>Every action item across the whole launch, in one list. Filter by section, status, or risk. Overdue rows are highlighted.</p>
      </div>
      <div className="card">
        <DataTable
          columns={columns}
          rows={filtered}
          onUpdate={update}
          onDelete={remove}
          onAdd={() =>
            add({
              task: 'New task',
              section: 'General',
              owner: '',
              deadline: '',
              status: 'Not Started',
              cost: 0,
              dependency: '',
              notes: '',
              rag: 'Green',
            })
          }
          rowClassName={rowClassName}
          emptyMessage="No tasks match these filters."
          toolbar={
            <>
              <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                <option>All</option>
                {TASK_SECTION_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option>
                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select value={ragFilter} onChange={(e) => setRagFilter(e.target.value)}>
                <option>All</option>
                {RAG_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </>
          }
        />
      </div>
    </div>
  );
}
