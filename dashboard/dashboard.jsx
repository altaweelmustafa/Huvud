import React, { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const HEADSCALE_URL = "http://100.105.90.110:8082";
const HEADSCALE_KEY = "hskey-api-ScGXGrdwS0_q-qF1Nyr2GHlaP0mLxRfjKP5jLb2YJr-ipS0EriDRJj0d5Cill2g6YjoldSPh-A3Ug";
const PROMETHEUS_URL = "http://100.105.90.110:9091";
const UPTIME_URL     = "http://100.105.90.110:3001";

const FONT = "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace";

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

const NAV = [
  { id: "overview",  label: "Overview",  icon: "⊞" },
  { id: "nodes",     label: "Nodes",     icon: "○" },
  { id: "districts", label: "Districts", icon: "□" },
  { id: "metrics",   label: "Metrics",   icon: "◈" },
  { id: "uptime",    label: "Uptime",    icon: "◎" },
  { id: "settings",  label: "Settings",  icon: "⚙" },
];

// ─── APIs ─────────────────────────────────────────────────────────────────────
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
    district: (n.name ?? "").split("-")[0]?.toUpperCase() ?? "UNKNOWN",
    role:     (n.name ?? "").split("-")[1] ?? "—",
    status:   n.online ? "up" : "down",
    lastSeen: n.lastSeen ?? null,
    user:     n.user?.name ?? "—",
  }));
}

async function fetchUsers() {
  const res = await fetch(`${HEADSCALE_URL}/api/v1/user`, {
    headers: { Authorization: `Bearer ${HEADSCALE_KEY}` },
  });
  if (!res.ok) throw new Error(`users ${res.status}`);
  const data = await res.json();
  return data.users ?? [];
}

async function fetchRoutes() {
  return [];
}

async function fetchPrometheusMetric(query) {
  try {
    const res = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.result ?? null;
  } catch { return null; }
}

async function fetchUptimeMonitors() {
  try {
    const res = await fetch(`${UPTIME_URL}/api/status-page/all`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch { return null; }
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
      <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: TEAL, margin: 0 }}>{children}</h2>
      {sub && <div style={{ fontFamily: FONT, fontSize: 13, color: MUTED, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEAL, marginBottom: 6 }}>{children}</div>;
}

function ReadBox({ value, mono = true }) {
  return (
    <div style={{
      fontFamily: FONT, fontSize: 14, color: TEXT,
      background: WHITE, border: `1px solid ${BORDER}`,
      borderRadius: 6, padding: "9px 14px", marginBottom: 6,
      wordBreak: "break-all",
    }}>{value}</div>
  );
}

function HelperText({ children }) {
  return <div style={{ fontFamily: FONT, fontSize: 13, color: MUTED, marginBottom: 20 }}>{children}</div>;
}

function Btn({ children, onClick, outline = false }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      fontFamily: FONT, fontSize: 14, fontWeight: 500,
      padding: "7px 18px", borderRadius: 20, cursor: "pointer",
      border: `2px solid ${TEAL}`,
      background: outline ? (h ? TEAL_BG : "transparent") : (h ? "#0a5c60" : TEAL),
      color: outline ? TEAL : WHITE, transition: "all 0.1s",
    }}>{children}</button>
  );
}

function StatusDot({ up }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: up ? GREEN : FAINT, flexShrink: 0 }} />;
}

