/**
 * Integration Test Suite
 * Validates all frontend-backend-ml connections work correctly
 */

import * as api from "./api";

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export interface IntegrationTestReport {
  timestamp: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  overallStatus: "passed" | "failed" | "partial";
}

class IntegrationTester {
  private results: TestResult[] = [];

  async runTest(name: string, fn: () => Promise<void>): Promise<void> {
    const start = performance.now();
    let passed = true;
    let error: string | undefined;

    try {
      await fn();
    } catch (err) {
      passed = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const duration = performance.now() - start;
    this.results.push({ name, passed, duration, error });
  }

  async testHealthChecks(): Promise<void> {
    console.log("\n--- Testing Health Checks ---");

    await this.runTest("Backend Health Check", async () => {
      const health = await api.checkBackendHealth();
      if (!health.success) throw new Error("Backend unhealthy");
    });

    await this.runTest("ML Health Check", async () => {
      const health = await api.checkMLHealth();
      if (health.status !== "healthy") throw new Error("ML unhealthy");
    });
  }

  async testAuthFlow(): Promise<void> {
    console.log("\n--- Testing Auth Flow ---");

    await this.runTest("Request OTP", async () => {
      const response = await api.requestOtp("test@example.com");
      if (!response.success) throw new Error("OTP request failed");
    });

    // Note: Can't test full auth without real OTP, so we just verify the endpoint exists
  }

  async testTransactions(): Promise<void> {
    console.log("\n--- Testing Transactions ---");

    await this.runTest("List Transactions", async () => {
      const response = await api.listTransactions({ limit: 10 });
      if (!response.success) throw new Error("List failed");
    });

    await this.runTest("Get Transaction", async () => {
      const listResponse = await api.listTransactions({ limit: 1 });
      if (
        !listResponse.success ||
        !listResponse.data ||
        !listResponse.data.items ||
        listResponse.data.items.length === 0
      ) {
        throw new Error("No transactions to test");
      }

      const tx = listResponse.data.items[0];
      const getResponse = await api.getTransaction((tx as any)._id || (tx as any).id);
      if (!getResponse.success) throw new Error("Get failed");
    });
  }

  async testBudgets(): Promise<void> {
    console.log("\n--- Testing Budgets ---");

    await this.runTest("List Budgets", async () => {
      const response = await api.listBudgets();
      if (!response.success) throw new Error("List failed");
    });

    await this.runTest("Create Budget", async () => {
      const response = await api.createBudget({
        category: "Food",
        amount: 5000,
      });
      if (!response.success) throw new Error("Create failed");

      // Clean up
      if ((response.data as any)?.id) {
        await api.deleteBudget((response.data as any).id).catch(() => {});
      }
    });
  }

  async testGoals(): Promise<void> {
    console.log("\n--- Testing Goals ---");

    await this.runTest("List Goals", async () => {
      const response = await api.listGoals();
      if (!response.success) throw new Error("List failed");
    });

    await this.runTest("Create Goal", async () => {
      const response = await api.createGoal({
        name: "Test Goal",
        target: 10000,
      });
      if (!response.success) throw new Error("Create failed");

      // Clean up
      if ((response.data as any)?.id) {
        await api.deleteGoal((response.data as any).id).catch(() => {});
      }
    });
  }

  async testProfile(): Promise<void> {
    console.log("\n--- Testing Profile ---");

    await this.runTest("Get Profile", async () => {
      const response = await api.getProfile();
      if (!response.success) throw new Error("Get failed");
    });

    await this.runTest("Update Profile", async () => {
      const response = await api.updateProfile({
        monthlyIncome: 5000,
        averageMonthlyExpenses: 3000,
        desiredMonthlySavings: 2000,
        spendingStyle: "moderate",
        priorities: ["saving"],
      });
      if (!response.success) throw new Error("Update failed");
    });
  }

  async testIntelligence(): Promise<void> {
    console.log("\n--- Testing Intelligence ---");

    await this.runTest("Get Dashboard Intelligence", async () => {
      const response = await api.getDashboardIntelligence();
      if (!response.success) throw new Error("Dashboard failed");
    });

    await this.runTest("Get Financial Snapshot", async () => {
      const response = await api.getFinancialSnapshot();
      if (!response.success) throw new Error("Snapshot failed");
    });

    await this.runTest("Get Anomalies", async () => {
      const response = await api.getAnomalies();
      if (!response.success) throw new Error("Anomalies failed");
    });

    await this.runTest("Get Trends", async () => {
      const response = await api.getTrends();
      if (!response.success) throw new Error("Trends failed");
    });

    await this.runTest("Get Learning", async () => {
      const response = await api.getLearning();
      if (!response.success) throw new Error("Learning failed");
    });

    await this.runTest("Get Forecast", async () => {
      const response = await api.getForecast();
      if (!response.success) throw new Error("Forecast failed");
    });
  }

  async testMLServices(): Promise<void> {
    console.log("\n--- Testing ML Services ---");

    await this.runTest("Predict Category", async () => {
      const response = await api.predictTransactionCategory(
        "Coffee at Starbucks", 0
      );
      if (!response.category) throw new Error("Prediction failed");
    });

    await this.runTest("Detect Anomaly", async () => {
      const response = await api.detectTransactionAnomaly({
        amount: 100,
        category: "Food",
        transaction_hour: 12,
        day_of_week: 3,
        is_weekend: 0,
        merchant_frequency: 5,
        user_avg_category_spend: 50,
      });
      if (typeof response.is_anomaly !== "boolean")
        throw new Error("Anomaly detection failed");
    });

    await this.runTest("Forecast Spending", async () => {
      const response = await api.forecastSpending({
        current_spending: 1000,
        days_available: 15,
        days_in_month: 30,
        recent_7_day_average: 200,
        weekday_average: 180,
        weekend_average: 220,
        historical_daily_average: 200,
      });
      if (typeof response.forecast !== "number")
        throw new Error("Forecast failed");
    });
  }

  async testAssistant(): Promise<void> {
    console.log("\n--- Testing AI Assistant ---");

    await this.runTest("Ask Assistant", async () => {
      const response = await api.askAssistant("What are my spending trends?");
      if (!response.success) throw new Error("Assistant query failed");
    });

    await this.runTest("Get Assistant History", async () => {
      const response = await api.getAssistantHistory();
      if (!response.success) throw new Error("History retrieval failed");
    });
  }

  getReport(): IntegrationTestReport {
    const passedTests = this.results.filter((r) => r.passed).length;
    const failedTests = this.results.filter((r) => !r.passed).length;

    return {
      timestamp: new Date(),
      totalTests: this.results.length,
      passedTests,
      failedTests,
      results: this.results,
      overallStatus:
        failedTests === 0
          ? "passed"
          : failedTests > this.results.length / 2
            ? "failed"
            : "partial",
    };
  }

  printReport(report: IntegrationTestReport): void {
    console.log("\n========== INTEGRATION TEST REPORT ==========");
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(
      `Results: ${report.passedTests}/${report.totalTests} passed\n`
    );

    // Print passed tests
    const passed = report.results.filter((r) => r.passed);
    if (passed.length > 0) {
      console.log("✅ PASSED:");
      passed.forEach((r) => {
        console.log(`   ${r.name} (${r.duration.toFixed(2)}ms)`);
      });
    }

    // Print failed tests
    const failed = report.results.filter((r) => !r.passed);
    if (failed.length > 0) {
      console.log("\n❌ FAILED:");
      failed.forEach((r) => {
        console.log(`   ${r.name}`);
        console.log(`   Error: ${r.error}`);
      });
    }

    console.log("\n===========================================\n");
  }
}

export async function runIntegrationTests(): Promise<IntegrationTestReport> {
  const tester = new IntegrationTester();

  console.log("🚀 Starting Integration Tests...\n");

  // Run all test suites
  await tester.testHealthChecks();
  // Note: Skipping auth flow as it requires real OTP
  // await tester.testAuthFlow();
  await tester.testTransactions();
  await tester.testBudgets();
  await tester.testGoals();
  await tester.testProfile();
  await tester.testIntelligence();
  await tester.testMLServices();
  // Note: Only test assistant if authenticated
  // await tester.testAssistant();

  const report = tester.getReport();
  tester.printReport(report);

  return report;
}

// Export tester for custom tests
export { IntegrationTester };
