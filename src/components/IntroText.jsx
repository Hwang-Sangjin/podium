import { useEffect, useRef } from "react";

const BG_START = 0.78;
const BG_END = 0.86;
const SCROLL_START = 0.86; // 콘텐츠가 위로 흐르기 시작
const BTS = ["#3a3a3a", "#2e4f3a", "#5a2e1a", "#1e3a4f", "#6b6320", "#3a2e5a"];

const SERVICES = [
  "Creative Direction",
  "Video Production",
  "Post-Production",
  "Photography",
  "VFX",
];
const CLIENTS = [
  "Salomon",
  "ON Running",
  "Puma",
  "Nike",
  "The North Face",
  "Saucony",
  "Garmin",
  "Ciele",
  "Shokz",
  "Auclair",
  "Altitude Sports",
  "Le Braquet",
];
const ATHLETES =
  "Mathieu Blanchard, Conner Mantz, Helen Obiri, Tom Evans, Jay Du Temple, Rener Gracie, Marianne Hogan, Shen Jiasheng, Katie Schide, Lucy Bartholomew, Dan Green, Sara Alonso, Dakota Popehn, Adam Peterman, Germain Grangier, Blandine L'hirondel, Ruy Hueda, Arthur Joyeux-Bouillon, Jisub Kim, Yuri Yoshizumi, Rosanna Buchhauer, Jean-Philippe Thibodeau and many more";

const label = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "#000",
  marginBottom: 24,
};
const item = {
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
  lineHeight: 1.5,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
};

export default function IntroText({ progressRef }) {
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = progressRef ? progressRef.current : 0;

      // 흰 배경 페이드인
      const bgP = Math.min(
        Math.max((p - BG_START) / (BG_END - BG_START), 0),
        1,
      );
      if (bgRef.current) bgRef.current.style.opacity = String(bgP);

      // 콘텐츠: SCROLL_START 이후 progress에 따라 위로 흐름
      const scrollP = Math.min(
        Math.max((p - SCROLL_START) / (1 - SCROLL_START), 0),
        1,
      );
      if (contentRef.current) {
        contentRef.current.style.opacity = String(bgP);
        // 콘텐츠가 충분히 위로 빠지도록 이동 범위 확대
        const ty = 80 - scrollP * 280; // 80vh → -200vh (3블록까지 다 통과)
        contentRef.current.style.transform = `translateY(${ty}vh)`;
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  return (
    <>
      {/* 흰 배경 */}
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

      {/* 콘텐츠 컨테이너 (세로로 길게, progress에 따라 위로 흐름) */}
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          padding: "0 60px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {/* 1. Available Worldwide + 큰 텍스트 */}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
              maxWidth: 1100,
              color: "#000",
              fontSize: "clamp(28px, 4vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            We help sports brands tell stories through fieldwork, narrative, and
            creative research, with deep production expertise.
          </p>
          {/* Behind the scenes */}
          <div style={{ marginTop: 80 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#000",
                marginBottom: 20,
              }}
            >
              BEHIND THE SCENES
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 16,
              }}
            >
              {BTS.map((c, i) => (
                <div
                  key={i}
                  style={{ aspectRatio: "3/4", background: c, borderRadius: 2 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2. We've worked with... 큰 제목 */}
        <div
          style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}
        >
          <p
            style={{
              margin: 0,
              color: "#000",
              fontSize: "clamp(36px, 6vw, 96px)",
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            We've worked with sports brands and athletes worldwide.
          </p>
        </div>

        {/* 3. 어긋난 3블록 */}
        <div style={{ paddingBottom: "120px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "auto auto auto",
            }}
          >
            {/* CLIENTS — 오른쪽 위 */}
            <div
              style={{
                gridColumn: "2 / 4",
                gridRow: "1 / 3",
                background: "#d9d9d9",
                padding: "48px",
              }}
            >
              <div style={label}>CLIENTS</div>
              {CLIENTS.map((c) => (
                <div key={c} style={item}>
                  {c}
                </div>
              ))}
            </div>
            {/* SERVICES — 왼쪽, 아래 정렬로 겹침 */}
            <div
              style={{
                gridColumn: "1 / 2",
                gridRow: "2 / 3",
                background: "#f7f0f0",
                padding: "48px",
                alignSelf: "end",
              }}
            >
              <div style={label}>SERVICES</div>
              {SERVICES.map((s) => (
                <div key={s} style={item}>
                  {s}
                </div>
              ))}
            </div>
            {/* ATHLETES — 아래 전체 */}
            <div
              style={{
                gridColumn: "1 / 3",
                gridRow: "3 / 4",
                background: "#bfbfbf",
                padding: "48px",
              }}
            >
              <div style={label}>ATHLETES WE'VE WORKED WITH</div>
              <div style={{ ...item, fontSize: 18, lineHeight: 1.5 }}>
                {ATHLETES}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
