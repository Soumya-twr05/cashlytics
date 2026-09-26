import { useState } from "react";
import * as api from "../lib/api";

interface ImportCSVProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CSVRow {
  date: string;
  description: string;
  amount: number;
  type?: "debit" | "credit";
}

/*
 * ============================================================
 * CATEGORY NORMALIZATION
 * ============================================================
 *
 * The ML model and backend currently have slightly different
 * category names.
 *
 * Example:
 *
 * ML:
 *   Transportation
 *
 * Backend:
 *   Transport
 *
 * We normalize everything before sending it to the backend.
 */

const CATEGORY_MAP: Record<string, string> = {
  Transportation: "Transport",
  Transport: "Transport",

  Food: "Food & Dining",
  "Food & Dining": "Food & Dining",

  Grocery: "Groceries",
  Groceries: "Groceries",

  Medical: "Healthcare",
  Healthcare: "Healthcare",

  Financial: "Investment",
  Investment: "Investment",

  Electronics: "Electronics",

  Entertainment: "Entertainment",

  Shopping: "Shopping",

  Bills: "Bills",

  Education: "Education",

  Income: "Income",

  Transfer: "Transfer",

  Lifestyle: "Lifestyle",

  Other: "Other",
};

function normalizeCategory(category: string): string {
  const cleaned = category.trim();

  return CATEGORY_MAP[cleaned] || "Other";
}


/*
 * ============================================================
 * CSV PARSER
 * ============================================================
 *
 * This parser handles:
 *
 * date,description,amount
 *
 * AND quoted CSV:
 *
 * "2024-09-22","Uber ride","250"
 *
 * It also handles descriptions containing commas:
 *
 * "2024-09-22","Uber ride, airport","250"
 */

function parseCSVLine(line: string): string[] {
  const values: string[] = [];

  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      /*
       * Handle escaped quotes:
       * ""
       */
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
}


/*
 * ============================================================
 * DATE NORMALIZATION
 * ============================================================
 */

