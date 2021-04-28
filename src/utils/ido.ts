import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID, RENT_PROGRAM_ID, CLOCK_PROGRAM_ID, IDO_PROGRAM_ID } from './ids'
import { TOKENS, TokenInfo } from './tokens'
import { TokenAmount } from './safe-math'
import { findProgramAddress, sendTransaction } from './web3'

// @ts-ignore
import { u8, nu64, struct } from 'buffer-layout'
import { publicKey, u64 } from '@project-serum/borsh'
import { cloneDeep } from 'lodash-es'
import { Account, Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

export interface IdoPoolInfo {
  startTime: number
  endTime: number

  minDepositLimit: TokenAmount
  maxDepositLimit: TokenAmount

  stakePoolId: PublicKey

  minStakeLimit: TokenAmount
}

export interface IdoPool {
  base: TokenInfo
  quote: TokenInfo

  version: number
  programId: string
  snapshotProgramId: string

  isRayPool: boolean
  idoId: string
  quoteVault: string

  info?: IdoPoolInfo

  price: TokenAmount
  raise: TokenAmount
}

export const IDO_POOLS: IdoPool[] = [
  {
    base: { ...TOKENS.MEDIA },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(10, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(500000, TOKENS.USDC.decimals, false),

    version: 1,
    programId: IDO_PROGRAM_ID,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: true,
    idoId: 'E3FHPjesXTcoQ2A4pPPLd2YjnL5aXb5j3obdNoT5nbcJ',
    quoteVault: 'AKU9iYZERtoDNjhRXU6JnDZQqj2eYXMLupnFeA1yhquj'
  },
  {
    base: { ...TOKENS.MEDIA },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(10, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(500000, TOKENS.USDC.decimals, false),

    version: 1,
    programId: IDO_PROGRAM_ID,
    snapshotProgramId: '11111111111111111111111111111111',

    isRayPool: false,
    idoId: 'DPQn9sXy1f6zYZ6SCDSF2hqtUGo7QwNWJYjzn6mxkzox',
    quoteVault: '8MuRRe62zvtieqohcicVEzEQsKQXZwqHT3xbR1dSZwEp'
  }
]

export function getIdoPoolById(idoId: string) {
  const pool = IDO_POOLS.find((pool) => pool.idoId === idoId)

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export const IDO_POOL_INFO_LAYOUT = struct([
  u64('status'),
  u64('nonce'),
  u64('startTime'),
  u64('endTime'),
  u64('startWithdrawTime'),
  u64('numerator'),
  u64('denominator'),
  u64('quoteTokenDeposited'),
  u64('baseTokenSupply'),
  u64('minDepositLimit'),
  u64('maxDepositLimit'),
  u64('minStakeLimit'),
  publicKey('quoteTokenMint'),
  publicKey('baseTokenMint'),
  publicKey('quoteTokenVault'),
  publicKey('baseTokenVault'),
  publicKey('stakePoolId'),
  publicKey('stakeProgramId'),
  publicKey('checkProgramId'),
  publicKey('idoOwner')
])

export const IDO_USER_INFO_LAYOUT = struct([
  u64('state'),
  publicKey('idoPoolId'),
  publicKey('owner'),
  publicKey('quoteTokenDeposited')
])

export async function findAssociatedIdoInfoAddress(idoId: PublicKey, walletAddress: PublicKey, programId: PublicKey) {
  const { publicKey } = await findProgramAddress(
    [idoId.toBuffer(), walletAddress.toBuffer(), new Uint8Array(Buffer.from('ido_associated_seed', 'utf-8'))],
    programId
  )
  return publicKey
}

export async function purchase(
  connection: Connection,
  wallet: any,
  poolInfo: IdoPool,
  userQuoteTokenAccount: string,
  stakeInfoAccount: string,
  amount: string
) {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!poolInfo) throw new Error('Miss pool infomations')

  if (!amount) throw new Error('Miss amount infomations')

  const transaction = new Transaction()
  const signers: Account[] = []

  const owner = wallet.publicKey

  const { publicKey: idoAuthority } = await findProgramAddress(
    [new PublicKey(poolInfo.idoId).toBuffer()],
    new PublicKey(poolInfo.programId)
  )
  const userIdoInfo = await findAssociatedIdoInfoAddress(
    new PublicKey(poolInfo.idoId),
    owner,
    new PublicKey(poolInfo.programId)
  )
  const { publicKey: userIdoCheck } = await findProgramAddress(
    [new PublicKey(poolInfo.idoId).toBuffer(), owner.toBuffer(), new PublicKey(poolInfo.snapshotProgramId).toBuffer()],
    new PublicKey(poolInfo.snapshotProgramId)
  )

  transaction.add(
    purchaseInstruction(
      new PublicKey(poolInfo.programId),
      new PublicKey(poolInfo.idoId),
      idoAuthority,
      new PublicKey(poolInfo.quoteVault),
      new PublicKey(userQuoteTokenAccount),
      userIdoInfo,
      owner,
      new PublicKey(stakeInfoAccount),
      userIdoCheck,
      new TokenAmount(amount, poolInfo.quote.decimals, false).wei.toNumber()
    )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

export function purchaseInstruction(
  programId: PublicKey,
  idoId: PublicKey,
  authority: PublicKey,
  poolQuoteTokenAccount: PublicKey,
  userQuoteTokenAccount: PublicKey,
  userIdoInfo: PublicKey,
  userOwner: PublicKey,
  userStakeInfo: PublicKey,
  userIdoCheck: PublicKey,

  amount: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amount')])

  const keys = [
    // system
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: RENT_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: CLOCK_PROGRAM_ID, isSigner: false, isWritable: true },
    // ido
    { pubkey: idoId, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: true },
    { pubkey: poolQuoteTokenAccount, isSigner: false, isWritable: true },
    // user
    { pubkey: userQuoteTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userIdoInfo, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true },
    { pubkey: userStakeInfo, isSigner: false, isWritable: true },
    { pubkey: userIdoCheck, isSigner: false, isWritable: true }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 1,
      amount
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}
