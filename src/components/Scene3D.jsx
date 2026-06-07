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

export default function Scene3D({ progressRef }) {
  const mountRef = useRef(null);
  const [scene, setScene] = useState(null); // RockModel에 넘길 scene

  useEffect(() => {
    const mount = mountRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const sc = new THREE.Scene();
    sc.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    const baseZ = 4;
    camera.position.z = baseZ;

    // ── 조명 ──
    sc.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(3, 5, 4);
    sc.add(dir);
    const orange = new THREE.PointLight(0xff7722, 7, 16);
    orange.position.set(0, -0.5, 1.5);
    sc.add(orange);
    const fill = new THREE.PointLight(0x4466ff, 3, 12);
    fill.position.set(-3, 2, 3);
    sc.add(fill);

    // ── 패널들 ──
    const videos = [];
    const panelMeshes = [];
    const texLoader = new THREE.TextureLoader();

    PANELS.forEach((panel) => {
      let tex;
      if (panel.type === "video") {
        const video = document.createElement("video");
        video.src = panel.src;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play().catch(() => {});
        videos.push(video);
        tex = new THREE.VideoTexture(video);
        tex.colorSpace = THREE.SRGBColorSpace;
      } else {
        tex = texLoader.load(panel.src);
        tex.colorSpace = THREE.SRGBColorSpace;
      }
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: tex }),
      );
      mesh.position.set(...panel.pos);
      mesh.scale.set(...panel.scale);
      sc.add(mesh);
      panelMeshes.push(mesh);
    });

    // scene을 RockModel에 넘기기 위해 state로 노출
    setScene(sc);

    // ── 마우스 ──
    const mouse = { x: 0, y: 0 };
    const onMove = (e) => {
      mouse.x = (e.clientX / W - 0.5) * 2;
      mouse.y = -(e.clientY / H - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    // ── 루프 (렌더링 + 패널/카메라) ──
    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.25 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      panelMeshes.forEach((m, i) => {
        m.position.y += Math.sin(t * 0.5 + i) * 0.0008;
      });

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
      {/* scene이 준비되면 돌 모델 추가 */}
      {scene && <RockModel scene={scene} />}
    </div>
  );
}
