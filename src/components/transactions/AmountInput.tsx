'use client';

import { useState } from 'react';

interface AmountInputProps {
  value: number;
  onChange: (amount: number) => void;
  placeholder?: string;
}

export function AmountInput({ value, onChange, placeholder = '0' }: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toString() : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '');
    setDisplayValue(inputValue);
    
    const numericValue = parseFloat(inputValue) || 0;
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-400 dark:text-gray-500">
        ₹
      </div>
      <input
        type="tel"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl py-8 pl-16 pr-6 text-5xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder-gray-300 dark:placeholder-gray-600"
      />
    </div>
  );
}
