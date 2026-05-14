import { FONT, TEAL, MUTED, FAINT, BORDER, GREEN } from "../../constants";
import SectionHeading from "../shared/SectionHeading";
import FieldLabel     from "../shared/FieldLabel";
import StatusDot      from "../shared/StatusDot";
import Table          from "../shared/Table";

export default function UsersPage({ nodes, users }) {
  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub={`${users.length} users`}>Users</SectionHeading>

      {users.length === 0 && (
        <div style={{ fontFamily: FONT, fontSize: 15, color: FAINT, marginBottom: 28 }}>no users yet</div>
      )}

      {users.map(u => {
        const dn  = nodes.filter(n => n.district === u.name.toUpperCase());
        const dup = dn.filter(n => n.status === "up").length;
        const pct = dn.length ? Math.round((dup / dn.length) * 100) : 0;

        return (
          <div key={u.id} style={{ marginBottom: 44 }}>
            <FieldLabel>{u.label}</FieldLabel>
            {dn.length > 0 && (
              <div style={{ height: 5, background: "#e5e7eb", borderRadius: 99, marginBottom: 18, maxWidth: 520 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: TEAL, borderRadius: 99 }} />
              </div>
            )}
            <Table
              keyField="name"
              cols={[
                { key: "status",   label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
                { key: "name",     label: "hostname",  width: "1fr"   },
                { key: "ip",       label: "ip",        width: "145px" },
                { key: "role",     label: "role",      width: "130px", color: () => MUTED },
                { key: "lastSeen", label: "last seen", width: "190px",
                  render: r => <span style={{ color: FAINT, fontSize: 13 }}>
                    {r.lastSeen ? new Date(r.lastSeen).toISOString().replace("T", " ").slice(0, 16) : "—"}
                  </span> },
                { key: "status",   label: "status",    width: "80px",
                  render: r => <span style={{ color: r.status === "up" ? GREEN : FAINT }}>{r.status}</span> },
              ]}
              rows={dn}
            />
          </div>
        );
      })}

      {users.length > 0 && (
        <>
          <SectionHeading>All Users</SectionHeading>
          <Table
            keyField="id"
            cols={[
              { key: "id",        label: "id",      width: "70px" },
              { key: "label",     label: "user",    width: "1fr"  },
              { key: "createdAt", label: "created", width: "230px",
                render: r => <span style={{ color: FAINT, fontSize: 14 }}>
                  {r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "—"}
                </span> },
            ]}
            rows={users}
          />
        </>
      )}
    </div>
  );
}
