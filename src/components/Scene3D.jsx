import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Scene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 3;

    // 조명
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(3, 5, 3);
    scene.add(dir);
    const p1 = new THREE.PointLight(0x6644ff, 5, 12);
    p1.position.set(-2, 2, 2);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xff4488, 4, 10);
    p2.position.set(2, -2, 1);
    scene.add(p2);

    // 토러스 + 구체들
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.25, 24, 90),
      new THREE.MeshStandardMaterial({
        color: 0x8800ff,
        roughness: 0.1,
        metalness: 0.9,
      }),
    );
    scene.add(torus);

    const spheres = [];
    [0x3355ff, 0xff3366, 0x00ffaa, 0xffaa00].forEach((c, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 32, 32),
        new THREE.MeshStandardMaterial({
          color: c,
          roughness: 0.15,
          metalness: 0.85,
        }),
      );
      m.position.set(
        (i % 2 ? 1 : -1) * (0.9 + Math.random() * 0.4),
        Math.random() - 0.5,
        (Math.random() - 0.5) * 0.6,
      );
      scene.add(m);
      spheres.push({ m, off: i * 1.5 });
    });

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
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      torus.rotation.x = t * 0.4;
      torus.rotation.y = t * 0.5;
      spheres.forEach(({ m, off }) => {
        m.position.y = Math.sin(t * 0.8 + off) * 0.4;
        m.rotation.y = t;
      });
      renderer.render(scene, camera);
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
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

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
    />
  );
}
