import { qs, qsa } from "../utils/dom.js";

export function setupRevealAnimation() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  qsa(".reveal").forEach((element) => revealObserver.observe(element));
}

export function setupTiltCards(selector = ".project-card") {
  qsa(selector).forEach((card) => {
    if (card.dataset.tiltReady) {
      return;
    }

    card.dataset.tiltReady = "true";
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
      card.style.setProperty("--tilt-x", `${y}deg`);
      card.style.setProperty("--tilt-y", `${x}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

export function setupBackToTop() {
  const backToTop = qs(".back-to-top");

  const syncVisibility = () => {
    const shouldShow = window.scrollY > 520;

    backToTop.classList.toggle("visible", shouldShow);
    backToTop.setAttribute("aria-hidden", String(!shouldShow));
    backToTop.tabIndex = shouldShow ? 0 : -1;
  };

  syncVisibility();
  window.addEventListener("scroll", syncVisibility, { passive: true });

  backToTop.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.replaceState(null, "", "#top");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
