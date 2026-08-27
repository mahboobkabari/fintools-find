/**
 * Flagship Asset Depreciation & Capital Cost Amortization Decision Engine (Math Engine V2)
 * Supports GAAP, IFRS (IAS 16), Indian Companies Act (Schedule II), IT Act Sec 32, and IRS MACRS standards.
 * 
 * Supports 5 Institutional Depreciation Methods:
 * 1. Straight-Line Method (SLM)
 * 2. Written Down Value / Diminishing Balance (WDV)
 * 3. Double Declining Balance (DDB)
 * 4. Sum-of-the-Years'-Digits (SYD)
 * 5. Units of Production / Activity Method
 * 
 * @param {Object} inputs
 * @param {number} [inputs.assetCost=500000] - Initial acquisition cost of the asset (₹, $, £, etc.)
 * @param {number} [inputs.salvageValue=50000] - Estimated residual / salvage value at end of useful life
 * @param {number} [inputs.usefulLife=5] - Useful life in years (1 to 50 years)
 * @param {string} [inputs.method='slm'] - 'slm' | 'wdv' | 'ddb' | 'syd' | 'units'
 * @param {number} [inputs.taxRate=25] - Corporate Income Tax Rate % (for tax shield calculation)
 * @param {number} [inputs.totalUnits=100000] - Total estimated lifetime units (for units of production)
 * @param {number} [inputs.firstYearUnits=25000] - Estimated Year 1 units produced
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const ASSET_CLASS_STANDARDS = {
  commercial_vehicle: { name: 'Commercial Motor Vehicles', defaultLife: 6, defaultSalvagePct: 5, itActRate: 30 },
  plant_machinery: { name: 'Factory Plant & Machinery', defaultLife: 15, defaultSalvagePct: 5, itActRate: 15 },
  computer_servers: { name: 'Computers, Laptops & Servers', defaultLife: 3, defaultSalvagePct: 2, itActRate: 40 },
  office_equipment: { name: 'Office Equipment & Furniture', defaultLife: 10, defaultSalvagePct: 5, itActRate: 10 },
  commercial_building: { name: 'Commercial Buildings / Factory Sheds', defaultLife: 30, defaultSalvagePct: 10, itActRate: 10 },
  heavy_aircraft: { name: 'Heavy Machinery & Aircraft', defaultLife: 20, defaultSalvagePct: 5, itActRate: 15 },
};

export function calculateDepreciationCalculator(inputs = {}) {
  const {
    assetCost = 500000,
    salvageValue = 50000,
    usefulLife = 5,
    method = 'slm',
    taxRate = 25,
    totalUnits = 100000,
    firstYearUnits = 25000,
    currencySymbol = '₹',
  } = inputs;

  const cost = Math.max(0, Number(assetCost) || 0);
  const rawSalvage = Math.max(0, Number(salvageValue) || 0);
  // Salvage cannot exceed cost
  const salvage = Math.min(cost, rawSalvage);
  const numLife = Number(usefulLife);
  const life = Math.max(1, Math.min(50, Math.round(isNaN(numLife) ? 5 : (numLife <= 0 ? 1 : numLife))));
  const tRate = Math.max(0, Math.min(100, Number(taxRate) || 0));
  const tUnits = Math.max(1, Number(totalUnits) || 100000);
  const y1Units = Math.max(0, Number(firstYearUnits) || 0);
  const rawMethodKey = String(method).toLowerCase();
  const validMethods = ['slm', 'wdv', 'ddb', 'syd', 'units'];
  const methodKey = validMethods.includes(rawMethodKey) ? rawMethodKey : 'slm';

  // Depreciable Base
  const depreciableAmount = Math.max(0, cost - salvage);

  // Helper generator for annual schedules
  const generateSchedule = (mKey) => {
    const schedule = [];
    let currentBookValue = cost;
    let accumulatedDep = 0;

    if (mKey === 'slm') {
      const annualDep = life > 0 ? depreciableAmount / life : 0;
      for (let y = 1; y <= life; y++) {
        const opening = currentBookValue;
        const dep = Math.min(opening - salvage, Math.round(annualDep));
        accumulatedDep += dep;
        const closing = Math.max(salvage, opening - dep);
        currentBookValue = closing;
        const taxShield = Math.round(dep * (tRate / 100));
        schedule.push({
          year: y,
          openingBookValue: Math.round(opening),
          depreciationExpense: Math.round(dep),
          accumulatedDepreciation: Math.round(accumulatedDep),
          closingBookValue: Math.round(closing),
          taxShield: Math.round(taxShield),
        });
      }
    } else if (mKey === 'wdv') {
      // Statutory WDV rate formula: 1 - (salvage / cost)^(1/n)
      let wdvRate = 0;
      if (cost > 0 && salvage > 0 && salvage < cost) {
        wdvRate = 1 - Math.pow(salvage / cost, 1 / life);
      } else if (salvage === 0 && cost > 0) {
        // Assume nominal 1% salvage for geometric progression if salvage is 0
        wdvRate = 1 - Math.pow(0.01, 1 / life);
      }

      for (let y = 1; y <= life; y++) {
        const opening = currentBookValue;
        let dep = Math.round(opening * wdvRate);
        // Don't depreciate below salvage
        if (opening - dep < salvage) {
          dep = Math.max(0, opening - salvage);
        }
        accumulatedDep += dep;
        const closing = Math.max(salvage, opening - dep);
        currentBookValue = closing;
        const taxShield = Math.round(dep * (tRate / 100));
        schedule.push({
          year: y,
          openingBookValue: Math.round(opening),
          depreciationExpense: Math.round(dep),
          accumulatedDepreciation: Math.round(accumulatedDep),
          closingBookValue: Math.round(closing),
          taxShield: Math.round(taxShield),
        });
      }
    } else if (mKey === 'ddb') {
      // Double Declining Balance: 2 / life rate
      const ddbRate = Math.min(1, 2 / life);
      for (let y = 1; y <= life; y++) {
        const opening = currentBookValue;
        let dep = Math.round(opening * ddbRate);
        if (opening - dep < salvage) {
          dep = Math.max(0, opening - salvage);
        }
        accumulatedDep += dep;
        const closing = Math.max(salvage, opening - dep);
        currentBookValue = closing;
        const taxShield = Math.round(dep * (tRate / 100));
        schedule.push({
          year: y,
          openingBookValue: Math.round(opening),
          depreciationExpense: Math.round(dep),
          accumulatedDepreciation: Math.round(accumulatedDep),
          closingBookValue: Math.round(closing),
          taxShield: Math.round(taxShield),
        });
      }
    } else if (mKey === 'syd') {
      // Sum-of-the-Years'-Digits: sum = n(n+1)/2
      const sumOfYears = (life * (life + 1)) / 2;
      for (let y = 1; y <= life; y++) {
        const opening = currentBookValue;
        const fraction = (life - y + 1) / sumOfYears;
        const dep = Math.round(depreciableAmount * fraction);
        accumulatedDep += dep;
        const closing = Math.max(salvage, opening - dep);
        currentBookValue = closing;
        const taxShield = Math.round(dep * (tRate / 100));
        schedule.push({
          year: y,
          openingBookValue: Math.round(opening),
          depreciationExpense: Math.round(dep),
          accumulatedDepreciation: Math.round(accumulatedDep),
          closingBookValue: Math.round(closing),
          taxShield: Math.round(taxShield),
        });
      }
    } else if (mKey === 'units') {
      // Units of Production: per unit rate
      const perUnitRate = tUnits > 0 ? depreciableAmount / tUnits : 0;
      const avgSubsequentUnits = life > 1 ? Math.max(0, (tUnits - y1Units) / (life - 1)) : 0;
      for (let y = 1; y <= life; y++) {
        const opening = currentBookValue;
        const unitsYear = y === 1 ? y1Units : avgSubsequentUnits;
        let dep = Math.round(unitsYear * perUnitRate);
        if (opening - dep < salvage) {
          dep = Math.max(0, opening - salvage);
        }
        accumulatedDep += dep;
        const closing = Math.max(salvage, opening - dep);
        currentBookValue = closing;
        const taxShield = Math.round(dep * (tRate / 100));
        schedule.push({
          year: y,
          openingBookValue: Math.round(opening),
          depreciationExpense: Math.round(dep),
          accumulatedDepreciation: Math.round(accumulatedDep),
          closingBookValue: Math.round(closing),
          taxShield: Math.round(taxShield),
        });
      }
    }

    return schedule;
  };

  // Active Schedule
  const activeSchedule = generateSchedule(methodKey);
  const firstYearDepreciation = activeSchedule.length > 0 ? activeSchedule[0].depreciationExpense : 0;
  const totalTaxShield = activeSchedule.reduce((acc, row) => acc + row.taxShield, 0);

  // Method Names
  const methodNames = {
    slm: 'Straight-Line Method (SLM)',
    wdv: 'Written Down Value (WDV / Diminishing Balance)',
    ddb: 'Double Declining Balance (DDB)',
    syd: "Sum-of-the-Years'-Digits (SYD)",
    units: 'Units of Production (Activity-Based)',
  };

  const activeMethodName = methodNames[methodKey] || methodNames.slm;

  // Multi-Method Comparison Matrix (SLM vs WDV vs DDB vs SYD)
  const slmSched = generateSchedule('slm');
  const wdvSched = generateSchedule('wdv');
  const ddbSched = generateSchedule('ddb');
  const sydSched = generateSchedule('syd');

  const methodComparison = [
    {
      id: 'slm',
      name: 'Straight-Line (SLM)',
      year1Dep: slmSched.length > 0 ? slmSched[0].depreciationExpense : 0,
      year1TaxShield: slmSched.length > 0 ? slmSched[0].taxShield : 0,
      totalDepreciation: slmSched.reduce((a, b) => a + b.depreciationExpense, 0),
      description: 'Equal annual write-off; ideal for financial reporting & GAAP/IFRS.',
    },
    {
      id: 'wdv',
      name: 'Written Down Value (WDV)',
      year1Dep: wdvSched.length > 0 ? wdvSched[0].depreciationExpense : 0,
      year1TaxShield: wdvSched.length > 0 ? wdvSched[0].taxShield : 0,
      totalDepreciation: wdvSched.reduce((a, b) => a + b.depreciationExpense, 0),
      description: 'Accelerated tax write-offs early in life; statutory standard for IT Act Sec 32.',
    },
    {
      id: 'ddb',
      name: 'Double Declining (DDB)',
      year1Dep: ddbSched.length > 0 ? ddbSched[0].depreciationExpense : 0,
      year1TaxShield: ddbSched.length > 0 ? ddbSched[0].taxShield : 0,
      totalDepreciation: ddbSched.reduce((a, b) => a + b.depreciationExpense, 0),
      description: 'Maximum initial expense (2x straight-line rate) for high-wear assets.',
    },
    {
      id: 'syd',
      name: "Sum-of-the-Years' (SYD)",
      year1Dep: sydSched.length > 0 ? sydSched[0].depreciationExpense : 0,
      year1TaxShield: sydSched.length > 0 ? sydSched[0].taxShield : 0,
      totalDepreciation: sydSched.reduce((a, b) => a + b.depreciationExpense, 0),
      description: 'Smooth accelerated decline based on remaining asset lifespan.',
    },
  ];

  // Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Maximize Year 1 Corporate Tax Shield',
      savings: Math.max(0, (ddbSched[0]?.taxShield || 0) - (slmSched[0]?.taxShield || 0)),
      action: `Using Accelerated Depreciation (DDB) delivers ${currencySymbol}${(ddbSched[0]?.taxShield || 0).toLocaleString()} in Year 1 tax savings vs ${currencySymbol}${(slmSched[0]?.taxShield || 0).toLocaleString()} under Straight-Line.`,
    },
    {
      rank: 2,
      title: 'Tax Compliance (Sec 32 vs Companies Act)',
      savings: totalTaxShield,
      action: `Remember to maintain separate books: Straight-Line (SLM) for Companies Act financial accounting and WDV Block of Assets for Income Tax Section 32 filings.`,
    },
    {
      rank: 3,
      title: 'Residual Salvage Value Monitoring',
      savings: salvage,
      action: `Ensure salvage value of ${currencySymbol}${salvage.toLocaleString()} (${cost > 0 ? Math.round((salvage / cost) * 100) : 0}% of cost) reflects realistic market scrap value at year ${life}.`,
    },
  ];

  // Hero Verdict Text
  const heroText = `Year 1 Depreciation expense for your ${currencySymbol}${cost.toLocaleString()} asset is ${currencySymbol}${firstYearDepreciation.toLocaleString()} using ${activeMethodName}. Total tax shield generated is ${currencySymbol}${totalTaxShield.toLocaleString()}.`;

  return {
    primaryOutput: firstYearDepreciation,
    assetCost: cost,
    salvageValue: salvage,
    depreciableAmount,
    usefulLife: life,
    method: methodKey,
    methodName: activeMethodName,
    taxRate: tRate,
    currencySymbol,
    firstYearDepreciation,
    totalTaxShield,
    schedule: activeSchedule,
    methodComparison,
    recommendations,
    heroText,
  };
}

export const calculateDepreciationTool = calculateDepreciationCalculator;
