import { useMemo } from 'react';
import { useResource } from '../hooks/useResource';
import type { Person, SkillPrep, SopItem } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { HIRING_STATUS_OPTIONS, SOP_STATUS_OPTIONS, TASK_STATUS_OPTIONS } from '../constants';

const SOP_CATEGORIES = ['Opening', 'Service', 'Kitchen', 'Closing', 'Emergency'];

export function PeopleSops() {
  const { rows: people, add: addPerson, update: updatePerson, remove: removePerson } = useResource<Person>('people');
  const { rows: skills, add: addSkill, update: updateSkill, remove: removeSkill } = useResource<SkillPrep>('skill-prep');
  const { rows: sops, add: addSop, update: updateSop, remove: removeSop } = useResource<SopItem>('sop-library');

  const sopByCategory = useMemo(
    () => Object.fromEntries(SOP_CATEGORIES.map((c) => [c, sops.filter((s) => s.category === c)])),
    [sops]
  );

  const peopleColumns: Column<Person>[] = [
    { key: 'role', label: 'Role', type: 'text', width: '150px' },
    { key: 'name', label: 'Name', type: 'text', width: '150px' },
    { key: 'status', label: 'Status', type: 'select', options: HIRING_STATUS_OPTIONS, width: '120px' },
    { key: 'contract_signed', label: 'Contract Signed', type: 'checkbox', width: '110px' },
    { key: 'start_date', label: 'Start Date', type: 'date', width: '130px' },
    { key: 'salary', label: 'Salary (RM/mo)', type: 'number', width: '120px' },
    { key: 'epf_socso_registered', label: 'EPF/SOCSO/EIS Registered', type: 'checkbox', width: '130px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '200px' },
  ];

  const skillColumns: Column<SkillPrep>[] = [
    { key: 'training', label: 'Training', type: 'text', width: '260px' },
    { key: 'who', label: 'Who', type: 'text', width: '150px' },
    { key: 'provider', label: 'Provider', type: 'text', width: '170px' },
    { key: 'status', label: 'Status', type: 'select', options: TASK_STATUS_OPTIONS, width: '130px' },
    { key: 'cost', label: 'Cost (RM)', type: 'number', width: '100px' },
    { key: 'certificate_expiry', label: 'Certificate Expiry', type: 'date', width: '150px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '180px' },
  ];

  const sopColumns: Column<SopItem>[] = [
    { key: 'sop_name', label: 'SOP', type: 'text', width: '300px' },
    { key: 'status', label: 'Status', type: 'select', options: SOP_STATUS_OPTIONS, width: '140px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '300px' },
  ];

  const expiringSoon = skills.filter((s) => {
    if (!s.certificate_expiry) return false;
    const days = (new Date(s.certificate_expiry).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 60;
  });

  return (
    <div>
      <div className="page-header">
        <h1>People & SOPs</h1>
        <p>Hiring, contracts and payroll, individual training tracking for every staff member, and the SOP library that keeps service consistent.</p>
      </div>

      <div className="subsection-title">Hiring, Contracts & Payroll</div>
      <div className="card">
        <DataTable
          columns={peopleColumns}
          rows={people}
          onUpdate={updatePerson}
          onDelete={removePerson}
          onAdd={() =>
            addPerson({ role: 'New role', name: '', status: 'Vacant', contract_signed: 0, start_date: '', salary: 0, epf_socso_registered: 0, notes: '' })
          }
        />
      </div>

      <div className="subsection-title">Skill Preparation</div>
      {expiringSoon.length > 0 && (
        <div className="ready-banner not-ready">
          ⏰ {expiringSoon.length} certificate{expiringSoon.length > 1 ? 's' : ''} expiring within 60 days: {expiringSoon.map((s) => s.training).join(', ')}
        </div>
      )}
      <div className="card">
        <DataTable
          columns={skillColumns}
          rows={skills}
          onUpdate={updateSkill}
          onDelete={removeSkill}
          onAdd={() => addSkill({ training: 'New training', who: '', provider: '', status: 'Not Started', cost: 0, certificate_expiry: '', notes: '' })}
        />
      </div>

      <div className="subsection-title">SOP Library</div>
      {SOP_CATEGORIES.map((cat) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, margin: '0 0 8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cat}</h3>
          <div className="card">
            <DataTable
              columns={sopColumns}
              rows={sopByCategory[cat] ?? []}
              onUpdate={updateSop}
              onDelete={removeSop}
              onAdd={() => addSop({ category: cat, sop_name: 'New SOP', status: 'Not Started', notes: '' })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
