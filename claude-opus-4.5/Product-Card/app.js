(() => {
  const cardWrap = document.getElementById("cardWrap");
  const card = document.getElementById("card");
  const cardShine = document.getElementById("cardShine");
  const cardBack = document.getElementById("cardBack");
  const product = document.querySelector(".product");
  const flipBtn = document.getElementById("flipBtn");
  const backBtn = document.getElementById("backBtn");
  const buyBtn = document.getElementById("buyBtn");
  const buttons = document.querySelectorAll(".btn");
  const sizes = document.querySelectorAll(".size");
  const orbs = document.querySelectorAll(".floating-orb");
  const starsCanvas = document.getElementById("stars");
  const ctx = starsCanvas.getContext("2d");
  const isTouch = window.matchMedia("(hover: none)").matches;
  let stars = [];
  let backOpen = false;

  if (gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------------
     Starfield / depth canvas
  --------------------------------------------------------------- */
  const STAR_COUNT = 180;

  const resize = () => {
    starsCanvas.width = window.innerWidth * devicePixelRatio;
    starsCanvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    initStars();
  };

  const initStars = () => {
    stars = new Array(STAR_COUNT).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 1.2 + 0.4,
      r: Math.random() * 1.2 + 0.3,
    }));
  };

  const renderStars = () => {
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    ctx.fillStyle = "#9fd8ff";
    stars.forEach((s) => {
      ctx.globalAlpha = s.z;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const parallaxStars = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 18;
    const y = (e.clientY / innerHeight - 0.5) * 18;
    stars.forEach((s, i) => {
      const depth = (i / STAR_COUNT) * 0.6 + 0.4;
      s.x += x * depth;
      s.y += y * depth;
      if (s.x < 0) s.x += innerWidth;
      if (s.x > innerWidth) s.x -= innerWidth;
      if (s.y < 0) s.y += innerHeight;
      if (s.y > innerHeight) s.y -= innerHeight;
    });
  };

  resize();
  window.addEventListener("resize", resize);
  gsap.ticker.add(renderStars);

  /* ---------------------------------------------------------------
     3-D tilt + shine + parallax
  --------------------------------------------------------------- */
  const maxTilt = 18;

  const tiltHandler = (e) => {
    const bounds = cardWrap.getBoundingClientRect();
    const x = (e.clientX - bounds.left) / bounds.width - 0.5;
    const y = (e.clientY - bounds.top) / bounds.height - 0.5;
    const tiltX = -y * maxTilt;
    const tiltY = x * maxTilt;

    gsap.to(card, { rotateX: tiltX, rotateY: tiltY, duration: 0.6, ease: "expo.out" });
    gsap.to(product, { rotate: -12 + x * 4, y: y * -12, duration: 0.6, ease: "expo.out" });
    gsap.to(cardShine, { opacity: 0.6, duration: 0.2, ease: "power2.out" });

    const posX = x * 100 + 50;
    const posY = y * 100 + 50;
    cardShine.style.background = `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.35), transparent 40%)`;

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 6;
      gsap.to(orb, { x: x * depth * 4, y: y * depth * 4, duration: 0.8, ease: "power2.out" });
    });

    parallaxStars(e);
  };

  const resetTilt = () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "expo.out" });
    gsap.to(product, { rotate: -16, y: 0, duration: 0.9, ease: "expo.out" });
    gsap.to(cardShine, { opacity: 0, duration: 0.4, ease: "power2.out" });
    orbs.forEach((orb) => gsap.to(orb, { x: 0, y: 0, duration: 0.8, ease: "power2.out" }));
  };

  if (!isTouch) {
    cardWrap.addEventListener("mousemove", tiltHandler);
    cardWrap.addEventListener("mouseleave", resetTilt);
  }

  /* ---------------------------------------------------------------
     Sizes selection micro interactions
  --------------------------------------------------------------- */
  sizes.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".size.is-active")?.classList.remove("is-active");
      btn.classList.add("is-active");
      gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    });
  });

  /* ---------------------------------------------------------------
     Button gleam & particle sparkle
  --------------------------------------------------------------- */
  const sparkles = [];
  const sparkleCtx = document.createElement("canvas").getContext("2d");
  const sparkleCanvas = sparkleCtx.canvas;
  document.body.appendChild(sparkleCanvas);
  sparkleCanvas.id = "sparkles";
  Object.assign(sparkleCanvas.style, {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
  });

  const resizeSparkles = () => {
    sparkleCanvas.width = window.innerWidth * devicePixelRatio;
    sparkleCanvas.height = window.innerHeight * devicePixelRatio;
    sparkleCtx.setTransform(1, 0, 0, 1, 0, 0);
    sparkleCtx.scale(devicePixelRatio, devicePixelRatio);
  };
  resizeSparkles();
  window.addEventListener("resize", resizeSparkles);

  buttons.forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty("--x", `${x}%`);
      btn.style.setProperty("--y", `${y}%`);
    });

    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      burst(x, y);
    });
  });

  const burst = (x, y) => {
    const hues = [166, 48, 200];
    for (let i = 0; i < 26; i++) {
      sparkles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        hue: hues[Math.floor(Math.random() * hues.length)],
      });
    }
  };

  const renderSparkles = () => {
    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.02;
      if (s.life <= 0) {
        sparkles.splice(i, 1);
        continue;
      }
      sparkleCtx.globalAlpha = s.life;
      sparkleCtx.fillStyle = `hsl(${s.hue}, 90%, 72%)`;
      sparkleCtx.beginPath();
      sparkleCtx.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
      sparkleCtx.fill();
    }
  };
  gsap.ticker.add(renderSparkles);

  /* ---------------------------------------------------------------
     Flip to technical back
  --------------------------------------------------------------- */
  const openBack = () => {
    if (backOpen) return;
    backOpen = true;
    gsap.to(card, { rotateY: 16, duration: 0.6, ease: "power3.out" });
    gsap.to(cardBack, { rotationY: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    cardBack.classList.add("active");
  };

  const closeBack = () => {
    if (!backOpen) return;
    backOpen = false;
    gsap.to(card, { rotateY: 0, duration: 0.6, ease: "power3.out" });
    gsap.to(cardBack, { rotationY: -90, opacity: 0, duration: 0.6, ease: "power3.in" });
    cardBack.classList.remove("active");
  };

  flipBtn.addEventListener("click", openBack);
  backBtn.addEventListener("click", closeBack);

  /* ---------------------------------------------------------------
     Hero entrance choreography
  --------------------------------------------------------------- */
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".hud", { y: -30, opacity: 0, duration: 0.8 })
    .from(card, { y: 80, opacity: 0, duration: 1.1 }, "-=0.4")
    .from(".side-info", { y: 60, opacity: 0, duration: 0.9 }, "-=0.6")
    .from(product, { y: 40, rotate: -26, opacity: 0, duration: 1 }, "-=0.7")
    .from([".floating-tag", ".halo"], { opacity: 0, scale: 0.9, duration: 0.8, stagger: 0.1 }, "-=0.8");

  if (ScrollTrigger) {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top 90%",
      onEnter: () => gsap.to(".hero", { opacity: 1, y: 0, duration: 1, ease: "power4.out" }),
      once: true,
    });
  }

  /* ---------------------------------------------------------------
     Buy CTA micro bounce
  --------------------------------------------------------------- */
  buyBtn.addEventListener("click", () => {
    gsap.fromTo(buyBtn, { scale: 0.96 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
  });
})();