import { getBigNumber } from './layouts'
import { Connection, PublicKey, SYSVAR_CLOCK_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js'
import { createProgramAccountIfNotExist, sendTransaction, createAssociatedTokenAccountIfNotExist } from '@/utils/web3'
// @ts-ignore
import { nu64, struct, u8, blob } from 'buffer-layout'
import { publicKey, u128, u64 } from '@project-serum/borsh'

import { FarmInfo } from '@/utils/farms'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
import { TokenAmount } from '@/utils/safe-math'

// deposit
export async function deposit(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  farmInfo: FarmInfo | undefined | null,
  lpAccount: string | undefined | null,
  rewardAccount: string | undefined | null,
  infoAccount: string | undefined | null,
  amount: string | undefined | null
): Promise<string> {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!farmInfo) throw new Error('Miss pool infomations')
  if (!amount) throw new Error('Miss amount infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  const atas: string[] = []

  const userLpAccount = await createAssociatedTokenAccountIfNotExist(
    lpAccount,
    owner,
    farmInfo.lp.mintAddress,
    transaction,
    atas
  )

  // if no account, create new one
  const userRewardTokenAccount = await createAssociatedTokenAccountIfNotExist(
    rewardAccount,
    owner,
    farmInfo.reward.mintAddress,
    transaction,
    atas
  )

  // if no userinfo account, create new one
  const programId = new PublicKey(farmInfo.programId)
  const userInfoAccount = await createProgramAccountIfNotExist(
    connection,
    infoAccount,
    owner,
    programId,
    null,
    USER_STAKE_INFO_ACCOUNT_LAYOUT,
    transaction,
    signers
  )

  const value = getBigNumber(new TokenAmount(amount, farmInfo.lp.decimals, false).wei)

  transaction.add(
    depositInstruction(
      programId,
      new PublicKey(farmInfo.poolId),
      new PublicKey(farmInfo.poolAuthority),
      userInfoAccount,
      wallet.publicKey,
      userLpAccount,
      new PublicKey(farmInfo.poolLpTokenAccount),
      userRewardTokenAccount,
      new PublicKey(farmInfo.poolRewardTokenAccount),
      value
    )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

// depositV4
export async function depositV4(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  farmInfo: FarmInfo | undefined | null,
  lpAccount: string | undefined | null,
  rewardAccount: string | undefined | null,
  rewardAccountB: string | undefined | null,
  infoAccount: string | undefined | null,
  amount: string | undefined | null
): Promise<string> {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!farmInfo) throw new Error('Miss pool infomations')
  if (!amount) throw new Error('Miss amount infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  const atas: string[] = []

  const userLpAccount = await createAssociatedTokenAccountIfNotExist(
    lpAccount,
    owner,
    farmInfo.lp.mintAddress,
    transaction,
    atas
  )

  // if no account, create new one
  const userRewardTokenAccount = await createAssociatedTokenAccountIfNotExist(
    rewardAccount,
    owner,
    farmInfo.reward.mintAddress,
    transaction,
    atas
  )

  // if no account, create new one
  const userRewardTokenAccountB = await createAssociatedTokenAccountIfNotExist(
    rewardAccountB,
    owner,
    // @ts-ignore
    farmInfo.rewardB.mintAddress,
    transaction,
    atas
  )

  // if no userinfo account, create new one
  const programId = new PublicKey(farmInfo.programId)
  const userInfoAccount = await createProgramAccountIfNotExist(
    connection,
    infoAccount,
    owner,
    programId,
    null,
    USER_STAKE_INFO_ACCOUNT_LAYOUT_V4,
    transaction,
    signers
  )

  const value = getBigNumber(new TokenAmount(amount, farmInfo.lp.decimals, false).wei)

  transaction.add(
    depositInstructionV4(
      programId,
      new PublicKey(farmInfo.poolId),
      new PublicKey(farmInfo.poolAuthority),
      userInfoAccount,
      wallet.publicKey,
      userLpAccount,
      new PublicKey(farmInfo.poolLpTokenAccount),
      userRewardTokenAccount,
      new PublicKey(farmInfo.poolRewardTokenAccount),
      userRewardTokenAccountB,
      // @ts-ignore
      new PublicKey(farmInfo.poolRewardTokenAccountB),
      value
    )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

// withdraw
export async function withdraw(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  farmInfo: FarmInfo | undefined | null,
  lpAccount: string | undefined | null,
  rewardAccount: string | undefined | null,
  infoAccount: string | undefined | null,
  amount: string | undefined | null
): Promise<string> {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!farmInfo) throw new Error('Miss pool infomations')
  if (!infoAccount) throw new Error('Miss account infomations')
  if (!amount) throw new Error('Miss amount infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  const atas: string[] = []

  const userLpAccount = await createAssociatedTokenAccountIfNotExist(
    lpAccount,
    owner,
    farmInfo.lp.mintAddress,
    transaction,
    atas
  )

  // if no account, create new one
  const userRewardTokenAccount = await createAssociatedTokenAccountIfNotExist(
    rewardAccount,
    owner,
    farmInfo.reward.mintAddress,
    transaction,
    atas
  )

  const programId = new PublicKey(farmInfo.programId)
  const value = getBigNumber(new TokenAmount(amount, farmInfo.lp.decimals, false).wei)

  transaction.add(
    withdrawInstruction(
      programId,
      new PublicKey(farmInfo.poolId),
      new PublicKey(farmInfo.poolAuthority),
      new PublicKey(infoAccount),
      wallet.publicKey,
      userLpAccount,
      new PublicKey(farmInfo.poolLpTokenAccount),
      userRewardTokenAccount,
      new PublicKey(farmInfo.poolRewardTokenAccount),
      value
    )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

// withdrawV4
export async function withdrawV4(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  farmInfo: FarmInfo | undefined | null,
  lpAccount: string | undefined | null,
  rewardAccount: string | undefined | null,
  rewardAccountB: string | undefined | null,
  infoAccount: string | undefined | null,
  amount: string | undefined | null
): Promise<string> {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!farmInfo) throw new Error('Miss pool infomations')
  if (!infoAccount) throw new Error('Miss account infomations')
  if (!amount) throw new Error('Miss amount infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  const atas: string[] = []

  const userLpAccount = await createAssociatedTokenAccountIfNotExist(
    lpAccount,
    owner,
    farmInfo.lp.mintAddress,
    transaction,
    atas
  )
  // if no account, create new one
  const userRewardTokenAccount = await createAssociatedTokenAccountIfNotExist(
    rewardAccount,
    owner,
    farmInfo.reward.mintAddress,
    transaction,
    atas
  )

  // if no account, create new one
  const userRewardTokenAccountB = await createAssociatedTokenAccountIfNotExist(
    rewardAccountB,
    owner,
    // @ts-ignore
    farmInfo.rewardB.mintAddress,
    transaction,
    atas
  )

  const programId = new PublicKey(farmInfo.programId)
  const value = getBigNumber(new TokenAmount(amount, farmInfo.lp.decimals, false).wei)

  transaction.add(
    withdrawInstructionV4(
      programId,
      new PublicKey(farmInfo.poolId),
      new PublicKey(farmInfo.poolAuthority),
      new PublicKey(infoAccount),
      wallet.publicKey,
      userLpAccount,
      new PublicKey(farmInfo.poolLpTokenAccount),
      userRewardTokenAccount,
      new PublicKey(farmInfo.poolRewardTokenAccount),
      userRewardTokenAccountB,
      // @ts-ignore
      new PublicKey(farmInfo.poolRewardTokenAccountB),
      value
    )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

export function depositInstruction(
  programId: PublicKey,
  // staking pool
  poolId: PublicKey,
  poolAuthority: PublicKey,
  // user
  userInfoAccount: PublicKey,
  userOwner: PublicKey,
  userLpTokenAccount: PublicKey,
  poolLpTokenAccount: PublicKey,
  userRewardTokenAccount: PublicKey,
  poolRewardTokenAccount: PublicKey,
  // tokenProgramId: PublicKey,
  amount: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amount')])

  const keys = [
    { pubkey: poolId, isSigner: false, isWritable: true },
    { pubkey: poolAuthority, isSigner: false, isWritable: true },
    { pubkey: userInfoAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true }
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

export function depositInstructionV4(
  programId: PublicKey,
  // staking pool
  poolId: PublicKey,
  poolAuthority: PublicKey,
  // user
  userInfoAccount: PublicKey,
  userOwner: PublicKey,
  userLpTokenAccount: PublicKey,
  poolLpTokenAccount: PublicKey,
  userRewardTokenAccount: PublicKey,
  poolRewardTokenAccount: PublicKey,
  userRewardTokenAccountB: PublicKey,
  poolRewardTokenAccountB: PublicKey,
  // tokenProgramId: PublicKey,
  amount: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amount')])

  const keys = [
    { pubkey: poolId, isSigner: false, isWritable: true },
    { pubkey: poolAuthority, isSigner: false, isWritable: true },
    { pubkey: userInfoAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: userRewardTokenAccountB, isSigner: false, isWritable: true },
    { pubkey: poolRewardTokenAccountB, isSigner: false, isWritable: true }
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

export function withdrawInstruction(
  programId: PublicKey,
  // staking pool
  poolId: PublicKey,
  poolAuthority: PublicKey,
  // user
  userInfoAccount: PublicKey,
  userOwner: PublicKey,
  userLpTokenAccount: PublicKey,
  poolLpTokenAccount: PublicKey,
  userRewardTokenAccount: PublicKey,
  poolRewardTokenAccount: PublicKey,
  // tokenProgramId: PublicKey,
  amount: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amount')])

  const keys = [
    { pubkey: poolId, isSigner: false, isWritable: true },
    { pubkey: poolAuthority, isSigner: false, isWritable: true },
    { pubkey: userInfoAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 2,
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

export function withdrawInstructionV4(
  programId: PublicKey,
  // staking pool
  poolId: PublicKey,
  poolAuthority: PublicKey,
  // user
  userInfoAccount: PublicKey,
  userOwner: PublicKey,
  userLpTokenAccount: PublicKey,
  poolLpTokenAccount: PublicKey,
  userRewardTokenAccount: PublicKey,
  poolRewardTokenAccount: PublicKey,
  userRewardTokenAccountB: PublicKey,
  poolRewardTokenAccountB: PublicKey,
  // tokenProgramId: PublicKey,
  amount: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amount')])

  const keys = [
    { pubkey: poolId, isSigner: false, isWritable: true },
    { pubkey: poolAuthority, isSigner: false, isWritable: true },
    { pubkey: userInfoAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: userRewardTokenAccountB, isSigner: false, isWritable: true },
    { pubkey: poolRewardTokenAccountB, isSigner: false, isWritable: true }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 2,
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

export const STAKE_INFO_LAYOUT = struct([
  u64('state'),
  u64('nonce'),
  publicKey('poolLpTokenAccount'),
  publicKey('poolRewardTokenAccount'),
  publicKey('owner'),
  publicKey('feeOwner'),
  u64('feeY'),
  u64('feeX'),
  u64('totalReward'),
  u128('rewardPerShareNet'),
  u64('lastBlock'),
  u64('rewardPerBlock')
])

export const STAKE_INFO_LAYOUT_V4 = struct([
  u64('state'),
  u64('nonce'),
  publicKey('poolLpTokenAccount'),
  publicKey('poolRewardTokenAccount'),
  u64('totalReward'),
  u128('perShare'),
  u64('perBlock'),
  u8('option'),
  publicKey('poolRewardTokenAccountB'),
  blob(7),
  u64('totalRewardB'),
  u128('perShareB'),
  u64('perBlockB'),
  u64('lastBlock'),
  publicKey('owner')
])

export const USER_STAKE_INFO_ACCOUNT_LAYOUT = struct([
  u64('state'),
  publicKey('poolId'),
  publicKey('stakerOwner'),
  u64('depositBalance'),
  u64('rewardDebt')
])

export const USER_STAKE_INFO_ACCOUNT_LAYOUT_V4 = struct([
  u64('state'),
  publicKey('poolId'),
  publicKey('stakerOwner'),
  u64('depositBalance'),
  u64('rewardDebt'),
  u64('rewardDebtB')
])
