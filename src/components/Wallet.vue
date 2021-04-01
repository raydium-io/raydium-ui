<template>
  <div>
    <Button v-if="!wallet.connected" ghost @click="$store.dispatch('wallet/openModal')">
      <Icon type="wallet" />
      Connect
    </Button>
    <Button v-else ghost @click="$store.dispatch('wallet/openModal')">
      <Icon type="wallet" />
      {{ wallet.address.substr(0, 4) }}
      ...
      {{ wallet.address.substr(wallet.address.length - 4, 4) }}
    </Button>

    <Modal
      :title="!wallet.connected ? 'Connect to a wallet' : 'Your wallet'"
      :visible="wallet.modalShow"
      :footer="null"
      centered
      @cancel="$store.dispatch('wallet/closeModal')"
    >
      <div v-if="!wallet.connected" class="select-wallet">
        <Button v-for="(providerUrl, name) in wallets" :key="name" ghost @click="connect(name)">
          <span>{{ name }}</span>
          <img :src="importIcon(`/wallets/${name.toLowerCase()}.png`)" />
        </Button>
      </div>
      <div v-else class="wallet-info">
        <p class="address">{{ wallet.address }}</p>

        <Button ghost @click="disconnect"> DISCONNECT </Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Button, Modal, Icon } from 'ant-design-vue'
import {
  // types
  AccountInfo,
  Context
} from '@solana/web3.js'
// @ts-ignore
import SolanaWalletAdapter from '@project-serum/sol-wallet-adapter'

import importIcon from '@/utils/import-icon'
import logger from '@/utils/logger'
import { endpoint, commitment } from '@/utils/web3'
import { WalletAdapter, SolongWalletAdapter, MathWalletAdapter, LedgerWalletAdapter } from '@/wallets'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

interface Wallets {
  [key: string]: string
}

