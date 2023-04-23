import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { install } from 'react-native-skia-skottie';

export default function App() {
  const [result, setResult] = React.useState<boolean | undefined>();

  React.useEffect(() => {
    const res = install();
    setResult(res);
  }, []);

  // console.log(global.SkiaApi_SkottieCtor());

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
