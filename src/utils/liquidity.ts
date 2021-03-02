import { Connection, PublicKey } from '@solana/web3.js'
import {
  LiquidityPoolInfo,
  getPoolByLpMintAddress,
  getPoolByTokenMintAddresses,
} from '@/utils/pools'
import { MINT_LAYOUT, TOKEN_ACCOUNT_LAYOUT } from '@/utils/layouts'
import { publicKey, struct, u64 } from '@project-serum/borsh'

import { OpenOrders } from '@project-serum/serum'
import { SafeMath } from '@/utils/safe-math'
import commitment from '@/utils/commitment'
import { getMultipleAccounts } from '@/utils/web3'

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

    if (!coin.uiBalance || !pc.uiBalance) {
      return NaN
    }

    if (coinBase) {
      return SafeMath.div(pc.uiBalance, coin.uiBalance)
    } else {
      return SafeMath.div(coin.uiBalance, pc.uiBalance)
    }
  }

  // 获取报价信息
  async requestQuote(connection: Connection) {
    this.quoting = true

    const { poolCoinTokenAccount, poolPcTokenAccount } = this.poolInfo

    const publicKeys = [
      // 获取池子未挂单的余额
      new PublicKey(poolCoinTokenAccount),
      new PublicKey(poolPcTokenAccount),
      // 获取池子挂单的余额 open orders
      new PublicKey(this.poolInfo.ammOpenOrders),
      // 获取池子信息 (利润金额等等)
      new PublicKey(this.poolInfo.ammId),
      // getLpSupply
      new PublicKey(this.poolInfo.lp.mintAddress),
    ]

    const multipleInfo = await getMultipleAccounts(
      connection,
      publicKeys,
      commitment
    )

    let coinBalance = 0
    let pcBalance = 0

    multipleInfo.forEach((info) => {
      const address = info?.publicKey.toBase58()
      // @ts-ignore
      const data = Buffer.from(info.account.data)

      // 获取池子未挂单的余额
      if (address === poolCoinTokenAccount) {
        const parsed = TOKEN_ACCOUNT_LAYOUT.decode(data)

        coinBalance = SafeMath.add(coinBalance, parsed.amount.toNumber())
      }
      if (address === poolPcTokenAccount) {
        const parsed = TOKEN_ACCOUNT_LAYOUT.decode(data)

        pcBalance = SafeMath.add(pcBalance, parsed.amount.toNumber())
      }
      // 获取池子挂单的余额 open orders
      if (address === this.poolInfo.ammOpenOrders) {
        const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(
          new PublicKey(this.poolInfo.serumProgramId)
        )
        const parsed = OPEN_ORDERS_LAYOUT.decode(data)

        const { baseTokenTotal, quoteTokenTotal } = parsed

        coinBalance = SafeMath.add(coinBalance, baseTokenTotal.toNumber())
        pcBalance = SafeMath.add(pcBalance, quoteTokenTotal.toNumber())
      }
      // // 获取池子信息 (利润金额等等)
      if (address === this.poolInfo.ammId) {
        const parsed = AMM_INFO_LAYOUT.decode(data)

        const { needTakePnlCoin, needTakePnlPc } = parsed

        coinBalance = SafeMath.sub(coinBalance, needTakePnlCoin.toNumber())
        pcBalance = SafeMath.sub(pcBalance, needTakePnlPc.toNumber())
      }
      // getLpSupply
      if (address === this.poolInfo.lp.mintAddress) {
        const parsed = MINT_LAYOUT.decode(data)

        this.poolInfo.lp.totalSupply = parsed.supply.toNumber()
        this.poolInfo.lp.uiTotalSupply = SafeMath.toEther(
          parsed.supply.toNumber(),
          this.poolInfo.lp.decimals
        )

        console.log(parsed.supply.toNumber(), this.poolInfo.lp.totalSupply)
      }
    })

    this.poolInfo.coin.balance = coinBalance
    this.poolInfo.pc.balance = pcBalance

    // 不加这个页面数据无法刷新
    this.poolInfo = { ...this.poolInfo }

    this.quoting = false
    this.hasQuote = true
  }

  static getByLpMintAddress(lpMint: string) {
    return getPoolByLpMintAddress(lpMint)
  }

  static getByTokenMintAddresses(coinMint: string, pcMint: string) {
    return getPoolByTokenMintAddresses(coinMint, pcMint)
  }
}

const AMM_INFO_LAYOUT = struct([
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
  publicKey('ammPcPnlAccount'),
])
