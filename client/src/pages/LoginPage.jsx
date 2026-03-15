import { useState } from 'react';
import { supabaseLogin } from '../api';

export default function LoginPage({ onLogin, onGoToSignup, onGoToForgotPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await supabaseLogin(email, password);
      localStorage.setItem('token', response.session.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        name: response.user.user_metadata?.full_name || response.user.email,
      }));
      onLogin({
        id: response.user.id,
        email: response.user.email,
        name: response.user.user_metadata?.full_name || response.user.email,
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-xl mb-3 shadow-lg shadow-primary/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">LinkShort</h1>
          <p className="text-slate-500 mt-2">Welcome back! Please enter your details.</p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
                </div>
                <input className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" id="email" name="email" placeholder="name@company.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                </div>
                <input className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" id="password" name="password" placeholder="••••••••" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors" type="button" onClick={() => setShowPassword((v) => !v)}>
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded transition-all bg-white" id="remember-me" name="remember-me" type="checkbox" />
                <label className="ml-2 block text-sm text-slate-700" htmlFor="remember-me">Remember me</label>
              </div>
              <div className="text-sm">
                <button type="button" className="font-medium text-primary hover:text-primary/80 transition-colors" onClick={onGoToForgotPassword}>Forgot password?</button>
              </div>
            </div>

            <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button className="font-semibold text-primary hover:text-primary/80 transition-colors" onClick={onGoToSignup}>
            Sign up for free
          </button>
        </p>

        <div className="mt-12 flex justify-center space-x-6 text-xs text-slate-400">
          <a className="hover:text-primary transition-colors" href="#0">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#0">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#0">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
