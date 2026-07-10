import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.97] active:shadow-inner border border-orange-500/20 disabled:from-orange-300 disabled:to-orange-300 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed',
  secondary:
    'bg-white hover:bg-orange-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow hover:border-orange-300 hover:text-orange-700 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-md hover:shadow-red-500/20 active:scale-[0.97] active:shadow-inner border border-red-700/20 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent hover:bg-gray-100 text-gray-600 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed',
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
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;
