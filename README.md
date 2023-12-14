# react-native-skottie

Skottie module for react-native-skia

## Installation

```sh
npm install react-native-skottie
```

or

```sh
yarn add react-native-skottie
```

## Usage

```tsx
import * as React from 'react';

import { SafeAreaView } from 'react-native';
import { Skottie } from 'react-native-skottie';
import HandsLottie from './Hands.json';

export default function App() {
  return (
    <Skottie style={styles.flex1}>
      <SkiaSkottieView style={styles.flex1} source={HandsLottie} />
    </Skottie>
  );
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
