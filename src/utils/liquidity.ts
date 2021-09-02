import BigNumber from 'bignumber.js';
// @ts-ignore
import { nu64, struct, u8 } from 'buffer-layout';

import { TOKEN_PROGRAM_ID } from '@/utils/ids';
import {
  canWrap, getLpMintByTokenMintAddresses, getPoolByLpMintAddress, getPoolByTokenMintAddresses,
  LIQUIDITY_POOLS, LiquidityPoolInfo
} from '@/utils/pools';
import { TokenAmount } from '@/utils/safe-math';
import { LP_TOKENS, NATIVE_SOL, TokenInfo, TOKENS } from '@/utils/tokens';
import {
  commitment, createAssociatedTokenAccountIfNotExist, createTokenAccountIfNotExist,
  getMultipleAccounts, sendTransaction
} from '@/utils/web3';
import { publicKey, u128, u64 } from '@project-serum/borsh';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

import { getBigNumber, MINT_LAYOUT } from './layouts';

export { getLpMintByTokenMintAddresses, getPoolByLpMintAddress, getPoolByTokenMintAddresses, canWrap }

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
    // outcoin is pc
    outAmount = fromAmount.multipliedBy(price)
    outAmount = outAmount.multipliedBy(percent)
  } else if (fromCoinMint === pc.mintAddress && toCoinMint === coin.mintAddress) {
    // outcoin is coin
    outAmount = fromAmount.dividedBy(price)
    outAmount = outAmount.multipliedBy(percent)
  }

  return outAmount
}

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
  fixedCoin: string
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

  const userAccounts = [new PublicKey(fromCoinAccount), new PublicKey(toCoinAccount)]
  const userAmounts = [fromAmount, toAmount]

  if (poolInfo.coin.mintAddress === toCoin.mintAddress && poolInfo.pc.mintAddress === fromCoin.mintAddress) {
    userAccounts.reverse()
    userAmounts.reverse()
  }

  const userCoinTokenAccount = userAccounts[0]
  const userPcTokenAccount = userAccounts[1]
  const coinAmount = getBigNumber(new TokenAmount(userAmounts[0], poolInfo.coin.decimals, false).wei)
  const pcAmount = getBigNumber(new TokenAmount(userAmounts[1], poolInfo.pc.decimals, false).wei)

  let wrappedCoinSolAccount
  if (poolInfo.coin.mintAddress === NATIVE_SOL.mintAddress) {
    wrappedCoinSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedCoinSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      coinAmount + 1e7,
      transaction,
      signers
    )
  }
  let wrappedSolAccount
  if (poolInfo.pc.mintAddress === NATIVE_SOL.mintAddress) {
    wrappedSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      pcAmount + 1e7,
      transaction,
      signers
    )
  }

  let userLpTokenAccount = await createAssociatedTokenAccountIfNotExist(
    lpAccount,
    owner,
    poolInfo.lp.mintAddress,
    transaction
  )

  transaction.add(
    poolInfo.version === 4
      ? addLiquidityInstructionV4(
          new PublicKey(poolInfo.programId),

          new PublicKey(poolInfo.ammId),
          new PublicKey(poolInfo.ammAuthority),
          new PublicKey(poolInfo.ammOpenOrders),
          new PublicKey(poolInfo.ammTargetOrders),
          new PublicKey(poolInfo.lp.mintAddress),
          new PublicKey(poolInfo.poolCoinTokenAccount),
          new PublicKey(poolInfo.poolPcTokenAccount),

          new PublicKey(poolInfo.serumMarket),

          wrappedCoinSolAccount ? wrappedCoinSolAccount : userCoinTokenAccount,
          wrappedSolAccount ? wrappedSolAccount : userPcTokenAccount,
          userLpTokenAccount,
          owner,

          coinAmount,
          pcAmount,
          fixedCoin === poolInfo.coin.mintAddress ? 0 : 1
        )
      : addLiquidityInstruction(
          new PublicKey(poolInfo.programId),

          new PublicKey(poolInfo.ammId),
          new PublicKey(poolInfo.ammAuthority),
          new PublicKey(poolInfo.ammOpenOrders),
          new PublicKey(poolInfo.ammQuantities),
          new PublicKey(poolInfo.lp.mintAddress),
          new PublicKey(poolInfo.poolCoinTokenAccount),
          new PublicKey(poolInfo.poolPcTokenAccount),

          new PublicKey(poolInfo.serumMarket),

          wrappedCoinSolAccount ? wrappedCoinSolAccount : userCoinTokenAccount,
          wrappedSolAccount ? wrappedSolAccount : userPcTokenAccount,
          userLpTokenAccount,
          owner,

          coinAmount,
          pcAmount,
          fixedCoin === poolInfo.coin.mintAddress ? 0 : 1
        )
  )

  if (wrappedCoinSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedCoinSolAccount,
        destination: owner,
        owner: owner
      })
    )
  }
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
  if (!poolInfo) throw new Error('Miss pool infomations')

  if (!lpAccount) throw new Error('Miss account infomations')

  if (!amount) throw new Error('Miss amount infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  const lpAmount = getBigNumber(new TokenAmount(amount, poolInfo.lp.decimals, false).wei)

  let needCloseFromTokenAccount = false
  let newFromTokenAccount
  if (poolInfo.coin.mintAddress === NATIVE_SOL.mintAddress) {
    newFromTokenAccount = await createTokenAccountIfNotExist(
      connection,
      newFromTokenAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      null,
      transaction,
      signers
    )
    needCloseFromTokenAccount = true
  } else {
    newFromTokenAccount = await createAssociatedTokenAccountIfNotExist(
      fromCoinAccount,
      owner,
      poolInfo.coin.mintAddress,
      transaction
    )
  }

  let needCloseToTokenAccount = false
  let newToTokenAccount
  if (poolInfo.pc.mintAddress === NATIVE_SOL.mintAddress) {
    newToTokenAccount = await createTokenAccountIfNotExist(
      connection,
      newToTokenAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      null,
      transaction,
      signers
    )
    needCloseToTokenAccount = true
  } else {
    newToTokenAccount = await createAssociatedTokenAccountIfNotExist(
      toCoinAccount,
      owner,
      poolInfo.pc.mintAddress === NATIVE_SOL.mintAddress ? TOKENS.WSOL.mintAddress : poolInfo.pc.mintAddress,
      transaction
    )
  }

  transaction.add(
    poolInfo.version === 4
      ? removeLiquidityInstructionV4(
          new PublicKey(poolInfo.programId),

          new PublicKey(poolInfo.ammId),
          new PublicKey(poolInfo.ammAuthority),
          new PublicKey(poolInfo.ammOpenOrders),
          new PublicKey(poolInfo.ammTargetOrders),
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
          newFromTokenAccount,
          newToTokenAccount,
          owner,

          lpAmount
        )
      : removeLiquidityInstruction(
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
          newFromTokenAccount,
          newToTokenAccount,
          owner,

          lpAmount
        )
  )

  if (needCloseFromTokenAccount) {
    transaction.add(
      closeAccount({
        source: newFromTokenAccount,
        destination: owner,
        owner: owner
      })
    )
  }
  if (needCloseToTokenAccount) {
    transaction.add(
      closeAccount({
        source: newToTokenAccount,
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
  fixedFromCoin: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('maxCoinAmount'), nu64('maxPcAmount'), nu64('fixedFromCoin')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: false },
    { pubkey: ammQuantities, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumMarket, isSigner: false, isWritable: false },
    { pubkey: userCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 3,
      maxCoinAmount,
      maxPcAmount,
      fixedFromCoin
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function addLiquidityInstructionV4(
  programId: PublicKey,
  // tokenProgramId: PublicKey,
  // amm
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  ammTargetOrders: PublicKey,
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
  fixedFromCoin: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('maxCoinAmount'), nu64('maxPcAmount'), nu64('fixedFromCoin')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: false },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumMarket, isSigner: false, isWritable: false },
    { pubkey: userCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 3,
      maxCoinAmount,
      maxPcAmount,
      fixedFromCoin
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
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: ammQuantities, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
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

export function removeLiquidityInstructionV4(
  programId: PublicKey,
  // tokenProgramId: PublicKey,
  // amm
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  ammTargetOrders: PublicKey,
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
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
    { pubkey: userLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
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
  publicKey('ammOwner'),
  publicKey('pnlOwner')
])

export const AMM_INFO_LAYOUT_V3 = struct([
  u64('status'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('fee'),
  u64('min_separate'),
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
  u64('poolTotalDepositPc'),
  u64('poolTotalDepositCoin'),
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
  publicKey('ammOwner'),
  publicKey('pnlOwner'),
  publicKey('srmTokenAccount')
])

export const AMM_INFO_LAYOUT_V4 = struct([
  u64('status'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('amountWaveRatio'),
  u64('coinLotSize'),
  u64('pcLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('systemDecimalsValue'),
  // Fees
  u64('minSeparateNumerator'),
  u64('minSeparateDenominator'),
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('pnlNumerator'),
  u64('pnlDenominator'),
  u64('swapFeeNumerator'),
  u64('swapFeeDenominator'),
  // OutPutData
  u64('needTakePnlCoin'),
  u64('needTakePnlPc'),
  u64('totalPnlPc'),
  u64('totalPnlCoin'),
  u128('poolTotalDepositPc'),
  u128('poolTotalDepositCoin'),
  u128('swapCoinInAmount'),
  u128('swapPcOutAmount'),
  u64('swapCoin2PcFee'),
  u128('swapPcInAmount'),
  u128('swapCoinOutAmount'),
  u64('swapPc2CoinFee'),

  publicKey('poolCoinTokenAccount'),
  publicKey('poolPcTokenAccount'),
  publicKey('coinMintAddress'),
  publicKey('pcMintAddress'),
  publicKey('lpMintAddress'),
  publicKey('ammOpenOrders'),
  publicKey('serumMarket'),
  publicKey('serumProgramId'),
  publicKey('ammTargetOrders'),
  publicKey('poolWithdrawQueue'),
  publicKey('poolTempLpTokenAccount'),
  publicKey('ammOwner'),
  publicKey('pnlOwner')
])

export async function getLpMintInfo(conn: any, mintAddress: string, coin: any, pc: any): Promise<TokenInfo> {
  let lpInfo = Object.values(LP_TOKENS).find((item) => item.mintAddress === mintAddress)
  if (!lpInfo) {
    const mintAll = await getMultipleAccounts(conn, [new PublicKey(mintAddress)], commitment)
    if (mintAll !== null) {
      const data = Buffer.from(mintAll[0]?.account.data ?? '')
      const mintLayoutData = MINT_LAYOUT.decode(data)
      lpInfo = {
        symbol: 'unknown',
        name: 'unknown',
        coin,
        pc,
        mintAddress: mintAddress,
        decimals: mintLayoutData.decimals
      }
    }
  }
  return lpInfo
}

export async function getLpMintListDecimals(
  conn: any,
  mintAddressInfos: string[]
): Promise<{ [name: string]: number }> {
  const reLpInfoDict: { [name: string]: number } = {}
  const mintList = [] as PublicKey[]
  mintAddressInfos.forEach((item) => {
    let lpInfo = Object.values(LP_TOKENS).find((itemLpToken) => itemLpToken.mintAddress === item)
    if (!lpInfo) {
      mintList.push(new PublicKey(item))
      lpInfo = {
        decimals: null
      }
    }
    reLpInfoDict[item] = lpInfo.decimals
  })

  const mintAll = await getMultipleAccounts(conn, mintList, commitment)
  for (let mintIndex = 0; mintIndex < mintAll.length; mintIndex += 1) {
    const itemMint = mintAll[mintIndex]
    if (itemMint) {
      const mintLayoutData = MINT_LAYOUT.decode(Buffer.from(itemMint.account.data))
      reLpInfoDict[mintList[mintIndex].toString()] = mintLayoutData.decimals
    }
  }
  const reInfo: { [name: string]: number } = {}
  for (const key of Object.keys(reLpInfoDict)) {
    if (reLpInfoDict[key] !== null) {
      reInfo[key] = reLpInfoDict[key]
    }
  }
  return reInfo
}

export function getLiquidityInfoSimilar(ammIdOrMarket: string, from: string, to: string) {
  // const fromCoin = from === NATIVE_SOL.mintAddress ? TOKENS.WSOL.mintAddress : from
  // const toCoin = to === NATIVE_SOL.mintAddress ? TOKENS.WSOL.mintAddress : to
  const fromCoin = from === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : from
  const toCoin = to === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : to
  const knownLiquidity = LIQUIDITY_POOLS.find((item) => {
    if (fromCoin !== null && toCoin != null && fromCoin === toCoin) {
      return false
    }
    if (ammIdOrMarket !== undefined && !(item.ammId === ammIdOrMarket || item.serumMarket === ammIdOrMarket)) {
      return false
    }
    if (fromCoin && item.pc.mintAddress !== fromCoin && item.coin.mintAddress !== fromCoin) {
      return false
    }
    if (toCoin && item.pc.mintAddress !== toCoin && item.coin.mintAddress !== toCoin) {
      return false
    }
    if (ammIdOrMarket || (fromCoin && toCoin)) {
      return true
    }
    return false
  })
  return knownLiquidity
}

export function getQueryVariable(variable: string) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return undefined
}
