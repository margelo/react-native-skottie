import type {
  SkCanvas,
  SkJSIInstance,
  SkRect,
} from '@shopify/react-native-skia';
import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-skia-skottie' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// TODO: enable turbo module arch again
// const isTurboModuleEnabled = global.__turboModuleProxy != null;

// const SkiaSkottieModule = isTurboModuleEnabled
//   ? require('./NativeSkiaSkottie').default
//   : NativeModules.SkiaSkottie;

const SkiaSkottieModule = NativeModules.SkiaSkottie;

const SkiaSkottie = SkiaSkottieModule
  ? SkiaSkottieModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

if (typeof SkiaSkottie.install === 'function') {
  SkiaSkottie.install();
} else {
  throw new Error(
    "Couldn't call SkiaModule.install! Is the native library installed?"
  );
}

export interface SkSkottie extends SkJSIInstance<'Skottie'> {
  duration: number;
  fps: number;
  render: (canvas: SkCanvas, rect: SkRect) => void;
  seek: (progress: number) => void;
}
declare global {
  var SkiaApi_SkottieCtor: (jsonString: string) => SkSkottie;
}

export const makeSkSkottieFromString = global.SkiaApi_SkottieCtor;
