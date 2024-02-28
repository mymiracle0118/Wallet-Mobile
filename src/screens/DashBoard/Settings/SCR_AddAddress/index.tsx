import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, View } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { useDispatch, useSelector } from 'react-redux';

import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ErrorView,
  HeaderWithTitleAndSubTitle,
  HorizontalSeparatorView,
  InputBox,
  NetworkListDropDownView,
} from 'components/index';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import PermissionService from 'services/PermissionService';
import WalletAddressValidationService from 'services/WalletAddressValidationService';
import { storeAddressInBook } from 'store/addressBook';
import { RootState } from 'store/index';
import {
  colorPalette,
  getRandomIndex,
  showAlert,
} from 'theme/Helper/common/Function';
import {
  ETHSCHEMA,
  MaximumPasswordCharacters,
  defaultNetwork,
} from 'theme/Helper/constant';
import Variables from 'theme/Variables';
import { ValidationSchema } from 'theme/index';
import ScreenNames from 'theme/screenNames';
import { SortingItem } from 'types/applicationInterfaces';

import { style } from './style';

type FormData = {
  address: string;
  label: string;
};

const AddAddress: React.FC<any> = () => {
  const { Common, Gutters, Images, Colors } = useTheme();

  const dispatch = useDispatch();

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [selectedNetwork, setSelectedNetwork] = useState<SortingItem>();

  const [isAddressValid, setIsAddressValid] = useState(false);

  const addressBookList = useSelector((state: RootState) => {
    return state.addressBook.addressBookList;
  });

  // Set up react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    setError,
  } = useForm<FormData>({
    defaultValues: {
      address: '',
      label: '',
    },
    resolver: yupResolver(ValidationSchema.addressBook),
  });

  // Check if the wallet address is valid using WalletAddressValidationService
  const callCheckAddress = async (strAddress: string) => {
    let isCheckAddressValid =
      await WalletAddressValidationService().checkWalletAddressIsValidOrNot(
        strAddress,
        selectedNetwork?.id ?? defaultNetwork,
      );
    setIsAddressValid(isCheckAddressValid);
  };

  //get wallet address
  const getAddress = (address: string) => {
    let newAddress = address.replace(ETHSCHEMA, '');
    setValue('address', newAddress, { shouldValidate: true });
    callCheckAddress(newAddress);
  };

  // Asynchronous function to handle scanning a QR code
  const handleScanQrCode = async () => {
    // Request camera permission using PermissionService
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

  // Asynchronous function to save wallet address in address book
  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss();
    if (isAddressValid) {
      const checkAddress = obj => obj.address === data.address;
      if (!addressBookList.some(checkAddress)) {
        let lastElement = addressBookList[addressBookList.length - 1]?.id ?? 0;
        dispatch(
          storeAddressInBook({
            data: {
              id: lastElement + 1,
              userName: data.label,
              address: data.address,
              networkName: selectedNetwork?.text,
              shortName: selectedNetwork?.id ?? defaultNetwork,
              isEVMNetwork:
                selectedNetwork?.id === defaultNetwork ? true : false,
              profileIcon: colorPalette[getRandomIndex(colorPalette.length)],
            },
          }),
        );
        navigation.goBack();
      } else {
        setError('address', {
          type: 'custom',
          message: 'setting:address_is_already_added',
        });
      }
    }
  };

  return (
    <View
      style={[Common.containerFillWithSmallHPadding, style(Colors).container]}
    >
      <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />
      <HeaderWithTitleAndSubTitle
        shouldHideBack={true}
        shouldShowCancel={true}
        title={t('setting:scr_title_add_address')}
        subTitle={t('setting:add_address_subtile')}
        onBackPress={() => {
          navigation.goBack();
        }}
        rightButtonText={t('common:add')}
        onPressNext={handleSubmit(onSubmit)}
        isNextDisabled={!isValid}
      />
      <View style={Gutters.mediumVMargin}>
        <NetworkListDropDownView
          backGroundColor={Colors.blackGray}
          selectedNetwork={selectedNetwork}
          onSelectedNetwork={item => {
            if (selectedNetwork?.id === item.id) {
              return;
            }
            reset();
            setSelectedNetwork(item);
          }}
        />
        <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />

        <Controller
          control={control}
          name="address"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <>
              <InputBox
                onChangeText={onChange}
                isShowError={errors?.address?.message}
                errMessage={errors?.address?.message}
                placeholder={t('common:address')}
                value={value}
                rightIconPath={value ? Images.ic_close_gray : Images.ic_scan}
                onPressRightIcon={() => {
                  if (value) {
                    setIsAddressValid(false);
                    reset();
                  } else if (selectedNetwork?.id) {
                    handleScanQrCode();
                  }
                }}
                onChangeValue={prop => {
                  if (prop.nativeEvent.text !== value) {
                    setIsAddressValid(false);
                    callCheckAddress(prop.nativeEvent.text);
                  }
                }}
                backGroundColor={Colors.blackGray}
                editable={selectedNetwork?.id ? true : false}
              />
              {!isAddressValid && value && (
                <ErrorView
                  text={t('common:enter_valid_username_or_address')}
                  iconPath={Images.ic_error_tick}
                  textColor={Colors.textError}
                />
              )}
            </>
          )}
        />

        <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />

        <Controller
          control={control}
          name="label"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <InputBox
              onChangeText={onChange}
              isShowError={errors?.label?.message ? true : false}
              errMessage={errors?.label?.message}
              placeholder={t('setting:label')}
              value={value}
              backGroundColor={Colors.blackGray}
              editable={selectedNetwork?.id ? true : false}
              maxLength={MaximumPasswordCharacters}
            />
          )}
        />
      </View>
    </View>
  );
};

export default AddAddress;
