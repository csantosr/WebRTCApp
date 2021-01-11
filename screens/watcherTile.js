import * as React from 'react';
import {View, Text} from 'react-native';
import io from 'socket.io-client';
import {RTCView, RTCPeerConnection, RTCIceCandidate} from 'react-native-webrtc';

function WatcherTileScreen({streamerId}) {
  console.log(streamerId)
  const [stream, setStream] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [socket] = React.useState(
    io('https://cristiansantos.com', {reconnect: true}),
  );
  const [peerConnection, setPeerConnection] = React.useState(null);
  const config = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };

  React.useEffect(() => {
    if (peerConnection) {
      socket.on('candidate', (id, candidate) => {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.error(e));
      });

      socket.on('broadcaster', () => {
        socket.emit('watcher', streamerId);
      });

      socket.on('closed', () => {
        setMessage('The stream is over');
        setStream(null);
        setTimeout(() => {
          // navigation.navigate('Lister');
        }, 1000);
      });
    }
  }, [peerConnection]);

  React.useEffect(() => {
    socket.on('offer', (id, description) => {

      const newPeerConnection = new RTCPeerConnection(config);
      setPeerConnection(newPeerConnection);

      newPeerConnection
        .setRemoteDescription(description)
        .then(() => newPeerConnection.createAnswer())
        .then((sdp) => newPeerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.emit('answer', id, newPeerConnection.localDescription);
        });
      newPeerConnection.onaddstream = (event) => {
        setStream(event.stream);
        console.log(event.stream)
      };
      newPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', id, event.candidate);
        }
      };
    });

    socket.emit('watcher', streamerId);

    return () => {
      if (socket.connected) socket.close();
    };
  }, [socket]);

  return (
    <View style={{flex: 1}}>
      
      {stream && stream.toURL() && (
        <>
        <RTCView
          streamURL={stream.toURL()}
          style={{height: 200, width: 100}}
          objectFit='cover'
        />
        </>
      )}
    </View>
  );
}

export default WatcherTileScreen;
