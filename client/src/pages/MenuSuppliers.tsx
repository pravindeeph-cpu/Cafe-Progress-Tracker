import { useMemo } from 'react';
import { useResource } from '../hooks/useResource';
import type { MenuItem, RecipeIngredient, Supplier } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { formatMYR } from '../format';

function marginClass(pct: number) {
  if (pct >= 65) return 'margin-good';
  if (pct >= 40) return 'margin-ok';
  return 'margin-bad';
}

function MenuItemBlock({
  item,
  onDeleteItem,
  updateItem,
}: {
  item: MenuItem;
  onDeleteItem: (id: number) => void;
  updateItem: (id: number, patch: Partial<MenuItem>) => void | Promise<unknown>;
}) {
  const { rows: ingredients, add, update, remove } = useResource<RecipeIngredient>('recipe-ingredients', {
    menu_item_id: item.id,
  });

  const ingredientCost = ingredients.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_cost), 0);
  const margin = Number(item.selling_price) - ingredientCost;
  const marginPct = item.selling_price > 0 ? Math.round((margin / Number(item.selling_price)) * 1000) / 10 : 0;

  const ingredientColumns: Column<RecipeIngredient>[] = [
    { key: 'ingredient_name', label: 'Ingredient', type: 'text', width: '200px' },
    { key: 'quantity', label: 'Qty', type: 'number', width: '90px' },
    { key: 'unit', label: 'Unit', type: 'text', width: '90px' },
    { key: 'unit_cost', label: 'Unit Cost (RM)', type: 'number', width: '130px' },
    {
      key: 'id',
      label: 'Line Cost (RM)',
      type: 'readonly',
      width: '120px',
      render: (row) => formatMYR(Number(row.quantity) * Number(row.unit_cost)),
    },
  ];

  return (
    <div className="menu-item-block">
      <div className="menu-item-header">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            defaultValue={item.name}
            onBlur={(e) => e.target.value !== item.name && updateItem(item.id, { name: e.target.value })}
          />
          <input
            defaultValue={item.category}
            placeholder="Category"
            style={{ width: 130, fontWeight: 400, fontSize: 13 }}
            onBlur={(e) => e.target.value !== item.category && updateItem(item.id, { category: e.target.value })}
          />
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Price RM
            <input
              type="number"
              defaultValue={item.selling_price}
              style={{ width: 80, fontWeight: 400, fontSize: 13, marginLeft: 6 }}
              onBlur={(e) => Number(e.target.value) !== item.selling_price && updateItem(item.id, { selling_price: Number(e.target.value) })}
            />
          </label>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Prep min
            <input
              type="number"
              defaultValue={item.prep_time_minutes}
              style={{ width: 60, fontWeight: 400, fontSize: 13, marginLeft: 6 }}
              onBlur={(e) =>
                Number(e.target.value) !== item.prep_time_minutes && updateItem(item.id, { prep_time_minutes: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span className="tag-pill">Cost {formatMYR(ingredientCost)}</span>
          <span className={marginClass(marginPct)}>
            Margin {formatMYR(margin)} ({marginPct}%)
          </span>
          <button className="btn danger-ghost" onClick={() => onDeleteItem(item.id)}>
            ✕
          </button>
        </div>
      </div>
      <DataTable
        columns={ingredientColumns}
        rows={ingredients}
        onUpdate={update}
        onDelete={remove}
        onAdd={() => add({ menu_item_id: item.id, ingredient_name: 'New ingredient', quantity: 0, unit: 'g', unit_cost: 0 })}
        addLabel="+ Add ingredient"
        emptyMessage="No ingredients costed yet."
      />
    </div>
  );
}

export function MenuSuppliers() {
  const { rows: menuItems, add: addMenuItem, update: updateMenuItem, remove: removeMenuItem } = useResource<MenuItem>('menu-items');
  const { rows: suppliers, add: addSupplier, update: updateSupplier, remove: removeSupplier } = useResource<Supplier>('suppliers');

  const criticalWithoutBackup = useMemo(
    () =>
      suppliers.filter((s) => s.critical && !suppliers.some((b) => b.is_backup && b.backup_for === s.name)),
    [suppliers]
  );

  const supplierColumns: Column<Supplier>[] = [
    { key: 'name', label: 'Supplier', type: 'text', width: '170px' },
    { key: 'category', label: 'Category', type: 'text', width: '140px' },
    { key: 'contact', label: 'Contact', type: 'text', width: '150px' },
    { key: 'items_supplied', label: 'Items Supplied', type: 'textarea', width: '200px' },
    { key: 'critical', label: 'Critical ingredient?', type: 'checkbox', width: '110px' },
    { key: 'is_backup', label: 'Is a backup?', type: 'checkbox', width: '100px' },
    { key: 'backup_for', label: 'Backup for (supplier name)', type: 'text', width: '190px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '180px' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Menu & Suppliers</h1>
        <p>Cost every recipe line by line to see real margins, and keep a supplier database with backups for anything critical.</p>
      </div>

      <div className="subsection-title">Menu Items & Recipe Costing</div>
      {menuItems.map((item) => (
        <MenuItemBlock key={item.id} item={item} onDeleteItem={removeMenuItem} updateItem={updateMenuItem} />
      ))}
      <button
        className="btn primary"
        onClick={() => addMenuItem({ name: 'New menu item', category: '', selling_price: 0, prep_time_minutes: 0, notes: '' })}
      >
        + Add menu item
      </button>

      <div className="subsection-title">Supplier Database</div>
      {criticalWithoutBackup.length > 0 && (
        <div className="ready-banner not-ready">
          ⚠️ {criticalWithoutBackup.length} critical supplier{criticalWithoutBackup.length > 1 ? 's have' : ' has'} no backup listed:{' '}
          {criticalWithoutBackup.map((s) => s.name).join(', ')}
        </div>
      )}
      <div className="card">
        <DataTable
          columns={supplierColumns}
          rows={suppliers}
          onUpdate={updateSupplier}
          onDelete={removeSupplier}
          onAdd={() =>
            addSupplier({ name: 'New supplier', category: '', contact: '', items_supplied: '', critical: 0, is_backup: 0, backup_for: '', notes: '' })
          }
        />
      </div>
    </div>
  );
}
