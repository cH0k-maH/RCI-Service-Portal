document.addEventListener("DOMContentLoaded", async () => {
  const snapshotContainer = document.getElementById("snapshot-section");
  if (!snapshotContainer) return;

  // Load the about-snapshot.html component
  const response = await fetch("./src/pages/about-snapshot.html");
  const html = await response.text();
  snapshotContainer.innerHTML = html;

  // === Gallery Controls ===
  const gallery = document.getElementById("snapshot-gallery");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  // === Define image paths separately ===
  const images = [
    { id: 1, src: "./src/images/imc2010.png" },
    { id: 1, src: "./src/images/imc2010.png" },
    { id: 1, src: "./src/images/imc2010.png" },
    { id: 1, src: "./src/images/imc2010.png" },
    { id: 1, src: "./src/images/imc2010.png" },
    { id: 1, src: "./src/images/imc2010.png" },
    { id: 1, src: "./src/images/imc2010.png" },
    { id: 1, src: "./src/images/imc2010.png" },
  ];

  const totalImages = images.length;
  const imagesPerPage = 4;
  let currentPage = 0;

  // === Display images ===
  function displayImages() {
    gallery.innerHTML = "";
    const start = currentPage * imagesPerPage;
    const end = start + imagesPerPage;
    const visibleImages = images.slice(start, end);

    visibleImages.forEach((img) => {
      const imgEl = document.createElement("img");
      imgEl.src = img.src;
      imgEl.alt = `Snapshot ${img.id}`;
      imgEl.className =
        "w-full h-48 object-cover rounded-xl shadow-md border border-gray-200 transform transition-transform duration-500 hover:scale-95 hover:shadow-xl cursor-pointer";
      imgEl.addEventListener("click", () => openPopup(img.src, img.alt));
      gallery.appendChild(imgEl);
    });

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = end >= totalImages;
    prevBtn.classList.toggle("opacity-50", prevBtn.disabled);
    nextBtn.classList.toggle("opacity-50", nextBtn.disabled);
  }

  // === Pagination ===
  prevBtn.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      displayImages();
    }
  });

  nextBtn.addEventListener("click", () => {
    if ((currentPage + 1) * imagesPerPage < totalImages) {
      currentPage++;
      displayImages();
    }
  });

  displayImages();

  // === Popup Viewer (dark blurred background + zoom animation) ===
  function openPopup(src, alt) {
    const popup = document.createElement("div");
    popup.id = "image-popup";
    popup.className =
      "fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50 transition-opacity duration-500";

    popup.innerHTML = `
      <div class="relative bg-white rounded-xl shadow-2xl p-4 animate-zoomIn max-w-md w-[90%]">
        <button id="close-popup" class="absolute top-2 right-2 text-gray-600 text-2xl hover:text-red-500">&times;</button>
        <img src="${src}" alt="${alt}" class="rounded-lg w-full h-auto object-contain" />
      </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("close-popup").addEventListener("click", () => {
      popup.remove();
    });

    popup.addEventListener("click", (e) => {
      if (e.target === popup) popup.remove();
    });
  }

  // === Animations (fade + zoom) ===
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-zoomIn {
      animation: zoomIn 0.35s ease-out;
    }

    /* Optional: Slight frosted border glow */
    #image-popup > div {
      backdrop-filter: blur(8px);
    }
  `;
  document.head.appendChild(style);
});
