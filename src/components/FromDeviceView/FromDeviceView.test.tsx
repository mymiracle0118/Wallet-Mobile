import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react-native';
import { t } from 'i18next';
import { store } from 'store/index';

import FromDeviceView from './FromDeviceView';

test('render correctly', () => {
  const component = (
    <Provider store={store}>
      <FromDeviceView
        title={t('onBoarding:from_device')}
        buttonName={t('onBoarding:import')}
        onPress={jest.fn}
      />
    </Provider>
  );
  render(component);
});
