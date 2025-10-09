import React from 'react';

/**
 * Slider Component
 * Range slider with labels for settings
 */
const Slider = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  labels = [],
  label,
  className = '',
  showValue = false,
  ...props 
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`${className}`} {...props}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
          {showValue && (
            <span className="text-sm font-medium text-text-primary">
              {value}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary slider-thumb"
          style={{
            background: `linear-gradient(to right, #2563EB ${percentage}%, #334155 ${percentage}%)`,
          }}
        />
      </div>

      {labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((labelText, index) => (
            <span
              key={index}
              className="text-xs text-text-muted"
            >
              {labelText}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;
