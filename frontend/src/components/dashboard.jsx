import React, { useState, useEffect } from "react";
import GoalCard from "./goalcard.jsx";
import "../styles/dashboard.css";

function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // No more userId needed!
    fetch(`/api/goals`, {
      credentials: "include", // ADDED
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to fetch goals");
        }
        return res.json();
      })
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

  const activeGoals = goals.filter((goal) => goal.status === "active");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const overallProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce(
            (sum, goal) => sum + (Number(goal.progress) || 0),
            0
          ) / activeGoals.length
        )
      : 0;

  if (loading)
    return (
      <div className="dashboard">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="dashboard">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{today}</p>
      </div>

      <div className="progress-overview">
        <div className="stat-card">
          <h2>Overall Progress</h2>
          <div className="progress-circle">
            <span className="progress-value">{overallProgress}%</span>
          </div>
        </div>
        <div className="stat-card">
          <h2>Active Goals</h2>
          <div className="stat-value">{activeGoals.length}</div>
          <p className="stat-label">In Progress</p>
        </div>
        <div className="stat-card">
          <h2>Total Goals</h2>
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
