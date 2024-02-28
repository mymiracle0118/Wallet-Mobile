import { UserRequest } from 'types/apiRequestInterfaces';
import { User } from 'types/apiResponseInterfaces';

import { ApiConstants, api } from '../../api';

export const userApi = api.injectEndpoints({
  endpoints: build => ({
    fetchOne: build.query<User, UserRequest>({
      query: req => ApiConstants.login + req.id,
    }),
  }),
  overrideExisting: false,
});

export const { useLazyFetchOneQuery } = userApi;
