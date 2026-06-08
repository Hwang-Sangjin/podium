import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default function RockModel({ scene, progressRef }) {
  useEffect(() => {
    if (!scene) return;

    let rock = null;
    let raf;
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    loader.setDRACOLoader(draco);

    loader.load(
      "/rockPodium-lite.glb",
      (gltf) => {
        rock = gltf.scene;

        const box = new THREE.Box3().setFromObject(rock);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 1.8 / maxDim;
        rock.scale.setScalar(s);
        const center = box.getCenter(new THREE.Vector3());
        rock.position.sub(center.multiplyScalar(s));
        rock.position.z = 1.0;

        scene.add(rock);

        const animate = () => {
          raf = requestAnimationFrame(animate);
          const t = clock.getElapsedTime();
          // progressRef는 이미 MaskScene에서 lerp된 부드러운 값
          const p = progressRef ? progressRef.current : 0;

          // 스크롤 기반 x축 회전만 (세로축 자동회전 제거됨)
          rock.rotation.x = p * Math.PI * 2; // 스크롤 0~1 → x축 0~360°
          rock.position.y = Math.sin(t * 0.6) * 0.15;
        };
        animate();
      },
      undefined,
      (err) => console.error("GLB load error:", err),
    );

    return () => {
      if (raf) cancelAnimationFrame(raf);
      draco.dispose();
      if (rock) {
        scene.remove(rock);
        rock.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (Array.isArray(o.material))
              o.material.forEach((m) => m.dispose());
            else o.material.dispose();
          }
        });
      }
    };
  }, [scene, progressRef]);

  return null;
}
