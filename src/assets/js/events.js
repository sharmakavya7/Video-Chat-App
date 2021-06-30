import helpers from './helpers.js';

const shareScreen = document.getElementById('share_screen');
let screenTrack;

window.addEventListener('load', ()=>{
    //When the chat icon is clicked
    document.querySelector('#toggle-chat-pane').addEventListener('click', (e)=>{
        document.querySelector('#chat-pane').classList.toggle('chat-opened');

        //remove the 'New' badge on chat icon (if any) once chat is opened.
        setTimeout(()=>{
            if(document.querySelector('#chat-pane').classList.contains('chat-opened')){
                helpers.toggleChatNotificationBadge();
            }
        }, 300);
    });


    //When the video frame is clicked. This will enable picture-in-picture
    document.getElementById('local').addEventListener('click', ()=>{
        if (!document.pictureInPictureElement) {
            document.getElementById('local').requestPictureInPicture()
            .catch(error => {
                // Video failed to enter Picture-in-Picture mode.
                console.error(error);
            });
        } 
          
        else {
            document.exitPictureInPicture()
            .catch(error => {
                // Video failed to leave Picture-in-Picture mode.
                console.error(error);
            });
        }
    });


    //When the 'Create room" is button is clicked
    document.getElementById('create-room').addEventListener('click', (e)=>{
        e.preventDefault();

        let roomName = document.querySelector('#room-name').value;
        let yourName = document.querySelector('#your-name').value;
        let location_href= "/teams";

        if(roomName && yourName){
            //remove error message, if any
            document.querySelector('#err-msg').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', yourName);

            //create room link
            let roomLink = `${location.origin}${location_href}?room=${roomName.trim().replace(' ', '_')}_${helpers.generateRandomString()}`;
            

            //show message with link to room
            document.querySelector('#room-created').innerHTML = `Room successfully created. Click <a href='${roomLink}'>here</a> to enter room. 
                Share the room link with your partners.`;

            //empty the values
            document.querySelector('#room-name').value = '';
            document.querySelector('#your-name').value = '';
        }

        else{
            document.querySelector('#err-msg').innerHTML = "All fields are required";
        }
    });


    //When the 'Enter room' button is clicked.
    document.getElementById('enter-room').addEventListener('click', (e)=>{
        e.preventDefault();

        let name = document.querySelector('#username').value;

        if(name){
            //remove error message, if any
            document.querySelector('#err-msg-username').innerHTML = "";

            //save the user's name in sessionStorage
            sessionStorage.setItem('username', name);

            //reload room
            location.reload();
        }

        else{
            document.querySelector('#err-msg-username').innerHTML = "Please input your name";
        }
    });
})










function connect(username) {
    let promise = new Promise((resolve, reject) => {
        // get a token from the back end
        let data;
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({'username': username})
        }).then(res => res.json()).then(_data => {
            // join video call
            data = _data;
            return Twilio.Video.connect(data.token);
        }).then(_room => {
            room = _room;
            room.participants.forEach(participantConnected);
            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            connected = true;
            updateParticipantCount();
            connectChat(data.token, data.conversation_sid);
            resolve();
        }).catch(e => {
            console.log(e);
            reject();
        });
    });
    return promise;
};

function participantConnected(participant) {
    let participantDiv = document.createElement('div');
    participantDiv.setAttribute('id', participant.sid);
    participantDiv.setAttribute('class', 'participant');

    let tracksDiv = document.createElement('div');
    participantDiv.appendChild(tracksDiv);

    let labelDiv = document.createElement('div');
    labelDiv.setAttribute('class', 'label');
    labelDiv.innerHTML = participant.identity;
    participantDiv.appendChild(labelDiv);

    container.appendChild(participantDiv);

    participant.tracks.forEach(publication => {
        if (publication.isSubscribed)
            trackSubscribed(tracksDiv, publication.track);
    });
    participant.on('trackSubscribed', track => trackSubscribed(tracksDiv, track));
    participant.on('trackUnsubscribed', trackUnsubscribed);

    updateParticipantCount();
};

//screen sharing

function connectButtonHandler(event) {
    event.preventDefault();
    if (!connected) {
        connect(username).then(() => {
            
            shareScreen.disabled = false;
        }).catch(() => {
        
       });
    }
   else {
        disconnect();
        shareScreen.innerHTML = 'Share screen';
        shareScreen.disabled = true;
    }
};

function shareScreenHandler() {
    event.preventDefault();
    if (!screenTrack) {
        navigator.mediaDevices.getDisplayMedia().then(stream => {
            screenTrack = new Twilio.Video.LocalVideoTrack(stream.getTracks()[0]);
            room.localParticipant.publishTrack(screenTrack);
            screenTrack.mediaStreamTrack.onended = () => { shareScreenHandler() };
            console.log(screenTrack);
            shareScreen.innerHTML = 'Stop sharing';
        }).catch(() => {
            alert('Could not share the screen.')
        });
    }
    else {
        room.localParticipant.unpublishTrack(screenTrack);
        screenTrack.stop();
        screenTrack = null;
        shareScreen.innerHTML = 'Share screen';
    }
};
shareScreen.addEventListener('click', shareScreenHandler);
button.addEventListener('click', connectButtonHandler);

//to get the screen's MediaStreamTrack and create a LocalVideoTrack:

// const { connect, LocalVideoTrack } = require('twilio-video');

// const stream = await navigator.mediaDevices.getDisplayMedia();
// const screenTrack = new LocalVideoTrack(stream.getTracks()[0]);

// const room = await connect(token, {
//     name: 'presentation',
//     tracks: [screenTrack]
// });

// const room = await connect(token, {
//     name: 'presentation'
// });
  
// room.localParticipant.publishTrack(screenTrack);

// var request = {
//     "type": "getUserScreen",
//     "sources": ["screen", "window", "tab"]
//   }

//requestiing the screen
// function getUserScreen(sources, extensionId) {
//     const request = {
//       type: 'getUserScreen',
//       sources: sources
//     };
//     return new Promise((resolve, reject) => {
//       chrome.runtime.sendMessage(extensionId, request, response => {
//         switch (response && response.type) {
//           case 'success':
//             resolve(response.streamId);
//             break;
  
//           case 'error':
//             reject(new Error(error.message));
//             break;
  
//           default:
//             reject(new Error('Unknown response'));
//             break;
//         }
//       });
//     }).then(streamId => {
//       return navigator.mediaDevices.getUserMedia({
//         video: {
//           mandatory: {
//             chromeMediaSource: 'desktop',
//             chromeMediaSourceId: streamId,
//             // You can provide additional constraints. For example,
//             maxWidth: 1920,
//             maxHeight: 1080,
//             maxFrameRate: 10,
//             minAspectRatio: 1.77
//           }
//         }
//       });
//     });
//   }
