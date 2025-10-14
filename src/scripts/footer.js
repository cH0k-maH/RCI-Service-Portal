document.addEventListener('DOMContentLoaded', async () => {
  // Load footer HTML
  const footerContainer = document.getElementById('footer-section');
  const response = await fetch('./components/footer.html');
  const html = await response.text();
  footerContainer.innerHTML = html;

  // Auto year update
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth scroll for in-page links (from both nav & footer)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Scroll to top button logic
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.remove('hidden');
      scrollToTopBtn.classList.add('opacity-100');
    } else {
      scrollToTopBtn.classList.add('hidden');
      scrollToTopBtn.classList.remove('opacity-100');
    }
  });

  // Scroll to top on click
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
