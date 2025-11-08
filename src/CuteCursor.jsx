// src/CuteCursor.jsx
import { useEffect, useState } from "react";

export default function CuteCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 32,
        height: 32,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 9999,
        backgroundImage: "url('/paw.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}