function StatBox({ label, value, sub }) {
  return (
    <div style={{ flex: 1, padding: "16px 20px", borderRight: `1px solid ${BORDER}` }}>
      <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: TEXT }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: 12, color: MUTED, marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontFamily: FONT, fontSize: 11, color: FAINT, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Table({ cols, rows, onRowClick, selectedKey, keyField = "id" }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 28 }}>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "),
        padding: "8px 16px", borderBottom: `1px solid ${BORDER}`,
        fontFamily: FONT, fontSize: 11, color: FAINT,
        textTransform: "uppercase", letterSpacing: 1,
        background: GRAY_BG,
      }}>
        {cols.map(c => <span key={c.key}>{c.label}</span>)}
      </div>
      {/* Rows */}
      {rows.length === 0 && (
        <div style={{ padding: "20px 16px", fontFamily: FONT, fontSize: 13, color: FAINT, textAlign: "center" }}>
          no data
        </div>
      )}
      {rows.map((row, i) => (
        <div
          key={row[keyField] ?? i}
          onClick={() => onRowClick?.(row)}
          style={{
            display: "grid", gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "),
            padding: "9px 16px", alignItems: "center",
            borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : "none",
            background: selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent",
            cursor: onRowClick ? "pointer" : "default",
            transition: "background 0.1s",
          }}
          onMouseEnter={e => { if (!selectedKey || row[keyField] !== selectedKey) e.currentTarget.style.background = "#f9fafb"; }}
          onMouseLeave={e => { e.currentTarget.style.background = selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent"; }}
        >
          {cols.map(c => (
            <span key={c.key} style={{ fontFamily: FONT, fontSize: 13, color: c.color?.(row) ?? TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
      width: 200, flexShrink: 0, background: GRAY_BG,
      borderRight: `1px solid ${BORDER}`, display: "flex",
      flexDirection: "column", fontFamily: FONT,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px 16px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 18, height: 2, background: TEAL, borderRadius: 1 }} />)}
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: TEAL }}>Huvud</span>
      </div>
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => setActive(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 20px", cursor: "pointer", fontSize: 14,
              color: isActive ? TEAL : TEXT,
              background: isActive ? TEAL_BG : "transparent",
              borderLeft: isActive ? `3px solid ${TEAL}` : "3px solid transparent",
              transition: "all 0.1s", userSelect: "none",
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#e5e7eb"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 18, textAlign: "center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, fontSize: 11, color: FAINT }}>
        <Clock />
      </div>
    </div>
  );
}

// ─── OVERVIEW PAGE ────────────────────────────────────────────────────────────
function OverviewPage({ nodes, users, routes, setActive }) {
  const districts = [...new Set(nodes.map(n => n.district))];
  const up        = nodes.filter(n => n.status === "up").length;
  const down      = nodes.length - up;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900, width: "100%" }}>
      <SectionHeading sub="West Bank humanitarian mesh network">Overview</SectionHeading>

      {/* Stats row */}
      <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", background: WHITE, marginBottom: 36 }}>
        <StatBox label="total nodes"  value={nodes.length}     />
        <StatBox label="online"       value={up}               />
        <StatBox label="offline"      value={down}             />
        <StatBox label="districts"    value={districts.length} />
        <StatBox label="users"        value={users.length}     />
        <div style={{ flex: 1, padding: "16px 20px" }}>
          <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: TEXT }}>{routes.length}</div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: MUTED, marginTop: 3 }}>subnet routes</div>
        </div>
      </div>

      {/* District status */}
      <SectionHeading sub="Coverage per district">Districts</SectionHeading>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 36 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 80px 80px 200px",
          padding: "8px 16px", borderBottom: `1px solid ${BORDER}`,
          fontFamily: FONT, fontSize: 11, color: FAINT,
          textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG,
        }}>
          <span>district</span><span>nodes</span><span>online</span><span>coverage</span>
        </div>
        {districts.map((dist, i) => {
          const dn  = nodes.filter(n => n.district === dist);
          const dup = dn.filter(n => n.status === "up").length;
          const pct = dn.length ? Math.round((dup / dn.length) * 100) : 0;
          return (
            <div key={dist} style={{
              display: "grid", gridTemplateColumns: "1fr 80px 80px 200px",
              padding: "10px 16px", alignItems: "center",
              borderBottom: i < districts.length - 1 ? `1px solid ${BORDER}` : "none",
            }}>
              <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT, fontWeight: 500 }}>
                {dist.charAt(0) + dist.slice(1).toLowerCase()}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>{dn.length}</span>
              <span style={{ fontFamily: FONT, fontSize: 13, color: dup === dn.length ? GREEN : dup === 0 ? RED : MUTED }}>{dup}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: TEAL, borderRadius: 99 }} />
                </div>
                <span style={{ fontFamily: FONT, fontSize: 11, color: FAINT, width: 32 }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent nodes */}
      <SectionHeading sub="All connected nodes">Node Status</SectionHeading>
      <Table
        keyField="name"
        cols={[
          { key: "status", label: "", width: "24px", render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",   label: "hostname",  width: "1fr"   },
          { key: "ip",     label: "ip",        width: "130px" },
          { key: "district", label: "district", width: "100px", color: () => MUTED },
          { key: "user",   label: "user",      width: "100px", color: () => MUTED },
          { key: "status", label: "status",    width: "70px",
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
  const [filter, setFilter]     = useState("");

  const filtered = nodes.filter(n =>
    n.name.includes(filter) || n.ip.includes(filter) || n.district.includes(filter.toUpperCase())
  );

  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 900 }}>
      <SectionHeading sub={`${nodes.length} registered nodes`}>Nodes</SectionHeading>

      {/* Search */}
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="filter by name, ip, district…"
        style={{
          fontFamily: FONT, fontSize: 13, color: TEXT,
          background: WHITE, border: `1px solid ${BORDER}`,
          borderRadius: 6, padding: "8px 14px", marginBottom: 20,
          width: "100%", maxWidth: 400, outline: "none",
        }}
      />

      <Table
        keyField="name"
        selectedKey={selected?.name}
        onRowClick={r => setSelected(selected?.name === r.name ? null : r)}
        cols={[
          { key: "status",   label: "",         width: "24px",  render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",     label: "hostname",  width: "1fr"    },
          { key: "ip",       label: "ip",        width: "130px"  },
          { key: "district", label: "district",  width: "100px", color: () => MUTED },
          { key: "role",     label: "role",      width: "100px", color: () => MUTED },
          { key: "user",     label: "user",      width: "100px", color: () => MUTED },
          { key: "status",   label: "status",    width: "70px",
            render: r => <span style={{ color: r.status === "up" ? GREEN : FAINT }}>{r.status}</span> },
        ]}
        rows={filtered}
      />

      {selected && (
        <>
          <SectionHeading sub="Selected node">Node Detail</SectionHeading>

          <FieldLabel>Hostname</FieldLabel>
          <ReadBox value={selected.name} />
          <HelperText>Registered name on the tailnet</HelperText>

          <FieldLabel>Tailscale IP</FieldLabel>
          <ReadBox value={selected.ip} />
          <HelperText>Assigned address within the mesh</HelperText>

          <FieldLabel>District</FieldLabel>
          <ReadBox value={selected.district} />
          <HelperText>Geographic area derived from hostname</HelperText>

          <FieldLabel>Role</FieldLabel>
          <ReadBox value={selected.role} />
          <HelperText>Function derived from hostname (hospital, ngo, clinic…)</HelperText>

          <FieldLabel>User / Namespace</FieldLabel>
          <ReadBox value={selected.user} />
          <HelperText>Headscale user this node belongs to</HelperText>

          <FieldLabel>Status</FieldLabel>
          <ReadBox value={selected.status} />
          <HelperText>Current online state</HelperText>

          <FieldLabel>Last Seen</FieldLabel>
          <ReadBox value={selected.lastSeen ? new Date(selected.lastSeen).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "—"} />
          <HelperText>Last confirmed heartbeat from this node</HelperText>

          <FieldLabel>Tunnel</FieldLabel>
          <ReadBox value="WireGuard" />
          <HelperText>Encryption protocol in use</HelperText>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setSelected(null)}>Close</Btn>
          </div>
        </>
      )}
    </div>
  );
}

