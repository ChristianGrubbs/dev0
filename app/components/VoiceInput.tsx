import React, { useState, useRef } from 'react';
import { transcribeAudio, processText } from '../utils/openai';

function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.start();
      setIsRecording(true);

      const audioChunks: Blob[] = [];
      mediaRecorder.current.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.current.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
        
        // Process the audio file
        const transcription = await transcribeAudio(audioFile);
        const response = await processText(transcription);
        setResult(response);
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {result && <p>Result: {result}</p>}
    </div>
  );
}

export default VoiceInput;