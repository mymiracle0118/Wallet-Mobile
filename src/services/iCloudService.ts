import {
  createDir,
  defaultICloudContainerPath,
  exist,
  readFile,
  unlink,
  upload,
} from 'react-native-cloud-store';

import { t } from 'i18next';
import { showToast } from 'theme/Helper/common/Function';
import {
  documentFolderName,
  recoveryFileNamePreFix,
} from 'theme/Helper/constant';

const iCloudService = () => {
  const getFilePath = async () => {
    return (
      defaultICloudContainerPath +
      `/${documentFolderName}/${recoveryFileNamePreFix}0.json`
    );
  };

  const deleteiCloudFolderOrFile = async (folderPath: string) => {
    await unlink(folderPath);
  };

  const uploadToiCloud = async (localPath: string, fileName: string) => {
    try {
      await createDir(defaultICloudContainerPath + `/${documentFolderName}/`);
      const isFileExists = await exist(
        defaultICloudContainerPath + `/${documentFolderName}/` + fileName,
      );
      if (isFileExists) {
        await deleteiCloudFolderOrFile(
          defaultICloudContainerPath + `/${documentFolderName}/` + fileName,
        );
      }
      await upload(
        localPath,
        defaultICloudContainerPath + `/${documentFolderName}/` + fileName,
      );
    } catch (e) {
      console.error('e', e);
    }
  };

  const readiCloudFile = async (filePathForRead: string) => {
    try {
      let content = await readFile(filePathForRead);
      return content;
    } catch (e) {
      console.error('e', e);
      showToast('error', t('common:Recovery_File_does_not_exist'));
    }
  };

  return {
    getFilePath,
    deleteiCloudFolderOrFile,
    uploadToiCloud,
    readiCloudFile,
  };
};

export default iCloudService;
