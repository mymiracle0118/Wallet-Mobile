import React from 'react';

import useTheme from 'hooks/useTheme';
import Lottie from 'lottie-react-native';
import AnimationType from 'theme/Enums';

type Props = {
  type: AnimationType;
};

export default function LottieAnimations({ type }: Props) {
  const { Animations } = useTheme();

  switch (type) {
    case AnimationType.Celebration:
      return (
        <Lottie
          testID="lottie-animation-view"
          source={Animations.congratulations}
          autoPlay
          loop
        />
      );

    default:
      return <></>;
  }
}
