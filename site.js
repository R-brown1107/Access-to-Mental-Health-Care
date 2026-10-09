(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
  }

  const journey = document.querySelector(".zoom-journey");
  const scenes = [...document.querySelectorAll(".zoom-scene")];
  const number = document.getElementById("progress-number");
  const fill = document.getElementById("progress-fill");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!journey || !scenes.length) return;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function update() {
    if (reduceMotion) {
      scenes.forEach((s, i) => { s.style.opacity = i === 0 ? "1" : "0"; s.style.visibility = i === 0 ? "visible" : "hidden"; });
      return;
    }
    const rect = journey.getBoundingClientRect();
    const maxScroll = Math.max(1, journey.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / maxScroll, 0, 1);
    const count = scenes.length;
    const scaled = progress * (count - 1);
    const index = Math.min(count - 1, Math.floor(scaled));
    const local = index === count - 1 ? 0 : scaled - index;

    scenes.forEach((scene, i) => {
      scene.style.visibility = "visible";
      scene.classList.toggle("active", i === index || (i === index + 1 && local > 0.45));
      if (i < index) {
        scene.style.opacity = "0";
        scene.style.clipPath = "circle(0% at 65% 43%)";
        scene.style.transform = "scale(2.7)";
      } else if (i === index) {
        // Current image zooms toward a focal point as the next full-bleed scene opens from that point.
        scene.style.opacity = String(1 - clamp((local - 0.72) / 0.28, 0, 1));
        scene.style.clipPath = "circle(150% at 65% 43%)";
        scene.style.transform = `scale(${1 + local * 1.75})`;
      } else if (i === index + 1) {
        const reveal = clamp((local - 0.22) / 0.78, 0, 1);
        const radius = reveal * 150;
        scene.style.clipPath = `circle(${radius}% at 65% 43%)`;
        scene.style.opacity = String(reveal);
        scene.style.transform = `scale(${1.12 - reveal * 0.12})`;
      } else {
        scene.style.opacity = "0";
        scene.style.clipPath = "circle(0% at 65% 43%)";
        scene.style.transform = "scale(1)";
      }
    });
    if (number) number.textContent = String(Math.min(count, index + 1)).padStart(2, "0");
    if (fill) fill.style.width = `${progress * 100}%`;
  }
  let pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { update(); pending = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
