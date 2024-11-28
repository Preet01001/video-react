import React, { useEffect, useState,useRef } from 'react';
import { io } from 'socket.io-client';
import {Peer} from "peerjs"
import Splash from './Splash';
import "./App.css"


      let socket = io('http://localhost:1010');
      let peer = new Peer();
  function App() {
    const [partnerId, setPartnerId] = useState(null);
    let [peerId,setPeerId] = useState();
    let[userPeer,setUserPeer] = useState();
    let[loading,setLoading] = useState(true);
    
    let localVideoRef = useRef();
    let remoteVideoRef = useRef();

    useEffect(()=>{
      let timer = setTimeout(()=>{
        setLoading(false);
      },1000);
      return ()=>{
        clearTimeout(timer);
      }
    })
   
    useEffect(() => {
      if(socket && peer){
      socket.on('paired', (data) => {
        setPartnerId(data.partnerId);
      //  console.log(`Paired with user: ${data.partnerId}`);
    });

      peer.on("open",(id)=>{
       // console.log(id);
        setPeerId(id);
      })

      socket.on("userpeer",(data)=>{
      //  console.log("user peer"+data)
        setUserPeer(data);
      })


      peer.on("call",(call)=>{
              navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((stream)=>{
                call.answer(stream);
                localVideoRef.current.srcObject = stream;
                call.on("stream",(remoteStream)=>{
                  remoteVideoRef.current.srcObject = remoteStream;
                })
              }).catch((er)=>{
                 console.log(er)
              })
             })

        return () => {
            socket.off('paired');
        };
      }
    }, []);

    function conn(){
      socket.connect();
      peer.connect();
    }

    function re(){
      socket.disconnect();
      setPartnerId(null);
      conn();  
    }

    useEffect(() => {
      if (peerId && partnerId) {
         // console.log(`Peer ID: ${peerId}, Partner ID: ${partnerId}`);
          let data = {peerId,partnerId}
          socket.emit("ids",data);
          socket.on("diss",(data)=>{
            if(data===partnerId){
              socket.disconnect();
              setPartnerId(null);
              conn();
             
            }
          })
      }
  }, [peerId, partnerId]);

   function call(){
  navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((stream)=>{
    localVideoRef.current.srcObject = stream;
    
    
    let call = peer.call(userPeer,stream);
     call.on("stream",(remoteStream)=>{
      remoteVideoRef.current.srcObject = remoteStream;
     })
  }).catch((er)=>{
    console.log(er)
  })
 }

     if(loading){
    return <Splash/>
        }

    return (
      <div>
            <nav className="navbar">
        <div className="navbar-logo">
          <img src="image.png" alt="RandomMeet Logo" />
        </div>
      </nav>

      {partnerId ? (
        
          <div className="container">
          
              <div className="video-container">
                  <video ref={localVideoRef} muted className="video" autoPlay></video>
                  <br />
                  <video ref={remoteVideoRef} autoPlay className="video"></video>
              </div>
             
              <div className="button-container">
                  <button onClick={call} className="button">Call</button>
                  <button onClick={re} className="button">Next</button>
              </div>
              <div className='text-container'>
              <p><img src='image.png'/></p>
              <p >Welcome to RandomMeet, a random webcam chat app made to anonymously talk to strangers online. Choose between our 1-on-1 video chat roulette to instantly meet new people.</p>
              <img src='th (19).jpg'/>
              <p>
<br/><b>Connect and Chat:</b> After being connected, you can start a video chat with your match instantly (hitting the call button). You’ll have the option to continue chatting or find a new match (next button).

<br/><b>Stay Safe:</b> We prioritize your privacy and safety. You can choose to disconnect from a chat at any time and report any inappropriate behavior.

<br/><b>Enjoy Your Conversations:</b> RandomMeet is designed to help you meet new people and have interesting conversations. Have fun and make new connections!</p>
              </div>
              <div className="contact-container">
  <p>Contact and Follow us on:</p>
  <div className="icon-container">
   <a><img src="instagram-1.png" alt="Instagram" /></a> 
   <a 
        href="https://wa.me/918439497883" 
        target="_blank" 
        rel="noopener noreferrer"
      >  <img src="Whatsapp-Logo-Png-Transparent-Background.png" alt="WhatsApp" /></a>
  </div>
</div>

          </div>
      ) : (
          <p className="waiting">Waiting for a partner...</p>
      )}
  </div>
    );
}

export default App;



