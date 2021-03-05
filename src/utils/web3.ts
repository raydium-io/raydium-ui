import {
  Account,
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature
} from '@solana/web3.js'

import { ACCOUNT_LAYOUT } from '@/utils/layouts'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
// eslint-disable-next-line
import assert from 'assert'
import { initializeAccount } from '@project-serum/serum/lib/token-instructions'
import { struct } from 'superstruct'

export const commitment: Commitment = 'confirmed'
// export const commitment = 'finalized'

// 如果传进来的账户为空 创新的
export async function createTokenAccountIfNotExist(
  connection: Connection,
  account: string | undefined | null,
  owner: PublicKey,
  mintAddress: string,

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
        lamports: await connection.getMinimumBalanceForRentExemption(layout.span),
        space: layout.span,
        programId
      })
    )

    signer.push(newAccount)
  }

  return publicKey
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
  const args = [publicKeys.map((k) => k.toBase58()), { commitment }]
  // @ts-ignore
  const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args)
  const res = GetMultipleAccountsAndContextRpcResult(unsafeRes)
  if (res.error) {
    throw new Error(
      'failed to get info about accounts ' + publicKeys.map((k) => k.toBase58()).join(', ') + ': ' + res.error.message
    )
  }
  assert(typeof res.result !== 'undefined')
  const accounts: Array<null | {
    executable: any
    owner: PublicKey
    lamports: any
    data: Buffer
  }> = []
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
  transaction.recentBlockhash = (await connection.getRecentBlockhash(commitment)).blockhash
  transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey))
  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }
  return await wallet.signTransaction(transaction)
}

export async function sendTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Account> = []
) {
  const signedTransaction = await signTransaction(connection, wallet, transaction, signers)
  return await sendSignedTransaction(connection, signedTransaction)
}

export async function sendSignedTransaction(connection: Connection, signedTransaction: Transaction): Promise<string> {
  const rawTransaction = signedTransaction.serialize()

  const txid: TransactionSignature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: false,
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
