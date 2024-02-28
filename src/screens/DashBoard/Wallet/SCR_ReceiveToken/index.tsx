import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  WarningView,
  DashBoardHeader,
  ReceiveTokenTopView,
  SafeAreaWrapper,
} from 'components/index';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import ShareManagerService from 'services/ShareManagerService';
import { RootState } from 'store/index';
import { getWalletAddress, showToast } from 'theme/Helper/common/Function';
import { ETHSCHEMA, NetWorkType } from 'theme/Helper/constant';

import { style } from './style';

export default function ReceiveToken() {
  const { Common, Colors, Images, Gutters, Layout, Fonts } = useTheme();

  const navigation = useNavigation<StackNavigationProp<any>>();

  const qrCodeViewRef = useRef();

  const [activeTab, setActiveTab] = useState<number>(0);

  const currentTokenInfo = useSelector((state: RootState) => {
    return state.wallet.data.currentSelectedToken;
  });

  // Function to be called when the QR code image is loaded
  const onQRCodeImageSave = useCallback(() => {
    qrCodeViewRef.current.capture().then(async uri => {
      // Logic to handle the captured image URI
      try {
        const response = await CameraRoll.save(uri, { type: 'photo' });
        console.log(response);
        response && showToast('success', t('common:saved_to_gallery'));
      } catch (error) {
        showToast('error', t('common:error_saved_to_gallery'));
      }
    });
  }, []);

  const getFormattedWalletAddress = () => {
    return getWalletAddress(
      currentTokenInfo?.networkName,
      currentTokenInfo?.isEVMNetwork,
    );
  };

  return (
    <SafeAreaWrapper>
      <View style={Common.smallHPadding}>
        <DashBoardHeader
          leftImage={Images.ic_back}
          onPressLeftImage={() => {
            navigation.pop();
          }}
        />
        <ReceiveTokenTopView
          containerStyle={style(Gutters, Layout, Colors, Fonts).topView}
          ref={qrCodeViewRef}
          //0x2E162941225Ae0cF35586EAF10c73f0e5404d156/transfer?address=0x7cF23BC19F70b01a2663baAA19fe76a996bfAE04&uint256=1e7
          qrCodeText={
            (currentTokenInfo?.isEVMNetwork &&
            currentTokenInfo?.shortName === NetWorkType.ETH
              ? ETHSCHEMA
              : '') + getFormattedWalletAddress()
          }
          walletAddress={getFormattedWalletAddress()}
          onSavePress={onQRCodeImageSave}
          onCopyPress={() => {
            showToast('success', t('common:Wallet_address_copied'));
            Clipboard.setString(getFormattedWalletAddress());
          }}
          onSharePress={() =>
            ShareManagerService().shareText(getFormattedWalletAddress())
          }
          tokenIconPath={currentTokenInfo?.image}
          networkName={currentTokenInfo?.title}
          tokenName={currentTokenInfo?.title}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {activeTab === 0 && (
          <View
            style={style(Gutters, Layout, Colors, Fonts).warningViewContainer}
          >
            <WarningView
              textStyle={{ ...Fonts.textTinyBoldWhite }}
              iconStyle={style(Gutters, Layout, Colors, Fonts).warningViewImage}
              text={t('wallet:receiveEth_WarningText', {
                tokenType:
                  currentTokenInfo?.tokenType !== 'Native'
                    ? currentTokenInfo?.tokenType + ' '
                    : '',
                tokenName: currentTokenInfo?.title,
              })}
              shouldShowWarningLeftIcon
            />
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
}
