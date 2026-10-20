

import { useState, useEffect } from "react";
import AddTransaction from "./AddTransaction";
import ImportCSV from "./ImportCSV";
import * as api from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

interface Transaction {
  id?: string;
  _id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "debit" | "credit";
  verified?: boolean;
  confidence?: number;
}

const FILTER_TABS = [
  "All",
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Electronics",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Investment",
  "Lifestyle",
  "Other",
];

function ConfidenceBar({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));

  const color =
    safeValue >= 95
      ? "var(--income)"
      : safeValue >= 85
        ? "var(--warning)"
        : "var(--expense)";

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: "72px",
          height: "5px",
          background: "var(--secondary)",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${safeValue}%`,
            background: color,
          }}
        />
      </div>

      <span
        className="text-xs tabular-nums"
        style={{
          fontFamily: "var(--font-jetbrains)",
          color: "var(--muted-foreground)",
          fontSize: "11px",
          minWidth: "28px",
        }}
      >
        {Math.round(safeValue)}%
      </span>
    </div>
  );
}

function normalizeConfidence(value: unknown): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  // Backend normally stores confidence as 0–1.
  // Older records may contain 0–100.
  if (numericValue <= 1) {
    return Math.round(numericValue * 100);
  }

  return Math.min(100, Math.round(numericValue));
}

function normalizeCategory(category: string): string {
  if (!category) return "Other";

  const value = category.toLowerCase().trim();

  if (
    value === "food & dining" ||
    value === "food and dining" ||
    value === "food"
  ) {
    return "Food";
  }

  if (value === "groceries" || value === "grocery") {
    return "Groceries";
  }

  if (value === "transportation" || value === "transport") {
    return "Transport";
  }

  if (
    value === "shopping" ||
    value === "shopping & retail" ||
    value === "shopping and retail"
  ) {
    return "Shopping";
  }

  if (value === "electronics") {
    return "Electronics";
  }

  if (
    value === "entertainment" ||
    value === "entertainment & recreation" ||
    value === "entertainment and recreation"
  ) {
    return "Entertainment";
  }

  if (
    value === "healthcare" ||
    value === "health" ||
    value === "healthcare & medical" ||
    value === "healthcare and medical" ||
    value === "medical"
  ) {
    return "Healthcare";
  }

  if (
    value === "bills" ||
    value === "utilities" ||
    value === "bills & utilities" ||
    value === "bills and utilities" ||
    value === "rent & housing" ||
    value === "rent and housing" ||
    value === "rent" ||
    value === "housing" ||
    value === "government & legal" ||
    value === "government and legal"
  ) {
    return "Bills";
  }

  if (value === "education") {
    return "Education";
  }

  if (
    value === "investment" ||
    value === "financial services" ||
    value === "financial and investment" ||
    value === "financial"
  ) {
    return "Investment";
  }

  if (value === "lifestyle") {
    return "Lifestyle";
  }

  if (value === "income") {
    return "Income";
  }

  if (value === "transfer") {
    return "Transfer";
  }

  return "Other";
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = (await api.listTransactions({
        limit: 1000,
      })) as any;

      const items = response?.data?.items ?? [];
      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   data: {
       *     items: [...]
       *   }
       * }
       *
       * Therefore we must read:
       * response.data.items
       */

      if (!Array.isArray(items)) {
        console.error("Unexpected transaction response:", response);
        setTransactions([]);
        setError("Unexpected transaction data received.");
        return;
      }

      const mappedTransactions: Transaction[] = items.map(
        (item: any) => ({
          id: item._id,
          _id: item._id,

          // Backend calls this "merchant".
          // The UI calls it "description".
          description:
            item.description ||
            item.merchant ||
            "Unknown transaction",

          amount: Number(item.amount || 0),

          category: normalizeCategory(item.category),

          // Backend calls this "occurredAt".
          date:
            item.occurredAt ||
            item.date ||
            item.createdAt ||
            new Date().toISOString(),

          type:
            item.type === "credit"
              ? "credit"
              : "debit",

          verified: Boolean(item.verified),

          /*
           * Backend:
           *   0.9821
           *
           * UI:
           *   98%
           *
           * Old bad records can contain 100,
           * so normalizeConfidence handles both.
           */
          confidence: normalizeConfidence(item.confidence),
        })
      );

      setTransactions(mappedTransactions);
    } catch (e) {
      console.error("Error fetching transactions:", e);

      setTransactions([]);

      setError(
        e instanceof Error
          ? e.message
          : "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = async () => {
    setShowAddModal(false);

    // Reload the actual MongoDB data after adding.
    await fetchTransactions();
  };

  const handleImportSuccess = async () => {
    setShowImportModal(false);

    // Reload the actual MongoDB data after importing.
    await fetchTransactions();
  };

  const filtered = transactions.filter((transaction) => {
    const description =
      transaction.description?.toLowerCase() || "";

    const matchSearch =
      !search ||
      description.includes(search.toLowerCase());

    const normalizedTransactionCategory =
      normalizeCategory(transaction.category);

    const matchTab =
      activeTab === "All" ||
      normalizedTransactionCategory === activeTab;

    return matchSearch && matchTab;
  });

  if (loading) {
    return <LoadingScreen message="Loading transactions..." />;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <div
            className="text-xs font-semibold tracking-widest mb-2"
            style={{
              color: "var(--primary)",
              fontSize: "10px",
              letterSpacing: "0.12em",
            }}
          >
            TRANSACTIONS / WORKSPACE
          </div>

          <h1
            className="font-bold leading-tight mb-1.5"
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}
          >
            Manage Your Transactions
          </h1>

          <p
            className="text-sm"
            style={{
              color: "var(--muted-foreground)",
            }}
          >
            {transactions.length}{" "}
            {transactions.length === 1
              ? "transaction"
              : "transactions"}{" "}
            recorded
          </p>
        </div>

        <div className="flex items-center gap-2 sm:mt-6 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              background: "var(--card)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            Add Manually
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              background: "var(--card)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>

            Import CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm"
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#be123c",
          }}
        >
          {error}
        </div>
      )}

      {/* Search + filter tabs */}
      <div
        className="rounded-xl p-4 mb-1"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 px-3 py-2 rounded-md min-w-0"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              />
            </svg>

            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 text-sm outline-none bg-transparent"
              style={{
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded-md text-xs font-medium shrink-0"
                style={{
                  background:
                    activeTab === tab
                      ? "var(--sidebar)"
                      : "var(--background)",
                  color:
                    activeTab === tab
                      ? "#ffffff"
                      : "var(--muted-foreground)",
                  border:
                    activeTab === tab
                      ? "none"
                      : "1px solid var(--border)",
                  fontSize: "12px",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              color: "var(--muted-foreground)",
            }}
          >
            {transactions.length === 0
              ? "No transactions found"
              : "No transactions match your filter"}
          </p>

          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded text-sm font-medium"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Add your first transaction
          </button>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-x-auto"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="min-w-[760px]">
            {/* Header */}
            <div
              className="grid px-5 py-3 text-xs font-semibold tracking-widest"
              style={{
                gridTemplateColumns:
                  "2.5fr 1.5fr 1fr 1fr 1.2fr",
                color: "var(--muted-foreground)",
                borderBottom:
                  "1px solid var(--border)",
                fontSize: "9px",
                letterSpacing: "0.1em",
              }}
            >
              <span>DESCRIPTION</span>
              <span>CATEGORY</span>
              <span>AMOUNT</span>
              <span>DATE</span>
              <span>CONFIDENCE</span>
            </div>

            {/* Rows */}
            {filtered.map((transaction, index) => (
              <div
                key={
                  transaction._id ||
                  transaction.id ||
                  index
                }
                className="grid px-5 py-4 items-center"
                style={{
                  gridTemplateColumns:
                    "2.5fr 1.5fr 1fr 1fr 1.2fr",
                  borderBottom:
                    index < filtered.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                {/* Description */}
                <div
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--foreground)",
                  }}
                >
                  {transaction.description}
                </div>

                {/* Category */}
                <div
                  className="text-sm"
                  style={{
                    color: "var(--foreground)",
                  }}
                >
                  {transaction.category}
                </div>

                {/* Amount */}
                <div
                  className="text-sm font-semibold tabular-nums"
                  style={{
                    fontFamily:
                      "var(--font-jetbrains)",
                    color:
                      transaction.type === "credit"
                        ? "var(--primary)"
                        : "var(--foreground)",
                  }}
                >
                  {transaction.type === "credit"
                    ? "+"
                    : "-"}
                  ₹
                  {transaction.amount.toLocaleString(
                    "en-IN"
                  )}
                </div>

                {/* Date */}
                <div
                  className="text-sm"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  {transaction.date
                    ? new Date(
                        transaction.date
                      ).toLocaleDateString("en-IN")
                    : "—"}
                </div>

                {/* Confidence */}
                <ConfidenceBar
                  value={
                    transaction.confidence ?? 0
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddTransaction
          onSuccess={handleAddSuccess}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showImportModal && (
        <ImportCSV
          onSuccess={handleImportSuccess}
          onCancel={() =>
            setShowImportModal(false)
          }
        />
      )}
    </div>
  );
}