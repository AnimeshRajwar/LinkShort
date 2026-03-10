export default function StatsBar({ urls }) {
  const totalClicks = urls.reduce((a, u) => a + u.clicks, 0);
  const activeLinks = urls.filter((u) => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
  
  // Calculate top location from click history
  const locationCounts = {};
  urls.forEach(url => {
    if (url.clickHistory) {
      url.clickHistory.forEach(click => {
        const location = click.country || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
    }
  });
  
  const topLocation = Object.keys(locationCounts).length > 0
    ? Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'No data';

  const stats = [
    {
      label: 'Total Clicks',
      value: totalClicks.toLocaleString(),
      icon: 'ads_click',
      sub: 'Total traffic across all links',
      trend: '12%',
    },
    {
      label: 'Active Links',
      value: activeLinks.toLocaleString(),
      icon: 'link',
      sub: 'Live redirects currently active',
      trend: '5%',
    },
    {
      label: 'Top Location',
      value: topLocation,
      icon: 'public',
      sub: 'Highest regional engagement',
      trend: '0%',
      neutral: true,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{s.label}</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-slate-900 text-3xl font-bold leading-none tracking-tight">{s.value}</p>
            <span className={`${s.neutral ? 'text-slate-400' : 'text-emerald-500'} text-sm font-bold flex items-center pb-1`}>
              <span className="material-symbols-outlined text-sm">{s.neutral ? 'remove' : 'trending_up'}</span>
              {s.trend}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">{s.sub}</p>
        </div>
      ))}
    </section>
  );
}
