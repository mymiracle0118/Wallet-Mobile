import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react-native';
import { store } from 'store/index';

import AddToAddressBookView from './AddToAddressBookView';

test('render correctly', () => {
  const component = (
    <Provider store={store}>
      <AddToAddressBookView
        isChecked={true}
        setIsChecked={jest.fn}
        setAddressBookUsername={jest.fn}
      />
    </Provider>
  );
  render(component);
});
