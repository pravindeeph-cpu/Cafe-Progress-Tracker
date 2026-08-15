import { fileURLToPath } from 'url';
import { pool, initSchema } from './db.js';

async function seedTable(table, rows) {
  const countResult = await pool.query(`SELECT COUNT(*) as c FROM ${table}`);
  if (Number(countResult.rows[0].c) > 0) return;
  const cols = Object.keys(rows[0]);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  for (const row of rows) {
    await pool.query(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`, cols.map((c) => row[c]));
  }
}

async function seedSettings() {
  const defaults = {
    business_name: 'My Cafe',
    target_opening_date: '',
    starting_cash: '0',
    cash_buffer_target: '0',
    monthly_fixed_costs: '0',
    avg_contribution_margin_pct: '0',
    sst_registration_threshold: '500000',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
}

export async function seed() {
  await initSchema();
  await seedSettings();

  // ---------- Licences & Compliance (Malaysia-specific) ----------
  const licences = [
    { name: 'SSM Business Registration (ROB/ROC)', authority: 'SSM (Suruhanjaya Syarikat Malaysia)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Sole prop/partnership (ROB) or Sdn Bhd (ROC). Required before any other licence application.' },
    { name: 'Business Premises Licence', authority: 'Local PBT (Majlis Perbandaran/Bandaraya)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Apply via local council (PBT) where premises is located.' },
    { name: 'Signboard Licence', authority: 'Local PBT', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Separate from premises licence; based on signboard size/location.' },
    { name: 'MOH Food Premises Registration/Licence', authority: 'Ministry of Health (Ministry of Health / PKP daerah)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Health inspection of kitchen/premises required before approval.' },
    { name: 'Income Tax Registration (TIN)', authority: 'LHDN (Lembaga Hasil Dalam Negeri)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Register Tax Identification Number for the business.' },
    { name: 'SST Registration Threshold Monitoring', authority: 'RMCD / Customs (Kastam)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Mandatory registration triggers once annual taxable turnover exceeds RM500,000 (F&B service tax). Monitor monthly revenue against threshold.' },
    { name: 'EPF Employer Registration', authority: 'KWSP (EPF)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Required once first employee is hired.' },
    { name: 'SOCSO/PERKESO Employer Registration', authority: 'PERKESO (SOCSO)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Covers work injury & invalidity schemes for employees.' },
    { name: 'EIS Employer Registration', authority: 'PERKESO (EIS)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Employment Insurance System, registered alongside SOCSO.' },
    { name: 'e-Invoice Compliance Setup', authority: 'LHDN (MyInvois)', category: 'Mandatory', applicable: 1, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Register for MyInvois and integrate POS/invoicing per LHDN e-Invoice mandate timeline for your revenue band.' },
    { name: 'Halal Certification (JAKIM)', authority: 'JAKIM / State Islamic Religious Dept (JAIN)', category: 'Conditional', applicable: 0, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Flag as applicable if pursuing Halal certification for the outlet.' },
    { name: 'Liquor Licence', authority: 'Local PBT / State Authority', category: 'Conditional', applicable: 0, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Flag as applicable if serving alcohol.' },
    { name: 'Public Performance / Music Licence (PPM/MACP)', authority: 'PPM (Public Performance Malaysia) / MACP', category: 'Conditional', applicable: 0, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Flag as applicable if playing recorded/live music in the outlet.' },
    { name: 'Entertainment Licence', authority: 'Local PBT', category: 'Conditional', applicable: 0, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Flag as applicable if hosting live entertainment/performances.' },
    { name: 'Outdoor Seating / Al Fresco Permit', authority: 'Local PBT', category: 'Conditional', applicable: 0, status: 'Not Started', deadline: '', cost: 0, reference_no: '', notes: 'Flag as applicable if using outdoor/five-foot-way seating.' },
  ];
  await seedTable('licences', licences);

  // ---------- Skill Preparation (People & SOPs) ----------
  const skillPrep = [
    { training: 'Barista Training (espresso, milk texturing, latte art)', who: 'Owner + Staff', provider: '', status: 'Not Started', cost: 0, certificate_expiry: '', notes: '' },
    { training: 'Food Handler Certificate (Typhoid Course + Certificate)', who: 'All food handlers', provider: 'MOH-approved training provider', status: 'Not Started', cost: 0, certificate_expiry: '', notes: 'Mandatory for all staff handling food, required for MOH premises registration.' },
    { training: 'Typhoid Vaccination', who: 'All food handlers', provider: 'Clinic/Klinik Kesihatan', status: 'Not Started', cost: 0, certificate_expiry: '', notes: 'Required alongside Food Handler Certificate; valid 3 years.' },
    { training: 'First Aid / CPR Certification', who: 'Manager', provider: '', status: 'Not Started', cost: 0, certificate_expiry: '', notes: '' },
    { training: 'Fire Safety / Fire Extinguisher Handling', who: 'Manager + Staff', provider: 'Bomba-approved provider', status: 'Not Started', cost: 0, certificate_expiry: '', notes: '' },
    { training: 'Food Safety / HACCP Awareness', who: 'Manager + Staff', provider: '', status: 'Not Started', cost: 0, certificate_expiry: '', notes: '' },
    { training: 'Allergen Awareness', who: 'All staff', provider: '', status: 'Not Started', cost: 0, certificate_expiry: '', notes: '' },
    { training: 'Basic Bookkeeping / Accounting', who: 'Owner', provider: '', status: 'Not Started', cost: 0, certificate_expiry: '', notes: '' },
  ];
  await seedTable('skill_prep', skillPrep);

  // ---------- SOP Library ----------
  const sops = [
    { category: 'Opening', sop_name: 'Opening Checklist SOP', status: 'Not Started', notes: '' },
    { category: 'Opening', sop_name: 'Cash Float & Register Setup SOP', status: 'Not Started', notes: '' },
    { category: 'Service', sop_name: 'Customer Order Taking SOP', status: 'Not Started', notes: '' },
    { category: 'Service', sop_name: 'POS & Payment Handling SOP', status: 'Not Started', notes: '' },
    { category: 'Service', sop_name: 'Complaint Handling SOP', status: 'Not Started', notes: '' },
    { category: 'Kitchen', sop_name: 'Recipe & Portioning Standards', status: 'Not Started', notes: '' },
    { category: 'Kitchen', sop_name: 'Food Storage & FIFO SOP', status: 'Not Started', notes: '' },
    { category: 'Kitchen', sop_name: 'Cleaning & Sanitation Schedule', status: 'Not Started', notes: '' },
    { category: 'Kitchen', sop_name: 'Allergen Handling SOP', status: 'Not Started', notes: '' },
    { category: 'Closing', sop_name: 'End-of-Day Closing Checklist', status: 'Not Started', notes: '' },
    { category: 'Closing', sop_name: 'Cash Reconciliation SOP', status: 'Not Started', notes: '' },
    { category: 'Closing', sop_name: 'Equipment Shutdown SOP', status: 'Not Started', notes: '' },
    { category: 'Emergency', sop_name: 'Fire Emergency & Evacuation SOP', status: 'Not Started', notes: '' },
    { category: 'Emergency', sop_name: 'First Aid / Injury Response SOP', status: 'Not Started', notes: '' },
    { category: 'Emergency', sop_name: 'Food Safety Incident / Recall SOP', status: 'Not Started', notes: '' },
  ];
  await seedTable('sop_library', sops);

  // ---------- Pre-Opening ----------
  const preOpening = [
    { category: 'Equipment Testing', item: 'All kitchen equipment powered on & function tested', status: 'Not Started', notes: '' },
    { category: 'Equipment Testing', item: 'Espresso machine calibration & water quality check', status: 'Not Started', notes: '' },
    { category: 'Equipment Testing', item: 'Refrigeration temperature logs verified', status: 'Not Started', notes: '' },
    { category: 'POS Testing', item: 'POS end-to-end test: order -> kitchen -> payment -> receipt', status: 'Not Started', notes: '' },
    { category: 'POS Testing', item: 'e-Invoice/MyInvois integration test transaction', status: 'Not Started', notes: '' },
    { category: 'POS Testing', item: 'Payment terminal / QR payment test transactions', status: 'Not Started', notes: '' },
    { category: 'Soft Launch', item: 'Friends & family soft launch session', status: 'Not Started', notes: '' },
    { category: 'Soft Launch', item: 'Staff full-shift dry run under service conditions', status: 'Not Started', notes: '' },
    { category: 'Soft Launch', item: 'Feedback collected & issues logged from soft launch', status: 'Not Started', notes: '' },
    { category: 'Final Sign-off', item: 'All Go/No-Go gates confirmed green', status: 'Not Started', notes: '' },
    { category: 'Final Sign-off', item: 'Owner final walkthrough & sign-off', status: 'Not Started', notes: '' },
  ];
  await seedTable('pre_opening_checklist', preOpening);

  // ---------- Go/No-Go Gates ----------
  const gateCountResult = await pool.query('SELECT COUNT(*) as c FROM gates');
  if (Number(gateCountResult.rows[0].c) === 0) {
    const gateDefs = [
      {
        name: 'Business Viability',
        items: [
          'Break-even analysis completed and reviewed',
          'Startup budget finalized within available funds',
          'Cash buffer of at least 3 months operating costs secured',
          'Revenue forecast validated against realistic footfall/market assumptions',
          'Financing/funding fully committed (loan, savings, investors)',
        ],
      },
      {
        name: 'Property',
        items: [
          'Lease/tenancy agreement signed',
          'Electrical supply capacity confirmed sufficient',
          'Water supply & drainage checked and adequate',
          'Gas supply (piped/cylinder) installed and safety-checked',
          'Exhaust/ventilation system installed and tested',
          'Grease trap installed and compliant',
          'Renovation completed and defects cleared',
        ],
      },
      {
        name: 'Legal',
        items: [
          'SSM business registration completed',
          'Business premises licence approved',
          'Signboard licence approved',
          'MOH food premises registration/licence approved',
          'Tax (TIN) registration completed',
          'EPF, SOCSO & EIS employer registration completed',
          'e-Invoice (MyInvois) compliance in place',
          'All applicable conditional licences (Halal/liquor/music/entertainment/outdoor) approved',
        ],
      },
      {
        name: 'People',
        items: [
          'Core team fully hired',
          'All contracts signed',
          'Payroll & EPF/SOCSO/EIS enrollment complete for all staff',
          'Food Handler Certificates obtained for all food handlers',
          'Typhoid vaccination completed for all food handlers',
          'Barista training completed',
          'First aid/CPR, fire safety, food safety & allergen training completed',
        ],
      },
      {
        name: 'Operations',
        items: [
          'Full menu costed with acceptable margins',
          'Primary and backup suppliers confirmed for critical ingredients',
          'Equipment procurement register 100% delivered & installed',
          'SOP library finalized for opening, service, kitchen, closing & emergency',
          'Staff trained on SOPs',
        ],
      },
      {
        name: 'Opening',
        items: [
          'All equipment tested and functioning',
          'POS end-to-end test passed',
          'Soft launch completed with issues resolved',
          'Final owner walkthrough & sign-off completed',
          'All other 5 gates confirmed green',
        ],
      },
    ];

    for (let idx = 0; idx < gateDefs.length; idx++) {
      const gate = gateDefs[idx];
      const gateResult = await pool.query('INSERT INTO gates (name, sort_order) VALUES ($1, $2) RETURNING id', [
        gate.name,
        idx,
      ]);
      const gateId = gateResult.rows[0].id;
      for (const item of gate.items) {
        await pool.query('INSERT INTO gate_items (gate_id, item, complete, notes) VALUES ($1, $2, 0, $3)', [
          gateId,
          item,
          '',
        ]);
      }
    }
  }

  console.log('Seed complete.');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  seed()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
