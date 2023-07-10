import '@shopify/react-native-skia'; // Important: register skia module
import type {
  NativeSkiaViewProps,
  SkRect,
  SkiaProps,
  SkiaValue,
} from '@shopify/react-native-skia/lib/typescript/src';
import React from 'react';
import { requireNativeComponent } from 'react-native';
import { SkiaViewApi } from './SkiaViewApi';

import {
  startMapper,
  stopMapper,
  isSharedValue,
} from '@shopify/react-native-skia/src/external/reanimated/moduleWrapper';

// TODO: web support
const NativeSkiaSkottieView =
  requireNativeComponent<NativeSkiaViewProps>('SkiaSkottieView');

export type SkiaSkottieViewProps = SkiaProps<
  NativeSkiaViewProps & {
    src: string;
    progress: number;
  }
>;

// TODO: make the nativeId safe by sharing it from the rn-skia implementation
const nativeId = { current: 94192 };

export class SkiaSkottieView extends React.Component<SkiaSkottieViewProps> {
  constructor(props: SkiaSkottieViewProps) {
    super(props);
    this._nativeId = nativeId.current++;

    if (typeof props.src === 'string') {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, 'src', props.src);
    }

    this.updateProgress(props.progress);
  }

  private _nativeId: number;
  private _mapperId: number | undefined = undefined;

  private updateProgress(progress: SkiaSkottieViewProps['progress']) {
    assertSkiaViewApi();
    if (typeof progress === 'number') {
      SkiaViewApi.setJsiProperty(this._nativeId, 'progress', progress);
      return;
    }

    // TODO: performance, i can imagine we might send more updates than needed
    //       so we might want to make sure we render only each frame (60fps)
    const viewId = this._nativeId;
    if (isSharedValue(progress)) {
      if (this._mapperId != null) {
        stopMapper(this._mapperId);
      }

      const lockToFps = 60;
      const timePerFrame = 1000 / lockToFps;
      let lastFrameTimestamp = { value: 0 };
      this._mapperId = startMapper(() => {
        'worklet';

        // Only re-render every timePerFrame / lockToFps
        const now = performance.now();
        if (now - lastFrameTimestamp.value < timePerFrame) {
          return;
        }
        lastFrameTimestamp.value = now;

        SkiaViewApi.setJsiProperty(viewId, 'progress', progress.value);
        // TODO: we could schedule this call in the native side directly when sitting the prop
        SkiaViewApi.requestRedraw(viewId);
      }, [progress]);
    }
  }

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaSkottieViewProps) {
    const { src, progress } = this.props;
    if (src !== prevProps.src) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, 'src', src);
    }
    if (progress !== prevProps.progress) {
      this.updateProgress(progress);
    }
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(rect?: SkRect) {
    assertSkiaViewApi();
    return SkiaViewApi.makeImageSnapshot(this._nativeId, rect);
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    assertSkiaViewApi();
    SkiaViewApi.requestRedraw(this._nativeId);
  }

  /**
   * Registers one or move values as a dependant value of the Skia View. The view will
   * The view will redraw itself when any of the values change.
   * @param values Values to register
   */
  public registerValues(values: SkiaValue<unknown>[]): () => void {
    assertSkiaViewApi();
    return SkiaViewApi.registerValuesInView(this._nativeId, values);
  }

  render() {
    const { mode, debug = false, ...viewProps } = this.props;

    return (
      <NativeSkiaSkottieView
        collapsable={false}
        nativeID={`${this._nativeId}`}
        mode={mode}
        debug={debug}
        {...viewProps}
      />
    );
  }
}

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
