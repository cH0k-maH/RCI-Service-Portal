document.addEventListener('DOMContentLoaded', async () => {
  const contactContainer = document.getElementById('contact-section');
  const response = await fetch('./src/pages/contact.html');
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
    lagos: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.958544964939!2d3.333472475036436!3d6.54386152417041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8f83adbf93f7%3A0x2d144d05094cf7ea!2sApprint%20Compound%2C%20Oshodi-4th%20Gate%2C%20Lagos!5e0!3m2!1sen!2sng!4v1739987654321!5m2!1sen!2sng',
    ph: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.773987542856!2d7.03307917503656!3d4.835180341698941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1069cdae9a0f4ad3%3A0x85b82b3b176c4272!2sJohanny%20International%20Mall%2C%20Rumudara%2C%20Port%20Harcourt!5e0!3m2!1sen!2sng!4v1739987654322!5m2!1sen!2sng',
    abuja: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.324816579033!2d7.492219975038311!3d9.076674590383721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0b09f63e4dfb%3A0x994a8e71c4b3b52a!2sHis%20Glory%20Plaza%2C%20Adetokunbo%20Ademola%20Crescent%2C%20Wuse%20II%2C%20Abuja!5e0!3m2!1sen!2sng!4v1739987654323!5m2!1sen!2sng'
  };


mapBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.map;
    mapFrame.src = maps[key];
    mapSection.classList.remove('hidden', 'opacity-0', 'scale-95');
    mapSection.classList.add('opacity-100', 'scale-100');
  });
});

// Close map button handler
document.getElementById('closeMap').addEventListener('click', () => {
  mapSection.classList.add('opacity-0', 'scale-95');
  setTimeout(() => {
    mapSection.classList.add('hidden');
    mapFrame.src = ''; // clear map when closed
  }, 300);
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
