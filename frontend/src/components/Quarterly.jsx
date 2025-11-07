// displays quarterly goals and has add, edit, update, delete buttons
//includes pop ups to see more details about each goal
import React from "react";
import PropTypes from "prop-types";

/**
 * Quarterly Component
 * Displays quarterly goals with add, edit, update, delete buttons
 */
function Quarterly() {
  return (
    <div className="quarterly-page">
      <div className="page-header">
        <h1 className="page-title">Quarterly Goals</h1>
        <p className="page-subtitle">Manage your long-term objectives</p>
      </div>
      <p>Quarterly goals page - Coming soon!</p>
    </div>
  );
}

Quarterly.propTypes = {};

export default Quarterly;