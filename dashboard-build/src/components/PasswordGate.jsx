import { useState } from "react";
import { FONT, TEAL, GRAY_BG, WHITE, TEXT, MUTED, BORDER, RED } from "../constants";

export default function PasswordGate({ savedPass, onUnlock }) {
  const [pass,  setPass]  = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (pass === savedPass) { onUnlock(); }
    else { setError("incorrect password"); setPass(""); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: GRAY_BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "40px 44px", width: "100%", maxWidth: 380 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Huvud</div>
          <div style={{ fontSize: 15, color: MUTED }}>enter your password</div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 6 }}>Password</div>
        <input
          type="password" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          autoFocus
          style={{ fontFamily: FONT, fontSize: 15, color: TEXT, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", width: "100%", outline: "none", boxSizing: "border-box", marginBottom: 18 }}
          onFocus={e => e.target.style.borderColor = TEAL}
          onBlur={e  => e.target.style.borderColor = BORDER}
        />

        {error && (
          <div style={{ fontFamily: FONT, fontSize: 14, color: RED, background: "#fee2e2", border: `1px solid #fecaca`, borderRadius: 6, padding: "9px 14px", marginBottom: 18 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, padding: "11px 0", width: "100%", borderRadius: 20, border: `2px solid ${TEAL}`, background: TEAL, color: WHITE, cursor: "pointer" }}
        >
          unlock
        </button>
      </div>
    </div>
  );
}
