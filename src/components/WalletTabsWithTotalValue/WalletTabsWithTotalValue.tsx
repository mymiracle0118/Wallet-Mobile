import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';

import { t } from 'i18next';
import { formatAddress } from 'theme/Helper/Address';
import { applyOpacityToHexColor } from 'theme/Helper/ColorUtils';
import Variables from 'theme/Variables';

// import mockData from 'theme/mockData';
import { BorderButton, BorderTextIconButton } from '..';
import { useTheme } from '../../hooks';
// import CustomToggleButtons from '../CustomToggleButtons/CustomToggleButtons';
import HorizontalSeparatorView from '../HorizontalSeparatorView/HorizontalSeparatorView';
import { style } from './styles';

type Props = {
  tokenAmount: string;
  // selectedType: number;
  // setSelectedType: (arg0: number) => void;
  onPressFilter: () => void;
  filterName: string;
  shouldShowBalance?: boolean;
  walletAddress?: string;
};

const WalletTabsWithTotalValue = ({
  tokenAmount,
  // selectedType,
  // setSelectedType,
  onPressFilter,
  filterName,
  shouldShowBalance,
  walletAddress,
}: Props) => {
  const { Layout, Fonts, Colors, Gutters, Images } = useTheme();

  return (
    <View style={style(Gutters, Layout, Colors).container}>
      <View style={Layout.row}>
        <View style={Layout.fill}>
          {!shouldShowBalance ? (
            <Text style={Fonts.titleMedium} numberOfLines={1}>
              {tokenAmount}
            </Text>
          ) : (
            <Image
              style={style(Gutters, Layout, Colors).monkeyIconStyle}
              source={Images.ic_no_evil_monkey}
              resizeMode="contain"
            />
          )}

          <Text
            style={[
              Fonts.textSmallBold,
              { color: applyOpacityToHexColor(Colors.placeholderColor, 0.6) },
            ]}
          >
            {t('wallet:total_value')}
          </Text>
        </View>
        {/* <CustomToggleButtons
          toggleList={mockData.coinTypes}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          toggleType="image"
        /> */}
      </View>
      <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />

      <View style={[Layout.rowHCenter, Layout.justifyContentBetween]}>
        <BorderTextIconButton
          leftIconImage={Images.ic_network}
          text={filterName}
          onPress={onPressFilter}
          btnStyle={style(Gutters, Layout, Colors).addressBtn}
          textStyle={Fonts.textSmallTinyWhiteMedium}
          rightIconImage={Images.ic_drop_down}
        />
        {walletAddress !== '' && (
          <BorderButton
            text={formatAddress(walletAddress, 'short')}
            onPress={onPressFilter}
            btnStyle={style(Gutters, Layout, Colors).addressBtn}
            textStyle={Fonts.textSmallTinyWhiteMedium}
          />
        )}
      </View>
    </View>
  );
};

WalletTabsWithTotalValue.defaultProps = {
  shouldShowBalance: false,
  walletAddress: '',
};

export default memo(WalletTabsWithTotalValue);
