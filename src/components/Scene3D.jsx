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

const FADE_START = 0.35;
const FADE_END = 0.55;

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
    sc.background = new THREE.Color(0x0a0a0f);
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

    const mouse = { x: 0, y: 0 };
    const onMove = (e) => {
      mouse.x = (e.clientX / W - 0.5) * 2;
      mouse.y = -(e.clientY / H - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const p = progressRef ? progressRef.current : 0;

      // 조명 페이드: FADE_START~FADE_END 구간에서 1 → 0
      const fade =
        1 -
        Math.min(Math.max((p - FADE_START) / (FADE_END - FADE_START), 0), 1);
      amb.intensity = baseIntensity.amb * fade;
      dir.intensity = baseIntensity.dir * fade;
      orange.intensity = baseIntensity.orange * fade;
      fill.intensity = baseIntensity.fill * fade;

      // 패널도 같이 어두워짐
      panelMeshes.forEach(({ mat }) => {
        mat.opacity = fade;
        mat.transparent = true;
      });

      // 배경: fade 0이면 완전 검정
      const bg = 0.04 * fade;
      sc.background.setRGB(bg * 0.6, bg * 0.6, bg * 0.9);

      camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.25 - camera.position.y) * 0.05;
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
      window.removeEventListener("mousemove", onMove);
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
