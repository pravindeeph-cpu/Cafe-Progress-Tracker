import { db } from './db.js';

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function daysBetween(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function ragFromPct(pct, forceRed) {
  if (forceRed) return 'Red';
  if (pct >= 100) return 'Green';
  if (pct >= 50) return 'Amber';
  return 'Red';
}

function pct(done, total) {
  if (total === 0) return 0;
  return Math.round((done / total) * 1000) / 10;
}

export function computeGatesWithStatus() {
  const gates = db.prepare('SELECT * FROM gates ORDER BY sort_order').all();
  const gateItems = db.prepare('SELECT * FROM gate_items').all();
  return gates.map((g) => {
    const items = gateItems.filter((i) => i.gate_id === g.id);
    const total = items.length;
    const done = items.filter((i) => i.complete).length;
    return {
      id: g.id,
      name: g.name,
      total,
      done,
      completionPct: pct(done, total),
      green: total > 0 && done === total,
      items,
    };
  });
}

export function computeFinancialSummary() {
  const startupCosts = db.prepare('SELECT * FROM startup_costs').all();
  const totalEstimated = startupCosts.reduce((s, r) => s + num(r.estimated_cost), 0);
  const totalActual = startupCosts.reduce((s, r) => s + num(r.actual_cost), 0);
  const byCategory = {};
  for (const r of startupCosts) {
    byCategory[r.category] ??= { estimated: 0, actual: 0 };
    byCategory[r.category].estimated += num(r.estimated_cost);
    byCategory[r.category].actual += num(r.actual_cost);
  }

  const forecast = db.prepare('SELECT * FROM monthly_forecast ORDER BY month_index').all();
  const monthlyFixedCostsSetting = num(getSetting('monthly_fixed_costs'));
  const avgMarginPctSetting = num(getSetting('avg_contribution_margin_pct'));

  const menuItems = db.prepare('SELECT * FROM menu_items').all();
  const ingredients = db.prepare('SELECT * FROM recipe_ingredients').all();
  const menuWithCost = menuItems.map((item) => {
    const lines = ingredients.filter((i) => i.menu_item_id === item.id);
    const ingredientCost = lines.reduce((s, l) => s + num(l.quantity) * num(l.unit_cost), 0);
    const margin = num(item.selling_price) - ingredientCost;
    const marginPct = item.selling_price > 0 ? Math.round((margin / item.selling_price) * 1000) / 10 : 0;
    return { ...item, ingredient_cost: Math.round(ingredientCost * 100) / 100, margin: Math.round(margin * 100) / 100, margin_pct: marginPct };
  });
  const avgMenuMarginPct = menuWithCost.length
    ? Math.round((menuWithCost.reduce((s, m) => s + m.margin_pct, 0) / menuWithCost.length) * 10) / 10
    : 0;

  const contributionMarginPct = avgMarginPctSetting > 0 ? avgMarginPctSetting : avgMenuMarginPct;
  const fixedCosts = monthlyFixedCostsSetting > 0
    ? monthlyFixedCostsSetting
    : (forecast.length ? forecast.reduce((s, f) => s + num(f.fixed_costs), 0) / forecast.length : 0);
  const breakEvenRevenue = contributionMarginPct > 0 ? Math.round((fixedCosts / (contributionMarginPct / 100)) * 100) / 100 : null;

  const avgMonthlyBurn = forecast.length
    ? forecast.reduce((s, f) => s + (num(f.fixed_costs) + num(f.variable_costs) - num(f.revenue)), 0) / forecast.length
    : monthlyFixedCostsSetting;

  const startingCash = num(getSetting('starting_cash'));
  const cashBufferTarget = num(getSetting('cash_buffer_target'));
  const availableCash = startingCash - totalActual;
  const cashRunwayMonths = avgMonthlyBurn > 0 ? Math.round((availableCash / avgMonthlyBurn) * 10) / 10 : null;

  return {
    startupCosts: {
      totalEstimated: round2(totalEstimated),
      totalActual: round2(totalActual),
      remaining: round2(totalEstimated - totalActual),
      byCategory,
    },
    forecast,
    breakEven: {
      fixedCosts: round2(fixedCosts),
      contributionMarginPct,
      breakEvenRevenue,
    },
    cash: {
      startingCash: round2(startingCash),
      committed: round2(totalActual),
      availableCash: round2(availableCash),
      cashBufferTarget: round2(cashBufferTarget),
      avgMonthlyBurn: round2(avgMonthlyBurn),
      cashRunwayMonths,
      belowBuffer: availableCash < cashBufferTarget,
    },
    menuWithCost,
    sstThreshold: num(getSetting('sst_registration_threshold', 500000)),
  };
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOverdue(deadline, status) {
  if (!deadline || status === 'Complete') return false;
  const d = new Date(deadline + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < today().getTime();
}

export function computeDashboard() {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  const licences = db.prepare('SELECT * FROM licences').all();
  const menuItems = db.prepare('SELECT * FROM menu_items').all();
  const ingredients = db.prepare('SELECT * FROM recipe_ingredients').all();
  const suppliers = db.prepare('SELECT * FROM suppliers').all();
  const propertyChecklist = db.prepare('SELECT * FROM property_checklist').all();
  const equipment = db.prepare('SELECT * FROM equipment_register').all();
  const people = db.prepare('SELECT * FROM people').all();
  const skillPrep = db.prepare('SELECT * FROM skill_prep').all();
  const sops = db.prepare('SELECT * FROM sop_library').all();
  const preOpening = db.prepare('SELECT * FROM pre_opening_checklist').all();
  const startupCosts = db.prepare('SELECT * FROM startup_costs').all();

  const overdueTasks = tasks.filter((t) => isOverdue(t.deadline, t.status));
  const criticalBlockers = tasks.filter((t) => t.rag === 'Red' && t.status !== 'Complete');

  const sections = {};

  // Master Tasks
  {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'Complete').length;
    const p = pct(done, total);
    sections.masterTasks = {
      label: 'Master Tasks',
      completionPct: p,
      rag: ragFromPct(p, overdueTasks.length > 0 || criticalBlockers.length > 0),
      total,
      done,
    };
  }

  // Financial Model
  {
    const financial = computeFinancialSummary();
    const total = startupCosts.length;
    const done = startupCosts.filter((c) => c.status === 'Paid').length;
    const p = pct(done, total);
    const forceRed = financial.cash.belowBuffer && financial.cash.cashRunwayMonths !== null && financial.cash.cashRunwayMonths < 1;
    sections.financialModel = {
      label: 'Financial Model',
      completionPct: p,
      rag: ragFromPct(p, forceRed),
      total,
      done,
    };
  }

  // Licences & Compliance
  {
    const applicable = licences.filter((l) => l.applicable);
    const total = applicable.length;
    const done = applicable.filter((l) => l.status === 'Approved' || l.status === 'Complete').length;
    const p = pct(done, total);
    sections.licences = {
      label: 'Licences & Compliance',
      completionPct: p,
      rag: ragFromPct(p, false),
      total,
      done,
    };
  }

  // Menu & Suppliers
  {
    const totalMenu = menuItems.length;
    const readyMenu = menuItems.filter((m) => {
      const hasIngredients = ingredients.some((i) => i.menu_item_id === m.id);
      return num(m.selling_price) > 0 && hasIngredients;
    }).length;
    const criticalSuppliers = suppliers.filter((s) => s.critical);
    const criticalWithBackup = criticalSuppliers.filter((s) =>
      suppliers.some((b) => b.is_backup && b.backup_for === s.name)
    ).length;
    const menuPct = pct(readyMenu, totalMenu);
    const supplierPct = pct(criticalWithBackup, criticalSuppliers.length);
    const total = totalMenu + criticalSuppliers.length;
    const done = readyMenu + criticalWithBackup;
    const p = total > 0 ? Math.round(((menuPct * 0.7 + supplierPct * 0.3)) * 10) / 10 : 0;
    sections.menuSuppliers = {
      label: 'Menu & Suppliers',
      completionPct: p,
      rag: ragFromPct(p, false),
      total,
      done,
    };
  }

  // Property & Fit-Out
  {
    const totalP = propertyChecklist.length;
    const doneP = propertyChecklist.filter((c) => c.status === 'Complete').length;
    const totalE = equipment.length;
    const doneE = equipment.filter((e) => e.installation_status === 'Installed' || e.installation_status === 'Tested').length;
    const total = totalP + totalE;
    const done = doneP + doneE;
    const p = pct(done, total);
    sections.property = {
      label: 'Property & Fit-Out',
      completionPct: p,
      rag: ragFromPct(p, false),
      total,
      done,
    };
  }

  // People & SOPs
  {
    const totalPeople = people.length;
    const donePeople = people.filter((p) => p.contract_signed && p.epf_socso_registered).length;
    const totalSkill = skillPrep.length;
    const doneSkill = skillPrep.filter((s) => s.status === 'Complete').length;
    const totalSop = sops.length;
    const doneSop = sops.filter((s) => s.status === 'Finalized' || s.status === 'Staff Trained').length;
    const total = totalPeople + totalSkill + totalSop;
    const done = donePeople + doneSkill + doneSop;
    const p = pct(done, total);
    sections.peopleSops = {
      label: 'People & SOPs',
      completionPct: p,
      rag: ragFromPct(p, false),
      total,
      done,
    };
  }

  // Pre-Opening
  {
    const total = preOpening.length;
    const done = preOpening.filter((c) => c.status === 'Complete').length;
    const p = pct(done, total);
    sections.preOpening = {
      label: 'Pre-Opening',
      completionPct: p,
      rag: ragFromPct(p, false),
      total,
      done,
    };
  }

  const sectionList = Object.values(sections);
  const overallReadinessPct = sectionList.length
    ? Math.round((sectionList.reduce((s, sec) => s + sec.completionPct, 0) / sectionList.length) * 10) / 10
    : 0;

  const gatesWithStatus = computeGatesWithStatus();
  const readyToOpen = gatesWithStatus.length > 0 && gatesWithStatus.every((g) => g.green);

  const financial = computeFinancialSummary();
  const targetOpeningDate = getSetting('target_opening_date');
  const daysToOpening = daysBetween(targetOpeningDate);

  return {
    overallReadinessPct,
    sections,
    budget: {
      committed: financial.startupCosts.totalActual,
      totalEstimated: financial.startupCosts.totalEstimated,
      remaining: financial.startupCosts.remaining,
    },
    cash: financial.cash,
    targetOpeningDate,
    daysToOpening,
    criticalBlockersCount: criticalBlockers.length,
    overdueTasksCount: overdueTasks.length,
    criticalBlockers: criticalBlockers.slice(0, 20),
    overdueTasks: overdueTasks.slice(0, 20),
    gates: gatesWithStatus,
    readyToOpen,
    businessName: getSetting('business_name'),
  };
}
