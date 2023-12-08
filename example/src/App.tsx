import * as React from 'react';
import { View, Button, StyleSheet, SafeAreaView } from 'react-native';
import { SkiaSkottieView, AnimationObject } from 'react-native-skottie';
import * as Animations from './animations';

function Animation({ source }: { source: AnimationObject }) {
  return (
    <SkiaSkottieView
      resizeMode="contain"
      style={styles.flex1}
      src={source}
      autoPlay={true}
      loop={true}
    />
  );
}

export default function App() {
  const [animation, setAnimation] = React.useState();

  return (
    <SafeAreaView style={styles.flex1}>
      {animation == null ? (
        Object.keys(Animations).map((key) => (
          <View key={key}>
            {/* @ts-expect-error Animations not having right type */}
            <Button title={key} onPress={() => setAnimation(Animations[key])} />
          </View>
        ))
      ) : (
        <View style={styles.flex1}>
          <Animation source={animation} />
          <Button title="Back" onPress={() => setAnimation(undefined)} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
