import type {
  SkCanvas,
  SkJSIInstance,
  SkRect,
} from '@shopify/react-native-skia';

/**
 * Serialized animation as generated from After Effects
 */
export interface AnimationObject {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm?: string;
  ddd?: number;
  assets: any[];
  layers: any[];
  markers?: any[];
}

export interface SkSkottie extends SkJSIInstance<'Skottie'> {
  duration: number;
  fps: number;
  render: (canvas: SkCanvas, rect: SkRect) => void;
  seek: (progress: number) => void;
}

export type SkottieViewSource = number | string | AnimationObject | SkSkottie;
