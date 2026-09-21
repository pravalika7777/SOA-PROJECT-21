import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs ${className}`}>
      <table className="w-full text-left text-sm border-collapse">{children}</table>
    </div>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <thead className={`bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-600 uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-slate-100 text-slate-700 ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-150 ${
        onClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/40'
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHeader = ({ children, className = '' }) => {
  return <th className={`px-4 py-3.5 font-semibold ${className}`}>{children}</th>;
};

export const TableCell = ({ children, className = '' }) => {
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
};

export default Table;
