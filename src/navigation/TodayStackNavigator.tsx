import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { type TodayStackParamList } from './types';
import { Colors } from '../constants/colors';
import TodayTrainingScreen from '../screens/Today/TodayTrainingScreen';
import ProgramSelectScreen from '../screens/Today/ProgramSelectScreen';
import ProgramSetupScreen from '../screens/Today/ProgramSetupScreen';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export default function TodayStackNavigator() {
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
        name="TodayTraining"
        component={TodayTrainingScreen}
        options={{ title: "Today's Training" }}
      />
      <Stack.Screen
        name="ProgramSelect"
        component={ProgramSelectScreen}
        options={{ title: 'Choose Program' }}
      />
      <Stack.Screen
        name="ProgramSetup"
        component={ProgramSetupScreen}
        options={{ title: 'Set Training Maxes' }}
      />
    </Stack.Navigator>
  );
}
