// controllers/transcriptionController.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { transcribeAudio } = require('../services/whisper');
const { getScore } = require('../services/chatGPT');
const { getSession, updateSession, deleteSession } = require('../utils/sessionManager');
const { calculateScores } = require('../utils/scoreCalculator'); // Import the calculateScores function

// Configure Multer for file uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log(`Created uploads directory at: ${uploadsDir}`);
} else {
  console.log(`Uploads directory exists at: ${uploadsDir}`);
}

// Define storage strategy for Multer
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent collisions
    const uniqueName = `uploaded_audio_${Date.now()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  },
});

// Define file filter to accept only audio files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/x-mpeg',
    'audio/x-mp3',
    'audio/wav',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'));
  }
};

// Initialize Multer with the defined storage and file filter
const upload = multer({ storage, fileFilter });

/**
 * Helper function to delete uploaded files after processing
 * @param {string} filePath - The path to the file to be deleted
 */
function cleanUpFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${filePath}`, err);
      } else {
        console.log(`File deleted: ${filePath}`);
      }
    });
  } else {
    console.warn(`File not found for deletion: ${filePath}`);
  }
}

/**
 * Endpoint to handle audio response submission
 */
const submitResponse = [
  upload.single('file'), // Middleware to handle single file upload with field name 'file'
  async (req, res) => {
    const { userId } = req.body; // Extract userId from the request body

    // Validate presence of userId
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const session = getSession(userId); // Retrieve the user's session

    // Validate existence of session
    if (!session) {
      return res.status(400).json({ error: 'Session not found. Please start a new session.' });
    }

    // Validate presence of uploaded file
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const filePath = req.file.path; // Path to the uploaded audio file

    try {
      // Step 1: Transcribe audio using Whisper AI
      const transcript = await transcribeAudio(filePath);
      console.log(`Transcript: ${transcript}`);

      // Step 2: Retrieve current question and its facet
      const currentIndex = session.currentQuestionIndex;
      const currentQuestion = session.questions[currentIndex];
      const facet = currentQuestion.facet; // Ensure your CSV has a 'facet' column

      // Validate presence of facet
      if (!facet) {
        throw new Error('Facet not specified for the current question.');
      }

      // Step 3: Get score from ChatGPT based on transcript and facet
      const scoreStr = await getScore(transcript, facet);
      const score = parseInt(scoreStr, 10); // Convert score to integer

      // Validate the received score
      if (isNaN(score) || score < 1 || score > 5) {
        throw new Error(`Invalid score received: ${scoreStr}`);
      }

      console.log(`Score for facet "${facet}": ${score}`);

      // Step 4: Update the session's facetScores
      // Add the current score to the facet's total
      const updatedFacetScores = { ...session.facetScores };
      if (updatedFacetScores[facet]) {
        updatedFacetScores[facet] += score;
      } else {
        updatedFacetScores[facet] = score;
      }

      // Calculate domain scores based on updated facet scores
      const updatedDomainScores = calculateScores(updatedFacetScores);

      // Update the session with the new facetScores and domainScores
      updateSession(userId, { 
        facetScores: updatedFacetScores,
        domainScores: updatedDomainScores
      });

      // Step 5: Determine the next question
      const nextIndex = currentIndex + 1;

      if (nextIndex >= session.questions.length) {
        // All questions have been answered
        res.json({ 
          message: 'All questions completed.', 
          facetScores: updatedFacetScores,
          domainScores: updatedDomainScores 
        });
        // Optionally, clean up the session
        deleteSession(userId);
      } else {
        const nextQuestion = session.questions[nextIndex];
        // Update the session with the new currentQuestionIndex
        updateSession(userId, { currentQuestionIndex: nextIndex });
        res.json({ 
          score, 
          facetScores: updatedFacetScores, 
          domainScores: updatedDomainScores, 
          nextQuestion: nextQuestion, 
          questionNumber: nextIndex + 1, 
          totalQuestions: session.questions.length 
        });
      }
    } catch (error) {
      console.error('Error processing response:', error.message);
      res.status(500).json({ error: error.message });
    } finally {
      // Clean up the uploaded audio file regardless of success or failure
      cleanUpFile(filePath);
    }
  },
];

module.exports = {
  submitResponse,
};
