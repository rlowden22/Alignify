import React from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Link,
} from "react-router-dom";
import Dashboard from "./components/dashboard.jsx";
import Quarterly from "./components/Quarterly.jsx";
import Weekly from "./components/weekly.jsx";
import "./styles/app.css";

/**
 * Main App Component
 * Controls navigation and Uses React Router for client-side routing
 */

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">Alignify</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                Dashboard
              </Link>
              <Link to="/quarterly" className="nav-link">
                Quarterly Goals
              </Link>
              <Link to="/weekly" className="nav-link">
                Weekly Tasks
              </Link>
            </div>
          </div>
        </nav>

        {/* Route Definitions */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quarterly" element={<Quarterly />} />
            <Route path="/weekly" element={<Weekly />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
