import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Helpers ───────────────────────────────────────────────── */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const EmptyState = () => (
  <div className="text-center py-16 space-y-3">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
      <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-slate-300 font-semibold">All caught up!</p>
    <p className="text-slate-500 text-sm">No doctors are currently awaiting approval.</p>
  </div>
);

/* ── Main Component ────────────────────────────────────────── */
const AdminDashboard = () => {
  const { firebaseUser, BACKEND_URL } = useAuth();
  const { addToast } = useToast();

  const [doctors,   setDoctors]   = useState([]);
  const [fetching,  setFetching]  = useState(true);
  const [approving, setApproving] = useState(null);  // firebaseUid being approved

  /* ── Fetch pending doctors ───────────────────────────────── */
  const fetchPendingDoctors = useCallback(async () => {
    setFetching(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res   = await fetch(`${BACKEND_URL}/api/admin/pending-doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDoctors(data.doctors);
    } catch (err) {
      addToast(err.message || 'Failed to fetch pending doctors.', 'error');
    } finally {
      setFetching(false);
    }
  }, [firebaseUser, BACKEND_URL, addToast]);

  useEffect(() => { fetchPendingDoctors(); }, [fetchPendingDoctors]);

  /* ── Approve a doctor ────────────────────────────────────── */
  const handleApprove = async (uid, name) => {
    setApproving(uid);
    try {
      const token = await firebaseUser.getIdToken();
      const res   = await fetch(`${BACKEND_URL}/api/admin/approve/${uid}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDoctors((prev) => prev.filter((d) => d.firebaseUid !== uid));
      addToast(`Dr. ${name} has been approved successfully.`, 'success');
    } catch (err) {
      addToast(err.message || 'Approval failed. Please try again.', 'error');
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-cyan">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Administrator
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Doctor Approval Queue</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Review and approve PMDC-registered physicians awaiting platform access.
            </p>
          </div>

          <button
            id="admin-refresh-btn"
            onClick={fetchPendingDoctors}
            disabled={fetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 transition-all border border-white/10 hover:border-white/20 hover:bg-white/5 disabled:opacity-50 shrink-0"
          >
            <svg className={`w-4 h-4 ${fetching ? 'animate-spin-slow' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stats bar ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Pending Approval', value: doctors.length, color: 'amber', icon: '⏳' },
            { label: 'Reviewed Today',   value: '—',            color: 'cyan',  icon: '✅' },
            { label: 'Admin Account',    value: 'You',          color: 'emerald', icon: '🛡️' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-4">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table card ──────────────────────────────────── */}
        <div className="glass-card overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(34,211,238,0.08), 0 25px 60px rgba(0,0,0,0.4)' }}>

          {/* Table header */}
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-semibold text-slate-300">Pending Doctors</span>
              {!fetching && (
                <span className="ml-auto badge-amber">{doctors.length} pending</span>
              )}
            </div>
          </div>

          {fetching ? (
            <div className="py-16">
              <LoadingSpinner message="Loading pending doctors…" />
            </div>
          ) : doctors.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Physician', 'Contact', 'PMDC Number', 'Applied', 'Action'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {doctors.map((doc) => (
                    <tr
                      key={doc.firebaseUid}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Name + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-cyan-300"
                            style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(2,132,199,0.2))', border: '1px solid rgba(34,211,238,0.15)' }}>
                            {doc.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">Dr. {doc.name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-400 text-xs">{doc.email}</td>

                      {/* PMDC */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg text-cyan-300"
                          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.12)' }}>
                          {doc.pmdcNumber || '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(doc.createdAt)}</td>

                      {/* Approve button */}
                      <td className="px-6 py-4">
                        <button
                          id={`approve-btn-${doc.firebaseUid}`}
                          onClick={() => handleApprove(doc.firebaseUid, doc.name)}
                          disabled={approving === doc.firebaseUid}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                        >
                          {approving === doc.firebaseUid ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {approving === doc.firebaseUid ? 'Approving…' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
