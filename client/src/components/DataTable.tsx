import { useEffect, useState, type ReactNode } from 'react';

export type ColumnType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'readonly';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  type: ColumnType;
  options?: string[];
  width?: string;
  render?: (row: T) => ReactNode;
  placeholder?: string;
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[];
  rows: T[];
  onUpdate: (id: number, patch: Partial<T>) => void | Promise<unknown>;
  onDelete: (id: number) => void | Promise<unknown>;
  onAdd?: () => void | Promise<unknown>;
  addLabel?: string;
  rowClassName?: (row: T) => string;
  emptyMessage?: string;
  toolbar?: ReactNode;
}

function TextCell({
  value,
  onCommit,
  type = 'text',
  textarea = false,
  placeholder,
}: {
  value: string | number | null | undefined;
  onCommit: (v: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  const [val, setVal] = useState(value === null || value === undefined ? '' : String(value));

  useEffect(() => {
    setVal(value === null || value === undefined ? '' : String(value));
  }, [value]);

  const commit = () => {
    if (val !== String(value ?? '')) onCommit(val);
  };

  if (textarea) {
    return (
      <textarea
        className="cell-textarea"
        value={val}
        placeholder={placeholder}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        rows={1}
      />
    );
  }

  return (
    <input
      className="cell-input"
      type={type}
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
    />
  );
}

export function DataTable<T extends { id: number }>({
  columns,
  rows,
  onUpdate,
  onDelete,
  onAdd,
  addLabel = '+ Add row',
  rowClassName,
  emptyMessage = 'No rows yet. Add your first one.',
  toolbar,
}: DataTableProps<T>) {
  const commitValue = (row: T, col: Column<T>, raw: string) => {
    let value: unknown = raw;
    if (col.type === 'number') value = raw === '' ? 0 : Number(raw);
    onUpdate(row.id, { [col.key]: value } as Partial<T>);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this row? This cannot be undone.')) onDelete(id);
  };

  return (
    <div>
      {(toolbar || onAdd) && (
        <div className="table-toolbar">
          <div className="filters">{toolbar}</div>
          {onAdd && (
            <button className="btn primary" onClick={() => onAdd()}>
              {addLabel}
            </button>
          )}
        </div>
      )}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                  {c.label}
                </th>
              ))}
              <th style={{ width: 34 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className={rowClassName?.(row)}>
                {columns.map((col) => {
                  const value = row[col.key] as unknown;
                  return (
                    <td key={col.key}>
                      {col.type === 'readonly' && (col.render ? col.render(row) : String(value ?? ''))}
                      {col.type === 'select' && (
                        <select
                          className="cell-select"
                          value={String(value ?? '')}
                          onChange={(e) => onUpdate(row.id, { [col.key]: e.target.value } as Partial<T>)}
                        >
                          {(col.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {col.type === 'checkbox' && (
                        <input
                          className="cell-checkbox"
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => onUpdate(row.id, { [col.key]: e.target.checked ? 1 : 0 } as Partial<T>)}
                        />
                      )}
                      {col.type === 'date' && (
                        <input
                          className="cell-input"
                          type="date"
                          value={String(value ?? '')}
                          onChange={(e) => onUpdate(row.id, { [col.key]: e.target.value } as Partial<T>)}
                        />
                      )}
                      {(col.type === 'text' || col.type === 'number' || col.type === 'textarea') && (
                        <TextCell
                          value={value as string | number}
                          type={col.type === 'number' ? 'number' : 'text'}
                          textarea={col.type === 'textarea'}
                          placeholder={col.placeholder}
                          onCommit={(raw) => commitValue(row, col, raw)}
                        />
                      )}
                    </td>
                  );
                })}
                <td>
                  <button className="btn danger-ghost" title="Delete row" onClick={() => handleDelete(row.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
