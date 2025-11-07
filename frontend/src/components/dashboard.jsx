import React from "react";
import PropTypes from "prop-types";
import { mockQuarterlyGoals, mockWeeklyTasks } from "../utils/mockData.js";
import GoalCard from "./goalcard.jsx";
import "../styles/dashboard.css";

/**
 * Dashboard Component
 * Shows overall progress and displays recent goals and upcoming tasks
 */
function Dashboard() {
  // Get active goals only
  const activeGoals = mockQuarterlyGoals.filter(goal => goal.status === "active");
  
  const today = new Date().toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  // Calculate overall progress (average of all active goals)
  const overallProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length)
    : 0;

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{today}</p>
      </div>

      {/* Progress Overview */}
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
          <h3>Tasks This Week</h3>
          <div className="stat-value">{mockWeeklyTasks.length}</div>
          <p className="stat-label">Planned</p>
        </div>
      </div>

      {/* Active Goals Section */}
      <section className="dashboard-section">
        <h2 className="section-title">Active Quarterly Goals</h2>
        <div className="goals-grid">
          {activeGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <button className="action-btn">+ New Goal</button>
          <button className="action-btn">Plan This Week</button>
          <button className="action-btn">Daily Reflection</button>
        </div>
      </section>
    </div>
  );
}


Dashboard.propTypes = {};

export default Dashboard;