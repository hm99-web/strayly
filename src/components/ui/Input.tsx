import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, className, ...props },
  ref,
) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor="#A8A29E"
        className={`rounded-xl border bg-white px-4 py-3 text-base text-stone-900 dark:bg-stone-900 dark:text-stone-100 ${
          error ? 'border-status-emergency' : 'border-stone-300 dark:border-stone-700'
        } ${className ?? ''}`}
        {...props}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" className="text-status-emergency text-sm">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-sm text-stone-500 dark:text-stone-400">{hint}</Text>
      ) : null}
    </View>
  );
});
