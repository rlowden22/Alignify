// displays tasks for current week, links to quarterly goals
// includes some sort of calendar
import React from "react";
import PropTypes from "prop-types";

/**
 * Weekly Component
 * Displays tasks for current week, links to quarterly goals
 */
function Weekly() {
  return (
    <div className="weekly-page">
      <div className="page-header">
        <h1 className="page-title">Weekly Plan</h1>
        <p className="page-subtitle">Plan your week ahead</p>
      </div>
      <p>Weekly planning page - Coming soon!</p>
    </div>
  );
}

Weekly.propTypes = {};

export default Weekly;