import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, RefreshCw, ArrowRight, Wrench } from 'lucide-react';
import { resendVerification } from '../../services/authService';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const COOLDOWN_SECONDS = 30;

const CheckEmail = () => {
  const { state } = useLocation();
  const email = state?.email || '';

  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || isSending || cooldown > 0) return;
    setIsSending(true);
    try {
      await resendVerification(email);
      toast.success('Verification email sent! Check your inbox.');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend. Please try again.';
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-xl bg-primary-600/10 border border-primary-800/50 mb-4">
            <Wrench className="h-7 w-7 text-primary-400" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/30 text-center">

          {/* Mail icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Mail className="h-10 w-10 text-orange-400" />
              </div>
              {/* Decorative dot */}
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">✓</span>
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-2">Check your email</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            We sent a verification link to
          </p>
          {email && (
            <p className="text-orange-400 font-semibold text-sm mb-6 break-all">
              {email}
            </p>
          )}
          <p className="text-slate-500 text-xs leading-relaxed mb-8">
            Click the link in the email to activate your account.
            The link expires in <span className="text-slate-400 font-medium">30 minutes</span>.
          </p>

          {/* Resend button */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleResend}
              disabled={isSending || cooldown > 0 || !email}
            >
              {isSending ? (
                <>
                  <Spinner size="sm" />
                  Sending…
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>

            <Link to="/login" className="w-full">
              <Button variant="ghost" size="lg" className="w-full text-slate-400 hover:text-slate-200">
                <ArrowRight className="h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Wrong email?{' '}
          <Link to="/register" className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors">
            Create a new account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CheckEmail;
