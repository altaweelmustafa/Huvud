import { FONT, TEAL, MUTED, FAINT, BORDER, GRAY_BG, WHITE, TEXT, GREEN, RED } from "../../constants";
import NODE_LOCATIONS from "../../data/nodeLocations";
import SectionHeading from "../shared/SectionHeading";
import StatusDot      from "../shared/StatusDot";
import Table          from "../shared/Table";

export default function CoordinatesPage({ nodes }) {
  const missing = nodes.filter(n => !NODE_LOCATIONS[n.name]);

  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub={`${Object.keys(NODE_LOCATIONS).length} configured`}>Coordinates</SectionHeading>

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 38 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px 1fr 90px", padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, fontFamily: FONT, fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG }}>
          <span>hostname</span><span>lat</span><span>lng</span><span>label</span><span>status</span>
        </div>
        {Object.entries(NODE_LOCATIONS).map(([hostname, loc], i, arr) => {
          const node   = nodes.find(n => n.name === hostname);
          const status = node ? node.status : "unconfigured";
          return (
            <div key={hostname} style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px 1fr 90px", padding: "12px 20px", alignItems: "center", borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none", fontFamily: FONT, fontSize: 15 }}>
              <span style={{ color: TEXT }}>{hostname}</span>
              <span style={{ color: MUTED }}>{loc.lat.toFixed(5)}</span>
              <span style={{ color: MUTED }}>{loc.lng.toFixed(5)}</span>
              <span style={{ color: MUTED }}>{loc.label}</span>
              <span style={{ color: status === "up" ? GREEN : status === "unconfigured" ? FAINT : RED }}>{status}</span>
            </div>
          );
        })}
      </div>

      {missing.length > 0 && (
        <>
          <SectionHeading sub={`${missing.length} without exact coordinates`}>Missing</SectionHeading>
          <Table
            keyField="name"
            cols={[
              { key: "status", label: "", width: "28px", render: r => <StatusDot up={r.status === "up"} /> },
              { key: "name",   label: "hostname", width: "1fr"   },
              { key: "user",   label: "user",     width: "140px", color: () => MUTED },
              { key: "role",   label: "role",     width: "130px", color: () => MUTED },
            ]}
            rows={missing}
          />
        </>
      )}

      <SectionHeading>Format</SectionHeading>
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
