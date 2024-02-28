import { Dimensions, Platform, StatusBar } from 'react-native';
import { defaultICloudContainerPath } from 'react-native-cloud-store';
import DeviceInfo from 'react-native-device-info';

import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
  DownloadDirectoryPath,
} from 'services/FileManagerService';
import { RPC_URLItem } from 'types/applicationInterfaces';

import app from '../../../../app.json';

export const CurrencySymbol = '$';
export const CurrencyName = 'USD';
export const defaultNetwork = 'ETH';
export const NetWorkType = {
  SUP: 'SUP',
  ETH: 'ETH',
  SUI: 'SUI',
  SOL: 'SOL',
  APT: 'APT',
};
export const NetWorkTypeId = {
  SUP: '1',
  ETH: '2',
  SUI: '5',
  SOL: '6',
  APT: '7',
};

export const ETHSCHEMA = 'ethereum:';
export const MinimumUsernameCharacters = 3;
export const MaximumUsernameCharacters = 15;
export const MinimumPasswordCharacters = 8;
export const MaximumPasswordCharacters = 15;
export const MaximumTextFelidCharacters = 100;
export const MinimumPrivateKeyCharacters = 64;
export const coinGeckoPriceChartBaseURL = 'https://www.coingecko.com/en/coins/';
export const UsdConversionApiBaseURL =
  'https://api.coingecko.com/api/v3/simple/price?';
// 'https://api.coingate.com/api/v2/rates/merchant/';

export const Erc20TokenABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: '_totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const USDCContractAddress = '0x2E162941225Ae0cF35586EAF10c73f0e5404d156';
export const USDTContractAddress = '0xD139245Ed0e23D2f0b9323c9e086F06C652EcD7a';

// export const USDT

//Note: update this array as per user selected erc20 tokens
export const Erc20TokensContractAddresses = [USDCContractAddress];

export const DirectoryPath =
  Platform.OS === 'android' ? DownloadDirectoryPath : DocumentDirectoryPath;

export const recoveryFileNamePreFix = app.displayName;

export const documentFolderName = 'Documents';

export const FileRecoveryTempPath =
  Platform.OS === 'android'
    ? DocumentDirectoryPath + '/temp'
    : DocumentDirectoryPath + '/temp';

export const iCloudDefaultPath = defaultICloudContainerPath;
export const DirectoryDownloadPath =
  Platform.OS === 'android' ? DownloadDirectoryPath : CachesDirectoryPath;

export const PAGINATION_COUNT = 10;
export const PAGINATION_COUNT_100 = 100;
export const PAGINATION_COUNT_20 = 20;
export const PAGINATION_COUNT_50 = 50;
export const DEFAULT_API_TIMEOUT = 5000;

export const Aptos_Coin_Register = '0x1::managed_coin::register';
export const Aptos_CoinStore =
  '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>';

// Used via Metrics.baseMargin
export const DeviceMetrics = {
  screenWidth: Dimensions.get('screen').width,
  screenHeight: Dimensions.get('screen').height,
  windowWidth: Dimensions.get('window').width,
  windowHeight: Dimensions.get('window').height,
  bottomTabBarHeight: 49,
  statusBarHeight: StatusBar.currentHeight ?? 0,
  hasNotch: DeviceInfo.hasNotch(),
  windowScreenDifference:
    Dimensions.get('screen').height - Dimensions.get('window').height,
};

