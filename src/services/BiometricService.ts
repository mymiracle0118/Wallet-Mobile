import ReactNativeBiometrics from 'react-native-biometrics';

import { t } from 'i18next';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

interface BiometricService {
  checkBiometricSupport: () => Promise<{ supported: boolean; error?: string }>;
  authenticate: (
    promptMessage: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const BiometricService: BiometricService = {
  checkBiometricSupport: async () => {
    try {
      const biometryType = await rnBiometrics.isSensorAvailable();
      return { supported: biometryType.available };
    } catch (error) {
      console.error('Biometric support check failed:', error);
      return { supported: false, error: 'Biometric support check failed' };
    }
  },
  authenticate: async (promptMessage: string) => {
    try {
      const res = await rnBiometrics.simplePrompt({
        promptMessage,
        fallbackPromptMessage: t('common:bioMetrics_fallBackText'),
      });
      return res;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return { success: false, error: 'Biometric authentication failed' };
    }
  },
};

export default BiometricService;
