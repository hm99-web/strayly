import { Text, View } from 'react-native';

import {
  FEEDING_STATUS_COLOR,
  FEEDING_STATUS_LABEL,
  getFeedingStatus,
} from '@/lib/animalStatus';
import { timeAgo } from '@/lib/format';

interface FeedingStatusDotProps {
  lastFedAt: string | null;
  showLabel?: boolean;
}

export function FeedingStatusDot({ lastFedAt, showLabel = true }: FeedingStatusDotProps) {
  const status = getFeedingStatus(lastFedAt);
  const label =
    status === 'green'
      ? `Fed ${timeAgo(lastFedAt)}`
      : lastFedAt
        ? `${FEEDING_STATUS_LABEL[status]} · fed ${timeAgo(lastFedAt)}`
        : 'Never fed';

  return (
    <View className="flex-row items-center gap-1.5" accessibilityLabel={label}>
      <View
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: FEEDING_STATUS_COLOR[status] }}
      />
      {showLabel ? (
        <Text className="text-sm text-stone-600 dark:text-stone-400">{label}</Text>
      ) : null}
    </View>
  );
}
