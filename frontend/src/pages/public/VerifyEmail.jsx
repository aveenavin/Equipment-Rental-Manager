import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Wrench, RefreshCw } from 'lucide-react';
import { verifyEmail, resendVerification } from '../../services/authService';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const COOLDOWN_SECONDS = 30;

/**
 * Module-level Set — lives outside React's component lifecycle.
 * React 18 Strict Mode unmounts + remounts components in development,
 * resetting all useRef and useState values. A module-level variable
 * is NOT reset on remount, so it correctly deduplicates the API call
 * that would otherwise fire twice due to the double-invocation.
 */
const _inFlight = new Set();

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Resend flow for the error state
  const [resendEmail, setResendEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Verify on mount — guarded against React 18 Strict Mode double-invocation
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found in the URL. Please use the link from your email.');
      return;
    }

    // If a request for this token is already in-flight (Strict Mode remount),
    // skip — the first call will settle and update state normally.
    if (_inFlight.has(token)) return;
    _inFlight.add(token);

    const doVerify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message ||
          'Verification failed. The link may be invalid or expired.'
        );
      } finally {
        _inFlight.delete(token);
      }
    };

    doVerify();
  }, [token]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!resendEmail.trim() || isSending || cooldown > 0) return;
    setIsSending(true);
    try {
      await resendVerification(resendEmail.trim());
      toast.success('New verification link sent! Check your inbox.');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">Verifying your email…</h2>
          <p className="text-slate-500 text-sm">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  // ─── Success ───────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 rounded-xl bg-primary-600/10 border border-primary-800/50 mb-4">
              <Wrench className="h-7 w-7 text-primary-400" />
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/30 text-center">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-100 mb-2">Email verified!</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Your account is now active. You can sign in and start managing your rentals.
            </p>

            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full">
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-xl bg-primary-600/10 border border-primary-800/50 mb-4">
            <Wrench className="h-7 w-7 text-primary-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-xl shadow-black/30 text-center overflow-hidden">
          {/* Error icon */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle className="h-7 w-7 sm:h-10 sm:w-10 text-red-400" />
            </div>
          </div>

          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 mb-2">Verification failed</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {errorMessage}
          </p>

          {/* Resend section */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 sm:p-4 text-left mb-6">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">
              Request a new link
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResend()}
                placeholder="your@email.com"
                className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleResend}
                disabled={isSending || cooldown > 0 || !resendEmail.trim()}
                className="w-full sm:w-auto shrink-0"
              >
                {isSending ? (
                  <Spinner size="sm" />
                ) : cooldown > 0 ? (
                  `${cooldown}s`
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            {cooldown > 0 && (
              <p className="text-xs text-emerald-400 mt-2">
                ✓ Link sent! Check your inbox.
              </p>
            )}
          </div>

          <Link to="/login">
            <Button variant="ghost" size="md" className="w-full text-slate-400 hover:text-slate-200">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
