import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { StatusBadge, StageBadge } from "../components/StatusBadge";
import { getFields, getFieldSummary } from "../api/fields";
import { getRecentUpdates } from "../api/updates";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [summary,    setSummary]    = useState(null);
  const [fields,     setFields]     = useState([]);
  const [activity,   setActivity]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    Promise.all([getFieldSummary(), getFields(), getRecentUpdates(10)])
      .then(([s, f, a]) => { setSummary(s); setFields(f); setActivity(a); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = fields.filter((f) => {
    const matchStatus = statusFilter === "ALL" || f.status === statusFilter;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                        f.cropType.toLowerCase().includes(search.toLowerCase()) ||
                        f.assignedAgent?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="main"><div className="spinner">Loading…</div></main>
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="page-title">General Overview</h1>
            <p className="page-sub">Monitoring productivity across all field sectors</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="card" style={{ padding: '8px 16px', borderRadius: '12px', background: 'var(--forest-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--forest-900)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--forest-900)' }}>
                {new Date().toLocaleDateString("en-KE", { day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stat cards inspired by "Weekly Progress" tiles */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 48 }}>
          {[
            { 
              label: "All Fields", 
              value: summary?.total ?? 0, 
              bg: 'var(--forest-100)',
              color: 'var(--forest-900)',
              icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> 
            },
            { 
              label: "Active", 
              value: summary?.active ?? 0, 
              bg: 'var(--lime)',
              color: '#065f46',
              icon: <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-0 5-4 9-10 9z"/> 
            },
            { 
              label: "At Risk", 
              value: summary?.atRisk ?? 0, 
              bg: '#fef3c7',
              color: '#92400e',
              icon: <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/> 
            },
            { 
              label: "Completed", 
              value: summary?.completed ?? 0, 
              bg: '#e0e7ff',
              color: '#3730a3',
              icon: <polyline points="20 6 9 17 4 12"/> 
            },
          ].map((item) => (
            <div className="stat-card" key={item.label} style={{ background: item.bg, border: 'none', padding: '32px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5">
                    {item.icon}
                  </svg>
                </div>
              </div>
              <div>
                <div className="stat-value" style={{ fontSize: '32px', color: item.color, marginBottom: 4 }}>{item.value}</div>
                <div className="stat-label" style={{ color: item.color, opacity: 0.7, textTransform: 'none', fontSize: 14 }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="two-col" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 64, alignItems: 'start' }}>
          {/* Fields table */}
          <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
            <div className="card-header" style={{ paddingLeft: 0, paddingRight: 0, background: 'transparent', marginBottom: 12 }}>
              <span className="card-title" style={{ fontSize: 24, fontWeight: 800 }}>Production Overview</span>
              <button className="btn btn-secondary btn-sm" style={{ borderRadius: 10, padding: '8px 16px' }} onClick={() => navigate("/admin/fields")}>
                Manage Sectors
              </button>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table style={{ borderCollapse: 'separate', borderSpacing: '0 16px' }}>
                  <thead>
                    <tr style={{ background: 'transparent' }}>
                      <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Field Sector</th>
                      <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Vegetable</th>
                      <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Stage</th>
                      <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={4} className="empty">No fields match your filters.</td></tr>
                    )}
                    {filtered.map((f) => {
                      return (
                        <tr
                          key={f.id}
                          className="td-clickable"
                          onClick={() => navigate(`/admin/fields/${f.id}`)}
                          style={{ background: 'var(--forest-50)' }}
                        >
                          <td className="td-primary" style={{ borderTopLeftRadius: 16, borderBottomLeftRadius: 16, fontWeight: 700, padding: '24px 32px', fontSize: 16 }}>{f.name}</td>
                          <td style={{ padding: '24px 32px', color: 'var(--gray-600)' }}>{f.cropType}</td>
                          <td style={{ padding: '24px 32px' }}><StageBadge stage={f.stage} /></td>
                          <td style={{ borderTopRightRadius: 16, borderBottomRightRadius: 16, padding: '24px 32px' }}><StatusBadge status={f.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity feed styled as a narrative timeline */}
          <div style={{ marginTop: 8 }}>
            <div className="card" style={{ background: 'var(--forest-100)', border: 'none', padding: 32, borderRadius: 24 }}>
              <div className="card-header" style={{ borderBottom: 'none', padding: '0 0 32px 0', background: 'transparent' }}>
                <span className="card-title" style={{ fontSize: 18, fontWeight: 800 }}>Recent Activity</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {activity.length === 0 && <div className="empty">No data available.</div>}
                <div className="activity-stream">
                  {activity.map((u) => {
                    const agentInitials = u.agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
                    return (
                      <div className="activity-item" key={u.id}>
                        <div className="agent-avatar">{agentInitials}</div>
                        <div className="activity-content">
                          <div className="activity-narrative">
                            <b>{u.agent?.name}</b> updated <b>{u.field?.name}</b> to <StageBadge stage={u.stage} />
                          </div>
                          <div className="activity-time">
                            {timeAgo(u.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
