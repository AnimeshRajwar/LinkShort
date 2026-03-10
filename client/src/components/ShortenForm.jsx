import { useState } from 'react';
import { shortenUrl } from '../api';

export default function ShortenForm({ onNewUrl }) {
  const [url, setUrl] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) return setError('Please enter a URL');
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await shortenUrl({ originalUrl: url.trim(), expiresIn: expiresIn || undefined });
      setResult(res.data);
      onNewUrl && onNewUrl(res.data);
      setUrl('');
      setExpiresIn('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl z-10">
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="flex-1 flex items-center bg-white rounded-lg px-4 border border-slate-200">
          <span className="material-symbols-outlined text-slate-400 mr-2">link</span>
          <input
            className="w-full py-3 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400"
            placeholder="Paste a long URL here (e.g. https://very-long-link.com/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span className="material-symbols-outlined">bolt</span>
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 gap-3 mt-3">
          <div>
            <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Expires In (days)</label>
            <input
              className="w-full rounded-lg border border-white/25 bg-white/10 text-white placeholder:text-slate-300 px-3 py-2 text-sm focus:ring-primary"
              type="number"
              placeholder="30"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              min="1"
            />
          </div>
        </div>
      )}

      <button className="text-white/80 text-xs mt-3 hover:text-white" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? '− Hide options' : '+ Advanced options'}
      </button>

      {error && <div className="mt-3 rounded-lg border border-red-300/40 bg-red-400/20 text-red-100 px-3 py-2 text-sm">{error}</div>}

      {result && (
        <div className="mt-3 p-3 bg-emerald-400/20 border border-emerald-300/40 rounded-lg flex items-center justify-between gap-2 flex-wrap">
          <a href={result.shortUrl} target="_blank" rel="noreferrer" className="text-emerald-100 font-semibold break-all">
            {result.shortUrl}
          </a>
          <button className="px-3 py-1.5 rounded-md bg-emerald-300 text-emerald-950 font-semibold text-sm" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}
