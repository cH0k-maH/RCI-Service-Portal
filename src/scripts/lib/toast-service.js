/**
 * Toast Service
 * A simple, premium notification system to replace browser alerts.
 */
class ToastService {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.injectStyles();
        // Create container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success', 'error', 'info', 'warning'
     * @param {number} duration - Auto-hide duration in ms (default 4000)
     */
    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');

        // Base Styling
        toast.className = `
            toast-item pointer-events-auto min-w-[300px] max-w-md 
            px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between
            transform transition-all duration-300 ease-out opacity-0 translate-x-12
            border-l-4 backdrop-blur-md
        `;

        // Type Specific Styling
        let icon = 'fa-info-circle';
        let colors = '';

        switch (type) {
            case 'success':
                colors = 'bg-green-50/90 border-green-500 text-green-800';
                icon = 'fa-check-circle';
                break;
            case 'error':
                colors = 'bg-red-50/90 border-red-500 text-red-800';
                icon = 'fa-exclamation-circle';
                break;
            case 'warning':
                colors = 'bg-yellow-50/90 border-yellow-500 text-yellow-800';
                icon = 'fa-exclamation-triangle';
                break;
            default:
                colors = 'bg-blue-50/90 border-blue-500 text-blue-800';
                icon = 'fa-info-circle';
        }

        toast.className += ` ${colors}`;

        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas ${icon} text-lg"></i>
                <span class="text-sm font-medium">${message}</span>
            </div>
            <button class="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Animate In
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-x-12');
            toast.classList.add('opacity-100', 'translate-x-0');
        });

        // Close logic
        const closeBtn = toast.querySelector('button');
        const removeToast = () => {
            toast.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                if (toast.parentElement) {
                    this.container.removeChild(toast);
                }
            }, 300);
        };

        closeBtn.onclick = removeToast;

        // Auto-hide
        if (duration > 0) {
            setTimeout(removeToast, duration);
        }
    }

    success(msg, duration) { this.show(msg, 'success', duration); }
    error(msg, duration) { this.show(msg, 'error', duration); }
    info(msg, duration) { this.show(msg, 'info', duration); }
    warning(msg, duration) { this.show(msg, 'warning', duration); }

    injectStyles() {
        if (document.getElementById('toast-styles')) return;
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            #toast-container {
                z-index: 9999;
                perspective: 1000px;
            }
            .toast-item {
                animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes toast-in {
                from { opacity: 0; transform: translateX(50px) scale(0.9); }
                to { opacity: 1; transform: translateX(0) scale(1); }
            }
            .toast-item.scale-95 {
                transform: scale(0.95);
                opacity: 0;
                transition: all 0.3s ease-in;
            }
        `;
        document.head.appendChild(style);
    }
}

// Global instance
window.ToastService = new ToastService();
