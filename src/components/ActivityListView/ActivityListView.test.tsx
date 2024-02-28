import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react-native';
import { store } from 'store/index';
import mockData from 'theme/mockData';

import ActivityListView from './ActivityListView';

test('render correctly', () => {
  const component = (
    <Provider store={store}>
      <ActivityListView
        tokenType={'test'}
        walletAddress={'walletAddress'}
        tokenList={mockData.activityListArray}
        onPressFilter={jest.fn}
        onPressItem={jest.fn}
        shouldShowLoader={false}
        shouldShowFooterLoader={false}
      />
    </Provider>
  );
  render(component);
});
