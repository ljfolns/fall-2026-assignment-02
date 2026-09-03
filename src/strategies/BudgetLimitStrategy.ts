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
    async function getCatBudgets(): Promise<T> {
      try {
        const result = await BudgetService.getCategoryBudgets();
        return result;
      }
      catch(error){
        throw new Error('Operation not possible');
      }
    }
    // 2. Group expenses (amounts < 0) by category and compute total spending for each category.
      //map arrow function of getCatBudgets -> new array of sorted values
        const mappedCategories = getCatBudgets.map((amounts) => amounts < 0);
      //make new array of summed total spending of each category
        const summedTotals = mappedCategories.map((x) => );
    // 3. Compare spending against the fetched limits.
      //array of booleans, true if spending > limits
    // 4. Identify overages (categories where spending exceeds the budget).
      //array of bools fulfills this request
      const overageArr = 
    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages, and lists of transactions causing the overage.
      //make arr of transactions causing overages
      const audit = "Limits: \nActuals: \nOverage Amounts: \nPercentages: \nTransactions causing overages:" `${overageArr}`;

    throw new Error('Method not implemented.');
  }
}
