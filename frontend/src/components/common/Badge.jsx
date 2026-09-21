import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const normalizedVariant = String(variant).toLowerCase().replace(/\s+/g, '_');

  const variantStyles = {
    borrowed: 'bg-blue-100 text-blue-800 border-blue-200',
    returned: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    overdue: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse font-semibold',
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    limited: 'bg-amber-100 text-amber-800 border-amber-200',
    out_of_stock: 'bg-rose-100 text-rose-800 border-rose-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    paid: 'bg-teal-100 text-teal-800 border-teal-200',
    student: 'bg-purple-100 text-purple-800 border-purple-200',
    librarian: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    default: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold tracking-wider uppercase',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const selectedVariantStyle = variantStyles[normalizedVariant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs whitespace-nowrap ${sizeStyles[size] || sizeStyles.md} ${selectedVariantStyle} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
