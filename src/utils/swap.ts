import { _OPEN_ORDERS_LAYOUT_V2, Market, OpenOrders } from '@project-serum/serum/lib/market'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import { Account, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
// @ts-ignore
import { nu64, struct, u8 } from 'buffer-layout'

import { RouterInfoItem } from '@/types/api'
// eslint-disable-next-line
import { TokenAmount } from '@/utils/safe-math'
import {
  createAssociatedTokenAccountIfNotExist,
  createAtaSolIfNotExistAndWrap,
  createProgramAccountIfNotExist,
  createTokenAccountIfNotExist,
  findProgramAddress,
  mergeTransactions,
  sendTransaction
} from '@/utils/web3'
import {
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  LIQUIDITY_POOL_PROGRAM_ID_V5,
  MEMO_PROGRAM_ID,
  ROUTE_SWAP_PROGRAM_ID,
  SERUM_PROGRAM_ID_V3,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from './ids'
import { getBigNumber } from './layouts'
import { LiquidityPoolInfo } from './pools'
// eslint-disable-next-line
import { getTokenByMintAddress, NATIVE_SOL, TOKENS } from './tokens'
import { getDyByDxBaseIn, getDxByDyBaseIn, getStablePrice } from './stable'
import BigNumber from 'bignumber.js'

export function getOutAmount(
  market: any,
  asks: any,
  bids: any,
  fromCoinMint: string,
  toCoinMint: string,
  amount: string,
  slippage: number
) {
  const fromAmount = parseFloat(amount)

  let fromMint = fromCoinMint
  let toMint = toCoinMint

  if (fromMint === NATIVE_SOL.mintAddress) {
    fromMint = TOKENS.WSOL.mintAddress
  }
  if (toMint === NATIVE_SOL.mintAddress) {
    toMint = TOKENS.WSOL.mintAddress
  }

  if (fromMint === market.quoteMintAddress.toBase58() && toMint === market.baseMintAddress.toBase58()) {
    // buy
    return forecastBuy(market, asks, fromAmount, slippage)
  } else {
    return forecastSell(market, bids, fromAmount, slippage)
  }
}

export function getSwapOutAmount(
  poolInfo: any,
  fromCoinMint: string,
  toCoinMint: string,
  amount: string,
  slippage: number
) {
  const { coin, pc, fees } = poolInfo
  const { swapFeeNumerator, swapFeeDenominator } = fees

  if (fromCoinMint === TOKENS.WSOL.mintAddress) fromCoinMint = NATIVE_SOL.mintAddress
  if (toCoinMint === TOKENS.WSOL.mintAddress) toCoinMint = NATIVE_SOL.mintAddress

  if (fromCoinMint === coin.mintAddress && toCoinMint === pc.mintAddress) {
    // coin2pc
    const fromAmount = new TokenAmount(amount, coin.decimals, false)
    const fromAmountWithFee = fromAmount.wei
      .multipliedBy(swapFeeDenominator - swapFeeNumerator)
      .dividedBy(swapFeeDenominator)

    const denominator = coin.balance.wei.plus(fromAmountWithFee)
    const amountOut = pc.balance.wei.multipliedBy(fromAmountWithFee).dividedBy(denominator)
    const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100)

    const outBalance = pc.balance.wei.minus(amountOut)
    const beforePrice = new TokenAmount(
      parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
      pc.decimals,
      false
    )
    const afterPrice = new TokenAmount(
      parseFloat(new TokenAmount(outBalance, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(denominator, coin.decimals).fixed()),
      pc.decimals,
      false
    )
    const priceImpact =
      Math.abs((parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) / parseFloat(beforePrice.fixed())) *
      100

    return {
      amountIn: fromAmount,
      amountOut: new TokenAmount(amountOut, pc.decimals),
      amountOutWithSlippage: new TokenAmount(amountOutWithSlippage, pc.decimals),
      priceImpact
    }
  } else {
    // pc2coin
    const fromAmount = new TokenAmount(amount, pc.decimals, false)
    const fromAmountWithFee = fromAmount.wei
      .multipliedBy(swapFeeDenominator - swapFeeNumerator)
      .dividedBy(swapFeeDenominator)

    const denominator = pc.balance.wei.plus(fromAmountWithFee)
    const amountOut = coin.balance.wei.multipliedBy(fromAmountWithFee).dividedBy(denominator)
    const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100)

    const outBalance = coin.balance.wei.minus(amountOut)

    const beforePrice = new TokenAmount(
      parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
      pc.decimals,
      false
    )
    const afterPrice = new TokenAmount(
      parseFloat(new TokenAmount(denominator, pc.decimals).fixed()) /
        parseFloat(new TokenAmount(outBalance, coin.decimals).fixed()),
      pc.decimals,
      false
    )
    const priceImpact =
      Math.abs((parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) / parseFloat(beforePrice.fixed())) *
      100

    return {
      amountIn: fromAmount,
      amountOut: new TokenAmount(amountOut, coin.decimals),
      amountOutWithSlippage: new TokenAmount(amountOutWithSlippage, coin.decimals),
      priceImpact
    }
  }
}

export function getSwapInAmount(
  poolInfo: any,
  fromCoinMint: string,
  toCoinMint: string,
  amount: string,
  slippage: number
) {
  const { coin, pc, fees } = poolInfo
  const { swapFeeNumerator, swapFeeDenominator } = fees

  const amountOut = parseFloat(amount)

  let amountIn = 0
  let amountInWithFee = 0
  let afterPrice = 0
  const y = parseFloat(coin.balance.fixed())
  const x = parseFloat(pc.balance.fixed())
  const beforePrice = x / y

  // (x+delta_x)*(y+delta_y)=x*y
  if (fromCoinMint === coin.mintAddress && toCoinMint === pc.mintAddress) {
    // coin2pc
    amountIn = (amountOut * y) / (x - amountOut)
    amountInWithFee = amountIn * (1 + swapFeeNumerator / swapFeeDenominator)
    afterPrice = (y + amountInWithFee) / (x - amountOut)
  } else {
    // pc2coin
    amountIn = (x * amountOut) / (y - amountOut)
    amountInWithFee = amountIn * (1 + swapFeeNumerator / swapFeeDenominator)
    afterPrice = (y - amountInWithFee) / (x + amountOut)
  }

  const amountInWithSlippage = amountInWithFee / (1 + slippage / 100)
  const priceImpact = Math.abs(((beforePrice - afterPrice) / beforePrice) * 100)

  return {
    amountIn: new TokenAmount(amountIn * 10 ** 6, 6),
    amountOut: new TokenAmount(amountOut * 10 ** 6, 6),
    amountOutWithSlippage: new TokenAmount(amountInWithSlippage * 10 ** pc.decimals, pc.decimals),
    priceImpact
  }
}

export function getSwapOutAmountStable(
  poolInfo: any,
  fromCoinMint: string,
  toCoinMint: string,
  amount: string,
  slippage: number
) {
  if (poolInfo.modelData === undefined)
    return {
      amountIn: new TokenAmount(0),
      amountOut: new TokenAmount(0),
      amountOutWithSlippage: new TokenAmount(0),
      priceImpact: 0
    }
  const { coin, pc, fees, currentK } = poolInfo
  const { swapFeeNumerator, swapFeeDenominator } = fees

  const amountIn = new TokenAmount(amount, coin.decimals, false)
    .toEther()
    .multipliedBy(swapFeeDenominator - swapFeeNumerator)
    .dividedBy(swapFeeDenominator)

  const coinBalance: BigNumber = coin.balance.toEther()
  const pcBalance: BigNumber = pc.balance.toEther()

  let inDecimals
  let outDecimals
  let amountOut = 0

  let beforePrice, afterPrice
  if (fromCoinMint === coin.mintAddress) {
    amountOut = amountIn.isNaN()
      ? 0
      : Math.abs(getDyByDxBaseIn(poolInfo.modelData, coinBalance.toNumber(), pcBalance.toNumber(), amountIn.toNumber()))
    amountOut = amountOut > pcBalance.toNumber() ? pcBalance.toNumber() : amountOut
    inDecimals = coin.decimals
    outDecimals = pc.decimals
    console.log(
      'from to',
      amountIn.toFixed(),
      amountOut.toFixed(),
      getBigNumber(coinBalance),
      getBigNumber(pcBalance),
      getBigNumber(amountIn),
      getBigNumber(currentK)
    )

    beforePrice = getStablePrice(poolInfo.modelData, coinBalance.toNumber(), pcBalance.toNumber(), true)
    const afterCoinBalance = coinBalance.plus(amountIn)
    const afterPcBalance = pcBalance.minus(amountOut)
    afterPrice = getStablePrice(poolInfo.modelData, afterCoinBalance.toNumber(), afterPcBalance.toNumber(), true)
  } else if (toCoinMint === coin.mintAddress) {
    amountOut = amountIn.isNaN()
      ? 0
      : Math.abs(getDxByDyBaseIn(poolInfo.modelData, coinBalance.toNumber(), pcBalance.toNumber(), amountIn.toNumber()))
    amountOut = amountOut > coinBalance.toNumber() ? coinBalance.toNumber() : amountOut
    inDecimals = pc.decimals
    outDecimals = coin.decimals
    console.log(
      'to from',
      amountIn.toFixed(),
      amountOut.toFixed(),
      getBigNumber(coinBalance),
      getBigNumber(pcBalance),
      getBigNumber(amountIn),
      getBigNumber(currentK)
    )

    beforePrice = getStablePrice(poolInfo.modelData, coinBalance.toNumber(), pcBalance.toNumber(), false)
    const afterCoinBalance = coinBalance.minus(amountIn)
    const afterPcBalance = pcBalance.plus(amountOut)
    afterPrice = getStablePrice(poolInfo.modelData, afterCoinBalance.toNumber(), afterPcBalance.toNumber(), false)
  }

  const amountOutWithSlippage = getBigNumber(amountOut) / (1 + slippage / 100)

  if (!beforePrice) beforePrice = 0
  if (!afterPrice) afterPrice = 0

  const priceImpact = Math.abs(((beforePrice - afterPrice) / beforePrice) * 100)

  return {
    amountIn: new TokenAmount(amountIn.multipliedBy(10 ** inDecimals), inDecimals),
    amountOut: new TokenAmount(new BigNumber(amountOut).multipliedBy(10 ** outDecimals), outDecimals),
    amountOutWithSlippage: new TokenAmount(amountOutWithSlippage * 10 ** pc.decimals, pc.decimals),
    priceImpact
  }
}

export function getSwapRouter(poolInfos: LiquidityPoolInfo[], fromCoinMint: string, toCoinMint: string) {
  const routerCoinDefault = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
    '11111111111111111111111111111111', // SOL
    'So11111111111111111111111111111111111111112', // WSOL
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
    'Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS', // PAI
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // stSOL
    'USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX', // USDH
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs' // ETH
  ]
  const ret: [LiquidityPoolInfo, LiquidityPoolInfo][] = []
  const avaPools: LiquidityPoolInfo[] = []
  for (const p of poolInfos) {
    if (!([4, 5].includes(p.version) && p.status === 1)) continue
    if ([fromCoinMint, toCoinMint].includes(p.coin.mintAddress) && routerCoinDefault.includes(p.pc.mintAddress)) {
      avaPools.push(p)
    } else if (
      [fromCoinMint, toCoinMint].includes(p.pc.mintAddress) &&
      routerCoinDefault.includes(p.coin.mintAddress)
    ) {
      avaPools.push(p)
    }
  }

  for (const p1 of avaPools) {
    if (p1.coin.mintAddress === fromCoinMint) {
      const poolInfo = avaPools.filter(
        (p2: any) =>
          p1.ammId !== p2.ammId &&
          ((p2.pc.mintAddress === p1.pc.mintAddress && p2.coin.mintAddress === toCoinMint) ||
            (p2.coin.mintAddress === p1.pc.mintAddress && p2.pc.mintAddress === toCoinMint))
      )
      for (const aP of poolInfo) {
        ret.push([p1, aP])
      }
    } else if (p1.pc.mintAddress === fromCoinMint) {
      const poolInfo = avaPools.filter(
        (p2: any) =>
          p1.ammId !== p2.ammId &&
          ((p2.pc.mintAddress === p1.coin.mintAddress && p2.coin.mintAddress === toCoinMint) ||
            (p2.coin.mintAddress === p1.coin.mintAddress && p2.pc.mintAddress === toCoinMint))
      )
      for (const aP of poolInfo) {
        ret.push([p1, aP])
      }
    }
  }
  return ret
}

