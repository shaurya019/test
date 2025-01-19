# Audio Recorder React App

This React application allows users to record audio, upload chunks to a backend server, merge the chunks into a single audio file, and delete the merged file.

## Features

- Start and stop audio recording
- Upload audio chunks to a backend server
- Merge audio chunks into a single file
- Delete the merged audio file


## Usage

1. Open the application in your browser (usually at `http://localhost:3000`).
2. Use the buttons to control the audio recording:
    - **Start Recording**: Begins recording audio.
    - **Stop Recording**: Stops the current recording session.
    - **Merge Chunks**: Merges the recorded audio chunks into a single file.
    - **Delete File**: Deletes the merged audio file.

## Components

### `AudioRecorder.tsx`

This component handles the audio recording functionality, including starting and stopping the recording, uploading chunks, merging chunks, and deleting the merged file.

#### State Variables

- `current_state`: Tracks the current state of the recording process.
- `mediaRecorder`: Reference to the `MediaRecorder` instance.
- `chunkCount`: Counter for the number of recorded chunks.
- `sessionId`: Unique identifier for the recording session.
- `mergedFileName`: Name of the merged audio file.

#### Methods

- `startRecording`: Starts the audio recording.
- `stopRecording`: Stops the audio recording.
- `uploadChunk`: Uploads a recorded audio chunk to the backend server.
- `convertToBase64`: Converts a `Blob` to a Base64 string.
- `mergeChunks`: Merges the recorded audio chunks into a single file.
- `deleteFile`: Deletes the merged audio file.

## Backend Endpoints

- `POST /dev/test`: Uploads an audio chunk.
- `POST /dev/test-merge`: Merges the uploaded audio chunks.
- `DELETE /dev/delete-chunk`: Deletes the merged audio file.