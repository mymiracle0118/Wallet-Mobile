import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react-native';
import { store } from 'store/index';

import GradientSlider from './GradientSlider';

test('render correctly', () => {
  const componentCase1 = (
    <Provider store={store}>
      <GradientSlider sliderValue={5} setSliderValue={jest.fn} />
    </Provider>
  );
  render(componentCase1);
});
