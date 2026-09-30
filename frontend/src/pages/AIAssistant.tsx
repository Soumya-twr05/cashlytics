import { useState, useRef, useEffect } from "react";
import Logo from "../components/Logo";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  chart?: ChartData;
  insights?: string[];
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

const CANNED_RESPONSES: Record<string, Message> = {
  "why did my expenses increase": {
    id: 0,
    role: "assistant",
    content:
      "Your expenses increased by ₹4,420 (8.9%) compared to last month. The primary drivers are:\n\n**Shopping** jumped from ₹5,000 to ₹6,800 — an Amazon Electronics purchase of ₹8,500 accounts for most of this. This was flagged as an anomaly (2.4× your normal category baseline).\n\n**Food & Dining** also rose from ₹7,200 to ₹8,420 — your weekend dining frequency increased significantly over the past 3 weeks.\n\nAll other categories are within normal range.",
    insights: [
      "Shopping: +₹1,800 (one Amazon purchase)",
      "Food: +₹1,220 (weekend pattern shift)",
      "Transport: +₹140 (within normal)",
    ],
    chart: {
      type: "bar",
      title: "Category change vs last month",
      data: [
        { label: "Food", value: 1220, color: "#f59e0b" },
        { label: "Shopping", value: 1800, color: "#f87171" },
        { label: "Transport", value: 140, color: "#22d3ee" },
        { label: "Entertainment", value: -650, color: "#10b981" },
        { label: "Bills", value: -300, color: "#10b981" },
      ],
    },
    time: "",
  },
  "where am i overspending": {
    id: 0,
    role: "assistant",
    content:
      "You're meaningfully over your targets in two categories:\n\n**Shopping** — You've spent ₹6,800 against a ₹4,000 budget (170%). This is driven by a single large Electronics purchase.\n\n**Food & Dining** — ₹8,420 against a ₹10,000 budget (84%) is technically within range, but at your current daily pace of ₹560/day, you'll exhaust this budget in approximately 2 days.\n\nAll other categories are tracking within their budgets.",
    insights: [
      "Shopping budget exceeded: −₹2,800",
      "Food budget pace: 2 days remaining",
      "Transport + Entertainment: safe",
    ],
    chart: {
      type: "bar",
      title: "Budget utilization (%)",
      data: [
        { label: "Shopping", value: 170, color: "#f87171" },
        { label: "Food", value: 84, color: "#f59e0b" },
        { label: "Bills", value: 84, color: "#818cf8" },
        { label: "Transport", value: 65, color: "#22d3ee" },
        { label: "Health", value: 46, color: "#10b981" },
      ],
    },
    time: "",
  },
  "can i save": {
    id: 0,
    role: "assistant",
    content:
      "Yes — with some targeted adjustments, saving an extra ₹10,000 this month is achievable.\n\nYour current projected savings for September is ₹17,840. To reach ₹27,840, you'd need to reduce spending by ₹10,000 across the remaining 21 days of the month.\n\nMy recommendation: pause non-essential Shopping (you've already exceeded your budget there) and reduce Food & Dining frequency on weekends. This alone could recover ₹6,000–₹8,000. A conservative reduction in Entertainment covers the rest.",
    insights: [
      "Current projected savings: ₹17,840",
      "Target: ₹27,840 (+₹10,000)",
      "Easiest lever: Shopping pause (₹4,000+)",
    ],
    chart: {
      type: "bar",
      title: "Potential savings by category",
      data: [
        { label: "Shopping", value: 4000, color: "#10b981" },
        { label: "Food/Weekend", value: 3500, color: "#10b981" },
        { label: "Entertainment", value: 1500, color: "#10b981" },
        { label: "Transport", value: 1000, color: "#22d3ee" },
      ],
    },
    time: "",
  },
};

function MiniBarChart({ data, title }: { data: ChartData["data"]; title: string }) {
  const max = Math.max(...data.map((d) => Math.abs(d.value)));
  return (
    <div
      className="mt-3 p-3 rounded-sm border"
      style={{ background: "var(--secondary)", borderColor: "var(--border)" }}
    >
      <div className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>{title}</div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span
              className="text-xs shrink-0"
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

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Logo size={28} className="mt-1" rounded="rounded-md" />
      )}
      <div style={{ maxWidth: "75%" }}>
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
        {message.insights && (
          <div className="mt-2 space-y-1">
            {message.insights.map((ins, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-sm"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", color: "var(--muted-foreground)" }}
              >
                <span style={{ color: "var(--primary)" }}>◎</span>
                {ins}
              </div>
            ))}
          </div>
        )}
        <div
          className="text-xs mt-1"
          style={{ color: "var(--muted-foreground)", fontSize: "10px", textAlign: isUser ? "right" : "left" }}
        >
          {message.time}
        </div>
      </div>
      {isUser && (
        <div
          className="flex items-center justify-center rounded-full shrink-0 self-start mt-1 text-xs font-bold"
          style={{ width: "28px", height: "28px", background: "rgba(16,185,129,0.15)", color: "var(--primary)" }}
        >
          A
        </div>
      )}
    </div>
  );
}

let msgId = 100;

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi Arjun. I'm your Cashlytics financial assistant. I have full context of your transactions, budgets, spending patterns, and goals. What would you like to understand about your finances today?",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getResponse = (query: string): Message => {
    const q = query.toLowerCase();
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    for (const [key, response] of Object.entries(CANNED_RESPONSES)) {
      if (q.includes(key)) {
        return { ...response, id: ++msgId, time: now };
      }
    }

    return {
      id: ++msgId,
      role: "assistant",
      content: `Based on your September 2026 data:\n\nYour current balance is ₹2,14,360 across all accounts. You've spent ₹53,720 this month against ₹85,000 income, leaving ₹17,840 in net savings (21% savings rate).\n\nTwo areas need your attention: Shopping has exceeded budget by ₹2,800, and Food & Dining is tracking 2 days ahead of budget exhaustion.\n\nIs there a specific aspect you'd like me to dig deeper into?`,
      time: now,
      insights: [
        "Balance: ₹2,14,360",
        "Savings rate: 21% this month",
        "2 budgets need attention",
      ],
    };
  };

  const handleSend = (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: ++msgId, role: "user", content: q, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, getResponse(q)]);
      setLoading(false);
    }, 1200 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--background)" }}>
      {/* Suggestions bar */}
      <div
        className="px-6 py-3 border-b overflow-x-auto"
        style={{ borderColor: "var(--border)", background: "#0a0d12" }}
      >
        <div className="flex gap-2 text-xs" style={{ whiteSpace: "nowrap" }}>
          <span className="shrink-0" style={{ color: "var(--muted-foreground)" }}>Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="px-3 py-1.5 rounded-sm shrink-0"
              style={{
                background: "var(--secondary)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
                fontSize: "11px",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <Logo size={28} className="mt-1" rounded="rounded-md" />
            <div
              className="px-4 py-3 rounded-sm text-sm"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            >
              <span className="animate-pulse">Analyzing your financial data</span>
              <span className="animate-pulse" style={{ marginLeft: "2px" }}>...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-6 py-4 border-t"
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
            placeholder="Ask anything about your finances..."
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
            className="shrink-0 px-4 py-1.5 rounded-sm text-xs font-semibold"
            style={{
              background: input.trim() ? "var(--primary)" : "var(--muted)",
              color: input.trim() ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            Send
          </button>
        </div>
        <div className="text-xs mt-2 text-center" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>
          Cashlytics AI has access to your transaction history, budgets, and goals. Data stays private.
        </div>
      </div>
    </div>
  );
}
