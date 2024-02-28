import { useLazyQuery } from '@apollo/client';
import { CHECK_USER_NAME_EXISTS } from 'apollo/queries/checkUsernameExists';
import { UserNameResponse } from 'types/apiResponseInterfaces';

export const useCheckUsernameExists = () => {
  const [callApi, { loading, data }] = useLazyQuery<UserNameResponse>(
    CHECK_USER_NAME_EXISTS,
    {
      fetchPolicy: 'network-only',
    },
  );

  const callApiUsernameExists = (username: string, network: string) => {
    console.log('username and network', username, network);
    callApi({
      variables: {
        username,
        network: network.toLowerCase(),
      },
    });
  };

  return {
    userExistsData: data,
    userExistsLoading: loading,
    callApiUsernameExists,
  };
};
