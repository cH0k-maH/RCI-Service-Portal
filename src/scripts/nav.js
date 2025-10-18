// src/scripts/nav.js
document.addEventListener("DOMContentLoaded", async () => {
  // === Load navbar HTML dynamically ===
  const navbarContainer = document.getElementById("navbar");
  const response = await fetch("./src/pages/nav.html");
 
  const navHTML = await response.text();
  navbarContainer.innerHTML = navHTML;

  // === Select Key Elements (guarded) ===
  const menuBtn = document.getElementById("menu-btn");
  const menuIcon = document.getElementById("menu-icon");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuLinks = mobileMenu ? mobileMenu.querySelector("div") : null;

  let isOpen = false;

  // Safety: if menu button missing, skip toggle setup (prevents errors)
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      isOpen = !isOpen;
      toggleMenu(isOpen);
    });
  }

  function toggleMenu(open) {
    if (!mobileMenu || !menuLinks) return;
    if (open) {
      mobileMenu.classList.remove("hidden");
      setTimeout(() => {
        mobileMenu.classList.remove("scale-y-0");
        mobileMenu.classList.add("scale-y-100");
        menuLinks.classList.remove("opacity-0");
        menuLinks.classList.add("opacity-100");
      }, 10);
      if (menuIcon)
        menuIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M6 18L18 6M6 6l12 12"/>`;
    } else {
      mobileMenu.classList.remove("scale-y-100");
      mobileMenu.classList.add("scale-y-0");
      menuLinks.classList.remove("opacity-100");
      menuLinks.classList.add("opacity-0");
      setTimeout(() => mobileMenu.classList.add("hidden"), 300);
      if (menuIcon)
        menuIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"/>`;
    }
  }

  // === Mapping fallback for anchors that use href="#" ===
  const textToTarget = {
    home: "#hero",
    about: "#snapshot",
    services: "#services",
    contact: "#contact",
  };

  // === Universal handler to close menu then scroll ===
  function closeMenuAndScrollTo(targetSelector) {
    if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
      toggleMenu(false);
      setTimeout(() => {
        const el = document.querySelector(targetSelector);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 360);
    } else {
      const el = document.querySelector(targetSelector);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // === Attach handlers to every anchor inside the navbar ===
  const allAnchors = navbarContainer.querySelectorAll("a");
  allAnchors.forEach((link) => {
    const text = (link.textContent || "").trim().toLowerCase();
    const href = link.getAttribute("href") || "";
    let targetSelector = null;

    if (href.startsWith("#") && href.length > 1) {
      targetSelector = href;
    } else if (href === "#" || href === "") {
      if (textToTarget[text]) targetSelector = textToTarget[text];
    } else {
      return;
    }

    if (text === "login") return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (!targetSelector) return;
      closeMenuAndScrollTo(targetSelector);
    });
  });

  // === Handle Login Button (Desktop + Mobile) ===
  function attachLoginHandlers() {
    const loginButtons = Array.from(navbarContainer.querySelectorAll("#login-btn, a")).filter((el) => {
      const t = (el.textContent || "").trim().toLowerCase();
      return el.id === "login-btn" || t === "login";
    });

    const overlay = document.getElementById("login-overlay");
    if (!overlay) return;

    loginButtons.forEach((btn) => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = "true";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
            toggleMenu(false);
            setTimeout(() => {
              overlay.classList.remove("hidden");
              document.body.classList.add("overflow-hidden");
            }, 350);
          } else {
            overlay.classList.remove("hidden");
            document.body.classList.add("overflow-hidden");
          }
        });
      }
    });
  }

  const observer = new MutationObserver(() => {
    const overlay = document.getElementById("login-overlay");
    if (overlay) attachLoginHandlers();
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
