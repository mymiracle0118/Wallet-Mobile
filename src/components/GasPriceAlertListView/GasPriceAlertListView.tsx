import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';

import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import { applyOpacityToHexColor } from 'theme/Helper/ColorUtils';
import mockData from 'theme/mockData';

import { Button } from '..';
import { styles } from './style';

interface Props {
  title: string;
  onPressSetAlerts: () => void;
  onPressDeleteAlert: (id: any) => void;
}

const GasPriceAlertListView = (props: Props): React.JSX.Element => {
  const { Images, Colors, Gutters, Layout, Fonts } = useTheme();

  const { title, onPressSetAlerts, onPressDeleteAlert } = props;

  const renderItem = ({ item }) => {
    return (
      <View style={styles(Gutters, Layout).rawItemRootConatiner}>
        <View style={styles(Gutters, Layout).textContainer}>
          <Text style={Fonts.textSmallBold}>{item.title}</Text>
          <Text style={Fonts.textSmallTinyGrayOpacityRegular}>
            {item.subTitle}
          </Text>
        </View>

        <Pressable onPress={() => onPressDeleteAlert(item.id)}>
          <Image
            source={Images.ic_trash}
            style={styles(Gutters, Layout).trashIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ ...Layout.fill }}>
      <Text style={[Fonts.textRegularBold, styles(Gutters, Layout).titleText]}>
        {title}
      </Text>
      <Button
        text={t('wallet:set_alert')}
        onPress={onPressSetAlerts}
        backGroundColor={applyOpacityToHexColor(Colors.bottomButtonBG, 0.24)}
        btnStyle={styles(Gutters, Layout).buttonStyle}
        btnTextColor={Colors.textPurple}
      />

      <BottomSheetFlatList
        data={mockData.GasPriceAlertListData}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default GasPriceAlertListView;
