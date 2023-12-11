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

function SkottieImperativeAPI({ source }: { source: AnimationObject }) {
  return (
    <View style={styles.flex1}>
      <Button title="Play" onPress={() => {}} />
      <Button title="Pause" onPress={() => {}} />
      <Button title="Resume" onPress={() => {}} />
      <SkiaSkottieView
        resizeMode="contain"
        style={styles.flex1}
        src={source}
        loop={true}
      />
    </View>
  );
}

function LottieImperativeAPI({ source }: { source: AnimationObject }) {
  const lottieRef = React.useRef<LottieView>(null);

  return (
    <View style={styles.flex1}>
      <Button
        title="Play"
        onPress={() => {
          lottieRef.current?.play();
        }}
      />
      <Button
        title="Pause"
        onPress={() => {
          lottieRef.current?.pause();
        }}
      />
      <Button
        title="Resume"
        onPress={() => {
          lottieRef.current?.resume();
        }}
      />
      <Button
        title="Reset"
        onPress={() => {
          lottieRef.current?.reset();
        }}
      />
      <LottieView
        ref={lottieRef}
        resizeMode="contain"
        style={styles.flex1}
        source={source}
        loop={true}
        autoPlay={false}
      />
    </View>
  );
}

export default function App() {
  const [type, setType] = React.useState<'skottie' | 'lottie'>('skottie');
  const [isImperativeAPI, setIsImperativeAPI] = React.useState(false);
  const [animation, setAnimation] = React.useState();

  return (
    <SafeAreaView style={styles.flex1}>
      {animation == null ? (
        <View style={styles.flex1}>
          <Button
            title="Skottie imperative API"
            onPress={() => {
              setType('skottie');
              setAnimation(Animations.FastMoney);
              setIsImperativeAPI(true);
            }}
          />
          <Button
            title="Lottie imperative API"
            onPress={() => {
              setType('lottie');
              setAnimation(Animations.FastMoney);
              setIsImperativeAPI(true);
            }}
          />

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
            isImperativeAPI ? (
              <SkottieImperativeAPI source={animation} />
            ) : (
              <SkottieAnimation source={animation} />
            )
          ) : isImperativeAPI ? (
            <LottieImperativeAPI source={animation} />
          ) : (
            <LottieAnimation source={animation} />
          )}
          <Button
            title="Back"
            onPress={() => {
              setIsImperativeAPI(false);
              setAnimation(undefined);
            }}
          />
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
