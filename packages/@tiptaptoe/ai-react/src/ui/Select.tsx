import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  style,
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
        }}>
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{
          fontSize: '12px',
          color: '#ef4444',
        }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{
          fontSize: '12px',
          color: '#6b7280',
        }}>
          {helperText}
        </span>
      )}
    </div>
  );
};