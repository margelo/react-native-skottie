import * as React from 'react';

import { StyleSheet, SafeAreaView } from 'react-native';
import { SkiaSkottieView } from 'react-native-skia-skottie';
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
        src={HandsLottie}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
