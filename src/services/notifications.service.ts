/**
 * Abstracao minima de notificacoes locais para alertas criticos.
 */
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

let permissionsRequested = false;

export async function prepareNotifications(): Promise<void> {
  if (permissionsRequested) {
    return;
  }

  permissionsRequested = true;

  if (!Device.isDevice) {
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('safehome-alerts', {
      name: 'Alertas SafeHome',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D95D39',
      sound: 'default'
    });
  }

  const { status } = await Notifications.getPermissionsAsync();

  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export async function notifyCriticalAlert(title: string, body: string): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true
    },
    trigger: null
  });
}

export async function notifyPresenceDetected(
  deviceName: string,
  locationLabel?: string | null
): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Movimento detectado',
      body: locationLabel
        ? `${deviceName} registrou atividade em ${locationLabel}.`
        : `${deviceName} registrou atividade.`,
      sound: true
    },
    trigger: null
  });
}
