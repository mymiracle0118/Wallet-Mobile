import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { t } from 'i18next';
import {
  getTokenActivityListFetch,
  getTokenTransactionDetailsFetch,
  getAllTokenBalanceAndStartObservers,
  getEVMNativeTokenBalanceFetch,
  getUSDPrice,
} from 'services/apiActions';
import {
  generateRandomString,
  parseTokenBalance,
} from 'theme/Helper/common/Function';
import { networksURLList } from 'theme/Helper/constant';
import mockData from 'theme/mockData';
import {
  ActivityItemInterface,
  EnvironmentType,
  ExistingNetworksItem,
} from 'types/apiResponseInterfaces';
import { TokenBalanceFormatted } from 'types/applicationInterfaces';

interface WalletInfoState {
  data: {
    walletAddress: { [key: string]: { [key: string]: string } };
    seedPhrase: string;
    privateKey: string;
    totalBalance: string;
    tokenArrayWithBalance: {
      [key: string]: { [key: string]: ExistingNetworksItem };
    }; // store network or token which is all user added from tokensList
    currentUserTokenArrayWithBalance: { [key: string]: ExistingNetworksItem }; // store network or token which is current user added from tokensList
    currentSelectedToken?: ExistingNetworksItem; // store current selected network or token
    selectedTokensList: { [key: string]: string[] }; // store only short name like. ['ETH', 'SUI]
    totalUSDBalance: string;
    activityList: ActivityItemInterface[];
    activityListFooterLoader: boolean;
    activityTransactionInfo?: ActivityItemInterface;
    shouldRefetchAllBalanceAndStartBalanceChangeObservers: boolean;
    tokensList: { [key: string]: ExistingNetworksItem }; // All network and token
    isWalletFromSeedPhase: boolean;
    networkEnvironment: EnvironmentType;
  };
  selectedNetworkFilter?: ExistingNetworksItem;
  errorActivityList: string;
  errorActivityTransactionInfo: string;
  loaderActivityList: boolean;
}

