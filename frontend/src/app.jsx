import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./components/dashboard.jsx";
import Quarterly from "./components/Quarterly.jsx";
import Weekly from "./components/weekly.jsx";
import Login from "./components/login.jsx";
import Signup from "./components/signup.jsx";
import "./styles/app.css";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status", {
        credentials: "include",
      });
      const data = await res.json();
      setIsLoggedIn(data.authenticated);
      setLoading(false);

      // Redirect to login if not authenticated and trying to access protected routes
      const protectedRoutes = ["/dashboard", "/quarterly", "/weekly"];
      if (!data.authenticated && protectedRoutes.includes(location.pathname)) {
        navigate("/login");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setIsLoggedIn(false);
        localStorage.removeItem("userId");
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed");
    }
  };

  const hideNav =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/";

  if (loading) {
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Navigation */}
      {!hideNav && isLoggedIn && (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <div className="nav-container">
            <h1 className="logo">Alignify</h1>
            <div className="nav-links" role="menubar">
              <Link to="/dashboard" className="nav-link" role="menuitem">
                Dashboard
              </Link>
              <Link to="/quarterly" className="nav-link" role="menuitem">
                Quarterly Goals
              </Link>
              <Link to="/weekly" className="nav-link" role="menuitem">
                Weekly Plans
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link logout-btn"
                role="menuitem"
                aria-label="Logout from application"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Routes */}
      <main
        id="main-content"
        className="main-content"
        role="main"
        tabIndex="-1"
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quarterly" element={<Quarterly />} />
          <Route path="/weekly" element={<Weekly />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
