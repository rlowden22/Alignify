import React from "react";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch("/auth/logout", { method: "POST" });
      // Redirect to login page after logout
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <button className="nav-link logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
}
