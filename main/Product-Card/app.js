/* =================================================================
   NEXT-GEN PRODUCT CARD INTERACTIVITY
   =================================================================
   Author: AI-Refactor
   Description: Adds GSAP-powered animations, 3-D hover, flip effect,
   responsive overlay handling, and utility helpers for the product card.
   ================================================================= */

(() => {
  // Element refs ---------------------------------------------------
  const scene = document.getElementById("scene");
  const card = document.getElementById("productCard");
  const overlay = document.getElementById("overlay");
  const backBtn = document.querySelector(".back-btn");
  const maxRotate = 25; // deg – max tilt for 3-D hover

  // Futuristic extras -------------------------------------------------
  const dynamicLight = document.getElementById("dynamicLight");
  const particleCanvas = document.getElementById("particleCanvas");
  const ctx = particleCanvas.getContext("2d");
  const particles = [];

  // Resize canvas to full screen
  function resizeCanvas() {
    particleCanvas.width = window.innerWidth * devicePixelRatio;
    particleCanvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any prior scaling
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Register GSAP plugins
  if (gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Feature detection: Disable hover tilt on touch-only devices
  const isTouchDevice = window.matchMedia("(hover: none)").matches;

  /* ---------------------------------------------------------------
     INITIAL ENTRANCE ANIMATIONS
  --------------------------------------------------------------- */
  gsap.from(card, {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
  });

  gsap.from(".product-img", {
    y: 40,
    opacity: 0,
    rotate: -40,
    duration: 1,
    delay: 1,
    ease: "power4.out",
  });

  /* ---------------------------------------------------------------
     3-D HOVER (Desktop only)
  --------------------------------------------------------------- */
  if (!isTouchDevice) {
    scene.addEventListener("mousemove", handleHover);
    scene.addEventListener("mouseleave", resetHover);
    scene.addEventListener("mousemove", moveDynamicLight);
  }

  function handleHover(e) {
    const bounds = scene.getBoundingClientRect();
    // Normalised cursor pos (-0.5 … +0.5)
    const xFactor = (e.clientX - bounds.left) / bounds.width - 0.5;
    const yFactor = (e.clientY - bounds.top) / bounds.height - 0.5;

    const rotateY = xFactor * maxRotate;
    const rotateX = -yFactor * maxRotate;

    gsap.to(card, {
      duration: 0.6,
      rotateY,
      rotateX,
      ease: "power3.out",
    });
  }

  function resetHover() {
    gsap.to(card, {
      duration: 0.8,
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
    });
  }

  /* ---------------------------------------------------------------
     CARD FLIP + OVERLAY (for small screens)
  --------------------------------------------------------------- */
  function toggleFlip() {
    card.classList.toggle("is-flipped");
    overlay.classList.toggle("active", card.classList.contains("is-flipped"));
  }

  // Flip when clicking the card body (but NOT the interactive items)
  card.addEventListener("click", (e) => {
    if (
      e.target.closest(".btn") ||
      e.target.classList.contains("size") ||
      e.target === backBtn
    ) {
      // Ignore – handled separately
      return;
    }
    toggleFlip();
  });

  backBtn.addEventListener("click", toggleFlip);
  overlay.addEventListener("click", toggleFlip);

  /* ---------------------------------------------------------------
     SIZE PICKER LOGIC
  --------------------------------------------------------------- */
  document.querySelectorAll(".size").forEach((size) => {
    size.addEventListener("click", () => {
      document.querySelector(".size.active")?.classList.remove("active");
      size.classList.add("active");

      // Optional: subtle feedback animation
      gsap.fromTo(
        size,
        { scale: 0.9 },
        { scale: 1, duration: 0.25, ease: "power2.out" }
      );
    });
  });

  /* ---------------------------------------------------------------
     PARTICLE BURSTS
  --------------------------------------------------------------- */
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      createParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  });

  function createParticleBurst(x, y) {
    const colors = ["#84edff", "#00c6e9", "#ffffff"];
    for (let i = 0; i < 28; i++) {
      particles.push({
        x,
        y,
        radius: gsap.utils.random(2, 5),
        alpha: 1,
        angle: gsap.utils.random(0, Math.PI * 2),
        speed: gsap.utils.random(1, 5),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  gsap.ticker.add(renderParticles);

  function renderParticles() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = hexToRgba(p.color, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function hexToRgba(hex, alpha = 1) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ---------------------------------------------------------------
     SCROLL-BASED CARD ENTRANCE (cinematic feel)
  --------------------------------------------------------------- */
  if (ScrollTrigger) {
    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          card,
          { y: 80, scale: 0.8, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1.4, ease: "expo.out" }
        );
      },
    });
  }

  /* Move glowing dynamic light */
  function moveDynamicLight(e) {
    const bounds = scene.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    gsap.to(dynamicLight, { x, y, duration: 0.4, ease: "power3.out" });
  }
})();