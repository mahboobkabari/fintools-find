/**
 * Import Duty Calculator Configuration & Presets
 * Sprint 80 / Flagship #87
 */

export const IMPORT_DUTY_CONFIG = {
  id: 'import-duty-calculator',
  title: 'Import Duty Calculator',
  category: 'currency',
  categoryName: 'Currency & Cost Calculators',
  version: '3.0.0',
  author: 'Fintools Find International Trade & Customs Advisory Board',
  lastUpdated: '2026-08-27',

  defaults: {
    unitPrice: 15000,
    quantity: 1,
    shippingCost: 2500,
    insuranceCost: 500,
    dutyRate: 10,
    surchargeRate: 10,
    vatGstRate: 18,
    handlingFee: 1200,
    valuationMethod: 'CIF',
    currency: 'INR',
    itemDescription: 'Imported Consumer Electronics',
  },

  presets: [
    {
      id: 'india_electronics',
      label: 'India: Consumer Electronics (CIF)',
      icon: '📱',
      unitPrice: 25000,
      quantity: 1,
      shippingCost: 3000,
      insuranceCost: 600,
      dutyRate: 10, // 10% BCD
      surchargeRate: 10, // 10% SWS
      vatGstRate: 18, // 18% IGST
      handlingFee: 1500,
      valuationMethod: 'CIF',
      currency: 'INR',
      itemDescription: 'Laptop / Gadget Import (CIF)',
      desc: '₹25,000 Unit · 10% BCD + 10% SWS + 18% IGST',
    },
    {
      id: 'india_luxury',
      label: 'India: Luxury Goods & Watches (CIF)',
      icon: '⌚',
      unitPrice: 100000,
      quantity: 1,
      shippingCost: 5000,
      insuranceCost: 1500,
      dutyRate: 20, // 20% BCD
      surchargeRate: 10, // 10% SWS
      vatGstRate: 28, // 28% IGST
      handlingFee: 2500,
      valuationMethod: 'CIF',
      currency: 'INR',
      itemDescription: 'Swiss Watch / Luxury Apparel',
      desc: '₹1 Lakh Unit · 20% BCD + 28% Luxury IGST',
    },
    {
      id: 'us_commercial',
      label: 'US: General Merchandise (FOB)',
      icon: '🇺🇸',
      unitPrice: 1200,
      quantity: 5,
      shippingCost: 400,
      insuranceCost: 100,
      dutyRate: 3.5, // 3.5% US Tariff
      surchargeRate: 0,
      vatGstRate: 0, // No federal VAT in US
      handlingFee: 125, // Customs broker entry fee
      valuationMethod: 'FOB',
      currency: 'USD',
      itemDescription: 'Commercial Machinery Parts',
      desc: '$6,000 FOB Order · 3.5% Duty (US CBP Standard)',
    },
    {
      id: 'uk_eu_goods',
      label: 'UK / EU: Standard Consumer Import (CIF)',
      icon: '🇬🇧',
      unitPrice: 450,
      quantity: 2,
      shippingCost: 80,
      insuranceCost: 20,
      dutyRate: 4, // 4% EU/UK Tariff
      surchargeRate: 0,
      vatGstRate: 20, // 20% Standard UK/EU VAT
      handlingFee: 40,
      valuationMethod: 'CIF',
      currency: 'GBP',
      itemDescription: 'European Consumer Retail Order',
      desc: '£900 CIF Order · 4% Duty + 20% Import VAT',
    },
    {
      id: 'uae_gcc',
      label: 'UAE: GCC Common Customs Tariff',
      icon: '🇦🇪',
      unitPrice: 5000,
      quantity: 1,
      shippingCost: 400,
      insuranceCost: 100,
      dutyRate: 5, // 5% GCC Unified Customs Tariff
      surchargeRate: 0,
      vatGstRate: 5, // 5% UAE VAT
      handlingFee: 150,
      valuationMethod: 'CIF',
      currency: 'AED',
      itemDescription: 'GCC Standard Import Cargo',
      desc: '5,000 AED · 5% GCC Duty + 5% UAE VAT',
    },
    {
      id: 'zero_duty_fta',
      label: 'Free Trade Agreement (Zero Duty)',
      icon: '🤝',
      unitPrice: 50000,
      quantity: 1,
      shippingCost: 4000,
      insuranceCost: 800,
      dutyRate: 0, // 0% under FTA / CEPA
      surchargeRate: 0,
      vatGstRate: 18, // 18% domestic IGST
      handlingFee: 1200,
      valuationMethod: 'CIF',
      currency: 'INR',
      itemDescription: 'FTA / Bilateral Exemption Cargo',
      desc: '0% Basic Duty · Only Domestic 18% IGST Applies',
    },
  ],
};
