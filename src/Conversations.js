import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import { imageDb, textDb } from './firebaseConfig';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { getDocs, collection } from 'firebase/firestore';

function Conversations() {
    
    const [imgUrl, setImgUrl] = useState([]);
    const [data, setData] = useState([]);
    useEffect(() => {
        listAll(ref(imageDb,"uploads")).then(imgs => {            
                imgs.items.forEach(img => {
                getDownloadURL(img).then(url => {
                    setImgUrl(data => [...data, url])
                })
            })
        })
    },[]);
    console.log(imgUrl, "imgUrl");

    const dbValue = collection(textDb, 'conversations');
    const getData = async () => {
        const dataDb = await getDocs(dbValue);
        const listOfData = dataDb.docs.map(val => ({...val.data(),id:val.id}));
        setData(listOfData);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        getData();
    },[]);

    return (
        <div className='conversations'>
            <Navbar />
            {/* {
                imgUrl.map(dataVal => 
                    <div className='Container'>
                        <img src={dataVal} height="200" width="200" alt="screenshot" />
                        <br></br>    
                        {
                            dataVal.split("https://firebasestorage.googleapis.com/v0/b/sight-26775.appspot.com/o/uploads%2")[1].split("?alt=media&token=")[0] === 'Fecc928a4-10c5-4fc0-92b7-66537693da05.jpg' ? (
                                <button>Nothing</button>
                            ) : (
                                <button>{dataVal}</button>
                            )
                        }
                    </div>)
            } */}
            {
                data.map(value=>
                    <div className='Container'>
                        <img src={value.filePath} height="200" width="200" alt="screenshot" />
                        <h4>{value.conversation}</h4>
                    </div>
                    )
            }
        </div>
    )
}

export default Conversations;