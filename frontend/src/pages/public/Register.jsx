import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, AlertCircle } from 'lucide-react';
import { registerUser } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain an uppercase letter, a lowercase letter, and a number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ name, email, password }) => {
    try {
      await registerUser({ name, email, password });
      // Registration successful — redirect to "check your email" page.
      // Do NOT set auth state — user is not logged in until email is verified.
      navigate('/check-email', { state: { email }, replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
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
            Create account
          </h1>
          
          {/* Subtitle */}
          <p className="animate-hero-enter delay-300 text-slate-400 text-sm md:text-base font-medium text-center">
            Start managing your rentals today
          </p>
        </div>

        {/* Card */}
        <div className="animate-hero-enter delay-500 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/30">
          {/* Root error */}
          {errors.root && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errors.root.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              id="name"
              label="Full name"
              type="text"
              placeholder="Avinash Sharma"
              required
              error={errors.name?.message}
              {...register('name')}
            />

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
              placeholder="Min. 8 characters"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <p className="text-xs text-slate-500">
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="animate-hero-enter delay-700 text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
