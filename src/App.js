import React, { useRef, useState, /*useCallback*/ } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import Webcam from "react-webcam";
import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
import { imageDb, textDb } from './firebaseConfig';
import { ref, uploadString } from 'firebase/storage';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { v4 } from 'uuid';


function App() {
  const newDate = new Date();
  const date = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  const hour = newDate.getHours();
  const minute = newDate.getMinutes();
  const second = newDate.getSeconds();

  const [speechValue, setSpeechValue] = useState('')
  // const { listen, listening, stop } = useSpeechRecognition({
  //   onResult: (speechResult) => {
  //     setSpeechValue(speechResult)
  //   }
  // })

  const onEnd = () => {
    // You could do something here after listening has finished
  };

  const onResult = (speechResult) => {
    setSpeechValue(speechResult);
  };

  const onError = (event) => {
    if (event.error === 'not-allowed') {
      setBlocked(true);
    }
  };

  const { listen, listening, stop } = useSpeechRecognition({
    onResult,
    onEnd,
    onError,
  });

  const toggle = listening
    ? stop
    : () => {
        setBlocked(false);
        listen();
      };

    const { speak, cancel, speaking } = useSpeechSynthesis({
      onEnd,
    });

  const [img, setImg] = useState(null);
  const webcamRef = useRef(null);
  const [apiResult, setAPIResult] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [prompt, setPrompt] = useState('Imagine that I am a visual impaired individual. Tell me the brand and the object that I am holding. Only describe the object in the foreground. Do not describe the person holding the object.');
  const [blocked, setBlocked] = useState(false);
  const [dataId, setDataId] = useState('');
  const [voiceArray, setVoices] = useState([]);

  const videoConstraints = {
    width: 420,
    height: 420,
    facingMode: "environment",
  };

  // const capture = useCallback(() => {
  //   const imageSrc = webcamRef.current.getScreenshot();
  //   setImg(imageSrc);
  //   setStatusMessage('Sending request...');
  //   setUploadProgress(10); // Initial progress
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   callGPT4(imageSrc, prompt); 
  // }, [webcamRef]);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
    setStatusMessage('Sending request...');
    setUploadProgress(10); // Initial progress
    callGPT4(imageSrc, prompt); 
    uploadPhoto(imageSrc);
  }

  const talkmethod = (textToRead) => {
    const msg = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang === 'en-AU' || voice.lang === 'en-GB' || voice.lang === 'en-US');
    msg.voice = voices[24];
    //console.log(voices);
    setVoices(voices);
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
      max_tokens: 500 
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
    const newPrompt = prompt + '\n\n' + apiResult + '\n\n' + speechValue
    setPrompt(newPrompt)
    setStatusMessage('Sending request...');
    setUploadProgress(10); // Initial progress
    callGPT4(img, newPrompt)
    updateData(newPrompt)
    //alert(newPrompt)
  };

  const retakeMethod = () => {
    setImg(null)
    setStatusMessage('')
    setAPIResult('')
    setUploadProgress(0)
    setPrompt('Imagine that I am a visual impaired individual. Tell me the brand and the object that I am holding. Only describe the object in the foreground. Do not describe the person holding the object.')
    setSpeechValue('')
  }

  const uploadPhoto = (imageSrc) => {
    const currentFileName = v4()+'.jpg';
    const imgRef = ref(imageDb, `uploads/${currentFileName}`);
    uploadString(imgRef, imageSrc, 'data_url');
    uploadData(imageSrc);
  }

  const dbValue = collection(textDb, 'conversations');
  const uploadData = async (image) => {
    await addDoc(dbValue, {filePath:image, conversation:prompt, dateCreated:`${year}-${month<10?`0${month}`:`${month}`}-${date}` + " " + `${hour}:${minute}:${second}`}).then((docRef) => {
      setDataId(docRef.id);
    });
  }
  
  const updateData = async (newPrompt) => {
    const updateDBRef = doc(textDb, 'conversations', dataId);
    await updateDoc(updateDBRef, {conversation:newPrompt});
  }

  return (
    <div className="App">
      <Navbar />
      <div className="Container">
      <h1>Sight</h1>
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
      {speaking ? (
        <button type="button" onClick={cancel}>
          Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={() => speak({text: apiResult, voice: voiceArray[24]})}
        >
          Speak
        </button>
      )}
      
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
        {/* <button onMouseDown={listen} onMouseUp={stop}>
          🎤
        </button> */}

        <button disabled={blocked} type="button" onClick={toggle}>
          {listening ? 'Stop' : 'Listen'}
        </button>

        <button onClick={sendNewPrompt}>
          Tell me more
        </button>
        {/* <button onClick={uploadData} /> */}
       </div>
    </div>   
  </div>
  );
}
export default App;