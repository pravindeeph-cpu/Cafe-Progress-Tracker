import { useMemo } from 'react';
import { useResource } from '../hooks/useResource';
import type { EquipmentItem, PropertyChecklistItem } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { INSTALLATION_STATUS_OPTIONS } from '../constants';

const CHECKLIST_STATUS = ['Not Started', 'In Progress', 'Complete', 'Not Applicable'];
const CATEGORIES = ['Lease / Tenancy', 'Technical Checks', 'Renovation'];

export function Property() {
  const { rows, add, update, remove } = useResource<PropertyChecklistItem>('property-checklist');
  const { rows: equipment, add: addEquip, update: updateEquip, remove: removeEquip } = useResource<EquipmentItem>('equipment-register');

  const byCategory = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c, rows.filter((r) => r.category === c)])),
    [rows]
  );

  const columns: Column<PropertyChecklistItem>[] = [
    { key: 'item', label: 'Item', type: 'text', width: '280px' },
    { key: 'status', label: 'Status', type: 'select', options: CHECKLIST_STATUS, width: '130px' },
    { key: 'cost', label: 'Cost (RM)', type: 'number', width: '100px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '280px' },
  ];

  const equipmentColumns: Column<EquipmentItem>[] = [
    { key: 'item', label: 'Equipment', type: 'text', width: '200px' },
    { key: 'supplier', label: 'Supplier', type: 'text', width: '150px' },
    { key: 'price', label: 'Price (RM)', type: 'number', width: '110px' },
    { key: 'delivery_date', label: 'Delivery Date', type: 'date', width: '140px' },
    { key: 'installation_status', label: 'Status', type: 'select', options: INSTALLATION_STATUS_OPTIONS, width: '130px' },
    { key: 'warranty_expiry', label: 'Warranty Expiry', type: 'date', width: '140px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '200px' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Property & Fit-Out</h1>
        <p>Lease terms, technical checks (electrical, water, drainage, gas, exhaust, grease trap), the renovation tracker, and the full equipment register.</p>
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
              onAdd={() => add({ category: cat, item: 'New item', status: 'Not Started', cost: 0, notes: '' })}
            />
          </div>
        </div>
      ))}

      <div className="subsection-title">Equipment Procurement Register</div>
      <div className="card">
        <DataTable
          columns={equipmentColumns}
          rows={equipment}
          onUpdate={updateEquip}
          onDelete={removeEquip}
          onAdd={() =>
            addEquip({ item: 'New equipment', supplier: '', price: 0, delivery_date: '', installation_status: 'Not Ordered', warranty_expiry: '', notes: '' })
          }
        />
      </div>
    </div>
  );
}
