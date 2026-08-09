/**
 * Reference Configuration & Benchmark Data for Flagship Car Loan Calculator
 */

export const CAR_LOAN_CONFIG = {
  defaultInterestRate: 9.0, // Standard quoted bank car loan rate (9.0% p.a.)

  fuelCostPerKm: {
    petrol: 7.5,
    diesel: 6.0,
    hybrid: 4.5,
    ev: 1.5,
  },

  benchmarks: {
    registrationTaxPct: 8.0, // Approx 8% on-road registration tax
    annualInsurancePct: 3.5, // Approx 3.5% per year insurance cost
    annualMaintenancePct: 2.0, // Approx 2.0% per year servicing & maintenance
    sec80EEB_maxDeduction: 150000, // Section 80EEB EV loan interest max deduction (₹1.5 Lakhs)
  },

  presets: [
    {
      id: 'hatchback_sedan_petrol',
      title: 'Hatchback / Sedan Petrol (₹10 Lakhs)',
      description: '₹10 Lakhs vehicle price with 20% down payment (₹2 Lakhs) and 9.0% interest rate over 5 years.',
      values: {
        vehiclePrice: 1000000,
        downPaymentPct: 20,
        rate: 9.0,
        tenure: 5,
        monthlyIncome: 100000,
        fuelType: 'petrol',
        annualKm: 12000,
        processingFeePct: 1,
        marginalTaxRate: 30,
        isSec80EEBEligible: false,
        calculationMode: 'forward',
        targetEmi: 20000,
        inflationRate: 6,
      },
    },
    {
      id: 'premium_suv',
      title: 'Premium SUV (₹25 Lakhs)',
      description: '₹25 Lakhs vehicle price with 15% down payment and 8.75% interest rate over 7 years.',
      values: {
        vehiclePrice: 2500000,
        downPaymentPct: 15,
        rate: 8.75,
        tenure: 7,
        monthlyIncome: 200000,
        fuelType: 'diesel',
        annualKm: 15000,
        processingFeePct: 1,
        marginalTaxRate: 30,
        isSec80EEBEligible: false,
        calculationMode: 'forward',
        targetEmi: 30000,
        inflationRate: 6,
      },
    },
    {
      id: 'electric_vehicle_ev',
      title: 'Electric Vehicle (EV) (₹18 Lakhs)',
      description: '₹18 Lakhs EV price with 20% down payment, 8.5% interest rate, and Section 80EEB tax savings.',
      values: {
        vehiclePrice: 1800000,
        downPaymentPct: 20,
        rate: 8.5,
        tenure: 5,
        monthlyIncome: 150000,
        fuelType: 'ev',
        annualKm: 15000,
        processingFeePct: 1,
        marginalTaxRate: 30,
        isSec80EEBEligible: true,
        calculationMode: 'forward',
        targetEmi: 25000,
        inflationRate: 6,
      },
    },
    {
      id: 'target_emi_solver',
      title: 'Target EMI Solver (₹20,000/mo)',
      description: 'Solves maximum affordable car price for a desired monthly EMI of ₹20,000.',
      values: {
        vehiclePrice: 1200000,
        downPaymentPct: 20,
        rate: 9.0,
        tenure: 5,
        monthlyIncome: 100000,
        fuelType: 'petrol',
        annualKm: 12000,
        processingFeePct: 1,
        marginalTaxRate: 30,
        isSec80EEBEligible: false,
        calculationMode: 'reverse_emi',
        targetEmi: 20000,
        inflationRate: 6,
      },
    },
  ],
};
