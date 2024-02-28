import RNFS from 'react-native-fs';

import FileManagerService from './FileManagerService';

// Describing the test suite
describe('FileManagerService', function () {
  // Resetting all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restoring all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // Testing createDirectory function
  it('should create a directory', async () => {
    const mockDirPath = '/mock/dir/path';
    RNFS.mkdir = jest.fn();
    await FileManagerService().createDirectory(mockDirPath);
    expect(RNFS.mkdir).toHaveBeenCalledWith(mockDirPath);
  });
  // Testing deleteDirectory function
  it('should delete a directory', async () => {
    const mockDirPath = '/mock/dir/path';
    RNFS.unlink = jest.fn();
    await FileManagerService().deleteDirectory(mockDirPath);
    expect(RNFS.unlink).toHaveBeenCalledWith(mockDirPath);
  });
  // Testing moveFile function
  it('should move a file', async () => {
    const mockFilePath = '/mock/file/path';
    const mockTargetFilePath = '/mock/target/file/path';
    RNFS.exists = jest.fn().mockResolvedValue(true);
    RNFS.moveFile = jest.fn();
    await FileManagerService().moveFile(mockFilePath, mockTargetFilePath);
    expect(RNFS.unlink).toHaveBeenCalledWith(mockTargetFilePath);
    expect(RNFS.moveFile).toHaveBeenCalledWith(
      mockFilePath,
      mockTargetFilePath,
    );
  });
  // Testing createFile function
  it('should create a file', async () => {
    const mockFilePath = '/mock/file/path';
    const mockFileContent = 'mock file content';
    const mockFileEncoding = 'utf8';
    RNFS.exists = jest.fn().mockResolvedValue(true);
    RNFS.writeFile = jest.fn().mockResolvedValue('FILE WRITTEN!');
    await FileManagerService().createFile(
      mockFilePath,
      mockFileContent,
      mockFileEncoding,
      true,
    );
    expect(RNFS.unlink).toHaveBeenCalledWith(mockFilePath);
    expect(RNFS.writeFile).toHaveBeenCalledWith(
      mockFilePath,
      mockFileContent,
      mockFileEncoding,
    );
  });
  // Testing readFile function
  it('should read a file', async () => {
    const mockFilePath = '/mock/file/path';
    const mockFileEncoding = 'utf8';
    const mockFileContent = 'mock file content';
    RNFS.readFile = jest.fn().mockResolvedValue(mockFileContent);
    const fileContent = await FileManagerService().readFile(
      mockFilePath,
      mockFileEncoding,
    );
    expect(RNFS.readFile).toHaveBeenCalledWith(mockFilePath, mockFileEncoding);
    expect(fileContent).toBe(mockFileContent);
  });
  // Testing deleteFile function
  it('should delete a file', async () => {
    const mockFilePath = '/mock/file/path';
    RNFS.unlink = jest.fn();
    await FileManagerService().deleteFile(mockFilePath);
    expect(RNFS.unlink).toHaveBeenCalledWith(mockFilePath);
  });
  // Testing getFilesAndDirectories function
  it('should get files and directories', async () => {
    const mockDirPath = '/mock/dir/path';
    const mockFilesAndDirs = [{ name: 'mockFile1' }, { name: 'mockFile2' }];
    RNFS.readDir = jest.fn().mockResolvedValue(mockFilesAndDirs);
    const filesAndDirs = await FileManagerService().getFilesAndDirectories(
      mockDirPath,
    );
    expect(RNFS.readDir).toHaveBeenCalledWith(mockDirPath);
    expect(filesAndDirs).toBe(mockFilesAndDirs);
  });
});

describe('FileManagerService1', function () {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // Restore all mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should create directory', async () => {
    // Mock the RNFS.mkdir method to simulate directory creation
    const mkdirSpy = jest.spyOn(RNFS, 'mkdir').mockResolvedValue();
    const dirPath = 'fakeDirPath';
    await FileManagerService().createDirectory(dirPath);
    // Verify that mkdir method was called with correct directory path
    expect(mkdirSpy).toHaveBeenCalledWith(dirPath);
  });
  it('should delete directory', async () => {
    const unlinkSpy = jest.spyOn(RNFS, 'unlink').mockResolvedValue();
    const dirPath = 'fakeDirPath';
    await FileManagerService().deleteDirectory(dirPath);
    expect(unlinkSpy).toHaveBeenCalledWith(dirPath);
  });
  it('should move file', async () => {
    const existsSpy = jest.spyOn(RNFS, 'exists').mockResolvedValue(true);
    const unlinkSpy = jest.spyOn(RNFS, 'unlink').mockResolvedValue();
    const moveFileSpy = jest.spyOn(RNFS, 'moveFile').mockResolvedValue();
    const filePath = 'fakeFilePath';
    const targetFilePath = 'fakeTargetFilePath';
    await FileManagerService().moveFile(filePath, targetFilePath);
    expect(existsSpy).toHaveBeenCalledWith(targetFilePath);
    expect(unlinkSpy).toHaveBeenCalledWith(targetFilePath);
    expect(moveFileSpy).toHaveBeenCalledWith(filePath, targetFilePath);
  });
  it('should create file', async () => {
    const existsSpy = jest.spyOn(RNFS, 'exists').mockResolvedValue(true);
    const unlinkSpy = jest.spyOn(RNFS, 'unlink').mockResolvedValue();
    const writeFileSpy = jest.spyOn(RNFS, 'writeFile').mockResolvedValue();
    const filePath = 'fakeFilePath';
    const fileContent = 'fakeFileContent';
    const fileEncoding = 'utf8';
    const shouldDeleteExists = true;
    await FileManagerService().createFile(
      filePath,
      fileContent,
      fileEncoding,
      shouldDeleteExists,
    );
    expect(existsSpy).toHaveBeenCalledWith(filePath);
    expect(unlinkSpy).toHaveBeenCalledWith(filePath);
    expect(writeFileSpy).toHaveBeenCalledWith(
      filePath,
      fileContent,
      fileEncoding,
    );
  });
  it('should read file', async () => {
    const readFileSpy = jest
      .spyOn(RNFS, 'readFile')
      .mockResolvedValue('fileContent');
    const filePath = 'fakeFilePath';
    const fileEncoding = 'utf8';
    const fileContent = await FileManagerService().readFile(
      filePath,
      fileEncoding,
    );
    expect(readFileSpy).toHaveBeenCalledWith(filePath, fileEncoding);
    expect(fileContent).toBe('fileContent');
  });
  it('should delete file', async () => {
    const unlinkSpy = jest.spyOn(RNFS, 'unlink').mockResolvedValue();
    const filePath = 'fakeFilePath';
    await FileManagerService().deleteFile(filePath);
    expect(unlinkSpy).toHaveBeenCalledWith(filePath);
  });
  it('should get files and directories', async () => {
    const readDirSpy = jest.spyOn(RNFS, 'readDir').mockResolvedValue([]);
    const dirPath = 'fakeDirPath';
    const filesAndDirs = await FileManagerService().getFilesAndDirectories(
      dirPath,
    );
    expect(readDirSpy).toHaveBeenCalledWith(dirPath);
    expect(filesAndDirs).toEqual([]);
  });
});
