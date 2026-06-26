import { useEffect, useRef } from "react";

const ITEMS = [
  { title: "DEVIATE", client: "PUMA", year: "2025", color: "#3a3a3a" },
  { title: "80 WINTERS", client: "AUCLAIR", year: "2025", color: "#1e3a4f" },
  { title: "MILIMANI", client: "SALOMON", year: "2025", color: "#5a2e1a" },
  {
    title: "NOT QUITE GONE",
    client: "LE BRAQUET",
    year: "2026",
    color: "#6b6320",
  },
  { title: "FRAGMENTS", client: "NIKE", year: "2024", color: "#2e4f3a" },
  { title: "HORIZON", client: "ADIDAS", year: "2026", color: "#3a2e5a" },
];

const OVERSCROLL = 120;

export default function WorkGrid({ progressRef, startAt = 0.3, endAt = 0.55 }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = progressRef ? progressRef.current : 0;

      // endAt 이후엔 완전히 숨김
      if (p >= endAt) {
        if (wrapRef.current) wrapRef.current.style.opacity = "0";
        return;
      }

      // startAt~endAt 구간만 움직임
      const local = Math.min(Math.max((p - startAt) / (endAt - startAt), 0), 1);
      const ty = 100 - local * (100 + OVERSCROLL);
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translateY(${ty}vh)`;
        wrapRef.current.style.opacity = String(local > 0 ? 1 : 0);
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [progressRef, startAt, endAt]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        minHeight: "100vh",
        background: "transparent",
        transform: "translateY(100vh)",
        padding: "100px 60px 60px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "40px 30px",
        pointerEvents: "none",
      }}
    >
      {ITEMS.map((it, i) => (
        <div key={i}>
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              background: it.color,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 12,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {it.title}
            </span>
            <span style={{ color: "#888", fontSize: 12, textAlign: "right" }}>
              {it.year}
              <br />
              {it.client}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
