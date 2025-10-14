document.addEventListener('DOMContentLoaded', async () => {
  const contactContainer = document.getElementById('contact-section');
  const response = await fetch('./components/contact.html');
  const html = await response.text();
  contactContainer.innerHTML = html;

  // Fade-in animation on scroll
  const contact = document.querySelector('#contact');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        contact.classList.add('animate-fadeIn');
        observer.unobserve(contact);
      }
    });
  });
  observer.observe(contact);

  // Map control
  const mapBtns = document.querySelectorAll('.map-btn');
  const mapSection = document.getElementById('mapSection');
  const mapFrame = document.getElementById('branchMap');

  const maps = {
    lagos: 'https://www.google.com/maps?q=Victoria+Island,+Lagos,+Nigeria&output=embed',
    ph: 'https://www.google.com/maps?q=GRA+Phase+2,+Port+Harcourt,+Nigeria&output=embed',
    abuja: 'https://www.google.com/maps?q=Wuse+2,+Abuja,+Nigeria&output=embed'
  };

  mapBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.map;
      mapFrame.src = maps[key];
      mapSection.classList.remove('opacity-0', 'scale-95');
      mapSection.classList.add('opacity-100', 'scale-100');
    });
  });

  // Contact form handler
  const form = document.getElementById('contactForm');
  const message = document.getElementById('formMessage');

  form.addEventListener('submit', e => {
    e.preventDefault();
    message.classList.remove('hidden');
    message.textContent = 'Message sent successfully!';
    form.reset();
    setTimeout(() => message.classList.add('hidden'), 4000);
  });
});
