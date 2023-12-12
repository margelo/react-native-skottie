import { Image, NativeModules, Platform } from 'react-native';
import type { SkottieViewSource, SkSkottie } from './types';

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

declare global {
  var SkiaApi_SkottieCtor: (jsonString: string) => SkSkottie;
  var SkiaApi_SkottieFromUri: (uri: string) => SkSkottie;
}

export const SkottieAPI = {
  createFrom: (source: SkottieViewSource): SkSkottie => {
    // Turn the source either into a JSON string, or a URI string:
    let _source: string | { sourceDotLottieURI: string };

    if (typeof source === 'string') {
      _source = source;
    } else if (typeof source === 'object') {
      _source = JSON.stringify(source);
    } else if (typeof source === 'number') {
      const uri = Image.resolveAssetSource(source)?.uri;
      if (uri == null) {
        throw Error(
          '[react-native-skottie] Invalid src prop provided. Cant resolve asset source.'
        );
      }
      _source = { sourceDotLottieURI: uri };
    } else {
      throw Error('[react-native-skottie] Invalid src prop provided.');
    }

    // Actually create the Skottie instance:
    if (typeof _source === 'string') {
      return global.SkiaApi_SkottieCtor(_source);
    } else {
      return global.SkiaApi_SkottieFromUri(_source.sourceDotLottieURI);
    }
  },
};
