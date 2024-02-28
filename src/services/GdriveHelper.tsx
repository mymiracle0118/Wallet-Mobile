import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GDrive,
  ListQueryBuilder,
  MimeTypes,
} from '@robinbobin/react-native-google-drive-api-wrapper';
import { t } from 'i18next';
import { showAlert, showToast } from 'theme/Helper/common/Function';

import app from '../../app.json';
import FileManagerService from './FileManagerService';

const ROOT_FOLDER_ID = 'root';
const SHUTTLE_FOLDER_NAME = `DO NOT DELETE ${app.displayName}`;

const gDriveAccessScopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appfolder',
  'https://www.googleapis.com/auth/drive.appdata',
];

const gdrive = new GDrive();
// gdrive.accessToken = null;

export const config = async () => {
  GoogleSignin.configure({
    scopes: gDriveAccessScopes,
  });
  await logoutGoogleAccount();
  await loginWithGoogle();
};

export const createFolder = async (folderName: string) => {
  const rootFolder = await retrieveSafeGuardFolderObject(
    gdrive,
    ROOT_FOLDER_ID,
  );
  // Check if the folder already exists
  if (rootFolder?.files?.length > 0) {
    await deleteFiles();
    return;
  }
  // Create the folder
  await gdrive.files
    .newMetadataOnlyUploader()
    .setRequestBody({
      name: folderName,
      mimeType: MimeTypes.FOLDER,
      parents: [ROOT_FOLDER_ID],
    })
    .execute();
};

export const createFiles = async (localPath: string, fileName: string) => {
  await createFolder(SHUTTLE_FOLDER_NAME);
  const rootFolder = await retrieveSafeGuardFolderObject(
    gdrive,
    ROOT_FOLDER_ID,
  );

  const data = await FileManagerService().readFile(localPath, 'utf8');
  const uploadedFile = await gdrive.files
    .newMultipartUploader()
    .setData(data, MimeTypes.JSON)
    .setRequestBody({
      name: fileName,
      parents: [rootFolder.files[0].id],
    })
    .execute();
  console.log('Done!', uploadedFile);
};

export const deleteFiles = async () => {
  const folderData = await retrieveSafeGuardFolderObject();
  //folder does not exist so no need to delete files
  if (folderData?.files?.length === 0) {
    return;
  }
  const folderId = folderData?.files[0].id;
  const res = await retrieveFilesInFolderById(folderId);
  for (const item of res.files) {
    gdrive.files.delete(item?.id);
  }
};

export const readFiles = async () => {
  try {
    const folderData = await retrieveSafeGuardFolderObject();
    console.log('folderData', folderData);
    if (folderData?.files?.length === 0) {
      throw new Error(t('common:Recovery_Folder_does_not_exist'));
    }
    const folderId = folderData?.files[0].id;

    const res3 = await retrieveFilesInFolderById(folderId);

    const fileData = await gdrive.files.getJson(res3.files[0].id);
    return fileData;
  } catch (error) {
    console.log('readFiles=>>error', error);
    showToast('error', t('common:Recovery_File_does_not_exist'));
  }
};

export const loginWithGoogle = async () => {
  const isUserAlreadyLoggedIn = await GoogleSignin.isSignedIn();
  if (isUserAlreadyLoggedIn) {
  } else {
    //Try signInSilently options first if got error then show account selection option to user show user can select account
    try {
      await GoogleSignin.signIn();
      gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
      gdrive.fetchTimeout = 8000;
    } catch (error) {
      showAlert('', t('common:Google_login_failed'));
      throw new Error(t('common:Google_login_failed'));
    }
  }
};

export const logoutGoogleAccount = async () => {
  gdrive.accessToken = null;
  await GoogleSignin.signOut();
};

export async function retrieveFilesInFolderById(folderId: string | number) {
  return await gdrive.files.list({
    q: new ListQueryBuilder().in(folderId, 'parents').and().e('trashed', false),
  });
}

export const retrieveSafeGuardFolderObject = async () => {
  return await gdrive.files.list({
    q: new ListQueryBuilder()
      .in(ROOT_FOLDER_ID, 'parents')
      .and()
      .e('name', SHUTTLE_FOLDER_NAME),
  });
};
