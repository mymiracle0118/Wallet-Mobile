import { useDispatch } from 'react-redux';

import { useMutation } from '@apollo/client';
import { CREATE_USER } from 'apollo/queries/createUsername';
import { AppDispatch } from 'store/index';
import { updateCreateUser, updateCurrentUser } from 'store/userInfo';
import { UserData, CreateUserResponse } from 'types/apiResponseInterfaces';

export const useCreateUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [callApi, { loading, data, reset }] =
    useMutation<CreateUserResponse>(CREATE_USER);

  const callApiCreateUser = (userData: UserData) => {
    reset();

    console.log('userData : ', userData);

    callApi({
      variables: {
        userInput: userData,
      },
      onCompleted: (response: CreateUserResponse) => {
        console.log('onCompleted', response);
        dispatch(updateCreateUser({ data: response.createUser }));
        dispatch(updateCurrentUser({ data: response.createUser[0] }));
      },
    });
  };

  return {
    createUserData: data,
    createUserLoading: loading,
    callApiCreateUser,
  };
};
