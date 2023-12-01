import * as React from 'react';

import { StyleSheet, SafeAreaView } from 'react-native';
import { SkiaSkottieView } from 'react-native-skottie';
import HandsLottie from './animation2.json';

export default function App() {
  return (
    <SafeAreaView style={styles.flex1}>
      <SkiaSkottieView style={styles.flex1} src={HandsLottie} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
