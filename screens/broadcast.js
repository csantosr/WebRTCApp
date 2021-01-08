import * as React from 'react';
import {View, Text, Alert} from 'react-native';
import io from 'socket.io-client';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

function BroadcasterScreen({navigation}) {
  const [stream, setStream] = React.useState(null);
  const [MyId, setMyId] = React.useState(null);
  const [isCameraReady, setIsCameraReady] = React.useState(true);
  const [socket] = React.useState(
    io('https://cristiansantos.com', {reconnect: true}),
  );
  const peerConnections = React.useRef(new Map());
  const config = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };

  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        e.preventDefault();
        Alert.alert('Do you want to exit?', 'The streaming will finish', [
          {text: "Don't leave", style: 'cancel', onPress: () => {}},
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => {
              const connectionIds = [...peerConnections.current.keys()];
              socket.emit('broadcastGone', MyId, connectionIds);
              peerConnections.current.forEach((connection, socketId) =>
                connection.close(),
              );
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [navigation],
  );

  React.useEffect(() => {
    if (stream) {
      socket.on('watcher', async (id, myId) => {
        setMyId(myId);
        const connectionBuffer = new RTCPeerConnection(config);

        connectionBuffer.addStream(stream);

        connectionBuffer.onicecandidate = ({candidate}) => {
          if (candidate) socket.emit('candidate', id, candidate);
        };

        const localDescription = await connectionBuffer.createOffer();

        await connectionBuffer.setLocalDescription(localDescription);

        socket.emit('offer', id, connectionBuffer.localDescription);

        peerConnections.current.set(id, connectionBuffer);
      });

      socket.on('candidate', (id, candidate) => {
        const candidateBuffer = new RTCIceCandidate(candidate);
        const connectionBuffer = peerConnections.current.get(id);

        connectionBuffer.addIceCandidate(candidateBuffer);
      });

      socket.on('answer', (id, description) => {
        const connectionBuffer = peerConnections.current.get(id);

        connectionBuffer.setRemoteDescription(description);
      });

      socket.on('disconnectPeer', (id) => {
        const peerConnection = peerConnections.current.get(id);
        if (peerConnection) {
          peerConnection.close();
          peerConnections.current.delete(id);
        }
      });
    }
    return () => {
      if (socket.connected) socket.close();
    };
  }, [socket, stream]);

  React.useEffect(() => {
    if (!stream) {
      (async () => {
        setIsCameraReady(false);
        const availableDevices = await mediaDevices.enumerateDevices();
        const {deviceId: sourceId} = availableDevices.find(
          (device) => device.kind === 'videoinput' && device.facing === 'front',
        );

        const streamBuffer = await mediaDevices.getUserMedia({
          audio: true,
          video: {
            mandatory: {
              // Provide your own width, height and frame rate here
              minWidth: 500,
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: 'user',
            optional: [{sourceId}],
          },
        });

        setStream(streamBuffer);
        setIsCameraReady(true);
        socket.emit('broadcaster');
      })();
    }
  }, [stream]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Broadcaster Screen</Text>
      {!isCameraReady && <Text>Loading Camera</Text>}
      {stream && stream.toURL() && (
        <RTCView
          streamURL={stream.toURL()}
          style={{flex: 1, alignSelf: 'stretch'}}
        />
      )}
    </View>
  );
}

export default BroadcasterScreen;
