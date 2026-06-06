import { useEffect, useRef } from "react";
import gsap from "gsap";

const ICON_PATH =
  "M27.779 20.7782C23.4957 18.3885 22.3502 22.6515 22.4556 25.9745C22.4685 26.3806 22.5198 26.7834 22.5827 27.1848C23.1639 30.9045 15.5834 31.1424 15.6935 27.6261C15.7847 24.3573 19.4551 21.0026 20.487 18.6061C20.5641 18.427 20.6418 18.248 20.7249 18.0709C21.9123 15.5582 23.3099 11.6568 19.3983 12.4245C17.7331 12.6692 17.675 15.2994 17.9176 16.3922C18.2183 17.8215 17.3871 19.017 15.9571 18.9873C13.312 19.2313 9.68693 14.5053 11.8948 12.7185C12.1604 12.5036 12.4814 12.3678 12.8173 12.3076C14.8501 11.944 16.639 11.0006 18.1886 9.48679C18.8009 8.84274 20.287 8.61905 21.225 8.96844C22.7199 9.54626 23.7532 9.49692 24.3168 8.80963C25.1656 7.75807 27.9148 7.85133 28.5548 9.02926C29.086 9.80982 29.2232 10.6417 29.0225 11.5183C28.719 12.9098 27.3661 13.4038 26.52 14.3175C24.5777 16.2955 27.7114 18.0297 29.2793 18.1006C29.4293 18.1074 29.5793 18.1148 29.728 18.1364C34.0593 18.7616 30.8607 22.5616 27.779 20.7782ZM30.666 15.4305C27.8222 14.11 29.0637 11.3378 31.9426 12.5806C34.9412 14.0424 33.3287 16.6517 30.666 15.4305ZM35.2744 8.09462C33.5578 8.41158 31.1364 10.1781 29.6685 8.78935C28.6623 7.79659 28.8826 5.51236 30.6377 4.23779C32.4488 3.01052 35.4818 3.0808 37.1801 4.42769C38.867 5.99556 37.7201 7.531 35.275 8.09462Z";
export default function MaskScene() {
  const dotRef = useRef(null);
  const groupRef = useRef(null); // 위치/크기 담당
  const innerRef = useRef(null); // GSAP scale 애니메이션 담당

  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // ★ 여기 숫자만 바꾸면 크기 조절됨
    const iconW = W * 0.75;
    const iconH = iconW * (32 / 50);
    const fullScale = iconW / 50;

    const tx = (W - iconW) / 2;
    const ty = (H - iconH) / 2;

    // 바깥 <g>: 위치 + 풀사이즈 스케일 고정
    groupRef.current.setAttribute(
      "transform",
      `translate(${tx}, ${ty}) scale(${fullScale})`,
    );

    const dot = dotRef.current;
    const inner = innerRef.current;

    // 안쪽 <g>: 아이콘 로컬 좌표(50x32)의 중심을 기준으로 scale
    gsap.set(inner, {
      opacity: 0,
      scale: 0.1,
      transformOrigin: "center center",
      svgOrigin: "25 16", // viewBox 50x32의 중심
    });
    gsap.set(dot, { scale: 1, opacity: 1 });

    const tl = gsap.timeline({ delay: 1.0 });
    tl.to(dot, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.in" })
      .to(inner, { opacity: 1, duration: 0.01 }, "<")
      .to(inner, { scale: 1, duration: 0.5, ease: "back.out(1.4)" }, "<");
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <g ref={groupRef}>
          <g ref={innerRef}>
            <path d={ICON_PATH} fill="#000000" />
          </g>
        </g>
      </svg>
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
