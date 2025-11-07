import React, { useState } from "react";
import PropTypes from "prop-types";
import { mockQuarterlyGoals } from "../utils/mockData.js";
import GoalCard from "./goalcard.jsx";
import Modal from "./modal.jsx";
import "../styles/quarterly.css";

/**
 * Quarterly Component
 * Displays quarterly goals with add, edit, update, delete buttons
 * Includes pop-ups to see more details about each goal
 */
function Quarterly() {
  const [goals, setGoals] = useState(mockQuarterlyGoals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter goals based on selected status
  const filteredGoals = filterStatus === "all" 
    ? goals 
    : goals.filter(goal => goal.status === filterStatus);

  return (
    <div className="quarterly-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quarterly Goals</h1>
          <p className="page-subtitle">Manage your 4-months objectives</p>
        </div>
        <button 
          className="add-goal-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + New Goal
        </button>
      </div>

      {/* Filter Buttons */}
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

      {/* Goals Grid */}
      <div className="goals-grid">
        {filteredGoals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {/* Add Goal Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Goal"
      >
        <p>Add goal form will go here!</p>
      </Modal>
    </div>
  );
}

Quarterly.propTypes = {};

export default Quarterly;