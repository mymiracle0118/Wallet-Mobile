import {
  getParsedEthersError,
  EthersError,
} from '@enzoferey/ethers-error-parser';
import {
  HDNodeWallet,
  Mnemonic,
  TransactionReceipt,
  TransactionRequest,
  ethers,
  formatUnits,
} from 'ethers';
import { t } from 'i18next';
import { store } from 'store/index';
import {
  formatErc20Token,
  formatErc20TokenConvertNormal,
  formatEther,
  getWalletAddress,
  parseEther,
  showToast,
} from 'theme/Helper/common/Function';
import {
  Erc20TokenABI,
  NetWorkType,
  PAGINATION_COUNT_20,
  defaultNetwork,
} from 'theme/Helper/constant';
import { ExistingNetworksItem } from 'types/apiResponseInterfaces';
import {
  ActivityRequestType,
  EVMNativeTokenBalanceRequestType,
  GasFeeData,
} from 'types/applicationInterfaces';

import Erc20TokenService from './Erc20TokenService';
import StoreUpdateReduxWalletStateService from './StoreUpdateReduxWalletStateService';
import WalletCommonService from './WalletCommonService';
import WalletSigner from './WalletSigner';

let cachedWallet: any;
let lastAccountCreateDerivation: string;
let lastNetworkURL: string;
let lastNetworkName: string | number;
let cachedProvider: ethers.WebSocketProvider | ethers.JsonRpcProvider;
const EthersService = () => {
  const controller = new AbortController();
  const signal = controller.signal;
  // Function to create an ethers provider
  const createProvider = (url: string, network: string | number) => {
    if (
      url &&
      network &&
      lastNetworkURL !== url &&
      lastNetworkName !== network
    ) {
      lastNetworkURL = url;
      lastNetworkName = network;
      if (url.startsWith('wss://')) {
        cachedProvider = new ethers.WebSocketProvider(url, network);
      } else {
        cachedProvider = new ethers.JsonRpcProvider(url, network);
      }
    }

    return cachedProvider;
  };

  const getProvider = (url: string, network: string | number) => {
    return createProvider(url, network);
  };
  const getAndInitContract = (
    contractAddress: string,
    ABI: any[],
    signer: any,
  ) => {
    return new ethers.Contract(contractAddress, ABI, signer);
  };

  const getAndInitContractWithOutSigner = (
    contractAddress: string,
    ABI: any[],
  ) => {
    return new ethers.Contract(contractAddress, ABI);
  };

  const createWalletUsingSeed = (mnemonic: string, pathIndex: string = '0') => {
    try {
      if (cachedWallet && lastAccountCreateDerivation === pathIndex) {
        return cachedWallet;
      } else {
        const newMnemonic = Mnemonic.fromPhrase(mnemonic);
        const derivationPath = `m/44'/60'/0'/0/${pathIndex}`;
        let wallet = ethers.HDNodeWallet.fromMnemonic(
          newMnemonic,
          derivationPath,
        );

        StoreUpdateReduxWalletStateService().updateSeedPhraseInStore(mnemonic);
        cachedWallet = wallet;
        lastAccountCreateDerivation = pathIndex;
        return wallet;
      }
    } catch (error: any) {
      showToast('error', t('common:Invalid_seed_phrase'));
      console.log('Failed to createWalletUsingSeed' + error.message);
    }
  };

  const getWalletUsingSeed = (pathIndex: string = '0') => {
    if (store.getState().userInfo.data.currentUser.isWalletFromSeedPhase) {
      const newMnemonic = Mnemonic.fromPhrase(
        store.getState().wallet.data.seedPhrase,
      );
      const path = `m/44'/60'/0'/0/${pathIndex}`;
      let wallet = ethers.HDNodeWallet.fromMnemonic(newMnemonic, path);
      return wallet;
    } else {
      let wallet = new ethers.Wallet(
        store.getState().userInfo.data.currentUser.privateKey,
      );
      return wallet;
    }
  };

  const getWalletUsingPrivateKey = (privateKey: string) => {
    try {
      var wallet = new ethers.Wallet(privateKey);
      return wallet.address;
    } catch (error: any) {
      showToast('error', t('onBoarding:invalid_private_key'));
      console.log('getWalletUsingPrivateKey error: ' + error.message);
      return '';
    }
  };

  const createTransactionObject = (transactionObj: TransactionRequest) => {
    const tx: TransactionRequest = {
      ...transactionObj,
    };
    return tx;
  };

  // Function to get the balance of an address
  const getBalance = async (
    address: string,
    tokenObj: ExistingNetworksItem,
  ): Promise<string> => {
    try {
      let lastBalance = null;
      let newBalance = 0;
      const provider = getProvider(
        tokenObj?.providerNetworkRPC_URL,
        tokenObj?.providerNetworkRPC_Network_Name,
      );
      if (lastBalance === newBalance) {
        return;
      }
      newBalance = await provider?.getBalance(address);
      lastBalance = newBalance;
      return ethers.formatEther(newBalance);
    } catch (error: any) {
      console.log('Failed to fetch balance ETH: ' + error.message);
    }
  };

  const getTokenActivityListByAddress = async ({
    walletAddress,
    contractAddress,
    page,
    netWorkName = 'goerli',
  }: ActivityRequestType): Promise<any> => {
    try {
      let etherscanProvider = new ethers.EtherscanProvider(netWorkName);

      if (contractAddress) {
        const resObj = await etherscanProvider.fetch('account', {
          action: 'tokentx',
          address: walletAddress,
          sort: 'desc',
          contractaddress: contractAddress,
          page: page,
          offset: PAGINATION_COUNT_20,
        });
        return { data: resObj, isNativeToken: false };
      } else {
        const resObj = await etherscanProvider.fetch('account', {
          action: 'txlist',
          address: walletAddress,
          page: page,
          offset: PAGINATION_COUNT_20,
          sort: 'desc',
        });
        return { data: resObj, isNativeToken: true };
      }
    } catch (error) {
      console.log('error', error);
      return { data: [], isNativeToken: true };
    }
  };

  async function getTokenTransactionDetails({
    walletAddress,
    blockNumber,
    netWorkName = 'goerli',
    tokenInfo,
  }: ActivityRequestType): Promise<any> {
    let etherscanProvider = new ethers.EtherscanProvider(netWorkName);
    if (tokenInfo?.tokenContractAddress) {
      try {
        let response = await etherscanProvider.fetch('account', {
          action: 'tokentx',
          startblock: blockNumber,
          endblock: blockNumber,
          address: walletAddress,
        });
        return response;
      } catch (error) {
        console.log('error', error);
        return [];
      }
    } else {
      try {
        let response = await etherscanProvider.fetch('account', {
          action: 'txlist',
          startblock: blockNumber,
          endblock: blockNumber,
          address: walletAddress,
        });
        return response;
      } catch (error) {
        console.log('error', error);
        return [];
      }
    }
  }

  async function getEVMNativeTokenBalance({
    walletAddress,
    netWorkName = 'goerli',
    shortName = NetWorkType.ETH,
  }: EVMNativeTokenBalanceRequestType): Promise<{
    balance?: string;
    shortName: string;
  }> {
    controller.abort();
    let etherscanProvider = new ethers.EtherscanProvider(netWorkName);
    try {
      let response = await etherscanProvider.fetch('account', {
        action: 'balance',
        tag: 'latest',
        address: walletAddress,
        signal,
      });
      const currentUserWalletAddress = getWalletAddress(defaultNetwork, true);
      if (currentUserWalletAddress === walletAddress) {
        return { balance: formatEther(response ?? 0), shortName: shortName };
      }
    } catch (error) {
      return { shortName: '' };
    }
  }

  const fetchEstimatedTimeRequiredForTransaction = async (gasPrice: number) => {
    let etherscanProvider = new ethers.EtherscanProvider('mainnet');
    try {
      let response = await etherscanProvider.fetch('gastracker', {
        action: 'gasestimate',
        gasprice: gasPrice,
      });
      return response;
    } catch (error) {
      return undefined;
    }
  };

  const fetchEthBalance = async (
    ethAddress: string,
    tokenObj: ExistingNetworksItem,
  ) => {
    return await getBalance(ethAddress, tokenObj);
  };

  const sendNativeToken = async (
    toAddress: string,
    amount: string,
    gasPrice: number,
    gasLimit: number,
    onTransactionRequest: (request?: TransactionRequest) => void,
    onTransactionDone: (
      transaction: TransactionReceipt | null | undefined,
    ) => void,
    onTransactionFail: (
      transaction: TransactionReceipt | null | undefined | string,
    ) => void,
    tokenObj: ExistingNetworksItem,
    shouldCancelTransaction = false,
    transactionObj: TransactionRequest = {},
  ) => {
    try {
      const provider = getProvider(
        tokenObj?.providerNetworkRPC_URL,
        tokenObj?.providerNetworkRPC_Network_Name,
      );
      const walletAddress = getWalletAddress(
        tokenObj.networkName,
        tokenObj.isEVMNetwork,
      );
      const feeData = await provider?.getFeeData();

      const transaction = createTransactionObject(
        shouldCancelTransaction
          ? transactionObj
          : {
              from: walletAddress,
              to: toAddress,
              value: parseEther(amount),
              gasPrice: gasPrice
                ? gasPrice * Math.pow(10, 9)
                : Number(feeData?.gasPrice),
              gasLimit:
                gasLimit || (tokenObj?.title !== 'BNB' ? 21000 : undefined),
              nonce: await provider?.getTransactionCount(
                walletAddress,
                'latest',
              ),
            },
      );
      // Percentage to decrease by (30% in this example)
      const percentageToDecrease = 30;

      // Convert the percentage to a BigInt
      const bigIntPercentage = BigInt(percentageToDecrease);

      // Calculate the decreased value
      const increasedValue =
        feeData?.gasPrice +
        (feeData?.gasPrice * bigIntPercentage) / BigInt(100);
      onTransactionRequest(
        shouldCancelTransaction
          ? undefined
          : {
              ...transaction,
              ...{
                gasPrice: increasedValue,
              },
            },
      );
      await WalletSigner().signTransaction(transaction, tokenObj);

      const signWallet = (await WalletSigner().signWallet(
        tokenObj,
      )) as HDNodeWallet;

      const transactionResponse = await signWallet.sendTransaction(transaction);

      const txReceipt = await transactionResponse.getTransaction();
      const completedTransaction = await provider?.waitForTransaction(
        txReceipt?.hash ?? '',
        1,
        150000,
      );

      if (completedTransaction?.status === 1) {
        onTransactionDone(completedTransaction);
        WalletCommonService().getBalanceAfterTransaction(tokenObj);
      } else {
        onTransactionFail(completedTransaction);
      }
    } catch (error: any) {
      console.log('error?', error);

      const parsedEthersError = getParsedEthersError(error as EthersError);
      // const { jsonErrorPart } = parseEthTransactionError(error?.message);
      onTransactionFail(parsedEthersError.context);
    }
  };

  const sendCustomToken = async (
    toAddress: string,
    amount: number,
    gasPrice: number,
    gasLimit: number,
    onTransactionRequest: (request?: TransactionRequest) => void,
    onTransactionDone: (
      transaction: TransactionReceipt | null | undefined,
    ) => void,
    onTransactionFail: (
      transaction: TransactionReceipt | null | undefined | string,
    ) => void,
    tokenObj: ExistingNetworksItem,
  ) => {
    try {
      const provider = getProvider(
        tokenObj?.providerNetworkRPC_URL,
        tokenObj?.providerNetworkRPC_Network_Name,
      );
      const contract = await Erc20TokenService().getContract(
        tokenObj?.tokenContractAddress,
        tokenObj,
      );
      const decimal = await contract.decimals();
      const value = formatErc20TokenConvertNormal(
        amount,
        decimal.toString(),
      ).toString();

      const estimatedGas =
        (gasPrice > 0 && gasPrice * Math.pow(10, 9)) ||
        (await contract.transfer.estimateGas(toAddress, value));

      const nonce = await provider?.getTransactionCount(
        getWalletAddress(tokenObj?.networkName, tokenObj?.isEVMNetwork),
        'latest',
      );

      const transaction = await contract.transfer(toAddress, value, {
        nonce: nonce,
        gasPrice: estimatedGas,
      });

      onTransactionRequest({
        ...transaction,
        ...{
          gasPrice: estimatedGas + 1000000000,
        },
      });
      const txReceipt = await transaction.getTransaction();
      const completedTransaction = await txReceipt?.wait();
      if (completedTransaction?.status === 1) {
        onTransactionDone(completedTransaction);
        WalletCommonService().getBalanceAfterTransaction(tokenObj);
      } else {
        onTransactionFail(completedTransaction);
      }
    } catch (error: any) {
      console.log('Error?', error);
      const parsedEthersError = getParsedEthersError(error as EthersError);
      onTransactionFail(parsedEthersError.context);
    }
  };

  const getFeeData = async (
    tokenObj: ExistingNetworksItem,
  ): Promise<GasFeeData> => {
    const provider = getProvider(
      tokenObj?.providerNetworkRPC_URL,
      tokenObj?.providerNetworkRPC_Network_Name,
    );
    const feeData = await provider?.getFeeData();

    return {
      gasPrice: formatUnits(feeData?.gasPrice, 'gwei'),
      maxFeePerGas: feeData?.maxFeePerGas
        ? formatUnits(feeData?.maxFeePerGas, 'gwei')
        : 0,
      maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas
        ? formatUnits(feeData?.maxPriorityFeePerGas, 'gwei')
        : 0,
    };
  };

  const resetWallet = () => {
    cachedWallet = null;
  };

  const getCustomTokenInformation = async (
    contractAddress: string,
    networkObj: ExistingNetworksItem,
  ) => {
    if (contractAddress.length === 42) {
      //Valid contract address length
      try {
        const provider = EthersService().getProvider(
          networkObj.providerNetworkRPC_URL,
          networkObj.providerNetworkRPC_Network_Name,
        );
        const res = EthersService().getAndInitContract(
          contractAddress,
          Erc20TokenABI,
          provider,
        );
        const symbol = await res.symbol();
        const decimals = await res.decimals();
        const address = getWalletAddress(
          networkObj?.networkName,
          networkObj?.isEVMNetwork,
        );
        const balance = await res?.balanceOf(address);
        const formattedBalance = formatErc20Token(balance, decimals);
        return {
          symbol: symbol,
          decimals: decimals,
          error: null,
          balance: formattedBalance,
        };
      } catch (error) {
        console.log('error??', error);
        return {
          error: 'Token address must be a valid!',
        };
      }
    } else {
      return {
        error: 'Token address must be a valid!',
      };
    }
  };

  const getNetworkInfoFromUrl = (url: string) => {
    let provider;
    if (url.startsWith('wss://')) {
      provider = new ethers.WebSocketProvider(url);
    } else {
      provider = new ethers.JsonRpcProvider(url);
    }
    return provider;
  };

  const getPrivateKeyUsingSeedPhrase = (pathIndex: string = '0') => {
    const newMnemonic = Mnemonic.fromPhrase(
      store.getState().wallet.data.seedPhrase,
    );
    const path = `m/44'/60'/0'/0/${pathIndex}`;
    let wallet = ethers.HDNodeWallet.fromMnemonic(newMnemonic, path);
    return wallet.privateKey;
  };

  return {
    getBalance,
    getProvider,
    getAndInitContract,
    createWalletUsingSeed,
    createTransactionObject,
    getWalletUsingSeed,
    getTokenActivityListByAddress,
    getTokenTransactionDetails,
    getEVMNativeTokenBalance,
    fetchEthBalance,
    getAndInitContractWithOutSigner,
    sendNativeToken,
    getFeeData,
    fetchEstimatedTimeRequiredForTransaction,
    sendCustomToken,
    getWalletUsingPrivateKey,
    resetWallet,
    getCustomTokenInformation,
    getNetworkInfoFromUrl,
    getPrivateKeyUsingSeedPhrase,
  };
};

export default EthersService;
