import { useState, useRef, useEffect } from "react";
import Logo from "../components/Logo";
import * as api from "../lib/api";
import { useAuth } from "../lib/auth-context";

interface Message {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  chart?: ChartData;
  insights?: string[];
  suggestions?: string[];
  time: string;
}

interface ChartData {
  type: "bar" | "trend";
  title: string;
  data: { label: string; value: number; color?: string }[];
}

const SUGGESTIONS = [
  "Why did my expenses increase this month?",
  "Where am I overspending compared to last month?",
  "Can I save ₹10,000 extra this month?",
  "Which category should I cut back on?",
  "What changed compared to last month?",
  "How long until I reach my emergency fund goal?",
];

function MiniBarChart({ data, title }: { data: ChartData["data"]; title: string }) {
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  return (
    <div
      className="mt-3 p-3 rounded-sm border"
      style={{ background: "var(--secondary)", borderColor: "var(--border)" }}
    >
      <div className="text-xs mb-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{title}</div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span
              className="text-xs shrink-0 truncate"
              style={{ width: "80px", color: "var(--muted-foreground)", fontSize: "10px" }}
            >
              {d.label}
            </span>
            <div className="flex-1 relative h-4 flex items-center">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${(Math.abs(d.value) / max) * 100}%`,
                  background: d.color || (d.value >= 0 ? "var(--primary)" : "var(--expense)"),
                  opacity: 0.85,
                }}
              />
            </div>
            <span
              className="text-xs tabular-nums shrink-0"
              style={{
                fontFamily: "var(--font-jetbrains)",
                color: d.value >= 0 ? "var(--foreground)" : "var(--expense)",
                width: "60px",
                textAlign: "right",
                fontSize: "10px",
              }}
            >
              {d.value >= 0 ? "+" : ""}₹{Math.abs(d.value).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, userInitial }: { message: Message; userInitial: string }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Logo size={28} className="mt-1 shrink-0" rounded="rounded-md" />
      )}
      <div style={{ maxWidth: "80%" }}>
        <div
          className="px-4 py-3 rounded-sm text-sm leading-relaxed"
          style={{
            background: isUser ? "rgba(16,185,129,0.1)" : "var(--card)",
            border: `1px solid ${isUser ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
            color: "var(--foreground)",
            whiteSpace: "pre-wrap",
          }}
          dangerouslySetInnerHTML={{
            __html: message.content
              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--foreground)">$1</strong>')
              .replace(/\n/g, "<br/>"),
          }}
        />
        {message.chart && (
          <MiniBarChart data={message.chart.data} title={message.chart.title} />
        )}
        {message.insights && message.insights.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.insights.map((ins, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-sm"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "var(--muted-foreground)",
                }}
              >
                <span style={{ color: "var(--primary)" }}>◎</span>
                {ins}
              </div>
            ))}
          </div>
        )}
        <div
          className="text-xs mt-1"
          style={{
            color: "var(--muted-foreground)",
            fontSize: "10px",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {message.time}
        </div>
      </div>
      {isUser && (
        <div
          className="flex items-center justify-center rounded-full shrink-0 self-start mt-1 text-xs font-bold"
          style={{
            width: "28px",
            height: "28px",
            background: "rgba(16,185,129,0.18)",
            color: "var(--primary)",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          {userInitial}
        </div>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const userName = user?.name?.trim() || user?.email?.split("@")[0] || "there";
  const userInitial = (userName[0] || "U").toUpperCase();
  const userEmail = user?.email || "User";

  const storageKey = `cashlytics_chat_${user?.id || "guest"}`;

  const defaultGreeting: Message = {
    id: "welcome-1",
    role: "assistant",
    content: `Hi ${userName}. I'm your Cashlytics financial assistant. I have full context of your transactions, budgets, spending patterns, and goals. What would you like to understand about your finances today?`,
    time: "Just now",
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not read local chat cache", e);
    }
    return [defaultGreeting];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not save chat cache", e);
    }
  }, [messages, storageKey]);

  // Load from backend history on mount or when user changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [historyRes, snapRes] = await Promise.allSettled([
          api.getAssistantHistory(),
          api.getFinancialSnapshot(),
        ]);

        if (snapRes.status === "fulfilled" && snapRes.value?.data) {
          if (isMounted) setSnapshot(snapRes.value.data);
        }

        if (historyRes.status === "fulfilled" && historyRes.value?.data?.items) {
          const items = historyRes.value.data.items;
          if (Array.isArray(items) && items.length > 0) {
            const formatted: Message[] = items.map((item: any, idx: number) => ({
              id: item._id || idx,
              role: item.role,
              content: item.content,
              chart: item.chart || undefined,
              insights: item.insights || [],
              suggestions: item.suggestions || [],
              time: item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent",
            }));
            if (isMounted) setMessages(formatted);
          }
        }
      } catch (err) {
        console.warn("Could not fetch assistant history:", err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.askAssistant(q);

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          response.data?.reply ||
          "I couldn't generate a response right now. Please try again.",
        chart: (response.data as any)?.chart,
        insights: (response.data as any)?.insights || [],
        suggestions: (response.data as any)?.suggestions || [],
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Unable to connect to the Cashlytics AI assistant.",
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear your conversation history?")) return;
    setClearing(true);
    try {
      await api.clearAssistantHistory();
    } catch (e) {
      console.warn("Error clearing remote chat history", e);
    }
    localStorage.removeItem(storageKey);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Hi ${userName}. Conversation reset! What would you like to explore next about your finances?`,
        time: "Just now",
      },
    ]);
    setClearing(false);
  };

  // Extra Feature 1: Export as Text Note
  const handleExportTextNote = () => {
    const dateStr = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let content = `=================================================================\n`;
    content += `         CASHLYTICS FINANCIAL CONVERSATION & ADVISORY NOTE       \n`;
    content += `=================================================================\n\n`;
    content += `Client:       ${userName} (${userEmail})\n`;
    content += `Export Date:  ${dateStr}\n`;
    content += `Platform:     Cashlytics Financial Intelligence\n\n`;

    content += `-----------------------------------------------------------------\n`;
    content += `1. CURRENT MONTHLY FINANCIAL SUMMARY\n`;
    content += `-----------------------------------------------------------------\n`;
    if (snapshot) {
      content += `• Monthly Income:        ₹${Number(snapshot.income || 0).toLocaleString("en-IN")}\n`;
      content += `• Monthly Expenses:      ₹${Number(snapshot.expenses || 0).toLocaleString("en-IN")}\n`;
      content += `• Net Projected Savings: ₹${Number(snapshot.savings || 0).toLocaleString("en-IN")}\n`;
      content += `• Financial Health:      ${snapshot.score || 85}/100 (${snapshot.trajectory || "Stable"})\n\n`;
    } else {
      content += `Financial metrics synchronized with active profile & debit/credit records.\n\n`;
    }

    content += `-----------------------------------------------------------------\n`;
    content += `2. KEY SUGGESTIONS & FINANCIAL ACTION ITEMS\n`;
    content += `-----------------------------------------------------------------\n`;
    const insightsList: string[] = [];
    messages.forEach((m) => {
      if (m.insights && m.insights.length > 0) {
        insightsList.push(...m.insights);
      }
    });

    if (insightsList.length > 0) {
      Array.from(new Set(insightsList)).forEach((item) => {
        content += `• ${item}\n`;
      });
    } else {
      content += `• Monitor top discretionary spending categories weekly.\n`;
      content += `• Protect emergency fund targets before luxury allocations.\n`;
      content += `• Review recurring subscription bills for unneeded charges.\n`;
    }

    content += `\n-----------------------------------------------------------------\n`;
    content += `3. COMPLETE CONVERSATION TRANSCRIPT\n`;
    content += `-----------------------------------------------------------------\n\n`;

    messages.forEach((m) => {
      const speaker = m.role === "user" ? `${userName.toUpperCase()}` : "CASHLYTICS AI";
      content += `[${m.time || "Recent"}] ${speaker}:\n`;
      content += `${m.content}\n`;
      if (m.insights && m.insights.length > 0) {
        content += `\nInsights:\n`;
        m.insights.forEach((ins) => {
          content += `  - ${ins}\n`;
        });
      }
      content += `\n-----------------------------------------------------------------\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cashlytics_Financial_Note_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Extra Feature 2: Print or Save as PDF
  const handlePrintOrPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: "var(--background)" }}>
      {/* Header bar with controls */}
      <div
        className="px-6 py-3 border-b flex items-center justify-between gap-4"
        style={{ borderColor: "var(--border)", background: "#0a0d12" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            Financial Assistant for {userName}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "var(--primary)",
              fontSize: "10px",
            }}
          >
            Context Active
          </span>
        </div>

        {/* Action buttons: Export Text Note, Save as PDF, Clear Chat */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportTextNote}
            title="Download text note of financial suggestions & conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Text Note (.txt)
          </button>

          <button
            type="button"
            onClick={handlePrintOrPDF}
            title="Print or Save as PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: "rgba(16,185,129,0.12)",
              color: "var(--primary)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.12)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            disabled={clearing}
            title="Clear conversation history"
            className="px-2.5 py-1.5 rounded-sm text-xs transition-colors cursor-pointer"
            style={{
              background: "transparent",
              color: "var(--muted-foreground)",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted-foreground)";
            }}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Suggestions bar */}
      <div
        className="px-6 py-2.5 border-b overflow-x-auto"
        style={{ borderColor: "var(--border)", background: "#0a0d12" }}
      >
        <div className="flex gap-2 text-xs items-center" style={{ whiteSpace: "nowrap" }}>
          <span className="shrink-0 font-medium" style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
            Suggestions:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="px-3 py-1.5 rounded-sm shrink-0 transition-colors cursor-pointer"
              style={{
                background: "var(--secondary)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
                fontSize: "11px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--foreground)";
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted-foreground)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 print:p-0 print:space-y-4">
        {/* Printable report header (only visible in print / PDF mode) */}
        <div className="hidden print:block mb-6 p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-900">Cashlytics Financial Intelligence Report</h1>
          <p className="text-sm text-gray-600">Client: {userName} ({userEmail}) — {new Date().toLocaleDateString()}</p>
          {snapshot && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>Income: ₹{Number(snapshot.income || 0).toLocaleString("en-IN")}</div>
              <div>Expenses: ₹{Number(snapshot.expenses || 0).toLocaleString("en-IN")}</div>
              <div>Savings: ₹{Number(snapshot.savings || 0).toLocaleString("en-IN")}</div>
            </div>
          )}
        </div>

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} userInitial={userInitial} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <Logo size={28} className="mt-1" rounded="rounded-md" />
            <div
              className="px-4 py-3 rounded-sm text-sm"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--muted-foreground)",
              }}
            >
              <span className="animate-pulse">Analyzing financial data for {userName}</span>
              <span className="animate-pulse" style={{ marginLeft: "2px" }}>...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-6 py-4 border-t print:hidden"
        style={{ borderColor: "var(--border)", background: "#0a0d12" }}
      >
        <div
          className="flex gap-3 items-end rounded-sm border px-4 py-3"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <span style={{ color: "var(--ai-color)", fontSize: "14px", marginBottom: "1px" }}>✦</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask anything about your personal finances, ${userName}...`}
            rows={1}
            className="flex-1 resize-none text-sm outline-none"
            style={{
              background: "transparent",
              color: "var(--foreground)",
              lineHeight: "1.5",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="shrink-0 px-4 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition-opacity"
            style={{
              background: input.trim() ? "var(--primary)" : "var(--muted)",
              color: input.trim() ? "var(--primary-foreground)" : "var(--muted-foreground)",
              opacity: !input.trim() || loading ? 0.6 : 1,
            }}
          >
            Send
          </button>
        </div>
        <div className="text-xs mt-2 text-center" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>
          Cashlytics AI connects directly with your transaction ledger and monthly budgets. Conversations are stored securely for your profile.
        </div>
      </div>
    </div>
  );
}
