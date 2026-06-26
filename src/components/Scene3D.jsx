import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RockModel from "./RockModel";

const PANELS = [
  {
    src: "/1.avif",
    type: "image",
    pos: [-2.6, 0.2, -0.5],
    scale: [1.8, 1.0, 1],
  },
  {
    src: "/2.avif",
    type: "image",
    pos: [-0.3, 0.9, 0.2],
    scale: [1.4, 1.8, 1],
  },
  {
    src: "/3.mp4",
    type: "video",
    pos: [2.4, -0.3, -0.3],
    scale: [1.9, 1.1, 1],
  },
  { src: "/4.mp4", type: "video", pos: [0.6, -1.4, 0.4], scale: [1.6, 0.9, 1] },
  {
    src: "/5.mp4",
    type: "video",
    pos: [-1.8, -1.2, 0.6],
    scale: [1.3, 0.8, 1],
  },
];

const FADE_START = 0.2;
const FADE_END = 0.35;
const REFADE_START = 0.92;
const REFADE_END = 1.0;

export default function Scene3D({ progressRef }) {
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    const W = window.innerWidth,
      H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const sc = new THREE.Scene();
    sc.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 4;

    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    sc.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(3, 5, 4);
    sc.add(dir);
    const orange = new THREE.PointLight(0xff7722, 7, 16);
    orange.position.set(0, -0.5, 1.5);
    sc.add(orange);
    const fill = new THREE.PointLight(0x4466ff, 3, 12);
    fill.position.set(-3, 2, 3);
    sc.add(fill);

    const baseIntensity = { amb: 0.7, dir: 2, orange: 7, fill: 3 };

    const videos = [],
      panelMeshes = [];
    const texLoader = new THREE.TextureLoader();
    PANELS.forEach((panel) => {
      let tex;
      if (panel.type === "video") {
        const v = document.createElement("video");
        v.src = panel.src;
        v.loop = true;
        v.muted = true;
        v.playsInline = true;
        v.play().catch(() => {});
        videos.push(v);
        tex = new THREE.VideoTexture(v);
        tex.colorSpace = THREE.SRGBColorSpace;
      } else {
        tex = texLoader.load(panel.src);
        tex.colorSpace = THREE.SRGBColorSpace;
      }
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: tex }),
      );
      m.position.set(...panel.pos);
      m.scale.set(...panel.scale);
      sc.add(m);
      panelMeshes.push({ mesh: m, mat: m.material });
    });

    setScene(sc);

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const p = progressRef ? progressRef.current : 0;

      // 1차 페이드아웃 (0.20~0.35 검정으로)
      let fade =
        1 -
        Math.min(Math.max((p - FADE_START) / (FADE_END - FADE_START), 0), 1);

      // 2차 재등장 (0.92~1.00 다시 밝아짐)
      const refade = Math.min(
        Math.max((p - REFADE_START) / (REFADE_END - REFADE_START), 0),
        1,
      );
      const isRefading = p >= REFADE_START;
      fade = Math.max(fade, refade);

      amb.intensity = baseIntensity.amb * fade;
      dir.intensity = baseIntensity.dir * fade;
      orange.intensity = baseIntensity.orange * fade;
      fill.intensity = baseIntensity.fill * fade;

      // 패널: 재등장 구간에선 숨김 (돌만 보이게)
      panelMeshes.forEach(({ mat }) => {
        mat.opacity = isRefading ? 0 : fade;
        mat.transparent = true;
      });

      // 배경: 재등장 구간엔 완전 검정
      if (isRefading) {
        sc.background.setRGB(0, 0, 0);
      } else {
        const bg = 0.04 * fade;
        sc.background.setRGB(bg * 0.6, bg * 0.6, bg * 0.9);
      }

      // 카메라 고정
      camera.lookAt(0, 0, 0);
      renderer.render(sc, camera);
    };
    animate();

    const onResize = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      videos.forEach((v) => {
        v.pause();
        v.src = "";
      });
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
      renderer.dispose();
      setScene(null);
    };
  }, [progressRef]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {scene && <RockModel scene={scene} progressRef={progressRef} />}
    </div>
  );
}
