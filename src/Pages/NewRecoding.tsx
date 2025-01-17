import React, { useState, useRef } from 'react';

enum CurrentState {
  INACTIVE = 'inactive',
  RECORDING = 'recording',
  STOPPED = 'stopped',
  MERGING = 'merging',
  MERGED = 'merged',

  RETRIEVING = 'retrieving',
  RETRIEVED = 'retrieved',
  DELETING = 'deleting',
  DELETED = 'deleted'
}

const AudioRecorder: React.FC = () => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunkCount = useRef(0);
  const sessionId = useRef('');

  const [current_state, set_cc] = useState<CurrentState>(CurrentState.INACTIVE)

  const startRecording = async () => {
    try {
      set_cc(CurrentState.RECORDING);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        // Send to backend and clear local chunk
        chunkCount.current += 1;
        console.time(`chunk recieved`)
        uploadChunk(event.data);

       console.log(chunkCount.current, `inactive?`, mediaRecorder.current?.state === 'inactive')
      };

      mediaRecorder.current.onstop = () => {
        // reset session id
        set_cc(CurrentState.STOPPED);
      };

      mediaRecorder.current.start(5000); // Split into 10-second chunks
    } catch (error) {
      console.error('Error while recording', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  };

  const uploadChunk = async (chunk: Blob) => {
    convertToBase64(chunk).then(async (base64) => {
      try {
        console.log(`>> uploading chunk`)
        const upload_response = await fetch('https://pr662n6jxj.execute-api.eu-north-1.amazonaws.com/dev/test', { method: 'POST', body: JSON.stringify({ uuid: sessionId.current, body: base64, isBase64Encoded: true }) });
        const upload_response_json = await upload_response.json();
        sessionId.current = upload_response_json.uuid;
        console.log(`>> chunk uploaded`)
      } catch (error) {
        console.error('Error uploading chunk:', error);
      }
    }).catch((error) => {
      console.error('Error converting to base64:', error);
    });
  };
  
  const convertToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const mergeChunks = async () => {
    try {
      set_cc(CurrentState.MERGING);
      const response = await fetch('https://g0qqrjunjd.execute-api.eu-north-1.amazonaws.com/dev/test-merge', { method: 'POST', body: JSON.stringify({ uuid: sessionId.current }) });
      if (response.ok) {
        set_cc(CurrentState.MERGED);
        alert('Audio chunks merged successfully!');

        // reset session id and chunk count
        sessionId.current = '';
        chunkCount.current = 0; 
      } else {
        set_cc(CurrentState.STOPPED);
        alert('Error merging audio chunks. Please check console');
        console.error('Error merging audio chunks:', await response.json());
      }
    } catch (error) {
      set_cc(CurrentState.STOPPED);
      console.error('Error merging audio chunks:', error);
    }
  };

  return (
    <div>
      current_state: {[current_state]}
      <br />
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <button onClick={mergeChunks}>Merge Chunks</button>
    </div>
  );
};

export default AudioRecorder;