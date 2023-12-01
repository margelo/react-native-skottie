import * as React from 'react';

import { StyleSheet, SafeAreaView, View } from 'react-native';
import { SkiaSkottieView } from 'react-native-skottie';
import LottieAnimation from './Hands.json';

export default function App() {
  return (
    <SafeAreaView style={styles.flex1}>
      <View
        style={{
          height: 500,
          width: 300,
          backgroundColor: 'lightgrey',
        }}
      >
        <SkiaSkottieView
          resizeMode="contain"
          style={styles.flex1}
          src={LottieAnimation}
          autoPlay={true}
          loop={false}
          onAnimationFinish={() => console.log('Animation finished')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
