import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "./modal.jsx";
import "../styles/weekly.css";

/**
 * Weekly Component  
 * Full CRUD operations for weekly plans
 */
function Weekly() {
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [formData, setFormData] = useState({
    weekStartDate: "",
    goalIds: [],
    priorities: ["", ""],
    reflectionNotes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, goalsRes] = await Promise.all([
        fetch("/api/weekly"),
        fetch("/api/goals")
      ]);
      
      const plansData = await plansRes.json();
      const goalsData = await goalsRes.json();
      
      setWeeklyPlans(plansData);
      setGoals(goalsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (index, value) => {
    const newPriorities = [...formData.priorities];
    newPriorities[index] = value;
    setFormData(prev => ({
      ...prev,
      priorities: newPriorities
    }));
  };

  const handleGoalSelection = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goalIds: prev.goalIds.includes(goalId)
        ? prev.goalIds.filter(id => id !== goalId)
        : [...prev.goalIds, goalId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingPlan ? `/api/weekly/${editingPlan._id}` : "/api/weekly";
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          priorities: formData.priorities.filter(p => p.trim() !== "")
        })
      });

      if (response.ok) {
        fetchData();
        setFormData({
          weekStartDate: "",
          goalIds: [],
          priorities: ["", ""],
          reflectionNotes: ""
        });
        setEditingPlan(null);
        setIsModalOpen(false);
        alert(editingPlan ? "Plan updated!" : "Plan created!");
      } else {
        alert("Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Error saving plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      weekStartDate: new Date(plan.weekStartDate).toISOString().split('T')[0],
      goalIds: plan.goalIds?.map(id => id.toString()) || [],
      priorities: plan.priorities || ["", ""],
      reflectionNotes: plan.reflectionNotes || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (planId) => {
    if (!confirm("Delete this weekly plan?")) return;

    try {
      const response = await fetch(`/api/weekly/${planId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchData();
        alert("Weekly plan deleted!");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Failed to delete plan");
    }
  };

  const getCurrentWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  };

  const weekStart = getCurrentWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  if (loading) {
    return <div className="weekly-page"><p>Loading...</p></div>;
  }

  return (
    <div className="weekly-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Plan</h1>
          <p className="page-subtitle">
            Week of {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
          </p>
        </div>
        <button 
          className="add-task-btn"
          onClick={() => {
            setEditingPlan(null);
            setFormData({
              weekStartDate: "",
              goalIds: [],
              priorities: ["", ""],
              reflectionNotes: ""
            });
            setIsModalOpen(true);
          }}
        >
          + New Plan
        </button>
      </div>

      {weeklyPlans.length === 0 ? (
        <div className="empty-state">
          <p>No weekly plans yet. Create one to get started!</p>
        </div>
      ) : (
        weeklyPlans.map(plan => {
          const linkedGoals = plan.goalIds?.map(goalId => 
            goals.find(g => g._id === goalId.toString())
          ).filter(Boolean) || [];

          return (
            <div key={plan._id} className="week-plan-card">
              <div className="plan-header">
                <h3>Week of {new Date(plan.weekStartDate).toLocaleDateString()}</h3>
                <div className="plan-actions">
                  <button 
                    className="edit-plan-btn"
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-plan-btn"
                    onClick={() => handleDelete(plan._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {linkedGoals.length > 0 && (
                <div className="linked-goals-section">
                  <h4>Linked Goals:</h4>
                  <div className="linked-goals-list">
                    {linkedGoals.map(goal => (
                      <div key={goal._id} className="linked-goal">
                        <span className="goal-link">{goal.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.priorities && plan.priorities.length > 0 && (
                <div className="priorities-section">
                  <h4>Weekly Priorities</h4>
                  <ul className="priorities-list">
                    {plan.priorities.map((priority, index) => (
                      <li key={index}>{priority}</li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.reflectionNotes && (
                <div className="reflection-section">
                  <h4>Reflection</h4>
                  <p>{plan.reflectionNotes}</p>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Create/Edit Weekly Plan Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        title={editingPlan ? "Edit Weekly Plan" : "Create Weekly Plan"}
      >
        <form onSubmit={handleSubmit} className="weekly-form">
          <div className="form-group">
            <label htmlFor="weekStartDate">Week Start Date *</label>
            <input
              type="date"
              id="weekStartDate"
              name="weekStartDate"
              value={formData.weekStartDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Link to Goals (optional)</label>
            <div className="goals-checkbox-list">
              {goals.slice(0, 10).map(goal => (
                <label key={goal._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.goalIds.includes(goal._id)}
                    onChange={() => handleGoalSelection(goal._id)}
                  />
                  <span>{goal.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Weekly Priorities</label>
            <input
              type="text"
              placeholder="Priority 1"
              value={formData.priorities[0] || ""}
              onChange={(e) => handlePriorityChange(0, e.target.value)}
            />
            <input
              type="text"
              placeholder="Priority 2"
              value={formData.priorities[1] || ""}
              onChange={(e) => handlePriorityChange(1, e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reflectionNotes">Reflection Notes (optional)</label>
            <textarea
              id="reflectionNotes"
              name="reflectionNotes"
              value={formData.reflectionNotes}
              onChange={handleInputChange}
              placeholder="Reflect on your week..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingPlan(null);
              }} 
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingPlan ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

Weekly.propTypes = {};

export default Weekly;