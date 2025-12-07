import React from "react";
import PropTypes from "prop-types";
import "../styles/goalcard.css";

/**
 * GoalCard Component
 * Reusable visual box for displaying a goal
 */
function GoalCard({ goal, onEdit, onDelete, showActions }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#0077CC";
      case "completed":
        return "#1B7A4A";
      case "paused":
        return "#A36800";
      default:
        return "#475467";
    }
  };

  return (
    <div className="goal-card">
      <div
        className="status-badge"
        style={{ backgroundColor: getStatusColor(goal.status) }}
      >
        {goal.status}
      </div>

      <h3 className="goal-title">{goal.title}</h3>
      <p className="goal-description">{goal.description}</p>

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

      <div className="goal-dates">
        <span className="date-label">Start:</span>
        <span>{new Date(goal.startDate).toLocaleDateString()}</span>
        <span className="date-label">End:</span>
        <span>{new Date(goal.endDate).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons - Only show if showActions prop is true */}
      {showActions && (
        <div className="goal-actions">
          <button className="edit-btn" onClick={() => onEdit(goal)}>
            Edit
          </button>
          <button className="delete-btn" onClick={() => onDelete(goal._id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

GoalCard.propTypes = {
  goal: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
};

GoalCard.defaultProps = {
  showActions: false,
  onEdit: () => {},
  onDelete: () => {},
};

export default GoalCard;
