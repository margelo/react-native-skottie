import React from 'react';
import { useFont } from '@shopify/react-native-skia';
import type { FC } from 'react';
import { Skottie } from 'react-native-skottie';

export const Example: FC = () => {
  const font = useFont(require('./sable.ttf'));

  return (
    <Skottie
      source={require('./animations/Safe.json')}
      style={{ width: '100%', height: '100%' }}
      autoPlay
      loop
    />
  );
};
