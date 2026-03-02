import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { type HistoryStackParamList } from './types';
import { Colors } from '../constants/colors';
import HistoryScreen from '../screens/History/HistoryScreen';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryStackNavigator() {
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
        name="History"
        component={HistoryScreen}
        options={{ title: 'Training History' }}
      />
    </Stack.Navigator>
  );
}
