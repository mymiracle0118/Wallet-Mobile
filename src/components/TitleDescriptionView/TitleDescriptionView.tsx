/* eslint-disable react/require-default-props */
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../../hooks';
import { style } from './style';

type Props = {
  title: string;
  subTitle?: string;
  rightIconPath?: ImageSourcePropType;
  containerStyle?: ViewStyle;
  textWrapperStyle?: ViewStyle;
  titleStyle?: TextStyle | [TextStyle];
  subTitleStyle?: TextStyle | [TextStyle];
};

export default function TitleDescriptionView({
  title,
  subTitle,
  rightIconPath,
  containerStyle,
  textWrapperStyle,
  titleStyle,
  subTitleStyle,
}: Props) {
  const { Fonts, Gutters, Colors, Layout } = useTheme();

  return (
    <View style={[style(Layout, Gutters, Colors).container, containerStyle]}>
      <View style={[style(Layout, Gutters, Colors).textView, textWrapperStyle]}>
        <Text style={[Fonts.textSmallWhiteBold, titleStyle]}>{title}</Text>
        {subTitle && (
          <Text style={[Fonts.textSmallTinyGrayOpacityRegular, subTitleStyle]}>
            {subTitle}
          </Text>
        )}
      </View>
      {rightIconPath && (
        <Image
          style={[style(Layout, Gutters, Colors).icon]}
          resizeMode="contain"
          source={rightIconPath}
        />
      )}
    </View>
  );
}
TitleDescriptionView.defaultProps = {
  subTitle: '',
  rightIconPath: undefined,
};
