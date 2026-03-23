"use client";

import { useEffect, useRef } from "react";
import { ShootingStar } from "./shootingStar";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

function createStars(count: number, w: number, h: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    radius: 0.3 + Math.random() * 1.7,
    opacity: 0.3 + Math.random() * 0.7,
    twinkleSpeed: 0.5 + Math.random() * 1.5,
    twinkleOffset: Math.random() * Math.PI * 2,
  }));
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nextShootRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 80 : 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = createStars(starCount, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const scheduleNextShoot = () => {
      nextShootRef.current = timeRef.current + 480 + Math.random() * 720; // 8-20s at 60fps
    };
    scheduleNextShoot();

    const draw = () => {
      if (!canvas || !ctx) return;
      timeRef.current++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (const star of starsRef.current) {
        const twinkle =
          star.opacity *
          (0.6 +
            0.4 *
              Math.sin(timeRef.current * star.twinkleSpeed * 0.05 + star.twinkleOffset));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${twinkle})`;
        ctx.fill();
      }

      // Shooting stars
      if (timeRef.current >= nextShootRef.current) {
        shootingStarsRef.current.push(
          new ShootingStar(canvas.width, canvas.height)
        );
        scheduleNextShoot();
      }

      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        s.update();
        s.draw(ctx);
        return !s.isDead();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  );
}
