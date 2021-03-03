import {
  LiquidityPoolInfo,
  getLpMintByTokenMintAddresses,
  getPoolByLpMintAddress,
  getPoolByTokenMintAddresses,
} from '@/utils/pools'
import { publicKey, struct, u64 } from '@project-serum/borsh'

// v2
// export const programId = 'RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr'

export {
  getLpMintByTokenMintAddresses,
  getPoolByLpMintAddress,
  getPoolByTokenMintAddresses,
}

export function getPrice(poolInfo: LiquidityPoolInfo, coinBase = true) {
  const { coin, pc } = poolInfo

  if (!coin.balance || !pc.balance) {
    return NaN
  }

  if (coinBase) {
    return pc.balance.toEther().dividedBy(coin.balance.toEther())
  } else {
    return coin.balance.toEther().dividedBy(pc.balance.toEther())
  }
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
  publicKey('ammPcPnlAccount'),
])
