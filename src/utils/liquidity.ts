import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  LiquidityPoolInfo,
  getLpMintByTokenMintAddresses,
  getPoolByLpMintAddress,
  getPoolByTokenMintAddresses
} from '@/utils/pools'
import { NATIVE_SOL, TOKENS, TokenInfo } from '@/utils/tokens'
import { createTokenAccountIfNotExist, sendTransaction } from '@/utils/web3'
// @ts-ignore
import { nu64, struct, u8 } from 'buffer-layout'
import { publicKey, u64 } from '@project-serum/borsh'

import BigNumber from 'bignumber.js'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
import { TokenAmount } from '@/utils/safe-math'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'

export { getLpMintByTokenMintAddresses, getPoolByLpMintAddress, getPoolByTokenMintAddresses }

// 计算价格
export function getPrice(poolInfo: LiquidityPoolInfo, coinBase = true) {
  const { coin, pc } = poolInfo

  if (!coin.balance || !pc.balance) {
    return new BigNumber(0)
  }

  if (coinBase) {
    return pc.balance.toEther().dividedBy(coin.balance.toEther())
  } else {
    return coin.balance.toEther().dividedBy(pc.balance.toEther())
  }
}

// 计算金额
export function getOutAmount(
  poolInfo: LiquidityPoolInfo,
  amount: string,
  fromCoinMint: string,
  toCoinMint: string,
  slippage: number
) {
  const { coin, pc } = poolInfo

  const price = getPrice(poolInfo)
  const fromAmount = new BigNumber(amount)
  let outAmount = new BigNumber(0)

  const percent = new BigNumber(100).plus(slippage).dividedBy(100)

  if (!coin.balance || !pc.balance) {
    return outAmount
  }

  if (fromCoinMint === coin.mintAddress && toCoinMint === pc.mintAddress) {
    // outcoin 是 pc
    outAmount = fromAmount.multipliedBy(price)
    // 滑点
    outAmount = outAmount.multipliedBy(percent)
  } else if (fromCoinMint === pc.mintAddress && toCoinMint === coin.mintAddress) {
    // outcoin 是 coin
    outAmount = fromAmount.dividedBy(price)
    // 滑点
    outAmount = outAmount.multipliedBy(percent)
  }

  return outAmount
}

// 添加流动性
/* eslint-disable */
export async function addLiquidity(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  poolInfo: LiquidityPoolInfo | undefined | null,
  fromCoinAccount: string | undefined | null,
  toCoinAccount: string | undefined | null,
  lpAccount: string | undefined | null,
  fromCoin: TokenInfo | undefined | null,
  toCoin: TokenInfo | undefined | null,
  fromAmount: string | undefined | null,
  toAmount: string | undefined | null,
  slippage: number
): Promise<string> {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!poolInfo || !fromCoin || !toCoin) {
    throw new Error('Miss pool infomations')
  }
  if (!fromCoinAccount || !toCoinAccount) {
    throw new Error('Miss account infomations')
  }
  if (!fromAmount || !toAmount) {
    throw new Error('Miss amount infomations')
  }

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey
  const tolerate = new BigNumber(slippage).multipliedBy(100).toNumber()

  const userAccounts = [new PublicKey(fromCoinAccount), new PublicKey(toCoinAccount)]
  const userAmounts = [
    new TokenAmount(fromAmount, poolInfo.coin.decimals, false).wei.toNumber(),
    new TokenAmount(toAmount, poolInfo.pc.decimals, false).wei.toNumber()
  ]

  // 反转
  if (poolInfo.coin.mintAddress === toCoin.mintAddress && poolInfo.pc.mintAddress === fromCoin.mintAddress) {
    userAccounts.reverse()
    userAmounts.reverse()
  }

  const userCoinTokenAccount = userAccounts[0]
  const userPcTokenAccount = userAccounts[1]
  const coinAmount = userAmounts[0]
  const pcAmount = userAmounts[1]

  // 如果是 NATIVE SOL 包裹一下
  let wrappedSolAccount
  if (poolInfo.pc.mintAddress === NATIVE_SOL.mintAddress) {
    wrappedSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      transaction,
      signers
    )
  }

  // 如果没有 lp 地址 创一个
  let userLpTokenAccount = await createTokenAccountIfNotExist(
    connection,
    lpAccount,
    owner,
    poolInfo.lp.mintAddress,
    transaction,
    signers
  )

  transaction.add(
    addLiquidityInstruction(
      new PublicKey(poolInfo.programId),

      new PublicKey(poolInfo.ammId),
      new PublicKey(poolInfo.ammAuthority),
      new PublicKey(poolInfo.ammOpenOrders),
      new PublicKey(poolInfo.ammQuantities),
      new PublicKey(poolInfo.lp.mintAddress),
      new PublicKey(poolInfo.poolCoinTokenAccount),
      new PublicKey(poolInfo.poolPcTokenAccount),

      new PublicKey(poolInfo.serumMarket),

      userCoinTokenAccount,
      wrappedSolAccount ? wrappedSolAccount : userPcTokenAccount,
      userLpTokenAccount,
      owner,

      coinAmount,
      pcAmount,
      tolerate
    )
  )

  if (wrappedSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount,
        destination: owner,
        owner: owner
      })
    )
  }

  return await sendTransaction(connection, wallet, transaction, signers)
}

