import { useEffect, useMemo, useState } from "react";
import * as api from "../lib/api";

const PIPELINE_STAGES = [
  "Detected",
  "Understanding",
  "Categorizing",
  "Duplicate check",
  "Ready",
];

type Transaction = {
  _id: string;
  merchant?: string;
  amount: number;
  type?: "debit" | "credit";
  category?: string;
  method?: string;
  source?: string;
  confidence?: number;
  verified?: boolean;
  confirmed?: boolean;
  stage?: string;
  occurredAt?: string;
};

export default function SmartCapture() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");

  // =========================
  // LOAD REAL TRANSACTIONS
  // =========================
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.listTransactions();

      // Backend response:
      // {
      //   success: true,
      //   data: {
      //     items: [...],
      //     pagination: {...}
      //   }
      // }

      const items = response?.data?.items ?? [];

      setTxns(items);
    } catch (err) {
      console.error("Failed to load Smart Capture transactions:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // =========================
  // HELPERS
  // =========================

  const getConfidence = (confidence?: number) => {
    if (confidence === undefined || confidence === null) {
      return 0;
    }

    // Backend may contain either:
    // 0.90  -> 90%
    // 90    -> 90%
    if (confidence <= 1) {
      return Math.round(confidence * 100);
    }

    return Math.round(confidence);
  };

  const getStageNumber = (stage?: string) => {
    switch (stage) {
      case "detected":
        return 0;
      case "understanding":
        return 1;
      case "categorizing":
        return 2;
      case "duplicate_check":
        return 3;
      case "ready":
        return 4;
      default:
        return 4;
    }
  };

  const getInitials = (merchant?: string) => {
    if (!merchant) return "TX";

    const words = merchant.trim().split(/\s+/);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return merchant.slice(0, 2).toUpperCase();
  };

  const formatTime = (date?: string) => {
    if (!date) return "Unknown";

    const transactionDate = new Date(date);

    if (Number.isNaN(transactionDate.getTime())) {
      return "Unknown";
    }

    const diff = Date.now() - transactionDate.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return transactionDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const isConfirmed = (transaction: Transaction) => {
    return Boolean(
      transaction.confirmed ||
      transaction.verified
    );
  };

  // =========================
  // FILTER
  // =========================

  const filteredTransactions = useMemo(() => {
    if (sourceFilter === "All Sources") {
      return txns;
    }

    return txns.filter((transaction) => {
      const source = transaction.source || "";

      if (sourceFilter === "UPI Notification") {
        return source === "UPI Notification";
      }

      if (sourceFilter === "SMS") {
        return source === "SMS";
      }

      if (sourceFilter === "CSV Import") {
        return source === "CSV Import";
      }

      if (sourceFilter === "Manual") {
        return source === "Manual";
      }

      return true;
    });
  }, [txns, sourceFilter]);

  // =========================
  // STATS
  // =========================

  const processingCount = txns.filter(
    (transaction) =>
      getStageNumber(transaction.stage) < 4
  ).length;

  const pendingCount = txns.filter(
    (transaction) =>
      !isConfirmed(transaction) &&
      getStageNumber(transaction.stage) === 4
  ).length;

  const confirmedCount = txns.filter(
    (transaction) =>
      isConfirmed(transaction)
  ).length;

  // =========================
  // CONFIRM
  // =========================

  const confirmTransaction = async (id: string) => {
    try {
      // If your api.ts already has confirmTransaction,
      // this will update the real backend record.
      await api.confirmTransaction(id);

      setTxns((previous) =>
        previous.map((transaction) =>
          transaction._id === id
            ? {
                ...transaction,
                confirmed: true,
                verified: true,
              }
            : transaction
        )
      );
    } catch (err) {
      console.error("Failed to confirm transaction:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to confirm transaction"
      );
    }
  };

  // =========================
  // REFRESH
  // =========================

  const refreshTransactions = () => {
    loadTransactions();
  };

  return (
    <div
      className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] mx-auto"
    >
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-7">
        <div
          className="text-xs font-semibold tracking-widest mb-2"
          style={{
            color: "var(--primary)",
            fontSize: "10px",
            letterSpacing: "0.12em",
          }}
        >
          SMART CAPTURE / LIVE FEED
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1
              className="font-bold leading-tight mb-1.5"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                color: "var(--foreground)",
                letterSpacing: "-0.02em",
              }}
            >
              Captured today.
            </h1>

            <p
              className="text-sm"
              style={{
                color: "var(--muted-foreground)",
              }}
            >
              Transactions detected from your connected sources
              and processed through the Cashlytics intelligence pipeline.
            </p>
          </div>

          <button
            onClick={refreshTransactions}
            disabled={loading}
            className="text-xs px-4 py-2 rounded-md font-semibold self-start sm:self-auto"
            style={{
              background: "var(--primary)",
              color: "#fff",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div
          className="mb-5 p-4 rounded-lg border text-sm"
          style={{
            background: "rgba(239,68,68,0.06)",
            borderColor: "rgba(239,68,68,0.25)",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}

      {/* =========================
          STATS
      ========================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Detected",
            value: String(txns.length),
            color: "var(--foreground)",
          },
          {
            label: "Processing",
            value: String(processingCount),
            color: "#f59e0b",
          },
          {
            label: "Pending Review",
            value: String(pendingCount),
            color: "#06b6d4",
          },
          {
            label: "Confirmed",
            value: String(confirmedCount),
            color: "var(--primary)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="text-xs mb-2 font-semibold tracking-widest"
              style={{
                color: "var(--muted-foreground)",
                fontSize: "9px",
                letterSpacing: "0.12em",
              }}
            >
              {stat.label}
            </div>

            <div
              className="font-bold tabular-nums text-3xl"
              style={{
                fontFamily: "var(--font-jetbrains)",
                color: stat.color,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          PIPELINE
      ========================= */}

      <div
        className="p-6 rounded-xl border mb-6"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="text-xs font-semibold tracking-widest mb-4"
          style={{
            color: "var(--muted-foreground)",
            fontSize: "9px",
            letterSpacing: "0.14em",
          }}
        >
          INTELLIGENCE PIPELINE
        </div>

        <div className="flex items-center overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage, index) => (
            <div
              key={stage}
              className="flex items-center flex-1"
            >
              <div className="flex flex-col items-center flex-1">
                <div
                  className="flex items-center justify-center rounded-full text-xs font-semibold mb-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    background:
                      index < 4
                        ? "rgba(13,158,126,0.1)"
                        : "#f0f0ea",
                    border:
                      index < 4
                        ? "1px solid rgba(13,158,126,0.3)"
                        : "1px solid var(--border)",
                    color:
                      index < 4
                        ? "var(--primary)"
                        : "var(--muted-foreground)",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "11px",
                  }}
                >
                  {index < 4 ? "✓" : "○"}
                </div>

                <span
                  className="text-xs text-center"
                  style={{
                    color:
                      index < 4
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    fontSize: "10px",
                  }}
                >
                  {stage}
                </span>
              </div>

              {index < PIPELINE_STAGES.length - 1 && (
                <div
                  className="h-px flex-none"
                  style={{
                    width: "40px",
                    background:
                      index < 3
                        ? "var(--primary)"
                        : "var(--border)",
                    marginBottom: "20px",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* =========================
          SOURCE FILTERS
      ========================= */}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex gap-1.5 flex-1 overflow-x-auto pb-1">
          {[
            "All Sources",
            "UPI Notification",
            "SMS",
            "CSV Import",
            "Manual",
          ].map((source) => {
            const active = sourceFilter === source;

            return (
              <button
                key={source}
                onClick={() => setSourceFilter(source)}
                className="text-xs px-3 py-1.5 rounded-md shrink-0"
                style={{
                  background: active
                    ? "var(--sidebar)"
                    : "var(--card)",
                  color: active
                    ? "#fff"
                    : "var(--muted-foreground)",
                  border: `1px solid ${
                    active
                      ? "var(--sidebar)"
                      : "var(--border)"
                  }`,
                }}
              >
                {source}
              </button>
            );
          })}
        </div>

        <button
          className="text-xs px-4 py-2 rounded-md font-semibold"
          style={{
            background: "var(--primary)",
            color: "#fff",
          }}
        >
          + Manual Entry
        </button>
      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div
          className="rounded-xl border p-10 text-center"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          Loading your transactions...
        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}

      {!loading && filteredTransactions.length === 0 && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="text-3xl mb-3"
            style={{ color: "var(--primary)" }}
          >
            ◌
          </div>

          <h3
            className="font-semibold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            No transactions found
          </h3>

          <p
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Transactions captured through manual entry, CSV,
            SMS or other connected sources will appear here.
          </p>
        </div>
      )}

      {/* =========================
          TRANSACTIONS
      ========================= */}

      {!loading && filteredTransactions.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {filteredTransactions.map((transaction, index) => {
            const confidence = getConfidence(
              transaction.confidence
            );

            const stage = getStageNumber(
              transaction.stage
            );

            const confirmed = isConfirmed(transaction);

            const isIncome =
              transaction.type === "credit";

            return (
              <div
                key={transaction._id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4"
                style={{
                  borderBottom:
                    index <
                    filteredTransactions.length - 1
                      ? "1px solid var(--border)"
                      : "none",

                  background: confirmed
                    ? "rgba(13,158,126,0.02)"
                    : stage < 4
                    ? "rgba(245,158,11,0.02)"
                    : "transparent",
                }}
              >
                {/* INITIALS */}

                <div
                  className="flex items-center justify-center rounded-md shrink-0 text-xs font-semibold"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "#f0f0ea",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "11px",
                  }}
                >
                  {getInitials(transaction.merchant)}
                </div>

                {/* MERCHANT */}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="font-semibold text-sm truncate"
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      {transaction.merchant ||
                        "Unknown transaction"}
                    </span>

                    {confirmed && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background:
                            "rgba(13,158,126,0.1)",
                          color: "var(--primary)",
                          fontSize: "9px",
                        }}
                      >
                        ✓ Confirmed
                      </span>
                    )}

                    {!confirmed && stage < 4 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background:
                            "rgba(245,158,11,0.1)",
                          color: "#f59e0b",
                          fontSize: "9px",
                        }}
                      >
                        ◌ Processing
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2 text-xs flex-wrap"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <span>
                      {transaction.method || "Unknown"}
                    </span>

                    <span>·</span>

                    <span>
                      {transaction.source || "Unknown"}
                    </span>

                    <span>·</span>

                    <span>
                      {formatTime(transaction.occurredAt)}
                    </span>
                  </div>
                </div>

                {/* CATEGORY */}

                <div
                  className="text-xs px-3 py-1.5 rounded-md border"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    background: "var(--background)",
                  }}
                >
                  {transaction.category || "Other"}
                </div>

                {/* CONFIDENCE */}

                <div className="shrink-0 w-28">
                  <div
                    className="text-xs mb-1"
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: "9px",
                    }}
                  >
                    AI Confidence
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="relative rounded-full overflow-hidden"
                      style={{
                        width: "60px",
                        height: "4px",
                        background: "#f0f0ea",
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            confidence,
                            100
                          )}%`,
                          background:
                            confidence >= 90
                              ? "var(--primary)"
                              : "#f59e0b",
                        }}
                      />
                    </div>

                    <span
                      className="text-xs tabular-nums"
                      style={{
                        fontFamily:
                          "var(--font-jetbrains)",
                        color:
                          "var(--muted-foreground)",
                        fontSize: "10px",
                      }}
                    >
                      {confidence}%
                    </span>
                  </div>
                </div>

                {/* AMOUNT */}

                <div
                  className="font-bold tabular-nums shrink-0 text-right"
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    color: isIncome
                      ? "var(--primary)"
                      : "var(--foreground)",
                    fontSize: "15px",
                    minWidth: "90px",
                  }}
                >
                  {isIncome ? "+" : "-"}₹
                  {Math.abs(
                    transaction.amount || 0
                  ).toLocaleString("en-IN")}
                </div>

                {/* CONFIRM */}

                {!confirmed && stage === 4 && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        confirmTransaction(
                          transaction._id
                        )
                      }
                      className="text-xs px-3 py-1.5 rounded-md font-semibold"
                      style={{
                        background:
                          "rgba(13,158,126,0.1)",
                        color: "var(--primary)",
                        border:
                          "1px solid rgba(13,158,126,0.3)",
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}