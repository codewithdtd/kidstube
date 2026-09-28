import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { HomeScreen } from '../features/feed/screens/HomeScreen';
import { PlayerScreen } from '../features/player/screens/PlayerScreen';
import { ScreenLockModal } from '../features/screentime/screens/ScreenLockModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ScreenLock"
          component={ScreenLockModal}
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

