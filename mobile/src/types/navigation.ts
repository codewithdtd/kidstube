import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video } from './models';

export type RootStackParamList = {
  Home: undefined;
  Player: { video: Video };
  ScreenLock: { reason: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type PlayerScreenProps = NativeStackScreenProps<RootStackParamList, 'Player'>;
export type ScreenLockProps = NativeStackScreenProps<RootStackParamList, 'ScreenLock'>;
