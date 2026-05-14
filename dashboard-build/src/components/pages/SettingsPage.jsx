import { useState } from "react";
import { FONT, TEAL, MUTED, BORDER, GREEN, RED, STORAGE_KEY, UPTIME_KUMA_URL, UPTIME_KUMA_SLUG } from "../../constants";
import SectionHeading from "../shared/SectionHeading";
import FieldLabel     from "../shared/FieldLabel";
import ReadBox        from "../shared/ReadBox";
import Btn            from "../shared/Btn";

export default function SettingsPage({ config, setConfig, refetch, loading, error, onLogout }) {
  const [newPass,    setNewPass]    = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [passMsg,    setPassMsg]    = useState(null);

  function handleChangePassword() {
    setPassMsg(null);
    if (!newPass)               { setPassMsg({ type: "err", text: "enter a new password" }); return; }
    if (newPass.length < 6)     { setPassMsg({ type: "err", text: "must be at least 6 characters" }); return; }
    if (newPass !== confirmNew)  { setPassMsg({ type: "err", text: "passwords do not match" }); return; }
    const updated = { ...config, pass: newPass };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setConfig(updated);
    setNewPass(""); setConfirmNew("");
    setPassMsg({ type: "ok", text: "password updated" });
  }

  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 900 }}>
      <SectionHeading>Settings</SectionHeading>

      <FieldLabel>Headscale URL</FieldLabel>
      <ReadBox value={config.url} />

      <FieldLabel>API Key</FieldLabel>
      <ReadBox value="hskey-api-••••••••••••••••••••••••••••••••" />

      <FieldLabel>Uptime Kuma</FieldLabel>
      <ReadBox value={UPTIME_KUMA_URL ? `${UPTIME_KUMA_URL} · slug: ${UPTIME_KUMA_SLUG}` : "not configured"} />

      {error && (
        <div style={{ fontFamily: FONT, fontSize: 14, color: RED, background: "#fee2e2", border: `1px solid #fecaca`, borderRadius: 6, padding: "10px 14px", marginBottom: 22 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 44 }}>
        <Btn onClick={refetch}>{loading ? "Syncing…" : "↺ Sync Now"}</Btn>
        <Btn onClick={onLogout} outline danger>Log Out</Btn>
      </div>

      <SectionHeading>Change Password</SectionHeading>

      <FieldLabel>New Password</FieldLabel>
      <input
        type="password" value={newPass}
        onChange={e => setNewPass(e.target.value)}
        placeholder="new password"
        style={{ fontFamily: FONT, fontSize: 15, color: "#1a1a1a", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, width: "100%", maxWidth: 380, outline: "none", display: "block" }}
        onFocus={e => e.target.style.borderColor = TEAL}
        onBlur={e  => e.target.style.borderColor = BORDER}
      />

      <FieldLabel>Confirm New Password</FieldLabel>
      <input
        type="password" value={confirmNew}
        onChange={e => setConfirmNew(e.target.value)}
        placeholder="repeat new password"
        style={{ fontFamily: FONT, fontSize: 15, color: "#1a1a1a", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, width: "100%", maxWidth: 380, outline: "none", display: "block" }}
        onFocus={e => e.target.style.borderColor = TEAL}
        onBlur={e  => e.target.style.borderColor = BORDER}
      />

      {passMsg && (
        <div style={{
          fontFamily: FONT, fontSize: 14,
          color:      passMsg.type === "ok" ? GREEN : RED,
          background: passMsg.type === "ok" ? "#dcfce7" : "#fee2e2",
          border:     `1px solid ${passMsg.type === "ok" ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: 6, padding: "9px 14px", marginBottom: 16, maxWidth: 380,
        }}>
          {passMsg.text}
        </div>
      )}

      <Btn onClick={handleChangePassword}>Update Password</Btn>
    </div>
  );
}
