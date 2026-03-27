import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { PeriodType } from '@/types/admin';

interface PeriodFilterProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  onCustomRange: (startDate: string, endDate: string) => void;
}

const PRESETS: { label: string; value: PeriodType }[] = [
  { label: "Aujourd'hui", value: '24h' },
  { label: '7 jours', value: '7d' },
  { label: '30 jours', value: '30d' },
  { label: 'Personnalise', value: 'custom' },
];

const PeriodFilter = ({ period, onPeriodChange, onCustomRange }: PeriodFilterProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handlePresetClick = (value: PeriodType) => {
    onPeriodChange(value);
  };

  const handleApplyCustom = () => {
    if (startDate && endDate) {
      onCustomRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex bg-white border border-gray-200 rounded-lg p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              period === preset.value
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            maxDate={new Date()}
            placeholderText="Debut"
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg w-32"
            dateFormat="dd/MM/yyyy"
          />
          <span className="text-gray-400">-</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || undefined}
            maxDate={new Date()}
            placeholderText="Fin"
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg w-32"
            dateFormat="dd/MM/yyyy"
          />
          <button
            onClick={handleApplyCustom}
            disabled={!startDate || !endDate}
            className="px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded-lg disabled:opacity-50 hover:bg-orange-600 transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
};

export default PeriodFilter;
