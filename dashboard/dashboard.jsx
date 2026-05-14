import React, { useState, useEffect, useCallback, useRef } from "react";

const FONT    = "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace";
const TEAL    = "#0d7377";
const TEAL_BG = "#eef6f6";
const GRAY_BG = "#f0f0f0";
const WHITE   = "#ffffff";
const TEXT    = "#1a1a1a";
const MUTED   = "#6b7280";
const FAINT   = "#9ca3af";
const BORDER  = "#d1d5db";
const GREEN   = "#16a34a";
const RED     = "#dc2626";

const STORAGE_KEY = "huvud_config";

const NODE_LOCATIONS = {
  "ramallah-hospital-1": { lat: 31.89975402722865,  lng: 35.20597188356702,  label: "Ramallah General Hospital" },
  "ramallah-ngo-1":      { lat: 31.9003183113595,   lng: 35.205510500419464, label: "Palestine Medical Complex" },
  "nablus-hospital-1":   { lat: 32.225483541046096, lng: 35.24148825740547,  label: "Rafidia Surgical Hospital" },
  "hebron-hospital-1":   { lat: 31.556892068592273, lng: 35.08346726691443,  label: "Al-Ahli Hospital Hebron"   },
};

const DISTRICT_COORDS = {
  RAMALLAH: { lat: 31.9038, lng: 35.2034 },
  NABLUS:   { lat: 32.2211, lng: 35.2544 },
  HEBRON:   { lat: 31.5326, lng: 35.0998 },
  JENIN:    { lat: 32.4607, lng: 35.2961 },
  TULKARM:  { lat: 32.3103, lng: 35.0281 },
  JERICHO:  { lat: 31.8567, lng: 35.4610 },
  SALFIT:   { lat: 32.0857, lng: 35.1786 },
  DEFAULT:  { lat: 31.9522, lng: 35.2332 },
};

const NAV = [
  { id: "overview",     label: "Overview",     icon: "⊞" },
  { id: "map",          label: "Map",          icon: "◎" },
  { id: "nodes",        label: "Nodes",        icon: "○" },
  { id: "users",        label: "Users",        icon: "□" },
  { id: "coordinates",  label: "Coordinates",  icon: "⌖" },
  { id: "uptime",       label: "Uptime",       icon: "◈" },
  { id: "settings",     label: "Settings",     icon: "⚙" },
];

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchNodes(url, key) {
  const res = await fetch(`${url}/api/v1/node`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`headscale ${res.status}`);
  const data = await res.json();
  return (data.nodes ?? []).map(n => ({
    id:       n.id,
    name:     n.name ?? "—",
    ip:       n.ipAddresses?.[0] ?? "—",
    district: n.user?.name?.toUpperCase() ?? (n.name ?? "").split("-")[0].toUpperCase() ?? "UNKNOWN",
    role:     (n.name ?? "").split("-")[1] ?? "—",
    status:   n.online ? "up" : "down",
    lastSeen: n.lastSeen ?? null,
    user:     n.user?.name ?? "—",
  }));
}