export function forecastBuy(market: any, orderBook: any, pcIn: any, slippage: number) {
  let coinOut = 0
  let bestPrice = null
  let worstPrice = 0
  let availablePc = pcIn

  for (const { key, quantity } of orderBook.items(false)) {
    const price = market?.priceLotsToNumber(key.ushrn(64)) || 0
    const size = market?.baseSizeLotsToNumber(quantity) || 0

    if (!bestPrice && price !== 0) {
      bestPrice = price
    }

    const orderPcValue = price * size
    worstPrice = price

    if (orderPcValue >= availablePc) {
      coinOut += availablePc / price
      availablePc = 0
      break
    } else {
      coinOut += size
      availablePc -= orderPcValue
    }
  }

  coinOut = coinOut * 0.993

  const priceImpact = ((worstPrice - bestPrice) / bestPrice) * 100

  worstPrice = (worstPrice * (100 + slippage)) / 100
  const amountOutWithSlippage = (coinOut * (100 - slippage)) / 100

  // const avgPrice = (pcIn - availablePc) / coinOut;
  const maxInAllow = pcIn - availablePc

  return {
    side: 'buy' as 'buy' | 'sell',
    maxInAllow,
    amountOut: coinOut,
    amountOutWithSlippage,
    worstPrice,
    priceImpact
  }
}

