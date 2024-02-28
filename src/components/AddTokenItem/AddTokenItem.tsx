import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { scale } from 'react-native-size-scaling';

import Variables from 'theme/Variables';

import { useTheme } from '../../hooks';
import VerticalSeparatorView from '../VerticalSeparatorView/VerticalSeparatorView';
import { style } from './style';

type Props = {
  item: any;
  selectedId: any;
  onSelect: (id: string) => void;
};

const AddTokenItem = (props: Props) => {
  const { Layout, Gutters, Fonts, Colors } = useTheme();

  const { item, selectedId, onSelect } = props;

  return (
    <View style={[style(Gutters, Layout).container]}>
      <Image
        style={style(Gutters, Layout).icon}
        resizeMode="contain"
        source={item?.image}
      />
      <View style={style(Gutters, Layout).subView}>
        <View style={[Layout.fill]}>
          <View style={Layout.row}>
            <Text style={[Fonts.titleSmall]} numberOfLines={1}>
              {item?.title}
            </Text>
            <VerticalSeparatorView spacing={Variables.MetricsSizes.tiny} />
            <Text
              numberOfLines={1}
              style={{ ...Fonts.titleSmall, color: Colors.grayText }}
            >
              {item?.networkName}
            </Text>
          </View>
          <Text style={[Fonts.textTinyGrayLightRegular]}>{item?.subTitle}</Text>
        </View>
        {/* <View style={[Layout.alignItemsEnd]}>
          <Text style={[Fonts.titleSmall]}>
            {getRoundDecimalValue(item?.amount) ?? '0'}
          </Text>
          <Text style={[Fonts.textTinyGrayLightRegular]}>
            {USDollar().format(item?.amount * item?.usdAmount)}
          </Text>
        </View> */}
      </View>
      <View style={style(Gutters, Layout).checkBox}>
        <BouncyCheckbox
          testID="bouncy-checkbox"
          isChecked={selectedId === item.id}
          disableBuiltInState
          iconImageStyle={{ tintColor: Colors.blackGray }}
          fillColor={Colors.textPurple}
          innerIconStyle={{ borderColor: Colors.white }}
          size={scale(18)}
          onPress={() => onSelect(item.id)}
        />
      </View>
    </View>
  );
};

export default memo(AddTokenItem);
