import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-sm hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.98] border border-orange-600/50 border-t-orange-400/50 disabled:opacity-60 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-200',
  secondary:
    'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-sm hover:border-slate-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-200',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-sm hover:shadow-md hover:shadow-red-500/20 active:scale-[0.98] border border-red-600/50 border-t-red-400/50 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-200',
  ghost:
    'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-200',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-orange-500 focus-visible:ring-offset-1
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && <Spinner size="sm" />}
        {children}
      </span>
    </button>
  );
};

export default Button;
