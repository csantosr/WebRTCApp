import * as React from 'react';
import {View, Text, Button, FlatList, ScrollView} from 'react-native';
import WatcherTile from './watcherTile';

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

  function renderStreamer({item}) {
    return <WatcherTile streamerId={item} />
  }

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Active streamers</Text>
      {streamers.length !== 0 && (
        <ScrollView style={{flex: 1}}>
          {streamers.map((streamer) => (
            // <Button
            //   title={`Go to stream: ${streamer}`}
            //   key={streamer}
            //   onPress={() =>
            //     navigation.navigate('Watcher', {
            //       streamerId: streamer,
            //     })
            //   }
            // />
            <WatcherTile streamerId={streamer} key={streamer} style={{flex:1, alignSelf: 'stretch'}}/>
          ))}
        </ScrollView>
      )}
      {false && streamers.length !== 0 && (
        <FlatList 
          data={streamers}
          renderItem={renderStreamer}
          keyExtractor={streamer => streamer}
        />
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