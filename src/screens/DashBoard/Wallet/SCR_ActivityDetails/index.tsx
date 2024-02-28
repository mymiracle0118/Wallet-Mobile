import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { captureScreen } from 'react-native-view-shot';
import { useDispatch, useSelector } from 'react-redux';

import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ActivityItem,
  AmountView,
  BorderButton,
  DashBoardHeader,
  HorizontalSeparatorView,
  NodataActivityView,
  SafeAreaWrapper,
  TextButton,
  TransactionProgressView,
  VerticalSeparatorView,
} from 'components/index';
import useUpdateEffect from 'customHooks/useUpdateEffect';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import { getTokenTransactionDetailsFetch } from 'services/apiActions';
import { AppDispatch, RootState } from 'store/index';
import { updateLoader } from 'store/loader';
import { clearActivityTransactionInfo } from 'store/wallet';
import { formatAddress } from 'theme/Helper/Address';
import {
  USDollar,
  formatErc20Token,
  formatEther,
  showConfirmationModal,
  getRoundDecimalValue,
  showToast,
  getWalletAddress,
  getUserDataFromAddress,
} from 'theme/Helper/common/Function';
import { NetWorkType, NetWorkTypeId } from 'theme/Helper/constant';
import Variables from 'theme/Variables';
import ScreenNames from 'theme/screenNames';
import { PopUpItem } from 'types/applicationInterfaces';

import { style } from './style';

