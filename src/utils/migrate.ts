import { Token, u64 as U64 } from '@solana/spl-token';
import {
  AccountInfo, Connection, ParsedAccountData, PublicKey, Transaction
} from '@solana/web3.js';
import { get } from 'lodash-es';

// import { FarmInfo } from '@/utils/farms';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@/utils/ids';
// import { TokenAmount } from '@/utils/safe-math';
import { findAssociatedTokenAddress, sendTransaction } from '@/utils/web3';

// interface Farms {
//   farmInfo: FarmInfo | undefined | null
//   lpAccount: string | undefined | null
//   rewardAccount: string | undefined | null
//   infoAccount: string | undefined | null
//   amount: TokenAmount
// }

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
