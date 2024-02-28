/* eslint-disable react/require-default-props */
import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

import { useTheme } from '../../hooks';
import { style } from './styles';

type Props = {
  text: string;
  onPress: () => void;
  backGroundColor?: string;
  btnStyle?: ViewStyle;
  btnTextColor?: string;
  disabled?: boolean;
  testId?: string;
};

const Button = ({
  text,
  onPress,
  backGroundColor,
  btnStyle,
  btnTextColor,
  disabled,
  testId,
}: Props) => {
  const { Layout, Colors, Fonts, Gutters } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      testID={testId ? testId : 'button'}
      onPress={onPress}
      style={({ pressed }) => [
        style(
          Gutters,
          Layout,
          pressed,
          backGroundColor ? backGroundColor : Colors.primary,
        ).button,
        { ...btnStyle },
      ]}
    >
      <Text
        style={[
          Fonts.textRegularBold,
          { color: btnTextColor ? btnTextColor : Colors.white },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
};

Button.defaultProps = {
  backGroundColor: '',
  btnTextColor: '',
  disabled: false,
};

export default Button;
