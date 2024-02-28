import AesCrypto from 'react-native-aes-crypto';

import KeyChainService from './KeyChainService';

const SALT = 'salt';
const ITERATIONS = 5000;
const KEY_SIZE = 256;
const IV_SIZE = 16;
const ALGORITHM = 'aes-256-cbc';

const EncryptionService = () => {
  const encrypt = async (data: string): Promise<any> => {
    try {
      const passWord = await KeyChainService().getPassWordFromKeyChain();
      const encryptedKey = await AesCrypto.pbkdf2(
        passWord,
        SALT,
        ITERATIONS,
        KEY_SIZE,
      );
      const iv = await AesCrypto.randomKey(IV_SIZE);
      const cipher = await AesCrypto.encrypt(data, encryptedKey, iv, ALGORITHM);
      return {
        cipher,
        iv,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  };

  const decrypt = async (encryptedData: any): Promise<string> => {
    try {
      const passWord = await KeyChainService().getPassWordFromKeyChain();
      const encryptedKey = await AesCrypto.pbkdf2(
        passWord,
        SALT,
        ITERATIONS,
        KEY_SIZE,
      );
      const decryptedData = await AesCrypto.decrypt(
        encryptedData?.cipher,
        encryptedKey,
        encryptedData?.iv,
        ALGORITHM,
      );
      return decryptedData;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  };

  return {
    encrypt,
    decrypt,
  };
};

export default EncryptionService;
