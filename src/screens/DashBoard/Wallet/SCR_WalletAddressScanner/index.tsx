import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Camera } from 'react-native-camera-kit';

import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useUpdateEffect from 'customHooks/useUpdateEffect';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';

import { style } from './style';

const WalletAddressScanner: React.FC<any> = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { getAddress } = useRoute().params as any;

  const { Layout, Fonts, Gutters } = useTheme();

  const [walletAddress, setWalletAddress] = useState('');

  useUpdateEffect(() => {
    if (walletAddress) {
      console.log('walletAddress', walletAddress);
      getAddress(walletAddress);
      navigation.goBack();
    }
  }, [walletAddress]);

  return (
    <>
      <Camera
        // Barcode props
        style={style(Layout).rootCamera}
        scanBarcode={true}
        onReadCode={event => {
          setWalletAddress(event.nativeEvent.codeStringValue);
        }} // optional
        showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner,that stoped when find any code. Frame always at center of the screen
        laserColor="red" // (default red) optional, color of laser in scanner frame
        frameColor="white" // (default white) optional, color of border of scanner frame
      />
      <View style={style(Layout).cancelView}>
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text style={[Fonts.textRegularBold, Gutters.smallMargin]}>
            {t('common:cancel')}
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export default WalletAddressScanner;
