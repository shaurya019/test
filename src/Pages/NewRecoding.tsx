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
  const [current_state, set_cc] = useState<CurrentState>(CurrentState.INACTIVE)

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunkCount = useRef(0);
  const sessionId = useRef('');
  const mergedFileName = useRef<string>('');

  const [audioUrl, setAudioUrl] = useState(''); // State to store audio URL



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

        const response_json = await response.json();
        const res = JSON.parse(response_json.body);

        // file name
        mergedFileName.current = res.file_name;
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

  const deleteFile = async () => {
    if (mergedFileName.current) {
      try {
        set_cc(CurrentState.DELETING);
        const response = await fetch('https://g0qqrjunjd.execute-api.eu-north-1.amazonaws.com/dev/delete-chunk', { method: 'DELETE', body: JSON.stringify({ file_name: mergedFileName.current }) });
        if (response.ok) {
          set_cc(CurrentState.DELETED);
          alert('Audio file deleted successfully!');
        } else {
          set_cc(CurrentState.MERGED);
          alert('Error deleting audio file. Please check console');
          console.error('Error deleting audio file:', await response.json());
        }
      } catch (error) {
        set_cc(CurrentState.MERGED);
        console.error('Error deleting audio file:', error);
      }
    }
  };

  const retrieveUrl = async () => {
    if (mergedFileName.current) {
      try {
        set_cc(CurrentState.RETRIEVING);
        const response = await fetch(`https://g0qqrjunjd.execute-api.eu-north-1.amazonaws.com/dev/test-retrieve`, { method: 'POST', body: JSON.stringify({ file_name: mergedFileName.current }) });
        if (response.ok) {
          set_cc(CurrentState.RETRIEVED);
          alert('Audio file retrieved successfully!');

          const response_json = await response.json();
          const file = response_json.file;

          // Convert Base64 string to binary data (audio)
          const audioBlob = base64ToBlob(file);
          
          // Create an Object URL for the Blob
          const audioBlobUrl = URL.createObjectURL(audioBlob);

          // Set the audio URL in the state
          setAudioUrl(audioBlobUrl);

        } else {
          set_cc(CurrentState.MERGED);
          alert('Error retrieving audio file. Please check console');
          console.error('Error retrieving audio file:', await response.json());
        }
      } catch (error) {
        set_cc(CurrentState.MERGED);
        console.error('Error retrieving audio file:', error);
      }
    }
  }

   // Function to convert a Base64 string to a Blob
   const base64ToBlob = (base64String: string) => {
    const [metadata, data] = base64String.split(',');
    const byteCharacters = atob(data);  // Decodes the Base64 string into a raw binary string
    const byteArrays = [];

    // Split the raw binary string into chunks of 1024 bytes
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const chunk = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(chunk.length);

      for (let i = 0; i < chunk.length; i++) {
        byteNumbers[i] = chunk.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: metadata.split(':')[1].split(';')[0] });
  };

  return (
    <div>
      current_state: {current_state}
      <br />
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <button onClick={mergeChunks}>Merge Chunks</button>
      <button onClick={retrieveUrl}>Retrieve File</button>
      <button onClick={deleteFile}>Delete File</button>

      {audioUrl ? (
        <audio controls>
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <p>Audio is not available.</p>
      )}
    </div>
  );
};

export default AudioRecorder;