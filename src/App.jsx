import React, { useEffect, useState,useRef } from 'react';
import { io } from 'socket.io-client';
import {Peer} from "peerjs"


      let socket = io('https://video-node-4zbi.onrender.com/');
      let peer = new Peer();
  function App() {
    const [partnerId, setPartnerId] = useState(null);
    let [peerId,setPeerId] = useState();
    let[userPeer,setUserPeer] = useState();
    
    let localVideoRef = useRef();
    let remoteVideoRef = useRef();
   
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
  })
 }


 const videoStyle = {
  width: '48%',
  
  borderRadius: '10px',
  backgroundColor: 'black',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
};


    return (
        <div>
            <h1>Socket.io Pairing</h1>
            {partnerId ? (<>
                <p>Paired with user: {partnerId}</p>
                   <video ref={localVideoRef} style={videoStyle} autoPlay></video>
                   <br/>
                   <video ref={remoteVideoRef} autoPlay style={videoStyle}></video>
                   <br/>
                   <button onClick={call} style={buttonStyle}>call</button>
                   <br/>
                   <button onClick={re}>next</button>
                   </>
            ) : (
                <p>Waiting for a partner...</p>
            )}

           
        </div>
    );
}

export default App;



