import React, { useState, useRef } from 'react';

const AudioRecorder: React.FC = () => {
  const [chunks, setChunks] = useState<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        setChunks((prevChunks) => [...prevChunks, event.data]);
        // Send to backend and clear local chunk
        uploadChunk(event.data);
      };

      mediaRecorder.current.start(10000); // Split into 10-second chunks
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  };

  const uploadChunk = async (chunk: Blob) => {
    const formData = new FormData();
    formData.append('audio', chunk, `chunk-${Date.now()}.webm`);
    try {
      await fetch('/audio/add', { method: 'POST', body: formData });
    } catch (error) {
      console.error('Error uploading chunk:', error);
    }
  };

  const mergeChunks = async () => {
    try {
      const response = await fetch('/audio/merge', { method: 'POST' });
      if (response.ok) {
        alert('Audio chunks merged successfully!');
      } else {
        alert('Error merging audio chunks.');
      }
    } catch (error) {
      console.error('Error merging audio chunks:', error);
    }
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <button onClick={mergeChunks}>Merge Chunks</button>
    </div>
  );
};

export default AudioRecorder;
