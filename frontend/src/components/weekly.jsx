import React, { useState } from "react";
import PropTypes from "prop-types";
import { mockWeeklyTasks, mockQuarterlyGoals } from "../utils/mockData.js";
import "../styles/weekly.css";

/**
 * Weekly Component
 * Displays tasks for current week, links to quarterly goals
 * Includes weekly planning and task management
 */
function Weekly() {
  const [weeklyTasks, setWeeklyTasks] = useState(mockWeeklyTasks);

  // Get current week start date
  const getCurrentWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  };

  const weekStart = getCurrentWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return (
    <div className="weekly-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Plan</h1>
          <p className="page-subtitle">
            Week of {weekStart.toLocaleDateString()} -{" "}
            {weekEnd.toLocaleDateString()}
          </p>
        </div>
        <button className="add-task-btn">+ New Task</button>
      </div>

      {/* Weekly Tasks */}
      {weeklyTasks.map((weekPlan) => {
        const linkedGoal = mockQuarterlyGoals.find(
          (g) => g.id === weekPlan.goalId,
        );

        return (
          <div key={weekPlan.id} className="week-plan-card">
            {/* Linked Goal */}
            {linkedGoal && (
              <div className="linked-goal">
                <span className="link-label">Linked to:</span>
                <span className="goal-link">{linkedGoal.title}</span>
              </div>
            )}

            {/* Priorities */}
            <div className="priorities-section">
              <h3>Weekly Priorities</h3>
              <ul className="priorities-list">
                {weekPlan.priorities.map((priority, index) => (
                  <li key={index}>{priority}</li>
                ))}
              </ul>
            </div>

            {/* Tasks List */}
            <div className="tasks-section">
              <h3>Tasks</h3>
              <ul className="tasks-list">
                {weekPlan.tasks.map((task) => (
                  <li
                    key={task.id}
                    className={task.completed ? "completed" : ""}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                    />
                    <span className="task-description">{task.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}

      {/* Reflection Section */}
      <div className="reflection-card">
        <h3>Weekly Reflection</h3>
        <p className="reflection-prompt">What went well this week?</p>
        <button className="reflection-btn">Add Reflection</button>
      </div>
    </div>
  );
}

Weekly.propTypes = {};

export default Weekly;
