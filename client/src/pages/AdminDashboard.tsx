import React, { useState, useEffect, useCallback } from "react";
import type { Page } from "../App";
import * as api from "../lib/api";
import { useAuth } from "../lib/auth-context";

export default function AdminDashboard({ onNavigate }: { onNavigate?: (page: Page) => void }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "analytics" | "aiml">("overview");

  // State
  const [overview, setOverview] = useState<api.AdminOverviewData | null>(null);
  const [health, setHealth] = useState<api.AdminHealthData | null>(null);
  const [analytics, setAnalytics] = useState<api.AdminAnalyticsData | null>(null);
  const [aiml, setAiml] = useState<api.AdminAiMlData | null>(null);

  // User list state
  const [users, setUsers] = useState<api.AdminUserData[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Loading & error
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load primary admin data
  const loadData = useCallback(async (isRefresh = false) => {
    if (user?.role !== "admin") return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [ovRes, hlRes, anRes, aiRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminHealth(),
        api.getAdminAnalytics(),
        api.getAdminAiMl(),
      ]);

      if (ovRes.data) setOverview(ovRes.data);
      if (hlRes.data) setHealth(hlRes.data);
      if (anRes.data) setAnalytics(anRes.data);
      if (aiRes.data) setAiml(aiRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load admin metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Load users page
  const loadUsers = useCallback(async (page = 1, search = "", role = "") => {
    if (user?.role !== "admin") return;
    try {
      const res = await api.getAdminUsers({ page, limit: 10, search, role });
      if (res.data) {
        setUsers(res.data.users);
        setUsersPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error("Failed to load user list:", err);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers(1, debouncedSearch, roleFilter);
    }
  }, [debouncedSearch, roleFilter, loadUsers, user]);

  // Access Control Guard
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#f87171",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Access Denied (403)</h2>
        <p className="max-w-md text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
          You do not have administrative privileges to view this portal. Access is strictly restricted to provisioned system administrators.
        </p>
        <button
          onClick={() => onNavigate && onNavigate("overview")}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer"
          style={{
            background: "var(--primary)",
            color: "#ffffff",
          }}
        >
          Return to User Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded tracking-wider uppercase"
              style={{
                background: "rgba(30, 107, 55, 0.12)",
                color: "var(--primary)",
                border: "1px solid rgba(30, 107, 55, 0.25)",
              }}
            >
              Control Plane
            </span>
            <span className="text-xs text-[var(--muted-foreground)] font-mono">v2.0</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mt-1">Admin Panel</h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">
            Real-time platform metrics, user registry, AI telemetry, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              loadData(true);
              loadUsers(usersPagination.page, debouncedSearch, roleFilter);
            }}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors shadow-xs"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border)]">
        {[
          { id: "overview", label: "Platform Overview & Health" },
          { id: "users", label: `User Registry (${overview?.totalUsers ?? 0})` },
          { id: "analytics", label: "Usage & Categories" },
          { id: "aiml", label: "AI & ML Intelligence" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state banner */}
      {error && (
        <div
          className="p-4 rounded-xl flex items-center justify-between text-sm bg-rose-50 border border-rose-200 text-rose-800"
        >
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="px-3 py-1 bg-rose-100 text-rose-900 rounded text-xs font-semibold hover:bg-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & HEALTH */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-5 rounded-xl relative overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Registered Users</div>
              <div className="text-3xl font-bold font-mono text-[var(--foreground)] mt-2">
                {loading ? "..." : overview?.totalUsers.toLocaleString() ?? 0}
              </div>
              <div className="text-xs text-[var(--primary)] font-medium mt-2 flex items-center gap-1">
                <span>Verified accounts</span>
              </div>
            </div>

            <div
              className="p-5 rounded-xl relative overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Active Users (30d)</div>
              <div className="text-3xl font-bold font-mono text-[var(--foreground)] mt-2">
                {loading ? "..." : overview?.activeUsers.toLocaleString() ?? 0}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-2">With transaction or AI activity</div>
            </div>

            <div
              className="p-5 rounded-xl relative overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Total Transactions</div>
              <div className="text-3xl font-bold font-mono text-[var(--foreground)] mt-2">
                {loading ? "..." : overview?.totalTransactions.toLocaleString() ?? 0}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-2">Recorded ledger entries</div>
            </div>

            <div
              className="p-5 rounded-xl relative overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Assistant Prompts</div>
              <div className="text-3xl font-bold font-mono text-[var(--foreground)] mt-2">
                {loading ? "..." : overview?.totalAssistantRequests.toLocaleString() ?? 0}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-2">Natural language inquiries</div>
            </div>
          </div>

          {/* System Health Section */}
          <div
            className="p-6 rounded-xl space-y-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                System Connectivity & Service Status
              </h2>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">
                Last checked: {health?.backend.timestamp ? new Date(health.backend.timestamp).toLocaleTimeString() : "--"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Backend Service */}
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--foreground)]">Express API (server)</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                      health?.backend.status === "healthy"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {health?.backend.status?.toUpperCase() ?? "CHECKING"}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                  <div>Uptime: {health ? `${Math.floor(health.backend.uptimeSeconds / 60)} min` : "--"}</div>
                  <div>Heap Memory: {health ? `${health.backend.memoryHeapMb} MB` : "--"}</div>
                  <div>Node: {health?.backend.nodeVersion ?? "--"}</div>
                </div>
              </div>

              {/* Database */}
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--foreground)]">MongoDB Connectivity</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                      health?.database.status === "connected"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {health?.database.status?.toUpperCase() ?? "CHECKING"}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                  <div>Connection State: {health?.database.connectionState === 1 ? "Connected (1)" : "Disconnected"}</div>
                  <div>Status: Primary cluster online</div>
                </div>
              </div>

              {/* ML FastAPI Service */}
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--foreground)]">FastAPI ML Service</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                      health?.mlService.status === "healthy"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : health?.mlService.status === "degraded"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {health?.mlService.status?.toUpperCase() ?? "CHECKING"}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                  <div>Latency: {health?.mlService.latencyMs !== null ? `${health?.mlService.latencyMs} ms` : "Unreachable"}</div>
                  <div className="truncate">URL: {health?.mlService.url ?? "--"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER REGISTRY */}
      {activeTab === "users" && (
        <div
          className="p-6 rounded-xl space-y-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
              <svg
                className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-2.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--secondary)] text-[var(--muted-foreground)] uppercase tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Auth Method</th>
                  <th className="py-3 px-4">Onboarding</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--secondary)]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--foreground)]">{u.name || "Nameless"}</div>
                        <div className="text-[var(--muted-foreground)] font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {u.authProviders.join(", ") || "email"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            u.onboardingCompleted ? "bg-[var(--income)]" : "bg-[var(--warning)]"
                          }`}
                        />
                        {u.onboardingCompleted ? "Completed" : "Pending"}
                      </td>
                      <td className="py-3 px-4 text-[var(--muted-foreground)] font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-2">
            <div>
              Showing {users.length} of {usersPagination.total} registered users
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={usersPagination.page <= 1}
                onClick={() => loadUsers(usersPagination.page - 1, debouncedSearch, roleFilter)}
                className="px-3 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
              >
                Previous
              </button>
              <span className="font-mono px-2">
                {usersPagination.page} / {usersPagination.totalPages}
              </span>
              <button
                disabled={usersPagination.page >= usersPagination.totalPages}
                onClick={() => loadUsers(usersPagination.page + 1, debouncedSearch, roleFilter)}
                className="px-3 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & FEATURES */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Feature Adoption Cards */}
          <div
            className="p-6 rounded-xl space-y-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-base font-semibold text-[var(--foreground)]">Platform Feature Adoption</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)]">Ledger Entries</div>
                <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">
                  {analytics?.featureUsage.transactionsCount ?? 0}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)]">Active Budgets</div>
                <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">
                  {analytics?.featureUsage.budgetsCount ?? 0}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)]">Savings Goals</div>
                <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">
                  {analytics?.featureUsage.goalsCount ?? 0}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)]">Smart Captures</div>
                <div className="text-xl font-bold font-mono text-[var(--primary)] mt-1">
                  {analytics?.featureUsage.smartCaptureCount ?? 0}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)]">AI Dialogues</div>
                <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">
                  {analytics?.featureUsage.assistantMessagesCount ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div
            className="p-6 rounded-xl space-y-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--foreground)]">Transaction Category Distribution</h2>
              <span className="text-xs text-[var(--muted-foreground)]">Aggregated from MongoDB transactions</span>
            </div>

            {analytics?.categoryDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">No transactions recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {analytics?.categoryDistribution.map((c) => (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--foreground)] font-medium">{c.category}</span>
                      <span className="font-mono text-[var(--muted-foreground)]">
                        {c.count} transactions ({c.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--secondary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[var(--primary)]"
                        style={{
                          width: `${Math.max(2, c.percentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AI & ML MONITORING */}
      {activeTab === "aiml" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assistant Providers Breakdown */}
            <div
              className="p-6 rounded-xl space-y-4"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <h2 className="text-base font-semibold text-[var(--foreground)]">Assistant Generation Engine Usage</h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg">
                  <div className="text-xs text-[var(--muted-foreground)]">Total Replies</div>
                  <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">
                    {aiml?.assistant.totalReplies ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg">
                  <div className="text-xs text-[var(--muted-foreground)]">Fallback Count</div>
                  <div className="text-xl font-bold font-mono text-[var(--warning)] mt-1">
                    {aiml?.assistant.fallbackCount ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg">
                  <div className="text-xs text-[var(--muted-foreground)]">Fallback Rate</div>
                  <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">
                    {aiml?.assistant.fallbackRate ?? 0}%
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
                  Provider Breakdown
                </div>
                {aiml?.assistant.providerUsage.length === 0 ? (
                  <div className="text-xs text-[var(--muted-foreground)] py-2">No assistant replies recorded yet.</div>
                ) : (
                  aiml?.assistant.providerUsage.map((p) => (
                    <div
                      key={p.provider}
                      className="flex items-center justify-between p-2.5 rounded bg-[var(--secondary)] border border-[var(--border)] text-xs"
                    >
                      <span className="font-mono text-[var(--primary)] font-semibold capitalize">{p.provider}</span>
                      <span className="font-mono text-[var(--foreground)] font-semibold">{p.count} responses</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Categorization Activity */}
            <div
              className="p-6 rounded-xl space-y-4"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <h2 className="text-base font-semibold text-[var(--foreground)]">Transaction Intelligence Activity</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg">
                  <div className="text-xs text-[var(--muted-foreground)]">Total Processed</div>
                  <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">
                    {aiml?.categorization.totalCategorized ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg">
                  <div className="text-xs text-[var(--muted-foreground)]">Avg Confidence</div>
                  <div className="text-xl font-bold font-mono text-[var(--primary)] mt-1">
                    {aiml?.categorization.averageConfidencePercent !== null
                      ? `${aiml?.categorization.averageConfidencePercent}%`
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
                  Ingestion Source Distribution
                </div>
                {aiml?.categorization.bySource.map((s) => (
                  <div
                    key={s.source}
                    className="flex items-center justify-between p-2.5 rounded bg-[var(--secondary)] border border-[var(--border)] text-xs"
                  >
                    <span className="text-[var(--foreground)] font-medium">{s.source}</span>
                    <span className="font-mono text-[var(--muted-foreground)]">{s.count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry Notice (Production-Conscious Metric Reporting) */}
          <div
            className="p-5 rounded-xl border border-amber-200 bg-amber-50/80 text-xs text-amber-900 space-y-2"
          >
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              ML Telemetry Status & Unsampled Metrics
            </div>
            {aiml?.unavailableMetrics.map((un, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-medium text-amber-950">{un.metric}: <span className="text-[var(--warning)] font-mono font-semibold">Unavailable</span></div>
                <p className="text-amber-800/80 leading-relaxed">{un.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
