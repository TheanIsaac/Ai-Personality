// src/App.js

import React, { useState, useEffect } from 'react';
import StartSession from './components/StartSession';
import Question from './components/Question';
import AudioRecorder from './components/AudioRecorder';
import Progress from './components/Progress';
import Completion from './components/Completion';
import './App.css';

function App() {
  const [userId, setUserId] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [facetScores, setFacetScores] = useState({});
  const [domainScores, setDomainScores] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');

  // Debugging: Log facetScores and domainScores whenever they change
  useEffect(() => {
    console.log('facetScores updated:', facetScores);
  }, [facetScores]);

  useEffect(() => {
    console.log('domainScores updated:', domainScores);
  }, [domainScores]);

  // Start a new session
  const handleStartSession = async (enteredUserId) => {
    try {
      setError('');
      console.log('Starting session with userId:', enteredUserId); // Debug log

      const response = await fetch('http://localhost:4000/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: enteredUserId }),
      });

      const data = await response.json();
      console.log('Start session response:', data); // Debug log

      if (response.ok) {
        setUserId(enteredUserId);
        setSessionStarted(true);
        setCurrentQuestion(data.question);
        setTotalQuestions(data.totalQuestions);
        setQuestionNumber(data.questionNumber);
        setFacetScores({});     // Initialize facetScores
        setDomainScores({});    // Initialize domainScores
      } else {
        setError(data.error || 'Failed to start session.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while starting the session.');
    }
  };

  // Handle response submission
  const handleResponse = (responseData) => {
    if (responseData.error) {
      setError(responseData.error);
      return;
    }

    if (responseData.message === 'All questions completed.') {
      setFacetScores(responseData.facetScores || {});      // Set facetScores or default to {}
      setDomainScores(responseData.domainScores || {});    // Set domainScores or default to {}
      setIsCompleted(true);
    } else if (responseData.nextQuestion) {
      setCurrentQuestion(responseData.nextQuestion);
      setQuestionNumber(responseData.questionNumber);
      setTotalQuestions(responseData.totalQuestions);
      setFacetScores(responseData.facetScores);   // Update facetScores
      console.log('responseData.facetScores:', responseData.facetScores); // Debug log
      // Optionally, update domainScores if provided
      if (responseData.domainScores) {
        setDomainScores(responseData.domainScores);
      }
    } else {
      setError('Unexpected response from server.');
    }
  };

  return (
    <div className="app-container">
      <h1>Personality Test</h1>
      {error && <div className="error">{error}</div>}
      
      {/* Render StartSession if session hasn't started and not completed */}
      {!sessionStarted && !isCompleted && (
        <StartSession onStart={handleStartSession} />
      )}
      
      {/* Render Question and AudioRecorder if session started and not completed */}
      {sessionStarted && currentQuestion && !isCompleted && (
        <div>
          <Progress
            current={questionNumber}
            total={totalQuestions}
          />
          <Question question={currentQuestion.question} />
          <AudioRecorder userId={userId} onResponse={handleResponse} />
        </div>
      )}
      
      {/* Render Completion component with facetScores and domainScores when completed */}
      {isCompleted && <Completion facetScores={facetScores} domainScores={domainScores} />}
    </div>
  );
}

export default App;
