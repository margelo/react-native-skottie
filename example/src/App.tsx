import * as React from 'react';
import { Text, View, Button, StyleSheet, SafeAreaView } from 'react-native';
import { SkiaSkottieView, AnimationObject } from 'react-native-skottie';
import * as Animations from './animations';
import LottieView from 'lottie-react-native';

function SkottieAnimation({ source }: { source: AnimationObject }) {
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

function LottieAnimation({ source }: { source: AnimationObject }) {
  return (
    <LottieView
      resizeMode="contain"
      style={styles.flex1}
      source={source}
      autoPlay={true}
      loop={true}
    />
  );
}

export default function App() {
  const [type, setType] = React.useState<'skottie' | 'lottie'>('skottie');
  const [animation, setAnimation] = React.useState();

  return (
    <SafeAreaView style={styles.flex1}>
      {animation == null ? (
        <View style={styles.flex1}>
          <Text>Skottie</Text>
          {Object.keys(Animations).map((key) => (
            <View key={`skottie-${key}`}>
              <Button
                title={key}
                onPress={() => {
                  setType('skottie');
                  // @ts-expect-error Animations not having right type
                  setAnimation(Animations[key]);
                }}
              />
            </View>
          ))}
          <Text>Lottie</Text>
          {Object.keys(Animations).map((key) => (
            <View key={`lottie-${key}`}>
              <Button
                title={key}
                onPress={() => {
                  setType('lottie');
                  // @ts-expect-error Animations not having right type
                  setAnimation(Animations[key]);
                }}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.flex1}>
          {type === 'skottie' ? (
            <SkottieAnimation source={animation} />
          ) : (
            <LottieAnimation source={animation} />
          )}
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
