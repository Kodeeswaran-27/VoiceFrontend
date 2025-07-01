import React, { useState, useRef, useEffect } from 'react';
import Recorder from 'recorder-js';
import micIcon from './microphone.png';
import './App.css';

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const recorder = new Recorder(audioContext);

    recorder.init(stream);
    recorderRef.current = recorder;
    audioContextRef.current = audioContext;

    // recorder.start();
    recorder.start();
    setIsListening(true);
  };

  const stopRecording = async () => {
    const { blob } = await recorderRef.current.stop();
    const audioBlob = blob;
    const wavURL = URL.createObjectURL(audioBlob);
    setAudioURL(wavURL);
    setIsListening(false);

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://10.87.108.73:8000/transcribe/?target_language=en', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.transcription) {
        setTranscription(data.transcription);
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="App">
      <div className="container">
        <h2>Voice To Voice Translation</h2>

        <label>Choose a Destination Language:</label>
        <select value={selectedOption} onChange={handleDropdownChange}>
          <option value="">-- Choose a Language --</option>
          <option value="option1">Telugu</option>
          <option value="option2">English</option>
          <option value="option3">Hindi</option>
          <option value="option4">Tamil</option>
          <option value="option5">Sanskrit</option>
        </select>

        <div className="mic-container">
          <img
            src={micIcon}
            alt="Microphone"
            onClick={toggleRecording}
            className={isListening ? 'mic-red' : 'mic-green'}
          />
          <span className="mic-status">{isListening ? 'Stop' : 'Start'}</span>
          <span className="mic-listening">{isListening ? '🎙️ Listening...' : ''}</span>
        </div>

        {audioURL && (
          <div className="audio-container">
            <p><strong>Recorded Audio:</strong></p>
            <audio controls ref={audioPlayerRef} src={audioURL}></audio>
            <br />
            <a href={audioURL} style={{color: "white"}} download="recording.wav">Download Audio</a>
          </div>
        )}

        {transcription && (
          <div className="transcription-container">
            <h3>Transcription:</h3>
            <p>{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
