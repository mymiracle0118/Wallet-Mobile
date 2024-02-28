import React from 'react';

import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import AddAddress from 'screens/DashBoard/Settings/SCR_AddAddress';
import AddressBook from 'screens/DashBoard/Settings/SCR_AddressBook';
import AutolockTimer from 'screens/DashBoard/Settings/SCR_AutolockTimer';
import Currency from 'screens/DashBoard/Settings/SCR_Currency';
import Language from 'screens/DashBoard/Settings/SCR_Language';
import SecretRecoveryPhrase from 'screens/DashBoard/Settings/SCR_SecretRecoveryPhrase';
import Security from 'screens/DashBoard/Settings/SCR_Security';
import SocialRecovery from 'screens/DashBoard/Settings/SCR_SocialRecovery';
import WalletAddressScanner from 'screens/DashBoard/Wallet/SCR_WalletAddressScanner';
import CreateAccountRecoveryVideo from 'screens/Onboarding/SCR_CreateAccountRecoveryVideo';
import {
  BackUpFirstRecoveryPhrase,
  BackUpWalletUsingDevice,
  BackUpWalletUsingGuarantor,
  BackUpWalletUsingIcloud,
  CreatePassword,
  Settings,
} from 'screens/index';

import { ScreenNames } from '../theme';

const Stack = createStackNavigator();

const SettingsTabStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name={ScreenNames.Settings} component={Settings} />
      <Stack.Screen name={ScreenNames.Security} component={Security} />
      <Stack.Screen
        name={ScreenNames.SecretRecoveryPhrase}
        component={SecretRecoveryPhrase}
      />
      <Stack.Screen
        name={ScreenNames.AutolockTimer}
        component={AutolockTimer}
      />

      <Stack.Screen name={ScreenNames.Currency} component={Currency} />
      <Stack.Screen name={ScreenNames.Language} component={Language} />
      <Stack.Screen name={ScreenNames.AddressBook} component={AddressBook} />
      <Stack.Screen
        name={ScreenNames.AddAddress}
        component={AddAddress}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name={ScreenNames.BackUpFirstRecoveryPhrase}
        component={BackUpFirstRecoveryPhrase}
      />
      <Stack.Screen
        name={ScreenNames.SocialRecovery}
        component={SocialRecovery}
      />
      <Stack.Screen
        name={ScreenNames.CreateAccountRecoveryVideo}
        component={CreateAccountRecoveryVideo}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ScreenNames.CreatePassword}
        component={CreatePassword}
      />
      <Stack.Screen
        name={ScreenNames.BackUpWalletUsingIcloud}
        component={BackUpWalletUsingIcloud}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ScreenNames.BackUpWalletUsingDevice}
        component={BackUpWalletUsingDevice}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ScreenNames.BackUpWalletUsingGuarantor}
        component={BackUpWalletUsingGuarantor}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ScreenNames.WalletAddressScanner}
        component={WalletAddressScanner}
        options={{
          presentation: 'modal',
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsTabStack;
