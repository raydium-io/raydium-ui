import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { createTokenAccountIfNotExist, sendTransaction } from '@/utils/web3'

import { FarmInfo } from '@/utils/farms'
import { TokenAmount } from '@/utils/safe-math'
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

    // if no reward account, create new one
    const userRewardTokenAccount = await createTokenAccountIfNotExist(
      connection,
      rewardAccount,
      owner,
      farmInfo.reward.mintAddress,
      null,
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
