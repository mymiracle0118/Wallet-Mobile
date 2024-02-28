import React from 'react';
import { View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  BackgroundView,
  HeaderWithTitleAndSubTitle,
  HorizontalSeparatorView,
  RecoverySelectionListView,
  SafeAreaWrapper,
} from 'components/index';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import { generateRandomNumber } from 'theme/Helper/common/Function';
import Variables from 'theme/Variables';
import mockData from 'theme/mockData';
import ScreenNames from 'theme/screenNames';

export default function CreateAccountChooseRecoveryMethod() {
  const { Common, Images } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();

  /*
Redirect To CreatePassword Screen
*/
  const redirectToNextScreen = () => {
    navigation.navigate(ScreenNames.CreatePassword);
  };

  return (
    <SafeAreaWrapper applyToOnlyTopEdge={false}>
      <BackgroundView image={Images.background.ic_backgroundLayer} />
      <View style={Common.containerFillWithSmallHPadding}>
        <HeaderWithTitleAndSubTitle
          title={t('onBoarding:CreateAccountChooseRecoveryMethod_title')}
          subTitle={t('onBoarding:CreateAccountChooseRecoveryMethod_subTitle')}
        />
        <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />
        <RecoverySelectionListView
          onItemPress={item => {
            if (item.id === 1) {
              navigation.push(ScreenNames.CreateAccountRecoveryVideo, {
                title: t('onBoarding:files_recovery_video_title'),
                subTitle: t('onBoarding:files_recovery_video_subTitle'),
                videoUrl:
                  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                btnText: t('onBoarding:get_started'),
                redirectToNextScreen,
              });
            } else {
              // Generate random numbers
              const randomNumbers = generateRandomNumber(3);
              let tempArray = [
                { position: randomNumbers[0], value: '' },
                { position: randomNumbers[1], value: '' },
                { position: randomNumbers[2], value: '' },
              ];
              navigation.navigate(ScreenNames.VerifyRecoveryPhrase, {
                randomPhrase: tempArray,
              });
            }
          }}
          data={mockData.createAccount_recoveryOptions}
        />
      </View>
    </SafeAreaWrapper>
  );
}
