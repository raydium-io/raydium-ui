import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'

import { NATIVE_SOL } from '@/utils/tokens'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  modalShow: false,

  connected: false,
  address: '',
  // endpoint: 'https://api.mainnet-beta.solana.com',
  endpoint: 'https://solana-api.projectserum.com',

  loading: false,
  tokenAccounts: {},
  // 自动刷新倒计时
  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,
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

  setLoading(state: any, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setTokenAccounts(state: any, tokenAccounts: any) {
    state.tokenAccounts = cloneDeep(tokenAccounts)
  },

  setCountdown(state: any, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state: any, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
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

    commit('setLoading', true)
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
            const balance = new TokenAmount(
              parsedInfo.tokenAmount.amount,
              parsedInfo.tokenAmount.decimals
            )

            // 如果同一 mint 有多个账户
            if (
              Object.prototype.hasOwnProperty.call(tokenAccounts, mintAddress)
            ) {
              // 且老账户没余额
              if (tokenAccounts[mintAddress].balance === 0) {
                tokenAccounts[mintAddress] = {
                  tokenAccountAddress,
                  balance,
                }
              }
            } else {
              tokenAccounts[mintAddress] = {
                tokenAccountAddress,
                balance,
              }
            }
          }
        )

        // 获取原生 SOL 余额
        const solBalance = await conn.getBalance(wallet.publicKey, 'confirmed')
        tokenAccounts[NATIVE_SOL.mintAddress] = {
          tokenAccountAddress: wallet.publicKey.toBase58(),
          balance: new TokenAmount(solBalance, NATIVE_SOL.decimals),
        }

        commit('setTokenAccounts', tokenAccounts)
        logger('Wallet TokenAccounts updated')
      })
      .finally(() => {
        commit('setLoading', false)
      })
  },
}
