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

// TODO: would be nice to have this properly exported publicly
import {
  startMapper,
  isSharedValue,
} from '@shopify/react-native-skia/src/external/reanimated/moduleWrapper';
// import { startMapper, isSharedValue } from 'react-native-reanimated';

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

    if (typeof props.progress === 'number') {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, 'progress', props.progress);
    }

    // TODO: performance, i can imagine we might send more updates than needed
    //       so we might want to make sure we render only each frame (60fps)
    const viewId = this._nativeId;
    if (isSharedValue(props.progress)) {
      // TODO: stop the mapper
      const mapperId = startMapper(() => {
        'worklet';
        SkiaViewApi.setJsiProperty(viewId, 'progress', props.progress.value);
        // TODO: we could schedule this call in the native side directly when sitting the prop
        SkiaViewApi.requestRedraw(viewId);
      }, [props.progress]);
      console.log('mapperId', mapperId);
    }
  }

  private _nativeId: number;

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
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, 'progress', progress);
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
