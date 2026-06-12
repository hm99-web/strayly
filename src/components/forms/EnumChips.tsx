import { Pressable, ScrollView, Text, View } from 'react-native';

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface EnumChipsProps<T extends string> {
  label?: string;
  options: readonly ChipOption<T>[] | readonly T[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  error?: string;
  scrollable?: boolean;
}

function normalize<T extends string>(options: EnumChipsProps<T>['options']): ChipOption<T>[] {
  return options.map((o) =>
    typeof o === 'string'
      ? { value: o, label: o.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) }
      : o,
  );
}

export function EnumChips<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  scrollable = false,
}: EnumChipsProps<T>) {
  const chips = normalize(options).map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={() => onChange(option.value)}
        className={`rounded-full border px-3.5 py-2 ${
          selected
            ? 'bg-brand-600 border-brand-600 dark:bg-brand-500 dark:border-brand-500'
            : 'border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900'
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            selected ? 'text-white' : 'text-stone-700 dark:text-stone-300'
          }`}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  });

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</Text>
      ) : null}
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {chips}
        </ScrollView>
      ) : (
        <View className="flex-row flex-wrap gap-2">{chips}</View>
      )}
      {error ? <Text className="text-status-emergency text-sm">{error}</Text> : null}
    </View>
  );
}
