import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { StatusBadge, StageBadge } from "../components/StatusBadge";
import { getFields, createField, deleteField, updateField, getAgents } from "../api/fields";

const STAGES = ["PLANTED", "GROWING", "READY", "HARVESTED"];

const EMPTY_FORM = { name: "", cropType: "", plantingDate: "", assignedAgentId: "" };

function FieldFormModal({ agents, initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [form,    setForm]    = useState(initial ? {
    name: initial.name,
    cropType: initial.cropType,
    plantingDate: initial.plantingDate?.slice(0, 10),
    assignedAgentId: initial.assignedAgentId ?? "",
    stage: initial.stage,
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        cropType: form.cropType,
        plantingDate: form.plantingDate,
        assignedAgentId: form.assignedAgentId || null,
        ...(isEdit && form.stage ? { stage: form.stage } : {}),
      };
      if (isEdit) await updateField(initial.id, payload);
      else        await createField(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save field.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Field" : "Add Field"}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="login-err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Field Name</label>
            <input className="form-input" value={form.name} onChange={set("name")} required placeholder="e.g. North Block – Maize" />
          </div>
          <div className="form-group">
            <label className="form-label">Crop Type</label>
            <input className="form-input" value={form.cropType} onChange={set("cropType")} required placeholder="e.g. Maize" />
          </div>
          <div className="form-group">
            <label className="form-label">Planting Date</label>
            <input className="form-input" type="date" value={form.plantingDate} onChange={set("plantingDate")} required />
          </div>
          {isEdit && (
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="form-select" value={form.stage} onChange={set("stage")}>
                {STAGES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Assign Agent <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span></label>
            <select className="form-select" value={form.assignedAgentId} onChange={set("assignedAgentId")}>
              <option value="">— Unassigned —</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Field"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FieldsManage() {
  const navigate = useNavigate();
  const [fields,  setFields]  = useState([]);
  const [agents,  setAgents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | "create" | field_object

  const load = () =>
    Promise.all([getFields(), getAgents()])
      .then(([f, a]) => { setFields(f); setAgents(a); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (field, e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${field.name}"? This cannot be undone.`)) return;
    await deleteField(field.id);
    load();
  };

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
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="page-title">Manage Fields</h1>
            <p className="page-sub">{fields.length} field{fields.length !== 1 ? "s" : ""} total</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal("create")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Field
          </button>
        </div>

        <div className="card" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <div className="table-wrap">
            <table style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Field Sector</th>
                  <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Vegetable</th>
                  <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Stage</th>
                  <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Health</th>
                  <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Agent</th>
                  <th style={{ background: 'transparent', color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 8, paddingLeft: 32 }}>Update</th>
                  <th style={{ background: 'transparent' }}></th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 && (
                  <tr><td colSpan={7} className="empty">No fields yet. Add one above.</td></tr>
                )}
                {fields.map((f) => {
                  const lastUpdate = f.updates?.[0];
                  return (
                    <tr 
                      key={f.id} 
                      className="td-clickable" 
                      onClick={() => navigate(`/admin/fields/${f.id}`)}
                      style={{ background: 'var(--white)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                    >
                      <td className="td-primary" style={{ borderTopLeftRadius: 16, borderBottomLeftRadius: 16, fontWeight: 700, padding: '24px 32px', fontSize: 15 }}>{f.name}</td>
                      <td style={{ padding: '24px 32px', color: 'var(--gray-600)' }}>{f.cropType}</td>
                      <td style={{ padding: '24px 32px' }}><StageBadge stage={f.stage} /></td>
                      <td style={{ padding: '24px 32px' }}><StatusBadge status={f.status} /></td>
                      <td style={{ padding: '24px 32px', fontWeight: 600, color: 'var(--forest-900)' }}>
                        {f.assignedAgent?.name ?? <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: '24px 32px', color: 'var(--gray-500)', fontSize: 13 }}>
                        {lastUpdate ? timeAgo(lastUpdate.createdAt) : <span style={{ color: "var(--gray-400)" }}>—</span>}
                      </td>
                      <td style={{ borderTopRightRadius: 16, borderBottomRightRadius: 16, padding: '24px 32px' }}>
                        <div style={{ display: "flex", gap: 12, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '8px 16px', borderRadius: 10 }} onClick={() => setModal(f)}>Edit</button>
                          <button className="btn btn-danger btn-sm" style={{ padding: '8px 16px', borderRadius: 10, background: '#fef2f2', color: '#991b1b', border: 'none' }} onClick={(e) => handleDelete(f, e)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <FieldFormModal
            agents={agents}
            initial={modal === "create" ? null : modal}
            onClose={() => setModal(null)}
            onSaved={load}
          />
        )}
      </main>
    </div>
  );
}
