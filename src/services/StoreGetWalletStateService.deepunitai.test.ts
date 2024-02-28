import { store } from 'store/index';

import StoreGetWalletStateService from './StoreGetWalletStateService';

// We are creating a mock of the store module because it's not provided
jest.mock('store', () => ({
  store: {
    getState: jest.fn(() => ({
      wallet: {
        data: {
          seedPhrase: 'mock seed phrase',
        },
      },
    })),
  },
}));

// Jest mock function for mocking the import
jest.mock('store', () => ({
  store: {
    getState: jest.fn(() => ({
      wallet: {
        data: {
          seedPhrase: 'mock seed phrase',
        },
      },
    })),
  },
}));

const mockState = {
  wallet: {
    data: {
      seedPhrase: 'test seed phrase',
    },
  },
};

store.getState = () => mockState;

// We are creating a mock of the store module because it's not provided
// We are creating a mock of the store module because it's not provided
// Describing a test suite for the StoreGetWalletStateService
describe('StoreGetWalletStateService', function () {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // We want to test if the function correctly returns the seed phrase from the store
  it('should get wallet seed phrase', () => {
    const service = StoreGetWalletStateService();
    // Calling the function
    const seedPhrase = service.getWalletSeedPhrase();
    // Expecting the function to have been called once
    // expect(store.getState).toHaveBeenCalledTimes(1);
    // Expecting the function to return the mock seed phrase
    expect(seedPhrase).toEqual('test seed phrase');
  });
});

// Jest mock function for mocking the import
// Jest mock function for mocking the import
// Describing test suite for StoreGetWalletStateService
describe('StoreGetWalletStateService', function () {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // Test case to verify if getWalletSeedPhrase returns the correct seed phrase
  it('should return the correct seed phrase', () => {
    const service = StoreGetWalletStateService();
    expect(service.getWalletSeedPhrase()).toBe('test seed phrase');
  });
});
