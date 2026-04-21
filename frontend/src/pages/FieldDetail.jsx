import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { StatusBadge, StageBadge } from "../components/StatusBadge";
import LogUpdateModal from "../components/LogUpdateModal";
import { getField } from "../api/fields";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function FieldDetail() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [field,   setField]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);

  const basePath = user?.role === "ADMIN" ? "/admin" : "/agent";

  const load = () =>
    getField(id).then(setField).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="main"><div className="spinner">Loading…</div></main>
    </div>
  );

  if (!field) return (
    <div className="layout">
      <Sidebar />
      <main className="main"><div className="empty">Field not found.</div></main>
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <button className="back-btn" onClick={() => navigate(basePath)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="page-title">{field.name}</h1>
            <p className="page-sub">{field.cropType}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StatusBadge status={field.status} />
            {(user?.role === "AGENT" || user?.role === "ADMIN") && field.stage !== "HARVESTED" && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
                Log Update
              </button>
            )}
          </div>
        </div>

        <div className="two-col" style={{ gap: 40, alignItems: 'start' }}>
          {/* Details card */}
          <div className="card" style={{ padding: 32, flex: 1.2 }}>
            <div className="card-header" style={{ padding: '0 0 24px 0', border: 'none' }}>
              <span className="card-title" style={{ fontSize: 20, fontWeight: 800 }}>Primary Information</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 24px' }}>
                {[
                  ["Crop Type",      field.cropType],
                  ["Planting Date",  formatDate(field.plantingDate)],
                  ["Current Stage",  <StageBadge stage={field.stage} />],
                  ["Health Status",  <StatusBadge status={field.status} />],
                  ["Assigned Agent", <b>{field.assignedAgent?.name ?? "Unassigned"}</b>],
                  ["Field Created",  formatDate(field.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: 15, color: 'var(--gray-900)', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Update history styled as high-fidelity timeline */}
          <div className="card" style={{ background: 'var(--forest-100)', border: 'none', padding: 32, flex: 1.8, borderRadius: 24 }}>
            <div className="card-header" style={{ borderBottom: 'none', padding: '0 0 32px 0', background: 'transparent' }}>
              <span className="card-title" style={{ fontSize: 18, fontWeight: 800 }}>Update History</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--forest-900)", opacity: 0.7 }}>{field.updates?.length ?? 0} LOGS</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {(!field.updates || field.updates.length === 0) && (
                <div className="empty" style={{ padding: "24px 0" }}>No updates logged yet.</div>
              )}
              <div className="activity-stream">
                {field.updates?.map((u) => {
                  const agentInitials = u.agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
                  return (
                    <div className="activity-item" key={u.id}>
                      <div className="agent-avatar">{agentInitials}</div>
                      <div className="activity-content">
                        <div className="activity-narrative">
                          <b>{u.agent?.name}</b> moved sector to <StageBadge stage={u.stage} />
                        </div>
                        {u.notes && (
                          <div style={{ 
                            marginTop: 12, 
                            padding: 16, 
                            background: 'var(--white)', 
                            borderRadius: '0 16px 16px 16px', 
                            fontSize: 14, 
                            color: 'var(--gray-700)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            border: '1px solid rgba(0,0,0,0.05)'
                          }}>
                            {u.notes}
                          </div>
                        )}
                        <div className="activity-time">
                          {formatDateTime(u.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {modal && (
          <LogUpdateModal
            field={field}
            onClose={() => setModal(false)}
            onSaved={load}
          />
        )}
      </main>
    </div>
  );
}
