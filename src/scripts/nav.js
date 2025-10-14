document.addEventListener('DOMContentLoaded', async () => {
  // Load navbar HTML into the #navbar div
  const navbarContainer = document.getElementById('navbar');
  const response = await fetch('./components/nav.html'); 
  const navHTML = await response.text();
  navbarContainer.innerHTML = navHTML;

  // After nav is inserted, attach event listeners
  const menuBtn = document.getElementById('menu-btn');
  const menuIcon = document.getElementById('menu-icon');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuLinks = mobileMenu.querySelector('div');

  let isOpen = false;

  menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;

    if (isOpen) {
      // Show and animate
      mobileMenu.classList.remove('hidden');
      setTimeout(() => {
        mobileMenu.classList.remove('scale-y-0');
        mobileMenu.classList.add('scale-y-100');
        menuLinks.classList.remove('opacity-0');
        menuLinks.classList.add('opacity-100');
      }, 10);
    } else {
      // Animate close
      mobileMenu.classList.remove('scale-y-100');
      mobileMenu.classList.add('scale-y-0');
      menuLinks.classList.remove('opacity-100');
      menuLinks.classList.add('opacity-0');

      // Wait for animation before hiding
      setTimeout(() => {
        mobileMenu.classList.add('hidden');
      }, 300);
    }

    // Toggle icon
    menuIcon.innerHTML = isOpen
      ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M6 18L18 6M6 6l12 12"/>`
      : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"/>`;
  });
});
