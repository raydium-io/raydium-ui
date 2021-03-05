import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { NATIVE_SOL, TOKENS } from '@/utils/tokens'
import { createTokenAccountIfNotExist, sendTransaction } from '@/utils/web3'

import { FarmInfo } from '@/utils/farms'
import { LiquidityPoolInfo } from '@/utils/pools'
import { TokenAmount } from '@/utils/safe-math'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import { removeLiquidityInstruction } from '@/utils/liquidity'
import { withdrawInstruction } from '@/utils/stake'

interface Farms {
  farmInfo: FarmInfo | undefined | null
  lpAccount: string | undefined | null
  rewardAccount: string | undefined | null
  infoAccount: string | undefined | null
  amount: TokenAmount
}

export async function unstakeAll(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  farms: Array<Farms>
) {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!farms) throw new Error('Miss pool infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  farms.forEach(async (farm) => {
    const { farmInfo, lpAccount, rewardAccount, infoAccount, amount } = farm

    if (!farmInfo) throw new Error('Miss pool infomations')
    if (!lpAccount || !infoAccount) throw new Error('Miss account infomations')
    if (!amount) throw new Error('Miss amount infomations')

    // 如果没有奖励地址 创一个
    const userRewardTokenAccount = await createTokenAccountIfNotExist(
      connection,
      rewardAccount,
      owner,
      farmInfo.reward.mintAddress,
      transaction,
      signers
    )

    const programId = new PublicKey(farmInfo.programId)

    transaction.add(
      withdrawInstruction(
        programId,
        new PublicKey(farmInfo.poolId),
        new PublicKey(farmInfo.poolAuthority),
        new PublicKey(infoAccount),
        wallet.publicKey,
        new PublicKey(lpAccount),
        new PublicKey(farmInfo.poolLpTokenAccount),
        userRewardTokenAccount,
        new PublicKey(farmInfo.poolRewardTokenAccount),
        amount.wei.toNumber()
      )
    )
  })

  return await sendTransaction(connection, wallet, transaction, signers)
}

interface Pools {
  poolInfo: LiquidityPoolInfo | undefined | null
  lpAccount: string | undefined | null
  fromCoinAccount: string | undefined | null
  toCoinAccount: string | undefined | null
  amount: TokenAmount
}

export async function removeAll(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  pools: Array<Pools>
) {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!pools) throw new Error('Miss pool infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  pools.forEach(async (pool) => {
    const { poolInfo, lpAccount, fromCoinAccount, toCoinAccount, amount } = pool

    if (!poolInfo) throw new Error('Miss pool infomations')
    if (!lpAccount || !fromCoinAccount || !toCoinAccount) throw new Error('Miss account infomations')
    if (!amount) throw new Error('Miss amount infomations')

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
        wrappedSolAccount || new PublicKey(toCoinAccount),
        owner,

        amount.wei.toNumber()
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
  })

  return await sendTransaction(connection, wallet, transaction, signers)
}
