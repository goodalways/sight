import React, { } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import sightlogo from "./sightIcon.png";

function HomePage() {
    return (
        <div className='home'>
            <Navbar />
            <div className='Container'>
                <h1>Sight</h1>
                <img src={sightlogo} alt="react logo" />
                An AI tool that helps blind and visually impaired individuals to be their companion and act as their eyes to help them see what they can't. Through conversational speech and visual image capturing, Sight hopes to ease the challenges faced on a daily basis
            </div>
        </div>
    )
}

export default HomePage;