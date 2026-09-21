import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: mobile menu button & platform title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Enterprise Academic Resource
          </span>
          <h2 className="text-sm font-bold text-slate-800">
            Bibliotech Circulation Systems
          </h2>
        </div>
      </div>

      {/* Right side: Notifications, User Profile, Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Notifications"
            onClick={() => {}}
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {user?.username ? user.username.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.username || 'User'}
              </p>
              <Badge variant={user?.role} size="sm">
                {user?.role || 'STUDENT'}
              </Badge>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {user?.username}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile Overview</span>
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
