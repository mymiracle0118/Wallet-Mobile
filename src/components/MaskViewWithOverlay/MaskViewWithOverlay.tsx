import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';

import useTheme from 'hooks/useTheme';

import { style } from './styles';

type Props = {
  overlayText: string;
  onPress: () => void;
};

export default function MaskViewWithOverlay({ overlayText, onPress }: Props) {
  const { Gutters, Layout, Images, Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={style(Gutters, Layout, Colors).container}
    >
      <ImageBackground
        style={style(Gutters, Layout, Colors).maskImageBg}
        source={Images.ic_mask}
      />
      <View style={style(Gutters, Layout, Colors).maskOverLayView}>
        <Image
          style={style(Gutters, Layout, Colors).image}
          source={Images.ic_eye}
        />
        <Text style={{ ...Fonts.textRegularBold, ...Gutters.tinyLMargin }}>
          {overlayText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
