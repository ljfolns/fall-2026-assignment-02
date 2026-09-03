import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxDeductionStrategy } from '../src/strategies/TaxDeductionStrategy.js';
import { TaxConfigService } from '../src/services/TaxConfigService.js';
import { Transaction } from '../src/models.js';

describe('TaxDeductionStrategy (Feature 4)', () => {
  let strategy: TaxDeductionStrategy;

  beforeEach(() => {
    strategy = new TaxDeductionStrategy();
    vi.restoreAllMocks();
  });

  const testTransactions: Transaction[] = [
    {
      id: '1',
      date: '2026-05-01',
      amount: -200.0,
      category: 'Charity',
      description: 'Donation',
      status: 'completed',
    }, // Deductible
    {
      id: '2',
      date: '2026-05-02',
      amount: -100.0,
      category: 'Food',
      description: 'Grocery',
      status: 'completed',
    }, // Non-deductible
  ];

  const mockConfig = {
    standardTaxRate: 0.1,
    deductibleCategories: ['Medical', 'Charity'],
  };

  const spy = vi
    .spyOn(TaxConfigService, 'getTaxConfig')
    .mockResolvedValue(mockConfig);


  // Example of how to write and mock in your tests:
  //
  it('should compute tax savings correctly based on rate and deductible categories', async () => {
     const result = await strategy.execute(testTransactions);
     const spy = vi
        .spyOn(TaxConfigService, 'getTaxConfig')
        .mockResolvedValue(mockConfig);

     expect(result).toContain('Savings: $16.00');
  });

  it('should filter only the categories specified as deductible in the config', async() => {
    const result = await strategy.execute(testTransactions);
    expect(result).not.toContain("Food");
  });

  it('should sum total eligible tax deductions correctly', async() => {
    const result = await strategy.execute(testTransactions);

    expect(result).toContain("Deductions: $200.00");
  });

  it('should calculate estimated VAT/sales tax paid on non-deductible expense transactions', async () => {
    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Tax paid: $0.08');
  });

  it('should structure report to show both aggregates and itemized deductible transactions', async () => {
    const result = await strategy.execute(testTransactions);

    expect(result).toContain('1 | 2026-05-01 | -200 | Charity | Donation');
  });
});
