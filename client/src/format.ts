export function formatMYR(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'RM 0';
  const sign = value < 0 ? '-' : '';
  return `${sign}RM ${Math.abs(value).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0%';
  return `${value}%`;
}
