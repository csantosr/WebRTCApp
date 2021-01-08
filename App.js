import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import ListerScreen from './screens/lister';
import BroadcasterScreen from './screens/broadcast';
import WatcherScreen from './screens/watcher';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Lister">
        <Stack.Screen name="Lister" component={ListerScreen} />
        <Stack.Screen name="Broadcaster" component={BroadcasterScreen} />
        <Stack.Screen name="Watcher" component={WatcherScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
