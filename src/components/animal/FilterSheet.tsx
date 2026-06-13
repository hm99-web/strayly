import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { EMPTY_FILTERS, useMapStore, type AnimalFilters } from '@/stores/mapStore';
import type { AnimalHealthStatus } from '@/types/domain';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`rounded-full border px-3.5 py-2 ${
        selected
          ? 'bg-brand-600 border-brand-600 dark:bg-brand-500 dark:border-brand-500'
          : 'border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900'
      }`}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-stone-700 dark:text-stone-300'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-sm font-semibold uppercase tracking-wide text-stone-400">{children}</Text>
  );
}

/** Shared between Map and Strays tabs; writes the filters into mapStore. */
export function FilterSheet({ visible, onClose }: FilterSheetProps) {
  const filters = useMapStore((s) => s.filters);
  const setFilters = useMapStore((s) => s.setFilters);
  const [draft, setDraft] = useState<AnimalFilters>(filters);

  // Re-sync the draft each time the sheet opens.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(filters);
  }

  function toggleHealth(status: AnimalHealthStatus) {
    setDraft((d) => ({
      ...d,
      health: d.health.includes(status)
        ? d.health.filter((h) => h !== status)
        : [...d.health, status],
    }));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[85%] rounded-t-3xl bg-stone-50 dark:bg-stone-950">
          <View className="flex-row items-center justify-between px-5 pb-1 pt-4">
            <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">Filters</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#A8A29E" />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-4 p-5">
            <View className="gap-2">
              <SectionLabel>Species</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Dogs"
                  selected={draft.species === 'dog'}
                  onPress={() => setDraft((d) => ({ ...d, species: d.species === 'dog' ? undefined : 'dog' }))}
                />
                <Chip
                  label="Cats"
                  selected={draft.species === 'cat'}
                  onPress={() => setDraft((d) => ({ ...d, species: d.species === 'cat' ? undefined : 'cat' }))}
                />
              </View>
            </View>

            <View className="gap-2">
              <SectionLabel>Feeding</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Needs food"
                  selected={draft.feedingStatus === 'red'}
                  onPress={() =>
                    setDraft((d) => ({ ...d, feedingStatus: d.feedingStatus === 'red' ? undefined : 'red' }))
                  }
                />
                <Chip
                  label="Feeding due"
                  selected={draft.feedingStatus === 'yellow'}
                  onPress={() =>
                    setDraft((d) => ({ ...d, feedingStatus: d.feedingStatus === 'yellow' ? undefined : 'yellow' }))
                  }
                />
                <Chip
                  label="Recently fed"
                  selected={draft.feedingStatus === 'green'}
                  onPress={() =>
                    setDraft((d) => ({ ...d, feedingStatus: d.feedingStatus === 'green' ? undefined : 'green' }))
                  }
                />
              </View>
            </View>

            <View className="gap-2">
              <SectionLabel>Vaccination</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Vaccinated"
                  selected={draft.vaccinated === 'yes'}
                  onPress={() => setDraft((d) => ({ ...d, vaccinated: d.vaccinated === 'yes' ? undefined : 'yes' }))}
                />
                <Chip
                  label="Not vaccinated"
                  selected={draft.vaccinated === 'no'}
                  onPress={() => setDraft((d) => ({ ...d, vaccinated: d.vaccinated === 'no' ? undefined : 'no' }))}
                />
              </View>
            </View>

            <View className="gap-2">
              <SectionLabel>Sterilization</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Sterilized"
                  selected={draft.sterilized === 'yes'}
                  onPress={() => setDraft((d) => ({ ...d, sterilized: d.sterilized === 'yes' ? undefined : 'yes' }))}
                />
                <Chip
                  label="Not sterilized"
                  selected={draft.sterilized === 'no'}
                  onPress={() => setDraft((d) => ({ ...d, sterilized: d.sterilized === 'no' ? undefined : 'no' }))}
                />
              </View>
            </View>

            <View className="gap-2">
              <SectionLabel>Health</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                <Chip label="Injured" selected={draft.health.includes('injured')} onPress={() => toggleHealth('injured')} />
                <Chip label="Sick" selected={draft.health.includes('sick')} onPress={() => toggleHealth('sick')} />
                <Chip
                  label="Pregnant"
                  selected={draft.health.includes('pregnant')}
                  onPress={() => toggleHealth('pregnant')}
                />
                <Chip
                  label="Nursing"
                  selected={draft.health.includes('nursing')}
                  onPress={() => toggleHealth('nursing')}
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-stone-900">
              <Text className="font-medium text-stone-700 dark:text-stone-300">Puppies / kittens</Text>
              <Switch
                value={draft.puppies === true}
                onValueChange={(value) => setDraft((d) => ({ ...d, puppies: value ? true : undefined }))}
              />
            </View>

            <View className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-stone-900">
              <Text className="font-medium text-stone-700 dark:text-stone-300">
                Active emergencies only
              </Text>
              <Switch
                value={draft.emergencyOnly === true}
                onValueChange={(value) => setDraft((d) => ({ ...d, emergencyOnly: value ? true : undefined }))}
              />
            </View>

            <View className="flex-row gap-3 pb-4 pt-1">
              <View className="flex-1">
                <Button
                  variant="outline"
                  onPress={() => {
                    setDraft(EMPTY_FILTERS);
                    setFilters(EMPTY_FILTERS);
                    onClose();
                  }}
                >
                  Reset
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  onPress={() => {
                    setFilters(draft);
                    onClose();
                  }}
                >
                  Apply
                </Button>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
