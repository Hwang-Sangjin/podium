import { useEffect, useRef } from "react";
import gsap from "gsap";
import { separate } from "flubber";
import Scene3D from "./Scene3D";
import {
  CIRCLE_PATH,
  LOGO_BODY,
  LOGO_DOT1,
  LOGO_DOT2,
  LOGO_PATH,
} from "./iconPath";

const SCROLL_DISTANCE = 1500;

export default function MaskScene() {
  const morphPathRef = useRef(null);
  const logoGroupRef = useRef(null);
  const logoInnerRef = useRef(null);
  const coverRef = useRef(null); // 모핑 전 3D 가리는 검은 덮개
  const coverGroupRef = useRef(null);
  const coverInnerRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const iconW = W * 0.75;
    const iconH = iconW * (32 / 50);
    const fullScale = iconW / 50;
    const tx = (W - iconW) / 2;
    const ty = (H - iconH) / 2;

    const transform = `translate(${tx}, ${ty}) scale(${fullScale})`;
    logoGroupRef.current.setAttribute("transform", transform);
    coverGroupRef.current.setAttribute("transform", transform);

    const morphPath = morphPathRef.current;
    const logoInner = logoInnerRef.current;
    const cover = coverRef.current;

    // flubber: 원 → 로고 분리 모핑
    const interpolator = separate(
      CIRCLE_PATH,
      [LOGO_BODY, LOGO_DOT1, LOGO_DOT2],
      { single: true, maxSegmentLength: 0.05 },
    );

    // 모핑 path: 마스크 구멍 + 검은 덮개 둘 다 같은 d 사용
    const setMorphD = (d) => {
      morphPath.setAttribute("d", d);
      coverInnerRef.current.setAttribute("d", d);
    };

    setMorphD(interpolator(0));
    gsap.set(morphPath, { opacity: 1 });
    gsap.set(logoInner, { opacity: 0 });
    gsap.set(cover, { opacity: 1 }); // 처음엔 검은 덮개 보임 → 3D 가림

    // 1단계: 원 → 로고 모핑
    const morphObj = { t: 0 };
    const intro = gsap.timeline({ delay: 0.8 });
    intro.to(morphObj, {
      t: 1,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => setMorphD(interpolator(morphObj.t)),
      onComplete: () => {
        gsap.set(logoInner, { opacity: 1 });
        gsap.set(morphPath, { opacity: 0 });
        // 검은 덮개 페이드아웃 → 3D 드러남
        gsap.to(cover, { opacity: 0, duration: 0.5, ease: "power2.out" });
      },
    });

    // 2단계: 스크롤 → 마스크 확장
    const diag = Math.sqrt(W * W + H * H);
    const maxScale = (diag / iconW) * 30;

    gsap.set(logoInner, {
      scale: 1,
      transformOrigin: "center center",
      svgOrigin: "25 16",
    });

    const onScroll = () => {
      const p = Math.min(window.scrollY / SCROLL_DISTANCE, 1);
      progressRef.current = p;
      gsap.set(logoInner, { scale: 1 + p * maxScale, svgOrigin: "25 16" });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      intro.kill();
    };
  }, []);

  return (
    <>
      <div style={{ height: `calc(100vh + ${SCROLL_DISTANCE}px)` }} />
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
        <Scene3D progressRef={progressRef} />

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
                <path ref={morphPathRef} fill="black" />
                <g ref={logoInnerRef}>
                  <path d={LOGO_PATH} fill="black" />
                </g>
              </g>
            </mask>
          </defs>

          {/* 흰 레이어 — 구멍으로 3D(또는 덮개) 비침 */}
          <rect
            width="100%"
            height="100%"
            fill="#ffffff"
            mask="url(#logoMask)"
          />

          {/* 검은 덮개 — 모핑 중 구멍 안 3D 가림. 모핑 끝나면 페이드아웃 */}
          <g ref={coverRef}>
            <g ref={coverGroupRef}>
              <path ref={coverInnerRef} fill="#000000" />
            </g>
          </g>
        </svg>
      </div>
    </>
  );
}
