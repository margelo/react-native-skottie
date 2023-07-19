import '@shopify/react-native-skia'; // Important: register skia module
import type {
  NativeSkiaViewProps,
  SkiaProps,
} from '@shopify/react-native-skia/lib/typescript/src';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { SkiaViewApi } from './SkiaViewApi';

import type { AnimationObject } from './types';
import { NativeSkiaSkottieView } from './NaitveSkiaSkottieView';

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
  const nativeId = useRef(nativeIdCount.current++).current;

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

  const updateSrc = useCallback(
    (src: string) => {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(nativeId, 'src', src);
    },
    [nativeId]
  );
  //#endregion

  useEffect(() => {
    updateSrc(source);
  }, [source, updateSrc]);

  const { debug = false, ...viewProps } = props;

  return (
    <NativeSkiaSkottieView
      collapsable={false}
      nativeID={`${nativeId}`}
      mode={'continuous'}
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
