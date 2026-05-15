"use client";

import { useEffect, useRef } from "react";

export default function FireCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let width: number;
    let height: number;
    let particles: Particle[] = [];
    let animationFrameId: number;

    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      life: number = 0;
      maxLife: number = 0;
      radius: number = 0;
      isSpark: boolean = false;

      constructor(init: boolean) {
        this.reset(init);
      }

      reset(init: boolean) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.vx = (Math.random() - 0.5) * 0.55;
        this.vy = -(0.45 + Math.random() * 1.35);
        this.life = 0;
        this.maxLife = 90 + Math.random() * 110;
        this.radius = 1.5 + Math.random() * 3;
        this.isSpark = Math.random() < 0.45;
      }

      update() {
        this.x += this.vx + Math.sin(this.life * 0.08) * 0.35;
        this.y += this.vy;
        this.vy -= 0.006;
        this.life++;

        if (this.life > this.maxLife || this.y < -20) {
          this.reset(false);
        }
      }

      draw() {
        const t = this.life / this.maxLife;
        const alpha = t < 0.15 ? t / 0.15 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;

        ctx!.beginPath();
        if (this.isSpark) {
          ctx!.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 200, 80, ${alpha * 0.5})`;
        } else {
          ctx!.arc(this.x, this.y, this.radius * (1 - t * 0.35), 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, ${Math.floor(80 + (1 - t) * 110)}, 0, ${alpha * 0.65})`;
        }
        ctx!.fill();
      }
    }

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Reduce particle count on smaller screens for performance
      const particleCount = Math.min(160, Math.floor((width * height) / 8000));
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(true));
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="canvas" />;
}
