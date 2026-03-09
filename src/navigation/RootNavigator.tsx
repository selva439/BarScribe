import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { type RootStackParamList } from './types';
import { Colors } from '../constants/colors';
import TabNavigator from './TabNavigator';
import LogSetScreen from '../screens/LogSet/LogSetScreen';
import SessionReviewScreen from '../screens/History/SessionReviewScreen';
import WorkoutSummaryScreen from '../screens/History/WorkoutSummaryScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import { useSettings } from '../contexts/SettingsContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { settings, isLoading } = useSettings();

  if (isLoading) return null;

  return (
    <Stack.Navigator
      initialRouteName={settings.isInitialized ? 'Tabs' : 'Onboarding'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="LogSet"
        component={LogSetScreen}
        options={{
          presentation: 'fullScreenModal',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitle: 'Log Set',
        }}
      />
      <Stack.Screen
        name="SessionReview"
        component={SessionReviewScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitle: 'Session Review',
        }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitle: 'Workout Summary',
        }}
      />
    </Stack.Navigator>
  );
}
