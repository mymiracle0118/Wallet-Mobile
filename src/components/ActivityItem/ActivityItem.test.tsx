import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react-native';
import { store } from 'store/index';
import { Images } from 'theme';

import ActivityItem from './ActivityItem';

test('render correctly', () => {
  const component = (
    <Provider store={store}>
      <ActivityItem
        item={{
          id: '1',
          image: Images.ic_send,
          title: 'Send',
          subTitle: 'Sept. 20 at 9:36 PM',
          amount: '≤ 1.0002',
          status: '0',
          typeId: '1',
        }}
      />
    </Provider>
  );
  render(component);
});
