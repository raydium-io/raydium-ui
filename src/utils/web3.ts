import { initializeAccount } from '@project-serum/serum/lib/token-instructions'
// @ts-ignore without ts ignore, yarn build will failed
import { Token } from '@solana/spl-token'
import {
  Account,
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature
} from '@solana/web3.js'

import { ASSOCIATED_TOKEN_PROGRAM_ID, RENT_PROGRAM_ID, SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@/utils/ids'
import { ACCOUNT_LAYOUT, MINT_LAYOUT } from '@/utils/layouts'
import { TOKENS } from '@/utils/tokens'

export const web3Config = {
  strategy: 'speed',
  rpcs: [
    // { url: 'https://free.rpcpool.com', weight: 10 },
    // { url: 'https://mainnet.rpcpool.com', weight: 10 },
    // { url: 'https://api.rpcpool.com', weight: 10 },
    // { url: 'https://solana-api.projectserum.com', weight: 10 },
    // { url: 'https://raydium.rpcpool.com', weight: 50 },
    // { url: 'https://api.mainnet-beta.solana.com', weight: 10 }
    { url: 'https://api.devnet.solana.com', weight: 100 }
  ]
}

// export const commitment: Commitment = 'processed'
export const commitment: Commitment = 'confirmed'
// export const commitment: Commitment = 'finalized'

export async function findProgramAddress(seeds: Array<Buffer | Uint8Array>, programId: PublicKey) {
  const [publicKey, nonce] = await PublicKey.findProgramAddress(seeds, programId)
  return { publicKey, nonce }
}

export async function createAmmAuthority(programId: PublicKey) {
  return await findProgramAddress(
    [new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'))],
    programId
  )
}

export async function createAssociatedId(infoId: PublicKey, marketAddress: PublicKey, bufferKey: string) {
  const { publicKey } = await findProgramAddress(
    [infoId.toBuffer(), marketAddress.toBuffer(), Buffer.from(bufferKey)],
    infoId
  )
  return publicKey
}

export async function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey) {
  const { publicKey } = await findProgramAddress(
    [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  return publicKey
}

export async function createTokenAccountIfNotExist(
  connection: Connection,
  account: string | undefined | null,
  owner: PublicKey,
  mintAddress: string,
  lamports: number | null,

  transaction: Transaction,
  signer: Array<Account>
) {
  let publicKey

  if (account) {
    publicKey = new PublicKey(account)
  } else {
    publicKey = await createProgramAccountIfNotExist(
      connection,
      account,
      owner,
      TOKEN_PROGRAM_ID,
      lamports,
      ACCOUNT_LAYOUT,
      transaction,
      signer
    )

    transaction.add(
      initializeAccount({
        account: publicKey,
        mint: new PublicKey(mintAddress),
        owner
      })
    )
  }

  return publicKey
}

export async function createAssociatedTokenAccountIfNotExist(
  account: string | undefined | null,
  owner: PublicKey,
  mintAddress: string,

  transaction: Transaction,
  atas: string[] = []
) {
  let publicKey
  if (account) {
    publicKey = new PublicKey(account)
  }

  const mint = new PublicKey(mintAddress)
  // @ts-ignore without ts ignore, yarn build will failed
  const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true)

  if ((!publicKey || !ata.equals(publicKey)) && !atas.includes(ata.toBase58())) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        ata,
        owner,
        owner
      )
    )
    atas.push(ata.toBase58())
  }

  return ata
}

export async function createAtaSolIfNotExistAndWrap(
  connection: Connection,
  account: string | undefined | null,
  owner: PublicKey,
  transaction: Transaction,
  signers: Array<Account>,
  amount: number
) {
  let publicKey
  if (account) {
    publicKey = new PublicKey(account)
  }
  const mint = new PublicKey(TOKENS.WSOL.mintAddress)
  // @ts-ignore without ts ignore, yarn build will failed
  const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true)
  if (!publicKey) {
    const rent = await Token.getMinBalanceRentForExemptAccount(connection)
    transaction.add(
      SystemProgram.transfer({ fromPubkey: owner, toPubkey: ata, lamports: amount + rent }),
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        ata,
        owner,
        owner
      )
    )
  } else {
    const rent = await Token.getMinBalanceRentForExemptAccount(connection)
    const wsol = await createTokenAccountIfNotExist(
      connection,
      null,
      owner,
      TOKENS.WSOL.mintAddress,
      amount + rent,
      transaction,
      signers
    )
    transaction.add(
      Token.createTransferInstruction(TOKEN_PROGRAM_ID, wsol, ata, owner, [], amount),
      Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, wsol, owner, owner, [])
    )
  }
}

