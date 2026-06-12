import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends PropsWithChildren {
  /** Extra NativeWind classes appended to the default screen styling. */
  className?: string;
  /** Disable safe-area edges (e.g. for full-bleed map screens). */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({ children, className, edges = ['top', 'left', 'right'] }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-stone-50 dark:bg-stone-950 ${className ?? ''}`}>
      {children}
    </SafeAreaView>
  );
}
