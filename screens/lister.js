import * as React from 'react';
import {View, Text, Button} from 'react-native';

import io from 'socket.io-client';

function ListerScreen({navigation}) {
  const [socket, setSocket] = React.useState(null);
  const [streamers, setstreamers] = React.useState([]);
  React.useEffect(() => {
    if (!socket) {
      setSocket(io('https://cristiansantos.com', {reconnect: true}));
    }
  }, []);
  React.useEffect(() => {
    if (socket) {
      socket.emit('list');
      socket.on('listed', (streamersResponse) => {
        setstreamers(streamersResponse);
      });
    }
  }, [socket])

  function loadStreamers() {
    if (socket) {
      socket.emit('list');
    }
  }

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Active streamers</Text>
      {streamers.length !== 0 && (
        <View>
          {streamers.map((streamer) => (
            <Button
              title={`Go to stream: ${streamer}`}
              key={streamer}
              onPress={() =>
                navigation.navigate('Watcher', {
                  streamerId: streamer,
                })
              }
            />
          ))}
        </View>
      )}
      {socket && (
        <>
          <Button
            title="Start a stream"
            onPress={() => navigation.navigate('Broadcaster')}
          />
          <Button title="Reload streamers" onPress={loadStreamers} />
        </>
      )}
    </View>
  );
}

export default ListerScreen;