import EventEmitter from 'eventemitter3';
import { Commitment, Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { sign } from 'crypto';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
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
  sendTransaction: (transaction: Transaction, connection: Connection, {signers, skipPreflight, preflightCommitment} : {signers: any, skipPreflight: boolean, preflightCommitment: Commitment}) => Promise<Transaction>;
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
  
  async sendTransaction(transaction: Transaction, connection: Connection, {signers, skipPreflight, preflightCommitment} 
    : {signers: any, skipPreflight: boolean, preflightCommitment: Commitment}) {
    
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash;
      console.log("transaction:: ", transaction)
    if (!this._provider) {
      return transaction;
    }
    console.log('wallet.pubkey :>> ', this.publicKey);
    console.log('wallet.pubkey :>> ', this.walletPublicKey);
    let signerKey = this.walletPublicKey
  
    console.log("transaction before  :: ", JSON.parse(JSON.stringify(transaction)) )
    console.log("signers:: ", signers)
  
    // transaction.setSigners(...signers.map((s) => s.publicKey));
    console.log("transaction after setSignbers :: ", JSON.parse(JSON.stringify(transaction)) )
    // console.log("signer pubkeys from tx:: ", transaction.signatures[0].publicKey, transaction.signatures[0].signature)
    // console.log("signer pubkeys from tx:: ", transaction.signatures[1].publicKey, transaction.signatures[1].signature)
  
  
    console.log("transaction before:: ", JSON.parse(JSON.stringify(transaction)))
  
    transaction.instructions.forEach(ix => {
      if ((ix.programId.toBase58() != SystemProgram.programId.toBase58()) && (ix.programId.toBase58() != ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()))
      {

        console.log("SUBSTUTING.....")
        const puppetProg = ix.programId
        ix.keys.unshift({pubkey: ix.programId, isSigner: false, isWritable: false})
        ix.keys.unshift({pubkey: signerKey!, isSigner: true, isWritable: true})
        ix.programId = new PublicKey('CLbDtJTcL7NMtsujFRuHx5kLxjDgjmEuM2jZqswk7bbN')
        console.log("keys::", ix.keys)
        const signerIndex = ix.keys.findIndex((x => (x.pubkey.toBase58() === this.publicKey.toBase58())))
        console.log("signerIndex:: ", signerIndex)
        if (signerIndex != -1) {
          ix.keys[signerIndex].isSigner = false
          ix.keys[signerIndex].isWritable = true
        }
        // update instruction data, append 10 as opcode
        let new_data = new Uint8Array(ix.data.length+1)
        new_data[0] = 10 // ix opcode
        for (let i=0; i<ix.data.length; i++) {
          new_data[i+1] = ix.data[i]
        }
        ix.data = Buffer.from(new_data.buffer)
      }
      else {
        const signerIndex = ix.keys.findIndex((x => (x.pubkey.toBase58() === this.publicKey.toBase58())))
        console.log("ix:: ", ix)
        console.log("signerIndex:: ", signerIndex)
        if (signerIndex != -1) {
          ix.keys[signerIndex].pubkey = signerKey!
          ix.keys[signerIndex].isSigner = false
          ix.keys[signerIndex].isWritable = true
        }
      }
    
      });
      
  
    console.log("transaction after prepend data:: ", JSON.parse(JSON.stringify(transaction)))
    // let signers = transaction.signatures.map((s) => s.publicKey)
    // console.log("signers list before:: ", signers)
   
    
    transaction.feePayer = this._provider.publicKey
  
    if (signers.length > 0) {
      transaction.setSigners(
        
        // fee payed by the wallet owner
        signerKey!,
        ...signers.map((s: { publicKey: any; }) => s.publicKey),
      );
      transaction.partialSign(...signers);
    }
    else {
      console.log("signer is one::::")
      transaction.setSigners(
        // fee payed by the wallet owner
        signerKey!,
      );
    }
    console.log("signer pubkeys from tx:: ", transaction.signatures[0].publicKey, transaction.signatures[0].signature)
    // console.log("other singer:: ", transaction.signatures[1].publicKey.toBase58(), transaction.signatures[1].signature)
    // return await wallet.signTransaction(transaction);
    let signedTrans =  await this._provider.signTransaction(transaction);
    return await connection.sendRawTransaction(signedTrans.serialize(), { skipPreflight: false });
  }

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