export function forecastSell(market: any, orderBook: any, coinIn: any, slippage: number) {
  let pcOut = 0
  let bestPrice = null
  let worstPrice = 0
  let availableCoin = coinIn

  for (const { key, quantity } of orderBook.items(true)) {
    const price = market.priceLotsToNumber(key.ushrn(64)) || 0
    const size = market?.baseSizeLotsToNumber(quantity) || 0

    if (!bestPrice && price !== 0) {
      bestPrice = price
    }

    worstPrice = price

    if (availableCoin <= size) {
      pcOut += availableCoin * price
      availableCoin = 0
      break
    } else {
      pcOut += price * size
      availableCoin -= size
    }
  }

  pcOut = pcOut * 0.993

  const priceImpact = ((bestPrice - worstPrice) / bestPrice) * 100

  worstPrice = (worstPrice * (100 - slippage)) / 100
  const amountOutWithSlippage = (pcOut * (100 - slippage)) / 100

  // const avgPrice = pcOut / (coinIn - availableCoin);
  const maxInAllow = coinIn - availableCoin

  return {
    side: 'sell' as 'buy' | 'sell',
    maxInAllow,
    amountOut: pcOut,
    amountOutWithSlippage,
    worstPrice,
    priceImpact
  }
}

export async function swap(
  connection: Connection,
  wallet: any,
  poolInfo: any,
  fromCoinMint: string,
  toCoinMint: string,
  fromTokenAccount: string,
  toTokenAccount: string,
  aIn: string,
  aOut: string,
  wsolAddress: string
) {
  const transaction = new Transaction()
  const signers: Account[] = []

  const owner = wallet.publicKey

  const from = getTokenByMintAddress(fromCoinMint)
  const to = getTokenByMintAddress(toCoinMint)
  if (!from || !to) {
    throw new Error('Miss token info')
  }

  const amountIn = new TokenAmount(aIn, from.decimals, false)
  const amountOut = new TokenAmount(aOut, to.decimals, false)

  if (fromCoinMint === NATIVE_SOL.mintAddress && wsolAddress) {
    transaction.add(
      closeAccount({
        source: new PublicKey(wsolAddress),
        destination: owner,
        owner
      })
    )
  }

  let fromMint = fromCoinMint
  let toMint = toCoinMint

  if (fromMint === NATIVE_SOL.mintAddress) {
    fromMint = TOKENS.WSOL.mintAddress
  }
  if (toMint === NATIVE_SOL.mintAddress) {
    toMint = TOKENS.WSOL.mintAddress
  }

  let wrappedSolAccount: PublicKey | null = null
  let wrappedSolAccount2: PublicKey | null = null
  let newFromTokenAccount = PublicKey.default
  let newToTokenAccount = PublicKey.default

  if (fromCoinMint === NATIVE_SOL.mintAddress) {
    wrappedSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      getBigNumber(amountIn.wei) + 1e7,
      transaction,
      signers
    )
  } else {
    newFromTokenAccount = await createAssociatedTokenAccountIfNotExist(fromTokenAccount, owner, fromMint, transaction)
  }

  if (toCoinMint === NATIVE_SOL.mintAddress) {
    wrappedSolAccount2 = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount2,
      owner,
      TOKENS.WSOL.mintAddress,
      1e7,
      transaction,
      signers
    )
  } else {
    newToTokenAccount = await createAssociatedTokenAccountIfNotExist(toTokenAccount, owner, toMint, transaction)
  }

  transaction.add(
    poolInfo.version !== 5
      ? swapInstruction(
          new PublicKey(poolInfo.programId),
          new PublicKey(poolInfo.ammId),
          new PublicKey(poolInfo.ammAuthority),
          new PublicKey(poolInfo.ammOpenOrders),
          new PublicKey(poolInfo.ammTargetOrders),
          new PublicKey(poolInfo.poolCoinTokenAccount),
          new PublicKey(poolInfo.poolPcTokenAccount),
          new PublicKey(poolInfo.serumProgramId),
          new PublicKey(poolInfo.serumMarket),
          new PublicKey(poolInfo.serumBids),
          new PublicKey(poolInfo.serumAsks),
          new PublicKey(poolInfo.serumEventQueue),
          new PublicKey(poolInfo.serumCoinVaultAccount),
          new PublicKey(poolInfo.serumPcVaultAccount),
          new PublicKey(poolInfo.serumVaultSigner),
          wrappedSolAccount ?? newFromTokenAccount,
          wrappedSolAccount2 ?? newToTokenAccount,
          owner,
          Math.floor(getBigNumber(amountIn.toWei())),
          Math.floor(getBigNumber(amountOut.toWei()))
        )
      : swapStableBaseInInstruction(
          new PublicKey(poolInfo.programId),
          new PublicKey(poolInfo.ammId),
          new PublicKey(poolInfo.ammAuthority),
          new PublicKey(poolInfo.ammOpenOrders),
          new PublicKey(poolInfo.poolCoinTokenAccount),
          new PublicKey(poolInfo.poolPcTokenAccount),
          new PublicKey(poolInfo.modelDataAccount),
          new PublicKey(poolInfo.serumProgramId),
          new PublicKey(poolInfo.serumMarket),
          new PublicKey(poolInfo.serumBids),
          new PublicKey(poolInfo.serumAsks),
          new PublicKey(poolInfo.serumEventQueue),
          new PublicKey(poolInfo.serumCoinVaultAccount),
          new PublicKey(poolInfo.serumPcVaultAccount),
          new PublicKey(poolInfo.serumVaultSigner),
          wrappedSolAccount ?? newFromTokenAccount,
          wrappedSolAccount2 ?? newToTokenAccount,
          owner,
          Math.floor(getBigNumber(amountIn.toWei())),
          Math.floor(getBigNumber(amountOut.toWei()))
        )
  )

  if (wrappedSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount,
        destination: owner,
        owner
      })
    )
  }
  if (wrappedSolAccount2) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount2,
        destination: owner,
        owner
      })
    )
  }

  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function preSwapRoute(
  connection: Connection,
  wallet: any,
  fromMint: string,
  fromTokenAccount: string,
  middleMint: string,
  middleTokenAccount: string,
  toMint: string,
  toTokenAccount: string,
  needWrapAmount: number
) {
  const transaction = new Transaction()
  const signers: Account[] = []
  const owner = wallet.publicKey
  console.log('needWrapAmount:', needWrapAmount)
  if (fromMint === TOKENS.WSOL.mintAddress || fromMint === NATIVE_SOL.mintAddress) {
    await createAtaSolIfNotExistAndWrap(connection, fromTokenAccount, owner, transaction, signers, needWrapAmount)
  }
  if (middleMint === NATIVE_SOL.mintAddress) middleMint = TOKENS.WSOL.mintAddress
  if (toMint === NATIVE_SOL.mintAddress) toMint = TOKENS.WSOL.mintAddress

  await createAssociatedTokenAccountIfNotExist(middleTokenAccount, owner, middleMint, transaction)

  await createAssociatedTokenAccountIfNotExist(toTokenAccount, owner, toMint, transaction)

  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function swapRoute(
  connection: Connection,
  wallet: any,
  poolInfoA: any,
  poolInfoB: any,
  routerInfo: RouterInfoItem,
  fromTokenAccount: string,
  middleTokenAccount: string,
  toTokenAccount: string,
  aIn: string,
  aOut: string
) {
  const transaction = new Transaction()

  const owner = wallet.publicKey

  const fromCoinMint = routerInfo.route[0].mintA
  const toCoinMint = routerInfo.route[1].mintB

  const from = getTokenByMintAddress(fromCoinMint)
  const middle = getTokenByMintAddress(routerInfo.middle_coin)
  const to = getTokenByMintAddress(toCoinMint)
  if (!from || !middle || !to) {
    throw new Error('Miss token info')
  }

  const amountIn = new TokenAmount(aIn, from.decimals, false)
  const amountOut = new TokenAmount(aOut, to.decimals, false)

  let fromMint = fromCoinMint
  let toMint = toCoinMint
  let middleMint = routerInfo.middle_coin

  if (fromMint === NATIVE_SOL.mintAddress) fromMint = TOKENS.WSOL.mintAddress
  if (middleMint === NATIVE_SOL.mintAddress) middleMint = TOKENS.WSOL.mintAddress
  if (toMint === NATIVE_SOL.mintAddress) toMint = TOKENS.WSOL.mintAddress

  const newFromTokenAccount = new PublicKey(fromTokenAccount)
  const newMiddleTokenAccount = new PublicKey(middleTokenAccount)
  const newToTokenAccount = new PublicKey(toTokenAccount)

  const { publicKey } = await findProgramAddress(
    [new PublicKey(poolInfoA.ammId).toBuffer(), new PublicKey(middleMint).toBuffer(), owner.toBuffer()],
    new PublicKey(ROUTE_SWAP_PROGRAM_ID)
  )
  if (poolInfoA.version === 4)
    transaction.add(
      routeSwapInInstruction(
        new PublicKey(ROUTE_SWAP_PROGRAM_ID),
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
        new PublicKey(poolInfoA.ammId),
        new PublicKey(poolInfoB.ammId),
        new PublicKey(poolInfoA.ammAuthority),
        new PublicKey(poolInfoA.ammOpenOrders),
        new PublicKey(poolInfoA.poolCoinTokenAccount),
        new PublicKey(poolInfoA.poolPcTokenAccount),
        new PublicKey(poolInfoA.serumProgramId),
        new PublicKey(poolInfoA.serumMarket),
        new PublicKey(poolInfoA.serumBids),
        new PublicKey(poolInfoA.serumAsks),
        new PublicKey(poolInfoA.serumEventQueue),
        new PublicKey(poolInfoA.serumCoinVaultAccount),
        new PublicKey(poolInfoA.serumPcVaultAccount),
        new PublicKey(poolInfoA.serumVaultSigner),

        newFromTokenAccount,
        newMiddleTokenAccount,
        publicKey,
        owner,
        Math.floor(getBigNumber(amountIn.toWei())),
        Math.floor(getBigNumber(amountOut.toWei()))
      )
    )
  if (poolInfoA.version === 5)
    transaction.add(
      routeStableSwapInInstruction(
        new PublicKey(ROUTE_SWAP_PROGRAM_ID),
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V5),
        new PublicKey(poolInfoA.ammId),
        new PublicKey(poolInfoB.ammId),
        new PublicKey(poolInfoA.ammAuthority),
        new PublicKey(poolInfoA.ammOpenOrders),
        new PublicKey(poolInfoA.poolCoinTokenAccount),
        new PublicKey(poolInfoA.poolPcTokenAccount),
        new PublicKey(poolInfoA.modelDataAccount),
        new PublicKey(poolInfoA.serumProgramId),
        new PublicKey(poolInfoA.serumMarket),
        new PublicKey(poolInfoA.serumBids),
        new PublicKey(poolInfoA.serumAsks),
        new PublicKey(poolInfoA.serumEventQueue),
        new PublicKey(poolInfoA.poolCoinTokenAccount),
        new PublicKey(poolInfoA.poolPcTokenAccount),
        PublicKey.default,
        // new PublicKey(poolInfoA.serumCoinVaultAccount),
        // new PublicKey(poolInfoA.serumPcVaultAccount),
        // new PublicKey(poolInfoA.serumVaultSigner),

        newFromTokenAccount,
        newMiddleTokenAccount,
        publicKey,
        owner,
        Math.floor(getBigNumber(amountIn.toWei())),
        Math.floor(getBigNumber(amountOut.toWei()))
      )
    )
  if (poolInfoB.version === 4)
    transaction.add(
      routeSwapOutInstruction(
        new PublicKey(ROUTE_SWAP_PROGRAM_ID),
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
        new PublicKey(poolInfoA.ammId),
        new PublicKey(poolInfoB.ammId),
        new PublicKey(poolInfoB.ammAuthority),
        new PublicKey(poolInfoB.ammOpenOrders),
        new PublicKey(poolInfoB.poolCoinTokenAccount),
        new PublicKey(poolInfoB.poolPcTokenAccount),
        new PublicKey(poolInfoB.serumProgramId),
        new PublicKey(poolInfoB.serumMarket),
        new PublicKey(poolInfoB.serumBids),
        new PublicKey(poolInfoB.serumAsks),
        new PublicKey(poolInfoB.serumEventQueue),
        new PublicKey(poolInfoB.serumCoinVaultAccount),
        new PublicKey(poolInfoB.serumPcVaultAccount),
        new PublicKey(poolInfoB.serumVaultSigner),
        newMiddleTokenAccount,
        newToTokenAccount,
        publicKey,
        owner
      )
    )
  if (poolInfoB.version === 5)
    transaction.add(
      routeStableSwapOutInstruction(
        new PublicKey(ROUTE_SWAP_PROGRAM_ID),
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V5),
        new PublicKey(poolInfoA.ammId),
        new PublicKey(poolInfoB.ammId),
        new PublicKey(poolInfoB.ammAuthority),
        new PublicKey(poolInfoB.ammOpenOrders),
        new PublicKey(poolInfoB.poolCoinTokenAccount),
        new PublicKey(poolInfoB.poolPcTokenAccount),
        new PublicKey(poolInfoB.modelDataAccount),
        new PublicKey(poolInfoB.serumProgramId),
        new PublicKey(poolInfoB.serumMarket),
        new PublicKey(poolInfoB.serumBids),
        new PublicKey(poolInfoB.serumAsks),
        new PublicKey(poolInfoB.serumEventQueue),
        new PublicKey(poolInfoB.poolCoinTokenAccount),
        new PublicKey(poolInfoB.poolPcTokenAccount),
        PublicKey.default,
        // new PublicKey(poolInfoB.serumCoinVaultAccount),
        // new PublicKey(poolInfoB.serumPcVaultAccount),
        // new PublicKey(poolInfoB.serumVaultSigner),
        newMiddleTokenAccount,
        newToTokenAccount,
        publicKey,
        owner
      )
    )
  return await sendTransaction(connection, wallet, transaction)
}