export async function createProgramAccountIfNotExist(
  connection: Connection,
  account: string | undefined | null,
  owner: PublicKey,
  programId: PublicKey,
  lamports: number | null,
  layout: any,

  transaction: Transaction,
  signer: Array<Account>
) {
  let publicKey

  if (account) {
    publicKey = new PublicKey(account)
  } else {
    const newAccount = new Account()
    publicKey = newAccount.publicKey

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: publicKey,
        lamports: lamports ?? (await connection.getMinimumBalanceForRentExemption(layout.span)),
        space: layout.span,
        programId
      })
    )

    signer.push(newAccount)
  }

  return publicKey
}

export async function createAssociatedTokenAccount(
  tokenMintAddress: PublicKey,
  owner: PublicKey,
  transaction: Transaction
) {
  const associatedTokenAddress = await findAssociatedTokenAddress(owner, tokenMintAddress)

  const keys = [
    {
      pubkey: owner,
      isSigner: true,
      isWritable: false
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true
    },
    {
      pubkey: owner,
      isSigner: false,
      isWritable: false
    },
    {
      pubkey: tokenMintAddress,
      isSigner: false,
      isWritable: false
    },
    {
      pubkey: SYSTEM_PROGRAM_ID,
      isSigner: false,
      isWritable: false
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false
    },
    {
      pubkey: RENT_PROGRAM_ID,
      isSigner: false,
      isWritable: false
    }
  ]

  transaction.add(
    new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([])
    })
  )

  return associatedTokenAddress
}

export async function getFilteredProgramAccounts(
  connection: Connection,
  programId: PublicKey,
  filters: any
): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
  // @ts-ignore
  const resp = await connection._rpcRequest('getProgramAccounts', [
    programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
      encoding: 'base64'
    }
  ])
  if (resp.error) {
    throw new Error(resp.error.message)
  }
  // @ts-ignore
  return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
    publicKey: new PublicKey(pubkey),
    accountInfo: {
      data: Buffer.from(data[0], 'base64'),
      executable,
      owner: new PublicKey(owner),
      lamports
    }
  }))
}

export async function getFilteredProgramAccountsAmmOrMarketCache(
  cacheName: String,
  connection: Connection,
  programId: PublicKey,
  filters: any
): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
  try {
    if (!cacheName) {
      throw new Error('cacheName error')
    }

    const resp = await (await fetch('https://api.raydium.io/cache/rpc/' + cacheName)).json()
    if (resp.error) {
      throw new Error(resp.error.message)
    }
    // @ts-ignore
    return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], 'base64'),
        executable,
        owner: new PublicKey(owner),
        lamports
      }
    }))
  } catch (e) {
    return getFilteredProgramAccounts(connection, programId, filters)
  }
}

// getMultipleAccounts
export async function getMultipleAccounts(
  connection: Connection,
  publicKeys: PublicKey[],
  commitment?: Commitment
): Promise<Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>> {
  const keys: PublicKey[][] = []
  let tempKeys: PublicKey[] = []

  publicKeys.forEach((k) => {
    if (tempKeys.length >= 100) {
      keys.push(tempKeys)
      tempKeys = []
    }
    tempKeys.push(k)
  })
  if (tempKeys.length > 0) {
    keys.push(tempKeys)
  }

  const accounts: Array<null | {
    executable: any
    owner: PublicKey
    lamports: any
    data: Buffer
  }> = []

  const resArray: { [key: number]: any } = {}
  await Promise.all(
    keys.map(async (key, index) => {
      const res = await connection.getMultipleAccountsInfo(key, commitment)
      resArray[index] = res
    })
  )

  Object.keys(resArray)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((itemIndex) => {
      const res = resArray[parseInt(itemIndex)]
      for (const account of res) {
        accounts.push(account)
      }
    })

  return accounts.map((account, idx) => {
    if (account === null) {
      return null
    }
    return {
      publicKey: publicKeys[idx],
      account
    }
  })
}

