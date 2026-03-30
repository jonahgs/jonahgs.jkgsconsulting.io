document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const header = document.getElementById("header");

  const closeMenu = () => {
    if (!mobileMenu || !menuBtn) {
      return;
    }

    mobileMenu.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isOpen = !mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden", isOpen);
      menuBtn.setAttribute("aria-expanded", String(!isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (header) {
    const updateHeader = () => {
      if (window.scrollY > 24) {
        header.classList.add("shadow-lg");
      } else {
        header.classList.remove("shadow-lg");
      }
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader);
  }
});
