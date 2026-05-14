import { useState } from "react";
import { FONT, TEAL, TEAL_BG, GRAY_BG, WHITE, TEXT, MUTED, FAINT, BORDER, RED, STORAGE_KEY } from "../constants";

export default function LoginScreen({ onLogin }) {
  const [url,     setUrl]     = useState("http://");
  const [key,     setKey]     = useState("");
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!url || !key || !pass) { setError("all fields are required"); return; }
    if (pass !== confirm)      { setError("passwords do not match"); return; }
    if (pass.length < 6)       { setError("password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${url}/api/v1/user`, { headers: { Authorization: `Bearer ${key}` } });
      if (!res.ok) throw new Error(`could not connect — headscale returned ${res.status}`);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, key, pass }));
      onLogin({ url, key, pass });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const fields = [
    { label: "Headscale URL",      value: url,     set: setUrl,     type: "text",     placeholder: "http://100.x.x.x:8082" },
    { label: "API Key",            value: key,     set: setKey,     type: "password", placeholder: "hskey-api-..." },
    { label: "Dashboard Password", value: pass,    set: setPass,    type: "password", placeholder: "set a local password" },
    { label: "Confirm Password",   value: confirm, set: setConfirm, type: "password", placeholder: "repeat password" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: GRAY_BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "40px 44px", width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Huvud</div>
          <div style={{ fontSize: 15, color: MUTED }}>connect to your headscale server</div>
        </div>

        {fields.map(f => (
          <div key={f.label} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 6 }}>{f.label}</div>
            <input
              type={f.type} value={f.value}
              onChange={e => f.set(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder={f.placeholder}
              style={{ fontFamily: FONT, fontSize: 15, color: TEXT, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", width: "100%", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e  => e.target.style.borderColor = BORDER}
            />
          </div>
        ))}

        {error && (
          <div style={{ fontFamily: FONT, fontSize: 14, color: RED, background: "#fee2e2", border: `1px solid #fecaca`, borderRadius: 6, padding: "9px 14px", marginBottom: 18 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit} disabled={loading}
          style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, padding: "11px 0", width: "100%", borderRadius: 20, border: `2px solid ${TEAL}`, background: loading ? TEAL_BG : TEAL, color: loading ? TEAL : WHITE, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "connecting…" : "connect"}
        </button>

        <div style={{ fontSize: 12, color: FAINT, marginTop: 14, textAlign: "center" }}>
          stored locally in your browser
        </div>
      </div>
    </div>
  );
}
