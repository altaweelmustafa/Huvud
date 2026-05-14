import { FONT, TEXT, MUTED, FAINT, BORDER, GRAY_BG, WHITE, TEAL, GREEN, RED } from "../../constants";
import SectionHeading from "../shared/SectionHeading";
import StatBox        from "../shared/StatBox";
import StatusDot      from "../shared/StatusDot";
import Table          from "../shared/Table";

export default function OverviewPage({ nodes, users }) {
  const up   = nodes.filter(n => n.status === "up").length;
  const down = nodes.length - up;

  return (
    <div style={{ padding: "34px 44px", maxWidth: 980, width: "100%" }}>
      <SectionHeading>Overview</SectionHeading>

      {/* Stats */}
      <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", background: WHITE, marginBottom: 38 }}>
        <StatBox label="total nodes" value={nodes.length} />
        <StatBox label="online"      value={up}           />
        <StatBox label="offline"     value={down}         />
        <StatBox label="users"       value={users.length} />
        <div style={{ flex: 1, padding: "20px 24px" }}>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: TEXT }}>
            {nodes.length ? `${Math.round((up / nodes.length) * 100)}%` : "—"}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: MUTED, marginTop: 4 }}>uptime</div>
        </div>
      </div>

      {/* Users table */}
      <SectionHeading>Users</SectionHeading>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 38 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 230px", padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, fontFamily: FONT, fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG }}>
          <span>user</span><span>nodes</span><span>online</span><span>coverage</span>
        </div>
        {users.length === 0 && (
          <div style={{ padding: "28px 20px", fontFamily: FONT, fontSize: 15, color: FAINT, textAlign: "center" }}>no users yet</div>
        )}
        {users.map((u, i) => {
          const dn  = nodes.filter(n => n.district === u.name.toUpperCase());
          const dup = dn.filter(n => n.status === "up").length;
          const pct = dn.length ? Math.round((dup / dn.length) * 100) : 0;
          return (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 230px", padding: "13px 20px", alignItems: "center", borderBottom: i < users.length - 1 ? `1px solid ${BORDER}` : "none" }}>
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

      {/* Nodes */}
      <SectionHeading>Nodes</SectionHeading>
      <Table
        keyField="name"
        cols={[
          { key: "status", label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",   label: "hostname", width: "1fr"   },
          { key: "ip",     label: "ip",       width: "145px" },
          { key: "user",   label: "user",     width: "120px", color: () => MUTED },
          { key: "status", label: "status",   width: "80px",
            render: r => <span style={{ color: r.status === "up" ? GREEN : FAINT }}>{r.status}</span> },
        ]}
        rows={nodes}
      />
    </div>
  );
}