const ActivityDetails: React.FC<any> = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const isScreenFocused = useIsFocused();

  const currentTokenInfo = useSelector((state: RootState) => {
    return state.wallet.data.currentSelectedToken;
  });

  const { activityItemObj, isFrom, sendToken, cancelTransaction } = useRoute()
    .params as any;

  const { Common, Images, Gutters, Layout, Fonts } = useTheme();

  const [shouldTransactionIsProcess, setShouldTransactionIsProcess] =
    useState(false);

  const activityTransactionInfo = useSelector((state: RootState) => {
    return state.wallet.data.activityTransactionInfo;
  });

  const apiError = useSelector((state: RootState) => {
    return state.wallet.errorActivityTransactionInfo;
  });

  const userData = useSelector((state: RootState) => {
    return state.userInfo.data.currentUser;
  });

  const [gasPrice, setGasPrice] = useState<number>(0);
  const [fromUserName, setFromUserName] = useState('');
  const [toUserName, setToUserName] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      if (isScreenFocused) {
        isScreenFocused && sendToken && sendToken();
      }
    });
    return unsubscribe;
  }, [isScreenFocused]);

  const callOk = () => {
    cancelTransaction && cancelTransaction();
  };
  const onPressCancel = () => {};

  const popUpCancelObj = () => {
    return {
      isVisible: true,
      popupTitle: t('common:cancel_transaction', {
        amount: '',
        token: '',
      }),
      popupDescription: t('common:cancel_transaction_des'),
      buttonOkText: t('common:cancel'),
      okButtonType: 'destructive',
      buttonCancelText: t('common:no_thanks'),
      onPressOk: callOk,
      onPressCancel: onPressCancel,
      iconPath: Images.ic_cancel_transaction,
      seconds: '30',
      amount:
        Number(
          formatErc20Token(
            activityTransactionInfo?.transactionObj?.gasPrice,
            18,
          ),
        ) * Number(21000),
      usdAmount: USDollar(9).format(
        Number(
          Number(
            formatErc20Token(
              activityTransactionInfo?.transactionObj?.gasPrice,
              18,
            ),
          ) * Number(21000),
        ) * Number(currentTokenInfo?.usdAmount),
      ),
      tokenType: currentTokenInfo?.networkName,
    } as unknown as PopUpItem;
  };

  useEffect(() => {
    if (isFrom === 'activityList') {
      dispatch(dispatch(updateLoader({ isLoading: true })));
      dispatch(
        getTokenTransactionDetailsFetch({
          walletAddress: getFormattedWalletAddress(),
          blockNumber: parseInt(activityItemObj?.blockNumber, 10),
          txtType: currentTokenInfo?.title,
          netWorkName: currentTokenInfo?.providerNetworkRPC_Network_Name,
          tokenInfo: currentTokenInfo,
          hash: activityItemObj.hash,
        }),
      );
    }
  }, [activityItemObj]);

  useUpdateEffect(() => {
    if (
      activityTransactionInfo?.txreceipt_status === '1' ||
      activityTransactionInfo?.txreceipt_status === '3' ||
      activityTransactionInfo?.txreceipt_status === '4'
    ) {
      setShouldTransactionIsProcess(false);
    } else if (activityTransactionInfo?.txreceipt_status === '2') {
      setShouldTransactionIsProcess(true);
    }

    if (activityTransactionInfo?.hash) {
      let networkFees;

      switch (currentTokenInfo.networkName) {
        case NetWorkType.SUI:
          networkFees = Number(
            formatErc20Token(activityTransactionInfo?.gasPrice, 9),
          );
          break;
        case NetWorkType.APT:
          networkFees = Number(
            formatErc20Token(activityTransactionInfo?.gasPrice, 8) *
              activityTransactionInfo?.gasUsed,
          );
          break;
        case NetWorkType.SOL:
          networkFees = Number(
            formatErc20Token(activityTransactionInfo?.gasPrice, 9),
          );
          break;
        case NetWorkType.SUP:
          networkFees = Number(
            formatErc20Token(activityTransactionInfo?.gasPrice, 6) *
              activityTransactionInfo?.gasUsed,
          );
          break;
        default:
          networkFees = formatEther(
            activityTransactionInfo?.gasPrice *
              activityTransactionInfo?.gasUsed,
          );
          break;
      }

      setGasPrice(networkFees);
    }

    if (
      getFormattedWalletAddress()?.toLowerCase() ===
      activityTransactionInfo?.from?.toLowerCase()
    ) {
      setFromUserName(userData?.userName);
    } else {
      setFromUserName(
        getUserDataFromAddress(activityTransactionInfo?.from)?.userName,
      );
    }

    if (
      getFormattedWalletAddress()?.toLowerCase() ===
      activityTransactionInfo?.to?.toLowerCase()
    ) {
      setToUserName(userData?.userName);
    } else {
      setToUserName(
        getUserDataFromAddress(activityTransactionInfo?.to)?.userName,
      );
    }

    dispatch(updateLoader({ isLoading: false }));
  }, [activityTransactionInfo]);

  useUpdateEffect(() => {
    if (apiError) {
      dispatch(updateLoader({ isLoading: false }));
    }
  }, [apiError]);

  useEffect(() => {
    return () => {
      dispatch(clearActivityTransactionInfo());
    };
  }, []);

  const onImageSave = useCallback(() => {
    captureScreen({
      fileName: t('wallet:qr_code_file_name'),
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    }).then(async uri => {
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
  const fromToDetails = () => {
    return (
      <>
        {activityTransactionInfo?.from && (
          <View style={[Layout.rowCenter]}>
            <Text style={[Fonts.titleSmall]}>{t('common:from')}</Text>
            <View
              style={[Layout.fill, Layout.rowCenter, Layout.justifyContentEnd]}
            >
              <BorderButton
                text={formatAddress(activityTransactionInfo?.from, 'short')}
                onPress={() => {}}
                btnStyle={style(Gutters).addressBtn}
                textStyle={Fonts.textSmallTinyWhiteMedium}
                disabled={true}
              />

              {fromUserName && (
                <>
                  <VerticalSeparatorView
                    spacing={Variables.MetricsSizes.tiny}
                  />

                  <Text style={[Fonts.titleSmall]} numberOfLines={1}>
                    {fromUserName}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {activityTransactionInfo?.to && (
          <>
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />
            <View style={[Layout.rowCenter]}>
              <Text style={[Fonts.titleSmall]}>{t('common:to')}</Text>
              <View
                style={[
                  Layout.fill,
                  Layout.rowCenter,
                  Layout.justifyContentEnd,
                ]}
              >
                <BorderButton
                  text={formatAddress(activityTransactionInfo?.to, 'short')}
                  onPress={() => {}}
                  btnStyle={style(Gutters).addressBtn}
                  textStyle={Fonts.textSmallTinyWhiteMedium}
                  disabled={true}
                />

                {toUserName && (
                  <>
                    <VerticalSeparatorView
                      spacing={Variables.MetricsSizes.tiny}
                    />

                    <Text style={[Fonts.titleSmall]} numberOfLines={1}>
                      {toUserName}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </>
    );
  };

  return (
    <SafeAreaWrapper applyToOnlyTopEdge={false}>
      <View style={Common.containerFillWithSmallHPadding}>
        <DashBoardHeader
          leftImage={Images.ic_back}
          onPressLeftImage={() => {
            navigation.navigate(ScreenNames.TokenDetails);
          }}
          middleView={
            <Text style={[Fonts.titleSmall]}>{t('wallet:activity')}</Text>
          }
          rightImage={Images.ic_snapShot}
          rightImageStyle={style(Gutters).rightIcon}
          onPressRightImage={onImageSave}
        />
        {apiError === '' ? (
          <View style={Layout.fill}>
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />
            {activityTransactionInfo?.value && (
              <ActivityItem
                item={activityTransactionInfo}
                walletAddress={getFormattedWalletAddress()}
                tokenType={currentTokenInfo?.title}
                onPress={() => {}}
              />
            )}
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.tiny} />
            {shouldTransactionIsProcess && (
              <>
                <TransactionProgressView />
                <HorizontalSeparatorView
                  spacing={Variables.MetricsSizes.small}
                />
              </>
            )}
            {activityTransactionInfo?.hash && currentTokenInfo?.explorerURL && (
              <>
                <BorderButton
                  testId={'ViewExplorer'}
                  text={t('common:view_transaction_on_explorer')}
                  onPress={() => {
                    Linking.openURL(
                      currentTokenInfo?.explorerURL?.replace(
                        '$tx',
                        activityTransactionInfo?.hash,
                      ),
                    );
                  }}
                  btnStyle={style(Gutters).bottomButton}
                  textStyle={Fonts.textSmallWhiteBold}
                />
                <HorizontalSeparatorView
                  spacing={Variables.MetricsSizes.medium}
                />
              </>
            )}
            {fromToDetails()}
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />
            {gasPrice > 0 &&
              getFormattedWalletAddress()?.toLowerCase() ===
                activityTransactionInfo?.from?.toLowerCase() && (
                <AmountView
                  title={t('common:network_fee')}
                  amount={
                    currentTokenInfo?.isEVMNetwork
                      ? gasPrice
                      : getRoundDecimalValue(
                          gasPrice,
                          currentTokenInfo?.networkId === NetWorkTypeId.SUP
                            ? 6
                            : 9,
                        ) ?? '0'
                  }
                  tokenType={currentTokenInfo?.networkName}
                />
              )}
          </View>
        ) : (
          <NodataActivityView
            text={t('wallet:no_activities_details_found')}
            iconPath={Images.ic_empty_activity}
          />
        )}
        {shouldTransactionIsProcess && currentTokenInfo?.isEVMNetwork && (
          <>
            <TextButton
              text={t('common:cancel_transaction')}
              onPress={() => {
                showConfirmationModal(popUpCancelObj());
              }}
            />
            <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />
          </>
        )}
      </View>
    </SafeAreaWrapper>
  );
};

export default ActivityDetails;
