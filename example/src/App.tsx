import * as React from 'react';

import { StyleSheet, SafeAreaView } from 'react-native';
import {
  makeSkSkottieFromString,
  SkiaSkottieView,
} from 'react-native-skia-skottie';
import HandsLottie from './Hands.json';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function App() {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    // TODO: we don't know how long the animation is, use JsiSkSkottie here?
    //       but we might want to avoid creating the same animation twice? Not sure
    //       how expensive it is.
    progress.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
  }, [progress]);

  return (
    <SafeAreaView style={styles.flex1}>
      <SkiaSkottieView
        style={styles.flex1}
        progress={progress}
        debug={true}
        src={JSON.stringify(HandsLottie)}
      />
    </SafeAreaView>
  );
}

function SimpleExample() {
  const skottie = React.useMemo(
    () => makeSkSkottieFromString(JSON.stringify(HandsLottie)),
    []
  );

  const progress = useTiming(
    {
      from: 0,
      to: 1,
      loop: true,
    },
    {
      duration: skottie.duration * 1000,
      easing: Easing.linear,
    }
  );

  const onDraw = useDrawCallback((canvas, info) => {
    skottie.seek(progress.current);
    const rect = Skia.XYWHRect(0, 0, info.width, info.height);
    // const paint = Skia.Paint();
    // paint.setColor(Skia.Color('#000000'));
    // canvas.drawRect(rect, paint);
    skottie.render(canvas, rect);
  });

  const skRef = React.useRef<SkiaView>(null);
  React.useEffect(() => {
    skRef.current?.registerValues([progress]);
  }, [progress]);

  return (
    <SafeAreaView style={styles.flex1}>
      <SkiaView ref={skRef} style={styles.flex1} onDraw={onDraw} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
