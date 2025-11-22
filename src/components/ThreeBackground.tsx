import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  variant?: "particles" | "code";
}

export function ThreeBackground({ variant = "particles" }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    let particles: THREE.Points;
    let geometry: THREE.BufferGeometry;
    let material: THREE.PointsMaterial;

    if (variant === "particles") {
      // Particle system
      geometry = new THREE.BufferGeometry();
      const particlesCount = 1000;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

      material = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.6,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    } else {
      // Code matrix style
      geometry = new THREE.BufferGeometry();
      const particlesCount = 500;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

      material = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.4,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.0005;

      // Smooth mouse interaction
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 opacity-30"
      style={{ pointerEvents: "none" }}
    />
  );
}
