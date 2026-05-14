import { useState } from "react";
import { FONT, TEAL, MUTED, FAINT, BORDER, GREEN } from "../../constants";
import NODE_LOCATIONS from "../../data/nodeLocations";
import SectionHeading from "../shared/SectionHeading";
import FieldLabel     from "../shared/FieldLabel";
import ReadBox        from "../shared/ReadBox";
import StatusDot      from "../shared/StatusDot";
import Table          from "../shared/Table";
import Btn            from "../shared/Btn";

export default function NodesPage({ nodes }) {
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("");

  const filtered = nodes.filter(n =>
    n.name.includes(filter) ||
    n.ip.includes(filter) ||
    n.user.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub={`${nodes.length} nodes`}>Nodes</SectionHeading>

      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="filter by name, ip, user…"
        style={{ fontFamily: FONT, fontSize: 15, color: "#1a1a1a", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 16px", marginBottom: 22, width: "100%", maxWidth: 440, outline: "none" }}
        onFocus={e => e.target.style.borderColor = TEAL}
        onBlur={e  => e.target.style.borderColor = BORDER}
      />

      <Table
        keyField="name"
        selectedKey={selected?.name}
        onRowClick={r => setSelected(selected?.name === r.name ? null : r)}
        cols={[
          { key: "status", label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
          { key: "name",   label: "hostname", width: "1fr"   },
          { key: "ip",     label: "ip",       width: "145px" },
          { key: "user",   label: "user",     width: "120px", color: () => MUTED },
          { key: "role",   label: "role",     width: "120px", color: () => MUTED },
          { key: "status", label: "status",   width: "80px",
            render: r => <span style={{ color: r.status === "up" ? GREEN : FAINT }}>{r.status}</span> },
        ]}
        rows={filtered}
      />

      {selected && (
        <>
          <SectionHeading sub={selected.name}>Node Detail</SectionHeading>
          {[
            { k: "Hostname",    v: selected.name },
            { k: "IP Address",  v: selected.ip },
            { k: "User",        v: selected.user },
            { k: "Role",        v: selected.role },
            { k: "Status",      v: selected.status },
            { k: "Last Seen",   v: selected.lastSeen ? new Date(selected.lastSeen).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "—" },
            { k: "Tunnel",      v: "WireGuard" },
            { k: "Coordinates", v: NODE_LOCATIONS[selected.name] ? `${NODE_LOCATIONS[selected.name].lat}, ${NODE_LOCATIONS[selected.name].lng}` : "not set" },
          ].map(row => (
            <div key={row.k} style={{ marginBottom: 16 }}>
              <FieldLabel>{row.k}</FieldLabel>
              <ReadBox value={row.v} />
            </div>
          ))}
          <Btn onClick={() => setSelected(null)}>Close</Btn>
        </>
      )}
    </div>
  );
}
