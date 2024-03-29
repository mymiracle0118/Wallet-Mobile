import {
  TxnBuilderTypes,
  BCS,
  HexString,
  AptosAccount,
  TransactionBuilder,
} from 'aptos';
import axios from 'axios';

import { normalizeAddress, fromUint8ArrayToJSArray, sleep } from './utils';

enum TransactionStatus {
  Pending = 'Pending',
  Unexecuted = 'Unexecuted',
  Fail = 'Success',
  Failed = 'Fail',
  Invalid = 'Invalid',
}

interface TransactionResponse {
  txHash: string;
  result: TransactionStatus;
}
interface SupraTransferDetailResponse {
  amount: number;
  confirmation_time: string;
  status: string;
  block_number: number;
  sender: string;
  receiver: string;
  gas_used: number;
  txn_hash?: string;
}
interface SupraTransferHistoryResponse {
  recipient: string;
  amount: number;
  raw: {
    sender: string;
    sequence_number: number;
    max_gas_amount: number;
    gas_unit_price: number;
    expiration_timestamp_secs: number;
    payload: any; // We will be not requiring payload because module and function is deterministic and we are getting args in API response
  };
}

export class SupraClient {
  supraNodeURL: string;
  chainId: TxnBuilderTypes.ChainId;
  requestTimeout = 10000; // 10 Seconds
  maxRetryForTransactionCompletion = 20;
  delayBetweenPoolingRequest = 1000; // 1 Second

  private constructor(url: string) {
    this.supraNodeURL = url;
    this.chainId = new TxnBuilderTypes.ChainId(Number(4));
  }

  static async init(url: string): Promise<SupraClient> {
    let supraClient = new SupraClient(url);
    supraClient.chainId = await supraClient.getChainId();
    return supraClient;
  }

