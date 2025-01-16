import React, { useState, useRef } from 'react';

const Recording: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]); // Array to store each chunk's audio URL
  const [hasRecorded, setHasRecorded] = useState(false);
  const [chunkDuration, setChunkDuration] = useState(10); // Duration of each chunk in seconds
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]); // Ref to store audio chunks
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for interval management
  const chunkCounterRef = useRef(0); // Counter for chunk names

  // Start Recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Handle when data is available from the recorder
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Handle when the recorder stops
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Store the chunk URL in the audioUrls array
        setAudioUrls((prevUrls) => [...prevUrls, audioUrl]);
        audioChunksRef.current = []; // Clear the chunks after the recording is stopped
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Set interval to stop recording after the user-defined duration
      intervalRef.current = setInterval(() => {
        stopRecording(); // Stop the current recording
        startRecording(); // Start a new recording to record in chunks
      }, chunkDuration * 1000); // Convert duration to milliseconds
    } catch (error) {
      console.error('Error accessing audio device:', error);
    }
  };

  // Stop Recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Clear the interval when recording stops
      }
    }
  };

  // Clear Recording function
  const clearRecording = () => {
    setAudioUrls([]); // Reset the audio URLs
    setHasRecorded(false); // Reset the recording status
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // Stop the recording if it's in progress
      setIsRecording(false); // Set the recording state to false
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear any existing intervals
    }
  };

  // Display the audio player and download links for each chunk
  const audioPlayers = audioUrls.map((url, index) => (
    <div key={index} className="mt-4">
      <audio controls>
        <source src={url} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      <a
        href={url}
        download={`chunk-${index + 1}.wav`}
        className="block mt-2 text-blue-500"
      >
        Download Chunk {index + 1}
      </a>
    </div>
  ));

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 flex-col">
      <h1 className="text-4xl font-semibold text-indigo-700 mb-6">Recording Page</h1>

      {/* Duration Input */}
      <div className="mb-4">
        <label htmlFor="chunkDuration" className="mr-2 text-lg">
          Chunk Duration (seconds):
        </label>
        <input
          type="number"
          id="chunkDuration"
          value={chunkDuration}
          onChange={(e) => setChunkDuration(Number(e.target.value))}
          min="1"
          max="60"
          className="border p-2 rounded"
        />
      </div>

      {/* Buttons */}
      <div className="space-x-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
        >
          Stop Recording
        </button>
        
        {/* Clear button */}
        {audioUrls.length > 0 && (
          <button
            onClick={clearRecording}
            className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
          >
            Clear
          </button>
        )}
      </div>

      {/* Display audio players for each chunk */}
      {audioPlayers}
    </div>
  );
};

export default Recording;
