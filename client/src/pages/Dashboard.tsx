import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api';
import type { Dashboard as DashboardData } from '../types';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { RagBadge, ragClass } from '../components/RagBadge';
import { formatMYR } from '../format';

const SECTION_LINKS: Record<string, string> = {
  masterTasks: '/tasks',
  financialModel: '/financial',
  licences: '/licences',
  menuSuppliers: '/menu-suppliers',
  property: '/property',
  peopleSops: '/people',
  preOpening: '/pre-opening',
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const d = await getDashboard();
    setData(d as DashboardData);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  if (loading || !data) return <div className="loading-state">Loading dashboard…</div>;

  const greenGates = data.gates.filter((g) => g.green).length;

  return (
    <div>
      <div className="page-header">
        <h1>{data.businessName || 'Command Centre'}</h1>
        <p>Overall readiness across every workstream, budget health, and the Go/No-Go gates that decide opening day.</p>
      </div>

      <div className={`ready-banner ${data.readyToOpen ? 'ready' : 'not-ready'}`}>
        {data.readyToOpen
          ? '🟢 READY TO OPEN — all 6 Go/No-Go gates are green.'
          : `🟡 NOT READY TO OPEN — ${greenGates}/6 gates green. Overall completion is ${data.overallReadinessPct}%, but the gates decide opening day, not the percentage.`}
      </div>

      <div className="grid cols-6">
        <StatCard label="Overall Readiness" value={`${data.overallReadinessPct}%`} sub="Average across 7 workstreams" />
        <StatCard
          label="Days to Target Opening"
          value={data.daysToOpening === null ? '—' : data.daysToOpening}
          sub={data.targetOpeningDate || 'Set target date in Financial Model'}
          small={data.daysToOpening === null}
        />
        <StatCard label="Budget Committed" value={formatMYR(data.budget.committed)} sub={`of ${formatMYR(data.budget.totalEstimated)} planned`} />
        <StatCard
          label="Budget Remaining"
          value={formatMYR(data.budget.remaining)}
          sub={data.budget.remaining < 0 ? 'Over budget' : 'Unspent of plan'}
        />
        <StatCard
          label="Cash Runway"
          value={data.cash.cashRunwayMonths === null ? '—' : `${data.cash.cashRunwayMonths} mo`}
          sub={data.cash.belowBuffer ? 'Below cash buffer target' : 'Above cash buffer target'}
        />
        <StatCard
          label="Blockers / Overdue"
          value={`${data.criticalBlockersCount} / ${data.overdueTasksCount}`}
          sub="Critical (red) tasks / overdue tasks"
        />
      </div>

      <div className="two-col" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>Section Readiness</h2>
          <p className="subtitle">Completion % and risk status per workstream</p>
          <div className="section-list">
            {Object.entries(data.sections).map(([key, sec]) => (
              <Link key={key} to={SECTION_LINKS[key] ?? '/'} className="section-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="name">{sec.label}</span>
                <ProgressBar pct={sec.completionPct} rag={sec.rag} />
                <span className="pct">{sec.completionPct}%</span>
                <RagBadge rag={sec.rag} />
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Go/No-Go Gates</h2>
          <p className="subtitle">
            <Link to="/gates">{greenGates} of 6 gates green</Link> — all must be green to open
          </p>
          <div className="section-list">
            {data.gates.map((g) => (
              <div key={g.id} className="section-row">
                <span className="name">{g.name}</span>
                <ProgressBar pct={g.completionPct} rag={g.green ? 'Green' : g.completionPct > 0 ? 'Amber' : 'Red'} />
                <span className="pct">
                  {g.done}/{g.total}
                </span>
                <span className={`badge ${g.green ? 'green' : 'amber'}`}>{g.green ? 'Green' : 'Pending'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 0 }}>
        <div className="card">
          <h2>Critical Blockers</h2>
          <p className="subtitle">Tasks flagged red risk and not yet complete</p>
          {data.criticalBlockers.length === 0 && <div className="empty-state">No critical blockers right now.</div>}
          <div className="section-list">
            {data.criticalBlockers.map((t) => (
              <div key={t.id} className="section-row" style={{ gridTemplateColumns: '1fr 90px 90px' }}>
                <span className="name">{t.task}</span>
                <span className="pct">{t.owner || '—'}</span>
                <span className={`badge ${ragClass('Red')}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Overdue Tasks</h2>
          <p className="subtitle">Deadline has passed and task isn't complete</p>
          {data.overdueTasks.length === 0 && <div className="empty-state">Nothing overdue.</div>}
          <div className="section-list">
            {data.overdueTasks.map((t) => (
              <div key={t.id} className="section-row" style={{ gridTemplateColumns: '1fr 90px 90px' }}>
                <span className="name">{t.task}</span>
                <span className="pct">{t.deadline}</span>
                <span className="badge amber">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
