// src/scripts/admin-dashboard/manage-users.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("Manage Users JS Loaded");

  const userRole = localStorage.getItem("userRole");

  // SECURITY CHECK
  if (userRole !== "admin") {
    alert("Access denied");
    return;
  }

  /* =========================
     ADD USER
  ========================== */
  const addUserBtn = document.getElementById("addUserBtn");

  if (addUserBtn) {
    addUserBtn.addEventListener("click", () => {
      alert(
        "ADD USER\n\n" +
        "• Name\n" +
        "• Email\n" +
        "• Role\n" +
        "• Branch\n\n" +
        "(Modal + backend API coming next)"
      );
    });
  }

  /* =========================
     EDIT USER
  ========================== */
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-user")) {
      alert(
        "EDIT USER\n\n" +
        "• Change role\n" +
        "• Change branch\n" +
        "• Reset password\n\n" +
        "(Backend controlled)"
      );
    }

    if (e.target.classList.contains("toggle-user")) {
      alert(
        "USER STATUS\n\n" +
        "• Activate / Deactivate\n" +
        "• Soft delete only\n\n" +
        "(Backend controlled)"
      );
    }
  });
});
