import type {
  SkCanvas,
  SkJSIInstance,
  SkRect,
} from '@shopify/react-native-skia';
import { Image, NativeModules, Platform } from 'react-native';
import type { SkottieViewSource } from './types';

const LINKING_ERROR =
  `The package 'react-native-skottie' doesn't seem to be linked. Make sure: \n\n` +
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
  var SkiaApi_SkottieFromUri: (uri: string) => SkSkottie;
}

export const SkottieAPI = {
  createFrom: (source: SkottieViewSource): SkSkottie => {
    let _source: string | { sourceDotLottieURI: string };
    if (typeof source === 'string') {
      _source = source;
    } else if (typeof source === 'object') {
      _source = JSON.stringify(props.source);
    } else if (typeof source === 'number') {
      const uri = Image.resolveAssetSource(props.source)?.uri;
      if (uri == null) {
        throw Error(
          '[react-native-skottie] Invalid src prop provided. Cant resolve asset source.'
        );
      }
      _source = { sourceDotLottieURI: uri };
    } else {
      throw Error('[react-native-skottie] Invalid src prop provided.');
    }

    if (typeof _source === 'string') {
      return global.SkiaApi_SkottieCtor(source);
    } else {
      return global.SkiaApi_SkottieFromUri(source.sourceDotLottieURI);
    }
  },
};
