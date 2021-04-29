import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'

import { NATIVE_SOL } from '@/utils/tokens'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
import { TokenAmount, lt } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,
  modalShow: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  connected: false,
  address: '',

  tokenAccounts: {}
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setModal(state, show: boolean) {
    state.modalShow = show
  },

  setConnected(state, address: string) {
    state.connected = true
    state.address = address
  },

  setDisconnected(state) {
    state.connected = false
    state.address = ''
  },

  setInitialized(state) {
    state.initialized = true
  },

  setLoading(state, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setTokenAccounts(state, tokenAccounts: any) {
    state.tokenAccounts = cloneDeep(tokenAccounts)
  },

  setCountdown(state, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal({ commit }) {
      commit('setModal', true)
    },

    closeModal({ commit }) {
      return new Promise((resolve) => {
        commit('setModal', false)
        setTimeout(() => {
          resolve(true)
        }, 500)
      })
    },

    getTokenAccounts({ commit }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet

      if (wallet && wallet.connected) {
        commit('setLoading', true)

        conn
          .getParsedTokenAccountsByOwner(
            wallet.publicKey,
            {
              programId: TOKEN_PROGRAM_ID
            },
            'confirmed'
          )
          .then(async (parsedTokenAccounts: any) => {
            const tokenAccounts: any = {}

            parsedTokenAccounts.value.forEach(
              (tokenAccountInfo: { pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }) => {
                const tokenAccountAddress = tokenAccountInfo.pubkey.toBase58()
                const parsedInfo = tokenAccountInfo.account.data.parsed.info
                const mintAddress = parsedInfo.mint
                const balance = new TokenAmount(parsedInfo.tokenAmount.amount, parsedInfo.tokenAmount.decimals)

                if (Object.prototype.hasOwnProperty.call(tokenAccounts, mintAddress)) {
                  if (lt(tokenAccounts[mintAddress].balance.wei.toNumber(), balance.wei.toNumber())) {
                    tokenAccounts[mintAddress] = {
                      tokenAccountAddress,
                      balance
                    }
                  }
                } else {
                  tokenAccounts[mintAddress] = {
                    tokenAccountAddress,
                    balance
                  }
                }
              }
            )

            const solBalance = await conn.getBalance(wallet.publicKey, 'confirmed')
            tokenAccounts[NATIVE_SOL.mintAddress] = {
              tokenAccountAddress: wallet.publicKey.toBase58(),
              balance: new TokenAmount(solBalance, NATIVE_SOL.decimals)
            }

            commit('setTokenAccounts', tokenAccounts)
            logger('Wallet TokenAccounts updated')
          })
          .catch()
          .finally(() => {
            commit('setInitialized')
            commit('setLoading', false)
          })
      }
    }
  }
)
