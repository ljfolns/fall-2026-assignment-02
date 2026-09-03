import { Transaction } from '../models.js';
import { AnomalyRulesService } from '../services/AnomalyRulesService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class AnomalyDetectionStrategy implements AuditStrategy {
  public readonly name = 'Anomaly & Duplicate Auditor';
  public readonly description =
    'Detects transactions exceeding thresholds and duplicate records';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 2 - Implement this strategy.
    // 1. Call AnomalyRulesService.getRules() asynchronously.
    const rules = await AnomalyRulesService.getRules();

    // 2. Scan transactions to find outliers (expenses exceeding rules.maxTransactionAmount).
    const outliers = transactions.filter(
      (transaction) =>
        Math.abs(transaction.amount) > rules.maxTransactionAmount,
    );

    // 3. Scan to identify duplicates (transactions sharing the exact same date, category, description, and amount).
     const duplicates: Transaction[][] = [];

     for (let i = 0; i < transactions.length; i++) {
       for (let j = i + 1; j < transactions.length; j++) {
         if (
          transactions[i].date === transactions[j].date &&
          transactions[i].category === transactions[j].category &&
          transactions[i].description === transactions[j].description &&
          transactions[i].amount === transactions[j].amount
         ) {
           duplicates.push([transactions[i], transactions[j]]);
         }
       }
     }

    // 4. Identify transactions having a status that matches any in rules.flaggedStatuses.
    const flagged = transactions.filter((transaction) =>
      rules.flaggedStatuses.includes(transaction.status),
    );

    // 5. Calculate the total number of anomalous transactions.
    const anomalousIds = new Set<string>();

    for (const transaction of outliers) {
      anomalousIds.add(transaction.id);
    }

    for (const transaction of flagged) {
      anomalousIds.add(transaction.id);
    }

    for (const pair of duplicates) {
      for (const transaction of pair) {
        anomalousIds.add(transaction.id);
      }
    }

    const anomalyCount = anomalousIds.size;

    // 6. Calculate the percentage of total transactions that are anomalous.
    const anomalyPercentage = transactions.length === 0 ? 0 : (anomalyCount / transactions.length) * 100;
    
    // 7. Format and return a text-based audit report of anomalies, duplicate sets, and totals.
    let auditReport = `Audit Report for ${this.name}:\n\n`;
    auditReport += `Outlier Transactions:\n`;
    for (const transaction of outliers) {
      auditReport += `- Transaction ID: ${transaction.id}, Transaction Amount: ${transaction.amount}\n`;
    }

    auditReport += `\nDuplicate Transaction Sets:\n`;
    for (const pair of duplicates) {
      auditReport += `- Transaction IDs: ${pair.map((transaction) => transaction.id).join(' and ')}\n`;
    }

    auditReport += `\nFlagged Transactions:\n`;
    for (const transaction of flagged) {
      auditReport += `- Transaction ID: ${transaction.id}, Status: ${transaction.status}\n`;
    }

    auditReport += `\nSummary:\n`;
    auditReport += `Total Anomalous Transactions: ${anomalyCount}\n`;
    auditReport += `Anomalous Transactions Percentage: ${anomalyPercentage.toFixed(2)}%\n`;

    return auditReport;
  }
}