async function fetchUsers(url, key) {
  try {
    const res = await fetch(`${url}/api/v1/user`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.users ?? []).map(u => ({
      id:        u.id,
      name:      u.name,
      label:     u.name.charAt(0).toUpperCase() + u.name.slice(1),
      createdAt: u.createdAt,
    }));
  } catch { return []; }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
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
      onLogin({ url, key });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: GRAY_BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "40px 44px", width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: TEAL, marginBottom: 4 }}>huvud</div>
          <div style={{ fontSize: 15, color: MUTED }}>connect to your headscale server to continue</div>
        </div>
        {[
          { label: "Headscale URL",      value: url,     set: setUrl,     type: "text",     placeholder: "http://100.x.x.x:8082" },
          { label: "API Key",            value: key,     set: setKey,     type: "password", placeholder: "hskey-api-..." },
          { label: "Dashboard Password", value: pass,    set: setPass,    type: "password", placeholder: "set a local password" },
          { label: "Confirm Password",   value: confirm, set: setConfirm, type: "password", placeholder: "repeat password" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 6 }}>{f.label}</div>
            <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder={f.placeholder}
              style={{ fontFamily: FONT, fontSize: 15, color: TEXT, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", width: "100%", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = BORDER}
            />
          </div>
        ))}
        {error && <div style={{ fontFamily: FONT, fontSize: 14, color: RED, background: "#fee2e2", border: `1px solid #fecaca`, borderRadius: 6, padding: "9px 14px", marginBottom: 18 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, padding: "11px 0", width: "100%", borderRadius: 20, border: `2px solid ${TEAL}`, background: loading ? TEAL_BG : TEAL, color: loading ? TEAL : WHITE, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.1s" }}>
          {loading ? "connecting…" : "connect"}
        </button>
        <div style={{ fontSize: 13, color: FAINT, marginTop: 16, textAlign: "center" }}>credentials are stored locally in your browser only</div>
      </div>
    </div>
  );
}

// ─── PASSWORD GATE ────────────────────────────────────────────────────────────
function PasswordGate({ savedPass, onUnlock }) {
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
          <div style={{ fontSize: 24, fontWeight: 700, color: TEAL, marginBottom: 4 }}>huvud</div>
          <div style={{ fontSize: 15, color: MUTED }}>enter your dashboard password</div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 6 }}>Password</div>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="your dashboard password" autoFocus
          style={{ fontFamily: FONT, fontSize: 15, color: TEXT, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 14px", width: "100%", outline: "none", boxSizing: "border-box", marginBottom: 18 }}
          onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = BORDER}
        />
        {error && <div style={{ fontFamily: FONT, fontSize: 14, color: RED, background: "#fee2e2", border: `1px solid #fecaca`, borderRadius: 6, padding: "9px 14px", marginBottom: 18 }}>{error}</div>}
        <button onClick={handleSubmit} style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, padding: "11px 0", width: "100%", borderRadius: 20, border: `2px solid ${TEAL}`, background: TEAL, color: WHITE, cursor: "pointer" }}>
          unlock
        </button>
      </div>
    </div>
  );
}

// ─── CLOCK ────────────────────────────────────────────────────────────────────
function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <>{t.toISOString().slice(0, 19).replace("T", " ")} UTC</>;
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function SectionHeading({ children, sub }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: TEAL, margin: 0 }}>{children}</h2>
      {sub && <div style={{ fontFamily: FONT, fontSize: 15, color: MUTED, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEAL, marginBottom: 7 }}>{children}</div>;
}

function ReadBox({ value }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: 15, color: TEXT, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "11px 16px", marginBottom: 6, wordBreak: "break-all" }}>
      {value}
    </div>
  );
}

function HelperText({ children }) {
  return <div style={{ fontFamily: FONT, fontSize: 14, color: MUTED, marginBottom: 22 }}>{children}</div>;
}

function Btn({ children, onClick, outline = false, danger = false }) {
  const [h, setH] = useState(false);
  const bc = danger ? RED : TEAL;
  const bg = danger ? (h ? "#b91c1c" : RED) : outline ? (h ? TEAL_BG : "transparent") : (h ? "#0a5c60" : TEAL);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, padding: "9px 22px", borderRadius: 20, cursor: "pointer", border: `2px solid ${bc}`, background: bg, color: outline && !danger ? TEAL : danger && outline ? RED : WHITE, transition: "all 0.1s" }}>
      {children}
    </button>
  );
}

function StatusDot({ up }) {
  return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: up ? GREEN : FAINT, flexShrink: 0 }} />;
}

