// controllers/questionController.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { getSession, createSession, updateSession } = require('../utils/sessionManager');

let questions = [];

// Load questions from CSV at startup
function loadQuestions() {

  console.log('Loading questions from CSV...');
  
  const questionsPath = path.resolve(__dirname, '..', 'data', 'questionsMiniExtra.csv');
  console.log('Loading questions from:', questionsPath); // Log the path

  return new Promise((resolve, reject) => {
    fs.createReadStream(questionsPath)
      .pipe(csv())
      .on('data', (data) => {
        questions.push(data);
        console.log('Loaded question:', data); // Log each question as it's loaded
      })
      .on('end', () => {
        console.log(`Loaded ${questions.length} questions from CSV.`);
        console.log('All Questions:', questions); // Log the entire questions array
        resolve();
      })
      .on('error', (error) => {
        console.error('Error loading questions:', error);
        reject(error);
      });
  });
}

// Start a new session and send the first question
async function startSession(req, res) {
  const { userId } = req.body; // Assume userId is provided by the client

  console.log(`Received start-session request for userId: ${userId}`);

  if (!userId) {
    console.error('No userId provided');
    return res.status(400).json({ error: 'userId is required to start a session.' });
  }

  if (getSession(userId)) {
    console.error(`Session already exists for userId: ${userId}`);
    return res.status(400).json({ error: 'Session already exists for this user.' });
  }

  createSession(userId, questions); // This now initializes facetScores

  if (questions.length === 0) {
    console.error('No questions loaded to start the session.');
    return res.status(500).json({ error: 'No questions available to start the session.' });
  }

  const firstQuestion = questions[0];
  console.log('Sending first question to client:', firstQuestion);

  res.json({ question: firstQuestion, questionNumber: 1, totalQuestions: questions.length });
}

// Get the next question in the session
function getNextQuestion(req, res) {
  const { userId } = req.params;

  const session = getSession(userId);

  if (!session) {
    console.error(`Session not found for userId: ${userId}`);
    return res.status(400).json({ error: 'Session not found. Please start a new session.' });
  }

  const nextIndex = session.currentQuestionIndex + 1;

  if (nextIndex >= session.questions.length) {
    console.log(`All questions completed for userId: ${userId}`);
    return res.status(200).json({ message: 'All questions completed.', totalScore: session.score });
  }

  const nextQuestion = session.questions[nextIndex];
  console.log(`Sending next question to userId: ${userId}`, nextQuestion);

  // Update session
  updateSession(userId, { currentQuestionIndex: nextIndex });

  res.json({ question: nextQuestion, questionNumber: nextIndex + 1, totalQuestions: session.questions.length });
}

function calculateScore(facetScores) {
  const totalScore = Object.values(facetScores).reduce((acc, score) => acc + score, 0);
  return totalScore;
}

module.exports = {
  startSession,
  getNextQuestion,
  loadQuestions,
  questions,
};
