import { FONT, TEAL, MUTED } from "../../constants";

export default function SectionHeading({ children, sub }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: TEAL, margin: 0 }}>
        {children}
      </h2>
      {sub && (
        <div style={{ fontFamily: FONT, fontSize: 14, color: MUTED, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
