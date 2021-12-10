import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { PublicKey, AccountInfo, ParsedAccountData } from '@solana/web3.js'
import { cloneDeep } from 'lodash-es'

import { NATIVE_SOL, TOKENS } from '@/utils/tokens'
import { TOKEN_PROGRAM_ID } from '@/utils/ids'
import { TokenAmount } from '@/utils/safe-math'
import logger from '@/utils/logger'
import { findAssociatedTokenAddress } from '@/utils/web3'
import { ACCOUNT_LAYOUT } from '@/utils/layouts'

const AUTO_REFRESH_TIME = 60

export function getOwnedAccountsFilters(publicKey: PublicKey) {
  return [
    {
      memcmp: {
        offset: ACCOUNT_LAYOUT.offsetOf('owner'),
        bytes: publicKey.toBase58(),
      },
    },
    {
      dataSize: ACCOUNT_LAYOUT.span,
    },
  ];
}


export const state = () => ({
  initialized: false,
  loading: false,
  modalShow: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  connected: false,
  address: '',

  tokenAccounts: {},
  auxiliaryTokenAccounts: [] as Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }>
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

  setAuxiliaryTokenAccounts(
    state,
    auxiliaryTokenAccounts: Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }>
  ) {
    state.auxiliaryTokenAccounts = cloneDeep(auxiliaryTokenAccounts)
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

        const filters = getOwnedAccountsFilters(wallet.publicKey);
        conn.getProgramAccounts(TOKEN_PROGRAM_ID, {
          filters,
        }).then(async (parsedTokenAccounts) => {

            const tokenAccounts: any = {}
            const auxiliaryTokenAccounts: Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }> = []

            for (const tokenAccountInfo of parsedTokenAccounts) {
              const tokenAccountPubkey = tokenAccountInfo.pubkey
              const tokenAccountAddress = tokenAccountPubkey.toBase58()
              // console.log(`tokenAccountAddress`, tokenAccountAddress)
              const parsedData = ACCOUNT_LAYOUT.decode(tokenAccountInfo.account.data)
              // console.log(`parsedData :::: `, parsedData)
              const token = TOKENS[Object.keys(TOKENS).find(t => TOKENS[t].mintAddress === parsedData.mint.toBase58()) ?? ''];

              // const parsedInfo = parsedData.info
              const mintAddress = parsedData.mint
              const balance = new TokenAmount(parsedData.amount, token.decimals)

              const ata = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(mintAddress))
              console.log(`ata ::: `, ata.toBase58())
              // if (ata.equals(tokenAccountPubkey)) {
                tokenAccounts[mintAddress] = {
                  tokenAccountAddress,
                  balance
                }
              // } 
              // else if (parsedInfo.tokenAmount.uiAmount > 0) {
                // auxiliaryTokenAccounts.push(tokenAccountInfo)
              // }
            }

            const solBalance = await conn.getBalance(wallet.publicKey, 'confirmed')
            console.log(`tokenAccounts ::: `, tokenAccounts)
            tokenAccounts[NATIVE_SOL.mintAddress] = {
              tokenAccountAddress: wallet.publicKey.toBase58(),
              balance: new TokenAmount(solBalance, NATIVE_SOL.decimals)
            }

            commit('setAuxiliaryTokenAccounts', auxiliaryTokenAccounts)
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
