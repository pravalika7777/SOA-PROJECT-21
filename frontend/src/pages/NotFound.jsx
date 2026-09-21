import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Library, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-xs border border-indigo-100">
        <Library className="w-16 h-16" />
      </div>

      <span className="text-sm font-extrabold text-indigo-600 tracking-wider uppercase mb-1">
        404 Error
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
        Page Not Found
      </h1>
      <p className="text-slate-500 text-sm max-w-md mb-8">
        The requested academic catalog URL or administrative module does not exist or has been relocated.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="lg">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
