import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetLimitStrategy } from '../src/strategies/BudgetLimitStrategy.js';
import { BudgetService } from '../src/services/BudgetService.js';
import { Transaction } from '../src/models.js';

describe('BudgetLimitStrategy (Feature 1)', () => {
  let strategy: BudgetLimitStrategy;

  beforeEach(() => {
    strategy = new BudgetLimitStrategy();
    vi.restoreAllMocks();
  });

  it('should group expenses by category correctly', async()=>{
    const mockBudgets = { Food: 100, Rent: 1000 };
    const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -150.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Over budget
      { id: '2', date: '2026-05-02', amount: -900.00, category: 'Rent', description: 'Apartment', status: 'completed' }, // Under budget
    ];
    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Food');
    expect(result).toContain('Food exceeded its budget');
    expect(result).not.toContain('Rent exceeded its budget');
  });

  it('should group expenses correctly by category and sum them', async()=>{
    const mockBudgets = { Food: 100 };
    const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, 
      { id: '2', date: '2026-05-02', amount: -900.00, category: 'Food', description: 'Grocery', status: 'completed' }, 
    ];
    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Food');
    expect(result).toContain('Food: Budget = $1000');
  });

  it('should calculate absolute overage amounts and percentage exceeded', async()=>{
    const mockBudgets = { Food: 100, Rent: 1000 };
    const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -200.00, category: 'Food', description: 'Grocery', status: 'completed' }, 
      { id: '2', date: '2026-05-02', amount: -1500.00, category: 'Rent', description: 'Apartment', status: 'completed' }, 
    ];
    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('* Food exceeded its budget by $100 (100% of budget)');
    expect(result).toContain('* Rent exceeded its budget by $500 (50% of budget)');
  });

  it('should list the specific transactions contributing to categories that are over budget',async()=>{
    const mockBudgets = { Food: 100, Rent: 1000 };
    const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -200.00, category: 'Food', description: 'Grocery', status: 'completed' }, 
      { id: '2', date: '2026-05-02', amount: -1500.00, category: 'Rent', description: 'Apartment', status: 'completed' }, 
    ];
    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('* [Food] $200 - Grocery');
    expect(result).toContain('* [Rent] $1500 - Apartment');
  });

  it('should handle scenarios where no categories are over budget',async()=>{
    const mockBudgets = { Food: 100, Rent: 1000 };
    const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -1.00, category: 'Food', description: 'Grocery', status: 'completed' }, 
      { id: '2', date: '2026-05-02', amount: -1.00, category: 'Rent', description: 'Apartment', status: 'completed' }, 
    ];
    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('No categories exceed their budget.');
    expect(result).not.toContain('* Food exceeded its budget');
    expect(result).not.toContain('* Rent exceeded its budget');
  });

  it('should handle empty transaction list gracefully', async() => {
    const mockBudgets = { Food: 100, Rent: 1000 };
    const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
    const testTransactions: Transaction[] = [];
    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('No expenses to show');
  });
});
