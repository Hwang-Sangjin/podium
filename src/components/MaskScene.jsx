import { useEffect, useRef } from "react";
import gsap from "gsap";
import Scene3D from "./Scene3D";
import { LOGO_PATH } from "./iconPath";

export default function MaskScene() {
  const dotRef = useRef(null);
  const logoGroupRef = useRef(null); // 로고 위치/크기
  const logoInnerRef = useRef(null); // 로고 확장 애니메이션

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

    // 초기: 점만 보임, 로고 숨김 (작게)
    gsap.set(logoInner, {
      opacity: 0,
      scale: 0.1,
      transformOrigin: "center center",
      svgOrigin: "25 16",
    });
    gsap.set(dot, { scale: 1, opacity: 1 });

    const tl = gsap.timeline({ delay: 1.0 });

    // 점 사라짐 + 로고 구멍이 펑 등장 (그 안에 3D 비침)
    tl.to(dot, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.in" })
      .to(logoInner, { opacity: 1, duration: 0.01 }, "<")
      .to(logoInner, { scale: 1, duration: 0.6, ease: "power3.out" }, "<");
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 뒤: 3D 씬 */}
      <Scene3D />

      {/* 앞: SVG 마스크 오버레이 */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          {/* 로고 모양만 구멍 → 그 안에 3D 비침 */}
          <mask id="logoMask">
            <rect width="100%" height="100%" fill="white" />
            <g ref={logoGroupRef}>
              <g ref={logoInnerRef}>
                <path d={LOGO_PATH} fill="black" />
              </g>
            </g>
          </mask>
        </defs>

        {/* 흰 레이어 — 로고 모양으로 구멍 */}
        <rect width="100%" height="100%" fill="#ffffff" mask="url(#logoMask)" />
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
  );
}
