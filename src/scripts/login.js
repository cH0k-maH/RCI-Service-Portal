document.addEventListener("DOMContentLoaded", () => {
  // === Login Modal Manager ===
  class LoginModalManager {
    constructor() {
      this.overlay = null;
      this.modal = null;
      this.loginForm = null;
    }

    /**
     * Initialize the modal by loading it dynamically.
     */
    async init() {
      // Use DomLoader to load the login HTML
      // Note: Creating a container first if not present
      if (!document.getElementById("login-modal-container")) {
        const container = document.createElement("div");
        container.id = "login-modal-container";
        document.body.appendChild(container);
      }

      const container = await window.DomLoader.loadComponent("#login-modal-container", "./src/pages/login.html");

      if (!container) return;

      // Cache DOM elements
      this.overlay = document.getElementById("login-overlay");
      this.modal = document.getElementById("login-modal");
      this.loginForm = document.getElementById("login-form");

      // Setup internal event listeners (tabs, close button, etc)
      this.setupInternalEvents();

      // Setup Login Form Submission
      if (this.loginForm) {
        this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
      }

      // Attach global open trigger
      window.showLoginModal = () => this.open();

      // Hook up existing buttons on the page (like in Hero or Nav)
      this.attachGlobalTriggers();
    }

    setupInternalEvents() {
      // Close Button
      const closeBtn = document.getElementById("close-login");
      if (closeBtn) closeBtn.addEventListener("click", () => this.close());

      // Click outside to close
      if (this.overlay) {
        this.overlay.addEventListener("click", (e) => {
          if (e.target === this.overlay) this.close();
        });
      }

      // Tab Switching
      const loginTab = document.getElementById("login-tab");
      const signupTab = document.getElementById("signup-tab");
      const loginForm = document.getElementById("login-form");
      const signupSection = document.getElementById("signup-section");
      const welcomeText = document.getElementById("welcome-text");

      if (loginTab && signupTab) {
        loginTab.addEventListener("click", () => {
          loginForm.classList.remove("hidden");
          signupSection.classList.add("hidden");
          welcomeText.textContent = "Welcome Back!";
          this.updateTabStyles(loginTab, signupTab);
        });

        signupTab.addEventListener("click", () => {
          signupSection.classList.remove("hidden");
          loginForm.classList.add("hidden");
          welcomeText.textContent = "Create Your Account";
          this.updateTabStyles(signupTab, loginTab);
        });
      }

      // Sub-section toggles (Dealer vs Customer)
      const chooseDealerBtn = document.getElementById("choose-dealer");
      const chooseCustomerBtn = document.getElementById("choose-customer");
      const accountChoice = document.getElementById("account-type-choice");
      const dealerForm = document.getElementById("dealer-form");
      const customerForm = document.getElementById("customer-form");

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

      // Back buttons
      const backDealer = document.getElementById("back-to-login-from-dealer");
      const backCustomer = document.getElementById("back-to-login-from-customer");

      const returnToLogin = () => {
        dealerForm.classList.add("hidden");
        customerForm.classList.add("hidden");
        signupSection.classList.add("hidden");
        loginForm.classList.remove("hidden");
        if (loginTab) loginTab.click();
      };

      if (backDealer) backDealer.addEventListener("click", returnToLogin);
      if (backCustomer) backCustomer.addEventListener("click", returnToLogin);

      // Switch to signup text link
      const switchToSignup = document.getElementById("switch-to-signup");
      if (switchToSignup && signupTab) {
        switchToSignup.addEventListener("click", () => signupTab.click());
      }
    }

    updateTabStyles(active, inactive) {
      active.classList.add("border-b-2", "border-red-600", "text-red-600", "font-semibold");
      inactive.classList.remove("border-b-2", "border-red-600", "text-red-600", "font-semibold");
    }

    async handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById("login-email")?.value.trim();
      const password = document.getElementById("login-password")?.value.trim();
      const submitBtn = this.loginForm.querySelector("button[type='submit']");

      // Simple loading state
      const originalText = submitBtn.innerText;
      submitBtn.innerText = "Logging in...";
      submitBtn.disabled = true;

      try {
        const result = await window.AuthService.login(email, password);

        if (result.success) {
          alert(`✅ Login successful! Welcome ${result.role}.`);
          // Redirect based on role
          // Dynamic Redirect based on Role Config
          const specificRole = localStorage.getItem("staffType"); // e.g. "manager", "engineer"
          const redirectUser = {
            role: specificRole,
            type: result.role // "staff", "admin", "customer"
          };

          const redirectUrl = window.UserService.getRedirectUrl(redirectUser);

          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500); // Small delay for UX
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An unexpected error occurred.");
      } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      }
    }

    open() {
      if (this.overlay) {
        this.overlay.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
      }
    }

    close() {
      if (this.overlay) {
        this.overlay.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }
    }

    attachGlobalTriggers() {
      // Event Delegation: Listen for clicks on the document and check if they target our buttons
      // This works even if the buttons are added dynamically later (e.g., inside hero.html)
      document.body.addEventListener("click", (e) => {
        // Check for specific IDs or classes
        // Use .closest() in case the click hits an icon inside the button
        const targetBtn = e.target.closest("#login-btn, #get-started-btn");

        if (targetBtn) {
          e.preventDefault();
          this.open();
        }
      });
    }
  }

  // Initialize
  const loginManager = new LoginModalManager();
  loginManager.init();

  // Inject CSS for animation if not present
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
});
