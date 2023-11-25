import React, { useRef, useState, useCallback } from 'react';
import './App.css';
import Webcam from "react-webcam";
import { useSpeechRecognition } from 'react-speech-kit';

function App() {
  const [speechValue, setSpeechValue] = useState('')
  const { listen, stop } = useSpeechRecognition({
    onResult: (speechResult) => {
      setSpeechValue(speechResult)
    }
  })

  const [img, setImg] = useState(null);
  const webcamRef = useRef(null);
  const [apiResult, setAPIResult] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [prompt, setPrompt] = useState('Imagine that I am a visual impaired individual. Tell me the brand and the object that I am holding. Only describe the object in the foreground. Do not describe the person holding the object.');

  const videoConstraints = {
    width: 420,
    height: 420,
    facingMode: "user",
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
    setStatusMessage('Sending request...');
    setUploadProgress(10); // Initial progress
    callGPT4(imageSrc, prompt);
  }, [webcamRef]);

  const talkmethod = (textToRead) => {
    const msg = new SpeechSynthesisUtterance();
    msg.text = textToRead;
    window.speechSynthesis.speak(msg);
  }

  const callGPT4 = async (imageString, promptToSend) => {
    const base64String = imageString.replace('data:', '').replace(/^.+,/, '');

    const data = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": promptToSend
            },
            {
              "type": "image_url",
              "image_url": {
                "url": `data:image/jpeg;base64,${base64String}`
              }
            }
          ]
        }
      ],
      max_tokens: 200
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` // Use environment variable for API key
        },
        body: JSON.stringify(data)
      });
      setUploadProgress(50); // Midway progressgit
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();
      setUploadProgress(100); // Final progress
      if (apiResponse.choices && apiResponse.choices.length > 0) {
        talkmethod(apiResponse.choices[0].message.content);
        setAPIResult(apiResponse.choices[0].message.content);
        setStatusMessage('Analysis complete.');     
      } else {
        console.error('No choices returned from API');
        setStatusMessage('Failed to get a response from the API.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error);
      alert(process.env.REACT_APP_OPENAI_API_KEY);
      setStatusMessage('An error occurred during the analysis.');
    }
  };

  const sendNewPrompt = () => {
    const newPrompt = prompt + '\n' + apiResult + '\n' + speechValue
    setPrompt(newPrompt)
    setStatusMessage('Sending request...');
    setUploadProgress(10); // Initial progress
    callGPT4(img, newPrompt)
    alert(newPrompt)
  };

  const retakeMethod = () => {
    setImg(null)
    setStatusMessage('')
    setAPIResult('')
    setUploadProgress(0)
    setPrompt('Imagine that I am a visual impaired individual. Tell me the brand and the object that I am holding. Only describe the object in the foreground. Do not describe the person holding the object.')
    setSpeechValue('')
  }

  return (
    <div className="App">
      <h1>Sight</h1>
      <div className="Container">
      {img === null ? (
        <>
          <Webcam
            audio={false}
            mirrored={false}
            height={400}
            width={400}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
          <button onClick={capture}>Capture photo</button>
        </>
      ) : (
        <>
          <img src={img} alt="screenshot" />
          <button onClick={retakeMethod}>Retake</button>
        </>
      )}
    </div>
      {statusMessage && <p className="status-message">{statusMessage}</p >}
      {uploadProgress > 0 && (
        <progress value={uploadProgress} max="100"></progress>
      )} 
      <p></p>
      {apiResult && (
        <div className="result">
          <strong>Analysis Result:</strong>
          <textarea value={apiResult} readOnly />
        </div>
      )}

      <div className="result">
       <textarea
         value={speechValue}
         onChange={(event) => setSpeechValue(event.target.value)}
        />
        <button onMouseDown={listen} onMouseUp={stop}>
          🎤
        </button>
        <button onClick={sendNewPrompt}>
          Tell me more
        </button>
       </div>

    </div>
  );
}
export default App;