import { FONT, TEXT, WHITE, BORDER } from "../../constants";

export default function ReadBox({ value }) {
  return (
    <div style={{
      fontFamily: FONT, fontSize: 15, color: TEXT,
      background: WHITE, border: `1px solid ${BORDER}`,
      borderRadius: 6, padding: "10px 14px",
      marginBottom: 16, wordBreak: "break-all",
    }}>
      {value}
    </div>
  );
}
