import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage({ onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const verifySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setVerifying(false);
    };

    verifySession();
  }, []);

  useEffect(() => {
    // Redirect to dashboard after 2 seconds on success
    if (success) {
      const timer = setTimeout(() => {
        onResetSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onResetSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to reset password. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="bg-background-light font-display min-h-screen flex flex-col">
        <header className="w-full bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-primary">
                <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h1 className="text-slate-900 text-xl font-bold tracking-tight">LinkShort</h1>
            </div>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background-light font-display min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary">
              <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h1 className="text-slate-900 text-xl font-bold tracking-tight">LinkShort</h1>
          </div>
          <div className="hidden sm:flex gap-4">
            <a className="text-slate-600 hover:text-primary transition-colors text-sm font-medium" href="#0">Help</a>
            <a className="text-slate-600 hover:text-primary transition-colors text-sm font-medium" href="#0">Pricing</a>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col gap-2 mb-8 text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary text-3xl">lock</span>
            </div>
            <h2 className="text-slate-900 text-3xl font-bold tracking-tight">Create New Password</h2>
            <p className="text-slate-500 text-sm">
              Enter your new password below to reset your account.
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm text-center">
                <span className="material-symbols-outlined text-2xl mb-2 block">check_circle</span>
                Password reset successfully! You can now login with your new password.
              </div>
              <button
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium group"
              >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to Login
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold" htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    className="flex w-full rounded-lg text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary border border-slate-300 bg-white h-12 pl-11 pr-4 placeholder:text-slate-400 text-base transition-all"
                    id="password"
                    name="password"
                    placeholder="Enter new password"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    className="flex w-full rounded-lg text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary border border-slate-300 bg-white h-12 pl-11 pr-4 placeholder:text-slate-400 text-base transition-all"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                  {!loading && <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium group"
              >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to Login
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© 2026 LinkShort Inc. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a className="hover:text-primary underline underline-offset-4 decoration-slate-200" href="#0">Privacy Policy</a>
          <a className="hover:text-primary underline underline-offset-4 decoration-slate-200" href="#0">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
