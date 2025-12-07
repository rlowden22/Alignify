import React, { useState } from "react";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {  // Changed from /auth/login
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ADDED: Enable cookies
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // Don't store userId anymore - session handles it
        localStorage.removeItem("userId"); // Clean up old auth
        window.location.href = "/dashboard";
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch {
      setMessage("Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Welcome back to Alignify</p>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p className="auth-message">{message}</p>
        <p className="auth-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}


Login.propTypes = {};

export default Login;
