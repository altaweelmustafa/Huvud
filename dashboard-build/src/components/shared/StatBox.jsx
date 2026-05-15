import { FONT, TEXT, MUTED, BORDER } from "../../constants";

export default function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, padding: "20px 24px", borderRight: `1px solid ${BORDER}` }}>
      <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: TEXT }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: 14, color: MUTED, marginTop: 4 }}>{label}</div>
    </div>
  );
}
