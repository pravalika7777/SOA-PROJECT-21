import React from 'react';

export const Card = ({ children, className = '', hoverable = false }) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-2xs transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div className={`p-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`}>
      {children || (
        <>
          <div>
            {title && (
              <h3 className="font-semibold text-slate-900 text-base leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </>
      )}
    </div>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

export default Card;
