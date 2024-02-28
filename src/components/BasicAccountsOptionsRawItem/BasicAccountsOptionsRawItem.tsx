import React from 'react';
import { Image, Pressable, Text } from 'react-native';
import { scale } from 'react-native-size-scaling';

import useTheme from 'hooks/useTheme';
import { t } from 'i18next';

import { style } from './style';

type Props = {
  item: any;
  onPress: () => void;
};

const BasicAccountsOptionsRawItem = (props: Props) => {
  const { Gutters, Layout, Fonts, Colors } = useTheme();

  const { item, onPress } = props;

  return (
    <Pressable
      onPress={onPress}
      style={style(Gutters, Layout, Colors).rawRootContainer}
    >
      <Text style={Fonts.textSmallBoldWhite}>{t(item.title)}</Text>
      <Image
        testID="right_image"
        style={{
          height: scale(12),
          width: scale(12),
        }}
        resizeMode="contain"
        source={item.image}
      />
    </Pressable>
  );
};

export default BasicAccountsOptionsRawItem;
