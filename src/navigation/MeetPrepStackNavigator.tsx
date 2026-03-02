import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { type MeetPrepStackParamList } from './types';
import { Colors } from '../constants/colors';
import MeetListScreen from '../screens/MeetPrep/MeetListScreen';
import MeetDetailScreen from '../screens/MeetPrep/MeetDetailScreen';

const Stack = createNativeStackNavigator<MeetPrepStackParamList>();

export default function MeetPrepStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="MeetList"
        component={MeetListScreen}
        options={{ title: 'Meet Prep' }}
      />
      <Stack.Screen
        name="MeetDetail"
        component={MeetDetailScreen}
        options={{ title: 'Meet Detail' }}
      />
    </Stack.Navigator>
  );
}
