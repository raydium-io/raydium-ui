import {
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  RENT_PROGRAM_ID,
  CLOCK_PROGRAM_ID,
  IDO_PROGRAM_ID,
  IDO_PROGRAM_ID_V2,
  IDO_PROGRAM_ID_V3
} from './ids'
import { TOKENS, TokenInfo } from './tokens'
import { TokenAmount } from './safe-math'
import { findProgramAddress, sendTransaction, createAssociatedTokenAccount } from './web3'

import { getBigNumber } from './layouts'
// @ts-ignore
import { u8, nu64, struct, seq } from 'buffer-layout'
import { publicKey, u64 } from '@project-serum/borsh'
import { cloneDeep } from 'lodash-es'
import { Account, Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

export interface IdoPoolInfo {
  startTime: number
  endTime: number
  startWithdrawTime: number

  minDepositLimit: TokenAmount
  maxDepositLimit: TokenAmount

  stakePoolId: PublicKey

  minStakeLimit: TokenAmount
  quoteTokenDeposited: TokenAmount
}

export interface IdoLotteryPoolInfo {
  status: number
  nonce: number
  startTime: number
  endTime: number
  startWithdrawTime: number
  numerator: number
  denominator: number
  quoteTokenDeposited: TokenAmount
  baseTokenSupply: TokenAmount

  perUserMaxLottery: number
  perUserMinLottery: number
  perLotteryNeedMinStake: number
  perLotteryWorthQuoteAmount: TokenAmount

  totalWinLotteryLimit: number
  totalDepositUserNumber: number
  currentLotteryNumber: number
  luckyInfos: Array<{
    luckyTailDigits: number
    luckyTailNumber: number
    luckyWithinNumber: number
    luckyNumberExist: number
  }>

  quoteTokenMint: PublicKey
  baseTokenMint: PublicKey
  quoteTokenVault: PublicKey
  baseTokenVault: PublicKey
  stakePoolId: PublicKey
  stakeProgramId: PublicKey
  checkProgramId: PublicKey
  idoOwner: PublicKey
  poolSeedId: PublicKey
}

export interface IdoUserInfo {
  deposited: TokenAmount
  snapshoted: boolean
}
export interface IdoLotteryUserInfo {
  deposited: TokenAmount
  snapshoted: boolean

  eligibleTicketAmount: number

  quoteTokenDeposited: number
  quoteTokenWithdrawn: number
  baseTokenWithdrawn: number
  lotteryBeginNumber: number
  lotteryEndNumber: number
}

export interface IdoPool {
  base: TokenInfo
  quote: TokenInfo

  version: number
  programId: string
  snapshotProgramId: string

  isRayPool: boolean
  isPrivate: boolean
  status?: string
  idoId: string
  baseVault: string
  quoteVault: string

  info?: IdoPoolInfo | IdoLotteryPoolInfo
  userInfo?: IdoUserInfo | IdoLotteryUserInfo

  price: TokenAmount
  raise: TokenAmount

  seedId?: string // it's a string give from backend
}

export const IDO_POOLS: IdoPool[] = [
  {
    base: { ...TOKENS.LIKE },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(0.06, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(1666666.67, TOKENS.SLRS.decimals, false),

    version: 3, // just an identify for Lottery activity
    programId: IDO_PROGRAM_ID_V3,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: true,
    isPrivate: false,
    idoId: '6tVhfpkvg4JTYpDCrDgjb5tAEFSzvpZXLgPtAos5xThD',
    baseVault: '91MgsAE7qotAtYAd9k7YVZqjs2RfW44zJMQ3gLxAGEur',
    quoteVault: 'PsqkXYFRAM5PjWgyVSjYMMJGG2dqkfaWe2whUXHtEAh',
    seedId: 'H8yyqemdjWgD2zkhhaMRsoWKUJSGWSb7kDaCEG16WH63'
  },
  {
    base: { ...TOKENS.SLRS },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(0.05, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(2000000, TOKENS.SLRS.decimals, false),

    version: 3, // just an identify for Lottery activity
    programId: IDO_PROGRAM_ID_V3,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: true,
    isPrivate: false,
    idoId: '6djgqw4EXwjGJMPuxH43RdCih5DQgwop1UK5Wk2FDvWt',
    baseVault: 'E6A985RSVzJYhfEzW9B7e86xtYfHz5h9wxRe2KLHWnTZ',
    quoteVault: '8Q8xr7X7asGL82SdniAcrN8f9hTa1DjDcbJVLNVN38zg',
    seedId: 'APDE8Mc9abyigJb9cWcS95mMCyyA4QN4kv5Zi4YePygt'
  },
  {
    base: { ...TOKENS.SLRS },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(0.05, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(480000, TOKENS.SLRS.decimals, false),

    version: 2,
    programId: IDO_PROGRAM_ID_V2,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: false,
    isPrivate: true,
    idoId: '7nJQCQFNNqrp2VXQM5u9CZ98LBH2EYk62V2zuKRBvw8G',
    baseVault: 'C3qE7ErgGDWKiz8h9Pv6FBjfnfzJFDrF5Ubb3zacMnbL',
    quoteVault: '5AmMZChuCAw8XWCF6RRhWTaaosemKzHc6HV89nx2Qp6z',
    seedId: 'FUbckyz9EKqTYvoPPRF3A2JpGJTJHRbHi2J6rJYhqCay'
  },
  {
    base: { ...TOKENS.SNY },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(1.5, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(700000, TOKENS.SNY.decimals, false),

    version: 3, // just an identify for Lottery activity
    programId: IDO_PROGRAM_ID_V3,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: true,
    isPrivate: false,
    idoId: '9aAMMBcRVfPEa7quoRyofR3rG7qF4QJTehUhV3o1mPzf',
    baseVault: 'D9X5KoDgC9sKFwPQcjYySGkHpe7akMvSSVDsorRgXYER',
    quoteVault: 'Emuu4LH3Y2c7RmC97RWw944foRUSU28QbAyx9ocyMJsS',
    seedId: 'AjLbEuXP49PTx1Hwb93gNC4EbeCSATWDbDoo2nyAzVrT'
  },
  {
    base: { ...TOKENS.MER },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(0.125, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(1000000, TOKENS.MER.decimals, false),

    version: 2,
    programId: IDO_PROGRAM_ID_V2,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: true,
    isPrivate: false,
    idoId: '3GANPMCSLb1NeQZZ1VNKXHrH5jCyK3DQLr4tmhvkaYng',
    baseVault: 'Hw41WUxQjuEbNK21nBRdoefqVhgWFe6vjJ1CTJXtXryo',
    quoteVault: 'AdeaHKgjYDfvzdmiaj3WSTRh6rGUF5Rf2bdgm6c9DEni',
    seedId: 'CAQi1pkhRPsCi24uyF6NnGm5Two1Bq2AhrDZrM9Mtfjs'
  },
  {
    base: { ...TOKENS.MER },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(0.125, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(1000000, TOKENS.MER.decimals, false),

    version: 2,
    programId: IDO_PROGRAM_ID_V2,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: true,
    isPrivate: false,
    idoId: 'F5Rk8Eht3JU69146uc9piwmMGCdPwAmYgJKRUaWxhwim',
    baseVault: '3CDLcsVhRReJ4otXhfi2kD2FrppRUqQYtXXZ7LgQrNy5',
    quoteVault: 'HrKrc1mh6jQr6Sa1DAZ9JBbpKDvTTrgkEkAHSp28tven',
    seedId: 'CAQi1pkhRPsCi24uyF6NnGm5Two1Bq2AhrDZrM9Mtfjs'
  },
  {
    base: { ...TOKENS.MEDIA },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(10, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(50000, TOKENS.MEDIA.decimals, false),

    version: 1,
    programId: IDO_PROGRAM_ID,
    snapshotProgramId: '4kCccBVdQpsonm2jL2TRV1noMdarsWR2mhwwkxUTqW3W',

    isRayPool: true,
    isPrivate: false,
    idoId: 'EFnvwDxehFLycdUp6DiwcyBTz88qcZFP3KUDfmPU4Fdc',
    baseVault: '2WCoJRu1w6awJR7PvCc1mWKR9XpPNZDFyBDBX713k8ng',
    quoteVault: '21XBxBZn3tX8aaJKm1KKm6sWsLUxsMedV3a1CvNBW2m9'
  },
  {
    base: { ...TOKENS.MEDIA },
    quote: { ...TOKENS.USDC },

    price: new TokenAmount(10, TOKENS.USDC.decimals, false),
    raise: new TokenAmount(50000, TOKENS.MEDIA.decimals, false),

    version: 1,
    programId: IDO_PROGRAM_ID,
    snapshotProgramId: '11111111111111111111111111111111',

    isRayPool: false,
    isPrivate: false,
    idoId: '3phgXrkHbMmVLUbUvXPXsnot9WxkdyvVEyiA8odyWY8s',
    baseVault: '2Gxcw4Vo7zGGNg9JxksrWYazcpQTWNi8JdQkF3bF5yaN',
    quoteVault: '6TyVHwiEaDRQCf398QjvC6JLqPzK9REvMiS6DsCWG5o4'
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

export const IDO_LOTTERY_POOL_INFO_LAYOUT = struct([
  u64('status'),
  u64('nonce'),
  u64('startTime'),
  u64('endTime'),
  u64('startWithdrawTime'),
  u64('numerator'),
  u64('denominator'),
  u64('quoteTokenDeposited'),
  u64('baseTokenSupply'),

  u64('perUserMaxLottery'),
  u64('perUserMinLottery'),
  u64('perLotteryNeedMinStake'),
  u64('perLotteryWorthQuoteAmount'),

  u64('totalWinLotteryLimit'),
  u64('totalDepositUserNumber'),
  u64('currentLotteryNumber'),
  seq(
    struct([u64('luckyTailDigits'), u64('luckyTailNumber'), u64('luckyWithinNumber'), u64('luckyNumberExist')]),
    10,
    'luckyInfos'
  ),
  publicKey('quoteTokenMint'),
  publicKey('baseTokenMint'),
  publicKey('quoteTokenVault'),
  publicKey('baseTokenVault'),
  publicKey('stakePoolId'),
  publicKey('stakeProgramId'),
  publicKey('checkProgramId'),
  publicKey('idoOwner'),

  publicKey('poolSeedId')
])

export const IDO_USER_INFO_LAYOUT = struct([
  u64('state'),
  publicKey('idoPoolId'),
  publicKey('owner'),
  u64('quoteTokenDeposited')
])

export const IDO_LOTTERY_USER_INFO_LAYOUT = struct([
  u64('state'),
  publicKey('idoPoolId'),
  publicKey('owner'),

  u64('quoteTokenDeposited'),
  u64('quoteTokenWithdrawn'),
  u64('baseTokenWithdrawn'),

  u64('lotteryBeginNumber'),
  u64('lotteryEndNumber')
])
export const IDO_LOTTERY_SNAPSHOT_DATA_LAYOUT = struct([u64('eligibleTicketAmount')])

export async function findAssociatedIdoInfoAddress(idoId: PublicKey, walletAddress: PublicKey, programId: PublicKey) {
  const { publicKey } = await findProgramAddress(
    [idoId.toBuffer(), walletAddress.toBuffer(), new Uint8Array(Buffer.from('ido_associated_seed', 'utf-8'))],
    programId
  )
  return publicKey
}

export async function findAssociatedIdoCheckAddress(
  idoId: PublicKey,
  walletAddress: PublicKey,
  snapshotProgramId: PublicKey
) {
  const { publicKey } = await findProgramAddress(
    [idoId.toBuffer(), walletAddress.toBuffer(), snapshotProgramId.toBuffer()],
    snapshotProgramId
  )
  return publicKey
}

export async function purchase({
  connection,
  wallet,
  poolInfo,
  userQuoteTokenAccount,
  stakeInfoAccount,
  amount
}: {
  connection: Connection
  wallet: any
  poolInfo: IdoPool
  userQuoteTokenAccount: string
  stakeInfoAccount: string
  amount: string | number
}) {
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
  const userIdoCheck =
    poolInfo.version === 1
      ? await findAssociatedIdoCheckAddress(
          new PublicKey(poolInfo.idoId),
          owner,
          new PublicKey(poolInfo.snapshotProgramId)
        )
      : await findAssociatedIdoCheckAddress(
          new PublicKey(poolInfo.seedId ?? 'CAQi1pkhRPsCi24uyF6NnGm5Two1Bq2AhrDZrM9Mtfjs'),
          owner,
          new PublicKey(poolInfo.snapshotProgramId)
        )

  transaction.add(
    poolInfo.version === 3 // transaction point to lottery
      ? purchaseInstruction<'3'>(
          { programId: new PublicKey(poolInfo.programId), amount },
          {
            idoId: new PublicKey(poolInfo.idoId),
            authority: idoAuthority,
            poolQuoteTokenAccount: new PublicKey(poolInfo.quoteVault),
            userQuoteTokenAccount: new PublicKey(userQuoteTokenAccount),
            userIdoInfo,
            userOwner: owner,
            userIdoCheck
          }
        )
      : poolInfo.isPrivate
      ? purchaseInstruction<'private'>(
          {
            programId: new PublicKey(poolInfo.programId),
            amount: getBigNumber(new TokenAmount(amount, poolInfo.quote.decimals, false).wei)
          },
          {
            idoId: new PublicKey(poolInfo.idoId),
            authority: idoAuthority,
            poolQuoteTokenAccount: new PublicKey(poolInfo.quoteVault),
            userQuoteTokenAccount: new PublicKey(userQuoteTokenAccount),
            userIdoInfo,
            userOwner: owner,
            userIdoCheck
          }
        )
      : purchaseInstruction(
          {
            programId: new PublicKey(poolInfo.programId),
            amount: getBigNumber(new TokenAmount(amount, poolInfo.quote.decimals, false).wei)
          },
          {
            idoId: new PublicKey(poolInfo.idoId),
            authority: idoAuthority,
            poolQuoteTokenAccount: new PublicKey(poolInfo.quoteVault),
            userQuoteTokenAccount: new PublicKey(userQuoteTokenAccount),
            userIdoInfo,
            userOwner: owner,
            userStakeInfo: new PublicKey(stakeInfoAccount),
            userIdoCheck
          }
        )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function claim({
  connection,
  wallet,
  poolInfo,
  userBaseTokenAccount,
  userQuoteTokenAccount,
  aim
}: {
  connection: Connection
  wallet: any
  poolInfo: IdoPool
  userBaseTokenAccount: string
  userQuoteTokenAccount: string

  /**
   * this is only for lottery
   * the property indicate which coin user want to withdraw
   */
  aim?: 'quote' | 'base'
}) {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!poolInfo) throw new Error('Miss pool infomations')

  const transaction = new Transaction()
  const signers: Account[] = []
  const owner = wallet.publicKey

  const newUserBaseTokenAccount = userBaseTokenAccount
    ? new PublicKey(userBaseTokenAccount)
    : await createAssociatedTokenAccount(new PublicKey(poolInfo.base.mintAddress), owner, transaction)
  const newUserQuoteTokenAccount = userQuoteTokenAccount
    ? new PublicKey(userQuoteTokenAccount)
    : await createAssociatedTokenAccount(new PublicKey(poolInfo.quote.mintAddress), owner, transaction)

  const { publicKey: idoAuthority } = await findProgramAddress(
    [new PublicKey(poolInfo.idoId).toBuffer()],
    new PublicKey(poolInfo.programId)
  )
  const userIdoInfo = await findAssociatedIdoInfoAddress(
    new PublicKey(poolInfo.idoId),
    owner,
    new PublicKey(poolInfo.programId)
  )
  transaction.add(
    poolInfo.version === 3 // transaction point to lottery
      ? claimInstruction<'3'>(
          { programId: new PublicKey(poolInfo.programId) },
          {
            idoId: new PublicKey(poolInfo.idoId),
            authority: idoAuthority,
            poolTokenAccount: new PublicKey(aim === 'base' ? poolInfo.baseVault : poolInfo.quoteVault),
            userTokenAccount: aim === 'base' ? newUserBaseTokenAccount : newUserQuoteTokenAccount,
            userIdoInfo,
            userOwner: owner
          }
        )
      : claimInstruction(
          { programId: new PublicKey(poolInfo.programId) },
          {
            idoId: new PublicKey(poolInfo.idoId),
            authority: idoAuthority,
            poolQuoteTokenAccount: new PublicKey(poolInfo.quoteVault),
            poolBaseTokenAccount: new PublicKey(poolInfo.baseVault),
            userQuoteTokenAccount: newUserQuoteTokenAccount,
            userBaseTokenAccount: newUserBaseTokenAccount,
            userIdoInfo,
            userOwner: owner
          }
        )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

interface PurchaseInstructionKeys {
  // ido
  idoId: PublicKey
  authority: PublicKey
  poolQuoteTokenAccount: PublicKey
  // user
  userQuoteTokenAccount: PublicKey
  userIdoInfo: PublicKey
  userStakeInfo: PublicKey
  userIdoCheck: PublicKey
  userOwner: PublicKey
}
interface PurchaseInstructionKeysV3 {
  // ido
  idoId: PublicKey
  authority: PublicKey
  poolQuoteTokenAccount: PublicKey
  // user
  userQuoteTokenAccount: PublicKey
  userIdoInfo: PublicKey
  userIdoCheck: PublicKey
  userOwner: PublicKey
}
interface PurchaseInstructionKeysPrivate {
  // ido
  idoId: PublicKey
  authority: PublicKey
  poolQuoteTokenAccount: PublicKey
  // user
  userQuoteTokenAccount: PublicKey
  userIdoInfo: PublicKey
  userIdoCheck: PublicKey
  userOwner: PublicKey
}
export function purchaseInstruction<Flag extends '' | '3' | 'private' = ''>(
  { programId, amount }: { programId: PublicKey; amount: string | number },
  instructionKeys: Flag extends '3'
    ? PurchaseInstructionKeysV3
    : Flag extends 'private'
    ? PurchaseInstructionKeysPrivate
    : PurchaseInstructionKeys
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amount')])
  const keys = [
    // system
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: RENT_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: CLOCK_PROGRAM_ID, isSigner: false, isWritable: true },
    // pubkeys
    ...Object.entries(instructionKeys).map(([name, pubkey]) => ({
      pubkey,
      isSigner: name === 'userOwner',
      isWritable: true
    }))
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode({ instruction: 1, amount: Number(amount) }, data)

  return new TransactionInstruction({ keys, programId, data })
}

interface ClaimInstructionKeys {
  // ido
  idoId: PublicKey
  authority: PublicKey
  poolQuoteTokenAccount: PublicKey
  poolBaseTokenAccount: PublicKey
  // user
  userQuoteTokenAccount: PublicKey
  userBaseTokenAccount: PublicKey
  userIdoInfo: PublicKey
  userOwner: PublicKey
}
interface ClaimInstructionKeysV3 {
  // ido
  idoId: PublicKey
  authority: PublicKey

  poolTokenAccount: PublicKey // NEED_CHECK: is it Quote or Base?
  // user
  userTokenAccount: PublicKey // NEED_CHECK: is it Quote or Base? // differernt account in user wallet
  userIdoInfo: PublicKey
  userOwner: PublicKey
}
export function claimInstruction<Version extends '' | '3' = ''>(
  { programId }: { programId: PublicKey },
  instructionKeys: Version extends '3' ? ClaimInstructionKeysV3 : ClaimInstructionKeys
): TransactionInstruction {
  const dataLayout = struct([u8('instruction')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: CLOCK_PROGRAM_ID, isSigner: false, isWritable: true },
    ...Object.entries(instructionKeys).map(([name, pubkey]) => ({
      pubkey,
      isSigner: name === 'userOwner',
      isWritable: true
    }))
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode({ instruction: 2 }, data)

  return new TransactionInstruction({ keys, programId, data })
}
