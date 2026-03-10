import { useState } from 'react';
import { deleteUrl } from '../api';

function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function UrlTable({ urls, onDelete, showHeader = true }) {
  const [deletingCode, setDeletingCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleDelete = async (code) => {
    if (!window.confirm('Delete this URL?')) return;
    setDeletingCode(code);
    try {
      await deleteUrl(code);
      onDelete(code);
    } catch {
      alert('Failed to delete');
    } finally {
      setDeletingCode(null);
    }
  };

  const handleCopy = async (url, code) => {
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1400);
  };

  return (
    <section className="flex flex-col gap-4">
      {showHeader && (
        <div className="flex items-center justify-between px-2">
          <h2 className="text-slate-900 text-xl font-bold leading-tight">Recent Links</h2>
          <button className="text-primary text-sm font-bold hover:underline">View all links</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {urls.length === 0 ? (
          <div className="text-center p-10 text-slate-500">
            <div className="text-4xl mb-2">⚡</div>
            No links yet. Shorten your first URL above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Original URL</th>
                  <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Shortened URL</th>
                  <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urls.map((u) => (
                  <tr key={u.shortCode} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-xs md:max-w-md">
                        <span className="text-slate-900 text-sm font-medium truncate">{u.originalUrl}</span>
                        <span className="text-slate-400 text-xs">{u.shortCode}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group">
                        <a href={u.shortUrl} target="_blank" rel="noreferrer" className="text-primary text-sm font-bold">
                          {u.shortUrl.replace(/^https?:\/\//, '')}
                        </a>
                        <button
                          className="text-slate-400 hover:text-primary transition-all"
                          onClick={() => handleCopy(u.shortUrl, u.shortCode)}
                        >
                          <span className="material-symbols-outlined text-base">
                            {copiedCode === u.shortCode ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {u.clicks}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-sm">{timeAgo(u.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleDelete(u.shortCode)}
                          disabled={deletingCode === u.shortCode}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {deletingCode === u.shortCode ? 'hourglass_top' : 'delete'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
