import '@shopify/react-native-skia'; // Important: register skia module
import type {
  NativeSkiaViewProps,
  SkiaProps,
} from '@shopify/react-native-skia/lib/typescript/src';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { SkiaViewApi } from './SkiaViewApi';

import {
  startMapper,
  stopMapper,
  isSharedValue,
} from '@shopify/react-native-skia/src/external/reanimated/moduleWrapper';
import type { AnimationObject } from './types';
import { NativeSkiaSkottieView } from './NaitveSkiaSkottieView';
import { makeSkSkottieFromString } from './index';
import {
  Easing,
  cancelAnimation,
  useFrameCallback,
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

// TODO: make the nativeId safe by sharing it from the rn-skia implementation
const nativeIdCount = { current: 94192 };

export const SkiaSkottieView = (props: SkiaSkottieViewProps) => {
  const mapperIdRef = useRef<number | undefined>(undefined);
  const nativeId = useRef(nativeIdCount.current++).current;
  const prevPropsRef = useRef<SkiaSkottieViewProps>(props);

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

  const updateSrc = useCallback(
    (src: string) => {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(nativeId, 'src', src);
    },
    [nativeId]
  );
  //#endregion

  //#region Callbacks
  const lockToFps = 60;
  const timePerFrame = 1000 / lockToFps;
  const updateProgress = useCallback(
    (progressParam: SkiaSkottieViewProps['progress']) => {
      assertSkiaViewApi();
      if (typeof progressParam === 'number') {
        SkiaViewApi.setJsiProperty(nativeId, 'progress', progressParam);
        return;
      }

      const viewId = nativeId;
      if (isSharedValue(progressParam)) {
        if (mapperIdRef.current != null) {
          stopMapper(mapperIdRef.current);
        }

        // NOTE: We'd have the original FPS in the skottieAnimation that we could use here. Do we want to?
        // Right now this frame lock is a performacne optimization, especially for iOS.
        let lastFrameTimestamp = { value: 0 };
        mapperIdRef.current = startMapper(() => {
          'worklet';

          const now = performance.now();
          if (now - lastFrameTimestamp.value < timePerFrame) {
            return;
          }
          lastFrameTimestamp.value = now;

          SkiaViewApi.setJsiProperty(viewId, 'progress', progressParam.value);
          SkiaViewApi.requestRedraw(viewId);
        }, [progressParam]);
      }
    },
    [nativeId, timePerFrame]
  );
  //#endregion

  //#region Running animation progress
  const isControlledProgress = props.progress != null;
  const isUncontrolledProgress = !isControlledProgress;

  const duration =
    (props.duration ?? skottieAnimation.duration * 1000) / (props.speed ?? 1);

  const autoPlay = props.autoPlay ?? true;

  const _progress = useSharedValue(0);
  const progress = props.progress ?? _progress;
  useEffect(() => {
    if (isUncontrolledProgress || !autoPlay) {
      return;
    }

    _progress.value = withRepeat(
      withTiming(1, {
        duration: duration,
        easing: Easing.linear,
      }),
      props.loop ? -1 : 0,
      false
    );

    return () => {
      if (props.progress == null) {
        cancelAnimation(_progress);
      }
    };
  }, [
    _progress,
    isUncontrolledProgress,
    props.loop,
    props.progress,
    duration,
    autoPlay,
  ]);

  useFrameCallback(
    useCallback(
      ({ timeSinceFirstFrame, timeSincePreviousFrame }) => {
        'worklet';
        if ((timeSincePreviousFrame ?? 0) < timePerFrame) {
          return;
        }
        const progress = (timeSinceFirstFrame % duration) / duration;

        SkiaViewApi.setJsiProperty(nativeId, 'progress', progress);
        SkiaViewApi.requestRedraw(nativeId);
      },
      [duration, nativeId, timePerFrame]
    ),
    isUncontrolledProgress && autoPlay
  );
  //#endregion

  // On mount/unmount:
  useEffect(() => {
    updateSrc(source);
    if (isControlledProgress) {
      updateProgress(progress);
    }

    return () => {
      if (mapperIdRef.current != null) {
        stopMapper(mapperIdRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On props change:
  useEffect(() => {
    const prevProps = prevPropsRef.current;

    if (props.src !== prevProps?.src) {
      updateSrc(source);
    }
    if (props.progress !== prevProps?.progress && isControlledProgress) {
      updateProgress(progress);
    }

    prevPropsRef.current = props;
  }, [
    isControlledProgress,
    progress,
    props,
    source,
    updateProgress,
    updateSrc,
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
