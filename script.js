document.addEventListener("DOMContentLoaded", function () {

  // ═══════════════════════════════════════════
  // PROJECT DATA
  // ═══════════════════════════════════════════
  const projectData = [
    {
      title: "Sample Project 01",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/careerlinker.jpg"
    },
    {
      title: "Sample Project 02",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/edupredict.jpg"
    },
    {
      title: "Sample Project 03",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/visvis-travel.jpg"
    },
    {
      title: "Sample Project 04",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/safechain.jpg"
    },
    {
      title: "Sample Project 05",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/safechain-app.jpg"
    },
    {
      title: "Sample Project 06",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/loantrack-logo.jpg"
    },
    {
      title: "Sample Project 07",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/ams.jpg"
    },
    {
      title: "Sample Project 08",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/po-monitoring.jpg"
    },
    {
      title: "Sample Project 09",
      description: "Replace this sample with a concise description of your project, the challenge, and the result.",
      demo: null,
      github: null,
      screenshot: "images/wssci.jpg"
    },
  ];

  // ═══════════════════════════════════════════
  // CANVAS CURVED CAROUSEL
  // ═══════════════════════════════════════════

  // Image sources mapped 1-to-1 with projectData indices (Abstract premium visuals)
  const CAROUSEL_ITEMS = [
    { title: "Sample Project 01", src: "images/careerlinker.jpg", idx: 0 },
    { title: "Sample Project 02", src: "images/edupredict.jpg", idx: 1 },
    { title: "Sample Project 03", src: "images/visvis-travel.jpg", idx: 2 },
    { title: "Sample Project 04", src: "images/safechain.jpg", idx: 3 },
    { title: "Sample Project 05", src: "images/safechain-app.jpg", idx: 4 },
    { title: "Sample Project 06", src: "images/loantrack-logo.jpg", idx: 5 },
    { title: "Sample Project 07", src: "images/ams.jpg", idx: 6 },
    { title: "Sample Project 08", src: "images/po-monitoring.jpg", idx: 7 },
    { title: "Sample Project 09", src: "images/wssci.jpg", idx: 8 },
  ];

  const BASE = CAROUSEL_ITEMS.length;
  const ALL = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS];

  const canvas = document.getElementById("projectsCanvas");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("cardOverlay");
  const zoomedCardEl = document.getElementById("zoomedCard");
  const closeBtnEl = document.getElementById("closeBtn");
  const fullscreenBtnEl = document.getElementById("fullscreenBtn");
  const lightboxEl = document.getElementById("imageLightbox");
  const lightboxImageEl = document.getElementById("lightboxImage");
  const lightboxCloseBtnEl = document.getElementById("lightboxCloseBtn");

  // Pre-load images
  const imgCache = new Array(BASE).fill(null);
  CAROUSEL_ITEMS.forEach((item, i) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = im.onerror = () => { imgCache[i] = im; };
    im.src = item.src;
  });

  let W, H, dpr;
  let COLS = 7;
  let GAP = 20;
  const SPEED = 0.7;
  const RADIUS = 18;

  function updateResponsiveVars() {
    const vw = window.innerWidth;
    if (vw <= 480) {
      COLS = 3;
      GAP = 10;
    } else if (vw <= 768) {
      COLS = 4;
      GAP = 14;
    } else if (vw <= 1024) {
      COLS = 5;
      GAP = 16;
    } else {
      COLS = 7;
      GAP = 20;
    }
  }

  let scrollX = 0;
  let paused = false;
  let lastCenter = -1;

  function resize() {
    updateResponsiveVars();
    dpr = window.devicePixelRatio || 1;
    W = canvas.parentElement.offsetWidth;
    // Taller ratio on mobile so cards aren't squished
    const ratio = W <= 480 ? 0.55 : W <= 768 ? 0.45 : 0.36;
    H = Math.round(W * ratio);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!scrollX) scrollX = cardStep() * BASE;
    draw();
  }

  function cardStep() {
    return (W - GAP * (COLS + 1)) / COLS + GAP;
  }

  // Bézier arc rails — cards bow in at the centre edges
  function topY(nx) { return (1 - nx) * (1 - nx) * (H * 0.04) + 2 * (1 - nx) * nx * (H * 0.50) + nx * nx * (H * 0.04); }
  function botY(nx) { return (1 - nx) * (1 - nx) * (H * 0.96) + 2 * (1 - nx) * nx * (H * 0.50) + nx * nx * (H * 0.96); }

  function drawCard(img, x0, x1) {
    if (x1 < 0 || x0 > W) return;
    const cw = x1 - x0;

    // Render card into offscreen canvas with rounded corners.
    // Sized in DEVICE pixels (cw*dpr / H*dpr) so the source image data
    // is never upscaled when it's later drawn onto the (also dpr-scaled)
    // main canvas — this is what was causing the blur/pixelation on
    // high-DPI (retina/desktop) screens.
    const oc = document.createElement("canvas");
    oc.width = Math.ceil(cw * dpr);
    oc.height = Math.ceil(H * dpr);
    const oc2 = oc.getContext("2d");
    oc2.scale(dpr, dpr);
    const r = RADIUS, ow = cw, oh = H;
    oc2.beginPath();
    oc2.moveTo(r, 0); oc2.lineTo(ow - r, 0); oc2.quadraticCurveTo(ow, 0, ow, r);
    oc2.lineTo(ow, oh - r); oc2.quadraticCurveTo(ow, oh, ow - r, oh);
    oc2.lineTo(r, oh); oc2.quadraticCurveTo(0, oh, 0, oh - r);
    oc2.lineTo(0, r); oc2.quadraticCurveTo(0, 0, r, 0);
    oc2.closePath(); oc2.clip();

    if (img && img.complete && img.naturalWidth > 0) {
      oc2.drawImage(img, 0, 0, ow, oh);
    } else {
      oc2.fillStyle = "#2a2a2a";
      oc2.fillRect(0, 0, ow, oh);
    }

    // Column-by-column warp onto main canvas.
    // Strips stay in plain CSS-pixel space (ctx is already scaled for
    // device pixels via setTransform(dpr,...) in resize()) — no manual
    // dpr rounding on the destination x-position. Snapping xS to the
    // device-pixel grid (an earlier attempt) caused adjacent strips to
    // round to the same pixel or skip one when dpr wasn't a clean
    // integer (1.25x, 1.5x, etc.), which duplicated/dropped thin slices
    // of the image and produced a rippled/warped look. A small overlap
    // between strips is enough to remove the hairline seam gaps instead.
    const stripW = 1; // CSS px granularity for the curve warp
    const overlap = 0.75; // px overlap to avoid hairline gaps between strips
    const cols = Math.ceil(cw / stripW);
    for (let c = 0; c < cols; c++) {
      const xS = x0 + c * stripW;
      const xE = Math.min(xS + stripW + overlap, x0 + cw);
      if (xE < 0 || xS > W) continue;
      const nx = xS / W;
      const ty = topY(nx);
      const colH = botY(nx) - topY(nx);
      const sw = xE - xS;
      const srcX = (xS - x0) * dpr;
      const srcW = sw * dpr;
      ctx.save();
      ctx.beginPath(); ctx.rect(xS, ty, sw, colH); ctx.clip();
      ctx.drawImage(oc, srcX, 0, srcW, oc.height, xS, ty, sw, colH);
      ctx.restore();
    }
  }

  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);

    const step = cardStep();
    const cardW = step - GAP;
    const n = ALL.length;
    const gutter = GAP;

    // Find the card closest to centre
    let bestDist = Infinity, centerTile = 0;
    for (let i = 0; i < n; i++) {
      const cx = gutter + i * step - scrollX + cardW / 2;
      const d = Math.abs(cx - W / 2);
      if (d < bestDist) { bestDist = d; centerTile = i; }
    }

    // Draw farthest cards first so centre sits on top
    const order = [...Array(n).keys()].sort((a, b) => {
      const da = Math.abs((gutter + a * step - scrollX + cardW / 2) - W / 2);
      const db = Math.abs((gutter + b * step - scrollX + cardW / 2) - W / 2);
      return db - da;
    });
    for (const i of order) {
      const x0 = gutter + i * step - scrollX;
      const x1 = x0 + cardW;
      if (x1 < -cardW || x0 > W + cardW) continue;
      drawCard(imgCache[i % BASE], x0, x1);
    }

    // Update center tracking (removed caption elements update as requested)
    const ri = centerTile % BASE;
    if (ri !== lastCenter) {
      lastCenter = ri;
    }

    // Edge fade — matches dark black background
    const fadeL = ctx.createLinearGradient(0, 0, W * 0.12, 0);
    fadeL.addColorStop(0, "rgba(0,0,0,1)");
    fadeL.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fadeL;
    ctx.fillRect(0, 0, W * 0.12, H);

    const fadeR = ctx.createLinearGradient(W, 0, W * 0.88, 0);
    fadeR.addColorStop(0, "rgba(0,0,0,1)");
    fadeR.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fadeR;
    ctx.fillRect(W * 0.88, 0, W * 0.12, H);
  }

  function loop() {
    if (!paused) {
      scrollX += SPEED;
      const oneTile = cardStep() * BASE;
      if (scrollX >= oneTile * 2) scrollX -= oneTile;
      if (scrollX < oneTile) scrollX += oneTile;
      draw();
    }
    requestAnimationFrame(loop);
  }

  // Click a carousel card to play its expand animation and show the project actions.
  canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const step = cardStep();
    const cardW = step - GAP;
    const n = ALL.length;
    for (let i = 0; i < n; i++) {
      const x0 = GAP + i * step - scrollX;
      const x1 = x0 + cardW;
      if (mx >= x0 && mx <= x1) {
        const left = Math.max(0, x0);
        const right = Math.min(W, x1);
        const nx0 = left / W;
        const nx1 = right / W;
        const top = Math.min(topY(nx0), topY(nx1));
        const bottom = Math.max(botY(nx0), botY(nx1));
        const sourceRect = {
          left: rect.left + left,
          top: rect.top + top,
          width: Math.max(100, right - left),
          height: Math.max(100, bottom - top),
        };
        openCardModal(i % BASE, sourceRect);
        break;
      }
    }
  });

  canvas.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && lastCenter >= 0) {
      e.preventDefault();
      openCardModal(lastCenter);
    }
  });

  // Auto-scroll continues on hover as requested


  // ── Modal open ──
  function openCardModal(ri, sourceRect = null) {
    paused = true;
    const item = CAROUSEL_ITEMS[ri];
    const data = projectData[item.idx];

    // Set modal content using high quality local screenshot if available, otherwise unsplash
    const imgSrc = data.screenshot || item.src;
    document.getElementById("zoomedImage").src = imgSrc;
    document.getElementById("zoomedTitle").textContent = data.title;
    document.getElementById("zoomedDescription").textContent = data.description;
    lightboxImageEl.src = imgSrc;

    const demoBtn = document.getElementById("zoomedDemoBtn");
    demoBtn.href = `project.html?id=${ri}`;
    demoBtn.style.display = "inline-flex";

    const githubBtn = document.getElementById("zoomedGithubBtn");
    if (data.github) { githubBtn.href = data.github; githubBtn.style.display = "inline-flex"; }
    else { githubBtn.style.display = "none"; }

    // Start the card at the clicked canvas image, then expand it to the modal.
    const cr = canvas.getBoundingClientRect();
    const startWidth = sourceRect?.width || 200;
    const startHeight = sourceRect?.height || 250;
    const startLeft = sourceRect?.left ?? cr.left + cr.width / 2 - startWidth / 2;
    const startTop = sourceRect?.top ?? cr.top + cr.height / 2 - startHeight / 2;

    zoomedCardEl.style.left = startLeft + "px";
    zoomedCardEl.style.top = startTop + "px";
    zoomedCardEl.style.width = startWidth + "px";
    zoomedCardEl.style.height = startHeight + "px";
    zoomedCardEl.style.transform = "rotateY(0deg) rotateZ(0deg) scale(1)";
    zoomedCardEl.style.transition = "none";
    zoomedCardEl.classList.remove("expanding", "expanded", "returning");

    overlayEl.classList.add("active");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        zoomedCardEl.classList.add("expanding");
        zoomedCardEl.style.transition = "all 0.4s cubic-bezier(0.34,1.56,0.64,1)";
        zoomedCardEl.style.transform = "rotateY(90deg) rotateZ(-5deg) scale(1.1) translateY(-30px)";

        setTimeout(() => {
          zoomedCardEl.style.transition = "all 0.8s cubic-bezier(0.34,1.56,0.64,1)";
          zoomedCardEl.classList.add("expanded");
        }, 400);
      });
    });
  }

  // ── Modal close ──
  function closeCardModal() {
    zoomedCardEl.classList.remove("expanded");
    zoomedCardEl.classList.add("returning");

    setTimeout(() => {
      zoomedCardEl.style.transition = "all 0.4s cubic-bezier(0.34,1.56,0.64,1)";
      zoomedCardEl.style.transform = "translate(-50%,-50%) rotateY(90deg) rotateZ(5deg) scale(0.9)";

      setTimeout(() => {
        zoomedCardEl.style.transition = "all 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        zoomedCardEl.style.transform = "scale(0)";

        setTimeout(() => {
          overlayEl.classList.remove("active");
          zoomedCardEl.classList.remove("expanding", "expanded", "returning");
          document.body.style.overflow = "";
          paused = false;
        }, 400);
      }, 400);
    }, 100);
  }

  closeBtnEl.addEventListener("click", closeCardModal);
  overlayEl.addEventListener("click", e => { if (e.target === overlayEl) closeCardModal(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlayEl.classList.contains("active")) closeCardModal();
  });

  // ── Fullscreen image lightbox ──
  function openLightbox() {
    lightboxEl.classList.add("active");
    // Try the native Fullscreen API on the lightbox container so the
    // browser chrome hides and the image fills the whole screen.
    // Falls back gracefully to the in-page overlay if unsupported
    // or blocked (e.g. iOS Safari, or user hasn't interacted yet).
    const requestFS =
      lightboxEl.requestFullscreen ||
      lightboxEl.webkitRequestFullscreen ||
      lightboxEl.msRequestFullscreen;
    if (requestFS) {
      requestFS.call(lightboxEl).catch(() => {
        // Fullscreen request denied/unsupported — the overlay-only
        // view (already active above) still works as a zoom view.
      });
    }
  }

  function closeLightbox() {
    const exitFS =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      exitFS.call(document).catch(() => {});
    }
    lightboxEl.classList.remove("active");
  }

  fullscreenBtnEl.addEventListener("click", openLightbox);
  lightboxCloseBtnEl.addEventListener("click", closeLightbox);
  lightboxEl.addEventListener("click", e => {
    if (e.target === lightboxEl) closeLightbox();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && lightboxEl.classList.contains("active")) closeLightbox();
  });
  // Keep the overlay in sync if the user exits fullscreen via the
  // browser's own UI (Esc key, swipe down, etc.) rather than our button.
  ["fullscreenchange", "webkitfullscreenchange"].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        lightboxEl.classList.remove("active");
      }
    });
  });

  // Start the carousel
  window.addEventListener("resize", resize);
  resize();
  loop();

  // ═══════════════════════════════════════════
  // MOBILE MENU (animated)
  // ═══════════════════════════════════════════
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuIcon = menuBtn.querySelector("i");
  let menuOpen = false;

  function openMobileMenu() {
    menuOpen = true;
    mobileMenu.classList.remove("hidden");
    // Force reflow so transition kicks in
    void mobileMenu.offsetHeight;
    mobileMenu.classList.add("menu-visible");
    menuIcon.classList.replace("uil-bars", "uil-times");
  }

  function closeMobileMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    mobileMenu.classList.remove("menu-visible");
    menuIcon.classList.replace("uil-times", "uil-bars");
    // Wait for transition to finish, then hide
    mobileMenu.addEventListener("transitionend", function handler() {
      if (!menuOpen) mobileMenu.classList.add("hidden");
      mobileMenu.removeEventListener("transitionend", handler);
    });
  }

  menuBtn.addEventListener("click", () => {
    menuOpen ? closeMobileMenu() : openMobileMenu();
  });

  // Close mobile menu on scroll
  window.addEventListener("scroll", () => {
    if (menuOpen) closeMobileMenu();
  }, { passive: true });

  // Close mobile menu when a link is tapped
  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => closeMobileMenu());
  });

  // ═══════════════════════════════════════════
  // FAQ ACCORDION
  // ═══════════════════════════════════════════
  function toggleFaq(element) {
    const faqItem = element.closest(".faq-item");
    const isActive = faqItem.classList.contains("active");
    document.querySelectorAll(".faq-item").forEach(item => {
      item.classList.remove("active", "border-orange-600");
    });
    if (!isActive) { faqItem.classList.add("active", "border-orange-600"); }
  }
  document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", function () { toggleFaq(this); });
  });

  // ═══════════════════════════════════════════
  // CONTACT FORM — mailto fallback
  // ═══════════════════════════════════════════
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  contactForm.addEventListener("submit", async event => {
    event.preventDefault();
    const values = new FormData(contactForm);
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    try {
      const response = await fetch("https://formsubmit.co/ajax/annabelleandrada08@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: `${values.get("first_name")} ${values.get("last_name")}`,
          email: values.get("email"),
          message: values.get("message"),
          _subject: "New portfolio message for Annabelle Andrada",
          _template: "table",
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error("Message delivery failed.");
      submitBtn.textContent = "✓ Message Sent!";
      contactForm.reset();
      window.setTimeout(() => { submitBtn.textContent = originalLabel; submitBtn.disabled = false; }, 3000);
    } catch (error) {
      console.error("Contact form error:", error);
      submitBtn.textContent = "Could not send. Try again.";
      window.setTimeout(() => { submitBtn.textContent = originalLabel; submitBtn.disabled = false; }, 3000);
    }
  });
});

