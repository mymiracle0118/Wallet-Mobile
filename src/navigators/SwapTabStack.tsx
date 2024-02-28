import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import SwapActivity from 'screens/DashBoard/Swap/SCR_SWAP_ACTIVITY';
import SwapFrom from 'screens/DashBoard/Swap/SCR_SWAP_FROM';
import SwapReview from 'screens/DashBoard/Swap/SCR_SWAP_REVIEW';
import SwapTo from 'screens/DashBoard/Swap/SCR_SWAP_TO';
import SelectNetwork from 'screens/DashBoard/Swap/SCR_Select_Network';
import { Swap } from 'screens/index';

import { ScreenNames } from '../theme';

const Stack = createStackNavigator();

const SwapTabStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name={ScreenNames.Swap} component={Swap} />
      <Stack.Screen
        name={ScreenNames.SelectNetwork}
        component={SelectNetwork}
      />
      <Stack.Screen name={ScreenNames.SwapFrom} component={SwapFrom} />
      <Stack.Screen name={ScreenNames.SwapTo} component={SwapTo} />
      <Stack.Screen name={ScreenNames.SwapReview} component={SwapReview} />
      <Stack.Screen name={ScreenNames.SwapActivity} component={SwapActivity} />
    </Stack.Navigator>
  );
};

export default SwapTabStack;
