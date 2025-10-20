document.addEventListener('DOMContentLoaded', async () => {
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

  // Animation setup
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

  const serviceCards = servicesContainer.querySelectorAll('.service-card');
  serviceCards.forEach((card, i) => {
    card.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700');
    card.style.transitionDelay = `${i * 150}ms`;
    observer.observe(card);
  });

  // Modal setup
  const modal = document.getElementById('service-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const contractSection = document.getElementById('contract-section');
  const closeModal = document.getElementById('close-modal');

  const serviceDetails = {
    maintenance: {
      title: "Printer Maintenance",
      content: `
        RCI’s Printer Maintenance Service ensures your Ricoh multifunction printers run at peak performance.
        Our certified technicians handle diagnostics, toner optimization, cleaning, firmware updates, and
        component replacements. We minimize downtime by providing proactive maintenance schedules and
        on-site support to extend equipment lifespan and maximize print quality.
        <br><br>
        This service is available under multiple contract types to match your organization’s needs.`,
      hasContract: true,
    },
    workflow: {
      title: "Document Workflow",
      content: `
        Our Document Workflow solutions streamline the movement, storage, and approval of digital documents.
        We design systems that automate repetitive tasks like scanning, routing, and data entry. Integrating
        seamlessly with your Ricoh devices and cloud platforms, our tools reduce human error, ensure compliance,
        and improve team collaboration. Perfect for offices aiming to go paperless while maintaining high productivity.`,
      hasContract: false,
    },
    cloudprint: {
      title: "Secure Cloud Print",
      content: `
        With RCI’s Secure Cloud Print, your team can print documents safely from any device or location using
        encrypted channels. Our solution employs user authentication, print release queues, and audit tracking
        to prevent unauthorized access and data leaks. Whether for remote or on-premise environments, this service
        gives you total control over document security without sacrificing convenience.`,
      hasContract: false,
    },
    sales: {
      title: "Sales & Inventory",
      content: `
        The Sales & Inventory system helps your organization manage consumables, track printer usage,
        and maintain real-time visibility into supply levels. Generate insightful reports, schedule auto-refills,
        and ensure your branches never run out of essential materials. The dashboard also integrates with
        your existing ERP or CRM systems for seamless operations and transparent record-keeping.`,
      hasContract: false,
    },
  };

  // Open modal when Learn More is clicked
  servicesContainer.querySelectorAll('.learn-more-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-service');
      const data = serviceDetails[key];
      modalTitle.textContent = data.title;
      modalContent.innerHTML = data.content;
      contractSection.classList.toggle('hidden', !data.hasContract);
      modal.classList.remove('hidden');
    });
  });

  // Close modal
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
});
