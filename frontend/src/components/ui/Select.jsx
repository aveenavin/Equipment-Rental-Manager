import React from 'react';

const Select = React.forwardRef(
  ({ label, id, error, required = false, className = '', children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-300">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 rounded-lg bg-slate-900 border text-slate-100 text-sm
            transition-colors duration-200 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
