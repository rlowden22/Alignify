import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GoalCard from "./goalcard.jsx";
import Modal from "./modal.jsx";
import "../styles/quarterly.css";

function Quarterly() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingGoal, setEditingGoal] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    horizon: "quarter",
    startDate: "",
    endDate: "",
    status: "active"
  });

  const fetchGoals = () => {
    setLoading(true);
    fetch("/api/goals")
      .then(res => res.json())
      .then(data => {
        setGoals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching goals:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle creating new goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingGoal 
        ? `/api/goals/${editingGoal._id}` 
        : "/api/goals";
      
      const method = editingGoal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchGoals();
        setFormData({
          title: "",
          description: "",
          horizon: "quarter",
          startDate: "",
          endDate: "",
          status: "active"
        });
        setEditingGoal(null);
        setIsModalOpen(false);
        alert(editingGoal ? "Goal updated!" : "Goal created!");
      } else {
        alert("Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Error saving goal");
    }
  };

  // Handle edit button click
  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      horizon: goal.horizon,
      startDate: new Date(goal.startDate).toISOString().split('T')[0],
      endDate: new Date(goal.endDate).toISOString().split('T')[0],
      status: goal.status
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (goalId) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchGoals();
        alert("Goal deleted successfully!");
      } else {
        alert("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Error deleting goal");
    }
  };

  const filteredGoals = filterStatus === "all" 
    ? goals 
    : goals.filter(goal => goal.status === filterStatus);

  if (loading) {
    return <div className="quarterly-page"><p>Loading goals...</p></div>;
  }

  return (
    <div className="quarterly-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quarterly Goals</h1>
          <p className="page-subtitle">Manage your long-term objectives</p>
        </div>
        <button 
          className="add-goal-btn"
          onClick={() => {
            setEditingGoal(null);
            setFormData({
              title: "",
              description: "",
              horizon: "quarter",
              startDate: "",
              endDate: "",
              status: "active"
            });
            setIsModalOpen(true);
          }}
        >
          + New Goal
        </button>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          All ({goals.length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
          onClick={() => setFilterStatus("active")}
        >
          Active ({goals.filter(g => g.status === "active").length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
          onClick={() => setFilterStatus("completed")}
        >
          Completed ({goals.filter(g => g.status === "completed").length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === "paused" ? "active" : ""}`}
          onClick={() => setFilterStatus("paused")}
        >
          Paused ({goals.filter(g => g.status === "paused").length})
        </button>
      </div>

      <div className="goals-grid">
        {filteredGoals.map(goal => (
          <GoalCard 
            key={goal._id} 
            goal={goal}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? "Edit Goal" : "Create New Goal"}
      >
        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="title">Goal Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Learn React.js"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe your goal..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="horizon">Horizon</label>
              <select
                id="horizon"
                name="horizon"
                value={formData.horizon}
                onChange={handleInputChange}
              >
                <option value="quarter">Quarter (3 months)</option>
                <option value="month">Month</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingGoal(null);
              }} 
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingGoal ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

Quarterly.propTypes = {};

export default Quarterly;