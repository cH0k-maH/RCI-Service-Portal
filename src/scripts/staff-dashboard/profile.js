window.initProfile = function () {
    console.log("Staff Profile initialized");
    const profileUpload = document.getElementById("profile-upload");
    const previewImg = document.getElementById("profile-preview-img");
    const initialsSpan = document.getElementById("profile-initials");
    const topbarAvatar = document.getElementById("topbar-avatar-img");
    const topbarInitials = document.getElementById("topbar-initials");

    const nameInput = document.getElementById("prof-name");
    const roleInput = document.getElementById("prof-role");
    const emailInput = document.getElementById("prof-email");

    const nameDisplay = document.getElementById("profile-name-display");
    const roleDisplay = document.getElementById("profile-role-display");

    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("staffType") || "Staff";
    const userEmail = localStorage.getItem("userEmail") || "";

    // Load Data
    if (nameInput) nameInput.value = userName;
    if (roleInput) roleInput.value = userRole.toUpperCase();
    if (emailInput) emailInput.value = userEmail;

    if (nameDisplay) nameDisplay.textContent = userName;
    if (roleDisplay) roleDisplay.textContent = userRole;

    if (window.UserService && initialsSpan) {
        initialsSpan.textContent = window.UserService.getInitials(userName);
    }

    const savedPic = localStorage.getItem("userProfilePic");
    if (savedPic) {
        if (previewImg) {
            previewImg.src = savedPic;
            previewImg.classList.remove("hidden");
        }
        if (initialsSpan) initialsSpan.classList.add("hidden");
    }

    // Handle Upload
    if (profileUpload) {
        profileUpload.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;

                    // Update Page Elements
                    if (previewImg) {
                        previewImg.src = dataUrl;
                        previewImg.classList.remove("hidden");
                    }
                    if (initialsSpan) initialsSpan.classList.add("hidden");

                    // Update Topbar
                    if (topbarAvatar) {
                        topbarAvatar.src = dataUrl;
                        topbarAvatar.classList.remove("hidden");
                    }
                    if (topbarInitials) topbarInitials.classList.add("hidden");

                    // Sync to LocalStorage (Persistent for demo)
                    localStorage.setItem("userProfilePic", dataUrl);
                    window.ToastService.success("Profile picture updated!");
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // Form Submit (Just feedback for now)
    const form = document.getElementById("profile-form");
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            window.ToastService.success("Profile settings updated!");
        };
    }
};
