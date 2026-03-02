import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { type ProfileStackParamList } from './types';
import { Colors } from '../constants/colors';
import PRsDashboardScreen from '../screens/Profile/PRsDashboardScreen';
import SettingsScreen from '../screens/Profile/SettingsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
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
        name="PRsDashboard"
        component={PRsDashboardScreen}
        options={{ title: 'Personal Records' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
