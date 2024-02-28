import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, ScrollView, Text, View } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';

import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  AddToAddressBookView,
  BorderButton,
  BorderTextIconButton,
  Button,
  CloseButton,
  DashBoardHeader,
  ErrorView,
  GasPriceView,
  HorizontalSeparatorView,
  InputBox,
  RecentTransactionListView,
  SafeAreaWrapper,
  TitleWithLeftImageView,
  UserAddressView,
} from 'components/index';
import useUpdateEffect from 'customHooks/useUpdateEffect';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import AptosService from 'services/AptosService';
import EthersService from 'services/EthersService';
import PermissionService from 'services/PermissionService';
import SuiService from 'services/SuiService';
import SupraService from 'services/SupraService';
import WalletAddressValidationService from 'services/WalletAddressValidationService';
import WalletCommonService from 'services/WalletCommonService';
import { storeAddressInBook } from 'store/addressBook';
import { RootState } from 'store/index';
import { applyOpacityToHexColor } from 'theme/Helper/ColorUtils';
import {
  USDollar,
  colorPalette,
  formatErc20Token,
  getRandomIndex,
  getRoundDecimalValue,
  getUserDataFromAddress,
  showAlert,
  showConfirmationModal,
} from 'theme/Helper/common/Function';
import { ETHSCHEMA, NetWorkType, defaultNetwork } from 'theme/Helper/constant';
import Variables from 'theme/Variables';
import { ValidationSchema } from 'theme/index';
import ScreenNames from 'theme/screenNames';
import { AddressItem, PopUpItem } from 'types/applicationInterfaces';

import { style } from './style';

type FormData = {
  address: string;
  isAddress: boolean | undefined;
  amount: number;
};

