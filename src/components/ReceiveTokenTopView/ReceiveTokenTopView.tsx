/* eslint-disable react/require-default-props */
import React, { forwardRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { scale } from 'react-native-size-scaling';
import { useSelector } from 'react-redux';

import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import { RootState } from 'store/index';
import { formatAddress } from 'theme/Helper/Address';
import Variables from 'theme/Variables';

import {
  TitleWithLeftImageView,
  HorizontalSeparatorView,
  QrCodeView,
  TokenAction,
  UserProfileView,
} from '..';
import { style } from './style';

type Props = {
  qrCodeText: string;
  walletAddress: string;
  onSavePress: () => void;
  onCopyPress: () => void;
  onSharePress: () => void;
  containerStyle?: ViewStyle;
  tokenIconPath: ImageSourcePropType;
  networkName: string;
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  tokenName?: string;
};
const ReceiveTokenTopView = forwardRef((props: Props, ref) => {
  const {
    qrCodeText,
    walletAddress,
    containerStyle,
    onSavePress,
    onCopyPress,
    onSharePress,
    tokenIconPath,
    networkName,
    activeTab,
    // setActiveTab,
    tokenName,
  } = props;
  const { Colors, Images, Gutters, Layout, Fonts } = useTheme();

  const userData = useSelector((state: RootState) => {
    return state.userInfo.data.currentUser;
  });

  // const tabs = ['common:tab_types.address', 'common:tab_types.username'];

  return (
    <View
      style={[style(Gutters, Layout, Colors, Fonts).container, containerStyle]}
    >
      <ImageBackground
        style={style(Gutters, Layout, Colors, Fonts).topImageBgView}
        resizeMode="stretch"
        source={Images.ic_receiveTokenTopViewBg}
      >
        <TitleWithLeftImageView
          title={`${t('common:Receive')} ${networkName}`}
          tokenName={tokenName}
          iconPath={tokenIconPath}
          alignment="center"
        />
        <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />

        {/* <TabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={index => {
            setActiveTab(index);
          }}
          tabBarStyle={style(Gutters, Layout, Colors, Fonts).tabBarContainer}
          activeTabStyle={{
            backgroundColor: Colors.white,
          }}
          activeTabTextStyle={{
            color: Colors.textGray800,
          }}
        /> */}
        {/* <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} /> */}

        {activeTab === 0 && (
          <QrCodeView ref={ref} size={scale(140)} value={qrCodeText} />
        )}

        {activeTab === 1 && <UserProfileView ref={ref} size={scale(152)} />}

        <HorizontalSeparatorView spacing={Variables.MetricsSizes.regular} />
        <Text
          style={{
            ...Fonts.textRegularBold,
          }}
        >
          {activeTab === 0
            ? formatAddress(walletAddress, 'short')
            : userData?.userName}
        </Text>
      </ImageBackground>
      <View style={style(Gutters, Layout, Colors, Fonts).actionsContainer}>
        <TokenAction
          text={t('common:Save')}
          iconPath={Images.ic_save}
          onPress={onSavePress}
        />
        <TokenAction
          text={t('common:Copy')}
          iconPath={Images.ic_copy}
          onPress={onCopyPress}
        />
        <TokenAction
          text={t('common:Share')}
          iconPath={Images.ic_share}
          onPress={onSharePress}
        />
      </View>
    </View>
  );
});
export default ReceiveTokenTopView;
