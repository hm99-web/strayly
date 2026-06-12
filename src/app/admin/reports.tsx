import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

// Post-MVP stub: lists content_reports for moderator review.
export default function AdminReports() {
  return (
    <Screen edges={['left', 'right']}>
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-stone-500 dark:text-stone-400">
          Flagged content review arrives post-MVP. The content_reports table is already live.
        </Text>
      </View>
    </Screen>
  );
}
