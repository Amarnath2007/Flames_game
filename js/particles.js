/**
 * FLAMES — Particle Background System
 * Optimized for performance and responsiveness
 */

(function() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: opaque canvas
  let width, height, particles = [];
  
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    // Optionally draw a static background if needed
    return;
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Adjust particle count on resize
    initParticles();
  }

  function createParticle(isInitial) {
    return {
      x: Math.random() * width,
      y: isInitial ? Math.random() * height : height + 10,
      vx: (Math.random() - 0.5) * 0.55,
      vy: -(0.45 + Math.random() * 1.35),
      life: 0,
      maxLife: 90 + Math.random() * 110,
      radius: 1.5 + Math.random() * 3,
      isSpark: Math.random() < 0.45
    };
  }

  function initParticles() {
    const particleDensity = width < 768 ? 15000 : 8000;
    const count = Math.min(150, Math.floor((width * height) / particleDensity));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(true));
    }
  }

  function update() {
    // Clear with slightly opaque fill for trail effect (optional, here we clear fully)
    ctx.fillStyle = '#0a0508';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      p.x += p.vx + Math.sin(p.life * 0.08) * 0.35;
      p.y += p.vy;
      p.vy -= 0.006;
      p.life++;

      if (p.life > p.maxLife || p.y < -20) {
        Object.assign(p, createParticle(false));
        p.life = 0;
      }

      const lifeRatio = p.life / p.maxLife;
      const alpha = lifeRatio < 0.15 ? lifeRatio / 0.15 : lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;

      ctx.beginPath();
      if (p.isSpark) {
        ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 80, ${alpha * 0.5})`;
      } else {
        ctx.arc(p.x, p.y, p.radius * (1 - lifeRatio * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.floor(80 + (1 - lifeRatio) * 110)}, 0, ${alpha * 0.65})`;
      }
      ctx.fill();
    }
    
    requestAnimationFrame(update);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  update();
})();
