"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground({ variant = "particles" }) {
  const containerRef = useRef(null);

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
    let particles;
    let geometry;
    let material;
    if (variant === "particles") {
      // Intense particle network system
      geometry = new THREE.BufferGeometry();
      const particlesCount = 3000;
      const posArray = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      material = new THREE.PointsMaterial({
        size: 0.03,
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.8,
      });
      particles = new THREE.Points(geometry, material);
      scene.add(particles);
      const lineGeometry = new THREE.BufferGeometry();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.2,
      });
      const linePositions = [];
      for (let i = 0; i < particlesCount * 3; i += 30) {
        linePositions.push(
          posArray[i],
          posArray[i + 1],
          posArray[i + 2],
          posArray[i + 3] || posArray[0],
          posArray[i + 4] || posArray[1],
          posArray[i + 5] || posArray[2]
        );
      }
      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);
    } else {
      geometry = new THREE.BufferGeometry();
      const particlesCount = 2000;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 25;
        posArray[i + 1] = (Math.random() - 0.5) * 25;
        posArray[i + 2] = (Math.random() - 0.5) * 25;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      material = new THREE.PointsMaterial({
        size: 0.06,
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7,
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
    window.addEventListener("mousemove", handleMouseMove);
    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;
      camera.position.x += (mouseX * 1 - camera.position.x) * 0.08;
      camera.position.y += (mouseY * 1 - camera.position.y) * 0.08;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
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
