document.addEventListener("DOMContentLoaded", () => {
  // === Helper: Load and Initialize Login Modal ===
  async function loadLoginModal() {
    // Remove old modal if it exists
    const existingOverlay = document.getElementById("login-overlay");
    if (existingOverlay) existingOverlay.remove();

    // Create container
    const container = document.createElement("div");
    document.body.appendChild(container);

    try {
      // Prevent caching by appending timestamp
      const response = await fetch(`./src/pages/login.html?nocache=${new Date().getTime()}`);
      const html = await response.text();
      container.innerHTML = html;
    } catch (error) {
      console.error("❌ Failed to load login modal:", error);
      return;
    }

    // === Modal Elements ===
    const overlay = document.getElementById("login-overlay");
    const modal = document.getElementById("login-modal");
    const closeBtn = document.getElementById("close-login");
    const loginTab = document.getElementById("login-tab");
    const signupTab = document.getElementById("signup-tab");
    const loginForm = document.getElementById("login-form");
    const signupSection = document.getElementById("signup-section");
    const welcomeText = document.getElementById("welcome-text");

    // === Admin Login Redirect ===
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();

    // Temporary hardcoded admin credentials
    if (email === "admin@rci.com" && password === "admin123") {
      localStorage.setItem("userRole", "admin");
      alert("✅ Login successful! Redirecting to Admin Dashboard...");
      window.location.href = "./src/pages/admin-dashboard/dashboard.html";
    } else {
      alert("❌ Invalid credentials. Please try again.");
    }
  });
}

    // === Signup Subsections ===
    const accountChoice = document.getElementById("account-type-choice");
    const dealerForm = document.getElementById("dealer-form");
    const customerForm = document.getElementById("customer-form");
    const chooseDealerBtn = document.getElementById("choose-dealer");
    const chooseCustomerBtn = document.getElementById("choose-customer");
    const backDealer = document.getElementById("back-to-login-from-dealer");
    const backCustomer = document.getElementById("back-to-login-from-customer");

    // === Close Modal Function ===
    function closeModal() {
      overlay.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }

    // === Open Modal Function ===
    function openModal() {
      overlay.classList.remove("hidden");
      modal.classList.add("animate-fadeIn");
      document.body.classList.add("overflow-hidden");
    }

    // === Attach Event Listeners ===
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    // === Tabs: Login / Signup ===
    if (loginTab && signupTab) {
      loginTab.addEventListener("click", () => {
        loginForm.classList.remove("hidden");
        signupSection.classList.add("hidden");
        welcomeText.textContent = "Welcome Back!";
        loginTab.classList.add("border-b-2", "border-red-600", "text-red-600", "font-semibold");
        signupTab.classList.remove("border-b-2", "border-red-600", "text-red-600", "font-semibold");
      });

      signupTab.addEventListener("click", () => {
        signupSection.classList.remove("hidden");
        loginForm.classList.add("hidden");
        welcomeText.textContent = "Create Your Account";
        signupTab.classList.add("border-b-2", "border-red-600", "text-red-600", "font-semibold");
        loginTab.classList.remove("border-b-2", "border-red-600", "text-red-600", "font-semibold");

        // Reset to account choice step when entering signup
        accountChoice.classList.remove("hidden");
        dealerForm.classList.add("hidden");
        customerForm.classList.add("hidden");
      });
    }

    // === Signup Flow: Choose Account Type ===
    if (chooseDealerBtn) {
      chooseDealerBtn.addEventListener("click", () => {
        accountChoice.classList.add("hidden");
        dealerForm.classList.remove("hidden");
      });
    }

    if (chooseCustomerBtn) {
      chooseCustomerBtn.addEventListener("click", () => {
        accountChoice.classList.add("hidden");
        customerForm.classList.remove("hidden");
      });
    }

    // === Back to Login from Dealer/Customer ===
    if (backDealer)
      backDealer.addEventListener("click", () => {
        dealerForm.classList.add("hidden");
        signupSection.classList.add("hidden");
        loginForm.classList.remove("hidden");
        loginTab.click();
      });

    if (backCustomer)
      backCustomer.addEventListener("click", () => {
        customerForm.classList.add("hidden");
        signupSection.classList.add("hidden");
        loginForm.classList.remove("hidden");
        loginTab.click();
      });

    // === Text Link Switching ===
    const switchToSignup = document.getElementById("switch-to-signup");
    if (switchToSignup) switchToSignup.addEventListener("click", () => signupTab.click());

    // === Animation (added once globally) ===
    if (!document.getElementById("fadeInStyle")) {
      const style = document.createElement("style");
      style.id = "fadeInStyle";
      style.innerHTML = `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }

    // === Expose openModal globally for external buttons ===
    window.showLoginModal = openModal;
  }

  // === Load modal after other sections (navbar/hero) ===
  setTimeout(async () => {
    await loadLoginModal();

    // === Attach to your actual buttons ===
    const openButtons = [
      document.getElementById("login-btn"),
      document.getElementById("get-started-btn"),
    ];

    openButtons.forEach((btn) => {
      if (btn) btn.addEventListener("click", () => window.showLoginModal());
    });
  }, 400);
});
