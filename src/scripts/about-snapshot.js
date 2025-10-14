document.addEventListener('DOMContentLoaded', async () => {
  const snapshotContainer = document.getElementById('snapshot-section');
  const response = await fetch('./components/about-snapshot.html');
  if (!response.ok) {
    console.error("About Snapshot load failed:", response.status);
    return;
  }
  const html = await response.text();
  snapshotContainer.innerHTML = html;

  // Images (you can replace these later)
  const images = [
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    'https://images.unsplash.com/photo-1573497019411-5077b6dc7624',
    'https://images.unsplash.com/photo-1581090700227-1e37b190418e',
    'https://images.unsplash.com/photo-1522202223600-eca5c3e90d47',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1581093588401-22e8e3b78e7d',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0'
  ];

  const gallery = document.getElementById('snapshot-gallery');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  let startIndex = 0;
  const visibleCount = 4;

  const animations = ['fade', 'slide', 'zoom', 'scale'];

  function showImages() {
    gallery.innerHTML = '';

    const subset = images.slice(startIndex, startIndex + visibleCount);
    subset.forEach((src) => {
      const card = document.createElement('div');
      const anim = animations[Math.floor(Math.random() * animations.length)];

      card.className = `rounded-2xl shadow-md overflow-hidden transform transition-all duration-700 ${anim}`;
      card.innerHTML = `
        <img src="${src}" alt="Snapshot" class="w-full h-56 object-cover" />
      `;
      gallery.appendChild(card);
    });
  }

  nextBtn.addEventListener('click', () => {
    startIndex = (startIndex + visibleCount) % images.length;
    showImages();
  });

  prevBtn.addEventListener('click', () => {
    startIndex = (startIndex - visibleCount + images.length) % images.length;
    showImages();
  });

  // Auto slide every 5 seconds
  setInterval(() => {
    nextBtn.click();
  }, 5000);

  showImages();
});
