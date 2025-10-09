import React from 'react';

/**
 * Button Component
 * Customizable button with variants and sizes matching design system
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ariaLabel,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary shadow-lg shadow-primary/20',
    secondary: 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary shadow-lg shadow-secondary/20',
    ghost: 'bg-surface/50 hover:bg-surface-light text-text-primary focus:ring-surface-light backdrop-blur-sm',
    danger: 'bg-error hover:bg-red-600 text-white focus:ring-error shadow-lg shadow-error/20',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
    icon: 'p-2.5 rounded-full',
  };
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
