"use client";

import { useEffect, useRef } from "react";

export default function FloatingSymbols() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let animationFrameId: number; // Store animation frame ID

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // ✅ Ensure canvas exists before proceeding

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // ✅ Ensure context exists

    // Resize canvas dynamically
    const resizeCanvas = () => {
      if (!canvas) return; // ✅ Check again in case of null
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Cryptocurrency symbols
    const symbols = ["₿", "Ξ", "₮", "Ł", "◎", "Ð", "₳", "⚡"];
    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      symbol: string;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width; // ✅ Use non-null assertion (!)
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 20 + 10;
        this.speed = Math.random() * 0.5 + 0.1;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas!.height) {
          this.y = 0 - this.size;
          this.x = Math.random() * canvas!.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillText(this.symbol, this.x, this.y);
      }
    }

    // Initialize particles
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height); // ✅ Use non-null assertion (!)

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function to prevent memory leaks
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />;
}
