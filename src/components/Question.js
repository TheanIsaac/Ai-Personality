// src/components/Question.js

import React from 'react';
import './Question.css';

function Question({ question }) {
  return (
    <div className="question-container">
      <h2>Question:</h2>
      <p>{question}</p>
    </div>
  );
}

export default Question;
