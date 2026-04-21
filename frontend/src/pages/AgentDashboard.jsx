import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { StatusBadge, StageBadge } from "../components/StatusBadge";
import LogUpdateModal from "../components/LogUpdateModal";
import { getFields } from "../api/fields";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [fields,  setFields]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);

  const load = () =>
    getFields().then(setFields).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = fields.filter((f) => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.cropType.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 className="page-title">My Field Sectors</h1>
            <p className="page-sub">Monitoring plant health and lifecycle stages</p>
          </div>
          <div className="filter-bar" style={{ width: '300px' }}>
            <div style={{ position: 'relative' }}>
              <svg 
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                className="form-input" 
                placeholder="Search sectors..." 
                style={{ paddingLeft: 38, width: '100%', background: 'var(--forest-50)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {fields.length === 0 && (
          <div className="card">
            <div className="empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <p>No field sectors assigned to you yet.</p>
            </div>
          </div>
        )}

        {fields.length > 0 && filtered.length === 0 && (
          <div className="empty">No sectors match your search.</div>
        )}

        <div className="field-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {filtered.map((f) => {
            const lastUpdate = f.updates?.[0];
            return (
              <div
                className="field-card"
                key={f.id}
                onClick={() => navigate(`/agent/fields/${f.id}`)}
                style={{ background: f.status === 'ACTIVE' ? 'var(--forest-100)' : 'var(--white)', border: 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ width: 80, height: 80, background: 'var(--white)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.04)' }}>
                   {/* Illustrative Crop Icon placeholder */}
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--forest-900)" strokeWidth="2">
                      <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-0 5-4 9-10 9z"/>
                   </svg>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div className="field-card-name" style={{ fontSize: 18 }}>{f.name}</div>
                  <div className="field-card-crop" style={{ marginBottom: 12 }}>{f.cropType}</div>
                  <StageBadge stage={f.stage} />
                </div>

                <div className="field-card-footer" style={{ borderTop: 'none', marginTop: 20, paddingTop: 0 }}>
                   <div style={{ width: '100%' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                        <span style={{ color: 'var(--gray-500)' }}>Condition</span>
                        <span style={{ color: 'var(--forest-900)' }}>{f.status === 'ACTIVE' ? 'Optimal' : f.status === 'AT_RISK' ? 'Critical' : 'Completed'}</span>
                     </div>
                     <div style={{ height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: f.status === 'ACTIVE' ? '85%' : f.status === 'AT_RISK' ? '30%' : '100%', background: f.status === 'ACTIVE' ? 'var(--forest-900)' : f.status === 'AT_RISK' ? '#f59e0b' : 'var(--gray-400)' }} />
                     </div>
                   </div>
                </div>
                
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 20, borderRadius: 10 }}
                    onClick={(e) => { e.stopPropagation(); setModal(f); }}
                  >
                    Log Progress
                </button>
              </div>
            );
          })}
        </div>

        {modal && (
          <LogUpdateModal
            field={modal}
            onClose={() => setModal(null)}
            onSaved={load}
          />
        )}
      </main>
    </div>
  );
}
