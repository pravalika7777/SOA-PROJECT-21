import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

export const RoleRoute = ({ allowedRoles = ['LIBRARIAN'] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          403 — Unauthorized Access
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          You do not have the required administrative permissions (<span className="font-semibold text-slate-700">{allowedRoles.join(', ')}</span>) to access this module.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
