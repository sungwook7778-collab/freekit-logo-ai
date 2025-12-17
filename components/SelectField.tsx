import React from 'react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select
          className={`w-full px-4 py-3 rounded-lg border bg-white appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none ${
            error ? 'border-red-500' : 'border-slate-200'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>선택해주세요</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
