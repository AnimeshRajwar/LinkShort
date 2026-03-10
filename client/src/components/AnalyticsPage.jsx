export default function AnalyticsPage({ urls }) {
  const allClicks = urls.flatMap((url) =>
    (url.clickHistory || []).map((click) => ({
      ...click,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
    }))
  );

  const totalClicks = allClicks.length;
  const uniqueCountries = new Set(allClicks.map((c) => c.country).filter(Boolean)).size;
  const uniqueReferrers = new Set(allClicks.map((c) => c.referrer).filter(Boolean)).size;

  const topLocations = Object.entries(
    allClicks.reduce((acc, click) => {
      const key = click.country || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topReferrers = Object.entries(
    allClicks.reduce((acc, click) => {
      const key = click.referrer || 'Direct';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentClicks = [...allClicks]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-900 text-2xl font-bold">Analytics</h2>
        <p className="text-slate-500 text-sm">Live click intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-slate-500 text-sm">Total Tracked Clicks</p>
          <p className="text-slate-900 text-3xl font-bold mt-1">{totalClicks}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-slate-500 text-sm">Countries Reached</p>
          <p className="text-slate-900 text-3xl font-bold mt-1">{uniqueCountries}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-slate-500 text-sm">Traffic Sources</p>
          <p className="text-slate-900 text-3xl font-bold mt-1">{uniqueReferrers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-slate-900 text-lg font-bold mb-4">Top Locations</h3>
          {topLocations.length === 0 ? (
            <p className="text-slate-500 text-sm">No location data yet.</p>
          ) : (
            <div className="space-y-3">
              {topLocations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="text-slate-700 text-sm">{location}</span>
                  <span className="text-slate-900 text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-slate-900 text-lg font-bold mb-4">Top Referrers</h3>
          {topReferrers.length === 0 ? (
            <p className="text-slate-500 text-sm">No referrer data yet.</p>
          ) : (
            <div className="space-y-3">
              {topReferrers.map(([referrer, count]) => (
                <div key={referrer} className="flex items-center justify-between gap-4">
                  <span className="text-slate-700 text-sm truncate">{referrer}</span>
                  <span className="text-slate-900 text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-slate-900 text-lg font-bold mb-4">Recent Click Activity</h3>
        {recentClicks.length === 0 ? (
          <p className="text-slate-500 text-sm">No clicks recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-2 text-slate-500 text-xs font-bold uppercase">Short Code</th>
                  <th className="py-2 text-slate-500 text-xs font-bold uppercase">Location</th>
                  <th className="py-2 text-slate-500 text-xs font-bold uppercase">Referrer</th>
                  <th className="py-2 text-slate-500 text-xs font-bold uppercase">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentClicks.map((click, idx) => (
                  <tr key={`${click.shortCode}-${click.timestamp}-${idx}`} className="border-b border-slate-50">
                    <td className="py-2 text-sm text-slate-800">{click.shortCode}</td>
                    <td className="py-2 text-sm text-slate-600">{click.city || 'Unknown'}, {click.country || 'Unknown'}</td>
                    <td className="py-2 text-sm text-slate-600 truncate max-w-[250px]">{click.referrer || 'Direct'}</td>
                    <td className="py-2 text-sm text-slate-600">{new Date(click.timestamp).toLocaleString()}</td>
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
