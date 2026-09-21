import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Library, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });
      toast.success('Welcome back to Bibliotech!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid username or password';
      setError(typeof msg === 'string' ? msg : 'Authentication failed');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left side: Academic Library Branding */}
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
            <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-300 mb-4">
              Microservices Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Enterprise Academic Resource &amp; Circulation Management
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time book inventory tracking, intelligent circulation management, automated fine calculation, and Eureka-based load-balanced microservices.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Bibliotech Circulation Systems. Academic Evaluation Edition.</p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Enter your student or librarian credentials to proceed.
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
              placeholder="e.g. student1 or librarian1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

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
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
