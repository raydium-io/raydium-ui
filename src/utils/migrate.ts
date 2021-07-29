import { getBigNumber } from './layouts'
import { Connection, PublicKey, Transaction, AccountInfo, ParsedAccountData } from '@solana/web3.js'
import { sendTransaction, findAssociatedTokenAddress, createAssociatedTokenAccountIfNotExist } from '@/utils/web3'
import { Token, u64 as U64 } from '@solana/spl-token'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@/utils/ids'

import { get } from 'lodash-es'
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

export async function mergeTokens(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  auxiliaryTokenAccounts: Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }>,
  tokenAccounts: any
) {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!auxiliaryTokenAccounts || auxiliaryTokenAccounts.length === 0)
    throw new Error('Miss auxiliary accounts infomations')

  const owner = wallet.publicKey

  const { blockhash } = await connection.getRecentBlockhash()
  const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: owner })
  const signers: any = []

  const atas: string[] = []

  for (let index = 0; index < auxiliaryTokenAccounts.length; index++) {
    if (index > 0) {
      try {
        const data = transaction.compileMessage().serialize()
        // 1280 - 40 - 8 - 64 - 1 - 256
        if (data.length > 911) {
          break
        }
      } catch {
        break
      }
    }

    const auxiliaryTokenAccount = auxiliaryTokenAccounts[index]

    const { pubkey: from, account: accountInfo } = auxiliaryTokenAccount
    const { info } = accountInfo.data.parsed
    const { mint, tokenAmount } = info

    const mintPubkey = new PublicKey(mint)

    const ata = await findAssociatedTokenAddress(owner, mintPubkey)
    const ataAccountInfo = get(tokenAccounts, mint)

    if (!ataAccountInfo && !atas.includes(ata.toBase58())) {
      transaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mintPubkey,
          ata,
          owner,
          owner
        )
      )
      atas.push(ata.toBase58())
    }

    const { amount } = tokenAmount
    transaction.add(Token.createTransferInstruction(TOKEN_PROGRAM_ID, from, ata, owner, [], new U64(amount)))
  }

  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function unstakeAll(
  connection: Connection | undefined | null,
  wallet: any | undefined | null,
  farms: Array<Farms>
) {
  if (!connection || !wallet) throw new Error('Miss connection')
  if (!farms || farms.length === 0) throw new Error('Miss farms infomations')

  const transaction = new Transaction()
  const signers: any = []

  const owner = wallet.publicKey

  const atas: string[] = []

  farms.forEach(async (farm) => {
    const { farmInfo, lpAccount, rewardAccount, infoAccount, amount } = farm

    if (!farmInfo) throw new Error('Miss pool infomations')
    if (!infoAccount) throw new Error('Miss account infomations')
    if (!amount) throw new Error('Miss amount infomations')

    const userLpAccount = await createAssociatedTokenAccountIfNotExist(
      lpAccount,
      owner,
      farmInfo.lp.mintAddress,
      transaction,
      atas
    )
    // if no reward account, create new one
    const userRewardTokenAccount = await createAssociatedTokenAccountIfNotExist(
      rewardAccount,
      owner,
      farmInfo.reward.mintAddress,
      transaction,
      atas
    )

    const programId = new PublicKey(farmInfo.programId)

    transaction.add(
      withdrawInstruction(
        programId,
        new PublicKey(farmInfo.poolId),
        new PublicKey(farmInfo.poolAuthority),
        new PublicKey(infoAccount),
        wallet.publicKey,
        userLpAccount,
        new PublicKey(farmInfo.poolLpTokenAccount),
        userRewardTokenAccount,
        new PublicKey(farmInfo.poolRewardTokenAccount),
        getBigNumber(amount.wei)
      )
    )
  })

  return await sendTransaction(connection, wallet, transaction, signers)
}
