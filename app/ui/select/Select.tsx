'use client';

import React from 'react';
import { selectStyles } from './select.styles';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  variant?: 'default' | 'compact';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, icon, placeholder, className, variant = 'default', ...props }, ref) => {
    const baseClass =
      variant === 'compact' ? selectStyles.selectCompact : selectStyles.select;

    return (
      <div className={selectStyles.wrapper}>
        <select
          ref={ref}
          className={`${baseClass} ${className || ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {icon && <div className={selectStyles.iconWrapper} data-icon>{icon}</div>}
        <div className={selectStyles.arrowWrapper} data-arrow>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

