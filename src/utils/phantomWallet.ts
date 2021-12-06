import EventEmitter from 'eventemitter3';
import { Commitment, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { sign } from 'crypto';
export const programId = new PublicKey('CLbDtJTcL7NMtsujFRuHx5kLxjDgjmEuM2jZqswk7bbN');

type PhantomEvent = 'disconnect' | 'connect';
type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAllTransactions';

interface PhantomProvider {
  publicKey?: PublicKey;
  walletPublicKey?: PublicKey;
  isConnected?: boolean;
  autoApprove?: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  // sendTransaction: (transaction: Transaction, connection: Connection, {signers, skipPreflight, preflightCommitment} : {signers: any, skipPreflight: boolean, preflightCommitment: Commitment}) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<any>;
  listeners: (event: PhantomEvent) => (() => void)[];
}

export interface WalletAdapter {
  publicKey: PublicKey;
  autoApprove: boolean;
  connected: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
  connect: () => any;
  disconnect: () => any;
  on<T>(event: string, fn: () => void): this;
  walletPublicKey?: PublicKey;
}

export class PhantomWalletAdapter
  extends EventEmitter
  implements WalletAdapter {
  constructor() {
    super();
    this.connect = this.connect.bind(this);
  }

  xenonPda: PublicKey = PublicKey.default;

  private get _provider(): PhantomProvider | undefined {
    if ((window as any)?.solana?.isPhantom) {
      return (window as any).solana;
    }
    return undefined;
  }

  private _handleConnect = (...args: any) => {

    this.emit('connect', ...args);

    console.log('this._provider?.publicKey :>> ', this._provider?.publicKey);

    if(this._provider && this._provider?.publicKey) {
      PublicKey.findProgramAddress([this._provider?.publicKey.toBuffer()], programId).then(x =>  this.xenonPda = x[0]);
    }
  }

  private _handleDisconnect = (...args: any) => {
    this.emit('disconnect', ...args);
  }

  get connected() {
    return this._provider?.isConnected || false;
  }

  get autoApprove() {
    return this._provider?.autoApprove || false;
  }

  async signAllTransactions(
    transactions: Transaction[],
  ): Promise<Transaction[]> {
    if (!this._provider) {
      return transactions;
    }

    return this._provider.signAllTransactions(transactions);
  }

  get publicKey() {
    // return this._provider?.publicKey || DEFAULT_PUBLIC_KEY;
    // const marginPDA = await PublicKey.findProgramAddress([key.toBuffer()], programId);
    // console.log('this.xenonPda :>> ', this.xenonPda);
    console.log(`this.xenonPda ::::: called ::::: `, this.xenonPda)
    return this.xenonPda
  }
  
  get walletPublicKey() {
    // return this._provider?.publicKey || DEFAULT_PUBLIC_KEY;
    // const marginPDA = await PublicKey.findProgramAddress([key.toBuffer()], programId);
    // console.log('this.xenonPda :>> ', this.xenonPda);
    return this._provider?.publicKey
  }

  async signTransaction(transaction: Transaction) {
    console.log("transaction:: ", transaction)
    if (!this._provider) {
      return transaction;
    }
    console.log("transaction final:: ", JSON.parse(JSON.stringify(transaction)))    
    return this._provider.signTransaction(transaction);
  }
  
  // async sendTransaction(transaction: Transaction, connection: Connection, {signers, skipPreflight, preflightCommitment} 
  //   : {signers: any, skipPreflight: boolean, preflightCommitment: Commitment}) {
  //   console.log("transaction:: ", transaction)
  //   if (!this._provider) {
  //     return transaction;
  //   }
  //   console.log("transaction final:: ", JSON.parse(JSON.stringify(transaction)))    
  //   return this._provider.signTransaction(transaction);
  // }

  connect() {
    console.log(">>>>>> connecting >>>>>>>> ")
    if (!this._provider) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    if (!this._provider.listeners('connect').length) {
      this._provider?.on('connect', this._handleConnect);
    }
    if (!this._provider.listeners('disconnect').length) {
      this._provider?.on('disconnect', this._handleDisconnect);
    }
    return this._provider?.connect();
  }

  disconnect() {
    if (this._provider) {
      this._provider.disconnect();
    }
  }
}
