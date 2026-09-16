import { Transaction } from '../models.js';
import { ExchangeRateService } from '../services/ExchangeRateService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class MultiCurrencyStrategy implements AuditStrategy {
  public readonly name = 'Multi-Currency Auditor';
  public readonly description =
    'Converts and aggregates transactions in a foreign currency';

  public async execute(transactions: Transaction[], customParam?: string, ): Promise<string> {
    // TODO: Feature 5 - Implement this strategy.
    // 1. Call ExchangeRateService.getExchangeRates() asynchronously.
    let pick: string = (customParam ?? "EUR");
    if (pick == ""){
      pick = "EUR";
    }
    let rate: number;
    let rates = await ExchangeRateService.getExchangeRates();

    let usdExpenses: number = 0;
    let usdIncome: number = 0;
    let usdBalance: number = 0;
    let usdExpenseTypes: Record<string, number> = {};

    let convExpenses: number = 0;
    let convIncome: number = 0;
    let convBalance: number = 0;
    let convExpenseTypes: Record<string, number> = {};

    let outputString: string = "";

    rate = rates.rates[pick];

    if (rate == undefined){
      throw new Error(`Currency not found in rates!: ${pick}`);
    }

    for (let i: number = 0; i < transactions.length; i++){
    
      let amount = transactions[i]["amount"];

      if (amount < 0){ //expense branch
        usdExpenseTypes[transactions[i]["category"]] = usdExpenseTypes[transactions[i]["category"]] ?? 0;
        usdExpenseTypes[transactions[i]["category"]] += amount;
        convExpenseTypes[transactions[i]["category"]] = convExpenseTypes[transactions[i]["category"]] ?? 0;
        convExpenseTypes[transactions[i]["category"]] += amount * rate;

        usdExpenses += amount;
        convExpenses += amount * rate;
      } else { //income branch
        usdIncome += amount;
        convIncome += amount * rate;
      }
      usdBalance += amount;
      convBalance += amount * rate;
    }
    //forming outputstring
    outputString += `CONVERSION RATE: $1 USD = ${rate} ${pick}\n`;
    outputString += `TOTAL INCOME: $${usdIncome.toFixed(2)} USD, ${convIncome.toFixed(2)} ${pick}\n`;
    outputString += `TOTAL EXPENSES: $${Math.abs(usdExpenses).toFixed(2)} USD, ${Math.abs(convExpenses).toFixed(2)} ${pick}\n`;
    outputString += `BALANCE: $${usdBalance.toFixed(2)} USD, ${convBalance.toFixed(2)} ${pick}\n`;
    outputString += `EXPENSE TYPES:\n`;
    for (const key of Object.keys(usdExpenseTypes)){
      outputString += `\t${key.toUpperCase()}: $${Math.abs(usdExpenseTypes[key]).toFixed(2)} USD, ${Math.abs(convExpenseTypes[key]).toFixed(2)} ${pick}\n`;
    }

    return outputString;
    
    
    // 2. Identify the target currency from `customParam` (default to 'EUR' if invalid/not provided).
    // 3. Look up the exchange rate for the target currency (throw an error if not found in rates).
    // 4. Convert all transaction amounts to the target currency.
    // 5. Calculate total income, total expenses, and net balance in BOTH USD and target currency.
    // 6. Format and return a text-based audit report detailing conversion metrics, conversion rate used, and transaction summaries in both currencies.

  }
}
