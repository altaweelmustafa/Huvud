import { FONT, TEAL, TEAL_BG, GRAY_BG, BORDER, FAINT, TEXT, NAV } from "../constants";
import Clock from "./shared/Clock";

export default function Sidebar({ active, setActive, open, setOpen }) {
  return (
    <div style={{
      width: open ? 220 : 56, flexShrink: 0,
      background: GRAY_BG, borderRight: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column",
      fontFamily: FONT, transition: "width 0.2s ease", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "18px 16px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
      }}>
        <div
          onClick={() => setOpen(o => !o)}
          style={{ display: "flex", flexDirection: "column", gap: 5, cursor: "pointer", flexShrink: 0 }}
        >
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 20, height: 2, background: TEAL, borderRadius: 1 }} />
          ))}
        </div>
        {open && (
          <span style={{ fontSize: 19, fontWeight: 700, color: TEAL, whiteSpace: "nowrap" }}>
            Huvud
          </span>
        )}
      </div>

      {/* Nav */}
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
              <span style={{ fontSize: 17, flexShrink: 0, width: open ? 20 : "100%", textAlign: "center" }}>
                {item.icon}
              </span>
              {open && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      {/* Clock */}
      <div style={{
        padding: open ? "14px 20px" : "14px 0",
        borderTop: `1px solid ${BORDER}`,
        fontSize: 12, color: FAINT,
        textAlign: open ? "left" : "center",
        overflow: "hidden", whiteSpace: "nowrap",
      }}>
        {open ? <Clock /> : "·"}
      </div>
    </div>
  );
}
