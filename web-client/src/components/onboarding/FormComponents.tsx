import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

// Multi-select card component
interface SelectableCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  id,
  title,
  description,
  icon,
  isSelected,
  onToggle,
  disabled = false
}) => {
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onToggle(id)}
      className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left w-full ${
        isSelected
          ? 'border-orange-500 bg-orange-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {icon && (
          <div className="text-2xl mt-1">{icon}</div>
        )}
        <div className="flex-1">
          <h3 className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          {description && (
            <p className={`text-sm mt-1 ${isSelected ? 'text-orange-700' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
};

// Radio button group
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <motion.label
          key={option.value}
          htmlFor={`${name}-${option.value}`}
          className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            value === option.value
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 focus:ring-2 mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {option.icon && <span className="text-xl">{option.icon}</span>}
              <span className={`font-medium ${
                value === option.value ? 'text-orange-900' : 'text-gray-900'
              }`}>
                {option.label}
              </span>
            </div>
            {option.description && (
              <p className={`text-sm mt-1 ${
                value === option.value ? 'text-orange-700' : 'text-gray-600'
              }`}>
                {option.description}
              </p>
            )}
          </div>
        </motion.label>
      ))}
    </div>
  );
};

// Range slider component
interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (val) => val.toString(),
  className = ''
}) => {
  const [minVal, maxVal] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxVal - step);
    onChange([newMin, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minVal + step);
    onChange([minVal, newMax]);
  };

  // Calculate percentage positions for visual display
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Display Values */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-600 mb-1">Minimum</div>
          <div className="text-lg font-semibold text-orange-500">
            {formatLabel(minVal)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-600 mb-1">Maximum</div>
          <div className="text-lg font-semibold text-orange-500">
            {formatLabel(maxVal)}
          </div>
        </div>
      </div>

      {/* Dual Range Slider */}
      <div className="relative pt-1 pb-6">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full" style={{ top: '0.5rem' }} />

        {/* Active Track */}
        <div
          className="absolute h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
            top: '0.5rem'
          }}
        />

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="range-slider-thumb absolute w-full pointer-events-none"
          style={{
            zIndex: minVal > max - (max - min) / 2 ? 5 : 3
          }}
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="range-slider-thumb absolute w-full pointer-events-none"
          style={{
            zIndex: 4
          }}
        />
      </div>

      {/* Number Inputs */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="range-min" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum
          </label>
          <input
            id="range-min"
            type="number"
            min={min}
            max={maxVal - step}
            step={step}
            value={minVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= min && val < maxVal) {
                onChange([val, maxVal]);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label htmlFor="range-max" className="block text-sm font-medium text-gray-700 mb-2">
            Maximum
          </label>
          <input
            id="range-max"
            type="number"
            min={minVal + step}
            max={max}
            step={step}
            value={maxVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val <= max && val > minVal) {
                onChange([minVal, val]);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <style jsx>{`
        .range-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: none;
          height: 2rem;
        }

        .range-slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .range-slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          border-color: #2563eb;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }

        .range-slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.15);
          border-color: #1d4ed8;
        }

        .range-slider-thumb::-moz-range-thumb {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .range-slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          border-color: #2563eb;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }

        .range-slider-thumb::-moz-range-thumb:active {
          transform: scale(1.15);
          border-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

// Tagged input component
interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = "Tapez et appuyez sur Entrée...",
  suggestions = [],
  className = ''
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-orange-500 hover:text-orange-800"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};