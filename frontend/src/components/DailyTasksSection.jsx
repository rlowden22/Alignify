import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../styles/daily.css";

function DailyTasksSection({ planId }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  // Convert planId to string if it's an ObjectId
  const planIdString = typeof planId === "object" ? planId.toString() : planId;

  // Fetch daily tasks from backend
  const fetchDailyTasks = async () => {
    try {
      const res = await fetch(
        `/api/daily?weeklyPlanId=${planIdString}`,
        {
          credentials: "include", // Session authentication
        }
      );

      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Server returned " + res.status);
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching daily tasks:", err);
      setError("Could not load daily tasks");
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchDailyTasks();
  }, [planIdString]);

  // Add new daily task
  const handleAddTask = async (dayName) => {
    const taskText = prompt(`Add a new task for ${dayName}:`);
    if (!taskText || !taskText.trim()) return;

    try {
      const res = await fetch("/api/daily/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include session cookie
        body: JSON.stringify({
          weeklyPlanId: planIdString,
          dayName,
          text: taskText.trim(),
        }),
      });

      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to add task");
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error adding daily task:", err);
      alert("Could not add task");
    }
  };

  // Toggle task completion
  const handleToggleTask = async (dayName, taskIndex, currentDone) => {
    try {
      // Optimistic UI update
      const updatedTasks = tasks.map((d) => {
        if (d.dayName === dayName) {
          const newItems = [...d.taskItems];
          newItems[taskIndex] = { ...newItems[taskIndex], done: !currentDone };
          return { ...d, taskItems: newItems };
        }
        return d;
      });
      setTasks(updatedTasks);

      // Persist to backend
      const res = await fetch(`/api/daily/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include session cookie
        body: JSON.stringify({
          weeklyPlanId: planIdString,
          dayName,
          taskIndex,
        }),
      });

      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        // Revert on failure
        fetchDailyTasks();
        throw new Error("Failed to toggle task");
      }
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  // Delete a specific task
  const handleDeleteTask = async (dayId, taskIndex) => {
    if (!confirm("Delete this task?")) return;

    try {
      const res = await fetch(`/api/daily/${dayId}/task/${taskIndex}`, {
        method: "DELETE",
        credentials: "include", // Include session cookie
      });

      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      // Refresh tasks after deletion
      fetchDailyTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Could not delete task");
    }
  };

  if (error) {
    return (
      <div className="daily-tasks-section">
        <h4>Daily Tasks</h4>
        <p className="empty-task">{error}</p>
      </div>
    );
  }

  return (
    <div className="daily-tasks-section">
      <h4>Daily Tasks</h4>
      <div className="daily-tasks-grid">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
          (dayName) => {
            const dayData = tasks.find((d) => d.dayName === dayName);

            return (
              <div key={dayName} className="daily-day">
                <strong>{dayName}</strong>
                <ul className="task-list">
                  {dayData &&
                  dayData.taskItems &&
                  dayData.taskItems.length > 0 ? (
                    dayData.taskItems.map((task, i) => (
                      <li key={i} className={task.done ? "done" : ""}>
                        <label>
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() =>
                              handleToggleTask(dayName, i, task.done)
                            }
                          />
                          <span>{task.text}</span>
                        </label>
                        <button
                          className="delete-task-btn"
                          onClick={() =>
                            handleDeleteTask(dayData._id, i)
                          }
                          title="Delete task"
                        >
                          ×
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="empty-task">No tasks yet.</p>
                  )}
                </ul>
                <button
                  className="add-daily-task-btn"
                  onClick={() => handleAddTask(dayName)}
                >
                  + Add Task
                </button>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

DailyTasksSection.propTypes = {
  planId: PropTypes.string.isRequired,
};

export default DailyTasksSection;