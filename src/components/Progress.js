// src/components/Progress.js

import React from 'react';
import './Progress.css';

function Progress({ current, total, score }) {
  return (
    <div className="progress-container">
      <div className="progress-item">
        <strong>Question:</strong> {current} / {total}
      </div>
      <div className="progress-item">
        <strong>Score:</strong> {score}
      </div>
    </div>
  );
}

export default Progress;