const WalletTokenSendTo: React.FC<any> = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  const [adjustedGas, setAdjustedGas] = useState(false);

  const { Common, Images, Gutters, Layout, Fonts, Colors } = useTheme();
  const [isAddressValid, setIsAddressValid] = useState(false);

  const [shouldShowNext, setShouldShowNext] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [addressBookUsername, setAddressBookUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState({});

  const [estimatedGasFee, setEstimatedGasFee] = useState(0);

  const [estimatedGasFeeInGwei, setEstimatedGasFeeInGwei] = useState(0);

  const [defaultGasFeeInGwei, setDefaultGasFeeInGwei] = useState(0);

  let gasFeeInGwei = 0;

  const [estimatedTimeRequired, setEstimatedTimeRequired] = useState('30');

  const currentTokenInfo = useSelector((state: RootState) => {
    return state.wallet.data.currentSelectedToken;
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

  const addressBookList = useSelector((state: RootState) => {
    return state.addressBook.addressBookList;
  });

  const recentTransactionAddressList = useSelector((state: RootState) => {
    return state.addressBook.recentTransactionAddressList[
      state.userInfo.data.currentUserId
    ];
  });

  const tokensList = useSelector((state: RootState) => {
    return state.wallet.data.tokensList;
  });

  const currentUserId = useSelector((state: RootState) => {
    return state.userInfo.data.currentUserId;
  });

  const walletAddress = useSelector((state: RootState) => {
    return state.wallet.data.walletAddress;
  });

  const [inWalletAddress, setInWalletAddress] = useState([]);

  useEffect(() => {
    getAllInWalletUserAddress();
  }, []);

  useEffect(() => {
    navigation.addListener('transitionEnd', () => {
      setMounted(true);
    });
  }, [navigation]);

  useUpdateEffect(() => {
    getGasFees();
  }, [mounted]);

  // Set up react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      address: '',
      isAddress: false,
      amount: undefined,
    },
    resolver: yupResolver(ValidationSchema.walletAddress),
  });

  useUpdateEffect(() => {
    setGasNetworkFeeAlongWithGasLimit(
      null,
      estimatedGasFeeInGwei > 0 ? estimatedGasFeeInGwei : gasFeeInGwei,
    );
  }, [estimatedGasFeeInGwei]);

  const getGasFees = async () => {
    if (currentTokenInfo?.networkName === NetWorkType.ETH) {
      const timeRequiredInSecond =
        await EthersService().fetchEstimatedTimeRequiredForTransaction(
          Number(feeData?.gasPrice) * Math.pow(10, 9),
        );
      setEstimatedTimeRequired(timeRequiredInSecond ?? '30');
    }

    const feeData = await WalletCommonService().getFeeData(currentTokenInfo);
    if (currentTokenInfo?.isEVMNetwork) {
      setEstimatedGasFeeInGwei(
        Number(feeData?.gasPrice) + Number(feeData.maxPriorityFeePerGas),
      );
      setDefaultGasFeeInGwei(
        Number(feeData?.gasPrice) + Number(feeData.maxPriorityFeePerGas),
      );
      gasFeeInGwei =
        Number(feeData?.gasPrice) + Number(feeData.maxPriorityFeePerGas);
    } else {
      setEstimatedGasFeeInGwei(feeData?.gasPrice);
      setDefaultGasFeeInGwei(feeData?.gasPrice);
      gasFeeInGwei = feeData?.gasPrice;
    }
  };

  const getAllInWalletUserAddress = () => {
    let userAddress = [];
    for (const userId in walletAddress) {
      if (
        walletAddress.hasOwnProperty(userId) &&
        walletAddress[userId].hasOwnProperty(
          currentTokenInfo?.isEVMNetwork
            ? defaultNetwork
            : currentTokenInfo?.networkName,
        ) &&
        currentUserId !== userId
      ) {
        const networkAddress =
          walletAddress[userId][
            currentTokenInfo?.isEVMNetwork
              ? defaultNetwork
              : currentTokenInfo?.networkName
          ];

        const userProfileData = getUserDataFromAddress(networkAddress);
        userAddress.push({
          userName: userProfileData?.userName,
          address: networkAddress,
          networkShortName: currentTokenInfo?.networkName,
          profileIcon: userProfileData?.profileIcon,
        });
      }
    }
    setInWalletAddress(userAddress);
  };

  const setGasNetworkFeeAlongWithGasLimit = (feeData, gasPrice) => {
    let networkFees = 0;
    switch (currentTokenInfo?.networkName) {
      case NetWorkType.SUI:
        networkFees = Number(
          formatErc20Token(gasPrice ? gasPrice : feeData?.gasPrice, 9),
        );
        break;
      case NetWorkType.APT:
        networkFees =
          formatErc20Token(gasPrice ? gasPrice : feeData?.gasPrice, 8) *
          Number(feeData?.gasUsed ?? '500');
        break;
      case NetWorkType.SOL:
        networkFees = Number(
          formatErc20Token(gasPrice ? gasPrice : feeData?.gasPrice, 9),
        );
        break;
      case NetWorkType.SUP:
        networkFees =
          formatErc20Token(gasPrice ? gasPrice : feeData?.gasPrice, 6) *
          Number(feeData?.gasUsed ?? '6');
        break;
      default:
        networkFees = Number(
          (gasPrice ? gasPrice : feeData?.gasPrice) *
            Math.pow(10, -9) *
            Number(21000),
        );
        break;
    }

    setEstimatedGasFee(networkFees);
  };

  // Handle form submission
  const onSubmit = async (_data: FormData) => {
    Keyboard.dismiss();
    if (isChecked && !addressBookUsername?.trim()) {
      return;
    }
    if (isAddressValid) {
      if (isChecked && addressBookUsername?.trim()) {
        addAddressInBook();
      }
      setShouldShowNext(false);

      switch (currentTokenInfo?.networkName) {
        case NetWorkType.APT:
          const aptBalance = await AptosService().getOtherUserBalance(
            _data.address,
            currentTokenInfo,
          );
          if (aptBalance === '0') {
            showAlert(
              '',
              t('receiver_does_not_have_funds', {
                ns: 'wallet',
              }),
            );
          }
          break;
        case NetWorkType.SUP:
          const supBalance = await SupraService().getOtherUserBalance(
            _data.address,
            currentTokenInfo,
          );
          console.log('supBalance??>', supBalance);
          if (supBalance === '0') {
            showAlert(
              '',
              t('receiver_does_not_have_funds', {
                ns: 'wallet',
              }),
            );
          }
          break;
        case NetWorkType.SUI:
          const balance = await SuiService().getBalance(
            _data.address,
            currentTokenInfo,
          );
          if (balance?.totalBalance === '0') {
            showAlert('', t('wallet:receiver_does_not_have_funds'));
          }
          break;
        default:
          break;
      }
    }
  };

  const callCheckAddress = async (address: string) => {
    let isCheckAddressValid =
      await WalletAddressValidationService().checkWalletAddressIsValidOrNot(
        address,
        currentTokenInfo?.networkName,
      );

    setIsAddressValid(isCheckAddressValid);
  };

  /*
get wallet address
*/
  const getAddress = (address: string) => {
    let newAddress = address.replace(ETHSCHEMA, '');
    setValue('address', newAddress, { shouldValidate: true });
    callCheckAddress(newAddress);
  };

  const handleScanQrCode = async () => {
    const isPermissionGranted =
      await PermissionService().requestCameraPermission();

    if (isPermissionGranted) {
      navigation.navigate(ScreenNames.WalletAddressScanner, {
        getAddress,
      });
    } else {
      showAlert(
        '',
        t('common:cameraAccess'),
        t('common:open_settings'),
        openSettings,
        t('common:cancel'),
      );
    }
  };

  const isUserHasSufficientGasFees = () => {
    return !(estimatedGasFee > Number(nativeCurrencyToken?.amount));
  };

  const callAdjustForGas = () => {
    setAdjustedGas(true);
    const calculatedAmount =
      Math.floor(
        (Number(currentTokenInfo?.amount) -
          estimatedGasFee -
          (0.1 * estimatedGasFee +
            (currentTokenInfo?.networkName === 'SOL' ? 0.00089 : 0))) *
          1000000,
      ) / 1000000;
    if (calculatedAmount > 0) {
      if (currentTokenInfo?.tokenType !== 'Native') {
        setValue(
          'amount',
          Math.floor(Number(currentTokenInfo?.amount) * 1000000) / 1000000,
          {
            shouldValidate: true,
          },
        );
      } else {
        setValue('amount', calculatedAmount, {
          shouldValidate: true,
        });
      }
    }
  };

  const onPressCancel = () => {
    setValue(
      'amount',
      Math.floor(Number(currentTokenInfo?.amount) * 1000000) / 1000000,
      {
        shouldValidate: true,
      },
    );
  };

  const popUpMaxAmountSendObj = {
    isVisible: true,
    popupTitle: t('common:Leave_some_gas_fee'),
    popupDescription: t('common:Leave_some_gas_fee_description'),
    buttonOkText: t('common:Adjust'),
    okButtonType: 'primary',
    buttonCancelText: t('common:No_thanks'),
    onPressOk: callAdjustForGas,
    onPressCancel: onPressCancel,
    iconPath: Images.ic_adjustGas,
  } as PopUpItem;

  const checkAddressIsExists = () => {
    return addressBookList.some(function (item) {
      return item?.address === getValues().address;
    });
  };

  const addAddressInBook = () => {
    Keyboard.dismiss();
    let lastElement = addressBookList[addressBookList.length - 1]?.id ?? 0;
    dispatch(
      storeAddressInBook({
        data: {
          id: lastElement + 1,
          userName: addressBookUsername?.trim(),
          address: getValues().address,
          shortName: currentTokenInfo?.isEVMNetwork
            ? defaultNetwork
            : tokensList[currentTokenInfo?.networkName]?.networkName,
          networkName: currentTokenInfo?.isEVMNetwork
            ? tokensList[defaultNetwork]?.subTitle
            : tokensList[currentTokenInfo?.networkName]?.subTitle,
          isEVMNetwork: currentTokenInfo?.isEVMNetwork ? true : false,
          profileIcon: colorPalette[getRandomIndex(colorPalette.length)],
        },
      }),
    );
  };

  const selectedAddress = (
    item: AddressItem,
    isFromAddressBook: boolean = true,
  ) => {
    if (isFromAddressBook) {
      setSelectedUser(item);
    } else {
      const userData = getUserDataFromAddress(item.address);
      if (userData?.userName) {
        const user = {
          id: 1,
          userName: userData?.userName,
          address: item.address,
          shortName: currentTokenInfo?.isEVMNetwork
            ? defaultNetwork
            : tokensList[currentTokenInfo?.networkName]?.networkName,
          networkName: currentTokenInfo?.isEVMNetwork
            ? tokensList[defaultNetwork]?.subTitle
            : tokensList[currentTokenInfo?.networkName]?.subTitle,
          isEVMNetwork: currentTokenInfo?.isEVMNetwork ? true : false,
          profileIcon: userData?.profileIcon,
        };
        setSelectedUser(user);
      }
    }

    setIsAddressValid(false);
    setShouldShowNext(true);
    setValue('address', item.address, { shouldValidate: true });
    callCheckAddress(item.address);
  };

  return (
    <SafeAreaWrapper applyToOnlyTopEdge={false}>
      <View style={Common.containerFillWithSmallHPadding}>
        <DashBoardHeader
          leftImage={Images.ic_back}
          onPressLeftImage={() => {
            navigation.goBack();
          }}
        />
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode="on-drag"
        >
          <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />
          <TitleWithLeftImageView
            title={t('common:Send') + ' ' + currentTokenInfo?.title}
            iconPath={currentTokenInfo.image}
            tokenName={currentTokenInfo?.title}
          />
          <HorizontalSeparatorView spacing={Variables.MetricsSizes.regular} />
          <View style={Layout.rowHCenter}>
            <Text style={[Fonts.textSmallDescriptionBold, Layout.fill]}>
              {t('common:to')}
            </Text>
            {!selectedUser?.userName && (
              <BorderTextIconButton
                leftIconImage={Images.ic_address_book}
                text={t('common:address_book')}
                onPress={() => {
                  navigation.navigate(ScreenNames.AddressBook, {
                    selectedAddress,
                    shortName: currentTokenInfo?.isEVMNetwork
                      ? defaultNetwork
                      : tokensList[currentTokenInfo?.networkName]?.networkName,
                    isEVMNetwork: currentTokenInfo?.isEVMNetwork,
                  });
                }}
                btnStyle={style(Gutters, Layout, Colors).addressBook}
                textStyle={style(Gutters, Layout, Colors).addressBookText}
              />
            )}
          </View>
          <HorizontalSeparatorView spacing={Variables.MetricsSizes.tiny} />
          {selectedUser?.userName ? (
            <View style={style(Gutters, Layout, Colors).userView}>
              <UserAddressView
                walletAddress={selectedUser?.address}
                containerStyle={Layout.fill}
                userName={selectedUser?.userName}
                iconPath={selectedUser?.profileIcon}
              />
              <CloseButton
                onPress={() => {
                  setSelectedUser({});
                  reset();
                  setIsAddressValid(false);
                  setShouldShowNext(true);
                  setIsChecked(false);
                }}
              />
            </View>
          ) : (
            <Controller
              control={control}
              name="address"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <InputBox
                    testID="address"
                    onChangeText={onChange}
                    isShowError={errors?.address?.message ? true : false}
                    errMessage={errors?.address?.message}
                    placeholder={t('common:Address_or_label')}
                    value={value}
                    rightIconPath={
                      value ? Images.ic_close_gray : Images.ic_scan
                    }
                    onPressRightIcon={() => {
                      if (value) {
                        reset();
                        setIsAddressValid(false);
                        setShouldShowNext(true);
                        setIsChecked(false);
                      } else {
                        handleScanQrCode();
                      }
                    }}
                    onChangeValue={prop => {
                      if (prop.nativeEvent.text !== value) {
                        setIsAddressValid(false);
                        setShouldShowNext(true);
                        callCheckAddress(prop.nativeEvent.text);
                      }
                    }}
                  />
                  {!isAddressValid && value && (
                    <ErrorView
                      text={t('common:enter_valid_username_or_address')}
                      iconPath={Images.ic_error_tick}
                      textColor={Colors.textError}
                    />
                  )}
                  {!errors?.address && value && isAddressValid && (
                    <ErrorView
                      text={
                        currentTokenInfo.networkName + ' ' + t('wallet:network')
                      }
                      textColor={applyOpacityToHexColor(
                        Colors.textGray600,
                        0.6,
                      )}
                      textStyle={Fonts.textTinyDescriptionRegular}
                    />
                  )}
                </>
              )}
            />
          )}

          {isAddressValid &&
            shouldShowNext &&
            !selectedUser?.userName &&
            !checkAddressIsExists() && (
              <>
                <HorizontalSeparatorView
                  spacing={Variables.MetricsSizes.regular}
                />

                <AddToAddressBookView
                  isChecked={isChecked}
                  setIsChecked={setIsChecked}
                  setAddressBookUsername={setAddressBookUsername}
                />
              </>
            )}

          {isAddressValid && !shouldShowNext && (
            <>
              <HorizontalSeparatorView
                spacing={Variables.MetricsSizes.regular}
              />
              <View style={Layout.rowHCenter}>
                <Text style={[Fonts.textSmallDescriptionBold, Layout.fill]}>
                  {t('common:amount')}
                </Text>
                {Number(currentTokenInfo?.amount) >
                  0.000001 +
                    estimatedGasFee +
                    (currentTokenInfo?.networkName === 'SOL' ? 0.00089 : 0) && (
                  <BorderButton
                    text={t('common:max')}
                    onPress={() => {
                      showConfirmationModal(popUpMaxAmountSendObj);
                    }}
                    btnStyle={style(Gutters, Layout, Colors).maxBtn}
                    textStyle={{
                      ...Fonts.titleSmall,
                      ...style(Gutters, Layout, Colors).addressBookText,
                    }}
                  />
                )}
              </View>
              <HorizontalSeparatorView spacing={Variables.MetricsSizes.tiny} />
              <Controller
                control={control}
                name="amount"
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <InputBox
                      onChangeText={onChange}
                      testID="amount"
                      placeholder={t('common:amount')}
                      value={value?.toString()}
                      contextMenuHidden={true}
                      keyboardType="decimal-pad"
                    />
                    <View
                      style={[Layout.rowHCenter, Layout.justifyContentBetween]}
                    >
                      <ErrorView
                        text={
                          errors?.amount?.message && value !== ''
                            ? errors?.amount?.message
                            : Number(getValues().amount) >
                              Number(currentTokenInfo?.amount)
                            ? t('swap:insufficient_balance')
                            : !isUserHasSufficientGasFees()
                            ? t('swap:insufficient_balance')
                            : USDollar().format(
                                (getValues().amount ?? 0) *
                                  currentTokenInfo?.usdAmount,
                              )
                        }
                        textColor={
                          (errors?.amount?.message && value !== '') ||
                          !isUserHasSufficientGasFees() ||
                          Number(getValues().amount) >
                            Number(currentTokenInfo?.amount)
                            ? Colors.textError
                            : applyOpacityToHexColor(Colors.textGray600, 0.6)
                        }
                        textStyle={
                          (errors?.amount?.message && value !== '') ||
                          !isUserHasSufficientGasFees() ||
                          Number(getValues().amount) >
                            Number(currentTokenInfo?.amount)
                            ? Fonts.textTinyBold
                            : Fonts.textTinyDescriptionRegular
                        }
                        iconPath={
                          (errors?.amount?.message && value !== '') ||
                          !isUserHasSufficientGasFees() ||
                          Number(getValues().amount) >
                            Number(currentTokenInfo?.amount)
                            ? Images.ic_error_tick
                            : undefined
                        }
                      />
                      <View style={Layout.fill}>
                        <Text
                          style={[
                            Fonts.textTinyDescriptionRegular,
                            Fonts.textRight,
                          ]}
                        >
                          {`Balance: ${Number(currentTokenInfo?.amount).toFixed(
                            5,
                          )} ${currentTokenInfo?.title}`}
                        </Text>
                      </View>
                    </View>
                    {!errors.amount && value > 0 && isValid && (
                      <>
                        {!isUserHasSufficientGasFees() ||
                        Number(getValues().amount) >
                          Number(currentTokenInfo?.amount) ? (
                          <></>
                        ) : (
                          <>
                            <HorizontalSeparatorView
                              spacing={Variables.MetricsSizes.regular}
                            />
                            <GasPriceView
                              minValue={defaultGasFeeInGwei}
                              amount={
                                currentTokenInfo?.isEVMNetwork
                                  ? estimatedGasFee ?? '0'
                                  : '~ ' +
                                      getRoundDecimalValue(
                                        estimatedGasFee,
                                        6,
                                      ) ?? '0'
                              }
                              seconds={estimatedTimeRequired}
                              usdAmount={USDollar(9).format(
                                estimatedGasFee *
                                  nativeCurrencyToken?.usdAmount,
                              )}
                              tokenType={currentTokenInfo?.networkName}
                              borderColor={
                                estimatedGasFee +
                                  Number(
                                    currentTokenInfo?.tokenType === 'Native'
                                      ? getValues()?.amount
                                      : 0,
                                  ) +
                                  (currentTokenInfo?.networkName === 'SOL'
                                    ? 0.00089
                                    : 0) <
                                nativeCurrencyToken.amount
                                  ? ''
                                  : Colors.textError
                              }
                              setSliderValue={setEstimatedGasFeeInGwei}
                              sliderValue={
                                currentTokenInfo?.isEVMNetwork && !adjustedGas
                                  ? estimatedGasFeeInGwei
                                  : undefined
                              }
                            />

                            {estimatedGasFee +
                              Number(
                                currentTokenInfo?.tokenType === 'Native'
                                  ? getValues()?.amount
                                  : 0,
                              ) +
                              (currentTokenInfo?.networkName === 'SOL'
                                ? 0.00089
                                : 0) >
                              nativeCurrencyToken.amount && (
                              <ErrorView
                                text={t('swap:insufficient_gas_fee')}
                                iconPath={Images.ic_error_tick}
                                textColor={Colors.textError}
                              />
                            )}

                            <HorizontalSeparatorView
                              spacing={Variables.MetricsSizes.semiLarge}
                            />

                            <BorderButton
                              text={t('common:review_transaction')}
                              onPress={async () => {
                                if (
                                  Number(getValues().amount) >
                                  Number(currentTokenInfo?.amount)
                                ) {
                                  showAlert(
                                    t('common:insufficient_balance'),
                                    t(
                                      'common:insufficient_balance_description',
                                    ),
                                  );
                                  return;
                                } else if (
                                  (currentTokenInfo?.tokenType === 'Native'
                                    ? Number(getValues().amount)
                                    : 0) +
                                    estimatedGasFee >
                                  Number(currentTokenInfo?.amount)
                                ) {
                                  showAlert(
                                    t(
                                      'common:Insufficient_Balance_After_Gas_Fees_deduction',
                                    ),
                                    t(
                                      'common:Insufficient_Balance_After_Gas_Fees_deduction_description',
                                    ),
                                  );
                                  return;
                                }
                                navigation.navigate(
                                  ScreenNames.WalletTokenSendReview,
                                  {
                                    amount: getValues().amount + '',
                                    toAddress: getValues().address,
                                    estimatedGasFee: estimatedGasFee,
                                    estimatedTimeRequired:
                                      estimatedTimeRequired,
                                    estimatedGasFeeInGwei:
                                      estimatedGasFeeInGwei,
                                  },
                                );
                              }}
                              btnStyle={
                                style(Gutters, Layout, Colors).bottomButton
                              }
                            />
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              />
            </>
          )}

          {isAddressValid && shouldShowNext && (
            <>
              <HorizontalSeparatorView
                spacing={Variables.MetricsSizes.semiLarge}
              />
              <Button
                text={t('common:Next')}
                onPress={handleSubmit(onSubmit)}
                backGroundColor={
                  (isChecked && !addressBookUsername?.trim()) || !isAddressValid
                    ? applyOpacityToHexColor(Colors.switchBGColor, 0.3)
                    : Colors.primary
                }
                btnTextColor={
                  (isChecked && !addressBookUsername?.trim()) || !isAddressValid
                    ? Colors.buttonGrayText
                    : Colors.white
                }
              />
            </>
          )}
          {!selectedUser?.userName &&
            !isAddressValid &&
            recentTransactionAddressList &&
            recentTransactionAddressList[currentTokenInfo?.shortName] && (
              <>
                <HorizontalSeparatorView
                  spacing={Variables.MetricsSizes.regular}
                />
                <RecentTransactionListView
                  title={t('wallet:recently_interacted_with')}
                  recentTransactionAddressList={
                    recentTransactionAddressList[currentTokenInfo?.shortName] ??
                    []
                  }
                  onPress={item => {
                    selectedAddress({ address: item?.address }, false);
                  }}
                />
              </>
            )}

          {!selectedUser?.userName &&
            !isAddressValid &&
            inWalletAddress?.length !== 0 && (
              <>
                <HorizontalSeparatorView
                  spacing={Variables.MetricsSizes.regular}
                />
                <RecentTransactionListView
                  title={t('wallet:in_this_wallet')}
                  recentTransactionAddressList={inWalletAddress}
                  onPress={item => {
                    selectedAddress({ address: item?.address }, false);
                  }}
                />
              </>
            )}
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
};

export default WalletTokenSendTo;
