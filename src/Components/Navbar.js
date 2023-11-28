import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function Navbar() {

    const commands = [
        {
            command: ["Go to *", "Open *", "Bring me to *", "I want to have * now", "I want to * a moment", "I would like to * a moment","I would like to * a photo"],
            callback: (redirectPage) => setRedirectUrl(redirectPage),
        },
    ];

    const {transcript} = useSpeechRecognition({commands});
    const [redirectUrl, setRedirectUrl] = useState('');
    const pages = ["home", "capture", "conversations"];
    const urls ={
        home: "/",
        capture: "/capture",
        conversations: "/conversations",
    }

    let redirect = "";
    if(redirectUrl)
    {
        if(pages.includes(redirectUrl))
        {
            redirect = <Navigate to={urls[redirectUrl]} />
        }
        else
        {
            redirect = <p>Could not find page</p>
        }
    }

    return (
        <div className='navbar'>
            <div className='navbar-logo'>
                <p onClick={SpeechRecognition.startListening} id="transcript">Sight - {transcript}</p>
            </div>
            {/* <button onClick={SpeechRecognition.startListening}>Start</button>     */}
            <ul className='navbar-menu'>
                {window.location.href.includes("home") ? (
                        <li/>
                    ):
                    (
                        <><li><Link to="/">Home</Link></li><li><Link to="/capture">Capture</Link></li><li><Link to="/conversations">Conversations</Link></li></>
                    )
                }
                {/* <li><Link to="/">Home</Link></li>
                <li><Link to="/capture">Capture</Link></li>
                <li><Link to="/conversations">Conversations</Link></li> */}
                {redirect}
            </ul>
        </div>
    )
}   

export default Navbar;