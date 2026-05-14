import { useState, useEffect } from "react";

export default function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return <>{t.toISOString().slice(0, 19).replace("T", " ")} UTC</>;
}
