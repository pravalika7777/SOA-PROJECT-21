import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  color = 'indigo',
  className = '',
}) => {
  const colorStyles = {
    indigo: {
      bgIcon: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      accent: 'border-l-indigo-600',
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'border-l-emerald-600',
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-600 border-amber-100',
      accent: 'border-l-amber-600',
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-600 border-rose-100',
      accent: 'border-l-rose-600',
    },
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600 border-blue-100',
      accent: 'border-l-blue-600',
    },
  };

  const selectedColor = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs transition-all duration-200 hover:shadow-xs border-l-4 ${selectedColor.accent} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </h4>
          {description && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border shrink-0 ${selectedColor.bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
