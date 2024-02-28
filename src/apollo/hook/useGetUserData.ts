import { useDispatch } from 'react-redux';

import { useLazyQuery } from '@apollo/client';
import { GET_USER } from 'apollo/queries/getUserData';
import { AppDispatch } from 'store/index';
import { updateCreateUser, updateCurrentUser } from 'store/userInfo';
import { UserListResponse } from 'types/apiResponseInterfaces';

export const useGetUserData = () => {
  const [callApi, { loading, data }] = useLazyQuery<UserListResponse>(
    GET_USER,
    {
      fetchPolicy: 'network-only',
    },
  );
  const dispatch = useDispatch<AppDispatch>();

  const callApiGetUser = (walletAddress: string) => {
    console.log('callApiGetUser', walletAddress);

    callApi({
      variables: {
        walletAddress: walletAddress,
      },
      onCompleted: (response: UserListResponse) => {
        console.log('onCompleted', response);
        if (response?.getUser?.length) {
          dispatch(updateCurrentUser({ data: response.getUser[0] }));
          dispatch(updateCreateUser({ data: response.getUser }));
        }
      },
    });
  };

  return {
    userData: data,
    userDataLoading: loading,
    callApiGetUser,
  };
};
