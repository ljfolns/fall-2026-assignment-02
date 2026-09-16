import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiCurrencyStrategy } from '../src/strategies/MultiCurrencyStrategy.js';
import { ExchangeRateService } from '../src/services/ExchangeRateService.js';
import { Transaction } from '../src/models.js';

describe('MultiCurrencyStrategy (Feature 5)', () => {
  let strategy: MultiCurrencyStrategy;

  beforeEach(() => {
    strategy = new MultiCurrencyStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should convert amounts and sum values in target currency', async () => {
  //   const mockRates = { base: 'USD', rates: { EUR: 0.90 } };
  //   const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: 100.00, category: 'Salary', description: 'Gig', status: 'completed' },
  //     { id: '2', date: '2026-05-02', amount: -50.00, category: 'Food', description: 'Grocery', status: 'completed' },
  //   ];
  //
  //   const result = await strategy.execute(testTransactions, 'EUR');
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('90.00 EUR'); // 100 * 0.90
  //   expect(result).toContain('-45.00 EUR'); // -50 * 0.90
  //   expect(result).toContain('Balance: 45.00 EUR');
  // });

  it('should parse exchange rates and use customParam target currency', async () => {
    const result = await strategy.execute([], "JPY");

    expect(result).toContain("CONVERSION RATE: $1 USD = 155.4 JPY");
  });


  it('should default to EUR conversion if currency param is missing or invalid', async () => {
    let noShowResult = await strategy.execute([]);
    expect(noShowResult).toContain("CONVERSION RATE: $1 USD = 0.92 EUR");
    let undefinedResult = await strategy.execute([], undefined);
    expect(undefinedResult).toContain("CONVERSION RATE: $1 USD = 0.92 EUR");
    let blankResult = await strategy.execute([], "");
    expect(blankResult).toContain("CONVERSION RATE: $1 USD = 0.92 EUR");
  });

  it('should throw an error if the target currency does not exist in exchange rates', async () => {
    // let result = await strategy.execute([], "GORILLA");
    // await expect(result).rejects.toThrow("Currency not found in rates!: GORILLA");
    //for error throwing tests, you have to call the awaited function in the expect like so, not like above
    //(because otherwise the failed case gets called before the expect, leading to the whole test failing because of a called error)
    await expect(strategy.execute([],"GORILLA")).rejects.toThrow("Currency not found in rates!: GORILLA");
    });

  it('should accurately convert individual transaction amounts to the target currency', async () => {
    const testTransactions: Transaction[] = [
    {
      "id": "tx-001",
      "date": "2026-05-01",
      "amount": 2500.0,
      "category": "Salary",
      "description": "Monthly paycheck",
      "status": "completed"
    },
    {
      "id": "tx-002",
      "date": "2026-05-02",
      "amount": -1200.0,
      "category": "Rent",
      "description": "Apartment rent payment",
      "status": "completed"
    }
    ];

    const result = await strategy.execute(testTransactions, "JPY");

    expect(result).toContain("BALANCE: $1300.00 USD, 202020.00 JPY");
  
  });

  it('should calculate and display totals (income, expense, net balance) in both USD and target currency', async () => {
        const testTransactions: Transaction[] = [
    {
      "id": "tx-001",
      "date": "2026-05-01",
      "amount": 2500.0,
      "category": "Salary",
      "description": "Monthly paycheck",
      "status": "completed"
    },
    {
      "id": "tx-002",
      "date": "2026-05-02",
      "amount": -1200.0,
      "category": "Rent",
      "description": "Apartment rent payment",
      "status": "completed"
    },
    {
      "id": "tx-003",
      "date": "2026-05-02",
      "amount": -200.0,
      "category": "Rent",
      "description": "Extra apartment rent payment (MAKING SURE IT ADDS TO SAME CATEGORY (CAUSE BOTH ARE RENT))",
      "status": "completed"
    },
    {
      "id": "tx-002",
      "date": "2026-05-02",
      "amount": -50.0,
      "category": "Groceries",
      "description": "Apartment rent payment",
      "status": "completed"
    }
    ];

    const result = await strategy.execute(testTransactions, "EUR");
    expect(result).toContain("CONVERSION RATE: $1 USD = 0.92 EUR");
    expect(result).toContain("TOTAL INCOME: $2500.00 USD, 2300.00 EUR");
    expect(result).toContain("TOTAL EXPENSES: $1450.00 USD, 1334.00 EUR");
    expect(result).toContain("BALANCE: $1050.00 USD, 966.00 EUR");
    expect(result).toContain("EXPENSE TYPES:");
    expect(result).toContain("RENT: $1400.00 USD, 1288.00 EUR");
    expect(result).toContain("GROCERIES: $50.00 USD, 46.00 EUR");
  });
});
