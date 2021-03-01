import { Connection, PublicKey } from '@solana/web3.js'
import {
  LiquidityPoolInfo,
  getPoolByLpMintAddress,
  getPoolByTokenMintAddresses,
} from '@/utils/pools'
// @ts-ignore
import { nu64, struct } from 'buffer-layout'

import { OpenOrders } from '@project-serum/serum'
import { publicKeyLayout } from '@project-serum/serum/lib/layout'

export default class Liquidity {
  // v2
  static programId = 'RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr'

  public poolInfo: LiquidityPoolInfo

  public hasQuote: boolean
  public quoting: boolean

  constructor(poolInfo: LiquidityPoolInfo) {
    this.poolInfo = poolInfo

    this.hasQuote = false
    this.quoting = true
  }

  static load(poolInfo: LiquidityPoolInfo) {
    return new Liquidity(poolInfo)
  }

  getPrice(coinBase = true) {
    const { coin, pc } = this.poolInfo

    if (!coin.balance || !pc.balance) {
      return NaN
    }

    if (coinBase) {
      return (
        pc.balance / 10 ** pc.decimals / (coin.balance / 10 ** coin.decimals)
      )
    } else {
      return (
        coin.balance / 10 ** coin.decimals / (pc.balance / 10 ** pc.decimals)
      )
    }
  }

  // 获取报价信息
  async requestQuote(connection: Connection) {
    this.quoting = true

    const { unusedCoin, unusedPc } = await this.getUnusedBalance(connection)

    const { baseTokenTotal, quoteTokenTotal } = await this.getUsedBalance(
      connection
    )

    const { needTakePnlCoin, needTakePnlPc } = await this.getAmmInfo(connection)

    const coinBalance = unusedCoin + baseTokenTotal - needTakePnlCoin
    const pcBalance = unusedPc + quoteTokenTotal - needTakePnlPc

    this.poolInfo.coin.balance = coinBalance
    this.poolInfo.pc.balance = pcBalance

    this.quoting = false
    this.hasQuote = true
  }

  // 获取池子未挂单的余额
  async getUnusedBalance(connection: Connection) {
    const { poolCoinTokenAccount, poolPcTokenAccount } = this.poolInfo

    const poolCoinInfo = await connection.getTokenAccountBalance(
      new PublicKey(poolCoinTokenAccount)
    )
    const poolPcInfo = await connection.getTokenAccountBalance(
      new PublicKey(poolPcTokenAccount)
    )

    return {
      unusedCoin: parseInt(poolCoinInfo.value.amount),
      unusedPc: parseInt(poolPcInfo.value.amount),
    }
  }

  // 获取池子挂单的余额
  async getUsedBalance(connection: Connection) {
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(this.poolInfo.ammOpenOrders)
    )

    let baseTokenTotal = 0
    let quoteTokenTotal = 0

    if (!accountInfo) {
      return { baseTokenTotal, quoteTokenTotal }
    }

    const openOrders = OpenOrders.fromAccountInfo(
      new PublicKey(this.poolInfo.ammOpenOrders),
      accountInfo,
      new PublicKey(this.poolInfo.serumProgramId)
    )

    baseTokenTotal = openOrders.baseTokenTotal.toNumber()
    quoteTokenTotal = openOrders.quoteTokenTotal.toNumber()

    return { baseTokenTotal, quoteTokenTotal }
  }

  // 获取池子信息 (利润金额等等)
  async getAmmInfo(connection: Connection) {
    const info = await connection.getAccountInfo(
      new PublicKey(this.poolInfo.ammId),
      'confirmed'
    )

    return Liquidity.AmmInfoLayout.decode(info?.data)
  }

  static getByLpMintAddress(lpMint: string) {
    return getPoolByLpMintAddress(lpMint)
  }

  static getByTokenMintAddresses(coinMint: string, pcMint: string) {
    return getPoolByTokenMintAddresses(coinMint, pcMint)
  }

  static AmmInfoLayout = struct([
    nu64('status'),
    nu64('nonce'),
    nu64('orderNum'),
    nu64('depth'),
    nu64('coinDecimals'),
    nu64('pcDecimals'),
    nu64('state'),
    nu64('resetFlag'),
    nu64('fee'),
    nu64('minSize'),
    nu64('volMaxCutRatio'),
    nu64('pnlRatio'),
    nu64('amountWaveRatio'),
    nu64('coinLotSize'),
    nu64('pcLotSize'),
    nu64('minPriceMultiplier'),
    nu64('maxPriceMultiplier'),
    nu64('needTakePnlCoin'),
    nu64('needTakePnlPc'),
    nu64('totalPnlX'),
    nu64('totalPnlY'),
    nu64('systemDecimalsValue'),
    publicKeyLayout('poolCoinTokenAccount'),
    publicKeyLayout('poolPcTokenAccount'),
    publicKeyLayout('coinMintAddress'),
    publicKeyLayout('pcMintAddress'),
    publicKeyLayout('lpMintAddress'),
    publicKeyLayout('ammOpenOrders'),
    publicKeyLayout('serumMarket'),
    publicKeyLayout('serumProgramId'),
    publicKeyLayout('ammTargetOrders'),
    publicKeyLayout('ammQuantities'),
    publicKeyLayout('poolWithdrawQueue'),
    publicKeyLayout('poolTempLpTokenAccount'),
    publicKeyLayout('ammCoinPnlAccount'),
    publicKeyLayout('ammPcPnlAccount'),
  ])
}
