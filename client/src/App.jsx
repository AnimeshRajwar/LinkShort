import { useEffect, useState } from 'react';
import ShortenForm from './components/ShortenForm';
import UrlTable from './components/UrlTable';
import StatsBar from './components/StatsBar';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { getAllUrls, supabaseGetSession } from './api';
import { supabase } from './lib/supabase';
import './index.css';

function Dashboard({ urls, loading, onNewUrl, onDelete, onLogout, user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-6 md:px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl font-bold">link</span>
                <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">LinkShort</h2>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <button 
                  className={`${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-600 hover:text-primary'} text-sm font-semibold leading-normal transition-colors`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={`${activeTab === 'my-links' ? 'text-primary' : 'text-slate-600 hover:text-primary'} text-sm font-medium transition-colors`}
                  onClick={() => setActiveTab('my-links')}
                >
                  My Links
                </button>
                <button
                  className={`${activeTab === 'analytics' ? 'text-primary' : 'text-slate-600 hover:text-primary'} text-sm font-medium transition-colors`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
                <button
                  className={`${activeTab === 'settings' ? 'text-primary' : 'text-slate-600 hover:text-primary'} text-sm font-medium transition-colors`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </nav>
            </div>

            <div className="flex flex-1 justify-end gap-4 items-center">
              <button className="hidden sm:flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm font-semibold" onClick={onLogout}>
                Log out
              </button>
              <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </header>

          <main className="flex flex-1 justify-center py-8">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-4 md:px-10 gap-8">
              {activeTab === 'dashboard' && (
                <>
              <section className="@container">
                <div
                  className="flex min-h-[320px] flex-col gap-8 rounded-xl items-center justify-center p-8 bg-slate-900 relative overflow-hidden"
                  style={{ backgroundImage: 'linear-gradient(135deg, rgba(60, 131, 246, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%)' }}
                >
                  <div className="flex flex-col gap-3 text-center z-10">
                    <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">Shorten Your Connections</h1>
                    <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto">
                      Create memorable, trackable, and powerful short links in seconds. Optimize your marketing campaigns with data-driven insights.
                    </p>
                  </div>

                  <ShortenForm onNewUrl={onNewUrl} />
                </div>
              </section>

              <StatsBar urls={urls} />

                  {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading links...</div>
                  ) : (
                    <UrlTable urls={urls} onDelete={onDelete} />
                  )}
                </>
              )}

              {activeTab === 'my-links' && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-slate-900 text-2xl font-bold">My Links</h2>
                    <p className="text-slate-500 text-sm">{urls.length} total links</p>
                  </div>
                  {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading links...</div>
                  ) : (
                    <UrlTable urls={urls} onDelete={onDelete} showHeader={false} />
                  )}
                </section>
              )}

              {activeTab === 'analytics' && <AnalyticsPage urls={urls} />}

              {activeTab === 'settings' && (
                <SettingsPage
                  user={user}
                  onUserUpdate={onUserUpdate}
                />
              )}
            </div>
          </main>

          <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
            <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-primary text-xl">link</span>
                <span>© 2026 LinkShort Inc. All rights reserved.</span>
              </div>
              <div className="flex gap-6">
                <a className="text-slate-500 hover:text-primary text-sm font-medium transition-colors" href="#0">Privacy Policy</a>
                <a className="text-slate-500 hover:text-primary text-sm font-medium transition-colors" href="#0">Terms of Service</a>
                <a className="text-slate-500 hover:text-primary text-sm font-medium transition-colors" href="#0">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Supabase session
        const { data } = await supabaseGetSession();
        
        if (data.session) {
          localStorage.setItem('token', data.session.access_token);
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.full_name || data.session.user.email,
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          localStorage.setItem('token', session.access_token);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await getAllUrls();
      setUrls(res.data);
    } catch {
      // DB not connected — show empty state
    } finally {
      setLoading(false);
    }
  };

  const refreshUrls = async () => {
    try {
      const res = await getAllUrls();
      setUrls(res.data);
    } catch {
      // Silently fail on background refresh
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUrls();
      
      // Poll for updates every 5 seconds
      const interval = setInterval(refreshUrls, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleNewUrl = (newUrl) => {
    setUrls((prev) => {
      const exists = prev.find((u) => u.shortCode === newUrl.shortCode);
      if (exists) return prev;
      return [newUrl, ...prev];
    });
  };

  const handleDelete = (code) => {
    setUrls((prev) => prev.filter((u) => u.shortCode !== code));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setAuthView('login');
  };

  if (authChecking) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Check for reset password redirect from email link
  const params = new URLSearchParams(window.location.search);
  if (params.get('resetPassword')) {
    return <ResetPasswordPage onResetSuccess={() => {
      // Clear the URL param and redirect to dashboard
      window.history.replaceState({}, document.title, '/');
      window.location.reload();
    }} />;
  }

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <SignupPage onGoToLogin={() => setAuthView('login')} onSignup={(userData) => { setUser(userData); setIsAuthenticated(true); }} />;
    }
    if (authView === 'forgot-password') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onGoToSignup={() => setAuthView('signup')} onGoToForgotPassword={() => setAuthView('forgot-password')} onLogin={(userData) => { setUser(userData); setIsAuthenticated(true); }} />;
  }

  return (
    <Dashboard
      urls={urls}
      loading={loading}
      onNewUrl={handleNewUrl}
      onDelete={handleDelete}
      onLogout={handleLogout}
      user={user}
      onUserUpdate={(updatedUser) => setUser(updatedUser)}
    />
  );
}
