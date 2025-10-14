document.addEventListener('DOMContentLoaded', async () => {
  // Load hero HTML dynamically into index.html
  const heroContainer = document.getElementById('hero-section');
  console.log("Loading hero.html...");
  const response = await fetch('./components/hero.html');
  if (!response.ok) console.error("Hero load failed:", response.status);
  else console.log("Hero loaded!");
  const heroHTML = await response.text();
  heroContainer.innerHTML = heroHTML;

  // Animation: fade-in when loaded
  const hero = document.querySelector('#hero');
  hero.classList.add('opacity-0', 'translate-y-6');
  setTimeout(() => {
    hero.classList.remove('opacity-0', 'translate-y-6');
    hero.classList.add('transition-all', 'duration-700', 'opacity-100', 'translate-y-0');
  }, 200);

  // Smooth oscillating rotation (realistic side tilt)
  const printerImg = hero.querySelector('img');
  if (!printerImg) return;

  let direction = 1;
  let angle = 0;
  let paused = false;

  function animateRotation() {
    if (!paused) {
      angle += direction * 0.4;
      printerImg.style.transform = `rotate(${angle}deg) scale(1.03)`;

      // Hit edge limit
      if (angle >= 10 || angle <= -10) {
        paused = true;
        // Stay tilted for 2s, then reverse direction
        setTimeout(() => {
          direction *= -1;
          paused = false;
        }, 1000);
      }
    }

    // Schedule next frame
    if (!paused) requestAnimationFrame(animateRotation);
    else setTimeout(() => requestAnimationFrame(animateRotation), 2000);
  }

  // Initialize
  printerImg.style.transform = 'rotate(0deg) scale(1.03)';
  animateRotation();
});
