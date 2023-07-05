import '@shopify/react-native-skia'; // Important: register skia module
import type {
  NativeSkiaViewProps,
  SkRect,
  SkiaValue,
} from '@shopify/react-native-skia/lib/typescript/src';
import React from 'react';
import { requireNativeComponent } from 'react-native';
import { SkiaViewApi } from './SkiaViewApi';

// TODO: web support
const NativeSkiaSkottieView =
  requireNativeComponent<NativeSkiaViewProps>('SkiaSkottieView');

export interface SkiaSkottieViewProps extends NativeSkiaViewProps {
  src: string;
}

const nativeId = { current: 94192 };

export class SkiaSkottieView extends React.Component<SkiaSkottieViewProps> {
  constructor(props: SkiaSkottieViewProps) {
    super(props);
    this._nativeId = nativeId.current++;
    const { src } = props;
    if (src) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, 'src', src);
    }
  }

  private _nativeId: number;

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaSkottieViewProps) {
    const { src } = this.props;
    if (src !== prevProps.src) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, 'src', src);
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
  console.log({ SkiaViewApi });
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
