import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View } from 'react-native';
import { height } from 'react-native-size-scaling';
import { useSelector } from 'react-redux';

import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  BackgroundView,
  BorderButton,
  Button,
  ErrorView,
  HeaderWithTitleAndSubTitle,
  HorizontalSeparatorView,
  MultiLineTextInput,
  NetworkListDropDownView,
  SafeAreaWrapper,
} from 'components/index';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import Bip39Manager from 'services/Bip39Manager';
import StoreUpdateReduxWalletStateService from 'services/StoreUpdateReduxWalletStateService';
import WalletCommonService from 'services/WalletCommonService';
import { RootState } from 'store/index';
import { applyOpacityToHexColor } from 'theme/Helper/ColorUtils';
import { defaultNetwork } from 'theme/Helper/constant';
import {
  ScreenNames,
  ValidationSchema,
  DefaultVariables as Variables,
} from 'theme/index';
import { SortingItem } from 'types/applicationInterfaces';

import { style } from './style';

type FormData = {
  seedPhraseOrPrivateKey: string;
};

export default function ImportWallet() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { Gutters, Layout, Images, Colors, Fonts } = useTheme();
  const { redirectFrom } = useRoute().params as any;
  const [selectedNetwork, setSelectedNetwork] = useState<SortingItem>();

  const walletAddressList = useSelector((state: RootState) => {
    return state.wallet?.data?.walletAddress;
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
      seedPhraseOrPrivateKey: '',
    },
    resolver: yupResolver(
      redirectFrom === t('onBoarding:by_secret_recovery_phrase')
        ? ValidationSchema.seed
        : ValidationSchema.privateKey,
    ),
  });

  // Asynchronous function handling form submission
  const onSubmit = async (data: FormData) => {
    // Check the redirection source
    if (redirectFrom === t('onBoarding:by_secret_recovery_phrase')) {
      // Check if the provided seed phrase is valid using Bip39Manager
      if (Bip39Manager().isMnemonicValid(data.seedPhraseOrPrivateKey)) {
        // Create a default network wallet using the provided seed phrase
        const wallet = await WalletCommonService().createDefaultWallet(
          data.seedPhraseOrPrivateKey,
        );

        if (wallet?.address) {
          navigation.navigate(ScreenNames.CreateAccount, {
            redirectFrom: ScreenNames.ImportWallet,
            selectedNetwork: defaultNetwork,
          });
        }
      } else {
        setError('seedPhraseOrPrivateKey', {
          type: 'custom',
          message: 'common:Invalid_seed_phrase',
        });
      }
    } else if (redirectFrom === t('onBoarding:by_private_key')) {
      // Get the wallet address using the provided private key
      let walletAddress = WalletCommonService().getWalletUsingPrivateKey(
        data.seedPhraseOrPrivateKey.replace('0x', '').trim(),
        selectedNetwork?.id,
      );

      if (walletAddress) {
        // Update the private key in the Redux store
        StoreUpdateReduxWalletStateService().updatePrivateKeyInStore(
          data.seedPhraseOrPrivateKey.replace('0x', '').trim(),
        );
        navigation.navigate(ScreenNames.CreateAccount, {
          redirectFrom: ScreenNames.ImportWallet,
          selectedNetwork: selectedNetwork?.id ?? defaultNetwork,
        });
      }
    } else if (
      redirectFrom === t('setting:by_import_sub_account_private_key')
    ) {
      // Get the wallet address using the provided private key
      let walletAddress = WalletCommonService().getWalletUsingPrivateKey(
        data.seedPhraseOrPrivateKey.replace('0x', '').trim(),
        selectedNetwork?.id,
      );

      // Check if the wallet address already exists in the walletAddressList
      const addressExists = Object.values(walletAddressList).some(obj =>
        Object.values(obj).includes(walletAddress),
      );

      if (addressExists) {
        setError('seedPhraseOrPrivateKey', {
          type: 'custom',
          message: 'setting:wallet_already_exists',
        });
      } else {
        if (walletAddress) {
          navigation.navigate(ScreenNames.CreateEditImportAccount, {
            title: t('common:Recover_wallet_title'),
            subTitle: '',
            btnText: t('wallet:Import'),
            shouldShowBackIcon: true,
            redirectFrom: t('setting:by_import_sub_account_private_key'),
            seedPhraseOrPrivateKey: data.seedPhraseOrPrivateKey
              .replace('0x', '')
              .trim(),
            selectedNetwork: selectedNetwork?.id ?? defaultNetwork,
          });
        }
      }
    }
  };

  return (
    <SafeAreaWrapper applyToOnlyTopEdge={false}>
      <BackgroundView image={Images.background.ic_backgroundLayer} />
      <View style={style(Layout, Colors, Gutters).wrapper}>
        <HeaderWithTitleAndSubTitle
          title={t('onBoarding:ImportWallet_title')}
          subTitle={
            redirectFrom === t('onBoarding:by_secret_recovery_phrase')
              ? t('onBoarding:ImportWallet_subTitle')
              : t('onBoarding:ImportWallet_subTitle2')
          }
        />
        <HorizontalSeparatorView spacing={Variables.MetricsSizes.medium} />

        <Controller
          control={control}
          name="seedPhraseOrPrivateKey"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              {(redirectFrom === t('onBoarding:by_private_key') ||
                redirectFrom ===
                  t('setting:by_import_sub_account_private_key')) && (
                <>
                  <NetworkListDropDownView
                    selectedNetwork={selectedNetwork}
                    onSelectedNetwork={item => {
                      if (selectedNetwork?.id === item.id) {
                        return;
                      }
                      reset();
                      setSelectedNetwork(item);
                    }}
                  />
                  <HorizontalSeparatorView
                    spacing={Variables.MetricsSizes.medium}
                  />
                </>
              )}
              <View style={(Layout.center, { height: height * 0.2 })}>
                <MultiLineTextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={
                    redirectFrom === t('onBoarding:by_secret_recovery_phrase')
                      ? t('onBoarding:ImportWallet_placeHolder')
                      : t('onBoarding:enter_your_private_key')
                  }
                  value={value}
                  hasError={
                    errors.seedPhraseOrPrivateKey?.message ? true : false
                  }
                  onEndEditing={() => {
                    setValue('seedPhraseOrPrivateKey', value, {
                      shouldValidate: true,
                    });
                  }}
                  editable={
                    redirectFrom ===
                      t('onBoarding:by_secret_recovery_phrase') ||
                    selectedNetwork?.id
                      ? true
                      : false
                  }
                />
              </View>
              <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />
              {errors.seedPhraseOrPrivateKey && (
                <View style={[Layout.row, Layout.justifyContentBetween]}>
                  <ErrorView
                    text={t(errors?.seedPhraseOrPrivateKey?.message ?? '')}
                    iconPath={Images.ic_error_tick}
                    textColor={Colors.textError}
                  />
                  <BorderButton
                    text={t('onBoarding:clear_all')}
                    onPress={() => {
                      reset();
                    }}
                    textStyle={Fonts.textSmallBold}
                    btnStyle={style(Layout, Colors, Gutters).clearAllBtn}
                  />
                </View>
              )}
            </>
          )}
        />
        <HorizontalSeparatorView spacing={Variables.MetricsSizes.regular} />

        <Button
          text={t('common:Next')}
          backGroundColor={
            isValid &&
            (redirectFrom === t('onBoarding:by_secret_recovery_phrase')
              ? true
              : selectedNetwork?.id)
              ? Colors.primary
              : applyOpacityToHexColor(Colors.switchBGColor, 0.3)
          }
          onPress={handleSubmit(onSubmit)}
          btnTextColor={
            isValid &&
            (redirectFrom === t('onBoarding:by_secret_recovery_phrase')
              ? true
              : selectedNetwork?.id)
              ? Colors.white
              : Colors.buttonGrayText
          }
          disabled={!isValid}
        />
      </View>
    </SafeAreaWrapper>
  );
}
