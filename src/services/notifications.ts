import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let restTimerNotificationId: string | null = null;

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8341C',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRestTimerNotification(
  seconds: number,
  exerciseName: string
): Promise<void> {
  // Cancel any existing rest timer notification
  await cancelRestTimerNotification();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rest Complete',
      body: `Time to hit your next ${exerciseName} set`,
      sound: true,
      data: { type: 'rest-timer' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
  restTimerNotificationId = id;
}

export async function cancelRestTimerNotification(): Promise<void> {
  if (restTimerNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(restTimerNotificationId);
    restTimerNotificationId = null;
  }
}

export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}
