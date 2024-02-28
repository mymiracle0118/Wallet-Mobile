import ReedSolomonErasure from 'algorithms/reedSolomonErasure.js';
import * as reedSolomonErasureCore from 'algorithms/reedSolomonErasureCore.js';
import {
  DirectoryPath,
  FileRecoveryTempPath,
  recoveryFileNamePreFix,
} from 'theme/Helper/constant';

import EncryptionService from './EncryptionService';
import FileManagerService from './FileManagerService';

const EncodeDataAndStoreDataToFile = async (
  DATA_SHARDS: number,
  PARITY_SHARDS: number,
  Mnemonic: string,
  saveToFiles: boolean,
) => {
  // console.log('PATH', DirectoryPath);
  await FileManagerService().createDirectory(DirectoryPath);
  await FileManagerService().createDirectory(FileRecoveryTempPath);

  const tempObj = new ReedSolomonErasure(reedSolomonErasureCore);

  console.log('Mnemonic : ', Mnemonic);

  let test = Buffer.from(Mnemonic, 'utf8').toJSON();
  let adjustmentArray = test.data;
  const empty_bytes = adjustmentArray.length % DATA_SHARDS;
  let adjustment_bytes = 0;
  if (empty_bytes > 0) {
    adjustment_bytes = DATA_SHARDS - empty_bytes;
  }
  for (let i = 0; i < adjustment_bytes; i++) {
    adjustmentArray.push(0);
  }
  //console.log('My LOG  ::: ::: ::: ', test);

  const SHARD_SIZE = adjustmentArray.length / DATA_SHARDS;
  console.log(
    `Data Shards: ${DATA_SHARDS}, Parity Shards : ${PARITY_SHARDS}, Shard size:${SHARD_SIZE}`,
    typeof SHARD_SIZE,
  );
  console.log(
    '===========================================================================================================',
  );

  const input = new Uint8Array(adjustmentArray);
  //Encode data
  const shards = new Uint8Array(SHARD_SIZE * (DATA_SHARDS + PARITY_SHARDS));
  shards.set(input.slice());
  tempObj.encode(shards, DATA_SHARDS, PARITY_SHARDS);
  console.log('Shards', shards, typeof shards);
  const dataFile = shards.slice();
  const loopVal = Math.ceil(dataFile.length / SHARD_SIZE);
  // await FileManagerService().deleteDirectory(DirectoryPath);
  const encryptedFinalDataArr = [];
  for (let i = 0; i < loopVal; i++) {
    const chunkStart = i * SHARD_SIZE;
    const chunkEnd = chunkStart + SHARD_SIZE;
    const fileContent = dataFile.slice(chunkStart, chunkEnd);
    let shardArray = [];
    for (let i = 0; i < SHARD_SIZE; i++) {
      shardArray[i] = fileContent[i];
    }
    //console.log('File Content', fileContent);
    let path = FileRecoveryTempPath + `/${recoveryFileNamePreFix}${i}.json`;
    const fileData = {
      position: i,
      data_shards: DATA_SHARDS,
      parity_shards: PARITY_SHARDS,
      shard_size: SHARD_SIZE,
      data: shardArray.toString(),
    };
    console.log('shardArray Data', shardArray);
    encryptedFinalDataArr.push(fileData);
    console.log(
      'JSON.stringify(fileData)??',
      JSON.stringify(fileData),
      fileData,
    );
    const encryptedData = await EncryptionService().encrypt(
      JSON.stringify(fileData),
    );
    console.log('encryptedData>???????', encryptedData);
    if (saveToFiles) {
      await FileManagerService().createFile(
        path,
        JSON.stringify(encryptedData),
        'utf8',
      );
    }
  }
  if (!saveToFiles) {
    return encryptedFinalDataArr;
  }
};

export default EncodeDataAndStoreDataToFile;
