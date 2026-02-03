// src/scripts/client-dashboard/profile.js

window.initProfile = function () {
    console.log("Profile Settings initialized");

    const avatarInput = document.getElementById("avatar-input");
    const preview = document.getElementById("profile-preview");
    const topbarAvatar = document.getElementById("profile-img");
    const nameInput = document.getElementById("prof-name");
    const emailInput = document.getElementById("prof-email");

    // Load current data
    nameInput.value = localStorage.getItem("userName") || "";
    emailInput.value = localStorage.getItem("userEmail") || (localStorage.getItem("staffType") === 'dealer' ? 'dealer@partner.com' : 'customer@client.com');

    // Handle Image Preview
    if (avatarInput) {
        avatarInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    if (topbarAvatar) topbarAvatar.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // Handle Form Submit
    document.querySelector("form").onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem("userName", nameInput.value);

        // Update topbar name if exists
        const topbarName = document.getElementById("client-name");
        if (topbarName) topbarName.textContent = nameInput.value;

        window.ToastService.success("Profile updated successfully!");
    };
};
