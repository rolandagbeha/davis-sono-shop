import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'whatsapp' | 'danger' | 'ghost';
  size?:     'sm' | 'md' | 'lg';
  loading?:  boolean;
  icon?:     ReactNode;
  fullWidth?: boolean;
}

const variantClasses = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  whatsapp:  'btn-whatsapp',
  danger:    'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-heading font-medium px-6 py-2.5 rounded-btn transition-all duration-200 active:scale-95 inline-flex items-center gap-2',
  ghost:     'text-muted hover:text-white font-medium px-4 py-2 rounded-btn transition-colors duration-200 inline-flex items-center gap-2',
};

const sizeClasses = {
  sm: '!px-4 !py-1.5 !text-sm',
  md: '',
  lg: '!px-8 !py-3 !text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full justify-center' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
