import axios from 'axios';
import {
  formatErc20Token,
  getWalletAddress,
} from 'theme/Helper/common/Function';
import { Erc20TokenABI } from 'theme/Helper/constant';
import { ExistingNetworksItem } from 'types/apiResponseInterfaces';
import { TokenBalanceFormatted } from 'types/applicationInterfaces';

import EthersService from './EthersService';
import WalletSigner from './WalletSigner';

const ERC20_SERVICE_CONSTANTS = {
  WS_PREFIX: 'wss://',
  HTTP_PREFIX: 'https://',
};

const Erc20TokenService = () => {
  const getContract = async (
    erc20TokensContractAddress: string,
    item: ExistingNetworksItem,
  ) => {
    const walletSigner = await WalletSigner().signWallet(item);
    return EthersService().getAndInitContract(
      erc20TokensContractAddress,
      Erc20TokenABI,
      walletSigner,
    );
  };

  const getErc20TokenBalance = async (
    erc20TokensContractAddress: string,
    item: ExistingNetworksItem,
  ): Promise<string> => {
    const walletAddress = getWalletAddress(
      item?.networkName,
      item?.isEVMNetwork,
    );

    try {
      const contract = await getContract(erc20TokensContractAddress, item);
      const balance = await contract.balanceOf(walletAddress);
      const decimal = await contract.decimals();
      return formatErc20Token(balance, decimal);
    } catch (error) {
      console.error(
        'Failed to fetch balance Erc20TokenBalance:',
        error.message,
      );
      throw error;
    }
  };

  const fetchAllErc20TokenBalanceByNetwork = async (
    groupedByNetwork: { [x: string]: any },
    keyName: string,
    item: any[],
  ): Promise<TokenBalanceFormatted[]> => {
    return new Promise(async resolve => {
      try {
        let allTokenBalanceFormattedObjArray: TokenBalanceFormatted[] = [];
        let groupedNetworkValues = groupedByNetwork[keyName];
        let baseURL = groupedNetworkValues[0].providerNetworkRPC_URL.replace(
          ERC20_SERVICE_CONSTANTS.WS_PREFIX,
          ERC20_SERVICE_CONSTANTS.HTTP_PREFIX,
        );

        const address = getWalletAddress(
          groupedNetworkValues[0]?.networkName,
          groupedNetworkValues[0]?.isEVMNetwork,
        );

        if (!address) {
          resolve([]);
        }
        const data = JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getTokenBalances',
          headers: {
            'Content-Type': 'application/json',
          },
          params: [
            `${address}`,
            groupedNetworkValues.map(
              (obj: { tokenContractAddress: any }) => obj.tokenContractAddress,
            ),
          ],
          id: 42,
        });

        const config = {
          method: 'post',
          url: baseURL,
          headers: {
            'Content-Type': 'application/json',
          },
          data: data,
        };

        let response = await axios(config);

        response = response?.data;

        const balances = response?.result;

        for (let token of balances?.tokenBalances) {
          let balance = token.tokenBalance;

          const options = {
            method: 'POST',
            url: baseURL,
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
            },
            data: {
              id: 1,
              jsonrpc: '2.0',
              method: 'alchemy_getTokenMetadata',
              params: [token.contractAddress],
            },
          };

          const metadata = await axios.request(options);
          balance =
            balance / Math.pow(10, metadata?.data?.result?.decimals ?? 0);
          balance = balance.toFixed(metadata?.data?.result?.decimals);

          allTokenBalanceFormattedObjArray.push({
            tokenBalance: balance,
            tokenName:
              item.find(
                (obj: { tokenContractAddress: any }) =>
                  obj.tokenContractAddress === token?.contractAddress,
              )?.shortName || '',
          });

          if (
            allTokenBalanceFormattedObjArray?.length ===
            balances?.tokenBalances?.length
          ) {
            resolve(allTokenBalanceFormattedObjArray);
          }
        }
      } catch (error) {
        resolve([]);
      }
    });
  };

  const fetchAllErc20TokenBalance = (
    item: ExistingNetworksItem[],
  ): Promise<TokenBalanceFormatted[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        let allTokenBalanceFormattedObjArray: TokenBalanceFormatted[] = [];
        const groupedByNetwork: { [key: string]: ExistingNetworksItem[] } =
          item.reduce(
            (result: { [key: string]: ExistingNetworksItem[] }, obj) => {
              const value = obj.providerNetworkRPC_URL;
              obj.providerNetworkRPC_URL = obj.providerNetworkRPC_URL.replace(
                ERC20_SERVICE_CONSTANTS.WS_PREFIX,
                ERC20_SERVICE_CONSTANTS.HTTP_PREFIX,
              );

              result[value] = result[value] || [];
              result[value].push(obj);
              return result;
            },
            {},
          );

        for (let keyName in groupedByNetwork) {
          const response = await fetchAllErc20TokenBalanceByNetwork(
            groupedByNetwork,
            keyName,
            item,
          );
          allTokenBalanceFormattedObjArray =
            allTokenBalanceFormattedObjArray.concat(response);

          if (
            Object.keys(groupedByNetwork)[
              Object.keys(groupedByNetwork).length - 1
            ] === keyName
          ) {
            resolve(allTokenBalanceFormattedObjArray);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    getErc20TokenBalance,
    getContract,
    fetchAllErc20TokenBalance,
  };
};

export default Erc20TokenService;
