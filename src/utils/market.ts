import BigNumber from 'bignumber.js'
// @ts-ignore
import { struct, u8 } from 'buffer-layout'

// import { AMM_INFO_LAYOUT_V4 } from '@/utils/liquidity'
import { Market as MarketSerum } from '@project-serum/serum'
import { Orderbook } from '@project-serum/serum/lib/market.js'
import { closeAccount, initializeAccount } from '@project-serum/serum/lib/token-instructions'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token'
import {
  Account,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'

import {
  commitment,
  createAmmAuthority,
  createAssociatedId,
  findAssociatedTokenAddress,
  getFilteredTokenAccountsByOwner,
  getMintDecimals,
  getMultipleAccounts,
  sendTransaction
} from '@/utils/web3'
import { TOKENS } from '@/utils/tokens'
import {
  AMM_ASSOCIATED_SEED,
  COIN_VAULT_ASSOCIATED_SEED,
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  LP_MINT_ASSOCIATED_SEED,
  OPEN_ORDER_ASSOCIATED_SEED,
  PC_VAULT_ASSOCIATED_SEED,
  SERUM_PROGRAM_ID_V3,
  SYSTEM_PROGRAM_ID,
  TARGET_ASSOCIATED_SEED,
  TEMP_LP_TOKEN_ASSOCIATED_SEED,
  TOKEN_PROGRAM_ID,
  WITHDRAW_ASSOCIATED_SEED
} from '@/utils/ids'
import { throwIfNull } from './errors'
import { ACCOUNT_LAYOUT, getBigNumber, MINT_LAYOUT } from './layouts'
import { LIQUIDITY_POOLS } from './pools'
import { transfer } from './swap'

export async function getMarket(conn: any, marketAddress: string): Promise<any | any> {
  try {
    const expectAmmId = (
      await createAssociatedId(
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
        new PublicKey(marketAddress),
        AMM_ASSOCIATED_SEED
      )
    ).toString()
    if (LIQUIDITY_POOLS.find((item) => item.ammId === expectAmmId)) {
      throw new Error('There is already a pool for this Serum Market')
    }
    const marketAddressPubKey = new PublicKey(marketAddress)
    const market = await Market.load(conn, marketAddressPubKey, undefined, new PublicKey(SERUM_PROGRAM_ID_V3))
    const {
      asksAddress,
      bidsAddress,
      quoteMint
      // baseMint
    } = market
    let coinOrPcInTokenFlag = false

    for (const item of [TOKENS.USDT, TOKENS.USDC, TOKENS.RAY, TOKENS.WSOL, TOKENS.SRM, TOKENS.PAI, TOKENS.mSOL]) {
      if (quoteMint?.toBase58() === item.mintAddress) {
        coinOrPcInTokenFlag = true
        break
      }
    }
    if (!coinOrPcInTokenFlag) {
      throw new Error(
        'Only markets that contain USDC, USDT, SOL, RAY, SRM, PAI or mSOL as the Quote Token are currently supported.'
      )
    }
    const asks: number[] = []
    const bids: number[] = []

    const orderBookMsg = await getMultipleAccounts(conn, [bidsAddress, asksAddress], commitment)
    orderBookMsg.forEach((info) => {
      // @ts-ignore
      const data = info.account.data
      // @ts-ignore
      const orderbook = Orderbook.decode(market, data)
      const { isBids, slab } = orderbook
      if (isBids) {
        for (const item of slab.items(true)) {
          bids.push(market?.priceLotsToNumber(item.key.ushrn(64)) || 0)
        }
      } else {
        for (const item of slab.items(false)) {
          asks.push(market?.priceLotsToNumber(item.key.ushrn(64)) || 0)
        }
      }
    })
    const price = asks.length > 0 && bids.length > 0 ? (asks[0] + bids[0]) / 2 : NaN

    const baseMintDecimals = new BigNumber(await getMintDecimals(conn, market.baseMintAddress as PublicKey))
    const quoteMintDecimals = new BigNumber(await getMintDecimals(conn, market.quoteMintAddress as PublicKey))
    return { market, price, msg: '', baseMintDecimals, quoteMintDecimals }
  } catch (error) {
    if (error.message === 'Non-base58 character') {
      return { market: null, price: null, msg: 'market input error', baseMintDecimals: 0, quoteMintDecimals: 0 }
    } else {
      return { market: null, price: null, msg: error.message, baseMintDecimals: 0, quoteMintDecimals: 0 }
    }
  }
}

export async function createAmm(
  conn: any,
  wallet: any,
  market: any,
  userInputBaseValue: number,
  userInputQuoteValue: number
) {
  const transaction = new Transaction()
  const signers: any = []
  const owner = wallet.publicKey

  const { publicKey, nonce } = await createAmmAuthority(new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4))
  const ammAuthority = publicKey
  const ammId: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    AMM_ASSOCIATED_SEED
  )

  const poolCoinTokenAccount: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    COIN_VAULT_ASSOCIATED_SEED
  )
  const poolPcTokenAccount: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    PC_VAULT_ASSOCIATED_SEED
  )
  const lpMintAddress: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    LP_MINT_ASSOCIATED_SEED
  )
  const poolTempLpTokenAccount: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    TEMP_LP_TOKEN_ASSOCIATED_SEED
  )
  const ammTargetOrders: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    TARGET_ASSOCIATED_SEED
  )
  const poolWithdrawQueue: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    WITHDRAW_ASSOCIATED_SEED
  )

  const ammOpenOrders: PublicKey = await createAssociatedId(
    new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    market.address,
    OPEN_ORDER_ASSOCIATED_SEED
  )

  let accountSuccessFlag = false
  let accountAllSuccessFlag = false

  const multipleInfo = await getMultipleAccounts(conn, [lpMintAddress], commitment)
  if (multipleInfo.length > 0 && multipleInfo[0] !== null) {
    const tempLpMint = MINT_LAYOUT.decode(multipleInfo[0]?.account.data)
    if (getBigNumber(tempLpMint.supply) === 0) {
      accountSuccessFlag = true
    } else {
      accountAllSuccessFlag = true
    }
  } else {
    accountSuccessFlag = false
  }
  console.log('init flag: ', accountSuccessFlag, accountAllSuccessFlag)

  transaction.add(
    preInitialize(
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
      ammTargetOrders,
      poolWithdrawQueue,
      ammAuthority,
      lpMintAddress,
      market.baseMintAddress,
      market.quoteMintAddress,
      poolCoinTokenAccount,
      poolPcTokenAccount,
      poolTempLpTokenAccount,
      market.address,
      owner,
      nonce
    )
  )

  const destLpToken = await findAssociatedTokenAddress(owner, lpMintAddress)
  const destLpTokenInfo = await conn.getAccountInfo(destLpToken)
  if (!destLpTokenInfo) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        lpMintAddress,
        destLpToken,
        owner,
        owner
      )
    )
  }

  if (!accountSuccessFlag) {
    const txid = await sendTransaction(conn, wallet, transaction, signers)
    console.log('txid', txid)
    let txidSuccessFlag = 0
    await conn.onSignature(txid, function (_signatureResult: any, _context: any) {
      if (_signatureResult.err) {
        txidSuccessFlag = -1
      } else {
        txidSuccessFlag = 1
      }
    })

    const timeAwait = new Date().getTime()
    let outOfWhile = false
    while (!outOfWhile) {
      console.log('txid', outOfWhile, txidSuccessFlag, (new Date().getTime() - timeAwait) / 1000)
      if (txidSuccessFlag !== 0) {
        outOfWhile = true
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    if (txidSuccessFlag !== 1) {
      throw new Error('create tx1 error')
    }
  }

  const ammKeys = {
    ammId,
    ammAuthority,
    poolCoinTokenAccount,
    poolPcTokenAccount,
    lpMintAddress,
    ammOpenOrders,
    ammTargetOrders,
    poolWithdrawQueue,
    poolTempLpTokenAccount,
    destLpToken,
    nonce
  }

  if (!accountAllSuccessFlag) {
    await initAmm(
      conn,
      wallet,
      market,
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
      new PublicKey(SERUM_PROGRAM_ID_V3),
      // ammId,
      ammKeys,
      userInputBaseValue,
      userInputQuoteValue,
      poolCoinTokenAccount,
      poolPcTokenAccount
    )
  }

  return ammId.toBase58()
}

async function initAmm(
  conn: any,
  wallet: any,
  market: any,
  ammProgramId: PublicKey,
  dexProgramId: PublicKey,
  // ammKeypair: PublicKey,
  ammKeys: any,
  userInputBaseValue: number,
  userInputQuoteValue: number,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey
) {
  const baseMintDecimals = new BigNumber(await getMintDecimals(conn, market.baseMintAddress as PublicKey))
  const quoteMintDecimals = new BigNumber(await getMintDecimals(conn, market.quoteMintAddress as PublicKey))

  const coinVol = new BigNumber(10).exponentiatedBy(baseMintDecimals).multipliedBy(userInputBaseValue)
  const pcVol = new BigNumber(10).exponentiatedBy(quoteMintDecimals).multipliedBy(userInputQuoteValue)

  const transaction = new Transaction()
  const signers: any = []
  const owner = wallet.publicKey
  const baseTokenAccount = await getFilteredTokenAccountsByOwner(conn, owner, market.baseMintAddress)
  const quoteTokenAccount = await getFilteredTokenAccountsByOwner(conn, owner, market.quoteMintAddress)
  const baseTokenList: any = baseTokenAccount.value.map((item: any) => {
    if (item.account.data.parsed.info.tokenAmount.amount >= getBigNumber(coinVol)) {
      return item.pubkey
    }
    return null
  })
  const quoteTokenList: any = quoteTokenAccount.value.map((item: any) => {
    if (item.account.data.parsed.info.tokenAmount.amount >= getBigNumber(pcVol)) {
      return item.pubkey
    }
    return null
  })
  let baseToken: string | null = null
  for (const item of baseTokenList) {
    if (item !== null) {
      baseToken = item
    }
  }
  let quoteToken: string | null = null
  for (const item of quoteTokenList) {
    if (item !== null) {
      quoteToken = item
    }
  }
  if (
    (baseToken === null && market.baseMintAddress.toString() !== TOKENS.WSOL.mintAddress) ||
    (quoteToken === null && market.quoteMintAddress.toString() !== TOKENS.WSOL.mintAddress)
  ) {
    throw new Error('no money')
  }

  if (market.baseMintAddress.toString() === TOKENS.WSOL.mintAddress) {
    const newAccount = new Account()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: newAccount.publicKey,
        lamports: parseInt(coinVol.toFixed()) + 1e7,
        space: ACCOUNT_LAYOUT.span,
        programId: TOKEN_PROGRAM_ID
      })
    )
    transaction.add(
      initializeAccount({
        account: newAccount.publicKey,
        mint: new PublicKey(TOKENS.WSOL.mintAddress),
        owner
      })
    )

    transaction.add(transfer(newAccount.publicKey, poolCoinTokenAccount, owner, parseInt(coinVol.toFixed())))

    transaction.add(
      closeAccount({
        source: newAccount.publicKey,
        destination: owner,
        owner
      })
    )

    signers.push(newAccount)
  } else {
    transaction.add(
      // @ts-ignore
      transfer(new PublicKey(baseToken), poolCoinTokenAccount, owner, parseInt(coinVol.toFixed()))
    )
  }
  if (market.quoteMintAddress.toString() === TOKENS.WSOL.mintAddress) {
    const newAccount = new Account()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: newAccount.publicKey,
        lamports: parseInt(pcVol.toFixed()) + 1e7,
        space: ACCOUNT_LAYOUT.span,
        programId: TOKEN_PROGRAM_ID
      })
    )
    transaction.add(
      initializeAccount({
        account: newAccount.publicKey,
        mint: new PublicKey(TOKENS.WSOL.mintAddress),
        owner
      })
    )

    transaction.add(transfer(newAccount.publicKey, poolPcTokenAccount, owner, parseInt(pcVol.toFixed())))
    transaction.add(
      closeAccount({
        source: newAccount.publicKey,
        destination: owner,
        owner
      })
    )
    signers.push(newAccount)
  } else {
    // @ts-ignore
    transaction.add(transfer(new PublicKey(quoteToken), poolPcTokenAccount, owner, parseInt(pcVol.toFixed())))
  }

  transaction.add(
    initialize(
      ammProgramId,
      ammKeys.ammId,
      ammKeys.ammAuthority,
      ammKeys.ammOpenOrders,
      ammKeys.lpMintAddress,
      market.baseMintAddress,
      market.quoteMintAddress,
      ammKeys.poolCoinTokenAccount,
      ammKeys.poolPcTokenAccount,
      ammKeys.poolWithdrawQueue,
      ammKeys.ammTargetOrders,
      ammKeys.destLpToken,
      ammKeys.poolTempLpTokenAccount,
      dexProgramId,
      market.address,

      owner,

      ammKeys.nonce
    )
  )

  const txid = await sendTransaction(conn, wallet, transaction, signers)

  console.log('txid3', txid)
  let txidSuccessFlag = 0
  await conn.onSignature(txid, function (_signatureResult: any, _context: any) {
    if (_signatureResult.err) {
      txidSuccessFlag = -1
    } else {
      txidSuccessFlag = 1
    }
  })

  const timeAwait = new Date().getTime()
  let outOfWhile = false
  while (!outOfWhile) {
    console.log('txid3', outOfWhile, txidSuccessFlag, (new Date().getTime() - timeAwait) / 1000)
    if (txidSuccessFlag !== 0) {
      outOfWhile = true
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  if (txidSuccessFlag !== 1) {
    throw new Error('Transaction failed')
  }

  clearLocal()
}

export function initialize(
  ammProgramId: PublicKey,
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  lpMintAddress: PublicKey,
  coinMint: PublicKey,
  pcMint: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  poolWithdrawQueue: PublicKey,
  ammTargetOrders: PublicKey,
  poolLpTokenAccount: PublicKey,
  poolTempLpTokenAccount: PublicKey,
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  owner: PublicKey,
  nonce: number
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), u8('nonce')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: coinMint, isSigner: false, isWritable: true },
    { pubkey: pcMint, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: false }
  ]
  const data = Buffer.alloc(dataLayout.span)

  dataLayout.encode(
    {
      instruction: 0,
      nonce
    },
    data
  )

  return new TransactionInstruction({
    keys,
    programId: ammProgramId,
    data
  })
}

