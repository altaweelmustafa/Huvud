import { GREEN, FAINT } from "../../constants";

export default function StatusDot({ up, size = 10 }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size,
      borderRadius: "50%",
      background: up ? GREEN : FAINT,
      flexShrink: 0,
    }} />
  );
}
