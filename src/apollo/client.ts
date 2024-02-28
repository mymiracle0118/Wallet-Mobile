import { apolloDevToolsInit } from 'react-native-apollo-devtools-client';

import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { t } from 'i18next';
import { showAlert, stopLoader } from 'theme/Helper/common/Function';
import { DEFAULT_API_TIMEOUT } from 'theme/Helper/constant';

let _client: ApolloClient<any>;

export function getApolloClient(): ApolloClient<any> {
  if (_client) {
    return _client;
  }

  const fetchWithTimeout = (uri: RequestInfo, options = {}, time: number) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timed out.'));
      }, time);
      fetch(uri, options).then(
        response => {
          clearTimeout(timer);
          resolve(response);
        },
        err => {
          clearTimeout(timer);
          reject(err);
        },
      );
    });
  };

  const httpLink = createHttpLink({
    uri: process.env.API_DEVELOPMENT_URL,
    fetch: (uri, options) => {
      return fetchWithTimeout(uri, options, DEFAULT_API_TIMEOUT);
    },
  });

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // const token = localStorage.getItem('token');
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        Authorization: 'Apikey suprawallet',
        // Authorization: 'Apikey suprabffwallet',
      },
    };
  });

  // Log any GraphQL errors or network error that occurred
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    stopLoader();
    if (networkError) {
      console.error(`Network Error: ${networkError.message}`);
      showAlert('', networkError.message);
    }
    if (graphQLErrors) {
      const errMsg = graphQLErrors.map(error => JSON.stringify(error));
      console.error(`GraphQL Error: ${errMsg}`);
      if (`${errMsg}`.includes('INTERNAL_SERVER_ERROR')) {
        showAlert('', t('common:something_went_wrong_please_try_again'));
      } else {
        showAlert('', errMsg?.toString());
      }
    }
  });

  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      resultCaching: false,
    }),
    ssrMode: false,
  });

  _client = client;

  if (__DEV__) {
    apolloDevToolsInit(client);
  }
  return client;
}
