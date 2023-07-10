import type { NativeSkiaViewProps } from '@shopify/react-native-skia';
import { requireNativeComponent } from 'react-native';

// TODO: web support
export const NativeSkiaSkottieView =
  requireNativeComponent<NativeSkiaViewProps>('SkiaSkottieView');
