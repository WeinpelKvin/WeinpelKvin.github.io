// Mobile nav: hamburger toggles the dropdown menu, and the bar hides
// while scrolling down and comes back when scrolling up.
const nav = document.querySelector(".site-nav");
const toggle = nav?.querySelector(".site-nav__toggle");
const mobile = matchMedia("(max-width: 767px)");

if (nav && toggle) {
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) setHidden(false);
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) setOpen(false);
  });

  // Close when resizing up to desktop so the state doesn't linger.
  mobile.addEventListener("change", (e) => {
    if (!e.matches) {
      setOpen(false);
      setHidden(false);
    }
  });

  // ---- Hide on scroll down, show on scroll up (mobile only) ----
  const TOP_ZONE = 100; // always show the nav near the top of the page
  const THRESHOLD = 8; // ignore tiny scroll jitters (px)
  let lastY = window.scrollY;

  function setHidden(hidden) {
    nav.classList.toggle("is-hidden", hidden);
  }

  function onScroll() {
    const y = window.scrollY;
    const delta = y - lastY;

    if (!mobile.matches || nav.classList.contains("is-open") || y < TOP_ZONE) {
      setHidden(false);
      lastY = y;
      return;
    }
    if (Math.abs(delta) < THRESHOLD) return;

    setHidden(delta > 0);
    lastY = y;
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // Keyboard users tabbing into the nav should always be able to see it.
  nav.addEventListener("focusin", () => setHidden(false));
}
