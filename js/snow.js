// Tuyết rơi thưa, chậm, không nhấp nháy.
export function startSnow(canvas) {
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1, flakes = [];

  function makeFlake(randomY = true) {
    const depth = Math.random();            // 0 = xa, 1 = gần
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -10,
      r: 0.8 + depth * 2.6,
      vy: (0.18 + depth * 0.55) * (reduce ? 0.4 : 1),
      sway: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      a: 0.25 + depth * 0.5,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round((w * h) / 26000);   // thưa
    while (flakes.length < target) flakes.push(makeFlake());
    flakes.length = Math.min(flakes.length, target);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last) / 16.7;
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.phase += 0.008 * dt;
      f.y += f.vy * dt;
      f.x += Math.sin(f.phase) * 0.18 * f.sway * dt;
      if (f.y > h + 10) Object.assign(f, makeFlake(false));
      if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 250, 240, ${f.a})`;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
}
