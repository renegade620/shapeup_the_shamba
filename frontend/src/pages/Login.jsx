import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      signIn(data.token, data.user);
      navigate(data.user.role === "ADMIN" ? "/admin" : "/agent");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="sidebar-logo" style={{ marginBottom: 40, justifyContent: 'center', padding: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--forest-900)" strokeWidth="2.5">
            <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-0 5-4 9-10 9z" />
          </svg>
          <div className="sidebar-logo-text" style={{ color: 'var(--forest-900)', fontSize: 24 }}>yourshamba</div>
        </div>

        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--gray-900)' }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Log in to monitor your field sectors</p>
        </div>

        {error && <div className="login-err" style={{ borderRadius: 12, padding: 12, marginBottom: 24 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>Email address</label>
            <input
              type="email"
              className="form-input"
              style={{ width: '100%', padding: '14px' }}
              placeholder="name@shamba.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>Password</label>
            <input
              type="password"
              className="form-input"
              style={{ width: '100%', padding: '14px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: 16, fontSize: 16, borderRadius: 12 }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>

        <div style={{ marginTop: 32, padding: "20px", background: "var(--forest-50)", borderRadius: "var(--radius)", border: "1px solid var(--forest-100)" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "var(--forest-900)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>Demo Credentials</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { role: "Admin", email: "franklinegift@gmail.com" },
              { role: "Agent", email: "omondifrankline6@gmail.com" },
              { role: "Agent", email: "fwere@colmusk.ai" },
            ].map(({ role, email: e }) => (
              <button
                key={e}
                type="button"
                style={{ display: "flex", justifyContent: "space-between", background: "var(--white)", border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: "8px", fontSize: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                onClick={() => { setEmail(e); setPassword("password123"); }}
              >
                <span style={{ fontWeight: 700, color: "var(--gray-700)" }}>{role}</span>
                <span style={{ color: "var(--forest-900)", fontFamily: "monospace", opacity: 0.8 }}>{e}</span>
              </button>
            ))}
            <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 8, textAlign: 'center' }}>Click a row to fill · Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
