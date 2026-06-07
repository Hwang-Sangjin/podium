import { useEffect, useRef } from "react";
import gsap from "gsap";
import Scene3D from "./Scene3D";
import { LOGO_PATH } from "./iconPath";

const SCROLL_DISTANCE = 1500; // 이만큼 스크롤하면 진입 완료

export default function MaskScene() {
  const dotRef = useRef(null);
  const logoGroupRef = useRef(null);
  const logoInnerRef = useRef(null);
  const whiteRectRef = useRef(null);
  const progressRef = useRef(0); // 스크롤 진행도 → Scene3D 줌인에 전달

  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const iconW = W * 0.75;
    const iconH = iconW * (32 / 50);
    const fullScale = iconW / 50;
    const tx = (W - iconW) / 2;
    const ty = (H - iconH) / 2;

    logoGroupRef.current.setAttribute(
      "transform",
      `translate(${tx}, ${ty}) scale(${fullScale})`,
    );

    const dot = dotRef.current;
    const logoInner = logoInnerRef.current;
    const whiteRect = whiteRectRef.current;

    // 초기: 점만 보임
    gsap.set(logoInner, {
      opacity: 0,
      scale: 0.1,
      transformOrigin: "center center",
      svgOrigin: "25 16",
    });
    gsap.set(dot, { scale: 1, opacity: 1 });

    // 1단계: 로딩 (점 → 로고 구멍 등장)
    const intro = gsap.timeline({ delay: 0.8 });
    intro
      .to(dot, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.in" })
      .to(logoInner, { opacity: 1, duration: 0.01 }, "<")
      .to(logoInner, { scale: 1, duration: 0.6, ease: "power3.out" }, "<");

    // 2단계: 스크롤 → 마스크 확장 + 카메라 줌인 동시
    const diag = Math.sqrt(W * W + H * H);
    const maxScale = (diag / iconW) * 2.5; // 구멍이 화면 덮을 배율

    const onScroll = () => {
      const p = Math.min(window.scrollY / SCROLL_DISTANCE, 1); // 0~1
      progressRef.current = p; // Scene3D 카메라 줌인용

      // 마스크 구멍 확장 (화면 중앙 기준)
      gsap.set(logoInner, { scale: 1 + p * maxScale, svgOrigin: "25 16" });

      // 끝부분에서 흰 레이어 페이드아웃 → 풀스크린 3D
      const fade = p > 0.8 ? (p - 0.8) / 0.2 : 0;
      gsap.set(whiteRect, { opacity: 1 - fade });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      intro.kill();
    };
  }, []);

  return (
    <>
      {/* 스크롤 공간 확보 */}
      <div style={{ height: `calc(100vh + ${SCROLL_DISTANCE}px)` }} />

      {/* 고정 레이어 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        {/* 뒤: 3D 씬 */}
        <Scene3D progressRef={progressRef} />

        {/* 앞: 마스크 오버레이 */}
        <svg
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          <defs>
            <mask id="logoMask">
              <rect width="100%" height="100%" fill="white" />
              <g ref={logoGroupRef}>
                <g ref={logoInnerRef}>
                  <path d={LOGO_PATH} fill="black" />
                </g>
              </g>
            </mask>
          </defs>
          <rect
            ref={whiteRectRef}
            width="100%"
            height="100%"
            fill="#ffffff"
            mask="url(#logoMask)"
          />
        </svg>

        {/* 검은 점 */}
        <div
          ref={dotRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#000",
          }}
        />
      </div>
    </>
  );
}
