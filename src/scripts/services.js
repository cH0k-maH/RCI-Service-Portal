document.addEventListener('DOMContentLoaded', async () => {
  // Load services HTML dynamically into index.html
  const servicesContainer = document.getElementById('services-section');
  console.log("Loading services.html...");
  const response = await fetch('./src/pages/services.html');
  if (!response.ok) {
    console.error("Services load failed:", response.status);
    return;
  }
  console.log("Services loaded!");
  const servicesHTML = await response.text();
  servicesContainer.innerHTML = servicesHTML;

  // Animation: Fade-up when section becomes visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-6');
        }
      });
    },
    { threshold: 0.2 }
  );

  // Apply animation to each service card
  const serviceCards = servicesContainer.querySelectorAll('.service-card');
  serviceCards.forEach((card, i) => {
    card.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700');
    card.style.transitionDelay = `${i * 150}ms`; // stagger animation
    observer.observe(card);
  });
});
