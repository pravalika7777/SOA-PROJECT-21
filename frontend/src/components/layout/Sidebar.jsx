import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Receipt,
  Users,
  Clock,
  User,
  LogOut,
  Library,
  BookPlus,
  Shield,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isLibrarian, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['STUDENT', 'LIBRARIAN'],
    },
    {
      to: '/books',
      label: 'Book Catalog',
      icon: BookOpen,
      roles: ['STUDENT', 'LIBRARIAN'],
    },
    {
      to: '/loans',
      label: 'My Loans',
      icon: ArrowLeftRight,
      roles: ['STUDENT'],
    },
    {
      to: '/fines',
      label: 'My Fines',
      icon: Receipt,
      roles: ['STUDENT'],
    },
    // Librarian-specific routes
    {
      to: '/admin/books',
      label: 'Manage Books',
      icon: BookPlus,
      roles: ['LIBRARIAN'],
    },
    {
      to: '/admin/loans',
      label: 'All Circulation',
      icon: ArrowLeftRight,
      roles: ['LIBRARIAN'],
    },
    {
      to: '/admin/overdue',
      label: 'Overdue Loans',
      icon: Clock,
      roles: ['LIBRARIAN'],
    },
    {
      to: '/admin/fines',
      label: 'Fine Management',
      icon: Receipt,
      roles: ['LIBRARIAN'],
    },
    {
      to: '/admin/users',
      label: 'Manage Users',
      icon: Users,
      roles: ['LIBRARIAN'],
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: User,
      roles: ['STUDENT', 'LIBRARIAN'],
    },
  ];

  const filteredLinks = navLinks.filter((link) =>
    user?.role ? link.roles.includes(user.role) : true
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Bibliotech
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Circulation Systems
            </p>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role:</span>
            <span
              className={`font-semibold uppercase px-2 py-0.5 rounded text-[10px] ${
                isLibrarian
                  ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700'
                  : 'bg-purple-900/60 text-purple-300 border border-purple-700'
              }`}
            >
              {user?.role || 'User'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer with user info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">
                {user?.username || 'Authenticated User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                ID: #{user?.userId || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors border border-rose-900/40 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