export const networksURLList: { [key: string]: RPC_URLItem } = {
  [NetWorkTypeId.ETH]: {
    testNet: {
      providerNetworkRPC_URL:
        'wss://eth-sepolia.g.alchemy.com/v2/barNHxwKcvdxJuDoKlbor5qx6mhT2C_O',
      explorerURL: 'https://sepolia.etherscan.io/tx/$tx',
      explorerAccountURL: 'https://sepolia.etherscan.io/address/$tx',
      providerNetworkRPC_Network_Name: 'sepolia',
      networkId: NetWorkTypeId.ETH,
    },
    mainNet: {
      providerNetworkRPC_URL:
        'wss://eth-sepolia.g.alchemy.com/v2/barNHxwKcvdxJuDoKlbor5qx6mhT2C_O',
      explorerURL: 'https://sepolia.etherscan.io/tx/$tx',
      explorerAccountURL: 'https://sepolia.etherscan.io/address/$tx',
      providerNetworkRPC_Network_Name: 'sepolia',
      networkId: NetWorkTypeId.ETH,
      // providerNetworkRPC_URL: 'wss://ethereum-goerli.publicnode.com	',
      // explorerURL: 'https://goerli.etherscan.io/tx/$tx',
      // explorerAccountURL: 'https://goerli.etherscan.io/address/$tx',
      // providerNetworkRPC_Network_Name: 'goerli',
      // networkId: NetWorkTypeId.ETH,
    },
  },
  '3': {
    testNet: {
      providerNetworkRPC_URL:
        'wss://polygon-mumbai.g.alchemy.com/v2/barNHxwKcvdxJuDoKlbor5qx6mhT2C_O',
      explorerURL: 'https://mumbai.polygonscan.com/tx/$tx',
      explorerAccountURL: 'https://mumbai.polygonscan.com/tx/$tx',
      providerNetworkRPC_Network_Name: 80001,
      networkId: '3',
    },
    mainNet: {
      providerNetworkRPC_URL:
        'wss://polygon-mumbai.g.alchemy.com/v2/barNHxwKcvdxJuDoKlbor5qx6mhT2C_O',
      explorerURL: 'https://mumbai.polygonscan.com/tx/$tx',
      explorerAccountURL: 'https://mumbai.polygonscan.com/tx/$tx',
      providerNetworkRPC_Network_Name: 80001,
      networkId: '3',
    },
  },
  '4': {
    testNet: {
      providerNetworkRPC_URL: 'https://bsc-testnet.publicnode.com',
      explorerURL: 'https://testnet.bscscan.com/tx/$tx',
      explorerAccountURL: 'https://testnet.bscscan.com/tx/$tx',
      providerNetworkRPC_Network_Name: 97,
      networkId: '4',
    },
    mainNet: {
      providerNetworkRPC_URL: 'https://bsc-testnet.publicnode.com',
      explorerURL: 'https://testnet.bscscan.com/tx/$tx',
      explorerAccountURL: 'https://testnet.bscscan.com/tx/$tx',
      providerNetworkRPC_Network_Name: 97,
      networkId: '4',
    },
  },
  [NetWorkTypeId.SUI]: {
    testNet: {
      providerNetworkRPC_URL: 'https://fullnode.testnet.sui.io:443',
      explorerURL: 'https://suiexplorer.com/txblock/$tx?network=testnet',
      explorerAccountURL: 'https://suiexplorer.com/address/$tx?network=testnet',
      providerNetworkRPC_Network_Name: 97,
      networkId: NetWorkTypeId.SUI,
      tokenGasFeeUnitToDisplay: 'MIST',
    },
    mainNet: {
      providerNetworkRPC_URL: 'https://fullnode.devnet.sui.io:443',
      explorerURL: 'https://suiexplorer.com/txblock/$tx?network=devnet',
      explorerAccountURL: 'https://suiexplorer.com/address/$tx?network=devnet',
      providerNetworkRPC_Network_Name: 97,
      networkId: NetWorkTypeId.SUI,
      tokenGasFeeUnitToDisplay: 'MIST',
    },
  },
  [NetWorkTypeId.SOL]: {
    testNet: {
      providerNetworkRPC_URL: 'https://api.testnet.solana.com',
      explorerURL: 'https://explorer.solana.com/tx/$tx?cluster=testnet',
      explorerAccountURL:
        'https://explorer.solana.com/address/$tx?cluster=testnet',
      providerNetworkRPC_Network_Name: 103,
      networkId: NetWorkTypeId.SOL,
      tokenGasFeeUnitToDisplay: 'Lamports',
    },
    mainNet: {
      providerNetworkRPC_URL: 'https://api.devnet.solana.com',
      explorerURL: 'https://explorer.solana.com/tx/$tx?cluster=devnet',
      explorerAccountURL:
        'https://explorer.solana.com/address/$tx?cluster=devnet',
      providerNetworkRPC_Network_Name: 103,
      networkId: NetWorkTypeId.SOL,
      tokenGasFeeUnitToDisplay: 'Lamports',
    },
  },
  [NetWorkTypeId.APT]: {
    testNet: {
      providerNetworkRPC_URL: 'https://fullnode.testnet.aptoslabs.com/v1',
      explorerURL: 'https://explorer.aptoslabs.com/txn/$tx?network=testnet',
      explorerAccountURL:
        'https://explorer.aptoslabs.com/account/$tx?network=testnet',
      providerNetworkRPC_Network_Name: 2022,
      networkId: NetWorkTypeId.APT,
      tokenGasFeeUnitToDisplay: 'Octas',
      indexerClient:
        'https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql',
    },
    mainNet: {
      providerNetworkRPC_URL: 'https://fullnode.devnet.aptoslabs.com/v1',
      explorerURL: 'https://explorer.aptoslabs.com/txn/$tx?network=devnet',
      explorerAccountURL:
        'https://explorer.aptoslabs.com/account/$tx?network=devnet',
      providerNetworkRPC_Network_Name: 2022,
      networkId: NetWorkTypeId.APT,
      tokenGasFeeUnitToDisplay: 'Octas',
      indexerClient:
        'https://indexer-devnet.staging.gcp.aptosdev.com/v1/graphql',
    },
  },
  [NetWorkTypeId.SUP]: {
    testNet: {
      providerNetworkRPC_URL: 'https://rpc-devnet.supraoracles.com/rpc/v1',
      explorerURL: '',
      explorerAccountURL: '',
      providerNetworkRPC_Network_Name: 4,
      networkId: NetWorkTypeId.SUP,
      tokenGasFeeUnitToDisplay: 'gwei',
      indexerClient: '',
    },
    mainNet: {
      providerNetworkRPC_URL: 'https://rpc-devnet.supraoracles.com/rpc/v1',
      explorerURL: '',
      explorerAccountURL: '',
      providerNetworkRPC_Network_Name: 4,
      networkId: NetWorkTypeId.SUP,
      tokenGasFeeUnitToDisplay: 'gwei',
      indexerClient: '',
    },
  },
};