export async function swapRouteOld(
  connection: Connection,
  wallet: any,
  poolInfoA: any,
  poolInfoB: any,
  routerInfo: RouterInfoItem,
  fromTokenAccount: string,
  middleTokenAccount: string,
  toTokenAccount: string,
  aIn: string,
  aMiddle: string,
  aOut: string
) {
  const transaction = new Transaction()

  const owner = wallet.publicKey

  const fromCoinMint = routerInfo.route[0].mintA
  const toCoinMint = routerInfo.route[1].mintB

  const from = getTokenByMintAddress(fromCoinMint)
  const middle = getTokenByMintAddress(routerInfo.middle_coin)
  const to = getTokenByMintAddress(toCoinMint)
  if (!from || !middle || !to) {
    throw new Error('Miss token info')
  }

  const amountIn = new TokenAmount(aIn, from.decimals, false)
  const amountMiddle = new TokenAmount(aMiddle, middle.decimals, false)
  const amountOut = new TokenAmount(aOut, to.decimals, false)

  let fromMint = fromCoinMint
  let toMint = toCoinMint
  let middleMint = routerInfo.middle_coin

  if (fromMint === NATIVE_SOL.mintAddress) {
    fromMint = TOKENS.WSOL.mintAddress
  }
  if (middleMint === NATIVE_SOL.mintAddress) {
    middleMint = TOKENS.WSOL.mintAddress
  }
  if (toMint === NATIVE_SOL.mintAddress) {
    toMint = TOKENS.WSOL.mintAddress
  }

  let wrappedSolAccount: PublicKey | null = null
  let wrappedSolAccount2: PublicKey | null = null
  let wrappedSolAccount3: PublicKey | null = null

  if (fromCoinMint === NATIVE_SOL.mintAddress) {
    wrappedSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      getBigNumber(amountIn.wei) + 1e7,
      transaction,
      []
    )
  }
  if (middleMint === NATIVE_SOL.mintAddress) {
    wrappedSolAccount2 = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount2,
      owner,
      TOKENS.WSOL.mintAddress,
      1e7,
      transaction,
      []
    )
  }

  if (toCoinMint === NATIVE_SOL.mintAddress) {
    wrappedSolAccount3 = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount3,
      owner,
      TOKENS.WSOL.mintAddress,
      1e7,
      transaction,
      []
    )
  }

  const newFromTokenAccount = await createAssociatedTokenAccountIfNotExist(
    fromTokenAccount,
    owner,
    fromMint,
    transaction
  )

  const newMiddleTokenAccount = await createAssociatedTokenAccountIfNotExist(
    middleTokenAccount,
    owner,
    middleMint,
    transaction
  )

  const newToTokenAccount = await createAssociatedTokenAccountIfNotExist(toTokenAccount, owner, toMint, transaction)

  transaction.add(
    swapInstruction(
      new PublicKey(poolInfoA.programId),
      new PublicKey(poolInfoA.ammId),
      new PublicKey(poolInfoA.ammAuthority),
      new PublicKey(poolInfoA.ammOpenOrders),
      new PublicKey(poolInfoA.ammTargetOrders),
      new PublicKey(poolInfoA.poolCoinTokenAccount),
      new PublicKey(poolInfoA.poolPcTokenAccount),
      new PublicKey(poolInfoA.serumProgramId),
      new PublicKey(poolInfoA.serumMarket),
      new PublicKey(poolInfoA.serumBids),
      new PublicKey(poolInfoA.serumAsks),
      new PublicKey(poolInfoA.serumEventQueue),
      new PublicKey(poolInfoA.serumCoinVaultAccount),
      new PublicKey(poolInfoA.serumPcVaultAccount),
      new PublicKey(poolInfoA.serumVaultSigner),
      wrappedSolAccount ?? newFromTokenAccount,
      wrappedSolAccount2 ?? newMiddleTokenAccount,
      owner,
      Math.floor(getBigNumber(amountIn.toWei())),
      Math.floor(getBigNumber(amountMiddle.toWei()))
    ),
    swapInstruction(
      new PublicKey(poolInfoB.programId),
      new PublicKey(poolInfoB.ammId),
      new PublicKey(poolInfoB.ammAuthority),
      new PublicKey(poolInfoB.ammOpenOrders),
      new PublicKey(poolInfoB.ammTargetOrders),
      new PublicKey(poolInfoB.poolCoinTokenAccount),
      new PublicKey(poolInfoB.poolPcTokenAccount),
      new PublicKey(poolInfoB.serumProgramId),
      new PublicKey(poolInfoB.serumMarket),
      new PublicKey(poolInfoB.serumBids),
      new PublicKey(poolInfoB.serumAsks),
      new PublicKey(poolInfoB.serumEventQueue),
      new PublicKey(poolInfoB.serumCoinVaultAccount),
      new PublicKey(poolInfoB.serumPcVaultAccount),
      new PublicKey(poolInfoB.serumVaultSigner),
      wrappedSolAccount2 ?? newMiddleTokenAccount,
      wrappedSolAccount3 ?? newToTokenAccount,
      owner,
      Math.floor(getBigNumber(amountMiddle.toWei())),
      Math.floor(getBigNumber(amountOut.toWei()))
    )
  )

  if (wrappedSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount,
        destination: owner,
        owner
      })
    )
  }
  if (wrappedSolAccount2) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount2,
        destination: owner,
        owner
      })
    )
  }

  if (wrappedSolAccount3) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount3,
        destination: owner,
        owner
      })
    )
  }

  return await sendTransaction(connection, wallet, transaction)
}

