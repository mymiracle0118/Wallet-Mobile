import { UserRequest } from 'types/apiRequestInterfaces';
import { User } from 'types/apiResponseInterfaces';

import { ApiConstants, api } from '../../api';

const apiUrl = process.env.API_DEVELOPMENT_URL;

export const walletsApi = api.injectEndpoints({
  endpoints: build => ({
    fetchTwo: build.query<User, UserRequest>({
      query: req => apiUrl + ApiConstants.login + req.id,
    }),
  }),
  overrideExisting: false,
});

export const { useLazyFetchTwoQuery } = walletsApi;