export function preInitialize(
  programId: PublicKey,
  ammTargetOrders: PublicKey,
  poolWithdrawQueue: PublicKey,
  ammAuthority: PublicKey,
  lpMintAddress: PublicKey,
  coinMintAddress: PublicKey,
  pcMintAddress: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  poolTempLpTokenAccount: PublicKey,
  market: PublicKey,
  owner: PublicKey,
  nonce: any
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), u8('nonce')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },

    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: poolWithdrawQueue, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: false },
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: coinMintAddress, isSigner: false, isWritable: false },
    { pubkey: pcMintAddress, isSigner: false, isWritable: false },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: market, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: true, isWritable: false }
  ]
  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 10,
      nonce
    },
    data
  )
  return new TransactionInstruction({
    keys,
    programId,
    data
  })
}

// @ts-ignore
export class Market extends MarketSerum {
  public baseVault: PublicKey | null = null
  public quoteVault: PublicKey | null = null
  public requestQueue: PublicKey | null = null
  public eventQueue: PublicKey | null = null
  public bids: PublicKey | null = null
  public asks: PublicKey | null = null
  public baseLotSize: number = 0
  public quoteLotSize: number = 0
  private _decoded: any
  public quoteMint: PublicKey | null = null
  public baseMint: PublicKey | null = null

