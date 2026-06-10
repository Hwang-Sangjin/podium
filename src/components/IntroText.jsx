import { useEffect, useRef } from "react";

const BG_START = 0.78;
const BG_END = 0.86;
const TEXT_START = 0.86;
const BTS = ["#3a3a3a", "#2e4f3a", "#5a2e1a", "#1e3a4f", "#6b6320"];

export default function IntroText({ progressRef }) {
  const bgRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = progressRef ? progressRef.current : 0;

      const bgP = Math.min(
        Math.max((p - BG_START) / (BG_END - BG_START), 0),
        1,
      );
      if (bgRef.current) bgRef.current.style.opacity = String(bgP);

      const txtP = Math.min(
        Math.max((p - TEXT_START) / (1 - TEXT_START), 0),
        1,
      );
      if (textRef.current) {
        textRef.current.style.opacity = String(txtP);
        // 화면 절반 높이(50vh)만큼 아래에서 올라옴
        textRef.current.style.transform = `translateY(${(1 - txtP) * 50}vh)`;
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  return (
    <>
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#fff",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* 텍스트 블록을 화면 위쪽 50%에서 시작 (top: 50%) */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: "100%",
          padding: "0 60px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            color: "#000",
            marginBottom: 24,
          }}
        >
          AVAILABLE WORLDWIDE
        </div>
        <p
          style={{
            margin: 0,
            color: "#000",
            fontSize: "clamp(28px, 4vw, 60px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore.
        </p>
        <div style={{ marginTop: 40 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#000",
              marginBottom: 16,
            }}
          >
            BEHIND THE SCENES
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {BTS.map((c, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "200px",
                  background: c,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
