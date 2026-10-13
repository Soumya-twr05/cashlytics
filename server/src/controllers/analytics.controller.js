const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const { success, fail } = require('../utils/response');

// Helper: Get date ranges
const getDateRanges = () => {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentYear = new Date(now.getFullYear(), 0, 1);
  
  return {
    thisMonth: { 
      start: currentMonth, 
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0) 
    },
    lastMonth: { 
      start: lastMonth, 
      end: new Date(now.getFullYear(), now.getMonth(), 0) 
    },
    thisYear: { 
      start: currentYear, 
      end: new Date(now.getFullYear() + 1, 0, 0) 
    },
    last12Months: { 
      start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      end: now 
    }
  };
};

// Monthly Spending Analytics
exports.getMonthlySpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisMonth, lastMonth } = getDateRanges();
    
    const currentMonth = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: thisMonth.start, $lte: thisMonth.end },
          type: 'debit'
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const previousMonth = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: lastMonth.start, $lte: lastMonth.end },
          type: 'debit'
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const currentTotal = currentMonth.reduce((sum, cat) => sum + cat.totalAmount, 0);
    const previousTotal = previousMonth.reduce((sum, cat) => sum + cat.totalAmount, 0);
    const monthOverMonthChange = previousTotal ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    success(res, {
      currentMonth,
      previousMonth,
      totals: {
        current: currentTotal,
        previous: previousTotal,
        change: monthOverMonthChange
      },
      insights: {
        topCategory: currentMonth[0]?._id || 'No spending',
        avgDailySpend: currentTotal / new Date().getDate(),
        projectedMonthEnd: (currentTotal / new Date().getDate()) * 30
      }
    });
  } catch (error) {
    fail(res, 'Error getting monthly spending', error);
  }
};

// Weekly Spending Analytics
exports.getWeeklySpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000) },
          type: 'debit'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$occurredAt' },
            week: { $week: '$occurredAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: 12 }
    ]);

    const avgWeekly = weeklyData.length > 0 
      ? weeklyData.reduce((sum, week) => sum + week.totalAmount, 0) / weeklyData.length 
      : 0;

    success(res, {
      weeklyTrends: weeklyData,
      averageWeeklySpend: avgWeekly,
      currentWeekSpend: weeklyData[weeklyData.length - 1]?.totalAmount || 0
    });
  } catch (error) {
    fail(res, 'Error getting weekly spending', error);
  }
};

// Yearly Spending Analytics
exports.getYearlySpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisYear, last12Months } = getDateRanges();
    
    const yearlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: last12Months.start },
          type: 'debit'
        }
      },
      {
        $group: {
          _id: { $month: '$occurredAt' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalYearly = yearlyData.reduce((sum, month) => sum + month.totalAmount, 0);

    success(res, {
      monthlyBreakdown: yearlyData,
      totalYearly,
      averageMonthly: totalYearly / 12,
      highestMonth: yearlyData.sort((a, b) => b.totalAmount - a.totalAmount)[0]
    });
  } catch (error) {
    fail(res, 'Error getting yearly spending', error);
  }
};

// Category Trends
exports.getCategoryTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { last12Months } = getDateRanges();
    
    const trends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: last12Months.start },
          type: 'debit'
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            month: { $month: '$occurredAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    success(res, { categoryTrends: trends });
  } catch (error) {
    fail(res, 'Error getting category trends', error);
  }
};

// Spending Patterns
exports.getSpendingPatterns = async (req, res) => {
  try {
    const userId = req.user._id;
    const last3Months = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const dayPatterns = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'debit',
          occurredAt: { $gte: last3Months }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$occurredAt' },
          avgAmount: { $avg: '$amount' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const patternsWithLabels = dayPatterns.map(p => ({
      day: days[p._id - 1],
      ...p
    }));

    success(res, { 
      dayOfWeekPatterns: patternsWithLabels,
      highestSpendingDay: patternsWithLabels.sort((a, b) => b.totalAmount - a.totalAmount)[0]
    });
  } catch (error) {
    fail(res, 'Error getting spending patterns', error);
  }
};

// Goal Progress
exports.getGoalProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const goals = await Goal.find({ user: userId });
    
    const progressData = goals.map((goal) => {
      const saved = goal.current || 0;
      const progress = (saved / goal.target) * 100;
      const remaining = goal.target - saved;
      const monthlyContribution = goal.monthly || 0;
      const monthsToGoal = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null;
      const estimatedDate = monthsToGoal ? new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000) : null;

      return {
        ...goal.toObject(),
        progress: Math.min(progress, 100),
        saved,
        remaining: Math.max(remaining, 0),
        monthsToGoal,
        estimatedDate,
        onTrack: monthsToGoal && goal.deadline ? new Date(estimatedDate) <= new Date(goal.deadline) : true
      };
    });

    success(res, {
      goals: progressData,
      summary: {
        totalGoals: goals.length,
        completedGoals: progressData.filter(g => g.progress >= 100).length,
        onTrackGoals: progressData.filter(g => g.onTrack).length,
        totalTarget: goals.reduce((sum, g) => sum + g.target, 0),
        totalSaved: progressData.reduce((sum, g) => sum + g.saved, 0)
      }
    });
  } catch (error) {
    fail(res, 'Error getting goal progress', error);
  }
};