export async function place(
  connection: Connection,
  wallet: any,
  market: Market,
  fromCoinMint: string,
  toCoinMint: string,
  fromTokenAccount: string,
  toTokenAccount: string,
  side: 'buy' | 'sell' | null,
  maxInAllow: string,
  amountOut: string,
  worstPrice: number | null
) {
  if (!side || !worstPrice) throw new Error('Miss side')

  const transaction = new Transaction()
  const signers: Account[] = []

  const owner = wallet.publicKey

  const openOrdersAccounts = await market.findOpenOrdersAccountsForOwner(connection, owner, 0)

  // const useFeeDiscountPubkey: PublicKey | null
  const openOrdersAddress: PublicKey = await createProgramAccountIfNotExist(
    connection,
    // @ts-ignore
    openOrdersAccounts.length === 0 ? null : openOrdersAccounts[0].address.toBase58(),
    owner,
    new PublicKey(SERUM_PROGRAM_ID_V3),
    null,
    _OPEN_ORDERS_LAYOUT_V2,
    transaction,
    signers
  )

  let wrappedSolAccount: PublicKey | null = null

  if (fromCoinMint === NATIVE_SOL.mintAddress) {
    let lamports
    if (side === 'buy') {
      lamports = Math.round(worstPrice * Number(amountOut) * 1.01 * LAMPORTS_PER_SOL)
      if (openOrdersAccounts.length > 0) {
        lamports -= getBigNumber(openOrdersAccounts[0].quoteTokenFree)
      }
    } else {
      lamports = Math.round(Number(maxInAllow) * LAMPORTS_PER_SOL)
      if (openOrdersAccounts.length > 0) {
        lamports -= getBigNumber(openOrdersAccounts[0].baseTokenFree)
      }
    }
    lamports = Math.max(lamports, 0) + 1e7

    wrappedSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      lamports,
      transaction,
      signers
    )
  }

  transaction.add(
    market.makePlaceOrderInstruction(connection, {
      owner,
      payer: wrappedSolAccount ?? new PublicKey(fromTokenAccount),
      // @ts-ignore
      side,
      price: worstPrice,
      size: side === 'buy' ? parseFloat(Number(amountOut).toFixed(6)) : parseFloat(Number(maxInAllow).toFixed(6)),
      orderType: 'ioc',
      openOrdersAddressKey: openOrdersAddress
      // feeDiscountPubkey: useFeeDiscountPubkey
    })
  )

  if (wrappedSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedSolAccount,
        destination: owner,
        owner
      })
    )
  }

  let fromMint = fromCoinMint
  let toMint = toCoinMint

  if (fromMint === NATIVE_SOL.mintAddress) {
    fromMint = TOKENS.WSOL.mintAddress
  }
  if (toMint === NATIVE_SOL.mintAddress) {
    toMint = TOKENS.WSOL.mintAddress
  }

  const newFromTokenAccount = await createAssociatedTokenAccountIfNotExist(
    fromTokenAccount,
    owner,
    fromMint,
    transaction
  )
  const newToTokenAccount = await createAssociatedTokenAccountIfNotExist(toTokenAccount, owner, toMint, transaction)

  const userAccounts = [newFromTokenAccount, newToTokenAccount]
  if (market.baseMintAddress.toBase58() === toMint && market.quoteMintAddress.toBase58() === fromMint) {
    userAccounts.reverse()
  }
  const baseTokenAccount = userAccounts[0]
  const quoteTokenAccount = userAccounts[1]

  let referrerQuoteWallet: PublicKey | null = null
  if (market.supportsReferralFees) {
    const quoteToken = getTokenByMintAddress(market.quoteMintAddress.toBase58())
    if (quoteToken?.referrer) {
      referrerQuoteWallet = new PublicKey(quoteToken?.referrer)
    }
  }

  const settleTransactions = await market.makeSettleFundsTransaction(
    connection,
    new OpenOrders(openOrdersAddress, { owner }, new PublicKey(SERUM_PROGRAM_ID_V3)),
    baseTokenAccount,
    quoteTokenAccount,
    referrerQuoteWallet
  )

  return await sendTransaction(connection, wallet, mergeTransactions([transaction, settleTransactions.transaction]), [
    ...signers,
    ...settleTransactions.signers
  ])
}

