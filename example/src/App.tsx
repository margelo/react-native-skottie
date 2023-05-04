import * as React from 'react';

import { StyleSheet, SafeAreaView } from 'react-native';
// import { makeSkSkottieFromString } from 'react-native-skia-skottie';
import HandsLottie from './Hands.json';
// import {
//   Skia,
//   SkiaView,
//   useDrawCallback,
//   useTiming,
//   Easing,
// } from '@shopify/react-native-skia';

export default function App() {
  // const skottie = React.useMemo(
  //   () => makeSkSkottieFromString(JSON.stringify(HandsLottie)),
  //   []
  // );

  // const progress = useTiming(
  //   {
  //     from: 0,
  //     to: 1,
  //     loop: true,
  //   },
  //   {
  //     duration: skottie.duration * 1000,
  //     easing: Easing.linear,
  //   }
  // );

  // const onDraw = useDrawCallback((canvas, info) => {
  //   skottie.seek(progress.current);
  //   skottie.render(canvas, Skia.XYWHRect(0, 0, info.width, info.height));
  // });

  // const skRef = React.useRef<SkiaView>(null);
  // React.useEffect(() => {
  //   skRef.current?.registerValues([progress]);
  // }, [progress]);

  return null;
  // return (
  //   <SafeAreaView style={styles.flex1}>
  //     <SkiaView ref={skRef} style={styles.flex1} onDraw={onDraw} />
  //   </SafeAreaView>
  // );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
