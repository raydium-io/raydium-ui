import { Account, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
// @ts-ignore
import { u8, nu64, struct } from 'buffer-layout'
import { Market, OpenOrders, _OPEN_ORDERS_LAYOUT_V2 } from '@project-serum/serum/lib/market'
// eslint-disable-next-line
import { NATIVE_SOL, TOKENS, getTokenByMintAddress } from './tokens'
import {
  createProgramAccountIfNotExist,
  createTokenAccountIfNotExist,
  mergeTransactions,
  sendTransaction
} from '@/utils/web3'
import { TokenAmount } from '@/utils/safe-math'
// eslint-disable-next-line
import { TOKEN_PROGRAM_ID, SERUM_PROGRAM_ID_V3 } from './ids'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'

// 计算金额
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

// 计算 swap 金额
export function getSwapOutAmount(
  poolInfo: any,
  fromCoinMint: string,
  toCoinMint: string,
  amount: string,
  slippage: number
) {
  const { coin, pc, fees } = poolInfo
  const { swapFeeNumerator, swapFeeDenominator } = fees

  let fromMint = fromCoinMint
  let toMint = toCoinMint

  if (fromMint === NATIVE_SOL.mintAddress) {
    fromMint = TOKENS.WSOL.mintAddress
  }
  if (toMint === NATIVE_SOL.mintAddress) {
    toMint = TOKENS.WSOL.mintAddress
  }

  if (fromMint === coin.mintAddress && toMint === pc.mintAddress) {
    // coin2pc
    const fromAmount = new TokenAmount(amount, coin.decimals, false)
    const denominator = coin.balance.wei.plus(fromAmount.wei)
    const amountOut = pc.balance.wei.multipliedBy(fromAmount.wei).dividedBy(denominator)
    const amountOutWithFee = amountOut.dividedBy(swapFeeDenominator).multipliedBy(swapFeeDenominator - swapFeeNumerator)
    const amountOutWithSlippage = amountOutWithFee.dividedBy(100).multipliedBy(100 - slippage)
    return { amountIn: fromAmount, amountOut: new TokenAmount(amountOutWithSlippage, pc.decimals) }
  } else {
    // pc2coin
    const fromAmount = new TokenAmount(amount, pc.decimals, false)
    const denominator = pc.balance.wei.plus(fromAmount.wei)
    const amountOut = coin.balance.wei.multipliedBy(fromAmount.wei).dividedBy(denominator)
    const amountOutWithFee = amountOut.dividedBy(swapFeeDenominator).multipliedBy(swapFeeDenominator - swapFeeNumerator)
    const amountOutWithSlippage = amountOutWithFee.dividedBy(100).multipliedBy(100 - slippage)
    return { amountIn: fromAmount, amountOut: new TokenAmount(amountOutWithSlippage, coin.decimals) }
  }
}

export function forecastBuy(market: any, orderBook: any, pcIn: any, slippage: number) {
  let coinOut = 0
  let worstPrice = 0
  let availablePc = pcIn

  for (const { key, quantity } of orderBook.items(false)) {
    const price = market?.priceLotsToNumber(key.ushrn(64)) || 0
    const size = market?.baseSizeLotsToNumber(quantity) || 0

    const orderPcVaule = price * size
    worstPrice = price

    if (orderPcVaule >= availablePc) {
      coinOut += availablePc / price
      availablePc = 0
      break
    } else {
      coinOut += size
      availablePc -= orderPcVaule
    }
  }

  worstPrice = (worstPrice * (100 + slippage)) / 100
  coinOut = (coinOut * (100 - slippage)) / 100

  // const avgPrice = (pcIn - availablePc) / coinOut;
  const maxInAllow = pcIn - availablePc

  return {
    side: 'buy',
    maxInAllow,
    amountOut: coinOut,
    worstPrice
  }
}

export function forecastSell(market: any, orderBook: any, coinIn: any, slippage: number) {
  let pcOut = 0
  let worstPrice = 0
  let availableCoin = coinIn

  for (const { key, quantity } of orderBook.items(true)) {
    const price = market.priceLotsToNumber(key.ushrn(64)) || 0
    const size = market?.baseSizeLotsToNumber(quantity) || 0

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

  worstPrice = (worstPrice * (100 - slippage)) / 100
  pcOut = (pcOut * (100 - slippage)) / 100

  // const avgPrice = pcOut / (coinIn - availableCoin);
  const maxInAllow = coinIn - availableCoin

  return {
    side: 'sell',
    maxInAllow,
    amountOut: pcOut,
    worstPrice
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
  amount: string,
  slippage: number
) {
  const transaction = new Transaction()
  const signers: Account[] = []

  const owner = wallet.publicKey

  const { amountIn, amountOut } = getSwapOutAmount(poolInfo, fromCoinMint, toCoinMint, amount, slippage)

  let fromMint = fromCoinMint
  let toMint = toCoinMint

  if (fromMint === NATIVE_SOL.mintAddress) {
    fromMint = TOKENS.WSOL.mintAddress
  }
  if (toMint === NATIVE_SOL.mintAddress) {
    toMint = TOKENS.WSOL.mintAddress
  }

  const newFromTokenAccount = await createTokenAccountIfNotExist(
    connection,
    fromTokenAccount,
    owner,
    fromMint,
    null,
    transaction,
    signers
  )
  const newToTokenAccount = await createTokenAccountIfNotExist(
    connection,
    toTokenAccount,
    owner,
    toMint,
    null,
    transaction,
    signers
  )

  transaction.add(
    swapInstruction(
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
      newFromTokenAccount,
      newToTokenAccount,
      owner,
      Math.floor(amountIn.toWei().toNumber()) - 1,
      Math.floor(amountOut.toWei().toNumber()) - 1
    )
  )

  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function place(
  connection: Connection,
  wallet: any,
  market: Market,
  asks: any,
  bids: any,
  fromCoinMint: string,
  toCoinMint: string,
  fromTokenAccount: string,
  toTokenAccount: string,
  amount: string,
  slippage: number
) {
  const forecastConfig = getOutAmount(market, asks, bids, fromCoinMint, toCoinMint, amount, slippage)

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
    if (forecastConfig.side === 'buy') {
      lamports = Math.round(forecastConfig.worstPrice * forecastConfig.amountOut * 1.01 * LAMPORTS_PER_SOL)
      if (openOrdersAccounts.length > 0) {
        lamports -= openOrdersAccounts[0].quoteTokenFree.toNumber()
      }
    } else {
      lamports = Math.round(forecastConfig.maxInAllow * LAMPORTS_PER_SOL)
      if (openOrdersAccounts.length > 0) {
        lamports -= openOrdersAccounts[0].baseTokenFree.toNumber()
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
      side: forecastConfig.side,
      price: forecastConfig.worstPrice,
      size:
        forecastConfig.side === 'buy'
          ? parseFloat(forecastConfig.amountOut.toFixed(6))
          : parseFloat(forecastConfig.maxInAllow.toFixed(6)),
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

  const newFromTokenAccount = await createTokenAccountIfNotExist(
    connection,
    fromTokenAccount,
    owner,
    fromMint,
    null,
    transaction,
    signers
  )
  const newToTokenAccount = await createTokenAccountIfNotExist(
    connection,
    toTokenAccount,
    owner,
    toMint,
    null,
    transaction,
    signers
  )

  const userAccounts = [newFromTokenAccount, newToTokenAccount]
  // 反转
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
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    // amm
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: true },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    // serum
    { pubkey: serumProgramId, isSigner: false, isWritable: true },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true },
    { pubkey: serumEventQueue, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumVaultSigner, isSigner: false, isWritable: true },
    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userOwner, isSigner: true, isWritable: true }
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
