import { ACCOUNT_LAYOUT, MINT_LAYOUT } from './layouts'
import { transfer } from './swap'
import { throwIfNull } from './errors'
import { LIQUIDITY_POOLS } from './pools'
import BigNumber from 'bignumber.js'
import {
  Account,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js'
import {
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V3,
  TOKEN_PROGRAM_ID,
  RENT_PROGRAM_ID,
  SYSTEM_PROGRAM_ID
} from '@/utils/ids'
import {
  commitment,
  getMultipleAccounts,
  sendTransaction,
  createAmmAuthority,
  getMintDecimals,
  getFilteredTokenAccountsByOwner,
  createAmmId
} from '@/utils/web3'
// @ts-ignore
import { struct, u8 } from 'buffer-layout'
import { publicKey } from '@project-serum/borsh'

// import { AMM_INFO_LAYOUT_V4 } from '@/utils/liquidity'
import { Market as MarketSerum, OpenOrders } from '@project-serum/serum'
import { Orderbook } from '@project-serum/serum/lib/market.js'
import {
  closeAccount,
  initializeAccount
  // initializeMint
  // encodeTokenInstructionData
} from '@project-serum/serum/lib/token-instructions'
import { TOKENS } from '@/utils/tokens'

export async function getMarket(conn: any, marketAddress: string): Promise<any | any> {
  try {
    const expectAmmId = (
      await createAmmId(new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4), new PublicKey(marketAddress))
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

    for (const item of [TOKENS.USDT, TOKENS.USDC, TOKENS.RAY, TOKENS.WSOL, TOKENS.SRM]) {
      if (quoteMint?.toBase58() === item.mintAddress) {
        coinOrPcInTokenFlag = true
        break
      }
    }
    if (!coinOrPcInTokenFlag) {
      throw new Error(
        'Only markets that contain USDC, USDT, SOL, RAY, or SRM as the Quote Token are currently supported.'
      )
    }
    const asks: number[] = []
    const bids: number[] = []

    const orderBookMsg = await getMultipleAccounts(conn, [bidsAddress, asksAddress], commitment)
    orderBookMsg.forEach((info) => {
      // @ts-ignore
      const data = info.account.data
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

async function createTokenAccount(
  conn: Connection,
  transaction: Transaction,
  mintPublic: PublicKey,
  ammAuthority: PublicKey,
  owner: PublicKey,
  signers: any
) {
  const splAccount = new Account()
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: splAccount.publicKey,
      lamports: await conn.getMinimumBalanceForRentExemption(ACCOUNT_LAYOUT.span),
      space: ACCOUNT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID
    })
  )
  transaction.add(
    initializeAccount({
      account: splAccount.publicKey,
      mint: mintPublic,
      owner: ammAuthority
    })
  )
  signers.push(splAccount)
  return splAccount
}

export function initializeMint(mint: PublicKey, decimals: number, mintAuthority: PublicKey): TransactionInstruction {
  const dataLayout = struct([
    u8('instruction'),
    u8('decimals'),
    publicKey('mintAuthority'),
    u8('freezeOption'),
    publicKey('freezeAuthority')
  ])
  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: RENT_PROGRAM_ID, isSigner: false, isWritable: true }
  ]
  const data = Buffer.alloc(dataLayout.span)

  // const v = {
  //   instruction: 0,
  //   decimals,
  //   mintAuthority,
  //   freezeOption: 0,
  //   freezeAuthority: new PublicKey(SERUM_PROGRAM_ID_V3)
  // }
  // console.log(v)
  // dataLayout.encode(v, data)
  data.writeUInt8(0)
  data.writeUInt8(decimals, 1)
  mintAuthority.toBuffer().copy(data, 2, 0, 32)
  data.writeUInt8(0, 34)

  return new TransactionInstruction({
    keys,
    programId: TOKEN_PROGRAM_ID,
    data
  })
}

