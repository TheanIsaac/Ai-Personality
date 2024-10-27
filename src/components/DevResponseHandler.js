// src/components/DevResponseHandler.js

import React, { useState, useEffect } from 'react';
import './DevResponseHandler.css'; // Optional: For styling

function DevResponseHandler({ sessionId, onResponse, currentQuestionNumber, totalQuestions }) {
  const [manualResponse, setManualResponse] = useState('');
  const [manualScore, setManualScore] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(currentQuestionNumber - 1);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch current question based on questionIndex
    const fetchCurrentQuestion = async () => {
      try {
        const response = await fetch(`http://localhost:4000/retrieve-session/${sessionId}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (response.ok) {
          setCurrentQuestion(data.questions[questionIndex].question);
        } else {
          setError(data.error || 'Failed to fetch current question.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching the current question.');
      }
    };

    fetchCurrentQuestion();
  }, [sessionId, questionIndex]);

  const handleSubmit = async () => {
    if (manualScore.trim() === '') {
      setError('Please enter a score between 1 and 5.');
      return;
    }

    const score = parseInt(manualScore, 10);
    if (isNaN(score) || score < 1 || score > 5) {
      setError('Score must be an integer between 1 and 5.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/submit-response', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          manualScore: score,
          manualResponse, // Optional: can be stored or used as needed
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        onResponse(data);
        setManualResponse('');
        setManualScore('');
        setError('');
      } else {
        setError(data.error || 'Failed to submit response.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while submitting your response.');
    }
  };

  const handleSkip = async () => {
    try {
      const response = await fetch(`http://localhost:4000/next-question/${sessionId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        onResponse(data);
        setManualResponse('');
        setManualScore('');
        setError('');
      } else {
        setError(data.error || 'Failed to skip question.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while skipping the question.');
    }
  };

  const handleBack = async () => {
    if (questionIndex === 0) {
      setError('Already at the first question.');
      return;
    }

    const newIndex = questionIndex - 1;

    try {
      const response = await fetch(`http://localhost:4000/retrieve-session/${sessionId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setQuestionIndex(newIndex);
        setError('');
      } else {
        setError(data.error || 'Failed to navigate to previous question.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while navigating to the previous question.');
    }
  };

  // Handle keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleSkip();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className="dev-response-handler-container">
      <h3>Dev Mode: Manual Response Input</h3>
      <p>Question {currentQuestionNumber} of {totalQuestions}:</p>
      <p>{currentQuestion}</p>
      
      <textarea
        placeholder="Type your response here..."
        value={manualResponse}
        onChange={(e) => setManualResponse(e.target.value)}
        rows="4"
        cols="50"
      ></textarea>
      
      <input
        type="number"
        placeholder="Enter score (1-5)"
        value={manualScore}
        onChange={(e) => setManualScore(e.target.value)}
        min="1"
        max="5"
      />
      
      <div className="dev-buttons">
        <button onClick={handleBack}>← Back</button>
        <button onClick={handleSkip}>Skip →</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default DevResponseHandler;
