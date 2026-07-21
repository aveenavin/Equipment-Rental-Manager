import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      id,
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5 group/input">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-400 group-focus-within/input:text-slate-200 transition-colors">
            {label}
            {required && <span className="text-orange-500 ml-1 opacity-80">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={`
              w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border
              text-slate-100 placeholder-slate-600 text-base shadow-inner
              transition-all duration-200
              focus:outline-none focus:ring-2
              ${error 
                ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/20 bg-red-950/20' 
                : 'border-slate-800 hover:border-slate-600 focus:border-slate-600 focus:ring-slate-700/50 focus:bg-slate-900/80'
              }
              ${isPassword ? 'pr-12' : ''}
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1.5 mt-0.5 font-medium">
            <span className="w-1 h-1 rounded-full bg-red-400"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
