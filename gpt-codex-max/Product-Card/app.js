(() => {
  const card = document.getElementById("card");
  const layers = Array.from(document.querySelectorAll(".parallax.layer"));
  const buttons = Array.from(document.querySelectorAll(".btn"));
  const sizes = Array.from(document.querySelectorAll(".size"));
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];
  const bursts = [];
  const depthMap = [26, 18, 12, 8];

  function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  if (gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.from([".eyebrow", ".headline", ".subhead"], {
    y: 30,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out",
    stagger: 0.08,
  });

  gsap.from(card, {
    y: 80,
    scale: 0.94,
    opacity: 0,
    duration: 1.4,
    ease: "expo.out",
    delay: 0.2,
  });

  gsap.from(".orbit", {
    opacity: 0,
    duration: 1.2,
    ease: "power2.out",
    stagger: 0.12,
  });

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * 18;
    const rotateX = -y * 12;

    gsap.to(card, {
      rotateY,
      rotateX,
      transformPerspective: 1200,
      transformOrigin: "center",
      duration: 0.6,
      ease: "power3.out",
    });

    layers.forEach((layer, idx) => {
      const depth = depthMap[idx] || 8;
      gsap.to(layer, {
        x: x * depth,
        y: y * depth,
        duration: 0.6,
        ease: "power3.out",
      });
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.9,
      ease: "expo.out",
    });
    layers.forEach((layer) => {
      gsap.to(layer, { x: 0, y: 0, duration: 0.9, ease: "expo.out" });
    });
  });

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.2 });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    });

    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      gsap.fromTo(btn, { scale: 0.96 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    });
  });

  sizes.forEach((size) => {
    size.addEventListener("click", () => {
      document.querySelector(".size.active")?.classList.remove("active");
      size.classList.add("active");
      gsap.fromTo(size, { scale: 0.9 }, { scale: 1, duration: 0.25, ease: "power2.out" });
    });
  });

  function spawnParticles() {
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width / dpr,
        y: Math.random() * canvas.height / dpr,
        vx: gsap.utils.random(-0.08, 0.08),
        vy: gsap.utils.random(-0.06, 0.06),
        r: gsap.utils.random(1.1, 2.6),
        hue: gsap.utils.random(180, 310),
        alpha: gsap.utils.random(0.35, 0.85),
      });
    }
  }

  function spawnBurst(x, y) {
    for (let i = 0; i < 34; i++) {
      bursts.push({
        x,
        y,
        angle: Math.random() * Math.PI * 2,
        speed: gsap.utils.random(1.5, 4),
        r: gsap.utils.random(2, 4),
        life: 1,
        hue: gsap.utils.random(180, 320),
      });
    }
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width / dpr) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height / dpr) p.vy *= -1;
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      b.life -= 0.02;
      b.speed *= 0.97;
      if (b.life <= 0) {
        bursts.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `hsla(${b.hue}, 90%, 70%, ${b.life})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(update);
  }

  spawnParticles();
  update();

  if (ScrollTrigger) {
    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          ".visual-stack",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }
        );
      },
    });
  }
})();