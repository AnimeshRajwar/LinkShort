import { useState } from 'react';
import { supabaseRegister } from '../api';

export default function SignupPage({ onGoToLogin, onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await supabaseRegister(email, password, name);
      localStorage.setItem('token', response.session.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        name: name,
      }));
      onSignup({
        id: response.user.id,
        email: response.user.email,
        name: name,
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen flex flex-col">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-10 py-3 bg-white">
        <div className="flex items-center gap-2">
          <div className="size-6 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
            </svg>
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">LinkShort</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-slate-500">Already have an account?</span>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors" onClick={onGoToLogin}>
            Log In
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-xl border border-primary/5 overflow-hidden">
          <div className="h-32 w-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-white text-5xl">link</span>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
              <p className="text-slate-500 mt-2">Join thousands of users managing their links</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                  <input className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="John Doe" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="name@company.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="••••••••" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition-colors shadow-md shadow-primary/20 mt-6 disabled:opacity-60 disabled:cursor-not-allowed" type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-semibold">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm font-semibold">GitHub</span>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                By signing up, you agree to our{' '}
                <a className="text-primary hover:underline" href="#0">Terms of Service</a> and{' '}
                <a className="text-primary hover:underline" href="#0">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-sm text-slate-500">
        © 2026 LinkShort Inc. All rights reserved.
      </footer>
    </div>
  );
}
