import React, { useState } from 'react';
import { Receipt, Upload, DollarSign, Calendar, Tag, X } from 'lucide-react';

interface ExpenseTrackerProps {
  onSave: (expense: Expense) => void;
  onCancel: () => void;
  initialExpense?: Expense;
}

interface Expense {
  id: string;
  category: 'flight' | 'hotel' | 'transport' | 'meal' | 'other';
  amount: number;
  currency: string;
  date: string;
  description: string;
  receipt?: string;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  onSave,
  onCancel,
  initialExpense
}) => {
  const [expense, setExpense] = useState<Expense>(initialExpense || {
    id: crypto.randomUUID(),
    category: 'other',
    amount: 0,
    currency: 'USD',
    date: new Date().toISOString(),
    description: ''
  });

  const categories = [
    { value: 'flight', label: 'Flight' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'transport', label: 'Transport' },
    { value: 'meal', label: 'Meal' },
    { value: 'other', label: 'Other' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Add Expense</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        onSave(expense);
      }} className="space-y-6">
        {/* Amount and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={expense.amount}
                onChange={(e) => setExpense({ ...expense, amount: parseFloat(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={expense.currency}
              onChange={(e) => setExpense({ ...expense, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setExpense({ ...expense, category: category.value as Expense['category'] })}
                className={`p-2 rounded-lg text-sm ${
                  expense.category === category.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={expense.date.split('T')[0]}
              onChange={(e) => setExpense({ ...expense, date: new Date(e.target.value).toISOString() })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={expense.description}
              onChange={(e) => setExpense({ ...expense, description: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              rows={3}
              placeholder="Enter expense description"
              required
            />
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receipt
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setExpense({ ...expense, receipt: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id="receipt-upload"
            />
            <label
              htmlFor="receipt-upload"
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Upload Receipt</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseTracker;