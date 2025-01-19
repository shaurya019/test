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

  const [mergedFileName, set_mergedFileName] = useState('');


  const startRecording = async () => {
    try {
      set_cc(CurrentState.RECORDING);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        // Send to backend and clear local chunk
        chunkCount.current += 1;
        uploadChunk(event.data);

      };

      mediaRecorder.current.onstop = () => {
        // reset session id
        set_cc(CurrentState.STOPPED);
      };

      mediaRecorder.current.start(2000); // Split into 10-second chunks
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
        console.log(`>> uploading chunk`, chunkCount.current)
        const upload_response = await fetch('https://pr662n6jxj.execute-api.eu-north-1.amazonaws.com/dev/test', { method: 'POST', body: JSON.stringify({ uuid: sessionId.current, body: base64, isBase64Encoded: true }) });
        const upload_response_json = await upload_response.json();
        sessionId.current = upload_response_json.uuid;
        console.log(`>> chunk uploaded`, chunkCount.current)
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
      if (!sessionId.current) {
        alert(`No session id present. Please record some audio first!`);
        return;
      }
      set_cc(CurrentState.MERGING);
      const response = await fetch('https://g0qqrjunjd.execute-api.eu-north-1.amazonaws.com/dev/test-merge', { method: 'POST', body: JSON.stringify({ uuid: sessionId.current }) });
      if (response.ok) {
        set_cc(CurrentState.MERGED);
        alert('Audio chunks merged successfully!');

        // reset session id and chunk count
        sessionId.current = '';
        chunkCount.current = 0; 

        set_mergedFileName((await response.json()).file_name);
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
    if (mergedFileName !== '') {
      try {
        set_cc(CurrentState.DELETING);
        const response = await fetch(
          'https://g0qqrjunjd.execute-api.eu-north-1.amazonaws.com/dev/delete-chunk',
          { method: 'DELETE', body: JSON.stringify({ file_name: mergedFileName }) }
        );
        if (response.ok) {
          set_cc(CurrentState.DELETED);
          alert('Audio file deleted successfully!');
          window.location.reload();
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


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Audio Recording Controls</h2>
  
    {/* Action Buttons */}
    <div className="space-y-4 mb-6">
    <div className="mb-6">
      <span className="text-gray-600 font-medium">Current State:</span>
      <span className="font-semibold text-blue-600 ml-2">{current_state}</span>
    </div>
      <br />
      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 w-full" disabled={current_state === CurrentState.RECORDING} onClick={startRecording}>Start Recording</button>
      <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 w-full" onClick={stopRecording}>Stop Recording</button>
      <button className="px-4 mb-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200 w-full" disabled={current_state === CurrentState.RECORDING} onClick={mergeChunks}>Merge Chunks</button>
      <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 w-full" onClick={deleteFile}> Delete File</button>
      <br />
      <div className="mt-4">
      {
        mergedFileName && (
          <span className="text-lg font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg shadow-sm">
            merged file: <span className="text-blue-600">{mergedFileName}</span>
          </span>
        )
      }
    </div>
      </div>
    </div>
  );
};

export default AudioRecorder;