// Goal Recommendations
exports.getGoalRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisMonth, last12Months } = getDateRanges();
    
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: last12Months.start }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalIncome = monthlyData.find(d => d._id === 'credit')?.total || 0;
    const totalExpenses = monthlyData.find(d => d._id === 'debit')?.total || 0;
    const avgMonthlyIncome = totalIncome / 12;
    const avgMonthlyExpenses = totalExpenses / 12;
    const savingsPotential = avgMonthlyIncome - avgMonthlyExpenses;

    const recommendations = [];
    
    if (savingsPotential > 0) {
      recommendations.push({
        type: 'emergency_fund',
        title: 'Build Emergency Fund',
        description: 'You can save ₹' + Math.round(savingsPotential) + ' monthly. Build an emergency fund of 6 months expenses.',
        target: avgMonthlyExpenses * 6,
        monthlyContribution: savingsPotential * 0.5,
        priority: 'high'
      });

      recommendations.push({
        type: 'retirement',
        title: 'Retirement Savings',
        description: 'Consider allocating 15% of income to retirement savings.',
        target: avgMonthlyIncome * 12 * 20,
        monthlyContribution: avgMonthlyIncome * 0.15,
        priority: 'high'
      });

      recommendations.push({
        type: 'vacation',
        title: 'Vacation Fund',
        description: 'Build a fund for annual vacation.',
        target: 50000,
        monthlyContribution: savingsPotential * 0.2,
        priority: 'medium'
      });
    }

    success(res, { recommendations });
  } catch (error) {
    fail(res, 'Error getting goal recommendations', error);
  }
};

// Budget Performance
exports.getBudgetPerformance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisMonth } = getDateRanges();
    
    const budgets = await Budget.find({ user: userId });
    
    const performance = await Promise.all(budgets.map(async (budget) => {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            category: budget.category,
            type: 'debit',
            occurredAt: { $gte: thisMonth.start, $lte: thisMonth.end }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const spentAmount = spent[0]?.total || 0;
      const utilization = (spentAmount / budget.amount) * 100;
      const remaining = budget.amount - spentAmount;

      return {
        ...budget.toObject(),
        spent: spentAmount,
        remaining: Math.max(remaining, 0),
        utilization: Math.min(utilization, 100),
        status: utilization > 100 ? 'exceeded' : utilization > 80 ? 'warning' : 'good'
      };
    }));

    success(res, {
      budgets: performance,
      summary: {
        totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
        totalSpent: performance.reduce((sum, b) => sum + b.spent, 0),
        exceededBudgets: performance.filter(b => b.status === 'exceeded').length,
        warningBudgets: performance.filter(b => b.status === 'warning').length
      }
    });
  } catch (error) {
    fail(res, 'Error getting budget performance', error);
  }
};

// Budget Alerts
exports.getBudgetAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisMonth } = getDateRanges();
    
    const budgets = await Budget.find({ user: userId });
    const alerts = [];

    for (const budget of budgets) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            category: budget.category,
            type: 'debit',
            occurredAt: { $gte: thisMonth.start, $lte: thisMonth.end }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const spentAmount = spent[0]?.total || 0;
      const utilization = (spentAmount / budget.amount) * 100;

      if (utilization > 100) {
        alerts.push({
          type: 'exceeded',
          category: budget.category,
          message: `You've exceeded budget for ${budget.category} by ₹${Math.round(spentAmount - budget.amount)}`,
          severity: 'high'
        });
      } else if (utilization > 80) {
        alerts.push({
          type: 'warning',
          category: budget.category,
          message: `You're at ${Math.round(utilization)}% of your ${budget.category} budget`,
          severity: 'medium'
        });
      }
    }

    success(res, { alerts });
  } catch (error) {
    fail(res, 'Error getting budget alerts', error);
  }
};

