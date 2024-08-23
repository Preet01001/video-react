import React, { useEffect, useState,useRef } from 'react';
import { io } from 'socket.io-client';
import {Peer} from "peerjs"

const socket = io('https://video-node-4zbi.onrender.com');
let peer = new Peer();

function App() {
    const [partnerId, setPartnerId] = useState(null);
    let [peerId,setPeerId] = useState();
    let[userPeer,setUserPeer] = useState();

    let localVideoRef = useRef();
    let remoteVideoRef = useRef();
   

    useEffect(() => {

      socket.on('paired', (data) => {
        setPartnerId(data.partnerId);
        console.log(`Paired with user: ${data.partnerId}`);
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
    }, []);

    useEffect(() => {
      if (peerId && partnerId) {
          console.log(`Peer ID: ${peerId}, Partner ID: ${partnerId}`);
          let data = {peerId,partnerId}
          socket.emit("ids",data);
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
                   </>
            ) : (
                <p>Waiting for a partner...</p>
            )}

           
        </div>
    );
}

export default App;







// import { useEffect, useRef, useState } from "react"
// import{io} from "socket.io-client"
// import {Peer} from "peerjs"

// function App() {

//   let[userid,setId] = useState();
//   let localVideoRef = useRef();
//   let remoteVideoRef = useRef();
//   let peer = new Peer();

//   useEffect(()=>{
//     peer.on("open",(id)=>{
//       console.log(id);
//     })

//     peer.on("call",(call)=>{
//       navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((stream)=>{
//         call.answer(stream);
//         localVideoRef.current.srcObject = stream;
//         call.on("stream",(remoteStream)=>{
//           remoteVideoRef.current.srcObject = remoteStream;
//         })
//       })
      
//      })

//   },[])

//  function call(){
//   navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((stream)=>{
//     localVideoRef.current.srcObject = stream;
    
//     let call = peer.call(userid,stream);
//      call.on("stream",(remoteStream)=>{
//       remoteVideoRef.current.srcObject = remoteStream;
//      })
//   })
//  }
//   return (
//     <>
//   <video ref={localVideoRef} autoPlay></video>
//   <video ref={remoteVideoRef} autoPlay></video>
//   <input type="text" onChange={(e)=>{setId(e.target.value)}}></input>
//   <button onClick={call}>call</button>
//     </>
//   )
// }

// export default App



// import { useEffect, useRef, useState } from "react";
// import { Peer } from "peerjs";

// function App() {
//   const [id, setId] = useState('');
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peer = useRef(null);

//   useEffect(() => {
//     // Initialize the PeerJS instance
//     peer.current = new Peer();

//     // Handle when the peer connection is open
//     peer.current.on("open", (id) => {
//       console.log("Peer ID:", id);
//     });

//     // Handle incoming calls
//     peer.current.on("call", (call) => {
//       // Get media stream
//       navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//         // Set local video stream
//         localVideoRef.current.srcObject = stream;
//         // Answer the call with the local stream
//         call.answer(stream);
//         // Set remote video stream when available
//         call.on("stream", (remoteStream) => {
//           remoteVideoRef.current.srcObject = remoteStream;
//         });
//       });
//     });

//     // Cleanup on unmount
//     return () => {
//       if (peer.current) {
//         peer.current.destroy();
//       }
//     };
//   }, []);

//   const handleCall = () => {
//     if (!id) {
//       alert("Please enter a peer ID.");
//       return;
//     }

//     // Get media stream
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//       // Set local video stream
//       localVideoRef.current.srcObject = stream;
//       // Make a call to the provided peer ID
//       const call = peer.current.call(id, stream);
//       // Set remote video stream when available
//       call.on("stream", (remoteStream) => {
//         remoteVideoRef.current.srcObject = remoteStream;
//       });
//     });
//   };

//   return (
//     <>
//       <video ref={localVideoRef} autoPlay muted></video>
//       <video ref={remoteVideoRef} autoPlay></video>
//       <input 
//         type="text" 
//         value={id} 
//         onChange={(e) => setId(e.target.value)} 
//         placeholder="Enter peer ID"
//       />
//       <button onClick={handleCall}>Call</button>
//     </>
//   );
// }

// export default App;

