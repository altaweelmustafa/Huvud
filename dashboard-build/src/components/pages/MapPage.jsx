import { useState, useEffect, useRef } from "react";
import { FONT, TEAL, GRAY_BG, WHITE, TEXT, MUTED, FAINT, BORDER, GREEN, RED } from "../../constants";
import NODE_LOCATIONS  from "../../data/nodeLocations";
import { DISTRICT_COORDS } from "../../constants";

const pinColor = s => s === "up" ? GREEN : s === "unconfigured" ? FAINT : RED;

export default function MapPage({ nodes }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const [selected, setSelected] = useState(null);

  // Build pins from NODE_LOCATIONS + any unmatched Headscale nodes
  const pins = Object.entries(NODE_LOCATIONS).map(([hostname, loc]) => {
    const node = nodes.find(n => n.name === hostname);
    return {
      hostname, lat: loc.lat, lng: loc.lng, label: loc.label,
      status: node ? node.status : "unconfigured",
      ip:     node ? node.ip : "—",
      user:   node ? node.user : hostname.split("-")[0],
    };
  });
  nodes.forEach(node => {
    if (!NODE_LOCATIONS[node.name]) {
      const c = DISTRICT_COORDS[node.district] ?? DISTRICT_COORDS.DEFAULT;
      pins.push({
        hostname: node.name, label: node.name,
        lat: c.lat + (Math.random() - 0.5) * 0.008,
        lng: c.lng + (Math.random() - 0.5) * 0.008,
        status: node.status, ip: node.ip, user: node.user,
      });
    }
  });

  useEffect(() => {
    if (leafletRef.current) return;
    const link  = document.createElement("link");
    link.rel    = "stylesheet";
    link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script   = document.createElement("script");
    script.src     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload  = () => initMap();
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (window.L && leafletRef.current) updateMarkers();
  }, [nodes]);

  function initMap() {
    if (!mapRef.current || leafletRef.current) return;
    const L   = window.L;
    const map = L.map(mapRef.current, { center: [32.0, 35.25], zoom: 9 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom: 18,
    }).addTo(map);
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
      const icon  = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
        iconSize: [22, 22], iconAnchor: [11, 11],
      });
      const marker = L.marker([pin.lat, pin.lng], { icon })
        .addTo(leafletRef.current.map)
        .bindPopup(`
          <div style="font-family:${FONT};font-size:13px;min-width:200px;line-height:1.7">
            <div style="font-weight:700;color:${TEAL};font-size:15px;margin-bottom:8px">${pin.label}</div>
            <div style="color:#555">hostname: <span style="color:#111">${pin.hostname}</span></div>
            <div style="color:#555">ip: <span style="color:#111">${pin.ip}</span></div>
            <div style="color:#555">user: <span style="color:#111">${pin.user}</span></div>
            <div style="color:#555;margin-top:6px">status: <span style="color:${color};font-weight:700">${pin.status}</span></div>
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

        {/* Side panel */}
        <div style={{ width: 290, flexShrink: 0, background: WHITE, borderLeft: `1px solid ${BORDER}`, overflowY: "auto", fontFamily: FONT }}>
          {selected ? (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 15, color: TEAL, fontWeight: 700, marginBottom: 16 }}>{selected.label}</div>
              {[
                { k: "hostname", v: selected.hostname },
                { k: "ip",       v: selected.ip },
                { k: "user",     v: selected.user },
                { k: "status",   v: selected.status, color: pinColor(selected.status) },
                { k: "lat",      v: selected.lat.toFixed(6) },
                { k: "lng",      v: selected.lng.toFixed(6) },
              ].map(r => (
                <div key={r.k} style={{ marginBottom: 14, borderBottom: `1px solid ${BORDER}`, paddingBottom: 14 }}>
                  <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{r.k}</div>
                  <div style={{ fontSize: 15, color: r.color ?? TEXT }}>{r.v}</div>
                </div>
              ))}
              <button
                onClick={() => setSelected(null)}
                style={{ fontFamily: FONT, fontSize: 14, color: MUTED, background: "none", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "6px 16px", cursor: "pointer", marginTop: 6 }}
              >
                close
              </button>
            </div>
          ) : (
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>all pins</div>
              {pins.map(pin => (
                <div
                  key={pin.hostname}
                  onClick={() => { setSelected(pin); leafletRef.current?.map.setView([pin.lat, pin.lng], 14); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 5, cursor: "pointer", marginBottom: 2, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = GRAY_BG}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: pinColor(pin.status) }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 14, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pin.label}</div>
                    <div style={{ fontSize: 12, color: FAINT }}>{pin.user}</div>
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
