

import { useEffect, useState } from "react";
import * as api from "../lib/api";

interface AddTransactionProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/*
 * ============================================================
 * CASHLYTICS CATEGORY NORMALIZATION
 * ============================================================
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

  Entertainment: "Entertainment",
  Shopping: "Shopping",
  Bills: "Bills",
  Education: "Education",
  Investment: "Investment",
  Financial: "Investment",

  Income: "Income",

  Transfer: "Transfer",
  Lifestyle: "Lifestyle",
  Electronics: "Electronics",
  Other: "Other",
};

/**
 * Convert an ML category into the category vocabulary
 * used by the Cashlytics backend.
 */
function normalizeCategory(category: string): string {
  const cleanedCategory = category.trim();

  return CATEGORY_MAP[cleanedCategory] || "Other";
}

export default function AddTransaction({
  onSuccess,
  onCancel,
}: AddTransactionProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /*
   * debit  = Expense
   * credit = Income
   */
  const [type, setType] = useState<"debit" | "credit">("debit");

  const [category, setCategory] = useState("");

  const [confidence, setConfidence] = useState<number | null>(null);

  const [predicting, setPredicting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [aiMessage, setAiMessage] = useState(
    "Enter a description and amount. Cashlytics will categorize it automatically."
  );

  /*
   * ============================================================
   * AUTOMATIC CATEGORY PREDICTION
   * ============================================================
   *
   * IMPORTANT:
   *
   * Expense:
   *   Send transaction to ML classifier.
   *
   * Income:
   *   Do NOT send transaction to expense classifier.
   *   Category is always "Income".
   */

  useEffect(() => {
    const cleanDescription = description.trim();
    const numericAmount = Number(amount);

    /*
     * Not enough information yet.
     */
    if (
      !cleanDescription ||
      !amount ||
      numericAmount <= 0
    ) {
      setCategory("");
      setConfidence(null);

      setAiMessage(
        "Enter a description and amount. Cashlytics will categorize it automatically."
      );

      return;
    }

    /*
     * ==========================================================
     * INCOME
     * ==========================================================
     *
     * Income is not classified by the expense ML model.
     */

    if (type === "credit") {
      setCategory("Income");
      setConfidence(null);
      setPredicting(false);

      setAiMessage(
        "Income transaction detected. Category set to Income automatically."
      );

      return;
    }

    /*
     * ==========================================================
     * EXPENSE ML CLASSIFICATION
     * ==========================================================
     */

    let cancelled = false;

    /*
     * Small debounce so ML is not called on every keystroke.
     */

    const timer = window.setTimeout(async () => {
      try {
        setPredicting(true);
        setError("");

        setAiMessage(
          "Cashlytics AI is analyzing this transaction..."
        );

        const prediction =
          await api.predictTransactionCategory(
            cleanDescription,
            numericAmount
          );

        if (cancelled) return;

        const normalizedCategory =
          normalizeCategory(prediction.category);

        /*
         * Safety:
         * An expense must never become Income.
         */

        const finalCategory =
          normalizedCategory === "Income"
            ? "Other"
            : normalizedCategory;

        setCategory(finalCategory);

        setConfidence(prediction.confidence);

        const confidencePercent =
          prediction.confidence <= 1
            ? prediction.confidence * 100
            : prediction.confidence;

        setAiMessage(
          `AI categorized this as ${finalCategory} with ${confidencePercent.toFixed(
            1
          )}% confidence.`
        );
      } catch (e) {
        if (cancelled) return;

        console.error(
          "Category prediction error:",
          e
        );

        setCategory("");
        setConfidence(null);

        setAiMessage(
          "Cashlytics could not categorize this transaction automatically."
        );
      } finally {
        if (!cancelled) {
          setPredicting(false);
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [description, amount, type]);

  /*
   * ============================================================
   * TRANSACTION TYPE CHANGE
   * ============================================================
   */

  const handleTypeChange = (
    newType: "debit" | "credit"
  ) => {
    setType(newType);
    setError("");
    setConfidence(null);

    if (newType === "credit") {
      /*
       * Income always has Income category.
       */
      setCategory("Income");

      setAiMessage(
        "Income transaction selected. Cashlytics will save it as Income."
      );
    } else {
      /*
       * Switching back to Expense allows ML
       * categorization again.
       */
      setCategory("");

      setAiMessage(
        "Expense selected. Cashlytics will categorize it automatically."
      );
    }
  };

  /*
   * ============================================================
   * ADD TRANSACTION
   * ============================================================
   */

  const handleSubmit = async () => {
    const cleanDescription = description.trim();
    const numericAmount = Number(amount);

    setError("");

    /*
     * Basic validation.
     */

    if (!cleanDescription) {
      setError(
        "Please enter a transaction description."
      );
      return;
    }

    if (
      !amount ||
      numericAmount <= 0
    ) {
      setError(
        "Please enter an amount greater than 0."
      );
      return;
    }

    if (!date) {
      setError(
        "Please select a date."
      );
      return;
    }

    setLoading(true);

    try {
      let finalCategory = category;

      /*
       * ==========================================================
       * INCOME
       * ==========================================================
       */

      if (type === "credit") {
        finalCategory = "Income";

        setCategory("Income");
        setConfidence(null);
      }

      /*
       * ==========================================================
       * EXPENSE
       * ==========================================================
       */

      else {
        /*
         * If ML prediction has not finished yet,
         * make one final prediction before saving.
         */

        if (!finalCategory) {
          setAiMessage(
            "Analyzing transaction before saving..."
          );

          const prediction =
            await api.predictTransactionCategory(
              cleanDescription,
              numericAmount
            );

          finalCategory =
            normalizeCategory(
              prediction.category
            );

          /*
           * An expense must never be Income.
           */

          if (finalCategory === "Income") {
            finalCategory = "Other";
          }

          setCategory(finalCategory);

          setConfidence(
            prediction.confidence
          );
        }

        finalCategory =
          normalizeCategory(
            finalCategory
          );

        /*
         * Final safety check.
         */

        if (finalCategory === "Income") {
          finalCategory = "Other";
        }
      }

      /*
       * ==========================================================
       * SEND TO BACKEND
       * ==========================================================
       *
       * debit  = expense
       * credit = income
       */

      await api.createTransaction({
        description: cleanDescription,

        amount: Math.abs(numericAmount),

        category: finalCategory,

        type,

        date,

        source: "Manual",
      });

      /*
       * ==========================================================
       * RESET FORM
       * ==========================================================
       */

      setDescription("");
      setAmount("");
      setCategory("");
      setConfidence(null);

      setDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      /*
       * Default back to Expense.
       */

      setType("debit");

      setAiMessage(
        "Transaction added successfully."
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Failed to add transaction.";

      console.error(
        "Transaction error:",
        errorMessage
      );

      setError(errorMessage);

      setAiMessage(
        "Something went wrong while saving the transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * CONFIDENCE DISPLAY
   * ============================================================
   */

  const confidencePercent =
    confidence !== null
      ? confidence <= 1
        ? confidence * 100
        : confidence
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{
          background:
            "var(--card)",

          border:
            "1px solid var(--border)",

          maxHeight:
            "90vh",

          overflowY:
            "auto",
        }}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-5">
          <h2
            className="text-lg font-bold"
            style={{
              color:
                "var(--foreground)",
            }}
          >
            Add Transaction
          </h2>

          <p
            className="text-xs mt-1"
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            Tell Cashlytics what happened.
            AI will understand and
            categorize it automatically.
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

        <div className="space-y-4">

          {/* ================================================= */}
          {/* DESCRIPTION */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              What was this transaction?
            </label>

            <input
              type="text"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="e.g. Uber to college"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor:
                  "var(--border)",

                color:
                  "var(--foreground)",

                background:
                  "var(--background)",
              }}
            />

            <p
              className="text-[11px] mt-1.5"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Write naturally, for example
              "Swiggy dinner", "Uber to college",
              or "electricity bill".
            </p>
          </div>

          {/* ================================================= */}
          {/* AMOUNT */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Amount (₹)
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="500"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor:
                  "var(--border)",

                color:
                  "var(--foreground)",

                background:
                  "var(--background)",
              }}
            />
          </div>

          {/* ================================================= */}
          {/* TRANSACTION TYPE */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Transaction Type
            </label>

            <div className="grid grid-cols-2 gap-2">

              {/* EXPENSE */}

              <button
                type="button"
                onClick={() =>
                  handleTypeChange("debit")
                }
                disabled={loading}
                className="px-3 py-2.5 rounded border text-sm font-medium transition-all"
                style={{
                  borderColor:
                    type === "debit"
                      ? "var(--expense)"
                      : "var(--border)",

                  background:
                    type === "debit"
                      ? "rgba(232, 93, 93, 0.08)"
                      : "var(--background)",

                  color:
                    "var(--foreground)",

                  opacity:
                    loading
                      ? 0.6
                      : 1,
                }}
              >
                Expense
              </button>

              {/* INCOME */}

              <button
                type="button"
                onClick={() =>
                  handleTypeChange("credit")
                }
                disabled={loading}
                className="px-3 py-2.5 rounded border text-sm font-medium transition-all"
                style={{
                  borderColor:
                    type === "credit"
                      ? "var(--primary)"
                      : "var(--border)",

                  background:
                    type === "credit"
                      ? "rgba(16, 185, 129, 0.08)"
                      : "var(--background)",

                  color:
                    "var(--foreground)",

                  opacity:
                    loading
                      ? 0.6
                      : 1,
                }}
              >
                Income
              </button>

            </div>

            <p
              className="text-[11px] mt-1.5"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              {type === "credit"
                ? "Income will be recorded as a credit and included in your income total."
                : "Expenses will be recorded as debits and categorized by Cashlytics AI."}
            </p>
          </div>

          {/* ================================================= */}
          {/* AI INTELLIGENCE */}
          {/* ================================================= */}

          <div
            className="rounded-lg p-4"
            style={{
              background:
                "rgba(16, 185, 129, 0.06)",

              border:
                "1px solid rgba(16, 185, 129, 0.18)",
            }}
          >
            <div className="flex items-center justify-between mb-2">

              <div className="flex items-center gap-2">

                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      "rgba(16, 185, 129, 0.12)",

                    color:
                      "var(--primary)",
                  }}
                >
                  AI
                </div>

                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      "var(--foreground)",
                  }}
                >
                  Cashlytics Intelligence
                </span>

              </div>

              {predicting && (
                <span
                  className="text-[11px]"
                  style={{
                    color:
                      "var(--primary)",
                  }}
                >
                  Analyzing...
                </span>
              )}

            </div>

            {category ? (
              <div>

                <div
                  className="text-xs mb-1"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  Detected category
                </div>

                <div className="flex items-center justify-between">

                  <span
                    className="font-semibold text-sm"
                    style={{
                      color:
                        "var(--foreground)",
                    }}
                  >
                    {category}
                  </span>

                  {confidencePercent !== null && (
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          "var(--primary)",
                      }}
                    >
                      {confidencePercent.toFixed(
                        1
                      )}
                      % confidence
                    </span>
                  )}

                </div>

                <p
                  className="text-[11px] mt-2"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  {aiMessage}
                </p>

              </div>
            ) : (
              <p
                className="text-xs"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                {aiMessage}
              </p>
            )}

          </div>

          {/* ================================================= */}
          {/* DATE */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor:
                  "var(--border)",

                color:
                  "var(--foreground)",

                background:
                  "var(--background)",
              }}
            />
          </div>

        </div>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="flex gap-3 mt-6">

          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded border text-sm font-medium"
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--foreground)",

              background:
                "var(--background)",

              opacity:
                loading
                  ? 0.6
                  : 1,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              predicting ||
              !description.trim() ||
              !amount
            }
            className="flex-1 px-4 py-2 rounded text-sm font-medium"
            style={{
              background:
                "var(--primary)",

              color:
                "var(--primary-foreground)",

              opacity:
                loading ||
                predicting ||
                !description.trim() ||
                !amount
                  ? 0.6
                  : 1,
            }}
          >
            {loading
              ? "Adding..."
              : predicting
              ? "Analyzing..."
              : "Add Transaction"}
          </button>

        </div>
      </div>
    </div>
  );
}