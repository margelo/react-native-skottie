import * as React from 'react';
import {
  Text,
  View,
  Button,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import {
  SkiaSkottieView,
  AnimationObject,
  type SkiaSkottieViewRef,
} from 'react-native-skottie';
import * as Animations from './animations';
import LottieView from 'lottie-react-native';
import DotLottieAnimation from './animations/Hands.lottie';
import { useMemo } from 'react';

const animations = {
  ...Animations,
  DotLottieAnimation,
};

function SkottieAnimation({ source }: { source: AnimationObject }) {
  return (
    <SkiaSkottieView
      resizeMode="contain"
      style={styles.flex1}
      source={source}
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
  const skottieRef = React.useRef<SkiaSkottieViewRef>(null);

  return (
    <View style={styles.flex1}>
      <Button
        title="Play"
        onPress={() => {
          skottieRef.current?.play();
        }}
      />
      <Button
        title="Pause"
        onPress={() => {
          skottieRef.current?.pause();
        }}
      />
      <Button
        title="Reset"
        onPress={() => {
          skottieRef.current?.reset();
        }}
      />
      <SkiaSkottieView
        ref={skottieRef}
        resizeMode="contain"
        style={styles.flex1}
        source={source}
        loop={true}
      />
    </View>
  );
}

function SkottiePropsAPI({ source }: { source: AnimationObject }) {
  const [loop, setLoop] = React.useState(true);
  const [autoPlay, setAutoPlay] = React.useState(true);
  const [speed, setSpeed] = React.useState(1);
  const [_progress, setProgress] = React.useState(0);

  return (
    <View style={styles.flex1}>
      <Button
        title="Play"
        onPress={() => {
          setAutoPlay(true);
        }}
      />
      <Button
        title="Pause"
        onPress={() => {
          setAutoPlay(false);
        }}
      />
      <Button
        title="Reset"
        onPress={() => {
          setProgress(0);
        }}
      />
      <Button
        title="Loop"
        onPress={() => {
          setLoop((loop) => !loop);
        }}
      />
      <Button
        title="Speed"
        onPress={() => {
          setSpeed((speed) => speed + 1);
        }}
      />
      <SkiaSkottieView
        resizeMode="contain"
        style={styles.flex1}
        source={source}
        loop={loop}
        autoPlay={autoPlay}
        speed={speed}
        // TODO: that wouldn't work at the minute, and the imperative API should be used!
        // progress={progress}
        onAnimationFinish={() => {
          console.log('onAnimationFinish');
        }}
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

type ExampleType =
  | 'default'
  | 'imperative'
  | 'props-controlled'
  | 'progress-controlled';

function ExampleTypeSwitches({
  exampleType,
  setExampleType,
}: {
  exampleType: ExampleType;
  setExampleType: (type: ExampleType) => void;
}) {
  return (
    <View>
      <View style={styles.switchOption}>
        <Switch
          value={exampleType === 'default'}
          onValueChange={() => setExampleType('default')}
        />
        <Text>None</Text>
      </View>
      <View style={styles.switchOption}>
        <Switch
          value={exampleType === 'imperative'}
          onValueChange={() => setExampleType('imperative')}
        />
        <Text>Imperative API</Text>
      </View>
      <View style={styles.switchOption}>
        <Switch
          value={exampleType === 'props-controlled'}
          onValueChange={() => setExampleType('props-controlled')}
        />
        <Text>Props controlled</Text>
      </View>
      <View style={styles.switchOption}>
        <Switch
          value={exampleType === 'progress-controlled'}
          onValueChange={() => setExampleType('progress-controlled')}
        />
        <Text>Progress controlled</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [type, setType] = React.useState<'skottie' | 'lottie'>('skottie');
  const [exampleType, setExampleType] = React.useState<ExampleType>('default');
  const [animation, setAnimation] = React.useState<
    AnimationObject | undefined
  >();

  const animationContent = useMemo(() => {
    if (animation == null) return null;

    if (type === 'skottie') {
      switch (exampleType) {
        case 'default':
          return <SkottieAnimation source={animation} />;
        case 'imperative':
          return <SkottieImperativeAPI source={animation} />;
        case 'props-controlled':
          return <SkottiePropsAPI source={animation} />;
        case 'progress-controlled':
          return <SkottieAnimation source={animation} />;
      }
    }
    if (type === 'lottie') {
      switch (exampleType) {
        case 'default':
          return <LottieAnimation source={animation} />;
        case 'imperative':
          return <LottieImperativeAPI source={animation} />;
        case 'props-controlled':
          return <LottieAnimation source={animation} />;
        case 'progress-controlled':
          return <LottieAnimation source={animation} />;
      }
    }
  }, [animation, exampleType, type]);

  return (
    <SafeAreaView style={styles.flex1}>
      {animation == null ? (
        <ScrollView style={styles.flex1}>
          <Text style={styles.heading}>Example type</Text>
          <ExampleTypeSwitches
            exampleType={exampleType}
            setExampleType={setExampleType}
          />

          <Text style={styles.heading}>Skottie</Text>
          {Object.keys(animations).map((key) => (
            <View key={`skottie-${key}`}>
              <Button
                title={key}
                onPress={() => {
                  setType('skottie');
                  // @ts-expect-error Animations not having right type
                  setAnimation(animations[key]);
                }}
              />
            </View>
          ))}
          <Text style={styles.heading}>Lottie</Text>
          {Object.keys(animations).map((key) => (
            <View key={`lottie-${key}`}>
              <Button
                title={key}
                onPress={() => {
                  setType('lottie');
                  // @ts-expect-error Animations not having right type
                  setAnimation(animations[key]);
                }}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.flex1}>
          {animationContent}
          <Button
            title="Back"
            onPress={() => {
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
  heading: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
