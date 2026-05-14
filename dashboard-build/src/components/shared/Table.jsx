import { FONT, TEXT, FAINT, WHITE, BORDER, GRAY_BG, TEAL_BG } from "../../constants";

export default function Table({ cols, rows, onRowClick, selectedKey, keyField = "id" }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden", marginBottom: 28 }}>
      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "),
        padding: "10px 20px", borderBottom: `1px solid ${BORDER}`,
        fontFamily: FONT, fontSize: 12, color: FAINT,
        textTransform: "uppercase", letterSpacing: 1, background: GRAY_BG,
      }}>
        {cols.map(c => <span key={c.key + c.label}>{c.label}</span>)}
      </div>

      {rows.length === 0 && (
        <div style={{ padding: "28px 20px", fontFamily: FONT, fontSize: 15, color: FAINT, textAlign: "center" }}>
          no data
        </div>
      )}

      {rows.map((row, i) => (
        <div
          key={row[keyField] ?? i}
          onClick={() => onRowClick?.(row)}
          style={{
            display: "grid",
            gridTemplateColumns: cols.map(c => c.width ?? "1fr").join(" "),
            padding: "12px 20px", alignItems: "center",
            borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : "none",
            background: selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent",
            cursor: onRowClick ? "pointer" : "default",
            transition: "background 0.1s",
          }}
          onMouseEnter={e => {
            if (!selectedKey || row[keyField] !== selectedKey)
              e.currentTarget.style.background = "#f9fafb";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background =
              selectedKey && row[keyField] === selectedKey ? TEAL_BG : "transparent";
          }}
        >
          {cols.map(c => (
            <span
              key={c.key + c.label}
              style={{
                fontFamily: FONT, fontSize: 15,
                color: c.color?.(row) ?? TEXT,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {c.render ? c.render(row) : row[c.key]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