async function createAndInitMint(
  conn: any,
  transaction: Transaction,
  owner: PublicKey,
  mint: Account,
  ownerPubkey: PublicKey,
  decimals: number,
  signers: any
) {
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: mint.publicKey,
      lamports: await conn.getMinimumBalanceForRentExemption(MINT_LAYOUT.span),
      space: MINT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID
    })
  )
  transaction.add(initializeMint(mint.publicKey, decimals, ownerPubkey))
  signers.push(mint)
}

function strToAccount(str: string) {
  return new Account(new Uint8Array(JSON.parse('[' + str + ']')))
}

export async function createAmm(
  conn: any,
  wallet: any,
  market: any,
  userInputBaseValue: number,
  userInputQuoteValue: number
) {
  let transaction = new Transaction()
  const signers: any = []
  const owner = wallet.publicKey

  const { publicKey, nonce } = await createAmmAuthority(new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4))
  const ammAuthority = publicKey
  const ammId: PublicKey = await createAmmId(new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4), market.address)

  // 获取历史数据
  const localPoolCoinTokenAccount = localStorage.getItem('poolCoinTokenAccount')
  const localPoolPcTokenAccount = localStorage.getItem('poolPcTokenAccount')
  const localLpMintAddress = localStorage.getItem('lpMintAddress')
  const localPoolTempLpTokenAccount = localStorage.getItem('poolTempLpTokenAccount')

  const localAmmOpenOrders = localStorage.getItem('ammOpenOrders')
  const localAmmTargetOrders = localStorage.getItem('ammTargetOrders')
  const localPoolWithdrawQueue = localStorage.getItem('poolWithdrawQueue')
  const localDestLpToken = localStorage.getItem('destLpToken')

  let poolCoinTokenAccount: Account = new Account()
  let poolPcTokenAccount: Account = new Account()
  let lpMintAddress: Account = new Account()
  let poolTempLpTokenAccount: Account = new Account()

  let ammOpenOrders: Account = new Account()
  let ammTargetOrders: Account = new Account()
  let poolWithdrawQueue: Account = new Account()
  let destLpToken: Account = new Account()

  let accountSuccessFlag1 = false
  let accountSuccessFlag2 = false
  if (
    localPoolCoinTokenAccount !== null &&
    localPoolPcTokenAccount !== null &&
    localLpMintAddress !== null &&
    localPoolTempLpTokenAccount !== null
  ) {
    try {
      poolCoinTokenAccount = strToAccount(localPoolCoinTokenAccount)
      poolPcTokenAccount = strToAccount(localPoolPcTokenAccount)
      lpMintAddress = strToAccount(localLpMintAddress)
      poolTempLpTokenAccount = strToAccount(localPoolTempLpTokenAccount)
      accountSuccessFlag1 = true
    } catch {}
  }

  if (
    localAmmOpenOrders != null &&
    localAmmTargetOrders != null &&
    localPoolWithdrawQueue != null &&
    localDestLpToken != null
  ) {
    try {
      ammOpenOrders = strToAccount(localAmmOpenOrders)
      ammTargetOrders = strToAccount(localAmmTargetOrders)
      poolWithdrawQueue = strToAccount(localPoolWithdrawQueue)
      destLpToken = strToAccount(localDestLpToken)
      accountSuccessFlag2 = true
    } catch {}
  }

  if (!accountSuccessFlag1) {
    poolCoinTokenAccount = await createTokenAccount(
      conn,
      transaction,
      market.baseMintAddress as PublicKey,
      ammAuthority,
      owner,
      signers
    )

    poolPcTokenAccount = await createTokenAccount(
      conn,
      transaction,
      market.quoteMintAddress as PublicKey,
      ammAuthority,
      owner,
      signers
    )

    lpMintAddress = new Account()
    const lpDecimals = await getMintDecimals(conn, market.baseMintAddress as PublicKey)
    await createAndInitMint(conn, transaction, owner, lpMintAddress, ammAuthority, lpDecimals, signers)

    poolTempLpTokenAccount = await createTokenAccount(
      conn,
      transaction,
      lpMintAddress.publicKey,
      ammAuthority,
      owner,
      signers
    )
    const txid = await sendTransaction(conn, wallet, transaction, signers)
    console.log('txid1', txid)
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
      console.log('txid1', outOfWhile, txidSuccessFlag, (new Date().getTime() - timeAwait) / 1000)
      if (txidSuccessFlag !== 0) {
        outOfWhile = true
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    if (txidSuccessFlag !== 1) {
      throw new Error('create tx1 error')
    }

    // 成功 存储本地
    localStorage.setItem('poolCoinTokenAccount', poolCoinTokenAccount.secretKey.toString())
    localStorage.setItem('poolPcTokenAccount', poolPcTokenAccount.secretKey.toString())
    localStorage.setItem('lpMintAddress', lpMintAddress.secretKey.toString())
    localStorage.setItem('poolTempLpTokenAccount', poolTempLpTokenAccount.secretKey.toString())

    localStorage.setItem('createMarket', market.address.toBase58())
  }

  if (!accountSuccessFlag2) {
    signers.splice(0, signers.length)
    transaction = new Transaction()

    // transaction.add(
    //   SystemProgram.createAccount({
    //     fromPubkey: owner,
    //     newAccountPubkey: ammId,
    //     lamports: await conn.getMinimumBalanceForRentExemption(AMM_INFO_LAYOUT_V4.span),
    //     space: AMM_INFO_LAYOUT_V4.span,
    //     programId: new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
    //   })
    // )

    ammOpenOrders = new Account()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: ammOpenOrders.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(
          OpenOrders.getLayout(new PublicKey(SERUM_PROGRAM_ID_V3)).span
        ),
        space: OpenOrders.getLayout(new PublicKey(SERUM_PROGRAM_ID_V3)).span,
        programId: new PublicKey(SERUM_PROGRAM_ID_V3)
      })
    )
    signers.push(ammOpenOrders)

    ammTargetOrders = new Account()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: ammTargetOrders.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(2208),
        space: 2208,
        programId: new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
      })
    )
    signers.push(ammTargetOrders)

    poolWithdrawQueue = new Account()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: poolWithdrawQueue.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(5680),
        space: 5680,
        programId: new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
      })
    )
    signers.push(poolWithdrawQueue)

    destLpToken = await createTokenAccount(conn, transaction, lpMintAddress.publicKey, owner, owner, signers)
    const txid = await sendTransaction(conn, wallet, transaction, signers)

    console.log('txid2', txid)
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
      console.log('txid2', outOfWhile, txidSuccessFlag, (new Date().getTime() - timeAwait) / 1000)
      if (txidSuccessFlag !== 0) {
        outOfWhile = true
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    if (txidSuccessFlag !== 1) {
      throw new Error('create tx2 error')
    }

    // 成功 存储本地
    localStorage.setItem('ammOpenOrders', ammOpenOrders.secretKey.toString())
    localStorage.setItem('ammTargetOrders', ammTargetOrders.secretKey.toString())
    localStorage.setItem('poolWithdrawQueue', poolWithdrawQueue.secretKey.toString())
    localStorage.setItem('destLpToken', destLpToken.secretKey.toString())
  }
  const ammKeys = {
    ammId,
    ammAuthority,
    poolCoinTokenAccount: poolCoinTokenAccount.publicKey,
    poolPcTokenAccount: poolPcTokenAccount.publicKey,
    lpMintAddress: lpMintAddress.publicKey,
    ammOpenOrders: ammOpenOrders.publicKey,
    ammTargetOrders: ammTargetOrders.publicKey,
    poolWithdrawQueue: poolWithdrawQueue.publicKey,
    poolTempLpTokenAccount: poolTempLpTokenAccount.publicKey,
    destLpToken: destLpToken.publicKey,
    nonce
  }

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
  poolCoinTokenAccount: Account,
  poolPcTokenAccount: Account
) {
  const baseMintDecimals = new BigNumber(await getMintDecimals(conn, market.baseMintAddress as PublicKey))
  const quoteMintDecimals = new BigNumber(await getMintDecimals(conn, market.quoteMintAddress as PublicKey))
  // const baseLotSize = new BigNumber(market.baseLotSize)
  // const quoteLotSize = new BigNumber(market.quoteLotSize)

  const coinVol = new BigNumber(10).exponentiatedBy(baseMintDecimals).multipliedBy(userInputBaseValue)
  const pcVol = new BigNumber(10).exponentiatedBy(quoteMintDecimals).multipliedBy(userInputQuoteValue)

  const transaction = new Transaction()
  const signers: any = []
  const owner = wallet.publicKey
  const baseTokenAccount = await getFilteredTokenAccountsByOwner(conn, owner, market.baseMintAddress)
  const quoteTokenAccount = await getFilteredTokenAccountsByOwner(conn, owner, market.quoteMintAddress)
  const baseTokenList: any = baseTokenAccount.value.map((item: any) => {
    if (item.account.data.parsed.info.tokenAmount.amount >= coinVol.toNumber()) {
      return item.pubkey
    }
    return null
  })
  const quoteTokenList: any = quoteTokenAccount.value.map((item: any) => {
    if (item.account.data.parsed.info.tokenAmount.amount >= pcVol.toNumber()) {
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

    transaction.add(transfer(newAccount.publicKey, poolCoinTokenAccount.publicKey, owner, parseInt(coinVol.toFixed())))

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
      transfer(new PublicKey(baseToken), poolCoinTokenAccount.publicKey, owner, parseInt(coinVol.toFixed()))
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

    transaction.add(transfer(newAccount.publicKey, poolPcTokenAccount.publicKey, owner, parseInt(pcVol.toFixed())))
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
    transaction.add(transfer(new PublicKey(quoteToken), poolPcTokenAccount.publicKey, owner, parseInt(pcVol.toFixed())))
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
      ammKeys.destLpToken,
      ammKeys.poolTempLpTokenAccount,
      dexProgramId,
      market.address,

      owner,

      ammKeys.nonce
    )
  )

  transaction.add(
    initialize2(
      ammProgramId,
      ammKeys.ammId,
      ammKeys.ammAuthority,
      ammKeys.ammOpenOrders,
      ammKeys.poolCoinTokenAccount,
      ammKeys.poolPcTokenAccount,
      ammKeys.ammTargetOrders,
      dexProgramId,
      market.address,
      market.baseVault,
      market.quoteVault,
      market.requestQueue,
      market.eventQueue,
      market.bids,
      market.asks
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
    { pubkey: poolLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTempLpTokenAccount, isSigner: false, isWritable: true },
    { pubkey: serumProgramId, isSigner: false, isWritable: false },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: true }
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

export function initialize2(
  programId: PublicKey,
  ammId: PublicKey,
  ammAuthority: PublicKey,
  ammOpenOrders: PublicKey,
  poolCoinTokenAccount: PublicKey,
  poolPcTokenAccount: PublicKey,
  ammTargetOrders: PublicKey,
  serumProgramId: PublicKey,
  serumMarket: PublicKey,
  serumCoinVaultAccount: PublicKey,
  serumPcVaultAccount: PublicKey,
  serumReqQ: PublicKey,
  serumEventQ: PublicKey,
  serumBids: PublicKey,
  serumAsks: PublicKey
): TransactionInstruction {
  const dataLayout = struct([u8('instruction'), u8('nonce')])

  const keys = [
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: true },
    { pubkey: ammId, isSigner: false, isWritable: true },
    { pubkey: ammAuthority, isSigner: false, isWritable: true },
    { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
    { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
    { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
    { pubkey: serumProgramId, isSigner: false, isWritable: true },
    { pubkey: serumMarket, isSigner: false, isWritable: true },
    { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
    { pubkey: serumReqQ, isSigner: false, isWritable: true },
    { pubkey: serumEventQ, isSigner: false, isWritable: true },
    { pubkey: serumBids, isSigner: false, isWritable: true },
    { pubkey: serumAsks, isSigner: false, isWritable: true }
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

export class Market extends MarketSerum {
  public baseVault: PublicKey | null = null
  public quoteVault: PublicKey | null = null
  public requestQueue: PublicKey | null = null
  public eventQueue: PublicKey | null = null
  public bids: PublicKey | null = null
  public asks: PublicKey | null = null
  public baseLotSize: number = 0
  public quoteLotSize: number = 0
  public decoded: any
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
    market.decoded = decoded
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
