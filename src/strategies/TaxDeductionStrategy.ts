import { TaxConfig, Transaction } from '../models.js';
import { TaxConfigService } from '../services/TaxConfigService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TaxDeductionStrategy implements AuditStrategy {
  public readonly name = 'Tax & Deductions Auditor';
  public readonly description =
    'Identifies eligible tax-deductible expenses and estimates savings';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 4 - Implement this strategy.
    // 1. Call TaxConfigService.getTaxConfig() asynchronously.
    // 2. Filter expenses (amount < 0) that belong to eligible tax-deductible categories.
    // 3. Sum total deductible expenses.
    // 4. Estimate tax savings based on the standard tax rate: total deductible * taxRate.
    // 5. Estimate sales tax/VAT paid on NON-deductible expenses using standard tax rate.
    // 6. Format and return a text-based audit report detailing total deductions, savings, VAT estimates, and eligible transactions.

    let config: TaxConfig = await TaxConfigService.getTaxConfig();
    let deductibles: Transaction[] = transactions.filter((txn) => {
      return txn.amount < 0 && config.deductibleCategories.includes(txn.category);
    });
    let nonDeductibles: Transaction[] = transactions.filter((txn) => {
      return !(txn.amount < 0 && config.deductibleCategories.includes(txn.category));
    });
    let sum: number = 0;
    for (let txn of deductibles) {
      sum += txn.amount;
    }
    let savings: number = (sum * config.standardTaxRate) * -1;
    let taxPaid: number = nonDeductibles.length * config.standardTaxRate;
    sum *= -1;

    let bigStr: string = "";
    for (let txn of deductibles) {
      bigStr += `${txn.id} | ${txn.date} | ${txn.amount} | ${txn.category} | ${txn.description}\n`
    }

    bigStr += "======== TOTALS ========\n"
    bigStr += `Deductions: $${sum}.00\n`
    bigStr += `Savings: $${savings}.00\n`
    bigStr += `Tax paid: $${taxPaid}`

    return bigStr;
  }
}
