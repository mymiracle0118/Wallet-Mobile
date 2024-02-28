import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { openSettings } from 'react-native-permissions';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  BackgroundView,
  BottomViewTitleAndSubTitle,
  Button,
  HorizontalSeparatorView,
  ProgressLineView,
  TitleDescriptionView,
  VerticalSeparatorView,
} from 'components/index';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import FileManagerService from 'services/FileManagerService';
import PermissionService from 'services/PermissionService';
import { showAlert } from 'theme/Helper/common/Function';
import {
  DirectoryPath,
  FileRecoveryTempPath,
  recoveryFileNamePreFix,
} from 'theme/Helper/constant';
import Variables from 'theme/Variables';
import ScreenNames from 'theme/screenNames';

export default function BackUpWalletUsingDevice() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { Common, Layout, Images } = useTheme();
  const [bottomTitleHeight, setBottomTitleHeight] = useState(0);

  /*
  Asynchronous function to request write storage permission
  If permission is granted, initiate the file move
  If permission is denied, show an alert with an option to open device settings
*/
  const requestPermission = async () => {
    let permissionStatus =
      await PermissionService().requestWriteStoragePermission();
    if (permissionStatus === 'granted') {
      moveFile();
    } else {
      showAlert(
        '',
        t('onBoarding:file_permission_denied'),
        t('onBoarding:go_to_setting'),
        openSettings,
      );
    }
  };

  // Asynchronous function to moveFile using FileManagerService and store a file in local
  const moveFile = async () => {
    await FileManagerService().moveFile(
      FileRecoveryTempPath + `/${recoveryFileNamePreFix}1.json`,
      DirectoryPath + `/${recoveryFileNamePreFix}1.json`,
    );
    showAlert(
      '',
      t('onBoarding:json_file_has_been_stored_to_folder', {
        fileNumber: 1,
        folderName:
          Platform.OS === 'ios'
            ? t('onBoarding:app_document')
            : t('onBoarding:app_download'),
      }),
      t('common:ok'),
      onOkPress,
    );
  };

  const onOkPress = () => {
    navigation.navigate(ScreenNames.BackUpWalletUsingGuarantor);
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
          image={Images.background.ic_device_backup_bg}
          bottom={-bottomTitleHeight}
        />
      </View>
      <BottomViewTitleAndSubTitle
        onLayout={event => {
          setBottomTitleHeight(event.nativeEvent.layout.height);
        }}
        title={t('common:Device')}
        subTitle={t('common:BackUpRestoreWalletUsingDevice_description')}
        middleView={
          <>
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.tiny} />
            <TitleDescriptionView title={`${recoveryFileNamePreFix}1.json`} />
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />

            <View style={Layout.row}>
              <ProgressLineView countLength={4} selectedCount={3} />
              <VerticalSeparatorView spacing={Variables.MetricsSizes.large} />
              <Button
                text={t('common:Download')}
                onPress={async () => {
                  if (Platform.OS === 'android') {
                    const fileData = await FileManagerService().readFile(
                      FileRecoveryTempPath + `/${recoveryFileNamePreFix}1.json`,
                      'utf8',
                    );

                    try {
                      await FileManagerService().createFileInDownloadInAndroid(
                        `${recoveryFileNamePreFix}1.json`,
                        fileData,
                      );
                      showAlert(
                        '',
                        t('onBoarding:json_file_has_been_stored_to_folder', {
                          fileNumber: 1,
                          folderName: t('onBoarding:app_document'),
                        }),
                        t('common:ok'),
                        onOkPress,
                      );
                    } catch (errorCode) {
                      switch (errorCode) {
                        case 102:
                          showAlert(
                            '',
                            t('onBoarding:delete_json_file_error_message'),
                            t('common:ok'),
                          );
                          break;
                        case 103:
                          showAlert(
                            '',
                            t('common:something_went_wrong_please_try_again'),
                            t('common:ok'),
                          );
                          break;
                        case 104:
                          requestPermission();
                          return;
                      }
                    }
                  } else {
                    moveFile();
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
