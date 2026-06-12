import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends PropsWithChildren, Omit<PressableProps, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
}

const containerStyles: Record<Variant, string> = {
  primary: 'bg-brand-600 active:bg-brand-700 dark:bg-brand-500 dark:active:bg-brand-600',
  secondary: 'bg-stone-200 active:bg-stone-300 dark:bg-stone-800 dark:active:bg-stone-700',
  outline:
    'border border-stone-300 dark:border-stone-700 active:bg-stone-100 dark:active:bg-stone-900',
  ghost: 'active:bg-stone-100 dark:active:bg-stone-900',
  danger: 'bg-status-emergency active:opacity-80',
};

const textStyles: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-stone-900 dark:text-stone-100',
  outline: 'text-stone-900 dark:text-stone-100',
  ghost: 'text-brand-600 dark:text-brand-400',
  danger: 'text-white',
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-3 py-2 rounded-lg', text: 'text-sm' },
  md: { container: 'px-4 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-5 py-4 rounded-2xl', text: 'text-lg' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 ${containerStyles[variant]} ${
        sizeStyles[size].container
      } ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
      {typeof children === 'string' ? (
        <Text className={`font-semibold ${textStyles[variant]} ${sizeStyles[size].text}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
