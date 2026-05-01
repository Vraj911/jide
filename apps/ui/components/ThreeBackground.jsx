"use client";

import { useEffect, useRef } from "react";

export function ThreeBackground({ variant = "particles" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let rafId = null;
    let initTimeoutId = null;
    let cancelled = false;
    let cleanup = null;

    const start = async () => {
      const THREE = await import("three");
      if (cancelled || !containerRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      camera.position.z = 5;

      let particles;
      let geometry;
      let material;
      let lines = null;
      let lineGeometry = null;
      let lineMaterial = null;

      if (variant === "particles") {
        geometry = new THREE.BufferGeometry();
        const particlesCount = 1200;
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 20;
        }
        geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
        material = new THREE.PointsMaterial({
          size: 0.03,
          color: 0x00d9ff,
          transparent: true,
          opacity: 0.7,
        });
        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        lineGeometry = new THREE.BufferGeometry();
        lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00d9ff,
          transparent: true,
          opacity: 0.15,
        });
        const linePositions = [];
        for (let i = 0; i < particlesCount * 3; i += 36) {
          linePositions.push(
            posArray[i],
            posArray[i + 1],
            posArray[i + 2],
            posArray[i + 3] || posArray[0],
            posArray[i + 4] || posArray[1],
            posArray[i + 5] || posArray[2]
          );
        }
        lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
        lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);
      } else {
        geometry = new THREE.BufferGeometry();
        const particlesCount = 900;
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i += 3) {
          posArray[i] = (Math.random() - 0.5) * 25;
          posArray[i + 1] = (Math.random() - 0.5) * 25;
          posArray[i + 2] = (Math.random() - 0.5) * 25;
        }
        geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
        material = new THREE.PointsMaterial({
          size: 0.05,
          color: 0x00ff00,
          transparent: true,
          opacity: 0.65,
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
      const handleMouseMove = (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        particles.rotation.x += 0.0008;
        particles.rotation.y += 0.0016;
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        if (rafId) cancelAnimationFrame(rafId);
        if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        if (lines) scene.remove(lines);
        geometry.dispose();
        material.dispose();
        lineGeometry?.dispose();
        lineMaterial?.dispose();
        renderer.dispose();
      };
    };

    const startDelayMs = 180;
    initTimeoutId = window.setTimeout(start, startDelayMs);

    return () => {
      cancelled = true;
      if (initTimeoutId) clearTimeout(initTimeoutId);
      cleanup?.();
    };
  }, [variant]);
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 opacity-60"
      style={{ pointerEvents: "none" }}
    />
  );
}
