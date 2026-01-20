/**
 * DomLoader
 * Utility for dynamically loading HTML fragments into the DOM.
 */
class DomLoader {
    /**
     * Load an HTML file into a target element.
     * @param {string} targetSelector - CSS selector for the container (e.g., "#navbar")
     * @param {string} filePath - Path to the HTML file (e.g., "./src/pages/nav.html")
     * @returns {Promise<HTMLElement>} - The container element after loading
     */
    static async loadComponent(targetSelector, filePath) {
        const container = document.querySelector(targetSelector);
        if (!container) {
            console.warn(`DomLoader: Target '${targetSelector}' not found.`);
            return null;
        }

        try {
            // Append a timestamp to prevent caching during development
            const cacheBust = `?t=${new Date().getTime()}`;
            const response = await fetch(filePath + cacheBust);

            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }

            const html = await response.text();
            container.innerHTML = html;

            // Dispatch a custom event to notify that content has loaded
            const eventName = `loaded:${targetSelector.replace('#', '')}`; // e.g., "loaded:navbar"
            document.dispatchEvent(new CustomEvent(eventName, { detail: { container } }));

            return container;
        } catch (error) {
            console.error(`DomLoader Error:`, error);
            container.innerHTML = `<div class="text-red-500 p-4">Error loading content.</div>`;
            return null;
        }
    }

    /**
     * Create a generic modal container if one doesn't exist.
     * @param {string} id - The ID for the container (default: "modal-overlays")
     * @returns {HTMLElement}
     */
    static createContainer(id = "modal-overlays") {
        let container = document.getElementById(id);
        if (!container) {
            container = document.createElement("div");
            container.id = id;
            document.body.appendChild(container);
        }
        return container;
    }
}

// Expose globally
window.DomLoader = DomLoader;
