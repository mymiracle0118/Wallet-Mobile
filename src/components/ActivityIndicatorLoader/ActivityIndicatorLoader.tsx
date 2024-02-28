import React from 'react';
import { ActivityIndicator, ViewStyle } from 'react-native';

import useTheme from 'hooks/useTheme';

import { style } from './styles';

type Props = {
  size?: string;
  color?: string;
  loaderStyle?: ViewStyle;
};

const ActivityIndicatorLoader = ({ size, color, loaderStyle }: Props) => {
  const { Colors, Gutters } = useTheme();

  return (
    <ActivityIndicator
      style={[style(Gutters, Colors).loader, { ...loaderStyle }]}
      color={color ? color : Colors.primary}
      size={size ? size : 'large'}
    />
  );
};

ActivityIndicatorLoader.defaultProps = {
  size: '',
  color: '',
  loaderStyle: undefined,
};

export default ActivityIndicatorLoader;