export default Vue.extend({
  components: {
    Button,
    Modal,
    Icon
  },

  data() {
    return {
      wallets: {
        Ledger: '',
        Solong: '',
        // TrustWallet: '',
        MathWallet: '',
        Sollet: 'https://www.sollet.io',
        // Solflare: 'https://solflare.com/access-wallet',
        Bonfida: 'https://bonfida.com/wallet'
        // https://docs.coin98.app/coin98-extension/developer-guide
        // Coin98: ''
        // ezDeFi: '',
      } as Wallets,

      // auto refresh
      walletTimer: null as any,
      priceTimer: null as any,
      liquidityTimer: null as any,
      farmTimer: null as any,
      // listener
      walletListenerId: null as number | undefined | null
    }
  },

  computed: {
    ...mapState(['wallet', 'price', 'swap', 'liquidity', 'farm'])
  },

  watch: {},

  mounted() {
    this.$store.dispatch('price/requestPrices')
    this.$store.dispatch('swap/getMarkets')
    this.$store.dispatch('liquidity/requestInfos')
    this.$store.dispatch('farm/requestInfos')

    this.setWalletTimer()
    this.setPriceTimer()
    this.setLiquidityTimer()
    this.setFarmTimer()
  },

  destroyed() {
    clearInterval(this.walletTimer)
    clearInterval(this.priceTimer)
    clearInterval(this.liquidityTimer)
    clearInterval(this.farmTimer)
  },

  methods: {
    importIcon,

    connect(walletName: string) {
      let wallet: WalletAdapter | null = null

      switch (walletName) {
        case 'Ledger': {
          wallet = new LedgerWalletAdapter()
          break
        }
        case 'Solong': {
          if ((window as any).solong === undefined) {
            this.$notify.error({
              message: 'Connect wallet failed',
              description: 'Please install and initialize Solong wallet first'
            })
            return
          }

          wallet = new SolongWalletAdapter()
          break
        }
        case 'MathWallet': {
          if ((window as any).solana === undefined || !(window as any).solana.isMathWallet) {
            this.$notify.error({
              message: 'Connect wallet failed',
              description: 'Please install and initialize Math wallet first'
            })
            return
          }

          wallet = new MathWalletAdapter()
          break
        }
        default: {
          wallet = new SolanaWalletAdapter(this.wallets[walletName], endpoint)
          break
        }
      }

      wallet?.on('connect', () => {
        this.$store.dispatch('wallet/closeModal').then(() => {
          Vue.prototype.$wallet = wallet

          this.$accessor.wallet.setConnected(wallet?.publicKey.toBase58())

          this.subWallet()
          this.$notify.success({
            message: 'Wallet connected',
            description: ''
          })
        })
      })

      wallet?.on('disconnect', () => {})

      try {
        wallet?.connect()
      } catch (error) {
        this.$notify.error({
          message: 'Connect wallet failed',
          description: error.message
        })
      }
    },

    disconnect() {
      Vue.prototype.$wallet.disconnect()
      Vue.prototype.$wallet = null

      this.unsubWallet()

      this.$store.commit('wallet/disconnected')
      this.$notify.warning({
        message: 'Wallet disconnected',
        description: ''
      })
    },

    onWalletChange(_accountInfo: AccountInfo<Buffer>, context: Context): void {
      logger('onAccountChange')

      const { slot } = context

      if (slot !== this.wallet.lastSubBlock) {
        this.$store.commit('wallet/setLastSubBlock', slot)
        this.$store.dispatch('wallet/getTokenAccounts')
        this.$store.dispatch('farm/getStakeAccounts')
      }
    },

    subWallet() {
      const wallet = (this as any).$wallet

      this.walletListenerId = this.$web3.onAccountChange(wallet.publicKey, this.onWalletChange, commitment)

      this.$store.dispatch('wallet/getTokenAccounts')
      this.$store.dispatch('farm/getStakeAccounts')
    },

    unsubWallet() {
      if (this.walletListenerId) {
        this.$web3.removeAccountChangeListener(this.walletListenerId)
      }
    },

    setWalletTimer() {
      this.walletTimer = setInterval(() => {
        if (this.wallet.connected && !this.wallet.loading) {
          if (this.wallet.countdown < this.wallet.autoRefreshTime) {
            this.$store.commit('wallet/setCountdown', this.wallet.countdown + 1)

            if (this.wallet.countdown === this.wallet.autoRefreshTime) {
              this.$store.dispatch('wallet/getTokenAccounts')
            }
          }
        }
      }, 1000)
    },

    setPriceTimer() {
      this.priceTimer = setInterval(() => {
        if (!this.price.loading) {
          if (this.price.countdown < this.price.autoRefreshTime) {
            this.$store.commit('price/setCountdown', this.price.countdown + 1)

            if (this.price.countdown === this.price.autoRefreshTime) {
              this.$store.dispatch('price/requestPrices')
            }
          }
        }
      }, 1000)
    },

    setLiquidityTimer() {
      this.liquidityTimer = setInterval(() => {
        if (!this.liquidity.loading) {
          if (this.liquidity.countdown < this.liquidity.autoRefreshTime) {
            this.$store.commit('liquidity/setCountdown', this.liquidity.countdown + 1)

            if (this.liquidity.countdown === this.liquidity.autoRefreshTime) {
              this.$store.dispatch('liquidity/requestInfos')
            }
          }
        }
      }, 1000)
    },

    setFarmTimer() {
      this.farmTimer = setInterval(() => {
        if (!this.farm.loading) {
          if (this.farm.countdown < this.farm.autoRefreshTime) {
            this.$store.commit('farm/setCountdown', this.farm.countdown + 1)

            if (this.farm.countdown === this.farm.autoRefreshTime) {
              this.$store.dispatch('farm/requestInfos')
            }
          }
        }
      }, 1000)
    }
  }
})
</script>

<style lang="less">
@import '../styles/variables';

.ant-modal-content {
  background-color: @modal-header-bg;

  .ant-modal-close {
    color: @text-color;
  }
}

.select-wallet {
  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    width: 100%;
    height: 48px;
    text-align: left;

    img {
      height: 32px;
      width: 32px;
      border-radius: 50%;
    }
  }

  button:not(:first-child) {
    margin-top: 10px;
  }
}
</style>

<style lang="less" scoped>
.wallet-info {
  text-align: center;

  .address {
    font-size: 17px;
  }
}
</style>
