import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  href,
  target,
  onClick,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left',
}) => {
  // 样式变体
  const variantStyles = {
    primary: 'bg-gradient text-white border-none shadow-md hover:opacity-90',
    secondary: 'bg-secondary text-white border-none shadow-md hover:opacity-90',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:bg-opacity-10',
    ghost: 'bg-transparent text-primary hover:bg-primary hover:bg-opacity-10',
  };

  // 尺寸变体
  const sizeStyles = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg',
  };

  // 基础类名
  const baseClassName = 'inline-flex items-center justify-center rounded-md transition-all duration-300 focus:outline-none';
  
  // 完整类名
  const buttonClassName = `
    ${baseClassName}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  // 加载状态指示器
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // 内容
  const content = (
    <>
      {isLoading && <LoadingSpinner />}
      {icon && iconPosition === 'left' && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  // 链接按钮
  if (href) {
    return (
      <Link 
        href={href} 
        className={buttonClassName}
        target={target}
        onClick={onClick as any}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {content}
      </Link>
    );
  }

  // 普通按钮
  return (
    <button
      className={buttonClassName}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {content}
    </button>
  );
};

export default Button; 