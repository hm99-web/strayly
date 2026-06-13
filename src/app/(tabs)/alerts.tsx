import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { palette } from '@/constants/palette';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationsRealtime,
  useUnreadCount,
} from '@/features/notifications/hooks';
import { useAuth } from '@/hooks/useAuth';
import { timeAgo } from '@/lib/format';
import type { AppNotification } from '@/types/domain';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TYPE_ICON: Record<string, { icon: IoniconName; color: string }> = {
  emergency_nearby: { icon: 'alert-circle', color: palette.status.emergency },
  new_animal_nearby: { icon: 'paw', color: palette.brand[600] },
  followed_animal_update: { icon: 'heart', color: palette.badge.pregnant },
  vaccination_due: { icon: 'shield-checkmark', color: palette.badge.vaccinated },
  system: { icon: 'information-circle', color: '#78716C' },
};

function NotificationRow({ notification }: { notification: AppNotification }) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const presentation = TYPE_ICON[notification.type] ?? TYPE_ICON.system;
  const unread = notification.read_at == null;
  const url = (notification.data as { url?: string } | null)?.url;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      onPress={() => {
        if (unread) markRead.mutate(notification.id);
        if (url && url.startsWith('/')) router.push(url as never);
      }}
      className={`flex-row gap-3 rounded-2xl p-3 active:opacity-80 ${
        unread ? 'bg-white dark:bg-stone-900' : 'bg-transparent'
      }`}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${presentation.color}22` }}
      >
        <Ionicons name={presentation.icon} size={18} color={presentation.color} />
      </View>
      <View className="flex-1">
        <Text
          className={`leading-5 text-stone-900 dark:text-stone-100 ${unread ? 'font-bold' : 'font-medium'}`}
        >
          {notification.title}
        </Text>
        {notification.body ? (
          <Text className="text-sm text-stone-500 dark:text-stone-400" numberOfLines={2}>
            {notification.body}
          </Text>
        ) : null}
        <Text className="mt-0.5 text-xs text-stone-400">{timeAgo(notification.created_at)}</Text>
      </View>
      {unread ? <View className="mt-2 h-2.5 w-2.5 rounded-full bg-brand-600" /> : null}
    </Pressable>
  );
}

export default function AlertsTab() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const notifications = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAll = useMarkAllNotificationsRead();
  useNotificationsRealtime();

  if (!isSignedIn) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Ionicons name="notifications-outline" size={48} color="#A8A29E" />
          <Text className="text-center text-stone-500 dark:text-stone-400">
            Sign in to get alerts about emergencies and strays you follow.
          </Text>
          <Button onPress={() => router.push('/(auth)/sign-in')}>Sign in</Button>
        </View>
      </Screen>
    );
  }

  const items = notifications.data?.pages.flat() ?? [];

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">Alerts</Text>
        {(unreadCount ?? 0) > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => markAll.mutate()}
            className="active:opacity-70"
          >
            <Text className="text-brand-600 dark:text-brand-400 text-sm font-semibold">
              Mark all read
            </Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <NotificationRow notification={item} />}
        contentContainerClassName="gap-1.5 px-4 pb-6"
        refreshing={notifications.isRefetching}
        onRefresh={() => void notifications.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (notifications.hasNextPage && !notifications.isFetchingNextPage) {
            void notifications.fetchNextPage();
          }
        }}
        ListEmptyComponent={
          <View className="items-center gap-2 py-16">
            <Ionicons name="notifications-off-outline" size={40} color="#A8A29E" />
            <Text className="text-center text-stone-500 dark:text-stone-400">
              {notifications.isLoading ? 'Loading…' : 'Nothing yet — alerts about nearby strays will appear here.'}
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
