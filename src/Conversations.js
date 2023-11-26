import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import { imageDb } from './firebaseConfig';
import { getDownloadURL, listAll, ref } from 'firebase/storage';

function Conversations() {
    
    const [imgUrl, setImgUrl] = useState([]);
    useEffect(() => {
        listAll(ref(imageDb,"uploads")).then(imgs => {            
                imgs.items.forEach(img => {
                getDownloadURL(img).then(url => {
                    setImgUrl(data => [...data, url])
                })
            })
        })
    },[]);

    //console.log(imgUrl, "imgUrl");
    
    return (
        <div className='conversations'>
            <Navbar />
            {
                imgUrl.map(dataVal => 
                    <div>
                        <img src={dataVal} height="200" width="200" alt="screenshot" />
                        <br></br>    
                    </div>)
            }
        </div>
    )
}

export default Conversations;