// Financial Health Score
exports.getHealthScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisMonth, last12Months } = getDateRanges();
    
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: thisMonth.start }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = monthlyData.find(d => d._id === 'credit')?.total || 0;
    const expenses = monthlyData.find(d => d._id === 'debit')?.total || 0;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    const scores = {
      savingsRate: Math.min((savingsRate / 20) * 100, 100),
      budgetCompliance: 75,
      goalProgress: 70,
      spendingStability: 80,
      debtToIncome: 90
    };

    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    success(res, {
      overallScore: Math.round(overallScore),
      breakdown: scores,
      metrics: {
        monthlySavingsRate: Math.round(savingsRate),
        monthlyIncome: income,
        monthlyExpenses: expenses,
        netCashflow: income - expenses
      },
      rating: overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Fair' : 'Poor'
    });
  } catch (error) {
    fail(res, 'Error calculating health score', error);
  }
};

// Health Factors
exports.getHealthFactors = async (req, res) => {
  try {
    const userId = req.user._id;
    const { last12Months } = getDateRanges();
    
    const data = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: last12Months.start }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = data.find(d => d._id === 'credit')?.total || 0;
    const expenses = data.find(d => d._id === 'debit')?.total || 0;

    const factors = [
      {
        name: 'Savings Rate',
        value: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0,
        unit: '%',
        target: 20,
        status: income > 0 && ((income - expenses) / income * 100) >= 20 ? 'good' : 'needs improvement'
      },
      {
        name: 'Monthly Income',
        value: (income / 12).toFixed(0),
        unit: '₹',
        status: 'info'
      },
      {
        name: 'Monthly Expenses',
        value: (expenses / 12).toFixed(0),
        unit: '₹',
        status: 'info'
      },
      {
        name: 'Expense to Income Ratio',
        value: income > 0 ? (expenses / income * 100).toFixed(1) : 0,
        unit: '%',
        target: 80,
        status: income > 0 && expenses / income <= 0.8 ? 'good' : 'needs improvement'
      }
    ];

    success(res, { factors });
  } catch (error) {
    fail(res, 'Error getting health factors', error);
  }
};

// Improvement Tips
exports.getImprovementTips = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisMonth, last12Months } = getDateRanges();
    
    const tips = [];
    
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: last12Months.start }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = monthlyData.find(d => d._id === 'credit')?.total || 0;
    const expenses = monthlyData.find(d => d._id === 'debit')?.total || 0;
    const savingsRate = income > 0 ? (income - expenses) / income * 100 : 0;

    if (savingsRate < 10) {
      tips.push({
        id: 1,
        title: 'Increase Savings Rate',
        description: 'Your savings rate is below 10%. Try to reduce expenses or increase income.',
        impact: 'High',
        difficulty: 'Medium'
      });
    }

    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'debit',
          occurredAt: { $gte: thisMonth.start }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    if (categorySpending.length > 0) {
      const topCategory = categorySpending[0];
      const topCategoryPercent = (topCategory.total / expenses) * 100;
      
      if (topCategoryPercent > 30) {
        tips.push({
          id: 2,
          title: `Reduce ${topCategory._id} Spending`,
          description: `${topCategory._id} accounts for ${topCategoryPercent.toFixed(1)}% of your expenses. Look for ways to reduce this.`,
          impact: 'High',
          difficulty: 'Medium'
        });
      }
    }

    tips.push({
      id: 3,
      title: 'Track All Expenses',
      description: 'Make sure you\'re recording all transactions for accurate analysis.',
      impact: 'Medium',
      difficulty: 'Low'
    });

    success(res, { tips });
  } catch (error) {
    fail(res, 'Error getting improvement tips', error);
  }
};

// Savings Potential
exports.getSavingsPotential = async (req, res) => {
  try {
    const userId = req.user._id;
    const { last12Months } = getDateRanges();
    
    const data = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: last12Months.start }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = data.find(d => d._id === 'credit')?.total || 0;
    const expenses = data.find(d => d._id === 'debit')?.total || 0;
    const currentSavings = income - expenses;
    const avgMonthly = currentSavings / 12;

    // Calculate potential savings with 10% expense reduction
    const potentialReduction = expenses * 0.1;
    const potentialSavings = currentSavings + potentialReduction;

    success(res, {
      currentMonthlyAvg: avgMonthly,
      currentAnnual: currentSavings,
      potentialMonthly: potentialSavings / 12,
      potentialAnnual: potentialSavings,
      opportunityCost: (potentialSavings - currentSavings) * 0.07, // 7% investment return
      recommendations: [
        { area: 'Dining Out', potentialSavings: (expenses * 0.15) * 0.3 },
        { area: 'Entertainment', potentialSavings: (expenses * 0.10) * 0.4 },
        { area: 'Utilities', potentialSavings: (expenses * 0.08) * 0.2 }
      ]
    });
  } catch (error) {
    fail(res, 'Error calculating savings potential', error);
  }
};