// ═══════════════════════════════════════════
// HERO ANIMATION (GSAP) — on page load
// ═══════════════════════════════════════════
window.addEventListener("load", () => {
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  tl.fromTo(
    ".epic-adam-wrapper",
    { x: "-120%", opacity: 0 },
    { x: 0, opacity: 1, duration: 2.5, ease: "power4.out" }
  )
    .fromTo(
      ".epic-god-wrapper",
      { x: "120%", opacity: 0 },
      { x: 0, opacity: 1, duration: 2.5, ease: "power4.out" },
      "<"
    )
    .fromTo(
      "#navbar",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "+=0.5"
    )
    .fromTo(
      ".hero-content > *",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(
      ".services-strip > *",
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)" },
      "-=0.4"
    );
});



// ═══════════════════════════════════════════
// SCROLL ANIMATIONS (GSAP ScrollTrigger)
// ═══════════════════════════════════════════
gsap.registerPlugin(ScrollTrigger);

// About — "Behind the Designs"
const aboutTL1 = gsap.timeline({
  scrollTrigger: { trigger: "#about", start: "top 80%", toggleActions: "play none none none" },
});
aboutTL1
  .from("#about h4:first-of-type", { x: -30, opacity: 0, duration: 1, ease: "power3.out" })
  .from("#about h2:first-of-type", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.3")
  .from("#about .grid > div:first-child p", { x: -40, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" }, "-=0.4")
  .from("#about .grid > div:last-child p", { x: 40, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" }, "<");

// About — "Who I Am"
const aboutTL2 = gsap.timeline({
  scrollTrigger: { trigger: "#about h4:nth-of-type(2)", start: "top 85%", toggleActions: "play none none none" },
});
aboutTL2
  .from("#about h4:nth-of-type(2)", { x: -30, opacity: 0, duration: 1, ease: "power3.out" })
  .from("#about h2:nth-of-type(2)", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.3")
  .from("#about > p", { y: 40, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.4");

// Projects section header
gsap
  .timeline({
    scrollTrigger: {
      trigger: "#projects",
      start: "top 80%",
    },
  })
  .from("#projects .absolute.top-0 h4", {
    y: -20,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
  })
  .from(
    "#projects .absolute.top-0 h2",
    {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    },
    "-=0.4",
  )
  .from(
    "#projects .absolute.top-0 p",
    {
      y: 20,
      opacity: 0,
      duration: 0.6,
    },
    "-=0.5",
  )
  .from(
    "#projects .absolute.bottom-12 > div",
    {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
    },
    "-=0.5",
  );

// Services
gsap
  .timeline({ scrollTrigger: { trigger: "#services", start: "top 80%" } })
  .from("#services h4", { x: -30, opacity: 0, duration: 0.6, ease: "power3.out" })
  .from("#services h2", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
  .from("#services > div > p", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
  .from("#services .grid > div", { y: 0, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }, "-=0.3");

// Contact
gsap
  .timeline({ scrollTrigger: { trigger: "#contact", start: "top 80%" } })
  .from("#contact h4", { x: -30, opacity: 0, duration: 0.6 })
  .from("#contact h1", { y: 30, opacity: 0, duration: 0.8 }, "-=0.4")
  .from("#contact p", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.5")
  .from("#contact .flex.gap-6 a", { scale: 0, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.3")
  .from("#contact form", { x: 50, opacity: 0, duration: 0.8 }, "-=0.8");

// FAQ
gsap
  .timeline({ scrollTrigger: { trigger: "#faq", start: "top 80%" } })
  .from("#faq .sticky h4", { x: -30, opacity: 0, duration: 0.6 })
  .from("#faq .sticky h2", { y: 30, opacity: 0, duration: 0.8 }, "-=0.4")
  .from("#faq .sticky p", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
  .from("#faq .sticky a", { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.2)" }, "-=0.4")
  .from(".faq-item", { x: 50, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.6");

// Footer
gsap
  .timeline({ scrollTrigger: { trigger: "footer", start: "top 90%" } })
  .from("footer .grid > div", { y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" })
  .from("footer .border-t", { opacity: 0, duration: 0.6 }, "-=0.3");

// ═══════════════════════════════════════════
// NAVBAR HIDE/SHOW ON SCROLL
// ═══════════════════════════════════════════
let lastScrollY = window.scrollY;
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  // Scrolled class (existing logic)
  if (currentScrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Hide when scrolling down, show when scrolling up
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    // Scrolling DOWN
    navbar.style.transform = "translateX(-50%) translateY(-120%)";
    navbar.style.opacity = "0";
    navbarVisible = false;
  } else {
    // Scrolling UP
    navbar.style.transform = "translateX(-50%)";
    navbar.style.opacity = "1";
    navbarVisible = true;
  }

  lastScrollY = currentScrollY;
});
