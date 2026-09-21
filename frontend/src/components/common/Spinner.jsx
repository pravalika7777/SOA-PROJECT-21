import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '', label = 'Loading...' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 ${className}`}>
      <Loader2 className={`animate-spin text-indigo-600 ${sizeStyles[size] || sizeStyles.md}`} />
      {label && <p className="text-xs text-slate-500 font-medium">{label}</p>}
    </div>
  );
};

export default Spinner;