const initialState: WalletInfoState = {
  data: {
    walletAddress: {},
    seedPhrase: '',
    privateKey: '',
    totalBalance: '',
    totalUSDBalance: '0',
    tokenArrayWithBalance: {},
    activityList: [],
    activityTransactionInfo: undefined,
    selectedTokensList: {},
    currentSelectedToken: undefined,
    shouldRefetchAllBalanceAndStartBalanceChangeObservers: false,
    activityListFooterLoader: false,
    tokensList: {},
    isWalletFromSeedPhase: false,
    networkEnvironment: 'mainNet',
    currentUserTokenArrayWithBalance: {},
  },
  selectedNetworkFilter: undefined,
  errorActivityList: '',
  errorActivityTransactionInfo: '',
  loaderActivityList: false,
};
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    triggerFetchAllTokenBalanceAndStartObservers: state => {
      state.data.shouldRefetchAllBalanceAndStartBalanceChangeObservers =
        !state.data.shouldRefetchAllBalanceAndStartBalanceChangeObservers;
    },
    updateWalletAddress: (
      state,
      action: PayloadAction<{
        walletAddress: string;
        networkName: string;
      }>,
    ) => {
      state.data.walletAddress[action.meta.currentUserId] = {
        ...state.data.walletAddress[action.meta.currentUserId],
        [action.payload?.networkName]: action.payload?.walletAddress,
      };

      // console.log('state.data.walletAddress', state.data.walletAddress);
    },

    updateSeedPhrase: (
      state,
      action: PayloadAction<{ seedPhrase: string }>,
    ) => {
      // console.log('seedPhrase : ', action.payload?.seedPhrase);
      state.data.seedPhrase = action.payload?.seedPhrase;
    },

    updatePrivateKey: (
      state,
      action: PayloadAction<{ privateKey: string }>,
    ) => {
      console.log('privateKey : ', action.payload?.privateKey);
      state.data.privateKey = action.payload?.privateKey;
    },

    updateIsWalletFromSeedPhase: (
      state,
      action: PayloadAction<{ isSeedPhase: boolean }>,
    ) => {
      state.data.isWalletFromSeedPhase = action.payload?.isSeedPhase;
    },

    updateWalletInfo: (state, { payload: { data } }: WalletPayload) => {
      if (typeof data !== 'undefined') {
        state.data = data;
      }
    },
    updateBalance: (
      state,
      action: PayloadAction<{ tokenName: string; tokenBalance: string }>,
    ) => {
      const { tokenName, tokenBalance } = action.payload || {};

      if (
        !state.data.currentUserTokenArrayWithBalance[tokenName] ||
        state.data.currentUserTokenArrayWithBalance[tokenName]?.amount ===
          tokenBalance
      ) {
        return;
      }

      const updatedTokenArrayWithBalance = {
        ...state.data.currentUserTokenArrayWithBalance,
        [tokenName]: {
          ...state.data.currentUserTokenArrayWithBalance[tokenName],
          amount: tokenBalance,
        },
      };
      state.data.currentUserTokenArrayWithBalance =
        updatedTokenArrayWithBalance;
      state.data.totalBalance = calculateTotalBalance(
        updatedTokenArrayWithBalance,
      );
      state.data.totalUSDBalance = calculateTotalUSDBalance(
        updatedTokenArrayWithBalance,
      );
      state.data.currentSelectedToken = updateSelectedToken(
        state.data.currentSelectedToken,
        tokenName,
        tokenBalance,
      );
    },

    updateBalanceInBatch: (
      state,
      action: PayloadAction<TokenBalanceFormatted[]>,
    ) => {
      const temp = { ...state.data.currentUserTokenArrayWithBalance };
      action.payload.forEach(item => {
        const { tokenName, tokenBalance } = item || {};

        if (!temp[tokenName] || temp[tokenName].amount === tokenBalance) {
          return;
        }

        temp[tokenName] = {
          ...temp[tokenName],
          amount: tokenBalance,
        };

        state.data.currentSelectedToken = updateSelectedToken(
          state.data.currentSelectedToken,
          tokenName,
          tokenBalance,
        );
      });
      state.data.totalBalance = calculateTotalBalance(temp);
      state.data.totalUSDBalance = calculateTotalUSDBalance(temp);
      state.data.currentUserTokenArrayWithBalance = temp;
    },

    updateUSDRate: (
      state,
      action: PayloadAction<{ tokenName: string; tokenUSDPrice: string }>,
    ) => {
      const { tokenName, tokenUSDPrice } = action.payload || {};
      if (
        !state.data.currentUserTokenArrayWithBalance[tokenName] ||
        state.data.currentUserTokenArrayWithBalance[tokenName].usdAmount ===
          tokenUSDPrice
      ) {
        return;
      }

      const updatedTokenArrayWithBalance = {
        ...state.data.currentUserTokenArrayWithBalance,
        [tokenName]: {
          ...state.data.currentUserTokenArrayWithBalance[tokenName],
          usdAmount: tokenUSDPrice,
        },
      };

      state.data.currentUserTokenArrayWithBalance =
        updatedTokenArrayWithBalance;

      state.data.currentUserTokenArrayWithBalance[action.payload?.tokenName] = {
        ...state.data.currentUserTokenArrayWithBalance[
          action.payload?.tokenName
        ],
        usdAmount: action.payload?.tokenUSDPrice,
      };
      state.data.totalUSDBalance = calculateTotalUSDBalance(
        updatedTokenArrayWithBalance,
      );
    },

    getTotalBalance: state => {
      state.data.totalBalance =
        Object.values(state.data.currentUserTokenArrayWithBalance).reduce(
          (accumulator: number, token) => {
            return accumulator + parseTokenBalance(token.amount);
          },
          0,
        ) + '';
      state.data.totalUSDBalance =
        Object.values(state.data.currentUserTokenArrayWithBalance).reduce(
          (accumulator: number, token) => {
            return (
              accumulator +
              parseTokenBalance(token.amount) * parseFloat(token.usdAmount)
            );
          },
          0,
        ) + '';
    },
    resetTotalBalance: state => {
      state.data.totalBalance = '';
      state.data.totalUSDBalance = '0';
    },

    setTokenAsFavorite: (
      state,
      action: PayloadAction<{ shortName: string }>,
    ) => {
      state.data.currentUserTokenArrayWithBalance[action.payload.shortName] = {
        ...state.data.currentUserTokenArrayWithBalance[
          action.payload.shortName
        ],
        isFavorite:
          !state.data.currentUserTokenArrayWithBalance[action.payload.shortName]
            .isFavorite,
      };

      state.data.currentSelectedToken = {
        ...state.data.currentSelectedToken,
        isFavorite:
          state.data.currentUserTokenArrayWithBalance[action.payload.shortName]
            .isFavorite,
      };
    },

    addRemoveTokenFromList: (
      state,
      action: PayloadAction<{ token: ExistingNetworksItem }>,
    ) => {
      const tokenObj = action.payload?.token;

      const { shortName, isCustom } = tokenObj;

      if (
        state.data.selectedTokensList[action.meta.currentUserId]?.includes(
          shortName,
        )
      ) {
        delete state.data.tokenArrayWithBalance[action.meta.currentUserId][
          shortName
        ];
        delete state.data.currentUserTokenArrayWithBalance[shortName];
        state.data.selectedTokensList[action.meta.currentUserId] =
          state.data.selectedTokensList[action.meta.currentUserId].filter(
            tokenShortName => tokenShortName !== shortName,
          );
        if (isCustom) {
          delete state.data.tokensList[shortName];
        }
      } else {
        const id = generateRandomString(5);
        if (isCustom) {
          state.data.tokenArrayWithBalance[action.meta.currentUserId] = {
            ...state.data.tokenArrayWithBalance[action.meta.currentUserId],
            [shortName]: {
              ...tokenObj,
              isUpdated: false,
              id: tokenObj?.id ? tokenObj?.id : id,
              envType: state.data.networkEnvironment,
            },
          };
          state.data.currentUserTokenArrayWithBalance =
            state.data.tokenArrayWithBalance[action.meta.currentUserId];
        } else {
          state.data.tokenArrayWithBalance[action.meta.currentUserId] = {
            ...state.data.tokenArrayWithBalance[action.meta.currentUserId],
            [shortName]: {
              ...tokenObj,
              isUpdated: false,
              id: tokenObj?.id ? tokenObj?.id : id,
              envType: state.data.networkEnvironment,
              ...networksURLList[tokenObj?.networkId][
                state.data.networkEnvironment
              ],
            },
          };

          state.data.currentUserTokenArrayWithBalance =
            state.data.tokenArrayWithBalance[action.meta.currentUserId];
        }

        if (Object.keys(state.data.selectedTokensList).length > 0) {
          if (state.data.selectedTokensList[action.meta.currentUserId]) {
            state.data.selectedTokensList[action.meta.currentUserId].push(
              shortName,
            );
          } else {
            state.data.selectedTokensList = {
              ...state.data.selectedTokensList,
              [action.meta.currentUserId]: [shortName],
            };
          }
        } else {
          state.data.selectedTokensList = {
            [action.meta.currentUserId]: [shortName],
          };
        }

        if (isCustom) {
          state.data.tokensList = {
            ...state.data.tokensList,
            [shortName]: {
              ...tokenObj,
              isUpdated: false,
              id: tokenObj?.id ? tokenObj?.id : id,
            },
          };
        }
      }
    },

    hideTokenFromList: (
      state,
      action: PayloadAction<{ token: ExistingNetworksItem }>,
    ) => {
      const { networkId, tokenType, shortName, isCustom } =
        action.payload?.token;

      if (
        state.data.selectedTokensList[action.meta.currentUserId].includes(
          shortName,
        )
      ) {
        if (tokenType === 'Native') {
          for (const item of Object.values(
            state.data.tokenArrayWithBalance[action.meta.currentUserId],
          )) {
            if (item.networkId === networkId) {
              delete state.data.tokenArrayWithBalance[
                action.meta.currentUserId
              ][item.shortName];
              delete state.data.currentUserTokenArrayWithBalance[
                item.shortName
              ];
              state.data.selectedTokensList[action.meta.currentUserId] =
                state.data.selectedTokensList[action.meta.currentUserId].filter(
                  tokenShortName => tokenShortName !== item.shortName,
                );
            }
          }
        } else {
          delete state.data.tokenArrayWithBalance[action.meta.currentUserId][
            shortName
          ];
          delete state.data.currentUserTokenArrayWithBalance[shortName];
          state.data.selectedTokensList[action.meta.currentUserId] =
            state.data.selectedTokensList[action.meta.currentUserId].filter(
              tokenShortName => tokenShortName !== shortName,
            );
        }
        if (isCustom) {
          delete state.data.tokensList[shortName];
        }
      }
    },

    setCurrentSelectedTokenById: (
      state,
      action: PayloadAction<{ tokenId: string }>,
    ) => {
      const selectedTokenObj =
        state.data.currentUserTokenArrayWithBalance[action?.payload.tokenId];
      state.data.activityList = [];
      state.data.activityTransactionInfo = undefined;
      state.errorActivityTransactionInfo = '';
      state.errorActivityList = '';
      state.loaderActivityList = false;
      state.data.currentSelectedToken = selectedTokenObj;
    },

    clearActivityTransactionInfo: state => {
      state.data.activityTransactionInfo = undefined;
      state.errorActivityTransactionInfo = '';
    },

    clearSelectedTokensListList: state => {
      state.data.selectedTokensList = {};
      state.data.tokenArrayWithBalance = {};
      state.data.walletAddress = {};
      const tempTokenObjList = { ...mockData.networksListArray };
      for (const item of Object.values(mockData.networksListArray)) {
        tempTokenObjList[item.shortName] = {
          ...item,
          ...networksURLList[item?.networkId][state.data.networkEnvironment],
          envType: state.data.networkEnvironment,
        };
      }
      state.data.tokensList = tempTokenObjList;
    },

    //update activity list item with updated status and update info in details page also
    //update transaction status for activity details page transactionStatus 1 for Success, 2 for pending, 3 for Failed
    updateTokenTransactionDetails: (state, action) => {
      const txtList = state.data.activityList?.filter(
        obj => obj?.id !== action.payload?.id,
      );

      state.data.activityList = [action.payload, ...txtList];
      state.data.activityTransactionInfo = action.payload;
    },

    updateSelectedNetworkFilter: (state, action) => {
      state.selectedNetworkFilter = action.payload.data;
    },

    updateNetworkEnvironment: (
      state,
      action: PayloadAction<{ envType: EnvironmentType }>,
    ) => {
      const tempTokenList = Object.values(
        state.data.currentUserTokenArrayWithBalance,
      );
      const tempTokenObjList = {
        ...state.data.currentUserTokenArrayWithBalance,
      };

      for (const item of tempTokenList) {
        if (!item?.isCustom && item?.tokenType === 'Native') {
          tempTokenObjList[item?.shortName] = {
            ...item,
            amount: '0.0',
            ...networksURLList[item?.networkId][action.payload?.envType],
            envType: action.payload?.envType,
          };
        }
      }

      state.data.tokenArrayWithBalance[action.meta.currentUserId] =
        tempTokenObjList;
      state.data.currentUserTokenArrayWithBalance = tempTokenObjList;
      state.data.networkEnvironment = action.payload?.envType;
    },

    updateCurrentUserNetworkList: (
      state,
      action: PayloadAction<{ userId: string }>,
    ) => {
      const tempTokenList = Object.values(
        state.data.tokenArrayWithBalance[action.payload.userId],
      );
      const tempTokenObjList = {
        ...state.data.tokenArrayWithBalance[action.payload.userId],
      };

      for (const item of tempTokenList) {
        if (!item?.isCustom && item?.tokenType === 'Native') {
          tempTokenObjList[item?.shortName] = {
            ...item,
            amount: '0.0',
            ...networksURLList[item?.networkId][state.data.networkEnvironment],
            envType: state.data.networkEnvironment,
          };
        }
      }

      state.data.tokenArrayWithBalance[action.payload.userId] =
        tempTokenObjList;
      state.data.currentUserTokenArrayWithBalance = tempTokenObjList;

      state.data.shouldRefetchAllBalanceAndStartBalanceChangeObservers =
        !state.data.shouldRefetchAllBalanceAndStartBalanceChangeObservers;

      state.selectedNetworkFilter = null;
    },

    hideUserData: (
      state,
      action: PayloadAction<{
        removeUserId: string;
      }>,
    ) => {
      delete state.data.walletAddress[action.payload.removeUserId];
      delete state.data.tokenArrayWithBalance[action.payload.removeUserId];
      delete state.data.selectedTokensList[action.payload.removeUserId];
    },

    resetWalletInfo: () => initialState,
  },
  extraReducers: builder => {
    builder.addCase(getAllTokenBalanceAndStartObservers.pending, _state => {});

    // getTokenActivityListFetch
    builder.addCase(getTokenActivityListFetch.pending, state => {
      state.data.activityListFooterLoader = true;
      state.loaderActivityList = true;
      state.errorActivityList = '';
    });

    builder.addCase(getTokenActivityListFetch.fulfilled, (state, action) => {
      state.data.activityListFooterLoader = false;
      state.loaderActivityList = false;
      if (action.payload?.data) {
        if (action.payload?.data?.length > 0) {
          if (action.payload?.isNativeToken) {
            const txtList = action.payload?.data?.filter(
              obj => obj?.functionName === '',
            );
            let tempList = [];
            for (let obj in txtList) {
              const temp = {
                ...txtList[obj],
                ...{
                  id:
                    state.data.walletAddress[action.meta.currentUserId][
                      state.data.currentSelectedToken?.networkName
                    ]?.toLowerCase() === txtList[obj].from?.toLowerCase()
                      ? '1'
                      : '2',
                },
              };
              tempList.push(temp);
            }

            if (state.data.activityList?.length > 0) {
              state.data.activityList =
                state.data.activityList?.concat(tempList);
            } else {
              state.data.activityList = tempList;
            }
          } else {
            const txtList = action.payload?.data;
            let tempList = [];
            for (let obj in txtList) {
              const temp = {
                ...txtList[obj],
                ...{
                  id:
                    state.data.walletAddress[action.meta.currentUserId][
                      state.data.currentSelectedToken?.networkName
                    ]?.toLowerCase() === txtList[obj].from?.toLowerCase()
                      ? '1'
                      : '2',
                },
              };
              tempList.push(temp);
            }
            if (state.data.activityList?.length > 0) {
              state.data.activityList =
                state.data.activityList?.concat(tempList);
            } else {
              state.data.activityList = tempList;
            }
          }
        } else {
          state.errorActivityList = t('wallet:no_activities_yet');
        }
      }
    });
    builder.addCase(getTokenActivityListFetch.rejected, state => {
      state.loaderActivityList = false;
      state.errorActivityList = t('wallet:no_activities_yet');
    });

    // getTokenTransactionDetailsFetch
    builder.addCase(getTokenTransactionDetailsFetch.pending, state => {
      state.errorActivityTransactionInfo = '';
    });

    builder.addCase(
      getTokenTransactionDetailsFetch.fulfilled,
      (state, action) => {
        if (action.payload?.length > 0) {
          state.data.activityTransactionInfo = action.payload[0];
        } else {
          state.errorActivityTransactionInfo = t(
            'wallet:no_activities_details_found',
          );
        }
      },
    );

    builder.addCase(getTokenTransactionDetailsFetch.rejected, state => {
      state.errorActivityTransactionInfo = t(
        'wallet:no_activities_details_found',
      );
    });

    //getEVMNativeTokenBalanceFetch

    builder.addCase(
      getEVMNativeTokenBalanceFetch.fulfilled,
      (state, action) => {
        const temp = {
          ...state.data.currentUserTokenArrayWithBalance,
        };
        if (
          temp[action.payload?.shortName]?.amount === action.payload?.balance ||
          !temp.hasOwnProperty(action.payload?.shortName)
        ) {
          return;
        }

        temp[action.payload?.shortName] = {
          ...temp[action.payload?.shortName],
          amount: action.payload?.balance,
        };

        if (
          action.payload?.shortName ===
          state.data.currentSelectedToken?.shortName
        ) {
          state.data.currentSelectedToken = {
            ...state.data.currentSelectedToken,
            amount: action.payload?.balance,
          };
        }
        state.data.totalBalance =
          Object.values(temp).reduce((accumulator: number, token) => {
            return accumulator + parseTokenBalance(token.amount);
          }, 0) + '';

        state.data.totalUSDBalance =
          Object.values(temp).reduce((accumulator: number, token) => {
            return (
              accumulator +
              parseTokenBalance(token.amount) * parseFloat(token.usdAmount)
            );
          }, 0) + '';

        state.data.currentUserTokenArrayWithBalance = temp;
      },
    );

    //getUSDPrice
    builder.addCase(getUSDPrice.fulfilled, (state, action) => {
      const temp = {
        ...state.data.currentUserTokenArrayWithBalance,
      };

      action.payload.forEach(item => {
        if (
          temp[item?.shortName]?.usdAmount === item.usdAmount ||
          !temp.hasOwnProperty(item?.shortName)
        ) {
          return;
        }

        temp[item?.shortName] = {
          ...temp[item?.shortName],
          usdAmount: item?.usdAmount,
          oneDayUSDPriceChangePercentage: item?.oneDayUSDPriceChangePercentage,
        };

        if (item?.shortName === state.data.currentSelectedToken?.shortName) {
          state.data.currentSelectedToken = {
            ...state.data.currentSelectedToken,
            usdAmount: item?.usdAmount,
            oneDayUSDPriceChangePercentage:
              item?.oneDayUSDPriceChangePercentage,
          };
        }
      });

      state.data.totalUSDBalance =
        Object.values(temp).reduce((accumulator: number, token) => {
          return (
            accumulator +
            parseTokenBalance(token.amount) * parseFloat(token.usdAmount)
          );
        }, 0) + '';

      state.data.currentUserTokenArrayWithBalance = temp;
    });
  },
});

