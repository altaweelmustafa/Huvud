import { useState, useEffect } from "react";
import { FONT, TEAL, MUTED, FAINT, BORDER, WHITE, TEXT, GREEN, RED, AMBER, UPTIME_KUMA_URL } from "../../constants";
import { fetchUptimeKuma, parseUptimeKuma } from "../../api";
import SectionHeading from "../shared/SectionHeading";
import StatusDot      from "../shared/StatusDot";
import Table          from "../shared/Table";

export default function UptimePage({ nodes }) {
  const [kumaData,  setKumaData]  = useState(null);
  const [kumaError, setKumaError] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const raw = await fetchUptimeKuma();
      if (raw) { setKumaData(parseUptimeKuma(raw)); setKumaError(false); }
      else { setKumaError(true); }
      setLoading(false);
    }
    load();
    const iv = setInterval(load, 30_000);
    return () => clearInterval(iv);
  }, []);

  const monitors = kumaData
    ? Object.entries(kumaData).map(([name, k]) => {
        const node = nodes.find(n => n.name === name);
        return {
          name,
          hostname: k.hostname ?? "—",
          ping:     k.ping,
          uptime:   k.uptime,
          type:     k.type,
          kumaUp:   k.up,
          hsUp:     node ? node.status === "up" : null,
          hsIp:     node?.ip ?? null,
        };
      })
    : [];

  const upCount = monitors.filter(m => m.kumaUp).length;

  return (
    <div style={{ padding: "34px 44px", width: "100%", maxWidth: 980 }}>
      <SectionHeading sub={monitors.length > 0 ? `${upCount} of ${monitors.length} up` : ""}>
        Uptime
      </SectionHeading>

      {/* Connection status */}
      {!UPTIME_KUMA_URL ? (
        <div style={{ fontFamily: FONT, fontSize: 14, color: AMBER, background: "#fef3c7", border: `1px solid #fde68a`, borderRadius: 6, padding: "10px 16px", marginBottom: 24 }}>
          Set UPTIME_KUMA_URL and UPTIME_KUMA_SLUG in src/constants.js
        </div>
      ) : kumaError ? (
        <div style={{ fontFamily: FONT, fontSize: 14, color: AMBER, background: "#fef3c7", border: `1px solid #fde68a`, borderRadius: 6, padding: "10px 16px", marginBottom: 24 }}>
          Could not reach Uptime Kuma at {UPTIME_KUMA_URL}
        </div>
      ) : loading ? (
        <div style={{ fontFamily: FONT, fontSize: 14, color: FAINT, marginBottom: 24 }}>loading…</div>
      ) : (
        <div style={{ fontFamily: FONT, fontSize: 14, color: GREEN, marginBottom: 24 }}>
          ● connected to uptime kuma
        </div>
      )}

      {monitors.length > 0 && (
        <Table
          keyField="name"
          cols={[
            { key: "kumaUp",   label: "",          width: "28px",  render: r => <StatusDot up={r.kumaUp} /> },
            { key: "name",     label: "monitor",   width: "1fr"   },
            { key: "hostname", label: "host / ip", width: "160px",
              render: r => <span style={{ color: MUTED, fontSize: 14 }}>{r.hsIp ?? r.hostname ?? "—"}</span> },
            { key: "type",     label: "type",      width: "70px",  color: () => FAINT },
            { key: "ping",     label: "ping",      width: "80px",
              render: r => <span style={{ color: r.ping != null ? TEXT : FAINT, fontSize: 14 }}>
                {r.ping != null ? `${r.ping}ms` : "—"}
              </span> },
            { key: "uptime",   label: "24h",       width: "80px",
              render: r => <span style={{ color: r.uptime != null ? (r.uptime >= 95 ? GREEN : r.uptime >= 80 ? AMBER : RED) : FAINT, fontSize: 14 }}>
                {r.uptime != null ? `${r.uptime}%` : "—"}
              </span> },
            { key: "hsUp",     label: "wireguard", width: "100px",
              render: r => r.hsUp === null
                ? <span style={{ color: FAINT, fontSize: 14 }}>—</span>
                : <span style={{ color: r.hsUp ? GREEN : RED, fontSize: 14 }}>{r.hsUp ? "up" : "down"}</span> },
          ]}
          rows={monitors}
        />
      )}

      {!loading && monitors.length === 0 && !kumaError && (
        <div style={{ fontFamily: FONT, fontSize: 15, color: FAINT }}>
          no monitors found — add monitors to your status page in Uptime Kuma
        </div>
      )}
    </div>
  );
}
