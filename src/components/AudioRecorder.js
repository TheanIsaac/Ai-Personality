// src/components/AudioRecorder.js

import React, { useState } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';
import './AudioRecorder.css';

function AudioRecorder({ userId, onResponse }) {
  const [isRecording, setIsRecording] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Handle when the recording stops
  const handleStop = async (blobUrl, blob) => {
    console.log('Recording stopped. Processing audio...');
    const audio = new Audio(URL.createObjectURL(blob));

    const formData = new FormData();
    formData.append('file', blob, 'audio.mpeg'); // Ensure the correct file extension
    formData.append('userId', userId); // Send userId with the request

    try {
      const res = await axios.post('http://localhost:4000/submit-response', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Handle the server's response
      onResponse(res.data);
    } catch (error) {
      console.error('Error:', error);
      setResponseText('An error occurred while processing your request.');
      onResponse({ error: 'An error occurred while processing your request.' });
    }
  };

  // Toggle recording on and off
  const handleToggle = (startRecording, stopRecording) => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  };

  return (
    <div className="audio-recorder">
      <ReactMediaRecorder
        audio
        mimeType="audio/mpeg"
        onStop={handleStop}
        render={({ startRecording, stopRecording, mediaBlobUrl }) => (
          <div>
            <button
              className={`record-button ${isRecording ? 'recording' : ''}`}
              onClick={() => handleToggle(startRecording, stopRecording)}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <div className="response-text">
              {responseText || (isRecording ? 'Recording...' : 'Tap to Record')}
            </div>
            {mediaBlobUrl && (
              <audio src={mediaBlobUrl} controls style={{ marginTop: '10px' }} />
            )}
          </div>
        )}
      />
    </div>
  );
}

export default AudioRecorder;
