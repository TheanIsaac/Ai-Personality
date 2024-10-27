// src/components/StartSession.js

import React, { useState } from 'react';
import './StartSession.css';

function StartSession({ onStart }) {
  const [userIdInput, setUserIdInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userIdInput.trim() !== '') {
      onStart(userIdInput.trim());
    }
  };

  return (
    <div className="start-session">
      <form onSubmit={handleSubmit}>
        <label htmlFor="userId">Enter Your User ID:</label>
        <input
          type="text"
          id="userId"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          required
          placeholder="e.g., user123"
        />
        <button type="submit">Start Test</button>
      </form>
    </div>
  );
}

export default StartSession;
