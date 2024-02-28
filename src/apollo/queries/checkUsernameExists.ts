import { gql } from '@apollo/client';

export const CHECK_USER_NAME_EXISTS = gql`
  query Query($username: String!, $network: String) {
    usernameExists(username: $username, network: $network)
  }
`;
