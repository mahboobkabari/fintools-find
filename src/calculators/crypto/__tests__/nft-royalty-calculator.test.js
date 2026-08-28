import { describe, it, expect } from 'vitest';
import {
  calculateSingleNftSale,
  calculateMultiSaleSchedule,
  generateSensitivityScenarios,
  calculateNftRoyalty,
  ROYALTY_BASIS_MODELS,
  SALE_TYPES,
  FIAT_CURRENCIES,
  CRYPTO_DENOMINATIONS,
} from '../nft-royalty-calculator.js';

describe('NFT Royalty Calculator Engine (Flagship #98)', () => {
  // 1-5: Single Sale Base Math
  it('1. should calculate standard secondary sale correctly with 5% royalty and 2.5% marketplace fee', () => {
    const res = calculateSingleNftSale({
      salePrice: 2.0,
      royaltyPct: 5.0,
      marketplaceFeePct: 2.5,
      otherFees: 0,
      enforcementPct: 100,
      royaltyBasis: 'GROSS_SALE_PRICE',
      saleType: 'SECONDARY_RESALE',
      cryptoPriceFiat: 2500,
    });

    expect(res.amounts.salePrice).toBe(2.0);
    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.1, 5); // 2.0 * 5%
    expect(res.amounts.expectedRoyaltyAmount).toBeCloseTo(0.1, 5);
    expect(res.amounts.marketplaceFeeAmount).toBeCloseTo(0.05, 5); // 2.0 * 2.5%
    expect(res.amounts.sellerNetProceeds).toBeCloseTo(1.85, 5); // 2.0 - 0.1 - 0.05
    expect(res.amounts.creatorNetProceeds).toBeCloseTo(0.1, 5);
    expect(res.fiat.expectedRoyaltyFiat).toBeCloseTo(250, 2); // 0.1 * 2500
  });

  it('2. should handle zero sale price gracefully without NaN or negative values', () => {
    const res = calculateSingleNftSale({
      salePrice: 0,
      royaltyPct: 5.0,
      marketplaceFeePct: 2.5,
    });

    expect(res.amounts.salePrice).toBe(0);
    expect(res.amounts.grossRoyaltyAmount).toBe(0);
    expect(res.amounts.expectedRoyaltyAmount).toBe(0);
    expect(res.amounts.marketplaceFeeAmount).toBe(0);
    expect(res.amounts.sellerNetProceeds).toBe(0);
    expect(res.percentages.effectiveFrictionPct).toBe(0);
  });

  it('3. should verify buyer total cost matches sale price', () => {
    const res = calculateSingleNftSale({ salePrice: 3.5 });
    expect(res.amounts.buyerTotalCost).toBe(3.5);
  });

  it('4. should verify seller net plus all deductions perfectly reconciles to gross sale price', () => {
    const res = calculateSingleNftSale({
      salePrice: 10.0,
      royaltyPct: 7.5,
      marketplaceFeePct: 2.5,
      otherFees: 0.05,
      enforcementPct: 100,
    });

    const sum =
      res.amounts.sellerNetProceeds +
      res.amounts.expectedRoyaltyAmount +
      res.amounts.marketplaceFeeAmount +
      res.amounts.otherFees;
    expect(sum).toBeCloseTo(10.0, 5);
  });

  it('5. should calculate fiat amounts accurately with ETH price of $3,000', () => {
    const res = calculateSingleNftSale({
      salePrice: 1.5,
      royaltyPct: 10.0,
      marketplaceFeePct: 2.0,
      cryptoPriceFiat: 3000,
    });

    expect(res.fiat.salePriceFiat).toBeCloseTo(4500, 2);
    expect(res.fiat.expectedRoyaltyFiat).toBeCloseTo(450, 2); // 0.15 ETH * $3000
    expect(res.fiat.marketplaceFeeFiat).toBeCloseTo(90, 2); // 0.03 ETH * $3000
    expect(res.fiat.sellerNetFiat).toBeCloseTo(3960, 2); // 1.32 ETH * $3000
  });

  // 6-10: Royalty Rates & Gross Basis
  it('6. should calculate zero creator royalty correctly (0%)', () => {
    const res = calculateSingleNftSale({
      salePrice: 4.0,
      royaltyPct: 0,
      marketplaceFeePct: 2.5,
    });

    expect(res.amounts.grossRoyaltyAmount).toBe(0);
    expect(res.amounts.expectedRoyaltyAmount).toBe(0);
    expect(res.amounts.sellerNetProceeds).toBeCloseTo(3.9, 5); // 4.0 - 0.1 mkt fee
  });

  it('7. should calculate 2.5% creator royalty correctly', () => {
    const res = calculateSingleNftSale({
      salePrice: 4.0,
      royaltyPct: 2.5,
      marketplaceFeePct: 2.5,
    });

    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.1, 5);
    expect(res.amounts.expectedRoyaltyAmount).toBeCloseTo(0.1, 5);
  });

  it('8. should calculate 7.5% creator royalty correctly', () => {
    const res = calculateSingleNftSale({
      salePrice: 8.0,
      royaltyPct: 7.5,
    });

    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.6, 5);
  });

  it('9. should calculate 10% creator royalty correctly', () => {
    const res = calculateSingleNftSale({
      salePrice: 5.0,
      royaltyPct: 10.0,
    });

    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.5, 5);
  });

  it('10. should strictly use gross sale price as basis under GROSS_SALE_PRICE mode', () => {
    const res = calculateSingleNftSale({
      salePrice: 10.0,
      royaltyPct: 5.0,
      marketplaceFeePct: 5.0,
      royaltyBasis: 'GROSS_SALE_PRICE',
    });

    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.5, 5); // 10 * 5% = 0.5
  });

  // 11-15: Net Basis & Marketplace Fees
  it('11. should compute royalty on net proceeds under NET_SALE_PROCEEDS mode', () => {
    // Net base = 10 - 0.5 (5% mkt fee) - 0.1 (other fee) = 9.4
    // Royalty = 9.4 * 5% = 0.47
    const res = calculateSingleNftSale({
      salePrice: 10.0,
      royaltyPct: 5.0,
      marketplaceFeePct: 5.0,
      otherFees: 0.1,
      royaltyBasis: 'NET_SALE_PROCEEDS',
    });

    expect(res.amounts.marketplaceFeeAmount).toBeCloseTo(0.5, 5);
    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.47, 5);
    expect(res.amounts.sellerNetProceeds).toBeCloseTo(10.0 - 0.5 - 0.1 - 0.47, 5);
  });

  it('12. should handle zero marketplace fee (0%)', () => {
    const res = calculateSingleNftSale({
      salePrice: 2.0,
      royaltyPct: 5.0,
      marketplaceFeePct: 0,
    });

    expect(res.amounts.marketplaceFeeAmount).toBe(0);
    expect(res.amounts.sellerNetProceeds).toBeCloseTo(1.9, 5);
  });

  it('13. should handle custom high marketplace fee (5.0%)', () => {
    const res = calculateSingleNftSale({
      salePrice: 6.0,
      marketplaceFeePct: 5.0,
    });

    expect(res.amounts.marketplaceFeeAmount).toBeCloseTo(0.3, 5);
  });

  it('14. should calculate effective marketplace fee rate percentage', () => {
    const res = calculateSingleNftSale({
      salePrice: 2.5,
      marketplaceFeePct: 3.0,
    });

    expect(res.percentages.effectiveMktFeeRate).toBeCloseTo(3.0, 5);
  });

  it('15. should calculate effective royalty rate percentage', () => {
    const res = calculateSingleNftSale({
      salePrice: 4.0,
      royaltyPct: 6.5,
      enforcementPct: 100,
    });

    expect(res.percentages.effectiveRoyaltyRate).toBeCloseTo(6.5, 5);
  });

  // 16-20: Other Fees & Gas
  it('16. should handle zero other fees correctly', () => {
    const res = calculateSingleNftSale({
      salePrice: 1.0,
      otherFees: 0,
    });

    expect(res.amounts.otherFees).toBe(0);
    expect(res.fiat.otherFeesFiat).toBe(0);
  });

  it('17. should deduct positive other transaction/gas fees from seller proceeds', () => {
    const res = calculateSingleNftSale({
      salePrice: 2.0,
      royaltyPct: 5.0,
      marketplaceFeePct: 2.5,
      otherFees: 0.015,
    });

    // 2.0 - 0.1 - 0.05 - 0.015 = 1.835
    expect(res.amounts.sellerNetProceeds).toBeCloseTo(1.835, 5);
    expect(res.amounts.totalFriction).toBeCloseTo(0.165, 5);
  });

  it('18. should clamp seller net proceeds to 0 if fees exceed sale price', () => {
    const res = calculateSingleNftSale({
      salePrice: 0.05,
      royaltyPct: 10.0,
      marketplaceFeePct: 10.0,
      otherFees: 0.5, // Exceeds 0.05
    });

    expect(res.amounts.sellerNetProceeds).toBe(0);
  });

  it('19. should calculate total transaction friction accurately', () => {
    const res = calculateSingleNftSale({
      salePrice: 5.0,
      royaltyPct: 5.0, // 0.25
      marketplaceFeePct: 2.5, // 0.125
      otherFees: 0.025, // 0.025
    });

    expect(res.amounts.totalFriction).toBeCloseTo(0.4, 5);
  });

  it('20. should calculate effective friction percentage correctly', () => {
    const res = calculateSingleNftSale({
      salePrice: 4.0,
      royaltyPct: 5.0,
      marketplaceFeePct: 2.5,
      otherFees: 0.1, // Friction = 0.2 + 0.1 + 0.1 = 0.4 -> 10%
    });

    expect(res.percentages.effectiveFrictionPct).toBeCloseTo(10.0, 5);
  });

  // 21-25: Royalty Enforcement & Probability
  it('21. should return 100% expected royalty when enforcement is 100%', () => {
    const res = calculateSingleNftSale({
      salePrice: 3.0,
      royaltyPct: 5.0,
      enforcementPct: 100,
    });

    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.15, 5);
    expect(res.amounts.expectedRoyaltyAmount).toBeCloseTo(0.15, 5);
    expect(res.amounts.lostRoyaltyAmount).toBe(0);
  });

  it('22. should return 0 expected royalty and full lost royalty when enforcement is 0%', () => {
    const res = calculateSingleNftSale({
      salePrice: 3.0,
      royaltyPct: 5.0,
      enforcementPct: 0,
    });

    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.15, 5);
    expect(res.amounts.expectedRoyaltyAmount).toBe(0);
    expect(res.amounts.lostRoyaltyAmount).toBeCloseTo(0.15, 5);
    // When royalty is bypassed, seller retains the royalty portion
    expect(res.amounts.sellerNetProceeds).toBeCloseTo(3.0 - (3.0 * 0.025), 5);
  });

  it('23. should calculate expected royalty accurately under 50% partial enforcement', () => {
    const res = calculateSingleNftSale({
      salePrice: 4.0,
      royaltyPct: 10.0, // Gross = 0.4
      enforcementPct: 50,
    });

    expect(res.amounts.grossRoyaltyAmount).toBeCloseTo(0.4, 5);
    expect(res.amounts.expectedRoyaltyAmount).toBeCloseTo(0.2, 5);
    expect(res.amounts.lostRoyaltyAmount).toBeCloseTo(0.2, 5);
    expect(res.percentages.effectiveRoyaltyRate).toBeCloseTo(5.0, 5);
  });

  it('24. should compute lost royalty fiat equivalent under partial enforcement', () => {
    const res = calculateSingleNftSale({
      salePrice: 2.0,
      royaltyPct: 5.0, // Gross = 0.1 ETH
      enforcementPct: 25, // Expected = 0.025 ETH, Lost = 0.075 ETH
      cryptoPriceFiat: 2000,
    });

    expect(res.fiat.lostRoyaltyFiat).toBeCloseTo(150, 2); // 0.075 * 2000
    expect(res.fiat.expectedRoyaltyFiat).toBeCloseTo(50, 2); // 0.025 * 2000
  });

  it('25. should reflect reduced friction when marketplace bypasses royalties', () => {
    const fullEnforce = calculateSingleNftSale({ salePrice: 2.0, royaltyPct: 5.0, enforcementPct: 100 });
    const zeroEnforce = calculateSingleNftSale({ salePrice: 2.0, royaltyPct: 5.0, enforcementPct: 0 });

    expect(zeroEnforce.amounts.totalFriction).toBeLessThan(fullEnforce.amounts.totalFriction);
  });

  // 26-30: Primary Mint vs Secondary Resale
  it('26. should allocate 100% of proceeds minus fees to creator under PRIMARY_MINT mode', () => {
    const res = calculateSingleNftSale({
      salePrice: 1.0,
      marketplaceFeePct: 2.5,
      otherFees: 0.01,
      saleType: 'PRIMARY_MINT',
    });

    // Creator receives 1.0 - 0.025 - 0.01 = 0.965
    expect(res.amounts.creatorNetProceeds).toBeCloseTo(0.965, 5);
    expect(res.amounts.sellerNetProceeds).toBeCloseTo(0.965, 5);
  });

  it('27. should not deduct secondary royalty from creator in PRIMARY_MINT mode', () => {
    const res = calculateSingleNftSale({
      salePrice: 2.0,
      royaltyPct: 10.0,
      marketplaceFeePct: 2.5,
      saleType: 'PRIMARY_MINT',
    });

    expect(res.amounts.grossRoyaltyAmount).toBe(0);
    expect(res.amounts.creatorNetProceeds).toBeCloseTo(1.95, 5);
  });

  it('28. should calculate secondary resale creator proceeds strictly as expected royalty', () => {
    const res = calculateSingleNftSale({
      salePrice: 3.0,
      royaltyPct: 5.0,
      saleType: 'SECONDARY_RESALE',
    });

    expect(res.amounts.creatorNetProceeds).toBeCloseTo(0.15, 5);
  });

  it('29. should calculate seller proceeds percentage correctly', () => {
    const res = calculateSingleNftSale({
      salePrice: 10.0,
      royaltyPct: 5.0,
      marketplaceFeePct: 2.5,
      otherFees: 0,
    });

    // Seller gets 9.25 / 10 = 92.5%
    expect(res.percentages.sellerProceedsPct).toBeCloseTo(92.5, 5);
  });

  it('30. should calculate creator proceeds percentage correctly for secondary trade', () => {
    const res = calculateSingleNftSale({
      salePrice: 10.0,
      royaltyPct: 5.0,
      enforcementPct: 100,
    });

    expect(res.percentages.creatorProceedsPct).toBeCloseTo(5.0, 5);
  });

  // 31-35: Multi-Sale Schedule Generation
  it('31. should handle empty multi-sale list gracefully', () => {
    const res = calculateMultiSaleSchedule([]);
    expect(res.schedule).toHaveLength(0);
    expect(res.totals.totalSalesCount).toBe(0);
    expect(res.totals.totalVolumeCrypto).toBe(0);
  });

  it('32. should handle single-item multi-sale schedule accurately', () => {
    const res = calculateMultiSaleSchedule([{ price: 2.5 }], { royaltyPct: 5.0 });
    expect(res.schedule).toHaveLength(1);
    expect(res.totals.totalVolumeCrypto).toBeCloseTo(2.5, 5);
    expect(res.totals.totalExpectedRoyaltiesCrypto).toBeCloseTo(0.125, 5);
  });

  it('33. should generate multi-sale schedule across 5 consecutive sales', () => {
    const resales = [
      { price: 1.0 },
      { price: 1.5 },
      { price: 2.0 },
      { price: 2.5 },
      { price: 3.0 },
    ];
    const res = calculateMultiSaleSchedule(resales, { royaltyPct: 5.0, cryptoPriceFiat: 2000 });

    expect(res.schedule).toHaveLength(5);
    expect(res.totals.totalSalesCount).toBe(5);
    expect(res.totals.totalVolumeCrypto).toBeCloseTo(10.0, 5); // 1 + 1.5 + 2 + 2.5 + 3
    expect(res.totals.totalVolumeFiat).toBeCloseTo(20000, 2);
  });

  it('34. should compute cumulative volume monotonically in multi-sale schedule', () => {
    const resales = [{ price: 1.0 }, { price: 2.0 }, { price: 3.0 }];
    const res = calculateMultiSaleSchedule(resales);

    expect(res.schedule[0].cumulativeVolumeCrypto).toBeCloseTo(1.0, 5);
    expect(res.schedule[1].cumulativeVolumeCrypto).toBeCloseTo(3.0, 5);
    expect(res.schedule[2].cumulativeVolumeCrypto).toBeCloseTo(6.0, 5);
  });

  it('35. should compute cumulative expected royalties monotonically in schedule', () => {
    const resales = [{ price: 2.0 }, { price: 4.0 }, { price: 6.0 }];
    const res = calculateMultiSaleSchedule(resales, { royaltyPct: 5.0 });

    expect(res.schedule[0].cumulativeExpectedRoyaltiesCrypto).toBeCloseTo(0.1, 5);
    expect(res.schedule[1].cumulativeExpectedRoyaltiesCrypto).toBeCloseTo(0.3, 5);
    expect(res.schedule[2].cumulativeExpectedRoyaltiesCrypto).toBeCloseTo(0.6, 5);
  });

  // 36-40: Multi-Sale Aggregates & Averages
  it('36. should calculate total expected royalties and gross royalties matching sum of rows', () => {
    const resales = [{ price: 2.0 }, { price: 5.0 }, { price: 8.0 }];
    const res = calculateMultiSaleSchedule(resales, { royaltyPct: 10.0, enforcementPct: 100 });

    // Total vol = 15, 10% = 1.5
    expect(res.totals.totalGrossRoyaltiesCrypto).toBeCloseTo(1.5, 5);
    expect(res.totals.totalExpectedRoyaltiesCrypto).toBeCloseTo(1.5, 5);
  });

  it('37. should calculate average resale price correctly', () => {
    const resales = [{ price: 1.0 }, { price: 3.0 }, { price: 5.0 }];
    const res = calculateMultiSaleSchedule(resales);

    expect(res.totals.averageResalePriceCrypto).toBeCloseTo(3.0, 5); // 9 / 3
  });

  it('38. should calculate average royalty per resale correctly', () => {
    const resales = [{ price: 2.0 }, { price: 4.0 }, { price: 6.0 }];
    const res = calculateMultiSaleSchedule(resales, { royaltyPct: 5.0 });

    // Royalties: 0.1, 0.2, 0.3 = 0.6 total / 3 = 0.2
    expect(res.totals.averageRoyaltyCrypto).toBeCloseTo(0.2, 5);
  });

  it('39. should calculate effective lifetime royalty rate percentage across multi-sale schedule', () => {
    const resales = [{ price: 2.0 }, { price: 4.0 }, { price: 4.0 }];
    const res = calculateMultiSaleSchedule(resales, { royaltyPct: 7.5, enforcementPct: 100 });

    expect(res.totals.effectiveLifetimeRoyaltyRate).toBeCloseTo(7.5, 5);
  });

  it('40. should support per-sale overrides in multi-sale schedule', () => {
    const resales = [
      { price: 2.0, royaltyPct: 5.0, enforcementPct: 100 },
      { price: 4.0, royaltyPct: 10.0, enforcementPct: 50 }, // Expected: 4 * 10% * 50% = 0.2
    ];
    const res = calculateMultiSaleSchedule(resales);

    expect(res.schedule[0].expectedRoyaltyCrypto).toBeCloseTo(0.1, 5);
    expect(res.schedule[1].expectedRoyaltyCrypto).toBeCloseTo(0.2, 5);
    expect(res.totals.totalExpectedRoyaltiesCrypto).toBeCloseTo(0.3, 5);
  });

  // 41-45: Sensitivity Matrices & Edge Cases
  it('41. should generate royalty rate sensitivity across 5 tiers (0%, 2.5%, 5%, 7.5%, 10%)', () => {
    const sens = generateSensitivityScenarios({ salePrice: 2.0, enforcementPct: 100 });
    expect(sens.royaltySensitivity).toHaveLength(5);
    expect(sens.royaltySensitivity[0].royaltyPct).toBe(0);
    expect(sens.royaltySensitivity[0].expectedRoyaltyCrypto).toBe(0);
    expect(sens.royaltySensitivity[4].royaltyPct).toBe(10);
    expect(sens.royaltySensitivity[4].expectedRoyaltyCrypto).toBeCloseTo(0.2, 5);
  });

  it('42. should generate resale price sensitivity across 6 multipliers (-50% to +100%)', () => {
    const sens = generateSensitivityScenarios({ salePrice: 2.0, royaltyPct: 5.0 });
    expect(sens.priceSensitivity).toHaveLength(6);
    expect(sens.priceSensitivity[0].multiplier).toBe(0.5);
    expect(sens.priceSensitivity[0].simulatedPriceCrypto).toBeCloseTo(1.0, 5);
    expect(sens.priceSensitivity[5].multiplier).toBe(2.0);
    expect(sens.priceSensitivity[5].simulatedPriceCrypto).toBeCloseTo(4.0, 5);
  });

  it('43. should generate volume scenarios across 5 resale counts (1, 5, 10, 25, 50)', () => {
    const sens = generateSensitivityScenarios({ salePrice: 2.0, royaltyPct: 5.0 });
    expect(sens.volumeScenarios).toHaveLength(5);
    expect(sens.volumeScenarios[0].resaleCount).toBe(1);
    expect(sens.volumeScenarios[0].totalVolumeCrypto).toBeCloseTo(2.0, 5);
    expect(sens.volumeScenarios[4].resaleCount).toBe(50);
    expect(sens.volumeScenarios[4].totalVolumeCrypto).toBeCloseTo(100.0, 5);
  });

  it('44. should generate enforcement sensitivity across 5 tiers (0%, 25%, 50%, 75%, 100%)', () => {
    const sens = generateSensitivityScenarios({ salePrice: 4.0, royaltyPct: 5.0 });
    expect(sens.enforcementSensitivity).toHaveLength(5);
    expect(sens.enforcementSensitivity[0].enforcementPct).toBe(0);
    expect(sens.enforcementSensitivity[0].expectedRoyaltyCrypto).toBe(0);
    expect(sens.enforcementSensitivity[4].enforcementPct).toBe(100);
    expect(sens.enforcementSensitivity[4].expectedRoyaltyCrypto).toBeCloseTo(0.2, 5);
  });

  it('45. should normalize invalid and out-of-range inputs safely in calculateNftRoyalty', () => {
    const res = calculateNftRoyalty({
      salePrice: -5.0, // should clamp to 0
      royaltyPct: 150, // should clamp to 100
      marketplaceFeePct: -10, // should clamp to 0
      otherFees: -0.5, // should clamp to 0
      enforcementPct: 200, // should clamp to 100
    });

    expect(res.single.inputs.salePrice).toBe(0);
    expect(res.single.inputs.royaltyPct).toBe(100);
    expect(res.single.inputs.marketplaceFeePct).toBe(0);
    expect(res.single.inputs.enforcementPct).toBe(100);
    expect(res.multi.schedule).toBeDefined();
    expect(res.sensitivities.royaltySensitivity).toBeDefined();
  });
});
