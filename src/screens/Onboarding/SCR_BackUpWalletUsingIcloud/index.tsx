import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  BackgroundView,
  BottomViewTitleAndSubTitle,
  Button,
  HorizontalSeparatorView,
  ProgressLineView,
  VerticalSeparatorView,
} from 'components/index';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import CloudService from 'services/CloudService';
import FileManagerService from 'services/FileManagerService';
import { AppDispatch } from 'store/index';
import { updateLoader } from 'store/loader';
import { showAlert } from 'theme/Helper/common/Function';
import {
  FileRecoveryTempPath,
  recoveryFileNamePreFix,
} from 'theme/Helper/constant';
import Variables from 'theme/Variables';
import ScreenNames from 'theme/screenNames';

export default function BackUpWalletUsingIcloud() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { Common, Layout, Images } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [bottomTitleHeight, setBottomTitleHeight] = useState(0);

  const onOkPress = () => {
    navigation.navigate(ScreenNames.BackUpWalletUsingDevice);
  };

  useEffect(() => {
    Platform.OS === 'android' &&
      BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      Platform.OS === 'android' &&
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  const backAction = () => {
    return true;
  };

  return (
    <View style={Layout.fill}>
      <View style={Common.containerFillWithSmallHPadding}>
        <BackgroundView
          image={Images.background.ic_iCloud_bg}
          bottom={-bottomTitleHeight}
        />
      </View>
      <BottomViewTitleAndSubTitle
        onLayout={event => {
          setBottomTitleHeight(event.nativeEvent.layout.height);
        }}
        title={Platform.OS === 'ios' ? t('common:iCloud') : t('common:gDrive')}
        subTitle={
          Platform.OS === 'ios'
            ? t('common:BackUpRestoreWalletUsingIcloud_description')
            : t('common:BackUpRestoreWalletUsingIcloud_description1')
        }
        middleView={
          <>
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.tiny} />
            <View style={Layout.row}>
              <ProgressLineView countLength={4} selectedCount={2} />
              <VerticalSeparatorView spacing={Variables.MetricsSizes.large} />
              <Button
                text={t('common:Backup')}
                onPress={async () => {
                  try {
                    dispatch(
                      updateLoader({
                        isLoading: true,
                      }),
                    );
                    await CloudService().uploadToCloud(
                      FileRecoveryTempPath + `/${recoveryFileNamePreFix}0.json`,
                      `${recoveryFileNamePreFix}0.json`,
                    );

                    await FileManagerService().deleteFile(
                      FileRecoveryTempPath + `/${recoveryFileNamePreFix}0.json`,
                    );
                    dispatch(
                      updateLoader({
                        isLoading: false,
                      }),
                    );
                    showAlert(
                      '',
                      t('onBoarding:json_file_has_been_stored_in_cloud', {
                        fileNumber: 0,
                        cloudName:
                          Platform.OS === 'ios'
                            ? t('common:iCloud')
                            : t('common:gDrive'),
                      }),
                      t('common:ok'),
                      onOkPress,
                    );
                  } catch (error) {
                    dispatch(
                      updateLoader({
                        isLoading: false,
                      }),
                    );
                  }
                }}
                btnStyle={Layout.fill}
              />
            </View>
          </>
        }
      />
    </View>
  );
}
