import { useState } from "react";
import { createUpdate } from "../api/updates";
import { StageBadge } from "./StatusBadge";

const STAGES = ["PLANTED", "GROWING", "READY", "HARVESTED"];

export default function LogUpdateModal({ field, onClose, onSaved }) {
  const [stage, setStage]   = useState(field.stage);
  const [notes, setNotes]   = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createUpdate(field.id, { stage, notes: notes.trim() || undefined });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Log Update</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 18 }}>
          <strong style={{ color: "var(--gray-900)" }}>{field.name}</strong> — {field.cropType}
        </p>

        {error && <div className="login-err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Stage</label>
            <select className="form-select" value={stage} onChange={(e) => setStage(e.target.value)}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <div style={{ marginTop: 8 }}><StageBadge stage={stage} /></div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Observations <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="form-textarea"
              placeholder="Describe what you observed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
