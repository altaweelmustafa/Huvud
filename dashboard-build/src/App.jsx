import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const HEADSCALE_URL = "http://100.105.90.110:8082";
const HEADSCALE_KEY = "hskey-api-ScGXGrdwS0_q-qF1Nyr2GHlaP0mLxRfjKP5jLb2YJr-ipS0EriDRJj0d5Cill2g6YjoldSPh-A3Ug";

const FONT  = "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace";
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

// ─── NODE EXACT LOCATIONS ─────────────────────────────────────────────────────
// Right-click on Google Maps → copy coordinates → paste here
const NODE_LOCATIONS = {
  "ramallah-hospital-1": { lat: 31.89975402722865,  lng: 35.20597188356702,  label: "Ramallah General Hospital" },
  "ramallah-ngo-1":      { lat: 31.9003183113595,   lng: 35.205510500419464, label: "Palestine Medical Complex" },
  "nablus-hospital-1":   { lat: 32.225483541046096, lng: 35.24148825740547,  label: "Rafidia Surgical Hospital" },
  "hebron-hospital-1":   { lat: 31.556892068592273, lng: 35.08346726691443,  label: "Al-Ahli Hospital Hebron"   },
};

// District center fallbacks
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
  { id: "overview",  label: "Overview",  icon: "⊞" },
  { id: "map",       label: "Map",       icon: "◎" },
  { id: "nodes",     label: "Nodes",     icon: "○" },
  { id: "districts", label: "Districts", icon: "□" },
  { id: "uptime",    label: "Uptime",    icon: "◈" },
  { id: "settings",  label: "Settings",  icon: "⚙" },
];

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchNodes() {
  const res = await fetch(`${HEADSCALE_URL}/api/v1/node`, {
    headers: { Authorization: `Bearer ${HEADSCALE_KEY}` },
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

// Fetch users = districts
async function fetchDistricts() {
  try {
    const res = await fetch(`${HEADSCALE_URL}/api/v1/user`, {
      headers: { Authorization: `Bearer ${HEADSCALE_KEY}` },
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

// ─── CLOCK ────────────────────────────────────────────────────────────────────
function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <>{t.toISOString().slice(0, 19).replace("T", " ")} UTC</>;
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function SectionHeading({ children, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: TEAL, margin: 0 }}>{children}</h2>
      {sub && <div style={{ fontFamily: FONT, fontSize: 15, color: MUTED, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 6 }}>{children}</div>;
}

function ReadBox({ value }) {
  return (
    <div style={{
      fontFamily: FONT, fontSize: 15, color: TEXT,
      background: WHITE, border: `1px solid ${BORDER}`,
      borderRadius: 6, padding: "10px 14px", marginBottom: 6, wordBreak: "break-all",
    }}>{value}</div>
  );
}

function HelperText({ children }) {
  return <div style={{ fontFamily: FONT, fontSize: 14, color: MUTED, marginBottom: 20 }}>{children}</div>;
}

function Btn({ children, onClick, outline = false }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      fontFamily: FONT, fontSize: 15, fontWeight: 500,
      padding: "8px 20px", borderRadius: 20, cursor: "pointer",
      border: `2px solid ${TEAL}`,
      background: outline ? (h ? TEAL_BG : "transparent") : (h ? "#0a5c60" : TEAL),
      color: outline ? TEAL : WHITE, transition: "all 0.1s",
    }}>{children}</button>
  );
}

function StatusDot({ up }) {
  return <span style={{
    display: "inline-block", width: 10, height: 10, borderRadius: "50%",
    background: up ? GREEN : FAINT, flexShrink: 0,
  }} />;
}

function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, padding: "18px 22px", borderRight: `1px solid ${BORDER}` }}>
      <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: TEXT }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: 13, color: MUTED, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Table({ cols, rows, onRowClick, selectedKey, keyField = "id" }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 28 }}>
      <div style={{
        display: "grid", gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "),
        padding: "10px 18px", borderBottom: `1px solid ${BORDER}`,
        fontFamily: FONT, fontSize: 12, color: FAINT,
        textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG,
      }}>
        {cols.map(c => <span key={c.key + c.label}>{c.label}</span>)}
      </div>
      {rows.length === 0 && (
        <div style={{ padding: "24px 18px", fontFamily: FONT, fontSize: 15, color: FAINT, textAlign: "center" }}>
          no data
        </div>
      )}
      {rows.map((row, i) => (
        <div
          key={row[keyField] ?? i}
          onClick={() => onRowClick?.(row)}
          style={{
            display: "grid", gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "),
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : "none",
            background: selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent",
            cursor: onRowClick ? "pointer" : "default", transition: "background 0.1s",
          }}
          onMouseEnter={e => { if (!selectedKey || row[keyField] !== selectedKey) e.currentTarget.style.background = "#f9fafb"; }}
          onMouseLeave={e => { e.currentTarget.style.background = selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent"; }}
        >
          {cols.map(c => (
            <span key={c.key + c.label} style={{
              fontFamily: FONT, fontSize: 14, color: c.color?.(row) ?? TEXT,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {c.render ? c.render(row) : row[c.key]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  return (
    <div style={{
      width: 210, flexShrink: 0, background: GRAY_BG,
      borderRight: `1px solid ${BORDER}`, display: "flex",
      flexDirection: "column", fontFamily: FONT,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 18px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 20, height: 2, background: TEAL, borderRadius: 1 }} />)}
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: TEAL }}>Huvud</span>
      </div>
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 20px", cursor: "pointer", fontSize: 15,
              color: isActive ? TEAL : TEXT,
              background: isActive ? TEAL_BG : "transparent",
              borderLeft: isActive ? `3px solid ${TEAL}` : "3px solid transparent",
              transition: "all 0.1s", userSelect: "none",
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#e5e7eb"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${BORDER}`, fontSize: 12, color: FAINT }}>
        <Clock />
      </div>
    </div>
  );
}

// ─── MAP PAGE ─────────────────────────────────────────────────────────────────
function MapPage({ nodes }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const [selected, setSelected] = useState(null);

  // Build pin list from NODE_LOCATIONS + registered nodes
  const pins = Object.entries(NODE_LOCATIONS).map(([hostname, loc]) => {
    const node = nodes.find(n => n.name === hostname);
    return {
      hostname,
      lat:        loc.lat,
      lng:        loc.lng,
      label:      loc.label,
      status:     node ? node.status : "unconfigured",
      ip:         node ? node.ip : "—",
      district:   node ? node.district : hostname.split("-")[0].toUpperCase(),
      registered: !!node,
    };
  });

  // Nodes not in NODE_LOCATIONS → district center fallback
  nodes.forEach(node => {
    if (!NODE_LOCATIONS[node.name]) {
      const coords = DISTRICT_COORDS[node.district] ?? DISTRICT_COORDS.DEFAULT;
      pins.push({
        hostname:   node.name,
        lat:        coords.lat + (Math.random() - 0.5) * 0.008,
        lng:        coords.lng + (Math.random() - 0.5) * 0.008,
        label:      node.name,
        status:     node.status,
        ip:         node.ip,
        district:   node.district,
        registered: true,
      });
    }
  });

  useEffect(() => {
    if (leafletRef.current) return;
    const link   = document.createElement("link");
    link.rel     = "stylesheet";
    link.href    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (window.L && leafletRef.current) updateMarkers();
  }, [nodes]);

  function pinColor(status) {
    if (status === "up")           return GREEN;
    if (status === "unconfigured") return FAINT;
    return RED;
  }

  function initMap() {
    if (!mapRef.current || leafletRef.current) return;
    const L   = window.L;
    const map = L.map(mapRef.current, { center: [32.0, 35.25], zoom: 9 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    leafletRef.current = { map, markers: [] };
    updateMarkers();
  }

  function updateMarkers() {
    if (!leafletRef.current) return;
    const L   = window.L;
    const map = leafletRef.current.map;
    leafletRef.current.markers.forEach(m => m.remove());
    leafletRef.current.markers = [];

    pins.forEach(pin => {
      const color = pinColor(pin.status);
      const icon  = L.divIcon({
        className: "",
        html: `
          <div style="
            width:22px;height:22px;border-radius:50%;
            background:${color};
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
            cursor:pointer;
            transition:transform 0.1s;
          "></div>
        `,
        iconSize:   [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:${FONT};font-size:13px;min-width:200px;line-height:1.6">
            <div style="font-weight:700;color:${TEAL};font-size:14px;margin-bottom:8px">${pin.label}</div>
            <div style="color:#555;margin-bottom:2px">hostname: <span style="color:#111">${pin.hostname}</span></div>
            <div style="color:#555;margin-bottom:2px">ip: <span style="color:#111">${pin.ip}</span></div>
            <div style="color:#555;margin-bottom:2px">district: <span style="color:#111">${pin.district}</span></div>
            <div style="color:#555;margin-top:6px">status:
              <span style="color:${color};font-weight:700">${pin.status}</span>
            </div>
          </div>
        `);

      marker.on("click", () => setSelected(pin));
      leafletRef.current.markers.push(marker);
    });
  }

  const up  = pins.filter(p => p.status === "up").length;
  const dn  = pins.filter(p => p.status === "down").length;
  const unc = pins.filter(p => p.status === "unconfigured").length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        height: 48, background: WHITE, borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", padding: "0 22px",
        gap: 22, flexShrink: 0, fontFamily: FONT, fontSize: 14,
      }}>
        <span style={{ color: TEAL, fontWeight: 700, fontSize: 15 }}>West Bank Mesh — Node Map</span>
        <span style={{ color: BORDER }}>·</span>
        <span style={{ color: GREEN }}>● {up} online</span>
        <span style={{ color: dn > 0 ? RED : FAINT }}>● {dn} offline</span>
        <span style={{ color: FAINT }}>● {unc} unconfigured</span>
        <span style={{ marginLeft: "auto", color: FAINT, fontSize: 12 }}>
          click a pin for details · openstreetmap
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Map */}
        <div ref={mapRef} style={{ flex: 1 }} />

        {/* Side panel */}
        <div style={{
          width: 280, flexShrink: 0, background: WHITE,
          borderLeft: `1px solid ${BORDER}`, overflowY: "auto", fontFamily: FONT,
        }}>
          {selected ? (
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 14, color: TEAL, fontWeight: 700, marginBottom: 14 }}>
                {selected.label}
              </div>
              {[
                { k: "hostname", v: selected.hostname },
                { k: "ip",       v: selected.ip       },
                { k: "district", v: selected.district  },
                { k: "status",   v: selected.status,   color: pinColor(selected.status) },
                { k: "lat",      v: selected.lat.toFixed(6) },
                { k: "lng",      v: selected.lng.toFixed(6) },
              ].map(r => (
                <div key={r.k} style={{ marginBottom: 12, borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 }}>
                  <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{r.k}</div>
                  <div style={{ fontSize: 14, color: r.color ?? TEXT }}>{r.v}</div>
                </div>
              ))}
              <button onClick={() => setSelected(null)} style={{
                fontFamily: FONT, fontSize: 13, color: MUTED,
                background: "none", border: `1px solid ${BORDER}`,
                borderRadius: 4, padding: "5px 14px", cursor: "pointer", marginTop: 6,
              }}>close</button>
            </div>
          ) : (
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                all pins
              </div>
              {pins.map(pin => (
                <div
                  key={pin.hostname}
                  onClick={() => {
                    setSelected(pin);
                    leafletRef.current?.map.setView([pin.lat, pin.lng], 14);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 5, cursor: "pointer",
                    marginBottom: 2, transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = GRAY_BG}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                    background: pinColor(pin.status),
                  }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pin.label}
                    </div>
                    <div style={{ fontSize: 11, color: FAINT }}>{pin.district.toLowerCase()}</div>
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

// ─── OVERVIEW PAGE ────────────────────────────────────────────────────────────
function OverviewPage({ nodes, districts }) {
  const up   = nodes.filter(n => n.status === "up").length;
  const down = nodes.length - up;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 960, width: "100%" }}>
      <SectionHeading sub="West Bank humanitarian mesh network">Overview</SectionHeading>

      {/* Stats */}
      <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", background: WHITE, marginBottom: 36 }}>
        <StatBox label="total nodes"  value={nodes.length}     />
        <StatBox label="online"       value={up}               />
        <StatBox label="offline"      value={down}             />
        <StatBox label="districts"    value={districts.length} />
        <div style={{ flex: 1, padding: "18px 22px" }}>
          <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: TEXT }}>
            {nodes.length ? `${Math.round((up / nodes.length) * 100)}%` : "—"}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: MUTED, marginTop: 4 }}>uptime</div>
        </div>
      </div>

      {/* Districts table */}
      <SectionHeading sub="Coverage per district">Districts</SectionHeading>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 36 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 90px 90px 220px",
          padding: "10px 18px", borderBottom: `1px solid ${BORDER}`,
          fontFamily: FONT, fontSize: 12, color: FAINT,
          textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG,
        }}>
          <span>district</span><span>nodes</span><span>online</span><span>coverage</span>
        </div>
        {districts.length === 0 && (
          <div style={{ padding: "24px 18px", fontFamily: FONT, fontSize: 15, color: FAINT, textAlign: "center" }}>
            no districts registered yet — create users in Headscale
          </div>
        )}
        {districts.map((dist, i) => {
          const dn  = nodes.filter(n => n.district === dist.name.toUpperCase());
          const dup = dn.filter(n => n.status === "up").length;
          const pct = dn.length ? Math.round((dup / dn.length) * 100) : 0;
          return (
            <div key={dist.id} style={{
              display: "grid", gridTemplateColumns: "1fr 90px 90px 220px",
              padding: "12px 18px", alignItems: "center",
              borderBottom: i < districts.length - 1 ? `1px solid ${BORDER}` : "none",
            }}>
              <span style={{ fontFamily: FONT, fontSize: 15, color: TEXT, fontWeight: 500 }}>
                {dist.label}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 15, color: MUTED }}>{dn.length}</span>
              <span style={{ fontFamily: FONT, fontSize: 15, color: dup > 0 && dup === dn.length ? GREEN : dup === 0 && dn.length > 0 ? RED : MUTED }}>
                {dup}
              </span>
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

      {/* Node list */}
      <SectionHeading sub="All registered nodes">Nodes</SectionHeading>
      <Table
        keyField="name"
        cols={[
          { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",     label: "hostname",  width: "1fr"   },
          { key: "ip",       label: "ip",        width: "140px" },
          { key: "district", label: "district",  width: "110px", color: () => MUTED },
          { key: "status",   label: "status",    width: "80px",
            render: r => <span style={{ color: r.status === "up" ? GREEN : FAINT }}>{r.status}</span> },
        ]}
        rows={nodes}
      />
    </div>
  );
}

// ─── NODES PAGE ───────────────────────────────────────────────────────────────
function NodesPage({ nodes }) {
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("");

  const filtered = nodes.filter(n =>
    n.name.includes(filter) ||
    n.ip.includes(filter) ||
    n.district.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 960 }}>
      <SectionHeading sub={`${nodes.length} registered nodes`}>Nodes</SectionHeading>

      <input
        value={filter} onChange={e => setFilter(e.target.value)}
        placeholder="filter by name, ip, district…"
        style={{
          fontFamily: FONT, fontSize: 14, color: TEXT,
          background: WHITE, border: `1px solid ${BORDER}`,
          borderRadius: 6, padding: "9px 14px", marginBottom: 20,
          width: "100%", maxWidth: 420, outline: "none",
        }}
      />

      <Table
        keyField="name" selectedKey={selected?.name}
        onRowClick={r => setSelected(selected?.name === r.name ? null : r)}
        cols={[
          { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",     label: "hostname",  width: "1fr"   },
          { key: "ip",       label: "ip",        width: "140px" },
          { key: "district", label: "district",  width: "110px", color: () => MUTED },
          { key: "role",     label: "role",      width: "110px", color: () => MUTED },
          { key: "status",   label: "status",    width: "80px",
            render: r => <span style={{ color: r.status === "up" ? GREEN : FAINT }}>{r.status}</span> },
        ]}
        rows={filtered}
      />

      {selected && (
        <>
          <SectionHeading sub="Selected node">Node Detail</SectionHeading>
          {[
            { k: "Hostname",    v: selected.name     },
            { k: "IP Address",  v: selected.ip        },
            { k: "District",    v: selected.district  },
            { k: "Role",        v: selected.role      },
            { k: "Status",      v: selected.status    },
            { k: "Last Seen",   v: selected.lastSeen
                ? new Date(selected.lastSeen).toISOString().replace("T"," ").slice(0,19)+" UTC"
                : "—" },
            { k: "Tunnel",      v: "WireGuard"        },
            { k: "Coordinates", v: NODE_LOCATIONS[selected.name]
                ? `${NODE_LOCATIONS[selected.name].lat}, ${NODE_LOCATIONS[selected.name].lng}`
                : "not set — add to NODE_LOCATIONS in source" },
          ].map(row => (
            <div key={row.k}>
              <FieldLabel>{row.k}</FieldLabel>
              <ReadBox value={row.v} />
              <div style={{ marginBottom: 10 }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={() => setSelected(null)}>Close</Btn>
          </div>
        </>
      )}
    </div>
  );
}

// ─── DISTRICTS PAGE ───────────────────────────────────────────────────────────
function DistrictsPage({ nodes, districts }) {
  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 960 }}>
      <SectionHeading sub="One district per Headscale user">Districts</SectionHeading>

      {districts.length === 0 && (
        <div style={{ fontFamily: FONT, fontSize: 15, color: FAINT, marginBottom: 28 }}>
          no districts yet — create users in Headscale to define districts
        </div>
      )}

      {districts.map(dist => {
        const dn  = nodes.filter(n => n.district === dist.name.toUpperCase());
        const dup = dn.filter(n => n.status === "up").length;
        const pct = dn.length ? Math.round((dup / dn.length) * 100) : 0;

        return (
          <div key={dist.id} style={{ marginBottom: 40 }}>
            <FieldLabel>{dist.label}</FieldLabel>
            <HelperText>
              {dn.length === 0
                ? "no nodes registered in this district"
                : `${dup} of ${dn.length} nodes online · ${pct}% coverage`}
            </HelperText>

            {dn.length > 0 && (
              <div style={{ height: 5, background: "#e5e7eb", borderRadius: 99, marginBottom: 16, maxWidth: 500 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: TEAL, borderRadius: 99, transition: "width 0.5s" }} />
              </div>
            )}

            <Table
              keyField="name"
              cols={[
                { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
                { key: "name",     label: "hostname", width: "1fr"   },
                { key: "ip",       label: "ip",       width: "140px" },
                { key: "role",     label: "role",     width: "120px", color: () => MUTED },
                { key: "lastSeen", label: "last seen", width: "180px",
                  render: r => <span style={{ color: FAINT, fontSize: 13 }}>
                    {r.lastSeen ? new Date(r.lastSeen).toISOString().replace("T"," ").slice(0,16) : "—"}
                  </span> },
                { key: "status",   label: "status",   width: "80px",
                  render: r => <span style={{ color: r.status === "up" ? GREEN : FAINT }}>{r.status}</span> },
              ]}
              rows={dn}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── UPTIME PAGE ──────────────────────────────────────────────────────────────
function UptimePage({ nodes }) {
  const up   = nodes.filter(n => n.status === "up").length;
  const down = nodes.filter(n => n.status === "down");

  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 960 }}>
      <SectionHeading sub="Node reachability from Headscale">Uptime</SectionHeading>

      <FieldLabel>Overall Status</FieldLabel>
      <ReadBox value={
        nodes.length === 0
          ? "no nodes registered"
          : up === nodes.length
            ? "all systems operational"
            : `${down.length} node(s) offline`
      } />
      <HelperText>Derived from Headscale online field · auto-refreshes every 30s</HelperText>

      {down.length > 0 && (
        <>
          <FieldLabel>Offline Nodes</FieldLabel>
          {down.map(n => (
            <div key={n.name} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 16px", marginBottom: 5,
              background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6,
              fontFamily: FONT, fontSize: 14,
            }}>
              <StatusDot up={false} />
              <span style={{ flex: 1 }}>{n.name}</span>
              <span style={{ color: MUTED }}>{n.ip}</span>
              <span style={{ color: MUTED }}>{n.district.toLowerCase()}</span>
              <span style={{ color: RED }}>offline</span>
            </div>
          ))}
          <div style={{ marginBottom: 24 }} />
        </>
      )}

      <FieldLabel>All Nodes</FieldLabel>
      <Table
        keyField="name"
        cols={[
          { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",     label: "hostname",  width: "1fr"   },
          { key: "ip",       label: "ip",        width: "140px" },
          { key: "district", label: "district",  width: "110px", color: () => MUTED },
          { key: "lastSeen", label: "last seen", width: "190px",
            render: r => <span style={{ color: FAINT, fontSize: 13 }}>
              {r.lastSeen ? new Date(r.lastSeen).toISOString().replace("T"," ").slice(0,16) : "—"}
            </span> },
          { key: "status",   label: "status",   width: "80px",
            render: r => <span style={{ color: r.status === "up" ? GREEN : RED }}>{r.status}</span> },
        ]}
        rows={nodes}
      />
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ districts, refetch, loading, error }) {
  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 900 }}>
      <SectionHeading sub="Server configuration">Settings</SectionHeading>

      <FieldLabel>Headscale URL</FieldLabel>
      <ReadBox value={HEADSCALE_URL} />
      <HelperText>Headscale server via nginx CORS proxy on port 8082</HelperText>

      <FieldLabel>Headscale API Key</FieldLabel>
      <ReadBox value="hskey-api-••••••••••••••••••••••••••••••••" />
      <HelperText>Update HEADSCALE_KEY in source to change</HelperText>

      {error && (
        <>
          <FieldLabel>Last API Error</FieldLabel>
          <ReadBox value={error} />
          <HelperText>Showing cached data — check server connection</HelperText>
        </>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
        <Btn onClick={refetch}>{loading ? "Syncing…" : "↺ Sync Now"}</Btn>
      </div>

      <SectionHeading sub="Districts are Headscale users — create users to add districts">Districts</SectionHeading>
      <Table
        keyField="id"
        cols={[
          { key: "id",        label: "id",       width: "70px"  },
          { key: "label",     label: "district", width: "1fr"   },
          { key: "createdAt", label: "created",  width: "220px",
            render: r => <span style={{ color: FAINT, fontSize: 13 }}>
              {r.createdAt ? new Date(r.createdAt).toISOString().slice(0,10) : "—"}
            </span> },
        ]}
        rows={districts}
      />

      <SectionHeading sub="Exact GPS coordinates per node">Node Coordinates</SectionHeading>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 28 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 100px 100px 1fr",
          padding: "10px 18px", borderBottom: `1px solid ${BORDER}`,
          fontFamily: FONT, fontSize: 12, color: FAINT,
          textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG,
        }}>
          <span>hostname</span><span>lat</span><span>lng</span><span>label</span>
        </div>
        {Object.entries(NODE_LOCATIONS).map(([hostname, loc], i, arr) => (
          <div key={hostname} style={{
            display: "grid", gridTemplateColumns: "1fr 100px 100px 1fr",
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
            fontFamily: FONT, fontSize: 14,
          }}>
            <span style={{ color: TEXT }}>{hostname}</span>
            <span style={{ color: MUTED }}>{loc.lat}</span>
            <span style={{ color: MUTED }}>{loc.lng}</span>
            <span style={{ color: MUTED }}>{loc.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [active,    setActive]    = useState("map");
  const [nodes,     setNodes]     = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [n, d] = await Promise.all([fetchNodes(), fetchDistricts()]);
      setNodes(n);
      setDistricts(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 30_000);
    return () => clearInterval(iv);
  }, [refresh]);

  const pages = {
    overview:  <OverviewPage  nodes={nodes} districts={districts} />,
    map:       <MapPage       nodes={nodes} />,
    nodes:     <NodesPage     nodes={nodes} />,
    districts: <DistrictsPage nodes={nodes} districts={districts} />,
    uptime:    <UptimePage    nodes={nodes} />,
    settings:  <SettingsPage  districts={districts} refetch={refresh} loading={loading} error={error} />,
  };

  return (
    <div style={{
      fontFamily: FONT, background: WHITE, color: TEXT,
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", overflow: "hidden",
    }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{
        flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
        overflowY: active === "map" ? "hidden" : "auto",
      }}>
        {pages[active] ?? null}
      </div>
    </div>
  );
}
