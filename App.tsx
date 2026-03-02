import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseProvider } from './src/database/DatabaseProvider';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { ActiveWorkoutProvider } from './src/contexts/ActiveWorkoutContext';
import RootNavigator from './src/navigation/RootNavigator';
import { requestNotificationPermissions } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <SettingsProvider>
            <SubscriptionProvider>
              <ActiveWorkoutProvider>
                <NavigationContainer>
                  <StatusBar style="light" />
                  <RootNavigator />
                </NavigationContainer>
              </ActiveWorkoutProvider>
            </SubscriptionProvider>
          </SettingsProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
