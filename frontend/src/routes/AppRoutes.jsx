import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Books from '../pages/books/Books';
import BookDetails from '../pages/books/BookDetails';
import AdminBooks from '../pages/books/AdminBooks';
import Loans from '../pages/loans/Loans';
import LoanDetails from '../pages/loans/LoanDetails';
import AdminLoans from '../pages/loans/AdminLoans';
import Overdue from '../pages/loans/Overdue';
import Fines from '../pages/fines/Fines';
import FineDetails from '../pages/fines/FineDetails';
import Users from '../pages/users/Users';
import Profile from '../pages/profile/Profile';
import NotFound from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Circulation App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catalog */}
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />

          {/* Student Circulation */}
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/:id" element={<LoanDetails />} />

          {/* Fines */}
          <Route path="/fines" element={<Fines />} />
          <Route path="/fines/:id" element={<FineDetails />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Administrative / Librarian Only Routes */}
          <Route element={<RoleRoute allowedRoles={['LIBRARIAN']} />}>
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/loans" element={<AdminLoans />} />
            <Route path="/admin/overdue" element={<Overdue />} />
            <Route path="/admin/fines" element={<Fines />} />
            <Route path="/admin/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
