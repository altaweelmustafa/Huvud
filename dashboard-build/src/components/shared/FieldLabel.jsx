import { FONT, TEAL } from "../../constants";

export default function FieldLabel({ children }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 6 }}>
      {children}
    </div>
  );
}
