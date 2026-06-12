import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

// Foreground presentation: show banners, no sound (emergencies use their channel).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync('emergency', {
    name: 'Emergencies',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#DC2626',
  });
}

/**
 * Register this device for pushes. Call after sign-in and on app foreground.
 * No-ops on web/simulators and when permission is declined.
 */
export async function registerForPushNotifications(userId: string): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  try {
    await ensureAndroidChannels();

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn('[push] No EAS projectId yet — run `npx eas init` to enable push tokens.');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        device_name: Device.modelName,
        last_active_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: 'user_id,expo_push_token' },
    );
    if (error) console.warn('[push] token upsert failed', error.message);
  } catch (error) {
    console.warn('[push] registration failed', error);
  }
}

export async function unregisterPushToken(userId: string): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await supabase.from('push_tokens').delete().match({ user_id: userId, expo_push_token: token });
  } catch {
    // Best effort — sign-out should never block on this.
  }
}

/** Route taps on OS notifications (incl. cold start) via their data.url. */
export function useNotificationDeepLinks() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    function routeTo(response: Notifications.NotificationResponse | null) {
      const url = response?.notification.request.content.data?.url;
      if (typeof url === 'string' && url.startsWith('/')) {
        router.push(url as never);
      }
    }

    void Notifications.getLastNotificationResponseAsync().then(routeTo);
    const subscription = Notifications.addNotificationResponseReceivedListener(routeTo);
    return () => subscription.remove();
  }, [router]);
}
