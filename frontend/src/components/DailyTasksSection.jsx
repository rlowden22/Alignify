import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../styles/daily.css";

function DailyTasksSection({ planId }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  // Convert planId to string if it's an ObjectId
  const planIdString = typeof planId === "object" ? planId.toString() : planId;

  // Fetch daily tasks from backend
  const fetchDailyTasks = async () => {
    try {
      const res = await fetch(
        `/api/daily?userId=${userId}&weeklyPlanId=${planIdString}`
      );
      if (!res.ok) throw new Error("Server returned " + res.status);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching daily tasks:", err);
      setError("Could not load daily tasks");
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchDailyTasks();
  }, [planIdString, userId]);

  // Add new daily task
  const handleAddTask = async (dayName) => {
    const taskText = prompt(`Add a new task for ${dayName}:`);
    if (!taskText || !taskText.trim()) return;

    try {
      const res = await fetch("/api/daily/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          weeklyPlanId: planIdString,
          dayName,
          text: taskText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add task");

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
        body: JSON.stringify({
          userId,
          weeklyPlanId: planIdString,
          dayName,
          taskIndex,
        }),
      });

      if (!res.ok) {
        // Revert on failure
        fetchDailyTasks();
        throw new Error("Failed to toggle task");
      }
    } catch (err) {
      console.error("Error toggling task:", err);
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
                          {task.text}
                        </label>
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
