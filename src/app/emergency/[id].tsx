import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { palette } from '@/constants/palette';
import { useEmergency, useUpdateEmergencyStatus } from '@/features/emergencies/hooks';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { timeAgo } from '@/lib/format';
import { publicUrl } from '@/lib/supabase';

const STATUS_LABEL: Record<string, string> = {
  open: 'Open — needs help',
  in_progress: 'Help is on the way',
  resolved: 'Resolved',
  false_alarm: 'False alarm',
};

const SEVERITY_COLOR: Record<string, string> = {
  low: palette.status.feedingDue,
  medium: palette.status.injured,
  high: palette.status.emergency,
  critical: palette.status.emergency,
};

export default function EmergencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requireAuth = useRequireAuth();
  const { data: report, isLoading } = useEmergency(id);
  const updateStatus = useUpdateEmergencyStatus(id);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !report) {
    return (
      <Screen edges={['left', 'right']}>
        <Stack.Screen options={{ title: 'Emergency' }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-stone-500 dark:text-stone-400">
            {isLoading ? 'Loading…' : 'Report not found.'}
          </Text>
        </View>
      </Screen>
    );
  }

  const isOpen = report.status === 'open' || report.status === 'in_progress';

  async function setStatus(status: 'in_progress' | 'resolved' | 'false_alarm') {
    setError(null);
    try {
      await updateStatus.mutateAsync({ status });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the report');
    }
  }

  return (
    <Screen edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Emergency' }} />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <View
          className="flex-row items-center gap-3 rounded-2xl p-4"
          style={{ backgroundColor: `${SEVERITY_COLOR[report.severity]}22` }}
        >
          <Ionicons name="alert-circle" size={28} color={SEVERITY_COLOR[report.severity]} />
          <View className="flex-1">
            <Text className="text-lg font-bold capitalize text-stone-900 dark:text-stone-100">
              {report.emergency_type.replace(/_/g, ' ')} · {report.severity}
            </Text>
            <Text className="text-sm text-stone-600 dark:text-stone-400">
              {STATUS_LABEL[report.status]} · reported {timeAgo(report.created_at)}
            </Text>
          </View>
        </View>

        {report.description ? (
          <Text className="leading-5 text-stone-700 dark:text-stone-300">{report.description}</Text>
        ) : null}

        {report.address_text ? (
          <View className="flex-row items-center gap-2">
            <Ionicons name="location" size={16} color="#A8A29E" />
            <Text className="flex-1 text-stone-600 dark:text-stone-400">{report.address_text}</Text>
          </View>
        ) : null}

        {report.photo_paths.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {report.photo_paths.map((path) => (
              <Image
                key={path}
                source={{ uri: publicUrl('animal-media', path) }}
                style={{ width: 160, height: 120, borderRadius: 12 }}
                contentFit="cover"
                cachePolicy="disk"
              />
            ))}
          </ScrollView>
        ) : null}

        {report.animal_id ? (
          <Link href={{ pathname: '/animal/[id]', params: { id: report.animal_id } }} asChild>
            <Button variant="outline">View profile</Button>
          </Link>
        ) : null}

        {report.status === 'resolved' && report.resolution_notes ? (
          <View className="rounded-xl bg-white p-3 dark:bg-stone-900">
            <Text className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Resolution
            </Text>
            <Text className="text-sm text-stone-600 dark:text-stone-400">
              {report.resolution_notes}
            </Text>
          </View>
        ) : null}

        {error ? <Text className="text-status-emergency text-sm">{error}</Text> : null}

        {isOpen ? (
          <View className="gap-2 pt-2">
            {report.status === 'open' ? (
              <Button
                loading={updateStatus.isPending}
                onPress={() => requireAuth(() => void setStatus('in_progress'))}
              >
                I&apos;m responding to this
              </Button>
            ) : null}
            <Button
              variant="secondary"
              loading={updateStatus.isPending}
              onPress={() => requireAuth(() => void setStatus('resolved'))}
            >
              Mark resolved
            </Button>
            <Button
              variant="ghost"
              loading={updateStatus.isPending}
              onPress={() => requireAuth(() => void setStatus('false_alarm'))}
            >
              False alarm
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