// ─── DISTRICTS PAGE ───────────────────────────────────────────────────────────
function DistrictsPage({ nodes }) {
  const districts = [...new Set(nodes.map(n => n.district))];

  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 900 }}>
      <SectionHeading sub="Geographic district breakdown">Districts</SectionHeading>

      {districts.map(dist => {
        const dn  = nodes.filter(n => n.district === dist);
        const dup = dn.filter(n => n.status === "up").length;
        const pct = dn.length ? Math.round((dup / dn.length) * 100) : 0;

        return (
          <div key={dist} style={{ marginBottom: 36 }}>
            <FieldLabel>{dist.charAt(0) + dist.slice(1).toLowerCase()}</FieldLabel>
            <HelperText>{dup} of {dn.length} nodes online · {pct}% coverage</HelperText>

            <div style={{ height: 4, background: "#e5e7eb", borderRadius: 99, marginBottom: 16, maxWidth: 480 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: TEAL, borderRadius: 99, transition: "width 0.5s" }} />
            </div>

            <Table
              keyField="name"
              cols={[
                { key: "status",   label: "",        width: "24px",  render: r => <StatusDot up={r.status === "up"} /> },
                { key: "name",     label: "hostname", width: "1fr"    },
                { key: "ip",       label: "ip",       width: "130px"  },
                { key: "role",     label: "role",     width: "120px", color: () => MUTED },
                { key: "status",   label: "status",   width: "70px",
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

// ─── METRICS PAGE ─────────────────────────────────────────────────────────────
function MetricsPage({ nodes }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [total, online] = await Promise.all([
        fetchPrometheusMetric("headscale_nodes_total"),
        fetchPrometheusMetric("headscale_nodes_online"),
      ]);
      setMetrics({ total, online });
      setLoading(false);
    }
    load();
    const iv = setInterval(load, 15_000);
    return () => clearInterval(iv);
  }, []);

  const up   = nodes.filter(n => n.status === "up").length;
  const down = nodes.length - up;

  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 900 }}>
      <SectionHeading sub="Live data from Prometheus">Metrics</SectionHeading>

      {/* From Headscale directly */}
      <FieldLabel>Node Health — from Headscale API</FieldLabel>
      <HelperText>Derived from live /api/v1/node responses</HelperText>

      <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", background: WHITE, marginBottom: 36 }}>
        <StatBox label="total"   value={nodes.length} />
        <StatBox label="online"  value={up}           />
        <StatBox label="offline" value={down}         />
        <StatBox label="uptime %" value={nodes.length ? `${Math.round((up / nodes.length) * 100)}%` : "—"} />
      </div>

      {/* From Prometheus */}
      <FieldLabel>Prometheus Metrics</FieldLabel>
      <HelperText>Raw data from {PROMETHEUS_URL}</HelperText>

      {loading && <ReadBox value="fetching from prometheus…" />}
      {!loading && !metrics?.total && !metrics?.online && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>
            No metrics available. Make sure Prometheus is scraping Headscale at port 9090.
          </div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: FAINT, marginTop: 8 }}>
            Add to prometheus.yml: targets: ['headscale:9090']
          </div>
        </div>
      )}
      {!loading && metrics && (
        <>
          {metrics.total && (
            <>
              <FieldLabel>headscale_nodes_total</FieldLabel>
              {metrics.total.map((r, i) => (
                <ReadBox key={i} value={`${JSON.stringify(r.metric)} → ${r.value[1]}`} />
              ))}
              <HelperText>Total registered nodes by label</HelperText>
            </>
          )}
          {metrics.online && (
            <>
              <FieldLabel>headscale_nodes_online</FieldLabel>
              {metrics.online.map((r, i) => (
                <ReadBox key={i} value={`${JSON.stringify(r.metric)} → ${r.value[1]}`} />
              ))}
              <HelperText>Currently online nodes by label</HelperText>
            </>
          )}
        </>
      )}

      <FieldLabel>Prometheus URL</FieldLabel>
      <ReadBox value={PROMETHEUS_URL} />
      <HelperText>Update PROMETHEUS_URL in config to point to your instance</HelperText>
    </div>
  );
}

