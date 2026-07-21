import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Wrench, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setUnverifiedEmail(null);
    try {
      const response = await loginUser(data);
      const user = response.data.user;
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';

      // Detect unverified-email block — show resend link
      if (message.toLowerCase().includes('verify')) {
        setUnverifiedEmail(getValues('email'));
      }

      setError('root', { message });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 w-full h-full bg-orange-500/10 blur-[50px] -z-10 rounded-full"></div>

          {/* Logo Container */}
          <div className="animate-hero-enter relative p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 shadow-xl mb-6 group hover:border-orange-500/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Wrench className="h-8 w-8 text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] relative z-10" />
          </div>


          {/* Main Title */}
          <h1 className="animate-hero-enter delay-150 text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-3 text-center">
            Welcome back !
          </h1>
          
          {/* Subtitle */}
          <p className="animate-hero-enter delay-300 text-slate-400 text-sm md:text-base font-medium text-center">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Card */}
        <div className="animate-hero-enter delay-500 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/30">
          {/* Root error */}
          {errors.root && (
            <div className="mb-5 rounded-lg bg-red-950/50 border border-red-800 overflow-hidden">
              <div className="flex items-start gap-3 px-4 py-3 text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
              {/* Resend verification shortcut */}
              {unverifiedEmail && (
                <div className="px-4 py-2.5 bg-red-950/60 border-t border-red-900 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">
                    Didn't get the email?{' '}
                    <Link
                      to="/check-email"
                      state={{ email: unverifiedEmail }}
                      className="font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
                    >
                      Resend verification link
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="animate-hero-enter delay-700 text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
