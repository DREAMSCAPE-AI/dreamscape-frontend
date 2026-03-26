import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './Calendar';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  onChange: (range: DateRange) => void;
  value?: DateRange;
  minDate?: Date;
  maxDate?: Date;
  singleDate?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  value = { startDate: null, endDate: null },
  minDate,
  maxDate,
  singleDate = false
}) => {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const handleStartDateSelect = (date: Date) => {
    onChange({
      startDate: date,
      endDate: singleDate ? null : (value.endDate && date > value.endDate ? null : value.endDate)
    });
    setIsStartDateOpen(false);
    if (!singleDate) {
      setIsEndDateOpen(true);
    }
  };

  const handleEndDateSelect = (date: Date) => {
    onChange({
      startDate: value.startDate,
      endDate: date
    });
    setIsEndDateOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`flex gap-4 ${singleDate ? 'max-w-xs' : ''}`}>
      <div className="flex-1 relative">
        <button
          onClick={() => setIsStartDateOpen(!isStartDateOpen)}
          className="w-full flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-700">
            {value.startDate ? formatDate(value.startDate) : (singleDate ? 'Select date' : 'Start date')}
          </span>
        </button>

        {isStartDateOpen && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <Calendar
              onSelect={handleStartDateSelect}
              selectedDate={value.startDate || undefined}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        )}
      </div>

      {!singleDate && (
        <div className="flex-1 relative">
          <button
            onClick={() => setIsEndDateOpen(!isEndDateOpen)}
            className="w-full flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">
              {value.endDate ? formatDate(value.endDate) : 'End date'}
            </span>
          </button>

          {isEndDateOpen && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <Calendar
                onSelect={handleEndDateSelect}
                selectedDate={value.endDate || undefined}
                minDate={value.startDate || minDate}
                maxDate={maxDate}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;