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

    if(budgets.length === 0 || transactions.length === 0){
      return "Not enough information given to generate report";
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
    const overageCategories = new Set(overages.map((o) => o.category));
    const contributingTransactions = transactions.filter((transaction) => transaction.amount < 0 && overageCategories.has(transaction.category));

    let report = 'Budget Audit Report:\nCategory Summaries:\n';
    for (const category in budgets){
      const limit = budgets[category];
      const spent = spending[category] || 0;
      report += `* ${category}: Budget = $${limit}, Spent = $${spent}\n`;
    }

    report += 'Categories over budget:\n';
    if (overages.length === 0){
      report += 'No categories exceed their budget.\n';
    }
    else {
      for (const item of overages){
        report += `* ${item.category} exceeded its budget by $${item.overage} (${item.percentage.toFixed(2)}% of budget)\n`;
      }
    }

    report += 'Overage Transactions:\n'
    if (contributingTransactions.length === 0){
      report += 'No overage transactions\n';
    }
    else {
      for (const trns of contributingTransactions){
        const amount = Math.abs(trns.amount);
        report += `* [${trns.category}] $${amount} - ${trns.description || 'No description'}\n`
      }
    }

    return report;
  }
}
