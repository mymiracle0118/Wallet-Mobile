import React, { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityListHandleType } from 'components/ActivityListView/ActivityListView.types';
import {
  ActivityListView,
  BorderButton,
  ButtonWithIcon,
  DashBoardHeader,
  GasPriceAlertBottomSheetView,
  HorizontalSeparatorView,
  ProfitLossPriceView,
  SafeAreaWrapper,
  SortByFilterBottomSheetView,
  TokenGasPriceView,
  VerticalSeparatorView,
} from 'components/index';
import useUpdateEffect from 'customHooks/useUpdateEffect';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import WalletCommonService from 'services/WalletCommonService';
import { getTokenActivityListFetch } from 'services/apiActions';
import { AppDispatch, RootState } from 'store/index';
import {
  setTokenAsFavorite,
  hideTokenFromList,
  updateTokenTransactionDetails,
} from 'store/wallet';
import { applyOpacityToHexColor } from 'theme/Helper/ColorUtils';
import {
  USDollar,
  getWalletAddress,
  showToast,
} from 'theme/Helper/common/Function';
import {
  DeviceMetrics,
  NetWorkType,
  coinGeckoPriceChartBaseURL,
} from 'theme/Helper/constant';
import Variables from 'theme/Variables';
import { mockData } from 'theme/mockData';
import ScreenNames from 'theme/screenNames';
import { ActivityItemInterface } from 'types/apiResponseInterfaces';

import { style } from './style';