  static async load(connection: Connection, address: PublicKey, options: any = {}, programId: PublicKey) {
    const { owner, data } = throwIfNull(await connection.getAccountInfo(address), 'Market not found')
    if (!owner.equals(programId)) {
      throw new Error('Address not owned by program: ' + owner.toBase58())
    }
    const decoded = this.getLayout(programId).decode(data)
    if (!decoded.accountFlags.initialized || !decoded.accountFlags.market || !decoded.ownAddress.equals(address)) {
      throw new Error('Invalid market')
    }
    const [baseMintDecimals, quoteMintDecimals] = await Promise.all([
      getMintDecimals(connection, decoded.baseMint),
      getMintDecimals(connection, decoded.quoteMint)
    ])

    const market = new Market(decoded, baseMintDecimals, quoteMintDecimals, options, programId)
    market._decoded = decoded
    market.baseLotSize = decoded.baseLotSize
    market.quoteLotSize = decoded.quoteLotSize
    market.baseVault = decoded.baseVault
    market.quoteVault = decoded.quoteVault
    market.requestQueue = decoded.requestQueue
    market.eventQueue = decoded.eventQueue
    market.bids = decoded.bids
    market.asks = decoded.asks
    market.quoteMint = decoded.quoteMint
    market.baseMint = decoded.baseMint
    return market
  }
}

export function clearLocal() {
  localStorage.removeItem('poolCoinTokenAccount')
  localStorage.removeItem('poolPcTokenAccount')
  localStorage.removeItem('lpMintAddress')
  localStorage.removeItem('poolTempLpTokenAccount')
  localStorage.removeItem('ammId')
  localStorage.removeItem('ammOpenOrders')
  localStorage.removeItem('ammTargetOrders')
  localStorage.removeItem('poolWithdrawQueue')
  localStorage.removeItem('destLpToken')

  localStorage.removeItem('createMarket')
}
