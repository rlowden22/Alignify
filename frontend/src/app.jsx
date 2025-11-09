import React, { useState } from "react";
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
import LogoutButton from "./components/LogoutButton.jsx";
import "./styles/app.css";

/**
 * Inner app logic separated from router
 */
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // ✅ Hide navbar on login and signup pages
  const hideNav =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/";

  return (
    <div className="app">
      {/* Only show navbar if NOT on login/signup */}
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
                Weekly Tasks
              </Link>
              {isLoggedIn && <LogoutButton />}
            </div>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard and subpages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quarterly" element={<Quarterly />} />
          <Route path="/weekly" element={<Weekly />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * BrowserRouter wraps the whole app — this keeps location in context
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