const TokenDetails: React.FC<any> = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const refFilter = useRef<ActivityListHandleType>();
  const [mounted, setMounted] = useState(false);

  const { Common, Images, Layout, Colors, Gutters } = useTheme();

  // const isFocus = useIsFocused();
  const dispatch = useDispatch<AppDispatch>();

  const shouldShowBalance = useSelector(
    (state: RootState) => state.userInfo.data.config.shouldHideAccountBalance,
  );
  const currentTokenInfo = useSelector((state: RootState) => {
    return state.wallet.data.currentSelectedToken;
  });

  const activityList = useSelector((state: RootState) => {
    return state.wallet.data.activityList;
  });

  const apiError = useSelector((state: RootState) => {
    return state.wallet.errorActivityList;
  });

  const shouldShowLoader = useSelector((state: RootState) => {
    return state.wallet.loaderActivityList;
  });

  const activityListFooterLoader = useSelector((state: RootState) => {
    return state.wallet.data.activityListFooterLoader;
  });

  const nativeCurrencyToken = useSelector((state: RootState) => {
    return currentTokenInfo?.tokenType === 'Native'
      ? currentTokenInfo
      : state.wallet.data.currentUserTokenArrayWithBalance[
          currentTokenInfo?.networkName === 'Matic'
            ? 'Polygon'
            : currentTokenInfo?.networkName
        ];
  });

  const [openFilterBottomSheet, setOpenFilterBottomSheet] = useState(false);
  const [shouldShowFooterLoader, setShouldShowFooterLoader] = useState(false);
  const [currentPage] = useState(1);
  const [openGasPriceBottomSheet, setOpenGasPriceBottomSheet] = useState(false);
  const [estimatedGasFeeInGwei, setEstimatedGasFeeInGwei] = useState(0);

  const [isGasFeeFetching, setIsGasFeeFetching] = useState(true);

  const getGasFees = async () => {
    setIsGasFeeFetching(true);
    let feeData;
    try {
      feeData = await WalletCommonService().getFeeData(currentTokenInfo);
    } catch (error) {
      feeData = error;
    } finally {
      setIsGasFeeFetching(false);
      setEstimatedGasFeeInGwei(feeData?.gasPrice);
    }
  };

  useEffect(() => {
    navigation.addListener('transitionEnd', () => {
      setMounted(true);
    });
  }, [navigation]);

  useUpdateEffect(() => {
    getGasFees();
  }, [mounted]);

  useUpdateEffect(() => {
    if (currentPage !== 1) {
      setShouldShowFooterLoader(activityListFooterLoader);
    }
  }, [activityListFooterLoader]);

  useEffect(() => {
    dispatch(
      getTokenActivityListFetch({
        walletAddress: getFormattedWalletAddress(),
        txtType: currentTokenInfo?.title,
        contractAddress: currentTokenInfo?.tokenContractAddress ?? '',
        page: currentPage,
        netWorkName: currentTokenInfo?.providerNetworkRPC_Network_Name,
        tokenInfo: currentTokenInfo,
        hash: activityList?.length
          ? activityList[activityList?.length - 1].hash
          : '',
      }),
    );
  }, [currentPage]);

  const getFormattedWalletAddress = () => {
    return getWalletAddress(
      currentTokenInfo?.networkName,
      currentTokenInfo?.isEVMNetwork,
    );
  };
  return (
    <>
      <SafeAreaWrapper applyToOnlyTopEdge={false}>
        <View style={Common.containerFillWithSmallHPadding}>
          <ScrollView
            overScrollMode="never"
            bounces={false}
            stickyHeaderIndices={[0]}
            showsVerticalScrollIndicator={false}
          >
            <DashBoardHeader
              leftImage={Images.ic_back}
              onPressLeftImage={() => {
                navigation.goBack();
              }}
            />
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />
            <TokenGasPriceView
              tokenIconPath={currentTokenInfo?.image}
              amount={currentTokenInfo?.amount + ' ' + currentTokenInfo?.title}
              usdAmount={
                currentTokenInfo?.amount * currentTokenInfo?.usdAmount > 0
                  ? USDollar().format(
                      currentTokenInfo?.amount * currentTokenInfo?.usdAmount,
                    )
                  : undefined
              }
              gasPriceGwei={
                estimatedGasFeeInGwei +
                ' ' +
                (nativeCurrencyToken?.tokenGasFeeUnitToDisplay
                  ? nativeCurrencyToken?.tokenGasFeeUnitToDisplay
                  : t('common:gwei'))
              }
              usdGasPriceGwei={USDollar(15).format(
                estimatedGasFeeInGwei *
                  Math.pow(
                    10,
                    nativeCurrencyToken?.shortName === NetWorkType.APT
                      ? -8
                      : -9,
                  ) *
                  nativeCurrencyToken?.usdAmount,
              )}
              onPressAlert={() => {
                setOpenGasPriceBottomSheet(true);
              }}
              onPressReceive={() => {
                navigation.navigate(ScreenNames.ReceiveToken);
              }}
              onPressSend={() => {
                navigation.navigate(ScreenNames.WalletTokenSendFrom);
              }}
              onPressSwap={() => {}}
              onPressBuy={() => {}}
              onPressHide={() => {
                showToast('error', t('common:token_hidden'));
                dispatch(
                  hideTokenFromList({
                    token: currentTokenInfo,
                  }),
                );
                navigation.goBack();
              }}
              isFavorite={currentTokenInfo?.isFavorite}
              onPressFavorite={() => {
                dispatch(
                  setTokenAsFavorite({
                    shortName: currentTokenInfo?.shortName,
                  }),
                );
              }}
              shouldShowBalance={shouldShowBalance}
              isGasFeeFetching={isGasFeeFetching}
            />
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />

            <View style={Layout.row}>
              <ProfitLossPriceView
                title={currentTokenInfo?.title + ' ' + t('common:Price')}
                amount={USDollar().format(currentTokenInfo?.usdAmount ?? 0)}
                percentage={
                  currentTokenInfo?.oneDayUSDPriceChangePercentage?.toFixed(
                    2,
                  ) ?? 0 + ''
                }
                onPress={() => {}}
              />
              <VerticalSeparatorView spacing={Variables.MetricsSizes.small} />

              <ProfitLossPriceView
                title={t('wallet:Profit_Loss')}
                amount={USDollar().format(
                  ((currentTokenInfo?.usdAmount ?? 0) *
                    (currentTokenInfo?.amount ?? 0) *
                    (currentTokenInfo?.oneDayUSDPriceChangePercentage ?? 0)) /
                    100,
                )}
                percentage={
                  !shouldShowBalance
                    ? currentTokenInfo?.oneDayUSDPriceChangePercentage?.toFixed(
                        2,
                      ) ?? 0 + ''
                    : '0'
                }
                onPress={() => {}}
                shouldShowBalance={shouldShowBalance}
              />
            </View>
            {currentTokenInfo?.coingeckoTokenId && (
              <>
                <HorizontalSeparatorView
                  spacing={Variables.MetricsSizes.small}
                />
                <ButtonWithIcon
                  text={t('wallet:price_chart')}
                  onPress={() => {
                    Linking.openURL(
                      `${coinGeckoPriceChartBaseURL}${currentTokenInfo?.coingeckoTokenId}`,
                    );
                  }}
                  backGroundColor={Colors.inputBackground}
                  iconPath={Images.ic_send}
                  textColor={applyOpacityToHexColor(Colors.textGray600, 0.6)}
                />
              </>
            )}

            <HorizontalSeparatorView spacing={Variables.MetricsSizes.regular} />
            <ActivityListView
              tokenType={currentTokenInfo?.title}
              walletAddress={getFormattedWalletAddress()}
              ref={refFilter}
              tokenList={activityList}
              onPressFilter={() => {
                setOpenFilterBottomSheet(true);
              }}
              onPressItem={(item: ActivityItemInterface) => {
                if (item?.hash === '') {
                  dispatch(updateTokenTransactionDetails(item));
                  navigation.navigate(ScreenNames.ActivityDetails, {
                    isFrom: 'send',
                    activityItemObj: {},
                  });
                } else {
                  navigation.navigate(ScreenNames.ActivityDetails, {
                    isFrom: 'activityList',
                    activityItemObj: item,
                  });
                }
              }}
              shouldShowLoader={shouldShowLoader}
              shouldShowFooterLoader={shouldShowFooterLoader}
              shouldShowBalance={shouldShowBalance}
              shouldShowNoData={apiError !== ''}
            />
          </ScrollView>
          {apiError !== '' && activityList?.length === 0 && (
            <View
              style={
                DeviceMetrics.hasNotch
                  ? style(Layout, Gutters).bottomViewTiny
                  : style(Layout, Gutters).bottomView
              }
            >
              {currentTokenInfo?.explorerAccountURL && (
                <BorderButton
                  text={t('wallet:view_full_history_on_explorer')}
                  onPress={() => {
                    Linking.openURL(
                      currentTokenInfo?.explorerAccountURL?.replace(
                        '$tx',
                        getFormattedWalletAddress(),
                      ),
                    );
                  }}
                />
              )}
            </View>
          )}
        </View>
      </SafeAreaWrapper>
      {/* Filter modal */}
      <SortByFilterBottomSheetView
        onChange={index => {
          console.log(index);
        }}
        multiSelect={true}
        title={t('common:Filter')}
        onDonePress={item => {
          setOpenFilterBottomSheet(false);
          refFilter?.current?.applySortFilter(item, 'filter');
        }}
        onClearPress={() => {
          refFilter?.current?.applySortFilter({}, 'clearFilter');
        }}
        isSheetOpen={openFilterBottomSheet}
        items={mockData.tokenDetailActivityListFilter}
        onClose={() => {
          refFilter?.current?.applySortFilter({}, 'clearFilter');
          setOpenFilterBottomSheet(false);
        }}
      />
      {/* Gas Price Alert modal */}
      <GasPriceAlertBottomSheetView
        title={t('wallet:gas_price_alerts')}
        isSheetOpen={openGasPriceBottomSheet}
        onClose={() => {
          setOpenGasPriceBottomSheet(false);
        }}
        onPressSetAlerts={() => {
          navigation.navigate(ScreenNames.GasPriceAlert);
        }}
        onPressDeleteAlert={id => {
          console.log('onPressDeleteAlert :: id ::', id);
        }}
      />
    </>
  );
};

export default TokenDetails;
