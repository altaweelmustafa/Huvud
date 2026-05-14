import { useState } from "react";
import { FONT, TEAL, TEAL_BG, GRAY_BG, BORDER, FAINT, WHITE, RED } from "../../constants";

export default function Btn({ children, onClick, outline = false, danger = false, disabled = false }) {
  const [h, setH] = useState(false);
  const bc = danger ? RED : TEAL;
  const bg = disabled
    ? GRAY_BG
    : danger
      ? (h ? "#b91c1c" : RED)
      : outline
        ? (h ? TEAL_BG : "transparent")
        : (h ? "#0a5c60" : TEAL);
  const color = disabled ? FAINT : outline && !danger ? TEAL : WHITE;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: FONT, fontSize: 15, fontWeight: 500,
        padding: "9px 22px", borderRadius: 20,
        cursor: disabled ? "not-allowed" : "pointer",
        border: `2px solid ${disabled ? BORDER : bc}`,
        background: bg, color,
        transition: "all 0.1s",
      }}
    >
      {children}
    </button>
  );
}
