import '@shopify/react-native-skia'; // Important: register skia module
import type { NativeSkiaViewProps } from '@shopify/react-native-skia/lib/typescript/src';
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
import { NativeSkiaSkottieView } from './NativeSkiaSkottieView';
import { SkSkottie, makeSkSkottieFromString } from './NativeSkottieModule';
import {
  Easing,
  SharedValue,
  cancelAnimation,
  runOnJS,
  startMapper,
  stopMapper,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export type ResizeMode = 'cover' | 'contain' | 'stretch';

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

  /**
   * Provide a reanimated shared value between 0 and 1 to control the animation progress.
   */
  progress?: SharedValue<number>;

  /**
   * @default contain
   */
  resizeMode?: ResizeMode;

  /**
   * Called when the animation is finished playing.
   * Note: this will be called multiple times if the animation is looping.
   */
  onAnimationFinish?: () => void;
};

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
  const progress = props.progress ?? _progress;

  const updateAnimation = useCallback(
    (animation: SkSkottie) => {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(nativeId, 'src', animation);
    },
    [nativeId]
  );

  const updateResizeMode = useCallback(
    (resizeMode: ResizeMode) => {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(nativeId, 'scaleType', resizeMode);
    },
    [nativeId]
  );
  //#endregion

  useLayoutEffect(() => {
    updateAnimation(skottieAnimation);
  }, [nativeId, skottieAnimation, source, updateAnimation]);

  useLayoutEffect(() => {
    updateResizeMode(props.resizeMode ?? 'contain');
  }, [nativeId, props.resizeMode, updateResizeMode]);

  // Handle animation updates
  useEffect(() => {
    assertSkiaViewApi();
    const mapperId = startMapper(() => {
      'worklet';
      try {
        SkiaViewApi.callJsiMethod(nativeId, 'setProgress', progress.value);
      } catch (e) {
        // ignored, view might not be ready yet
        if (props.debug) {
          console.warn(e);
        }
      }
    }, [progress]);

    return () => {
      stopMapper(mapperId);
    };
  }, [nativeId, progress, props.debug]);

  // Start the animation
  useEffect(() => {
    if (!props.autoPlay || props.progress != null) {
      return;
    }

    const speed = props.speed ?? 1;
    const duration = (skottieAnimation.duration * 1000) / speed;
    const doneCallback = props.onAnimationFinish;

    _progress.value = withRepeat(
      withTiming(
        1,
        {
          duration: duration,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished && doneCallback != null) {
            runOnJS(doneCallback)();
          }
        }
      ),
      props.loop ? -1 : 1,
      false
    );

    return () => {
      cancelAnimation(_progress);
    };
  }, [
    _progress,
    props.autoPlay,
    props.loop,
    props.onAnimationFinish,
    props.progress,
    props.speed,
    skottieAnimation.duration,
  ]);

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
