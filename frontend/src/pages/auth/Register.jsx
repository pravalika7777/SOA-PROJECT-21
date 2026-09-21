import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Library, Lock, User, Shield, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register({
        username: username.trim(),
        password,
        role,
      });
      toast.success('Registration successful! Please sign in with your new account.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      setError(typeof msg === 'string' ? msg : 'Registration failed. Username might be taken.');
      toast.error('Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left side branding */}
      <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 md:p-16 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg">
              <Library className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Bibliotech</h1>
              <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">
                Circulation Systems
              </p>
            </div>
          </div>

          <div className="max-w-md mt-12 md:mt-24">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Join the Academic Platform
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Create an account as a Student to borrow and return books, or as a Librarian to manage inventory and monitor circulation.
            </p>
            <div className="space-y-3 text-xs text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Role <strong>STUDENT</strong>: Browse, borrow, view fines, return books</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>Role <strong>LIBRARIAN</strong>: Manage catalog, users, overdue alerts & fines</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Bibliotech Circulation Systems.</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Your Account
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Select your academic role and enter your details below.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="e.g. student2 or librarian2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                    role === 'STUDENT'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('LIBRARIAN')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                    role === 'LIBRARIAN'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Librarian
                </button>
              </div>
            </div>

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="new-password"
              required
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
