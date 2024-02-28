import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($username: String, $walletAddress: String) {
    getUser(username: $username, walletAddress: $walletAddress) {
      id
      username
      walletAddress
      wallets {
        network
        walletAddress
      }
    }
  }
`;
