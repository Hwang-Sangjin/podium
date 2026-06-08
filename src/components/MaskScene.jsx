import { useEffect, useRef } from "react";
import gsap from "gsap";
import { separate } from "flubber";
import Scene3D from "./Scene3D";
import WorkGrid from "./WorkGrid";
import IntroText from "./IntroText";
import {
  CIRCLE_PATH,
  LOGO_BODY,
  LOGO_DOT1,
  LOGO_DOT2,
  LOGO_PATH,
} from "./iconPath";

const SCROLL_DISTANCE = 5000;
const EXPAND_END = 0.35;

export default function MaskScene() {
  const morphPathRef = useRef(null);
  const logoGroupRef = useRef(null);
  const logoInnerRef = useRef(null);
  const coverRef = useRef(null);
  const coverGroupRef = useRef(null);
  const coverInnerRef = useRef(null);
  const targetRef = useRef(0);
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

    const interpolator = separate(
      CIRCLE_PATH,
      [LOGO_BODY, LOGO_DOT1, LOGO_DOT2],
      { single: true, maxSegmentLength: 0.05 },
    );
    const setMorphD = (d) => {
      morphPath.setAttribute("d", d);
      coverInnerRef.current.setAttribute("d", d);
    };

    setMorphD(interpolator(0));
    gsap.set(morphPath, { opacity: 1 });
    gsap.set(logoInner, { opacity: 0 });
    gsap.set(cover, { opacity: 1 });

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
        gsap.to(cover, { opacity: 0, duration: 0.5, ease: "power2.out" });
      },
    });

    const diag = Math.sqrt(W * W + H * H);
    const maxScale = (diag / iconW) * 30;

    gsap.set(logoInner, {
      scale: 1,
      transformOrigin: "center center",
      svgOrigin: "25 16",
    });

    const onScroll = () => {
      targetRef.current = Math.min(window.scrollY / SCROLL_DISTANCE, 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      progressRef.current += (targetRef.current - progressRef.current) * 0.08;
      const p = progressRef.current;
      const expandP = Math.min(p / EXPAND_END, 1);
      gsap.set(logoInner, {
        scale: 1 + expandP * maxScale,
        svgOrigin: "25 16",
      });
    };
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
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
          <rect
            width="100%"
            height="100%"
            fill="#ffffff"
            mask="url(#logoMask)"
          />
          <g ref={coverRef}>
            <g ref={coverGroupRef}>
              <path ref={coverInnerRef} fill="#000000" />
            </g>
          </g>
        </svg>

        <WorkGrid progressRef={progressRef} startAt={0.45} />

        {/* 흰 배경 전환 + lorem 텍스트 */}
        <IntroText progressRef={progressRef} />
      </div>
    </>
  );
}