const calculateTotalBalance = (tokenArray: {
  [key: string]: ExistingNetworksItem;
}) =>
  Object.values(tokenArray).reduce(
    (accumulator, token) => accumulator + parseTokenBalance(token.amount),
    0,
  ) + '';

const calculateTotalUSDBalance = (tokenArray: {
  [key: string]: ExistingNetworksItem;
}) =>
  Object.values(tokenArray).reduce(
    (accumulator, token) =>
      accumulator +
      parseTokenBalance(token.amount) * parseFloat(token.usdAmount),
    0,
  ) + '';

const updateSelectedToken = (
  currentSelectedToken: ExistingNetworksItem,
  tokenName: string,
  tokenBalance: string,
) =>
  tokenName === currentSelectedToken?.shortName
    ? { ...currentSelectedToken, amount: tokenBalance }
    : currentSelectedToken;

export const {
  updateWalletAddress,
  updateSeedPhrase,
  updatePrivateKey,
  updateWalletInfo,
  resetWalletInfo,
  updateBalance,
  getTotalBalance,
  updateUSDRate,
  clearActivityTransactionInfo,
  setTokenAsFavorite,
  addRemoveTokenFromList,
  setCurrentSelectedTokenById,
  updateTokenTransactionDetails,
  clearSelectedTokensListList,
  triggerFetchAllTokenBalanceAndStartObservers,
  resetTotalBalance,
  updateBalanceInBatch,
  hideTokenFromList,
  updateSelectedNetworkFilter,
  updateNetworkEnvironment,
  updateCurrentUserNetworkList,
  updateIsWalletFromSeedPhase,
  hideUserData,
} = walletSlice.actions;
export default walletSlice.reducer;

type WalletPayload = {
  payload: Partial<WalletInfoState>;
};
