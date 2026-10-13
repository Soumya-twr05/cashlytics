const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Spending Analytics
router.get('/spending/monthly', ctrl.getMonthlySpending);
router.get('/spending/weekly', ctrl.getWeeklySpending);
router.get('/spending/yearly', ctrl.getYearlySpending);
router.get('/spending/category-trends', ctrl.getCategoryTrends);
router.get('/spending/patterns', ctrl.getSpendingPatterns);

// Goal Analytics
router.get('/goals/progress', ctrl.getGoalProgress);
router.get('/goals/recommendations', ctrl.getGoalRecommendations);
router.post('/goals/simulate', ctrl.simulateGoalProgress);

// Budget Analytics
router.get('/budget/performance', ctrl.getBudgetPerformance);
router.get('/budget/alerts', ctrl.getBudgetAlerts);
router.get('/budget/recommendations', ctrl.getBudgetRecommendations);

// Financial Health
router.get('/health/score', ctrl.getHealthScore);
router.get('/health/factors', ctrl.getHealthFactors);
router.get('/health/improvement-tips', ctrl.getImprovementTips);

// Insights & Predictions
router.get('/insights/cashflow', ctrl.getCashflowInsights);
router.get('/insights/savings-potential', ctrl.getSavingsPotential);
router.get('/insights/expense-optimization', ctrl.getExpenseOptimization);

// Comparative Analytics
router.get('/compare/previous-month', ctrl.comparePreviousMonth);
router.get('/compare/year-over-year', ctrl.compareYearOverYear);
router.get('/compare/peer-benchmarks', ctrl.getPeerBenchmarks);

module.exports = router;
