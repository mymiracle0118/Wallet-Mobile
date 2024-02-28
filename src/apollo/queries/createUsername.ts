import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($userInput: UserInput) {
    createUser(UserInput: $userInput) {
      id
      network
      username
      walletAddress
    }
  }
`;
