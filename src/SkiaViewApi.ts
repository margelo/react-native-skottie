import type { ISkiaViewApi } from '@shopify/react-native-skia';

declare global {
  var SkiaViewApi: ISkiaViewApi;
}

export const { SkiaViewApi } = global;