  async getChainId(): Promise<TxnBuilderTypes.ChainId> {
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: '/move/chain_id',
      timeout: this.requestTimeout,
    });
    return new TxnBuilderTypes.ChainId(Number(resData.data.id));
  }

  async getGasPrice(): Promise<bigint> {
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: '/move/gas_price',
      timeout: this.requestTimeout,
    });
    return BigInt(resData.data.mean_gas_price);
  }

  async fundAccountWithFaucet(account: HexString): Promise<string[]> {
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: `/move/faucet/${account.toString()}`,
      timeout: this.requestTimeout,
    });
    return resData.data.transactions;
  }

  async getAccountSequenceNumber(account: HexString): Promise<bigint> {
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: `/move/account/${account.toString()}`,
      timeout: this.requestTimeout,
    });
    if (resData.data.account == null) {
      throw new Error('Account Not Exists, Or Invalid Account Is Passed');
    }
    return BigInt(resData.data.account.sequence_number);
  }

  async getSupraTransferHistory(
    account: HexString,
    count: number,
  ): Promise<SupraTransferHistoryResponse[]> {
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: `/tx/account_statement/${account.toString()}?count=${count}`,
      timeout: this.requestTimeout,
    });
    if (resData.data.record == null) {
      throw new Error('Account Not Exists, Or Invalid Account Is Passed');
    }
    return resData.data.record;
  }

  async getSupraTransactionDetails(
    hash: string,
  ): Promise<SupraTransferDetailResponse> {
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: `/tx/by-hash/${hash}`,
      timeout: this.requestTimeout,
    });
    if (resData.data == null) {
      throw new Error('Transaction Not Exists, Or Invalid Hash Is Passed');
    }
    return resData.data;
  }

  async getAccountSupraCoinBalance(account: HexString): Promise<bigint> {
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: `/move/coin/${account.toString()}`,
      timeout: this.requestTimeout,
    });
    if (resData.data.coins == null) {
      throw new Error('Account Not Exists, Or Invalid Account Is Passed');
    }
    return BigInt(resData.data.coins.coin);
  }

  async getTransactionStatus(
    transactionHash: string,
  ): Promise<TransactionStatus> {
    if (transactionHash.length != 64) {
      throw new Error(
        // eslint-disable-next-line quotes
        "transactionHash length must be 64 or it's size must be 256 bits",
      );
    }
    let resData = await axios({
      method: 'get',
      baseURL: this.supraNodeURL,
      url: `/tx_status/${transactionHash}`,
      timeout: this.requestTimeout,
    });
    return resData.data.status;
  }

  private async waitForTransactionCompletion(
    txHash: string,
  ): Promise<TransactionStatus> {
    for (let i = 0; i < this.maxRetryForTransactionCompletion; i++) {
      let txStatus = await this.getTransactionStatus(txHash);
      if (
        txStatus != TransactionStatus.Pending &&
        txStatus != TransactionStatus.Unexecuted
      ) {
        // Due to lake of proper data synchronization we gets old state of chain,
        // and if in case we just execute one transaction after completion of another transaction
        // that just goes in pending state for long time and after some time that gets fail.
        // To Resolve This Issue We Are Just Adding Wait Or Sleep After Receiving Transaction Status.
        await sleep(5000);
        return txStatus;
      }
      await sleep(this.delayBetweenPoolingRequest);
    }
    return TransactionStatus.Pending;
  }

  private async getTxObject(
    senderAddr: HexString,
    moduleAddr: string,
    moduleName: string,
    functionName: string,
    functionTypeArgs: [],
    functionArgs: Uint8Array[],
  ): Promise<TxnBuilderTypes.RawTransaction> {
    return new TxnBuilderTypes.RawTransaction(
      new TxnBuilderTypes.AccountAddress(senderAddr.toUint8Array()),
      await this.getAccountSequenceNumber(senderAddr),
      new TxnBuilderTypes.TransactionPayloadEntryFunction(
        new TxnBuilderTypes.EntryFunction(
          new TxnBuilderTypes.ModuleId(
            new TxnBuilderTypes.AccountAddress(
              new HexString(normalizeAddress(moduleAddr)).toUint8Array(),
            ),
            new TxnBuilderTypes.Identifier(moduleName),
          ),
          new TxnBuilderTypes.Identifier(functionName),
          functionTypeArgs,
          functionArgs,
        ),
      ),
      BigInt(500000),
      // await this.getGasPrice(),
      BigInt(100),
      BigInt(4000000 * 10000),
      this.chainId,
    );
  }

  private async sendTx(
    senderAccount: AptosAccount,
    rawTxn: TxnBuilderTypes.RawTransaction,
  ): Promise<TransactionResponse> {
    console.log('Sequence Number: ', rawTxn.sequence_number);
    let txPayload = (
      rawTxn.payload as TxnBuilderTypes.TransactionPayloadEntryFunction
    ).value;
    let resData = await axios({
      method: 'post',
      baseURL: this.supraNodeURL,
      url: '/send_tx',
      data: {
        Apt: {
          raw_txn: {
            sender: senderAccount.address().toString(),
            sequence_number: Number(rawTxn.sequence_number),
            payload: {
              EntryFunction: {
                module: {
                  address: txPayload.module_name.address
                    .toHexString()
                    .toString(),
                  name: txPayload.module_name.name.value,
                },
                function: txPayload.function_name.value,
                ty_args: [],
                args: fromUint8ArrayToJSArray(txPayload.args),
              },
            },
            max_gas_amount: Number(rawTxn.max_gas_amount),
            gas_unit_price: Number(rawTxn.gas_unit_price),
            expiration_timestamp_secs: Number(rawTxn.expiration_timestamp_secs),
            chain_id: rawTxn.chain_id.value,
          },
          authenticator: {
            Ed25519: {
              public_key: senderAccount.pubKey().toString(),
              signature: senderAccount
                .signBuffer(TransactionBuilder.getSigningMessage(rawTxn))
                .toString(),
            },
          },
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.requestTimeout,
    });
    return {
      txHash: resData.data.tx_hash,
      result: await this.waitForTransactionCompletion(resData.data.tx_hash),
    };
  }

  async transferSupraCoin(
    senderAccount: AptosAccount,
    receiverAccountAddr: HexString,
    amount: bigint,
  ): Promise<TransactionResponse> {
    return await this.sendTx(
      senderAccount,
      await this.getTxObject(
        senderAccount.address(),
        '0000000000000000000000000000000000000000000000000000000000000001',
        'aptos_account',
        'transfer',
        [],
        [receiverAccountAddr.toUint8Array(), BCS.bcsSerializeUint64(amount)],
      ),
    );
  }

  async publishPackage(
    senderAccount: AptosAccount,
    packageMetadata: Uint8Array,
    modulesCode: Uint8Array[],
  ): Promise<TransactionResponse> {
    let codeSerializer = new BCS.Serializer();
    let modulesTypeCode: TxnBuilderTypes.Module[] = [];
    for (let i = 0; i < modulesCode.length; i++) {
      modulesTypeCode.push(
        new TxnBuilderTypes.Module(Uint8Array.from(modulesCode[i])),
      );
    }
    BCS.serializeVector(modulesTypeCode, codeSerializer);
    return await this.sendTx(
      senderAccount,
      await this.getTxObject(
        senderAccount.address(),
        '0000000000000000000000000000000000000000000000000000000000000001',
        'code',
        'publish_package_txn',
        [],
        [BCS.bcsSerializeBytes(packageMetadata), codeSerializer.getBytes()],
      ),
    );
  }
}
