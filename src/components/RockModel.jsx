import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default function RockModel({ scene }) {
  useEffect(() => {
    if (!scene) return;

    let rock = null;
    let raf;
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();

    // Draco 압축 모델 디코딩 설정
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
          rock.rotation.y = t * 0.3;
          rock.rotation.x = Math.sin(t * 0.4) * 0.15;
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
  }, [scene]);

  return null;
}
