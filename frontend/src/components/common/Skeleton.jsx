import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 space-y-4">
      <div className="h-6 bg-slate-200/80 rounded w-1/4 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="flex gap-4">
            {Array.from({ length: cols }).map((_, cIndex) => (
              <div
                key={cIndex}
                className="h-5 bg-slate-100 rounded animate-pulse"
                style={{ width: `${100 / cols}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse"
        >
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
          <div className="h-8 bg-slate-100 rounded mt-4" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