function normalizeDate(dateValue: string): string | null {
  const cleaned = dateValue
    .trim()
    .replace(/^["']+|["']+$/g, "");

  if (!cleaned) {
    return null;
  }

  /*
   * YYYY-MM-DD
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(cleaned)
  ) {
    const date = new Date(
      `${cleaned}T00:00:00`
    );

    if (!Number.isNaN(date.getTime())) {
      return cleaned;
    }
  }

  /*
   * DD-MM-YYYY
   */
  const ddmmyyyy =
    cleaned.match(
      /^(\d{2})-(\d{2})-(\d{4})$/
    );

  if (ddmmyyyy) {
    const [, day, month, year] =
      ddmmyyyy;

    const isoDate =
      `${year}-${month}-${day}`;

    const date = new Date(
      `${isoDate}T00:00:00`
    );

    if (!Number.isNaN(date.getTime())) {
      return isoDate;
    }
  }

  /*
   * DD/MM/YYYY
   */
  const slashDate =
    cleaned.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

  if (slashDate) {
    const [, day, month, year] =
      slashDate;

    const isoDate =
      `${year}-${month}-${day}`;

    const date = new Date(
      `${isoDate}T00:00:00`
    );

    if (!Number.isNaN(date.getTime())) {
      return isoDate;
    }
  }

  /*
   * Fallback for other valid date formats.
   */
  const fallback =
    new Date(cleaned);

  if (!Number.isNaN(fallback.getTime())) {
    return fallback
      .toISOString()
      .split("T")[0];
  }

  return null;
}


/*
 * ============================================================
 * AMOUNT NORMALIZATION
 * ============================================================
 */

function normalizeAmount(
  amountValue: string
): number | null {
  /*
   * Remove:
   * ₹
   * commas
   * spaces
   * quotes
   */
  const cleaned =
    amountValue
      .trim()
      .replace(/^["']+|["']+$/g, "")
      .replace(/₹/g, "")
      .replace(/,/g, "")
      .replace(/\s/g, "");

  if (!cleaned) {
    return null;
  }

  const amount =
    Number(cleaned);

  if (
    !Number.isFinite(amount) ||
    amount === 0
  ) {
    return null;
  }

  return amount;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ImportCSV({
  onSuccess,
  onCancel,
}: ImportCSVProps) {
  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [preview, setPreview] =
    useState<CSVRow[]>([]);

  const [processing, setProcessing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [totalRows, setTotalRows] =
    useState(0);

  const [statusMessage, setStatusMessage] =
    useState(
      "Upload a bank statement CSV and Cashlytics will analyze it automatically."
    );


  /*
   * ==========================================================
   * FILE SELECTION
   * ==========================================================
   */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Please upload a CSV file."
      );

      setFile(null);
      setPreview([]);

      return;
    }

    setFile(selectedFile);
    setError("");
    setProgress(0);
    setStatusMessage(
      "Reading your financial data..."
    );

    parseCSV(selectedFile);
  };


  /*
   * ==========================================================
   * PARSE CSV
   * ==========================================================
   */

  const parseCSV = (
    selectedFile: File
  ) => {
    const reader =
      new FileReader();

    reader.onload = (e) => {
      try {
        const text =
          e.target?.result as string;

        if (!text?.trim()) {
          setError(
            "The CSV file is empty."
          );

          setPreview([]);

          return;
        }

        /*
         * Handle Windows + Unix line endings.
         */
        const lines =
          text
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n")
            .filter(
              (line) => line.trim()
            );

        if (lines.length < 2) {
          setError(
            "The CSV must contain a header and at least one transaction."
          );

          setPreview([]);

          return;
        }

        const rows: CSVRow[] = [];

        /*
         * Skip header.
         */
        for (
          let i = 1;
          i < lines.length;
          i++
        ) {
          try {
            const columns =
              parseCSVLine(lines[i]);

            if (
              columns.length < 3
            ) {
              continue;
            }

            const rawDate =
              columns[0];

            const description =
              columns[1]
                ?.trim()
                .replace(
                  /^["']+|["']+$/g,
                  ""
                );

            const rawAmount =
              columns[2];

            /*
             * Optional fourth column:
             *
             * debit / credit
             *
             * This allows more advanced bank CSVs.
             */
            const rawType =
              columns[3]
                ?.trim()
                .toLowerCase();

            const date =
              normalizeDate(
                rawDate
              );

            const amount =
              normalizeAmount(
                rawAmount
              );

            if (
              !date ||
              !description ||
              amount === null
            ) {
              continue;
            }

            let type:
              | "debit"
              | "credit" =
              "debit";

            if (
              rawType === "credit" ||
              rawType === "income"
            ) {
              type = "credit";
            }

            rows.push({
              date,
              description,
              amount: Math.abs(
                amount
              ),
              type,
            });
          } catch (rowError) {
            console.warn(
              `Could not parse CSV row ${i + 1}`,
              rowError
            );
          }
        }

        if (rows.length === 0) {
          setError(
            "No valid transactions were found. Check that your CSV uses: date, description, amount"
          );

          setPreview([]);

          return;
        }

        setPreview(
          rows.slice(0, 5)
        );

        setTotalRows(
          rows.length
        );

        setError("");

        setStatusMessage(
          `${rows.length} transactions detected. Ready for AI analysis.`
        );
      } catch (parseError) {
        console.error(
          "CSV parsing error:",
          parseError
        );

        setError(
          "Could not read this CSV file."
        );

        setPreview([]);
      }
    };

    reader.onerror = () => {
      setError(
        "Could not read the selected file."
      );
    };

    reader.readAsText(
      selectedFile
    );
  };


  /*
   * ==========================================================
   * IMPORT
   * ==========================================================
   */

  const handleImport = async () => {
    if (!file) {
      setError(
        "Please select a CSV file first."
      );

      return;
    }

    setLoading(true);
    setProcessing(true);
    setProgress(0);
    setError("");

    try {
      /*
       * Read the file again.
       */
      const text =
        await file.text();

      const lines =
        text
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .split("\n")
          .filter(
            (line) => line.trim()
          );

      const rows: CSVRow[] = [];

      /*
       * Parse all rows first.
       */
      for (
        let i = 1;
        i < lines.length;
        i++
      ) {
        try {
          const columns =
            parseCSVLine(lines[i]);

          if (
            columns.length < 3
          ) {
            continue;
          }

          const date =
            normalizeDate(
              columns[0]
            );

          const description =
            columns[1]
              ?.trim()
              .replace(
                /^["']+|["']+$/g,
                ""
              );

          const amount =
            normalizeAmount(
              columns[2]
            );

          const rawType =
            columns[3]
              ?.trim()
              .toLowerCase();

          if (
            !date ||
            !description ||
            amount === null
          ) {
            continue;
          }

          let type:
            | "debit"
            | "credit" =
            "debit";

          if (
            rawType === "credit" ||
            rawType === "income"
          ) {
            type = "credit";
          }

          rows.push({
            date,
            description,
            amount: Math.abs(
              amount
            ),
            type,
          });
        } catch (rowError) {
          console.warn(
            "Skipping invalid row:",
            rowError
          );
        }
      }

      if (rows.length === 0) {
        throw new Error(
          "No valid transactions could be imported from this CSV."
        );
      }

      setTotalRows(
        rows.length
      );

      /*
       * ======================================================
       * PROCESS EACH TRANSACTION
       * ======================================================
       */

      let importedCount = 0;
      let failedCount = 0;

      const failedRows: string[] = [];

      for (
        let i = 0;
        i < rows.length;
        i++
      ) {
        const row =
          rows[i];

        try {
          setStatusMessage(
            `Analyzing "${row.description}"...`
          );

          /*
           * ================================================
           * AI CATEGORY PREDICTION
           * ================================================
           */

          const prediction = await api.predictTransactionCategory(
            row.description,
            Math.abs(row.amount)
          );

          const predictedCategory =
            prediction.category || "Other";

          const rawCategory =
            prediction?.category ||
            "Other";

          /*
           * Normalize ML category to the
           * backend vocabulary.
           */
          const category =
            normalizeCategory(
              rawCategory
            );

          /*
           * ================================================
           * CREATE TRANSACTION
           * ================================================
           */

          await api.createTransaction({
            description:
              row.description,

            amount:
              row.amount,

            category,

            type:
              row.type,

            date:
              row.date,

            source:
              "CSV Import",
          });

          importedCount++;
        } catch (rowError) {
          failedCount++;

          failedRows.push(
            `${row.description}: ${rowError instanceof Error
              ? rowError.message
              : "Unknown error"
            }`
          );

          console.error(
            "Failed to import row:",
            row,
            rowError
          );
        }

        /*
         * Update progress.
         */
        const percentage =
          Math.round(
            ((i + 1) /
              rows.length) *
            100
          );

        setProgress(
          percentage
        );
      }

      /*
       * ======================================================
       * RESULT
       * ======================================================
       */

      setStatusMessage(
        `Import complete. ${importedCount} transactions added.`
      );

      /*
       * Refresh transactions page.
       */
      if (onSuccess) {
        onSuccess();
      }

      /*
       * Show useful result instead of
       * simply saying "0 transactions".
       */
      if (
        failedCount === 0
      ) {
        alert(
          `Successfully imported ${importedCount} transactions.`
        );
      } else {
        alert(
          `Import completed.\n\n` +
          `Imported: ${importedCount}\n` +
          `Failed: ${failedCount}\n\n` +
          `The successful transactions have been added to Cashlytics.`
        );

        console.warn(
          "Failed CSV rows:",
          failedRows
        );
      }
    } catch (importError) {
      console.error(
        "CSV import error:",
        importError
      );

      setError(
        importError instanceof Error
          ? importError.message
          : "Import failed."
      );
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };


  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background:
            "var(--card)",

          border:
            "1px solid var(--border)",
        }}
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-5">
          <h2
            className="font-bold text-lg"
            style={{
              color:
                "var(--foreground)",
            }}
          >
            Import Bank Transactions
          </h2>

          <p
            className="text-xs mt-1"
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            Upload your bank CSV and
            Cashlytics will understand,
            categorize and track your
            transactions automatically.
          </p>
        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div
            className="p-3 rounded mb-4 text-sm"
            style={{
              background:
                "rgba(232, 93, 93, 0.08)",

              borderLeft:
                "3px solid var(--expense)",

              color:
                "var(--foreground)",
            }}
          >
            {error}
          </div>
        )}


        {/* ================================================= */}
        {/* FILE FORMAT */}
        {/* ================================================= */}

        <div
          className="rounded-lg p-3 mb-4"
          style={{
            background:
              "var(--background)",

            border:
              "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-medium mb-1"
            style={{
              color:
                "var(--foreground)",
            }}
          >
            Supported CSV format
          </p>

          <code
            className="text-[11px]"
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            date, description, amount
          </code>

          <p
            className="text-[11px] mt-2"
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            Example: 2026-09-22,
            Uber ride, 250
          </p>

          <p
            className="text-[11px] mt-1"
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            An optional fourth column
            can specify debit or credit.
          </p>
        </div>


        {/* ================================================= */}
        {/* FILE INPUT */}
        {/* ================================================= */}

        <div className="mb-4">

          <label
            className="block px-4 py-4 rounded border-2 border-dashed text-center cursor-pointer"
            style={{
              borderColor:
                "var(--border)",

              background:
                "var(--background)",

              color: file
                ? "var(--primary)"
                : "var(--muted-foreground)",

              opacity:
                processing
                  ? 0.6
                  : 1,
            }}
          >

            <input
              type="file"
              accept=".csv"
              onChange={
                handleFileChange
              }
              className="hidden"
              disabled={
                processing
              }
            />

            {file
              ? `📁 ${file.name}`
              : "📤 Choose bank CSV"}
          </label>

        </div>


        {/* ================================================= */}
        {/* PREVIEW */}
        {/* ================================================= */}

        {preview.length > 0 && (
          <div className="mb-4">

            <div className="flex items-center justify-between mb-2">

              <h3
                className="text-sm font-medium"
                style={{
                  color:
                    "var(--foreground)",
                }}
              >
                Preview
              </h3>

              <span
                className="text-[11px]"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                {totalRows} transactions detected
              </span>

            </div>

            <div
              className="rounded border overflow-x-auto text-xs"
              style={{
                borderColor:
                  "var(--border)",

                background:
                  "var(--background)",
              }}
            >

              <table className="w-full">

                <thead>

                  <tr
                    style={{
                      borderBottom:
                        "1px solid var(--border)",
                    }}
                  >

                    <th
                      className="px-2 py-2 text-left"
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    >
                      Date
                    </th>

                    <th
                      className="px-2 py-2 text-left"
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    >
                      Description
                    </th>

                    <th
                      className="px-2 py-2 text-right"
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    >
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {preview.map(
                    (row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            "1px solid var(--border)",
                        }}
                      >

                        <td
                          className="px-2 py-2"
                          style={{
                            color:
                              "var(--foreground)",
                          }}
                        >
                          {row.date}
                        </td>

                        <td
                          className="px-2 py-2"
                          style={{
                            color:
                              "var(--foreground)",
                          }}
                        >
                          {row.description}
                        </td>

                        <td
                          className="px-2 py-2 text-right"
                          style={{
                            color:
                              row.type ===
                                "credit"
                                ? "var(--income)"
                                : "var(--foreground)",
                          }}
                        >
                          ₹
                          {row.amount.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}


        {/* ================================================= */}
        {/* AI STATUS */}
        {/* ================================================= */}

        <div
          className="rounded-lg p-3 mb-4"
          style={{
            background:
              "rgba(16,185,129,0.06)",

            border:
              "1px solid rgba(16,185,129,0.16)",
          }}
        >

          <div className="flex items-center gap-2">

            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background:
                  "rgba(16,185,129,0.12)",

                color:
                  "var(--primary)",
              }}
            >
              AI
            </div>

            <div>

              <p
                className="text-xs font-semibold"
                style={{
                  color:
                    "var(--foreground)",
                }}
              >
                Cashlytics Intelligence
              </p>

              <p
                className="text-[11px]"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                {statusMessage}
              </p>

            </div>

          </div>

          {/* Progress */}
          {processing && (
            <div className="mt-3">

              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{
                  background:
                    "var(--border)",
                }}
              >

                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width:
                      `${progress}%`,

                    background:
                      "var(--primary)",
                  }}
                />

              </div>

              <div className="flex justify-between mt-1">

                <span
                  className="text-[10px]"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  Analyzing transactions
                </span>

                <span
                  className="text-[10px]"
                  style={{
                    color:
                      "var(--primary)",
                  }}
                >
                  {progress}%
                </span>

              </div>

            </div>
          )}

        </div>


        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="flex gap-3">

          <button
            onClick={onCancel}
            disabled={
              processing
            }
            className="flex-1 px-4 py-2 rounded border text-sm font-medium"
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--foreground)",

              background:
                "var(--background)",

              opacity:
                processing
                  ? 0.5
                  : 1,
            }}
          >
            Cancel
          </button>

          <button
            onClick={
              handleImport
            }
            disabled={
              loading ||
              !file ||
              preview.length === 0
            }
            className="flex-1 px-4 py-2 rounded text-sm font-medium"
            style={{
              background:
                "var(--primary)",

              color:
                "var(--primary-foreground)",

              opacity:
                loading ||
                  !file ||
                  preview.length === 0
                  ? 0.5
                  : 1,
            }}
          >
            {loading
              ? "Processing..."
              : "Analyze & Import"}
          </button>

        </div>

      </div>
    </div>
  );
}