function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, padding: "20px 24px", borderRight: `1px solid ${BORDER}` }}>
      <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: TEXT }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: 14, color: MUTED, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Table({ cols, rows, onRowClick, selectedKey, keyField = "id" }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "), padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, fontFamily: FONT, fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG }}>
        {cols.map(c => <span key={c.key + c.label}>{c.label}</span>)}
      </div>
      {rows.length === 0 && <div style={{ padding: "28px 20px", fontFamily: FONT, fontSize: 15, color: FAINT, textAlign: "center" }}>no data</div>}
      {rows.map((row, i) => (
        <div key={row[keyField] ?? i} onClick={() => onRowClick?.(row)}
          style={{ display: "grid", gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "), padding: "12px 20px", alignItems: "center", borderBottom: i < rows.length-1 ? `1px solid ${BORDER}` : "none", background: selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent", cursor: onRowClick ? "pointer" : "default", transition: "background 0.1s" }}
          onMouseEnter={e => { if (!selectedKey || row[keyField] !== selectedKey) e.currentTarget.style.background = "#f9fafb"; }}
          onMouseLeave={e => { e.currentTarget.style.background = selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent"; }}
        >
          {cols.map(c => (
            <span key={c.key + c.label} style={{ fontFamily: FONT, fontSize: 15, color: c.color?.(row) ?? TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.render ? c.render(row) : row[c.key]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, open, setOpen }) {
  return (
    <div style={{
      width: open ? 220 : 56,
      flexShrink: 0,
      background: GRAY_BG,
      borderRight: `1px solid ${BORDER}`,
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      transition: "width 0.2s ease",
      overflow: "hidden",
    }}>
      {/* Header — hamburger + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 16px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div
          onClick={() => setOpen(o => !o)}
          style={{ display: "flex", flexDirection: "column", gap: 5, cursor: "pointer", flexShrink: 0 }}
          title={open ? "collapse sidebar" : "expand sidebar"}
        >
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 20, height: 2, background: TEAL, borderRadius: 1, transition: "all 0.2s" }} />
          ))}
        </div>
        {open && (
          <span style={{ fontSize: 19, fontWeight: 700, color: TEAL, whiteSpace: "nowrap", overflow: "hidden" }}>
            huvud
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setActive(item.id)}
              title={!open ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: open ? 12 : 0,
                justifyContent: open ? "flex-start" : "center",
                padding: open ? "11px 20px" : "11px 0",
                cursor: "pointer", fontSize: 16,
                color: isActive ? TEAL : TEXT,
                background: isActive ? TEAL_BG : "transparent",
                borderLeft: isActive ? `3px solid ${TEAL}` : "3px solid transparent",
                transition: "all 0.1s", userSelect: "none",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#e5e7eb"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 17, flexShrink: 0, width: open ? 20 : "100%", textAlign: "center" }}>{item.icon}</span>
              {open && <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      {/* Clock — only when open */}
      <div style={{ padding: open ? "14px 20px" : "14px 0", borderTop: `1px solid ${BORDER}`, fontSize: 12, color: FAINT, textAlign: open ? "left" : "center", overflow: "hidden", whiteSpace: "nowrap" }}>
        {open ? <Clock /> : "·"}
      </div>
    </div>
  );
}

// ─── MAP PAGE ─────────────────────────────────────────────────────────────────
function MapPage({ nodes }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const pins = Object.entries(NODE_LOCATIONS).map(([hostname, loc]) => {
    const node = nodes.find(n => n.name === hostname);
    return { hostname, lat: loc.lat, lng: loc.lng, label: loc.label, status: node ? node.status : "unconfigured", ip: node ? node.ip : "—", district: node ? node.district : hostname.split("-")[0].toUpperCase() };
  });
  nodes.forEach(node => {
    if (!NODE_LOCATIONS[node.name]) {
      const c = DISTRICT_COORDS[node.district] ?? DISTRICT_COORDS.DEFAULT;
      pins.push({ hostname: node.name, label: node.name, lat: c.lat+(Math.random()-0.5)*0.008, lng: c.lng+(Math.random()-0.5)*0.008, status: node.status, ip: node.ip, district: node.district });
    }
  });

  const pinColor = s => s === "up" ? GREEN : s === "unconfigured" ? FAINT : RED;

  useEffect(() => {
    if (leafletRef.current) return;
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
    const script = document.createElement("script"); script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.onload = () => initMap(); document.head.appendChild(script);
  }, []);

  useEffect(() => { if (window.L && leafletRef.current) updateMarkers(); }, [nodes]);

  function initMap() {
    if (!mapRef.current || leafletRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [32.0, 35.25], zoom: 9 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom: 18 }).addTo(map);
    leafletRef.current = { map, markers: [] };
    updateMarkers();
  }

  function updateMarkers() {
    if (!leafletRef.current) return;
    const L = window.L;
    leafletRef.current.markers.forEach(m => m.remove());
    leafletRef.current.markers = [];
    pins.forEach(pin => {
      const color = pinColor(pin.status);
      const icon = L.divIcon({ className: "", html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;"></div>`, iconSize:[22,22], iconAnchor:[11,11] });
      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(leafletRef.current.map)
        .bindPopup(`<div style="font-family:${FONT};font-size:13px;min-width:200px;line-height:1.7"><div style="font-weight:700;color:${TEAL};font-size:15px;margin-bottom:8px">${pin.label}</div><div style="color:#555">hostname: <span style="color:#111">${pin.hostname}</span></div><div style="color:#555">ip: <span style="color:#111">${pin.ip}</span></div><div style="color:#555">user: <span style="color:#111">${pin.district.toLowerCase()}</span></div><div style="color:#555;margin-top:6px">status: <span style="color:${color};font-weight:700">${pin.status}</span></div></div>`);
      marker.on("click", () => setSelected(pin));
      leafletRef.current.markers.push(marker);
    });
  }

  const up = pins.filter(p => p.status==="up").length;
  const dn = pins.filter(p => p.status==="down").length;
  const unc = pins.filter(p => p.status==="unconfigured").length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 50, background: WHITE, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 24, flexShrink: 0, fontFamily: FONT, fontSize: 15 }}>
        <span style={{ color: TEAL, fontWeight: 700, fontSize: 16 }}>Node Map</span>
        <span style={{ color: BORDER }}>·</span>
        <span style={{ color: GREEN }}>● {up} online</span>
        <span style={{ color: dn > 0 ? RED : FAINT }}>● {dn} offline</span>
        <span style={{ color: FAINT }}>● {unc} unconfigured</span>
        <span style={{ marginLeft: "auto", color: FAINT, fontSize: 13 }}>click a pin for details</span>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div ref={mapRef} style={{ flex: 1 }} />
        <div style={{ width: 290, flexShrink: 0, background: WHITE, borderLeft: `1px solid ${BORDER}`, overflowY: "auto", fontFamily: FONT }}>
          {selected ? (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 15, color: TEAL, fontWeight: 700, marginBottom: 16 }}>{selected.label}</div>
              {[
                { k: "hostname", v: selected.hostname },
                { k: "ip",       v: selected.ip },
                { k: "user",     v: selected.district.toLowerCase() },
                { k: "status",   v: selected.status, color: pinColor(selected.status) },
                { k: "lat",      v: selected.lat.toFixed(6) },
                { k: "lng",      v: selected.lng.toFixed(6) },
              ].map(r => (
                <div key={r.k} style={{ marginBottom: 14, borderBottom: `1px solid ${BORDER}`, paddingBottom: 14 }}>
                  <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{r.k}</div>
                  <div style={{ fontSize: 15, color: r.color ?? TEXT }}>{r.v}</div>
                </div>
              ))}
              <button onClick={() => setSelected(null)} style={{ fontFamily: FONT, fontSize: 14, color: MUTED, background: "none", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "6px 16px", cursor: "pointer", marginTop: 6 }}>close</button>
            </div>
          ) : (
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>all pins</div>
              {pins.map(pin => (
                <div key={pin.hostname} onClick={() => { setSelected(pin); leafletRef.current?.map.setView([pin.lat, pin.lng], 14); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 5, cursor: "pointer", marginBottom: 2, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = GRAY_BG}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: pinColor(pin.status) }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 14, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pin.label}</div>
                    <div style={{ fontSize: 12, color: FAINT }}>{pin.district.toLowerCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewPage({ nodes, users }) {
  const up   = nodes.filter(n => n.status === "up").length;
  const down = nodes.length - up;
  return (
    <div style={{ padding: "34px 44px", maxWidth: 980, width: "100%" }}>
      <SectionHeading sub="Headscale mesh network dashboard">Overview</SectionHeading>
      <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", background: WHITE, marginBottom: 38 }}>
        <StatBox label="total nodes" value={nodes.length} />
        <StatBox label="online"      value={up}           />
        <StatBox label="offline"     value={down}         />
        <StatBox label="users"       value={users.length} />
        <div style={{ flex: 1, padding: "20px 24px" }}>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: TEXT }}>{nodes.length ? `${Math.round((up/nodes.length)*100)}%` : "—"}</div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: MUTED, marginTop: 4 }}>uptime</div>
        </div>
      </div>

      <SectionHeading sub="Coverage per user">Users</SectionHeading>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 38 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 230px", padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, fontFamily: FONT, fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG }}>
          <span>user</span><span>nodes</span><span>online</span><span>coverage</span>
        </div>
        {users.length === 0 && <div style={{ padding: "28px 20px", fontFamily: FONT, fontSize: 15, color: FAINT, textAlign: "center" }}>no users yet</div>}
        {users.map((u, i) => {
          const dn  = nodes.filter(n => n.district === u.name.toUpperCase());
          const dup = dn.filter(n => n.status === "up").length;
          const pct = dn.length ? Math.round((dup/dn.length)*100) : 0;
          return (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 230px", padding: "13px 20px", alignItems: "center", borderBottom: i < users.length-1 ? `1px solid ${BORDER}` : "none" }}>
              <span style={{ fontFamily: FONT, fontSize: 16, color: TEXT, fontWeight: 500 }}>{u.label}</span>
              <span style={{ fontFamily: FONT, fontSize: 15, color: MUTED }}>{dn.length}</span>
              <span style={{ fontFamily: FONT, fontSize: 15, color: dup > 0 && dup === dn.length ? GREEN : dup === 0 && dn.length > 0 ? RED : MUTED }}>{dup}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: TEAL, borderRadius: 99 }} />
                </div>
                <span style={{ fontFamily: FONT, fontSize: 12, color: FAINT, width: 36 }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <SectionHeading sub="All registered nodes">Nodes</SectionHeading>
      <Table keyField="name" cols={[
        { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status==="up"} /> },
        { key: "name",     label: "hostname", width: "1fr"   },
        { key: "ip",       label: "ip",       width: "145px" },
        { key: "user",     label: "user",     width: "120px", color: () => MUTED },
        { key: "status",   label: "status",   width: "80px",  render: r => <span style={{ color: r.status==="up" ? GREEN : FAINT }}>{r.status}</span> },
      ]} rows={nodes} />
    </div>
  );
}

// ─── NODES ────────────────────────────────────────────────────────────────────
function NodesPage({ nodes }) {
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("");
  const filtered = nodes.filter(n => n.name.includes(filter) || n.ip.includes(filter) || n.user.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub={`${nodes.length} registered nodes`}>Nodes</SectionHeading>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="filter by name, ip, user…"
        style={{ fontFamily: FONT, fontSize: 15, color: TEXT, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 16px", marginBottom: 22, width: "100%", maxWidth: 440, outline: "none" }}
        onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = BORDER}
      />
      <Table keyField="name" selectedKey={selected?.name} onRowClick={r => setSelected(selected?.name===r.name ? null : r)} cols={[
        { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status==="up"} /> },
        { key: "name",     label: "hostname", width: "1fr"   },
        { key: "ip",       label: "ip",       width: "145px" },
        { key: "user",     label: "user",     width: "120px", color: () => MUTED },
        { key: "role",     label: "role",     width: "120px", color: () => MUTED },
        { key: "status",   label: "status",   width: "80px",  render: r => <span style={{ color: r.status==="up" ? GREEN : FAINT }}>{r.status}</span> },
      ]} rows={filtered} />
      {selected && (
        <>
          <SectionHeading sub="Selected node">Node Detail</SectionHeading>
          {[
            { k: "Hostname",    v: selected.name },
            { k: "IP Address",  v: selected.ip },
            { k: "User",        v: selected.user },
            { k: "Role",        v: selected.role },
            { k: "Status",      v: selected.status },
            { k: "Last Seen",   v: selected.lastSeen ? new Date(selected.lastSeen).toISOString().replace("T"," ").slice(0,19)+" UTC" : "—" },
            { k: "Tunnel",      v: "WireGuard" },
            { k: "Coordinates", v: NODE_LOCATIONS[selected.name] ? `${NODE_LOCATIONS[selected.name].lat}, ${NODE_LOCATIONS[selected.name].lng}` : "not set — add in Coordinates tab" },
          ].map(row => (
            <div key={row.k}>
              <FieldLabel>{row.k}</FieldLabel>
              <ReadBox value={row.v} />
              <div style={{ marginBottom: 12 }} />
            </div>
          ))}
          <Btn onClick={() => setSelected(null)}>Close</Btn>
        </>
      )}
    </div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────
function UsersPage({ nodes, users }) {
  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub="Each user is a namespace in Headscale — create users in Headscale to add them here">Users</SectionHeading>
      {users.length === 0 && <div style={{ fontFamily: FONT, fontSize: 15, color: FAINT, marginBottom: 28 }}>no users yet — create users in Headscale</div>}
      {users.map(u => {
        const dn  = nodes.filter(n => n.district === u.name.toUpperCase());
        const dup = dn.filter(n => n.status === "up").length;
        const pct = dn.length ? Math.round((dup/dn.length)*100) : 0;
        return (
          <div key={u.id} style={{ marginBottom: 44 }}>
            <FieldLabel>{u.label}</FieldLabel>
            <HelperText>{dn.length === 0 ? "no nodes registered under this user" : `${dup} of ${dn.length} nodes online · ${pct}% coverage`}</HelperText>
            {dn.length > 0 && <div style={{ height: 5, background: "#e5e7eb", borderRadius: 99, marginBottom: 18, maxWidth: 520 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: TEAL, borderRadius: 99, transition: "width 0.5s" }} />
            </div>}
            <Table keyField="name" cols={[
              { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status==="up"} /> },
              { key: "name",     label: "hostname",  width: "1fr"   },
              { key: "ip",       label: "ip",        width: "145px" },
              { key: "role",     label: "role",      width: "130px", color: () => MUTED },
              { key: "lastSeen", label: "last seen", width: "190px", render: r => <span style={{ color: FAINT, fontSize: 13 }}>{r.lastSeen ? new Date(r.lastSeen).toISOString().replace("T"," ").slice(0,16) : "—"}</span> },
              { key: "status",   label: "status",    width: "80px",  render: r => <span style={{ color: r.status==="up" ? GREEN : FAINT }}>{r.status}</span> },
            ]} rows={dn} />
          </div>
        );
      })}
      {users.length > 0 && (
        <>
          <SectionHeading sub="All users registered in Headscale">Summary</SectionHeading>
          <Table keyField="id" cols={[
            { key: "id",        label: "id",      width: "70px"  },
            { key: "label",     label: "user",    width: "1fr"   },
            { key: "createdAt", label: "created", width: "230px", render: r => <span style={{ color: FAINT, fontSize: 14 }}>{r.createdAt ? new Date(r.createdAt).toISOString().slice(0,10) : "—"}</span> },
          ]} rows={users} />
        </>
      )}
    </div>
  );
}

// ─── COORDINATES TAB ──────────────────────────────────────────────────────────
function CoordinatesPage({ nodes }) {
  const missing = nodes.filter(n => !NODE_LOCATIONS[n.name]);
  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub="Exact GPS coordinates per node — edit NODE_LOCATIONS in src/App.jsx">Coordinates</SectionHeading>

      <FieldLabel>How to add coordinates</FieldLabel>
      <div style={{ fontFamily: FONT, fontSize: 15, color: MUTED, marginBottom: 8 }}>1. Open Google Maps and find the exact building</div>
      <div style={{ fontFamily: FONT, fontSize: 15, color: MUTED, marginBottom: 8 }}>2. Right-click → copy coordinates</div>
      <div style={{ fontFamily: FONT, fontSize: 15, color: MUTED, marginBottom: 26 }}>3. Add an entry to NODE_LOCATIONS in src/App.jsx, rebuild and deploy</div>

      <FieldLabel>Configured Locations</FieldLabel>
      <HelperText>{Object.keys(NODE_LOCATIONS).length} nodes have exact coordinates</HelperText>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 38 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px 1fr 90px", padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, fontFamily: FONT, fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG }}>
          <span>hostname</span><span>lat</span><span>lng</span><span>label</span><span>status</span>
        </div>
        {Object.entries(NODE_LOCATIONS).map(([hostname, loc], i, arr) => {
          const node   = nodes.find(n => n.name === hostname);
          const status = node ? node.status : "unconfigured";
          return (
            <div key={hostname} style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px 1fr 90px", padding: "12px 20px", alignItems: "center", borderBottom: i < arr.length-1 ? `1px solid ${BORDER}` : "none", fontFamily: FONT, fontSize: 15 }}>
              <span style={{ color: TEXT }}>{hostname}</span>
              <span style={{ color: MUTED }}>{loc.lat.toFixed(5)}</span>
              <span style={{ color: MUTED }}>{loc.lng.toFixed(5)}</span>
              <span style={{ color: MUTED }}>{loc.label}</span>
              <span style={{ color: status==="up" ? GREEN : status==="unconfigured" ? FAINT : RED }}>{status}</span>
            </div>
          );
        })}
      </div>

      {missing.length > 0 && (
        <>
          <FieldLabel>Nodes Without Coordinates</FieldLabel>
          <HelperText>{missing.length} registered nodes falling back to user center on the map</HelperText>
          <Table keyField="name" cols={[
            { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status==="up"} /> },
            { key: "name",     label: "hostname", width: "1fr"   },
            { key: "user",     label: "user",     width: "140px", color: () => MUTED },
            { key: "role",     label: "role",     width: "130px", color: () => MUTED },
          ]} rows={missing} />
        </>
      )}

      <FieldLabel>Format</FieldLabel>
      <HelperText>Copy this snippet and fill in your values</HelperText>
      <div style={{ background: GRAY_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "16px 20px", fontFamily: FONT, fontSize: 14, color: TEXT, lineHeight: 1.8, marginBottom: 28 }}>
        <span style={{ color: TEAL }}>"hostname-role-1"</span>{": { "}
        <span style={{ color: TEAL }}>lat</span>{": "}<span style={{ color: MUTED }}>31.89975</span>{", "}
        <span style={{ color: TEAL }}>lng</span>{": "}<span style={{ color: MUTED }}>35.20597</span>{", "}
        <span style={{ color: TEAL }}>label</span>{": "}<span style={{ color: MUTED }}>"Building Name"</span>
        {" },"}
      </div>
    </div>
  );
}

// ─── UPTIME ───────────────────────────────────────────────────────────────────
function UptimePage({ nodes }) {
  const up   = nodes.filter(n => n.status === "up").length;
  const down = nodes.filter(n => n.status === "down");
  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub="Node reachability from Headscale">Uptime</SectionHeading>
      <FieldLabel>Overall Status</FieldLabel>
      <ReadBox value={nodes.length === 0 ? "no nodes registered" : up === nodes.length ? "all systems operational" : `${down.length} node(s) offline`} />
      <HelperText>Derived from Headscale online field · auto-refreshes every 30s</HelperText>
      {down.length > 0 && (
        <>
          <FieldLabel>Offline Nodes</FieldLabel>
          {down.map(n => (
            <div key={n.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", marginBottom: 6, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, fontFamily: FONT, fontSize: 15 }}>
              <StatusDot up={false} />
              <span style={{ flex: 1 }}>{n.name}</span>
              <span style={{ color: MUTED }}>{n.ip}</span>
              <span style={{ color: MUTED }}>{n.user}</span>
              <span style={{ color: RED }}>offline</span>
            </div>
          ))}
          <div style={{ marginBottom: 26 }} />
        </>
      )}
      <FieldLabel>All Nodes</FieldLabel>
      <Table keyField="name" cols={[
        { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status==="up"} /> },
        { key: "name",     label: "hostname",  width: "1fr"   },
        { key: "ip",       label: "ip",        width: "145px" },
        { key: "user",     label: "user",      width: "120px", color: () => MUTED },
        { key: "lastSeen", label: "last seen", width: "200px", render: r => <span style={{ color: FAINT, fontSize: 14 }}>{r.lastSeen ? new Date(r.lastSeen).toISOString().replace("T"," ").slice(0,16) : "—"}</span> },
        { key: "status",   label: "status",    width: "80px",  render: r => <span style={{ color: r.status==="up" ? GREEN : RED }}>{r.status}</span> },
      ]} rows={nodes} />
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsPage({ config, refetch, loading, error, onLogout }) {
  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 900 }}>
      <SectionHeading sub="Server configuration">Settings</SectionHeading>
      <FieldLabel>Headscale URL</FieldLabel>
      <ReadBox value={config.url} />
      <HelperText>Connected headscale server</HelperText>
      <FieldLabel>API Key</FieldLabel>
      <ReadBox value="hskey-api-••••••••••••••••••••••••••••••••" />
      <HelperText>Stored locally in your browser only</HelperText>
      {error && (
        <>
          <FieldLabel>Last API Error</FieldLabel>
          <ReadBox value={error} />
          <HelperText>Showing cached data — check connection</HelperText>
        </>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <Btn onClick={refetch}>{loading ? "Syncing…" : "↺ Sync Now"}</Btn>
        <Btn onClick={onLogout} outline danger>Log Out</Btn>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState("loading");
  const [config,    setConfig]    = useState(null);
  const [active,    setActive]    = useState("map");
  const [sideOpen,  setSideOpen]  = useState(true);
  const [nodes,     setNodes]     = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setConfig(JSON.parse(saved)); setScreen("locked"); }
    else { setScreen("login"); }
  }, []);

  const refresh = useCallback(async (cfg) => {
    const c = cfg ?? config;
    if (!c) return;
    setLoading(true); setError(null);
    try {
      const [n, u] = await Promise.all([fetchNodes(c.url, c.key), fetchUsers(c.url, c.key)]);
      setNodes(n); setUsers(u);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [config]);

  useEffect(() => {
    if (screen !== "app") return;
    refresh();
    const iv = setInterval(() => refresh(), 30_000);
    return () => clearInterval(iv);
  }, [screen]);

  function handleLogin(cfg)  { setConfig(cfg); setScreen("app"); refresh(cfg); }
  function handleUnlock()    { setScreen("app"); refresh(); }
  function handleLogout()    { localStorage.removeItem(STORAGE_KEY); setConfig(null); setNodes([]); setUsers([]); setScreen("login"); }

  if (screen === "loading") return null;
  if (screen === "login")   return <LoginScreen onLogin={handleLogin} />;
  if (screen === "locked")  return <PasswordGate savedPass={config.pass} onUnlock={handleUnlock} />;

  const pages = {
    overview:    <OverviewPage    nodes={nodes} users={users} />,
    map:         <MapPage         nodes={nodes} />,
    nodes:       <NodesPage       nodes={nodes} />,
    users:       <UsersPage       nodes={nodes} users={users} />,
    coordinates: <CoordinatesPage nodes={nodes} />,
    uptime:      <UptimePage      nodes={nodes} />,
    settings:    <SettingsPage    config={config} refetch={refresh} loading={loading} error={error} onLogout={handleLogout} />,
  };

  return (
    <div style={{ fontFamily: FONT, background: WHITE, color: TEXT, position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", overflow: "hidden" }}>
      <Sidebar active={active} setActive={setActive} open={sideOpen} setOpen={setSideOpen} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: active === "map" ? "hidden" : "auto" }}>
        {pages[active] ?? null}
      </div>
    </div>
  );
}
