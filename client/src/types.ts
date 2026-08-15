export interface Task {
  id: number;
  section: string;
  task: string;
  owner: string;
  deadline: string;
  status: string;
  cost: number;
  dependency: string;
  notes: string;
  rag: string;
  created_at?: string;
  updated_at?: string;
}

export interface StartupCost {
  id: number;
  category: string;
  item: string;
  estimated_cost: number;
  actual_cost: number;
  status: string;
  notes: string;
}

export interface MonthlyForecast {
  id: number;
  month_index: number;
  month_label: string;
  revenue: number;
  fixed_costs: number;
  variable_costs: number;
  notes: string;
}

export interface Licence {
  id: number;
  name: string;
  authority: string;
  category: 'Mandatory' | 'Conditional' | string;
  applicable: number;
  status: string;
  deadline: string;
  cost: number;
  reference_no: string;
  notes: string;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  selling_price: number;
  prep_time_minutes: number;
  notes: string;
}

export interface RecipeIngredient {
  id: number;
  menu_item_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
}

export interface Supplier {
  id: number;
  name: string;
  category: string;
  contact: string;
  items_supplied: string;
  critical: number;
  is_backup: number;
  backup_for: string;
  notes: string;
}

export interface PropertyChecklistItem {
  id: number;
  category: string;
  item: string;
  status: string;
  cost: number;
  notes: string;
}

export interface EquipmentItem {
  id: number;
  item: string;
  supplier: string;
  price: number;
  delivery_date: string;
  installation_status: string;
  warranty_expiry: string;
  notes: string;
}

export interface Person {
  id: number;
  role: string;
  name: string;
  status: string;
  contract_signed: number;
  start_date: string;
  salary: number;
  epf_socso_registered: number;
  notes: string;
}

export interface SkillPrep {
  id: number;
  training: string;
  who: string;
  provider: string;
  status: string;
  cost: number;
  certificate_expiry: string;
  notes: string;
}

export interface SopItem {
  id: number;
  category: string;
  sop_name: string;
  status: string;
  notes: string;
}

export interface PreOpeningItem {
  id: number;
  category: string;
  item: string;
  status: string;
  notes: string;
}

export interface GateItem {
  id: number;
  gate_id: number;
  item: string;
  complete: number;
  notes: string;
}

export interface Gate {
  id: number;
  name: string;
  sort_order: number;
  total: number;
  done: number;
  completionPct: number;
  green: boolean;
  items: GateItem[];
}

export interface SectionSummary {
  label: string;
  completionPct: number;
  rag: 'Green' | 'Amber' | 'Red';
  total: number;
  done: number;
}

export interface Dashboard {
  overallReadinessPct: number;
  sections: Record<string, SectionSummary>;
  budget: { committed: number; totalEstimated: number; remaining: number };
  cash: {
    startingCash: number;
    committed: number;
    availableCash: number;
    cashBufferTarget: number;
    avgMonthlyBurn: number;
    cashRunwayMonths: number | null;
    belowBuffer: boolean;
  };
  targetOpeningDate: string;
  daysToOpening: number | null;
  criticalBlockersCount: number;
  overdueTasksCount: number;
  criticalBlockers: Task[];
  overdueTasks: Task[];
  gates: Gate[];
  readyToOpen: boolean;
  businessName: string;
}

export interface FinancialSummary {
  startupCosts: {
    totalEstimated: number;
    totalActual: number;
    remaining: number;
    byCategory: Record<string, { estimated: number; actual: number }>;
  };
  forecast: MonthlyForecast[];
  breakEven: { fixedCosts: number; contributionMarginPct: number; breakEvenRevenue: number | null };
  cash: Dashboard['cash'];
  menuWithCost: (MenuItem & { ingredient_cost: number; margin: number; margin_pct: number })[];
  sstThreshold: number;
}

export type Settings = Record<string, string>;
