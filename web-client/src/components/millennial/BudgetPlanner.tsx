import React, { useState } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

interface BudgetPlannerProps {
  totalBudget: number;
  currency: string;
  expenses: BudgetExpense[];
  recommendations: BudgetRecommendation[];
}

interface BudgetExpense {
  category: string;
  amount: number;
  percentage: number;
}

interface BudgetRecommendation {
  title: string;
  description: string;
  savingAmount: number;
  alternativePrice: number;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  totalBudget,
  currency,
  expenses,
  recommendations
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const spentAmount = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const remainingBudget = totalBudget - spentAmount;

  const categories = [
    'Accommodation',
    'Transportation',
    'Food & Drinks',
    'Activities',
    'Shopping',
    'Others'
  ];

  return (
    <div className="space-y-8">
      {/* Budget Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Budget Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Budget */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Total Budget</span>
            </div>
            <div className="text-2xl font-bold">{currency}{totalBudget}</div>
          </div>

          {/* Spent */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <PieChart className="w-4 h-4" />
              <span>Spent</span>
            </div>
            <div className="text-2xl font-bold">{currency}{spentAmount}</div>
          </div>

          {/* Remaining */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Remaining</span>
            </div>
            <div className="text-2xl font-bold">{currency}{remainingBudget}</div>
          </div>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Expense Categories</h2>
        
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.category}
              className="relative"
              onMouseEnter={() => setSelectedCategory(expense.category)}
              onMouseLeave={() => setSelectedCategory(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{expense.category}</span>
                <span className="text-gray-600">
                  {currency}{expense.amount} ({expense.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${expense.percentage}%` }}
                />
              </div>

              {/* Category Details Tooltip */}
              {selectedCategory === expense.category && (
                <div className="absolute top-full mt-2 left-0 w-64 p-4 bg-white rounded-lg shadow-lg z-10">
                  <h4 className="font-medium mb-2">{expense.category} Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Spent</span>
                      <span>{currency}{expense.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget</span>
                      <span>{currency}{(totalBudget * expense.percentage / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining</span>
                      <span>{currency}{((totalBudget * expense.percentage / 100) - expense.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Smart Savings</h2>
        
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="p-4 border border-orange-100 rounded-lg hover:border-orange-500 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">{recommendation.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">Save {currency}{recommendation.savingAmount}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Alternative: {currency}{recommendation.alternativePrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;