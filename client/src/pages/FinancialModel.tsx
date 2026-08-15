import { useEffect, useState } from 'react';
import { useResource } from '../hooks/useResource';
import type { FinancialSummary, MonthlyForecast, Settings, StartupCost } from '../types';
import { DataTable, type Column } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { COST_STATUS_OPTIONS } from '../constants';
import { formatMYR } from '../format';
import { getFinancialSummary, getSettings, updateSettings } from '../api';

const CATEGORY_OPTIONS = ['Property', 'Renovation', 'Equipment', 'Opening Costs'];

export function FinancialModel() {
  const { rows: costs, add: addCost, update: updateCost, remove: removeCost } = useResource<StartupCost>('startup-costs');
  const { rows: forecast, add: addMonth, update: updateMonth, remove: removeMonth } = useResource<MonthlyForecast>('monthly-forecast');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadSummary = async () => setSummary((await getFinancialSummary()) as FinancialSummary);

  useEffect(() => {
    loadSummary();
    getSettings().then((s) => setSettings(s as Settings));
  }, []);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costs, forecast]);

  const saveSettings = async (patch: Record<string, string>) => {
    if (!settings) return;
    const next: Settings = { ...settings, ...patch };
    setSettings(next);
    setSavingSettings(true);
    await updateSettings(next);
    setSavingSettings(false);
    loadSummary();
  };

  const costColumns: Column<StartupCost>[] = [
    { key: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS, width: '140px' },
    { key: 'item', label: 'Item', type: 'text', width: '220px' },
    { key: 'estimated_cost', label: 'Estimated (RM)', type: 'number', width: '130px' },
    { key: 'actual_cost', label: 'Actual (RM)', type: 'number', width: '130px' },
    { key: 'status', label: 'Status', type: 'select', options: COST_STATUS_OPTIONS, width: '110px' },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '220px' },
  ];

  const forecastColumns: Column<MonthlyForecast>[] = [
    { key: 'month_index', label: '#', type: 'number', width: '50px' },
    { key: 'month_label', label: 'Month', type: 'text', width: '120px' },
    { key: 'revenue', label: 'Revenue (RM)', type: 'number', width: '130px' },
    { key: 'fixed_costs', label: 'Fixed Costs (RM)', type: 'number', width: '140px' },
    { key: 'variable_costs', label: 'Variable Costs (RM)', type: 'number', width: '150px' },
    {
      key: 'id',
      label: 'Net (RM)',
      type: 'readonly',
      width: '110px',
      render: (row) => {
        const net = row.revenue - row.fixed_costs - row.variable_costs;
        return <span className={net >= 0 ? 'margin-good' : 'margin-bad'}>{formatMYR(net)}</span>;
      },
    },
    { key: 'notes', label: 'Notes', type: 'textarea', width: '180px' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Financial Model</h1>
        <p>Startup cost breakdown, revenue/cost forecast, break-even point, and cash buffer — the numbers behind the Business Viability gate.</p>
      </div>

      {summary && (
        <div className="grid cols-4">
          <StatCard label="Break-even Revenue / mo" value={summary.breakEven.breakEvenRevenue === null ? '—' : formatMYR(summary.breakEven.breakEvenRevenue)} sub={`${formatMYR(summary.breakEven.fixedCosts)} fixed costs ÷ ${summary.breakEven.contributionMarginPct}% margin`} />
          <StatCard label="Cash Available" value={formatMYR(summary.cash.availableCash)} sub={`Starting ${formatMYR(summary.cash.startingCash)} − ${formatMYR(summary.cash.committed)} committed`} />
          <StatCard label="Cash Buffer Target" value={formatMYR(summary.cash.cashBufferTarget)} sub={summary.cash.belowBuffer ? 'Below target' : 'Target met'} />
          <StatCard label="Cash Runway" value={summary.cash.cashRunwayMonths === null ? '—' : `${summary.cash.cashRunwayMonths} months`} sub={`Avg burn ${formatMYR(summary.cash.avgMonthlyBurn)}/mo`} />
        </div>
      )}

      {settings && (
        <div className="card">
          <h2>Model Settings</h2>
          <p className="subtitle">
            Drives the break-even calculator and cash runway. Leave contribution margin at 0 to auto-use the average margin from your Menu items.
            SST registration is mandatory once annual turnover passes the threshold below.
          </p>
          <div className="settings-form">
            <div className="field">
              <label>Business Name</label>
              <input value={settings.business_name ?? ''} onChange={(e) => saveSettings({ business_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Target Opening Date</label>
              <input type="date" value={settings.target_opening_date ?? ''} onChange={(e) => saveSettings({ target_opening_date: e.target.value })} />
            </div>
            <div className="field">
              <label>Starting Cash (RM)</label>
              <input type="number" value={settings.starting_cash ?? '0'} onChange={(e) => saveSettings({ starting_cash: e.target.value })} />
            </div>
            <div className="field">
              <label>Cash Buffer Target (RM)</label>
              <input type="number" value={settings.cash_buffer_target ?? '0'} onChange={(e) => saveSettings({ cash_buffer_target: e.target.value })} />
            </div>
            <div className="field">
              <label>Monthly Fixed Costs (RM)</label>
              <input type="number" value={settings.monthly_fixed_costs ?? '0'} onChange={(e) => saveSettings({ monthly_fixed_costs: e.target.value })} />
            </div>
            <div className="field">
              <label>Avg Contribution Margin % (override)</label>
              <input type="number" value={settings.avg_contribution_margin_pct ?? '0'} onChange={(e) => saveSettings({ avg_contribution_margin_pct: e.target.value })} />
            </div>
            <div className="field">
              <label>SST Registration Threshold (RM/yr)</label>
              <input type="number" value={settings.sst_registration_threshold ?? '500000'} onChange={(e) => saveSettings({ sst_registration_threshold: e.target.value })} />
            </div>
          </div>
          {savingSettings && <div className="empty-state">Saving…</div>}
        </div>
      )}

      <div className="subsection-title">Startup Cost Breakdown</div>
      <div className="card">
        <DataTable
          columns={costColumns}
          rows={costs}
          onUpdate={updateCost}
          onDelete={removeCost}
          onAdd={() => addCost({ category: 'Equipment', item: 'New cost item', estimated_cost: 0, actual_cost: 0, status: 'Planned', notes: '' })}
        />
      </div>

      <div className="subsection-title">Monthly Revenue / Cost Forecast</div>
      <div className="card">
        <DataTable
          columns={forecastColumns}
          rows={forecast}
          onUpdate={updateMonth}
          onDelete={removeMonth}
          onAdd={() =>
            addMonth({
              month_index: forecast.length + 1,
              month_label: `Month ${forecast.length + 1}`,
              revenue: 0,
              fixed_costs: 0,
              variable_costs: 0,
              notes: '',
            })
          }
        />
      </div>
    </div>
  );
}