// transaction
export async function signTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Account> = []
) {
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

  console.log('wallet.pubkey :>> ', wallet.publicKey);
  console.log('wallet.pubkey :>> ', wallet.walletPublicKey);
  let signerKey = wallet.walletPublicKey

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
      const puppetProg = ix.programId
      ix.keys.unshift({pubkey: ix.programId, isSigner: false, isWritable: false})
      ix.keys.unshift({pubkey: signerKey!, isSigner: true, isWritable: true})
      ix.programId = new PublicKey('CLbDtJTcL7NMtsujFRuHx5kLxjDgjmEuM2jZqswk7bbN')
      console.log("keys::", ix.keys)
      const signerIndex = ix.keys.findIndex((x => (x.pubkey.toBase58() === wallet.publicKey.toBase58())))
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
      const signerIndex = ix.keys.findIndex((x => (x.pubkey.toBase58() === wallet.publicKey.toBase58())))
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
 
  
  // transaction.feePayer = this._provider.publicKey

  if (signers.length > 0) {
    transaction.setSigners(
      
      // fee payed by the wallet owner
      signerKey!,
      ...signers.map((s) => s.publicKey),
    );
    transaction.partialSign(...signers);
  }
  else {
    transaction.setSigners(
      // fee payed by the wallet owner
      signerKey!,
    );
  }
  console.log("signer pubkeys from tx:: ", transaction.signatures[0].publicKey, transaction.signatures[0].signature)
  // console.log("other singer:: ", transaction.signatures[1].publicKey.toBase58(), transaction.signatures[1].signature)
  return await wallet.signTransaction(transaction);

  // transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey))
  // if (signers.length > 0) {
  //   transaction.partialSign(...signers)
  // }
  // return await wallet.signTransaction(transaction)
}

export async function signAndSendTransaction(
  wallet: any,
  transaction: Transaction,
  connection: Connection,
  confirmation = "singleGossip"
) {
  let signedTrans = await wallet.signTransaction(transaction);
  let signature = await connection.sendRawTransaction(signedTrans.serialize(), { skipPreflight: true });
  return signature;
}


export async function sendTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Account> = []
) {
  // console.log(`wallet :::: `, wallet.publicKey.toBase58())
  // transaction.feePayer = wallet.publicKey;
  // let hash = await connection.getRecentBlockhash();
  // transaction.recentBlockhash = hash.blockhash;
  // const sign = await signAndSendTransaction(wallet, transaction, connection);
  // return sign;
  const txid: TransactionSignature = await wallet.sendTransaction(transaction, connection, {
    signers,
    skipPreflight: false,
    preflightCommitment: commitment
  })

  console.log("txid:: ", txid)

  return txid
}

export function mergeTransactions(transactions: (Transaction | undefined)[]) {
  const transaction = new Transaction()
  transactions
    .filter((t): t is Transaction => t !== undefined)
    .forEach((t) => {
      transaction.add(t)
    })
  return transaction
}

function throwIfNull<T>(value: T | null, message = 'account not found'): T {
  if (value === null) {
    throw new Error(message)
  }
  return value
}

export async function getMintDecimals(connection: Connection, mint: PublicKey): Promise<number> {
  const { data } = throwIfNull(await connection.getAccountInfo(mint), 'mint not found')
  const { decimals } = MINT_LAYOUT.decode(data)
  return decimals
}

export async function getFilteredTokenAccountsByOwner(
  connection: Connection,
  programId: PublicKey,
  mint: PublicKey
): Promise<{ context: {}; value: [] }> {
  // @ts-ignore
  const resp = await connection._rpcRequest('getTokenAccountsByOwner', [
    programId.toBase58(),
    {
      mint: mint.toBase58()
    },
    {
      encoding: 'jsonParsed'
    }
  ])
  if (resp.error) {
    throw new Error(resp.error.message)
  }
  return resp.result
}
