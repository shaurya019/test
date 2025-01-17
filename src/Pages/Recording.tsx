import React, { useState, useRef, useCallback } from "react";

const Recording: React.FC = () => {
  const [chunkDuration, setChunkDuration] = useState(10); // Duration of each chunk in seconds

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // media recorder
  const audioChunksRef = useRef<Blob[]>([]); // Ref to store incoming audio chunks

  const [audioUrls, setAudioUrls] = useState<
    { url: string; uploaded: boolean; duration: number }[]
  >([]); // Array to store each chunk's audio URL

  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for interval management

  // Start Recording function
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Handle when data is available from the media recorder
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Handle when the recorder stops
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // upload chunks to s3
        uploadToRemote(audioBlob, audioUrl);

        // Store the chunk URL in the audioUrls array

        audioChunksRef.current = []; // Clear the chunks after the recording is stopped
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Set interval to stop recording after the user-defined duration
      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop(); // stops media recorder

          mediaRecorderRef.current.start(); // starts media recorder again
        }
      }, chunkDuration * 1000); // Convert duration to milliseconds
    } catch (error) {
      console.error("Error while starting recording", error);
    }
  }, [isRecording, chunkDuration]);

  // stop
  // start

  // stop
  // start

  // stop
  // start

  const uploadToRemote = async (audioBlob: Blob, audioUrl: string) => {
    const formData = new FormData();

    // Append the audio Blob to the FormData
    formData.append("audio", audioBlob, "audio.wav"); // Use the appropriate file name and extension

    try {
      // Send the form data containing the audio file
      const response = await fetch(
        "https://pr662n6jxj.execute-api.eu-north-1.amazonaws.com/v1",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const responseData = await response.json(); // Assuming the server responds with JSON
      console.log("Server response:", responseData);
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  // Stop Recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // stops media recorder
      mediaRecorderRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Clear the interval when recording stops
      }
      setIsRecording(false);
    }
  };

  // Clear Recording function
  const clearRecording = () => {
    setAudioUrls([]); // Reset the audio URLs
    if (mediaRecorderRef.current) {
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
      <span>Chunk {index + 1}</span>
      <audio controls>
        <source src={url.url} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      {/* <a
        href={url.url}
        download={`chunk-${index + 1}.wav`}
        className="block mt-2 text-blue-500"
      >
        Download Chunk {index + 1}
      </a> */}
      Duration: {url.duration} s Uploaded: {url.uploaded}
    </div>
  ));

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 flex-col">
      <h1 className="text-4xl font-semibold text-indigo-700 mb-6">
        Recording Page
      </h1>

      {/* Duration Input */}
      <div className="mb-4">
        <label htmlFor="chunkDuration" className="mr-2 text-lg">
          Chunk Duration (seconds):
        </label>
        <input
          type="number"
          id="chunkDuration"
          disabled={isRecording}
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

        {isRecording && "recording..."}

        {/* Clear button */}
        {audioUrls.length > 0 && (
          <button
            onClick={clearRecording}
            disabled={isRecording}
            className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
          >
            Clear Audio
          </button>
        )}
      </div>

      {/* Display audio players for each chunk */}
      {audioPlayers}
    </div>
  );
};

export default Recording;
