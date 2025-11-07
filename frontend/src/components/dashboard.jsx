import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GoalCard from "./goalcard.jsx";
import "../styles/dashboard.css";

/**
 * Dashboard Component
 * Shows overall progress and displays recent goals and upcoming tasks
 */
function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch goals from backend on component mount
  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => {
        setGoals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching goals:", err);
        setError("Failed to load goals");
        setLoading(false);
      });
  }, []);

  // Get active goals only
  const activeGoals = goals.filter((goal) => goal.status === "active");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate overall progress
  const overallProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((sum, goal) => sum + goal.progress, 0) /
            activeGoals.length,
        )
      : 0;

  // Loading state
  if (loading) {
    return (
      <div className="dashboard">
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{today}</p>
      </div>

      <div className="progress-overview">
        <div className="stat-card">
          <h3>Overall Progress</h3>
          <div className="progress-circle">
            <span className="progress-value">{overallProgress}%</span>
          </div>
        </div>
        <div className="stat-card">
          <h3>Active Goals</h3>
          <div className="stat-value">{activeGoals.length}</div>
          <p className="stat-label">In Progress</p>
        </div>
        <div className="stat-card">
          <h3>Total Goals</h3>
          <div className="stat-value">{goals.length}</div>
          <p className="stat-label">All Time</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2 className="section-title">Active Quarterly Goals</h2>
        <div className="goals-grid">
          {activeGoals.slice(0, 6).map((goal) => (
            <GoalCard key={goal._id} goal={goal} />
          ))}
        </div>
      </section>
    </div>
  );
}

Dashboard.propTypes = {};

export default Dashboard;
