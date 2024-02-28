import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { UserResponse } from 'types/apiResponseInterfaces';
import { SettingConfig } from 'types/applicationInterfaces';

interface UserState {
  data: {
    token: string;
    usersData: UserResponse[];
    userName: string;
    currentUserId: string;
    currentUser: UserResponse;
    config: SettingConfig;
    importedUsersData: UserResponse[];
  };
}

const initialState: UserState = {
  data: {
    token: '',
    userData: [],
    userName: '',
    currentUserId: '',
    currentUser: {},
    importedUsersData: [],
    config: {
      isFaceIdEnabled: false,
      isFaceIdEnabledForTransaction: false,
      shouldHideTokenBalance: false,
      isAnalyticsEnable: false,
      currency: 'USD',
      language: 'EN',
      shouldHideAccountBalance: false,
      isSetupFileRecovery: false,
      autoLockTimer: 0,
    },
  },
};

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    updateUserToken: (
      state,
      action: PayloadAction<{ data: { token: string } }>,
    ) => {
      state.data.token = action.payload.data?.token;
    },

    updateSettingConfig: (
      state,
      action: PayloadAction<{ config: Partial<SettingConfig> }>,
    ) => {
      state.data.config = { ...state.data.config, ...action.payload?.config };
    },

    updateCreateUser: (
      state,
      action: PayloadAction<{ data: UserResponse[] }>,
    ) => {
      state.data.usersData = action.payload.data;
    },

    updateImportedUsersData: (
      state,
      action: PayloadAction<{ data: UserResponse[] }>,
    ) => {
      state.data.importedUsersData = action.payload.data;
    },

    updateUserName: (
      state,
      action: PayloadAction<{ data: { userName: string } }>,
    ) => {
      state.data.userName = action.payload.data?.userName;
    },

    updateCurrentUserId: (
      state,
      action: PayloadAction<{ data: { userId: string } }>,
    ) => {
      state.data.currentUserId = action.payload.data?.userId;
    },

    updateCurrentUser: (
      state,
      action: PayloadAction<{ data: UserResponse }>,
    ) => {
      state.data.currentUser = action.payload.data;
    },

    hideUser: (state, action: PayloadAction<{ removeUserId: string }>) => {
      const { removeUserId } = action.payload;
      state.data.usersData = state.data.usersData.filter(
        item => item.userId !== removeUserId,
      );
      state.data.importedUsersData = state.data.importedUsersData.filter(
        item => item.userId !== removeUserId,
      );

      if (state.data.currentUser.userId === removeUserId) {
        const primaryUser = state.data.usersData[0];
        state.data.currentUser = primaryUser;
        state.data.currentUserId = primaryUser.userId;
      }
    },

    editUserData: (
      state,
      action: PayloadAction<{
        userId: string;
        userName: string;
        profileIcon: string | string[];
      }>,
    ) => {
      const { userId, userName, profileIcon } = action.payload;

      const updateUserList = (userList: UserResponse[]) => {
        const userIndex = userList.findIndex(user => user.userId === userId);
        if (userIndex !== -1) {
          userList[userIndex].userName = userName;
          userList[userIndex].profileIcon = profileIcon;
        }
      };

      updateUserList(state.data.usersData);
      updateUserList(state.data.importedUsersData);

      if (state.data.currentUserId === userId) {
        const tempUserList = state.data.usersData.filter(
          itemObj => itemObj.userId === userId,
        );
        const tempImportList = state.data.importedUsersData.filter(
          itemObj => itemObj.userId === userId,
        );

        state.data.currentUser = tempImportList?.length
          ? tempImportList[0]
          : tempUserList[0];
      }
    },

    resetUserInfo: () => initialState,
  },
});

export const {
  updateUserToken,
  resetUserInfo,
  updateSettingConfig,
  updateCreateUser,
  updateUserName,
  updateCurrentUser,
  updateImportedUsersData,
  hideUser,
  updateCurrentUserId,
  editUserData,
} = userInfoSlice.actions;

export default userInfoSlice.reducer;
