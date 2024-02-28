import React from 'react';

import { render, fireEvent } from '@testing-library/react-native';

import BackUpWalletOptionView from './BackUpWalletOptionView';

// Mock the required dependencies (useTheme, Images, Button, TitleDescriptionView)
jest.mock('hooks/useTheme', () => ({
  __esModule: true,
  default: () => ({
    Colors: {
      // Define the required colors here
    },
    Layout: {
      // Define the required layout styles here
    },
    Gutters: {
      // Define the required gutters here
    },
    Images: {
      // Mock the required image
    },
    Fonts: {
      textRegularBold: '',
    },
  }),
}));

describe('BackUpWalletOptionView', () => {
  const mockProps = {
    title: 'Test Title',
    description: 'Test Description',
    buttonText: 'Submit',
    onClick: jest.fn(), // Create a mock function for onClick
  };

  it('renders correctly', () => {
    // const { toJSON } = render(<BackUpWalletOptionView {...mockProps} />);
    // expect(toJSON()).toMatchSnapshot();
  });

  it('displays the correct title and description', () => {
    const { getByText } = render(<BackUpWalletOptionView {...mockProps} />);
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('displays backup info when provided', () => {
    const propsWithBackupInfo = {
      ...mockProps,
      backUpInfoTitle: 'Backup Info Title',
      backUpInfoSubtitle: 'Backup Info Subtitle',
    };

    const { getByText } = render(
      <BackUpWalletOptionView {...propsWithBackupInfo} />,
    );
    expect(getByText('Backup Info Title')).toBeTruthy();
    expect(getByText('Backup Info Subtitle')).toBeTruthy();
  });

  it('hides backup info when not provided', () => {
    const { queryByText } = render(<BackUpWalletOptionView {...mockProps} />);
    expect(queryByText('Backup Info Title')).toBeNull();
    expect(queryByText('Backup Info Subtitle')).toBeNull();
  });

  it('triggers onClick when the submit button is pressed', () => {
    const { getByText } = render(<BackUpWalletOptionView {...mockProps} />);
    fireEvent.press(getByText('Submit'));
    expect(mockProps.onClick).toHaveBeenCalled();
  });
});
