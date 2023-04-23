import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-skia-skottie' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const SkiaSkottieModule = isTurboModuleEnabled
  ? require('./NativeSkiaSkottie').default
  : NativeModules.SkiaSkottie;

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

export function install(): boolean {
  return SkiaSkottie.install();
}
