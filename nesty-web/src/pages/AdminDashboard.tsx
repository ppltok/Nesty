import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import PivotAnalytics from '../components/admin/PivotAnalytics';

// Admins are matched by email. Keep in sync with any server-side checks.
const ADMIN_EMAILS = ['yaniv@goldbarventures.com'];

type Tab = 'analytics';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('analytics');

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading…</div>;
  }

  // Gate: must be signed in and on the admin allow-list.
  const email = user?.email?.toLowerCase() ?? '';
  // In local dev (`npm run dev`) skip the gate so the admin tool is reachable
  // without a logged-in session. In a production build import.meta.env.DEV is
  // false, so the email allow-list is always enforced on the live site.
  const DEV_BYPASS = import.meta.env.DEV;
  if (!DEV_BYPASS && (!user || !ADMIN_EMAILS.includes(email))) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8f5fb]">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#86608e]">Nesty Admin · Analytics</h1>
          <Link to="/dashboard" className="text-sm text-[#86608e] hover:underline">
            ← Back to app
          </Link>
        </div>

        {/* Tab bar — single tab today, room to grow */}
        <div className="flex gap-2 mb-5 border-b border-[#e2d8ea]">
          {([['analytics', 'Pivot tables']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm -mb-px border-b-2 ${
                tab === key
                  ? 'border-[#86608e] text-[#86608e] font-semibold'
                  : 'border-transparent text-gray-500 hover:text-[#86608e]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'analytics' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <PivotAnalytics />
          </div>
        )}
      </div>
    </div>
  );
}
