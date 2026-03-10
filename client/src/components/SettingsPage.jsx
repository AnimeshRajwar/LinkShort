import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SettingsPage({ user, onUserUpdate }) {
  const [fullName, setFullName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setProfileMessage('');
    setLoadingProfile(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      if (updateError) {
        setError(updateError.message || 'Failed to update profile.');
      } else {
        setProfileMessage('Profile updated successfully.');
        if (onUserUpdate) {
          onUserUpdate({ ...user, name: fullName });
        }
      }
    } catch {
      setError('Failed to update profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoadingPassword(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to update password.');
      } else {
        setPasswordMessage('Password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Failed to update password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-900 text-2xl font-bold">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your account</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleUpdateProfile} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-slate-900 text-lg font-bold">Profile</h3>

          <div className="space-y-1">
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-600">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              placeholder="Your name"
            />
          </div>

          {profileMessage && <p className="text-emerald-600 text-sm">{profileMessage}</p>}

          <button
            type="submit"
            disabled={loadingProfile}
            className="rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loadingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <form onSubmit={handleUpdatePassword} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-slate-900 text-lg font-bold">Security</h3>

          <div className="space-y-1">
            <label className="text-sm text-slate-600">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-600">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
              placeholder="Repeat password"
            />
          </div>

          {passwordMessage && <p className="text-emerald-600 text-sm">{passwordMessage}</p>}

          <button
            type="submit"
            disabled={loadingPassword}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loadingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
}
