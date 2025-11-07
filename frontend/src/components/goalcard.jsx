import React from "react";
import PropTypes from "prop-types";
import "../styles/goalcard.css";

/**
 * GoalCard Component
 * Reusable visual box for displaying a goal which is used on Dashboard and Quarterly pages
 */

function GoalCard({ goal }) {
  
  const getStatusColor = (status) => {
    switch(status) {
      case "active": return "#3498db";
      case "completed": return "#2ecc71";
      case "paused": return "#95a5a6";
      default: return "#7f8c8d";
    }
  };

  return (
    <div className="goal-card">
      {/* Status Badge */}
      <div 
        className="status-badge" 
        style={{ backgroundColor: getStatusColor(goal.status) }}
      >
        {goal.status}
      </div>

      {/* Goal Content */}
      <h3 className="goal-title">{goal.title}</h3>
      <p className="goal-description">{goal.description}</p>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span>Progress</span>
          <span className="progress-percent">{goal.progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Dates */}
      <div className="goal-dates">
        <span className="date-label">Start:</span>
        <span>{new Date(goal.startDate).toLocaleDateString()}</span>
        <span className="date-label">End:</span>
        <span>{new Date(goal.endDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// PropTypes validation
GoalCard.propTypes = {
  goal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired
  }).isRequired
};

export default GoalCard;