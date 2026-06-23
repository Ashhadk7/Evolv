"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function CTAGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || typeof window === "undefined") return;

    // ── Renderer ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Scene / Camera ───────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      46,
      el.clientWidth / el.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5.8);

    // ── Fibonacci sphere ─────────────────────────────────────────
    const N   = 220;
    const R   = 2.0;
    const pos = new Float32Array(N * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
      const y  = 1 - (i / (N - 1)) * 2;
      const r  = Math.sqrt(Math.max(0, 1 - y * y)) * R;
      const th = goldenAngle * i;
      const jitter = 0.93 + Math.random() * 0.14;
      pos[i * 3]     = r * Math.cos(th) * jitter;
      pos[i * 3 + 1] = y * R * jitter;
      pos[i * 3 + 2] = r * Math.sin(th) * jitter;
    }

    // ── Regular points ───────────────────────────────────────────
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(pos.slice(), 3));

    const ptMat = new THREE.PointsMaterial({
      color: 0x1a312c,
      size: 0.038,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(ptGeo, ptMat);

    // ── Highlighted "hero" nodes ─────────────────────────────────
    const heroIdx = [3, 17, 42, 68, 95, 130, 160, 190, 210];
    const heroPos = new Float32Array(heroIdx.length * 3);
    heroIdx.forEach((idx, k) => {
      heroPos[k * 3]     = pos[idx * 3];
      heroPos[k * 3 + 1] = pos[idx * 3 + 1];
      heroPos[k * 3 + 2] = pos[idx * 3 + 2];
    });
    const heroGeo = new THREE.BufferGeometry();
    heroGeo.setAttribute("position", new THREE.BufferAttribute(heroPos, 3));
    const heroMat = new THREE.PointsMaterial({
      color: 0x89d7b7,
      size: 0.075,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const heroPoints = new THREE.Points(heroGeo, heroMat);

    // ── Connection lines ─────────────────────────────────────────
    const THR = R * 0.72;
    const lineVerts: number[] = [];

    for (let i = 0; i < N; i++) {
      let nb = 0;
      for (let j = i + 1; j < N && nb < 3; j++) {
        const dx = pos[i*3]   - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dz = pos[i*3+2] - pos[j*3+2];
        if (Math.sqrt(dx*dx + dy*dy + dz*dz) < THR) {
          lineVerts.push(
            pos[i*3], pos[i*3+1], pos[i*3+2],
            pos[j*3], pos[j*3+1], pos[j*3+2]
          );
          nb++;
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x428475,
      transparent: true,
      opacity: 0.2,
    });
    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);

    // ── Soft inner glow sphere ───────────────────────────────────
    const glowGeo = new THREE.SphereGeometry(R * 0.5, 12, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x89d7b7,
      transparent: true,
      opacity: 0.025,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);

    // ── Group ────────────────────────────────────────────────────
    const group = new THREE.Group();
    group.add(glow, linesMesh, points, heroPoints);
    scene.add(group);

    // ── Mouse parallax ───────────────────────────────────────────
    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      mx =  (e.clientX / window.innerWidth  - 0.5) * 0.9;
      my = -(e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    // ── Animation loop ───────────────────────────────────────────
    let raf: number;
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      group.rotation.y = t * 0.065 + mx * 0.3;
      group.rotation.x = Math.sin(t * 0.04) * 0.1 + my * 0.2;

      // Breathe
      const s = 1 + Math.sin(t * 0.45) * 0.012;
      group.scale.setScalar(s);

      // Hero nodes pulse opacity
      heroMat.opacity = 0.6 + Math.sin(t * 1.2) * 0.3;

      renderer.render(scene, camera);
    };
    tick();

    // ── Resize ───────────────────────────────────────────────────
    const resize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      ro.disconnect();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
      [ptGeo, ptMat, heroGeo, heroMat, lineGeo, lineMat, glowGeo, glowMat].forEach(
        (o) => o.dispose()
      );
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="h-full w-full" />;
}