export function swapInstruction(
  programId: PublicKey,
  // tokenProgramId: PublicKey,
  // amm
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  ammTargetOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  // serum
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey,
  serumEventQueue: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,
  // user
  userSourceTokenAccount: PublicKey,
  userDestTokenAccount: PublicKey,
  userOwner: PublicKey,

  amountIn: number,
  minAmountOut: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amountIn'), nu64('minAmountOut')])

  const keys = [
    // spl token
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    // amm
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 9,
      amountIn,
      minAmountOut
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function swapStableBaseInInstruction(
  programId: PublicKey,
  // tokenProgramId: PublicKey,
  // amm
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  modelDataAccount: PublicKey,
  // serum
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey,
  serumEventQueue: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,
  // user
  userSourceTokenAccount: PublicKey,
  userDestTokenAccount: PublicKey,
  userOwner: PublicKey,

  amountIn: number,
  minAmountOut: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amountIn'), nu64('minAmountOut')])

  const keys = [
    // spl token
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    // amm
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: modelDataAccount, isSigner: false, isWritable: false },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 9,
      amountIn,
      minAmountOut
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function routeSwapInInstruction(
  programId: PublicKey,
  ammProgramId: PublicKey,
  fromAmmId: PublicKey,
  toAmmId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  // serum

  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey,
  serumEventQueue: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,

  // user
  userSourceTokenAccount: PublicKey,
  userMiddleTokenAccount: PublicKey,
  userPdaAccount: PublicKey,
  userOwner: PublicKey,
  amountIn: number,
  minimunAmountOut: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amountIn'), nu64('minimunAmountOut')])

  const keys = [
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    // spl token
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },

    // amm
    { pubkey: ammProgramId, isSigner: false, isWritable: false },
    { pubkey: fromAmmId, isSigner: false, isWritable: true },
    { pubkey: toAmmId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },

    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPdaAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 0,
      amountIn,
      minimunAmountOut
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function routeSwapOutInstruction(
  programId: PublicKey,
  ammProgramId: PublicKey,
  fromAmmId: PublicKey,
  toAmmId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  // serum

  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey,
  serumEventQueue: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,

  // user
  userMiddleTokenAccount: PublicKey,
  userDestTokenAccount: PublicKey,
  userPdaAccount: PublicKey,
  userOwner: PublicKey
): TransactionInstruction {
  const dataLayout = struct([u8('instruction')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },

    // amm
    { pubkey: ammProgramId, isSigner: false, isWritable: false },
    { pubkey: fromAmmId, isSigner: false, isWritable: true },
    { pubkey: toAmmId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },

    { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPdaAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 1
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function routeStableSwapInInstruction(
  programId: PublicKey,
  ammProgramId: PublicKey,
  fromAmmId: PublicKey,
  toAmmId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  modelDataAccount: PublicKey,
  // serum
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey,
  serumEventQueue: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,
  // user
  userSourceTokenAccount: PublicKey,
  userMiddleTokenAccount: PublicKey,
  userPdaAccount: PublicKey,
  userOwner: PublicKey,
  amountIn: number,
  minimunAmountOut: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), nu64('amountIn'), nu64('minimunAmountOut')])

  const keys = [
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    // spl token
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },

    // amm
    { pubkey: ammProgramId, isSigner: false, isWritable: false },
    { pubkey: fromAmmId, isSigner: false, isWritable: true },
    { pubkey: toAmmId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: modelDataAccount, isSigner: false, isWritable: true },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },

    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPdaAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 2,
      amountIn,
      minimunAmountOut
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function routeStableSwapOutInstruction(
  programId: PublicKey,
  ammProgramId: PublicKey,
  fromAmmId: PublicKey,
  toAmmId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  modelDataAccount: PublicKey,
  // serum
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey,
  serumEventQueue: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumVaultSigner: PublicKey,
  // user
  userMiddleTokenAccount: PublicKey,
  userDestTokenAccount: PublicKey,
  userPdaAccount: PublicKey,
  userOwner: PublicKey
): TransactionInstruction {
  const dataLayout = struct([u8('instruction')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },

    // amm
    { pubkey: ammProgramId, isSigner: false, isWritable: false },
    { pubkey: fromAmmId, isSigner: false, isWritable: true },
    { pubkey: toAmmId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: modelDataAccount, isSigner: false, isWritable: true },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: false },

    { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userPdaAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 3
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

export function transfer(source: PublicKey, destination: PublicKey, owner: PublicKey, amount: number) {
  const dataLayout = struct([u8('instruction'), nu64('amount')])

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ]

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 3,
      amount
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId: TOKEN_PROGRAM_ID,
    data
  })
}

export function memoInstruction(memo: string) {
  return new TransactionInstruction({
    keys: [],
    data: Buffer.from(memo, 'utf-8'),
    programId: MEMO_PROGRAM_ID
  })
}
export async function checkUnsettledInfo(connection: Connection, wallet: any, market: Market) {
  if (!wallet) return
  const owner = wallet.publicKey
  if (!owner) return
  const openOrderss = await market?.findOpenOrdersAccountsForOwner(connection, owner, 1000)
  if (!openOrderss?.length) return
  const baseTotalAmount = market.baseSplSizeToNumber(openOrderss[0].baseTokenTotal)
  const quoteTotalAmount = market.quoteSplSizeToNumber(openOrderss[0].quoteTokenTotal)
  const baseUnsettledAmount = market.baseSplSizeToNumber(openOrderss[0].baseTokenFree)
  const quoteUnsettledAmount = market.quoteSplSizeToNumber(openOrderss[0].quoteTokenFree)
  return {
    baseSymbol: getTokenByMintAddress(market.baseMintAddress.toString())?.symbol,
    quoteSymbol: getTokenByMintAddress(market.quoteMintAddress.toString())?.symbol,
    baseTotalAmount,
    quoteTotalAmount,
    baseUnsettledAmount,
    quoteUnsettledAmount,
    openOrders: openOrderss[0]
  }
}

export async function settleFund(
  connection: Connection,
  market: Market,
  openOrders: OpenOrders,
  wallet: any,
  baseMint: string,
  quoteMint: string,
  baseWallet: string,
  quoteWallet: string
) {
  const tx = new Transaction()
  const signs: Account[] = []

  const owner = wallet.publicKey

  let wrappedBaseAccount
  let wrappedQuoteAccount

  if (baseMint === TOKENS.WSOL.mintAddress) {
    wrappedBaseAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedBaseAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      1e7,
      tx,
      signs
    )
  }
  if (quoteMint === TOKENS.WSOL.mintAddress) {
    wrappedQuoteAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedQuoteAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      1e7,
      tx,
      signs
    )
  }

  const quoteToken = getTokenByMintAddress(quoteMint)

  const { transaction, signers } = await market.makeSettleFundsTransaction(
    connection,
    openOrders,
    wrappedBaseAccount ?? new PublicKey(baseWallet),
    wrappedQuoteAccount ?? new PublicKey(quoteWallet),
    quoteToken && quoteToken.referrer ? new PublicKey(quoteToken.referrer) : null
  )

  if (wrappedBaseAccount) {
    transaction.add(
      closeAccount({
        source: wrappedBaseAccount,
        destination: owner,
        owner
      })
    )
  }
  if (wrappedQuoteAccount) {
    transaction.add(
      closeAccount({
        source: wrappedQuoteAccount,
        destination: owner,
        owner
      })
    )
  }

  return await sendTransaction(connection, wallet, mergeTransactions([tx, transaction]), [...signs, ...signers])
}
