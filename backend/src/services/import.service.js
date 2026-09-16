const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { createTransaction } = require("./transaction.service");

async function importCsv(userId, filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true });
  const results = { imported: 0, duplicates: 0, failed: 0, items: [] };

  for (const row of rows) {
    try {
      const item = await createTransaction(userId, {
        merchant: row.merchant || row.Merchant,
        amount: Number(row.amount || row.Amount),
        type: (row.type || row.Type || "debit").toLowerCase(),
        category: row.category || row.Category,
        method: row.method || row.Method || "UPI",
        source: "CSV Import",
        occurredAt: row.date || row.Date || new Date(),
      });
      results.imported += 1;
      results.items.push(item.id);
    } catch (err) {
      if (err.status === 409) results.duplicates += 1;
      else results.failed += 1;
    }
  }

  return results;
}

module.exports = { importCsv };