// 移除流动性
export async function removeLiquidity(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  poolInfo: LiquidityPoolInfo | undefined | null,
  lpAccount: string | undefined | null,
  fromCoinAccount: string | undefined | null,
  toCoinAccount: string | undefined | null,
  amount: string | undefined | null
) {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!poolInfo) {
    throw new Error('Miss pool infomations')
  }
  if (!lpAccount || !fromCoinAccount || !toCoinAccount) {
    throw new Error('Miss account infomations')
  }
  if (!amount) {
    throw new Error('Miss amount infomations')
  }

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  const lpAmount = new TokenAmount(amount, poolInfo.lp.decimals, false).wei.toNumber()

  // 如果是 NATIVE SOL 包裹一下
  let wrappedSolAccount
  if (poolInfo.pc.mintAddress === NATIVE_SOL.mintAddress) {
    wrappedSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      transaction,
      signers
    )
  }

  transaction.add(
    removeLiquidityInstruction(
      new PublicKey(poolInfo.programId),

      new PublicKey(poolInfo.ammId),
      new PublicKey(poolInfo.ammAuthority),
      new PublicKey(poolInfo.ammOpenOrders),
      new PublicKey(poolInfo.ammQuantities),
      new PublicKey(poolInfo.lp.mintAddress),
      new PublicKey(poolInfo.poolCoinTokenAccount),
      new PublicKey(poolInfo.poolPcTokenAccount),
      new PublicKey(poolInfo.poolWithdrawQueue),
      new PublicKey(poolInfo.poolTempLpTokenAccount),

      new PublicKey(poolInfo.serumProgramId),
      new PublicKey(poolInfo.serumMarket),
      new PublicKey(poolInfo.serumCoinVaultAccount),
      new PublicKey(poolInfo.serumPcVaultAccount),
      new PublicKey(poolInfo.serumVaultSigner),

      new PublicKey(lpAccount),
      new PublicKey(fromCoinAccount),
      wrappedSolAccount ? wrappedSolAccount : new PublicKey(toCoinAccount),
      owner,

      lpAmount
    )
  )

  if (wrappedSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount,
        destination: owner,
        owner: owner
      })
    )
  }

  return await sendTransaction(connection, wallet, transaction, signers)
}

export function addLiquidityInstruction(
  programId: PublicKey,
  // tokenProgramId: PublicKey,
  // amm
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  ammQuantities: PublicKey,
  lpMintAddress: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  // serum
  serumMarket: PublicKey,
  // user
  userCoinTokenAccount: PublicKey,
  userPcTokenAccount: PublicKey,
  userLpTokenAccount: PublicKey,
  userOwner: PublicKey,

  maxCoinAmount: number,
  maxPcAmount: number,
  tolerate: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('maxCoinAmount'), nu64('maxPcAmount'), nu64('tolerate')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: true },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: ammQuantities, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: userCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 3,
      maxCoinAmount,
      maxPcAmount,
      tolerate
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function removeLiquidityInstruction(
  programId: PublicKey,
  // tokenProgramId: PublicKey,
  // amm
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  ammQuantities: PublicKey,
  lpMintAddress: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  poolWithdrawQueue: PublicKey,
  poolTempLpTokenAccount: PublicKey,
  // serum
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,
  // user
  userLpTokenAccount: PublicKey,
  userCoinTokenAccount: PublicKey,
  userPcTokenAccount: PublicKey,
  userOwner: PublicKey,

  amount: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amount')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: true },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: ammQuantities, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumProgramId, isSigner: false, isWritable: true },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 4,
      amount: amount
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export const AMM_INFO_LAYOUT = struct([
  u64('status'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('fee'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('pnlRatio'),
  u64('amountWaveRatio'),
  u64('coinLotSize'),
  u64('pcLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('needTakePnlCoin'),
  u64('needTakePnlPc'),
  u64('totalPnlX'),
  u64('totalPnlY'),
  u64('systemDecimalsValue'),
  publicKey('poolCoinTokenAccount'),
  publicKey('poolPcTokenAccount'),
  publicKey('coinMintAddress'),
  publicKey('pcMintAddress'),
  publicKey('lpMintAddress'),
  publicKey('ammOpenOrders'),
  publicKey('serumMarket'),
  publicKey('serumProgramId'),
  publicKey('ammTargetOrders'),
  publicKey('ammQuantities'),
  publicKey('poolWithdrawQueue'),
  publicKey('poolTempLpTokenAccount'),
  publicKey('ammCoinPnlAccount'),
  publicKey('ammPcPnlAccount')
])
