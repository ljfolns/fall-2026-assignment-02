import { Transaction } from '../models.js';
import { BudgetService } from '../services/BudgetService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class BudgetLimitStrategy implements AuditStrategy {
  public readonly name = 'Budget Limit Auditor';
  public readonly description =
    'Checks category spending against monthly budget limits';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {

    // TODO: Feature 1 - Implement this strategy.

    // 1. Call BudgetService.getCategoryBudgets() asynchronously.
    let budgets;
    try {
      budgets = await BudgetService.getCategoryBudgets();
    }
    catch (error){
      throw new Error("Failed to retrieve budgets");
    }

    // 2. Group expenses (amounts < 0) by category and compute total spending for each category.
    const spending: Record<string, number> = {};

    for (const transaction of transactions) {
      if (transaction.amount < 0){
        const expense = Math.abs(transaction.amount);
        if (spending[transaction.category] === undefined){
          spending[transaction.category] = expense;
        }
        else {
          spending[transaction.category] += expense;
        }
      }
    }

    // 3. Compare spending against the fetched limits.
    
    const overages = [];

    for (const category in budgets){
      const limit = budgets[category];
      const spent = spending[category] || 0;

    // 4. Identify overages (categories where spending exceeds the budget).

      if (spent > limit){
        const overage = spent - limit;
        const percentage = limit > 0 ? (spent/limit) * 100 : 100;

        overages.push({
          category: category,
          budget: limit,
          spent: spent,
          overage: overage,
          percentage: percentage
        });
      }
    }
    
    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages, and lists of transactions causing the overage.
      //make arr of transactions causing overages
      const audit = "Limits: \nActuals: \nOverage Amounts: \nPercentages: \nTransactions causing overages:" `${overageArr}`;

    throw new Error('Method not implemented.');
  }
}
