import React, { useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Button,
  HeaderWithTitleAndSubTitle,
  SafeAreaWrapper,
} from 'components/index';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import { RootState } from 'store/index';
import { updateSettingConfig } from 'store/userInfo';
import { applyOpacityToHexColor } from 'theme/Helper/ColorUtils';

import { style } from './style';

const AutolockTimer: React.FC<any> = () => {
  const { Common, Gutters, Layout, Colors, Fonts } = useTheme();

  const navigation = useNavigation<StackNavigationProp<any>>();
  // const { title } = useRoute().params as any;
  const autoLockTimer = useSelector(
    (state: RootState) =>
      state.userInfo.data.config.autoLockTimer / (60 * 1000) + '',
  );
  const [minVal, setMinVal] = useState(autoLockTimer);
  const dispatch = useDispatch();

  const handleSave = () => {
    // covert time entered in minutes to milliseconds and then store it in redux store and it it will store 0 by default if no value set
    dispatch(
      updateSettingConfig({
        config: {
          autoLockTimer: parseFloat(minVal) * 60 * 1000,
        },
      }),
    );
    navigation.goBack();
  };

  return (
    <SafeAreaWrapper applyToOnlyTopEdge={false}>
      <View style={Common.containerFillWithSmallHPadding}>
        <HeaderWithTitleAndSubTitle
          title={t('setting:scr_title_auto_lock_timer')}
          subTitle={t('setting:timer_subtitle')}
          shouldHideBack={true}
          shouldShowCancel={true}
        />

        <View
          style={[
            style(Gutters, Layout, Colors).descContainer,
            Platform.OS === 'ios' && Gutters.tinySmallVPadding,
          ]}
        >
          <TextInput
            onChangeText={setMinVal}
            placeholder={'0'}
            value={minVal}
            maxLength={3}
            style={[Fonts.textRegular, Layout.fill]}
            placeholderTextColor={applyOpacityToHexColor(
              Colors?.textGray600,
              0.6,
            )}
            keyboardType="number-pad"
          />
          <Text
            style={[Fonts.textSmallTinyGrayOpacityRegular, Gutters.tinyLMargin]}
          >
            {t('setting:mins')}
          </Text>
        </View>

        <Button
          text={t('common:Save')}
          onPress={handleSave}
          backGroundColor={
            minVal === autoLockTimer &&
            applyOpacityToHexColor(Colors.bottomButtonBG, 0.24)
          }
          btnTextColor={
            minVal === autoLockTimer &&
            applyOpacityToHexColor(Colors.textGray600, 0.3)
          }
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default AutolockTimer;