// ─── UPTIME PAGE ──────────────────────────────────────────────────────────────
function UptimePage({ nodes }) {
  const up   = nodes.filter(n => n.status === "up").length;
  const down = nodes.filter(n => n.status === "down");

  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 900 }}>
      <SectionHeading sub="Node reachability from Headscale">Uptime</SectionHeading>

      <FieldLabel>Overall Status</FieldLabel>
      <ReadBox value={up === nodes.length ? "all systems operational" : `${down.length} node(s) offline`} />
      <HelperText>Derived from Headscale online field</HelperText>

      {down.length > 0 && (
        <>
          <FieldLabel>Offline Nodes</FieldLabel>
          {down.map(n => (
            <div key={n.name} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 14px", marginBottom: 4,
              background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6,
              fontFamily: FONT, fontSize: 13, color: RED,
            }}>
              <StatusDot up={false} />
              <span style={{ flex: 1, color: TEXT }}>{n.name}</span>
              <span style={{ color: MUTED }}>{n.ip}</span>
              <span style={{ color: MUTED }}>{n.district.toLowerCase()}</span>
              <span style={{ color: RED }}>offline</span>
            </div>
          ))}
          <HelperText style={{ marginTop: 8 }}>{down.length} node(s) not responding</HelperText>
        </>
      )}

      <FieldLabel>All Nodes</FieldLabel>
      <HelperText>Full uptime status per node</HelperText>
      <Table
        keyField="name"
        cols={[
          { key: "status",   label: "",         width: "24px",  render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",     label: "hostname",  width: "1fr"    },
          { key: "ip",       label: "ip",        width: "130px"  },
          { key: "district", label: "district",  width: "100px", color: () => MUTED },
          { key: "lastSeen", label: "last seen", width: "180px",
            render: r => <span style={{ color: FAINT, fontSize: 12 }}>
              {r.lastSeen ? new Date(r.lastSeen).toISOString().replace("T"," ").slice(0,16) : "—"}
            </span> },
          { key: "status",   label: "status",   width: "70px",
            render: r => <span style={{ color: r.status === "up" ? GREEN : RED }}>{r.status}</span> },
        ]}
        rows={nodes}
      />

      <FieldLabel>Uptime Kuma</FieldLabel>
      <ReadBox value={UPTIME_URL} />
      <HelperText>Visit Uptime Kuma directly for detailed HTTP/TCP monitors and alerts</HelperText>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ users, routes, refetch, loading, error }) {
  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: 860 }}>
      <SectionHeading sub="Server configuration and connection">Settings</SectionHeading>

      <FieldLabel>Headscale URL</FieldLabel>
      <ReadBox value={HEADSCALE_URL} />
      <HelperText>URL for your Headscale server instance (via nginx CORS proxy)</HelperText>

      <FieldLabel>Headscale API Key</FieldLabel>
      <ReadBox value={"hskey-api-••••••••••••••••••••••••••••••••"} />
      <HelperText>Admin API key — update HEADSCALE_KEY in source to change</HelperText>

      <FieldLabel>Prometheus URL</FieldLabel>
      <ReadBox value={PROMETHEUS_URL} />
      <HelperText>Prometheus metrics endpoint</HelperText>

      <FieldLabel>Uptime Kuma URL</FieldLabel>
      <ReadBox value={UPTIME_URL} />
      <HelperText>Uptime Kuma status page</HelperText>

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

      {/* Users */}
      <SectionHeading sub="Headscale namespaces">Users</SectionHeading>
      <Table
        keyField="id"
        cols={[
          { key: "id",        label: "id",      width: "60px"  },
          { key: "name",      label: "name",    width: "1fr"   },
          { key: "createdAt", label: "created", width: "200px",
            render: r => <span style={{ color: FAINT, fontSize: 12 }}>
              {r.createdAt ? new Date(r.createdAt).toISOString().slice(0,10) : "—"}
            </span> },
        ]}
        rows={users}
      />

      {/* Routes */}
      <SectionHeading sub="Advertised subnet routes">Routes</SectionHeading>
      {routes.length === 0
        ? <div style={{ fontFamily: FONT, fontSize: 13, color: FAINT, marginBottom: 28 }}>no routes configured</div>
        : <Table
            keyField="id"
            cols={[
              { key: "id",      label: "id",      width: "60px"  },
              { key: "prefix",  label: "prefix",  width: "1fr"   },
              { key: "enabled", label: "enabled", width: "80px",
                render: r => <span style={{ color: r.enabled ? GREEN : FAINT }}>{r.enabled ? "yes" : "no"}</span> },
            ]}
            rows={routes}
          />
      }
    </div>
  );
}