// Compare with Previous Month
exports.comparePreviousMonth = async (req, res) => {
  try {
    const userId = req.user._id;
    const { thisMonth, lastMonth } = getDateRanges();
    
    const current = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: thisMonth.start, $lte: thisMonth.end }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const previous = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: lastMonth.start, $lte: lastMonth.end }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentIncome = current.find(d => d._id === 'credit')?.total || 0;
    const previousIncome = previous.find(d => d._id === 'credit')?.total || 0;
    const currentExpenses = current.find(d => d._id === 'debit')?.total || 0;
    const previousExpenses = previous.find(d => d._id === 'debit')?.total || 0;

    success(res, {
      comparison: {
        income: {
          current: currentIncome,
          previous: previousIncome,
          change: ((currentIncome - previousIncome) / previousIncome * 100).toFixed(1)
        },
        expenses: {
          current: currentExpenses,
          previous: previousExpenses,
          change: ((currentExpenses - previousExpenses) / previousExpenses * 100).toFixed(1)
        },
        savings: {
          current: currentIncome - currentExpenses,
          previous: previousIncome - previousExpenses
        }
      }
    });
  } catch (error) {
    fail(res, 'Error comparing months', error);
  }
};

exports.compareYearOverYear = async (req, res) => {
  try {
    const userId = req.user._id;
    success(res, { message: 'Year over year comparison' });
  } catch (error) {
    fail(res, 'Error comparing years', error);
  }
};

exports.getPeerBenchmarks = async (req, res) => {
  try {
    success(res, { 
      benchmarks: {
        avgSavingsRate: 18,
        avgExpenseRatio: 75,
        recommendedEmergencyFund: 'Months of expenses',
        recommendedInvestmentRate: 15
      }
    });
  } catch (error) {
    fail(res, 'Error getting benchmarks', error);
  }
};

// Simulate Goal Progress
exports.simulateGoalProgress = async (req, res) => {
  try {
    const { goalId, monthlyAmount, months } = req.body;
    const goal = await Goal.findById(goalId);
    
    if (!goal) return fail(res, 'Goal not found');

    const currentSaved = goal.current || 0;
    const projectedSaved = currentSaved + (monthlyAmount * months);
    const remainingAfterSim = Math.max(goal.target - projectedSaved, 0);

    success(res, {
      currentSaved,
      monthlyContribution: monthlyAmount,
      months,
      projectedSaved,
      remaining: remainingAfterSim,
      goalReached: projectedSaved >= goal.target,
      progressPercent: (projectedSaved / goal.target * 100).toFixed(1)
    });
  } catch (error) {
    fail(res, 'Error simulating goal', error);
  }
};

// Budget Recommendations
exports.getBudgetRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { last12Months } = getDateRanges();
    
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'debit',
          occurredAt: { $gte: last12Months.start }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const recommendations = categorySpending.map(cat => ({
      category: cat._id,
      currentSpending: cat.totalAmount / 12,
      recommendedBudget: (cat.totalAmount / 12) * 0.9, // 10% less than average
      avgPerTransaction: cat.avgAmount,
      monthlyTransactions: cat.count / 12
    }));

    success(res, { recommendations });
  } catch (error) {
    fail(res, 'Error getting budget recommendations', error);
  }
};

// Cashflow Insights
exports.getCashflowInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const { last12Months } = getDateRanges();
    
    const data = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          occurredAt: { $gte: last12Months.start }
        }
      },
      {
        $group: {
          _id: { $month: '$occurredAt' },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] }
          },
          expenses: {
            $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    success(res, { monthlyFlows: data });
  } catch (error) {
    fail(res, 'Error getting cashflow insights', error);
  }
};

// Expense Optimization
exports.getExpenseOptimization = async (req, res) => {
  try {
    const userId = req.user._id;
    const { last12Months } = getDateRanges();
    
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'debit',
          occurredAt: { $gte: last12Months.start }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const optimizations = categorySpending.map(cat => {
      const variance = cat.maxAmount - cat.minAmount;
      const volatility = (variance / cat.avgAmount) * 100;
      
      return {
        category: cat._id,
        monthlyAvg: (cat.totalAmount / 12).toFixed(0),
        potentialSavings: (cat.totalAmount * 0.1).toFixed(0),
        volatility: volatility.toFixed(1),
        suggestion: volatility > 50 ? 'High variance - try to stabilize spending' : 'Spending is stable'
      };
    });

    success(res, { optimizations });
  } catch (error) {
    fail(res, 'Error getting expense optimization', error);
  }
};
