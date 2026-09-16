import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnomalyDetectionStrategy } from '../src/strategies/AnomalyDetectionStrategy.js';
import { AnomalyRulesService } from '../src/services/AnomalyRulesService.js';
import { AnomalyRules, Transaction } from '../src/models.js';

describe('AnomalyDetectionStrategy (Feature 2)', () => {
  let strategy: AnomalyDetectionStrategy;

  beforeEach(() => {
    strategy = new AnomalyDetectionStrategy();
    vi.restoreAllMocks();
  });

  it('should detect outlier transactions exceeding the configured max amount limit', async () => {
    const mockRules: AnomalyRules = { maxTransactionAmount: 500.0, flaggedStatuses: ['flagged'] };

    const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -600.0, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
      { id: '2', date: '2026-05-02', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
    ];

    const result = await strategy.execute(testTransactions);
    
    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Outlier Transactions:');
    expect(result).toContain('Transaction ID: 1');
    expect(result).toContain('600');
    expect(result).not.toContain('Transaction ID: 2');
  });

  it('should identify duplicate transactions sharing identical date, amount, category, and description', async () => {
    const mockRules: AnomalyRules = { maxTransactionAmount: 1000.0, flaggedStatuses: ['flagged'] };

    const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' },
      { id: '2', date: '2026-05-01', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' }, // Duplicate
      { id: '3', date: '2026-05-02', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Duplicate Transaction Sets:');
    expect(result).toContain('Transaction IDs: 1 and 2');
    expect(result).not.toContain('Transaction IDs: 1 and 3');
  });

  it('should flag transactions matching standard flagged statuses in the rules', async () => {
    const mockRules: AnomalyRules = { maxTransactionAmount: 1000.0, flaggedStatuses: ['flagged'] };

    const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100.0, category: 'Food', description: 'Grocery', status: 'flagged' }, // Flagged
      { id: '2', date: '2026-05-02', amount: -100.0, category: 'Food', description: 'Restaurant', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Flagged Transactions:');
    expect(result).toContain('Transaction ID: 1, Status: flagged');
    expect(result).not.toContain('Transaction ID: 2, Status: completed');
  });

  it('should calculate the correct number and percentage of anomalous transactions', async () => {
    const mockRules: AnomalyRules = { maxTransactionAmount: 500.0, flaggedStatuses: ['flagged'] };

    const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -600.0, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
      { id: '2', date: '2026-05-02', amount: -100.0, category: 'Food', description: 'Grocery', status: 'flagged' }, // Flagged
      { id: '3', date: '2026-05-03', amount: -200.0, category: 'Food', description: 'Snack', status: 'completed' },
      { id: '4', date: '2026-05-04', amount: -25.0, category: 'Food', description: 'Drink', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Total Anomalous Transactions: 2');
    expect(result).toContain('Anomalous Transactions Percentage: 50.00%');
  });

  it('should output a clean, readable text audit report detailing warnings', async () => {
    const mockRules: AnomalyRules = { maxTransactionAmount: 500.0, flaggedStatuses: ['flagged'] };

    const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
    
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -600.0, category: 'Shopping', description: 'Laptop', status: 'flagged' }, // Flagged
      { id: '2', date: '2026-05-02', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);
    
    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Audit Report for Anomaly & Duplicate Auditor:');
    expect(result).toContain('Outlier Transactions:');
    expect(result).toContain('Duplicate Transaction Sets:');
    expect(result).toContain('Flagged Transactions:');
    expect(result).toContain('Summary:');
    expect(result).toContain('Transaction ID: 1');
  });
});
