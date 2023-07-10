import '@shopify/react-native-skia'; // Important: register skia module
import type {
  NativeSkiaViewProps,
  SkiaProps,
} from '@shopify/react-native-skia/lib/typescript/src';
import React, { useCallback, useEffect, useRef } from 'react';
import { SkiaViewApi } from './SkiaViewApi';

import {
  startMapper,
  stopMapper,
  isSharedValue,
} from '@shopify/react-native-skia/src/external/reanimated/moduleWrapper';
import type { AnimationObject } from './types';
import { NativeSkiaSkottieView } from './NaitveSkiaSkottieView';

export type SkiaSkottieViewProps = NativeSkiaViewProps & {
  src: string | AnimationObject;
} & SkiaProps<{ progress: number }>;

// TODO: make the nativeId safe by sharing it from the rn-skia implementation
const nativeIdCount = { current: 94192 };

export const SkiaSkottieView = (props: SkiaSkottieViewProps) => {
  const mapperIdRef = useRef<number | undefined>(undefined);
  const nativeId = useRef(nativeIdCount.current++).current;
  const prevPropsRef = useRef<SkiaSkottieViewProps>();

  const updateSrc = useCallback(
    (src: SkiaSkottieViewProps['src']) => {
      assertSkiaViewApi();

      let source;
      if (typeof src === 'string') {
        source = src;
      } else if (typeof src === 'object') {
        source = JSON.stringify(src);
      } else {
        throw Error('[react-native-skottie] Invalid src prop provided.');
      }

      SkiaViewApi.setJsiProperty(nativeId, 'src', source);
    },
    [nativeId]
  );

  const updateProgress = useCallback(
    (progress: SkiaSkottieViewProps['progress']) => {
      assertSkiaViewApi();
      if (typeof progress === 'number') {
        SkiaViewApi.setJsiProperty(nativeId, 'progress', progress);
        return;
      }

      const viewId = nativeId;
      if (isSharedValue(progress)) {
        if (mapperIdRef.current != null) {
          stopMapper(mapperIdRef.current);
        }

        const lockToFps = 60;
        const timePerFrame = 1000 / lockToFps;
        let lastFrameTimestamp = { value: 0 };
        mapperIdRef.current = startMapper(() => {
          'worklet';

          const now = performance.now();
          if (now - lastFrameTimestamp.value < timePerFrame) {
            return;
          }
          lastFrameTimestamp.value = now;

          SkiaViewApi.setJsiProperty(viewId, 'progress', progress.value);
          SkiaViewApi.requestRedraw(viewId);
        }, [progress]);
      }
    },
    [nativeId]
  );

  useEffect(() => {
    return () => {
      if (mapperIdRef.current != null) {
        stopMapper(mapperIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const prevProps = prevPropsRef.current;

    if (props.src !== prevProps?.src) {
      updateSrc(props.src);
    }
    if (props.progress !== prevProps?.progress) {
      updateProgress(props.progress);
    }

    prevPropsRef.current = props;
  }, [props, updateProgress, updateSrc]);

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
