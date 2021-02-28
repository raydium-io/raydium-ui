import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'

import { NATIVE_SOL } from '@/utils/tokens'
import { TOKEN_PROGRAM_ID } from '@project-serum/token'
import { formatUnits } from '@ethersproject/units'
import logger from '@/utils/logger'

export const state = () => ({
  modalShow: false,

  connected: false,
  address: '',
  // endpoint: 'https://api.mainnet-beta.solana.com',
  endpoint: 'https://solana-api.projectserum.com',

  tokenAccountsLoading: false,
  tokenAccounts: {},
})

export const mutations = {
  setModal(state: any, show: boolean) {
    state.modalShow = show
  },

  connected(state: any, address: any) {
    state.connected = true
    state.address = address
  },

  disconnected(state: any) {
    state.connected = false
    state.address = ''
  },

  loadingTokenAccounts(state: any, loading: boolean) {
    state.tokenAccountsLoading = loading
  },

  setTokenAccounts(state: any, tokenAccounts: any) {
    state.tokenAccounts = tokenAccounts
  },
}

export const actions = {
  openModal({ commit }: { commit: any }) {
    commit('setModal', true)
  },

  closeModal({ commit }: { commit: any }) {
    // 不延时切换会闪
    return new Promise((resolve) => {
      commit('setModal', false)
      setTimeout(() => {
        resolve(true)
      }, 500)
    })
  },

  getTokenAccounts({ commit }: { commit: any }) {
    const conn = (this as any)._vm.$conn
    const wallet = (this as any)._vm.$wallet

    commit('loadingTokenAccounts', true)
    conn
      .getParsedTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        },
        'confirmed'
      )
      .then(async (parsedTokenAccounts: any) => {
        const tokenAccounts: any = {}

        parsedTokenAccounts.value.forEach(
          (tokenAccountInfo: {
            pubkey: PublicKey
            account: AccountInfo<ParsedAccountData>
          }) => {
            const tokenAccountAddress = tokenAccountInfo.pubkey.toBase58()
            const parsedInfo = tokenAccountInfo.account.data.parsed.info
            const mintAddress = parsedInfo.mint
            const balance = parseInt(parsedInfo.tokenAmount.amount)
            const uiAmount = parsedInfo.tokenAmount.uiAmount

            // 如果同一 mint 有多个账户
            if (
              Object.prototype.hasOwnProperty.call(tokenAccounts, mintAddress)
            ) {
              // 且老账户没余额
              if (tokenAccounts[mintAddress].balance === 0) {
                tokenAccounts[mintAddress] = {
                  tokenAccountAddress,
                  balance,
                  uiAmount,
                }
              }
            } else {
              tokenAccounts[mintAddress] = {
                tokenAccountAddress,
                balance,
                uiAmount,
              }
            }
          }
        )

        // 获取原生 SOL 余额
        const solBalance = await conn.getBalance(wallet.publicKey, 'confirmed')
        tokenAccounts[NATIVE_SOL.mintAddress] = {
          tokenAccountAddress: wallet.publicKey.toBase58(),
          balance: solBalance,
          uiAmount: parseFloat(formatUnits(solBalance, NATIVE_SOL.decimals)),
        }

        commit('setTokenAccounts', tokenAccounts)
        commit('loadingTokenAccounts', false)

        logger('TokenAccounts updated')
      })
  },
}
