import React, { useEffect } from 'react';
// import { SkiaSkottieView } from 'react-native-skottie';
import Hands from './animations/Hands.json';
import { TextInput, View } from 'react-native';
import performance, { PerformanceObserver } from 'react-native-performance';
import PerformanceStats from 'react-native-performance-stats';
import Animated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

Animated.addWhitelistedNativeProps({
  text: true,
});
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function PerformanceCounter() {
  const [startTime, setStartTime] = React.useState();

  useEffect(() => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const entry = entries[0];
      if (entry == null) return;

      setStartTime(entry.duration);
    }).observe({ type: 'measure', buffered: true });
  }, []);

  const FPS = useSharedValue(0);
  useEffect(() => {
    const listener = PerformanceStats.addListener((stats) => {
      FPS.value = stats.uiFps;
    });

    PerformanceStats.start();

    return () => {
      listener.remove();
      PerformanceStats.stop();
    };
  }, [FPS]);

  const fpsProps = useAnimatedProps(() => {
    let text = 'No FPS';
    if (FPS.value > 0) {
      text = `FPS: ${FPS.value.toFixed(0)}`;
    }
    return {
      text: text,
    };
  }, [FPS]);

  return (
    <View>
      <AnimatedTextInput
        animatedProps={fpsProps}
        style={{
          fontSize: 20,
          color: 'darkgrey',
          fontWeight: 'bold',
        }}
      />
      <TextInput
        style={{
          fontSize: 20,
          color: 'darkgrey',
          fontWeight: 'bold',
        }}
        value={
          startTime != null ? `TTI: ${(startTime / 1000).toFixed(2)}s` : ''
        }
      />
    </View>
  );
}

function finishMesaure() {
  performance.measure('TTI', 'nativeLaunchStart');
}

export default function () {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
        }}
      >
        <PerformanceCounter />
      </View>
      <LottieView
        source={Hands}
        style={{ flex: 1 }}
        autoPlay={true}
        onAnimationLoaded={finishMesaure}
      />
    </View>
  );
}
