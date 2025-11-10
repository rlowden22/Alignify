import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "./components/dashboard.jsx";
import Quarterly from "./components/Quarterly.jsx";
import Weekly from "./components/weekly.jsx";
import Login from "./components/login.jsx";
import Signup from "./components/signup.jsx";
import "./styles/app.css";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userId")
  );
  const location = useLocation();

  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem("userId"));
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const hideNav =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/";

  return (
    <div className="app">
      {/* Navigation */}
      {!hideNav && (
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">Alignify</h1>
            <div className="nav-links">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/quarterly" className="nav-link">
                Quarterly Goals
              </Link>
              <Link to="/weekly" className="nav-link">
                Weekly Plans
              </Link>
              <Link to="/login" className="nav-link">
                Logout
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Routes */}
      <main className="main-content">
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
