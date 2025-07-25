import React from 'react';
import { clsx } from 'clsx';

/**
 * Button component for use throughout the Red Tetris application
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, outline)
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ButtonHTMLAttributes} props.rest - Additional button attributes
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className, 
  ...rest 
}) => {
  const baseClasses = 'rounded font-medium transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };
  
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  
  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  return (
    <button className={buttonClasses} {...rest}>
      {children}
    </button>
  );
};

export default Button;
