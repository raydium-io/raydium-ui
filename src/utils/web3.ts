import {
  Account,
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
  TransactionInstruction
} from '@solana/web3.js'

import { ACCOUNT_LAYOUT, MINT_LAYOUT } from '@/utils/layouts'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, SYSTEM_PROGRAM_ID, RENT_PROGRAM_ID } from '@/utils/ids'
// eslint-disable-next-line
import assert from 'assert'
import { initializeAccount } from '@project-serum/serum/lib/token-instructions'
import { struct } from 'superstruct'

export const web3Config = {
  strategy: 'speed',
  rpcs: [
    { url: 'https://solana-api.projectserum.com', weight: 50 },
    { url: 'https://raydium.rpcpool.com', weight: 40 },
    { url: 'https://api.mainnet-beta.solana.com', weight: 10 }
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

export async function createAmmId(infoId: PublicKey, marketAddress: PublicKey) {
  const { publicKey } = await findProgramAddress(
    [infoId.toBuffer(), marketAddress.toBuffer(), Buffer.from('amm_associated_seed')],
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
      isWritable: true
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

export async function createTokenAccount(connection: Connection, wallet: any, mint: string) {
  const transaction = new Transaction()
  const signers: Account[] = []

  const owner = wallet.publicKey

  await createAssociatedTokenAccount(new PublicKey(mint), owner, transaction)

  return await sendTransaction(connection, wallet, transaction, signers)
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

// getMultipleAccounts
export async function getMultipleAccounts(
  connection: Connection,
  publicKeys: PublicKey[],
  commitment?: Commitment
): Promise<Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>> {
  const keys: string[][] = []
  let tempKeys: string[] = []

  publicKeys.forEach((k) => {
    if (tempKeys.length >= 100) {
      keys.push(tempKeys)
      tempKeys = []
    }
    tempKeys.push(k.toBase58())
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

  for (const key of keys) {
    const args = [key, { commitment }]

    // @ts-ignore
    const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args)
    const res = GetMultipleAccountsAndContextRpcResult(unsafeRes)
    if (res.error) {
      throw new Error(
        'failed to get info about accounts ' + publicKeys.map((k) => k.toBase58()).join(', ') + ': ' + res.error.message
      )
    }

    assert(typeof res.result !== 'undefined')

    for (const account of res.result.value) {
      let value: {
        executable: any
        owner: PublicKey
        lamports: any
        data: Buffer
      } | null = null
      if (account === null) {
        accounts.push(null)
        continue
      }
      if (res.result.value) {
        const { executable, owner, lamports, data } = account
        assert(data[1] === 'base64')
        value = {
          executable,
          owner: new PublicKey(owner),
          lamports,
          data: Buffer.from(data[0], 'base64')
        }
      }
      if (value === null) {
        throw new Error('Invalid response')
      }
      accounts.push(value)
    }
  }

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

function jsonRpcResult(resultDescription: any) {
  const jsonRpcVersion = struct.literal('2.0')
  return struct.union([
    struct({
      jsonrpc: jsonRpcVersion,
      id: 'string',
      error: 'any'
    }),
    struct({
      jsonrpc: jsonRpcVersion,
      id: 'string',
      error: 'null?',
      result: resultDescription
    })
  ])
}

function jsonRpcResultAndContext(resultDescription: any) {
  return jsonRpcResult({
    context: struct({
      slot: 'number'
    }),
    value: resultDescription
  })
}

const AccountInfoResult = struct({
  executable: 'boolean',
  owner: 'string',
  lamports: 'number',
  data: 'any',
  rentEpoch: 'number?'
})

const GetMultipleAccountsAndContextRpcResult = jsonRpcResultAndContext(
  struct.array([struct.union(['null', AccountInfoResult])])
)

// transaction
export async function signTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Account> = []
) {
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash
  transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey))
  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }
  return await wallet.signTransaction(transaction)
}

async function covertToProgramWalletTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Account> = []
) {
  transaction.recentBlockhash = (await connection.getRecentBlockhash(commitment)).blockhash
  transaction.feePayer = wallet.publicKey
  if (signers.length > 0) {
    transaction = await wallet.convertToProgramWalletTransaction(transaction)
    transaction.partialSign(...signers)
  }
  return transaction
}

export async function sendTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Account> = []
) {
  if (wallet.isProgramWallet) {
    const programWalletTransaction = await covertToProgramWalletTransaction(connection, wallet, transaction, signers)
    return await wallet.signAndSendTransaction(programWalletTransaction)
  } else {
    const signedTransaction = await signTransaction(connection, wallet, transaction, signers)
    return await sendSignedTransaction(connection, signedTransaction)
  }
}

export async function sendSignedTransaction(connection: Connection, signedTransaction: Transaction): Promise<string> {
  const rawTransaction = signedTransaction.serialize()

  const txid: TransactionSignature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    preflightCommitment: commitment
  })

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
