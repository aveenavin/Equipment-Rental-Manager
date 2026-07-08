import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/30 disabled:bg-primary-800 disabled:cursor-not-allowed',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent hover:bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
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
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-all duration-200 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;