// ─── FALLBACK ─────────────────────────────────────────────────────────────────
const FALLBACK = [
  { id:"1", name:"ramallah-hospital-1", ip:"100.64.1.1", district:"RAMALLAH", role:"hospital", status:"up",   user:"ramallah", lastSeen:null, ping:4    },
  { id:"2", name:"ramallah-ngo-1",      ip:"100.64.1.2", district:"RAMALLAH", role:"ngo",      status:"up",   user:"ramallah", lastSeen:null, ping:6    },
  { id:"3", name:"nablus-hospital-1",   ip:"100.64.2.1", district:"NABLUS",   role:"hospital", status:"up",   user:"nablus",   lastSeen:null, ping:12   },
  { id:"4", name:"nablus-clinic-1",     ip:"100.64.2.2", district:"NABLUS",   role:"clinic",   status:"down", user:"nablus",   lastSeen:null, ping:null },
  { id:"5", name:"hebron-hospital-1",   ip:"100.64.3.1", district:"HEBRON",   role:"hospital", status:"up",   user:"hebron",   lastSeen:null, ping:18   },
  { id:"6", name:"jenin-hospital-1",    ip:"100.64.4.1", district:"JENIN",    role:"hospital", status:"up",   user:"jenin",    lastSeen:null, ping:23   },
  { id:"7", name:"jenin-field-1",       ip:"100.64.4.2", district:"JENIN",    role:"field",    status:"down", user:"jenin",    lastSeen:null, ping:null },
  { id:"8", name:"tulkarm-ngo-1",       ip:"100.64.5.1", district:"TULKARM",  role:"ngo",      status:"up",   user:"tulkarm",  lastSeen:null, ping:31   },
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [active,  setActive]  = useState("overview");
  const [nodes,   setNodes]   = useState(FALLBACK);
  const [users,   setUsers]   = useState([]);
  const [routes,  setRoutes]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [n, u, r] = await Promise.all([fetchNodes(), fetchUsers(), fetchRoutes()]);
      setNodes(n); setUsers(u); setRoutes(r);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 30_000);
    return () => clearInterval(iv);
  }, [refresh]);

  const pages = {
    overview:  <OverviewPage  nodes={nodes} users={users} routes={routes} setActive={setActive} />,
    nodes:     <NodesPage     nodes={nodes} />,
    districts: <DistrictsPage nodes={nodes} />,
    metrics:   <MetricsPage   nodes={nodes} />,
    uptime:    <UptimePage    nodes={nodes} />,
    settings:  <SettingsPage  users={users} routes={routes} refetch={refresh} loading={loading} error={error} />,
  };

  return (
    <div style={{
      fontFamily: FONT, background: WHITE, color: TEXT,
      width: "100vw", height: "100vh",
      display: "flex", overflow: "hidden", margin: 0, padding: 0,
    }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {pages[active] ?? null}
      </div>
    </div>
  );
}
