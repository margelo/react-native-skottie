import '@shopify/react-native-skia'; // Important: register skia module
import type {
  NativeSkiaViewProps,
  SkiaProps,
} from '@shopify/react-native-skia/lib/typescript/src';
import { SkiaViewNativeId } from '@shopify/react-native-skia';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { SkiaViewApi } from './SkiaViewApi';

import type { AnimationObject } from './types';
import { NativeSkiaSkottieView } from './NaitveSkiaSkottieView';
import { makeSkSkottieFromString } from './NativeSkottieModule';
import {
  Easing,
  cancelAnimation,
  startMapper,
  stopMapper,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export type SkiaSkottieViewProps = NativeSkiaViewProps & {
  src: string | AnimationObject;

  /**
   * A boolean flag indicating whether or not the animation should start automatically when
   * mounted.
   */
  autoPlay?: boolean;

  /**
   * The speed the animation will progress. This only affects the imperative API. The
   * default value is 1.
   */
  speed?: number;

  /**
   * The duration of the animation in ms. Takes precedence over speed when set.
   * This only works when source is an actual JS object of an animation.
   */
  duration?: number;

  /**
   * A boolean flag indicating whether or not the animation should loop.
   */
  loop?: boolean;

  // TODO: onAnimationFinish
  // TODO: resizeMode?: 'cover' | 'contain' | 'center';
} & SkiaProps<{ progress?: number }>;

export const SkiaSkottieView = (props: SkiaSkottieViewProps) => {
  const nativeId = useRef(SkiaViewNativeId.current++).current;

  //#region Compute values
  const source = useMemo(() => {
    let _source;
    if (typeof props.src === 'string') {
      _source = props.src;
    } else if (typeof props.src === 'object') {
      _source = JSON.stringify(props.src);
    } else {
      throw Error('[react-native-skottie] Invalid src prop provided.');
    }
    return _source;
  }, [props.src]);

  const skottieAnimation = useMemo(
    () => makeSkSkottieFromString(source),
    [source]
  );

  const _progress = useSharedValue(0);
  const progress = _progress;

  const updateSrc = useCallback(
    (src: string) => {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(nativeId, 'src', src);
    },
    [nativeId]
  );
  //#endregion

  useLayoutEffect(() => {
    // TODO: Instead of setting source, set JSISkottie instance, which we need anyway already for duration?
    updateSrc(source);

    // TODO: Christian, registerValuesInView only works for skia animated values? Do we have to do that?
    // SkiaViewApi.registerValuesInView(nativeId, [progress]);
  }, [nativeId, source, updateSrc]);

  // Handle animation updates
  // TODO: Christian We manually need to handle the mapping of reanimated values, instead of being
  //       able to use #extractReanimatedProps, because that only works with Views using the Node API.
  useEffect(() => {
    assertSkiaViewApi();
    // TODO: can we get this from RnSkia?
    const mapperId = startMapper(() => {
      'worklet';
      // TODO: Christian, i am using callJsiMethod here, but could also do setJsiProperty. Is there any advantage / disadvantage?
      // TODO: Christian, when using this code i am seeing increased memory jumps?
      try {
        SkiaViewApi.callJsiMethod(nativeId, 'setProgress', progress.value);
      } catch (e) {
        // TODO: error: ReanimatedError: callCustomCommand: Could not call action setProgress on view - view not ready., js engine: reanimated
        //       Note: This doesn't happen with using setJsiProperty - investigate native code
      }

      // SkiaViewApi.setJsiProperty(nativeId, 'progress', progress.value);
      // SkiaViewApi.requestRedraw(nativeId);
    }, [progress]);

    return () => {
      stopMapper(mapperId);
    };
  }, [nativeId, progress]);

  // Start the animation
  useEffect(() => {
    if (!props.autoPlay) {
      return;
    }

    _progress.value = withRepeat(
      withTiming(1, {
        duration: skottieAnimation.duration * 1000,
        easing: Easing.linear,
      }),
      props.loop ? -1 : 0,
      false
    );

    return () => {
      cancelAnimation(_progress);
    };
  }, [_progress, props.autoPlay, props.loop, skottieAnimation.duration]);

  const { mode, debug = false, ...viewProps } = props;

  return (
    <NativeSkiaSkottieView
      collapsable={false}
      nativeID={`${nativeId}`}
      mode={mode}
      debug={debug}
      {...viewProps}
    />
  );
};

const assertSkiaViewApi = () => {
  if (
    SkiaViewApi === null ||
    SkiaViewApi.setJsiProperty === null ||
    SkiaViewApi.callJsiMethod === null ||
    SkiaViewApi.registerValuesInView === null ||
    SkiaViewApi.requestRedraw === null ||
    SkiaViewApi.makeImageSnapshot === null
  ) {
    throw Error('Skia View Api was not found.');
  }
};
