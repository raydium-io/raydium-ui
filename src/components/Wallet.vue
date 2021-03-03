<template>
  <div>
    <Button
      v-if="!wallet.connected"
      ghost
      @click="$store.dispatch('wallet/openModal')"
    >
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
        <Button
          v-for="(providerUrl, name) in wallets"
          :key="name"
          ghost
          @click="connect(name)"
        >
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
  Connection,
  // types
  AccountInfo,
  Context,
} from '@solana/web3.js'
// @ts-ignore
import SolanaWallet from '@project-serum/sol-wallet-adapter'

import SolongWallet from '@/utils/solong-wallet'
import importIcon from '@/utils/import-icon'
import logger from '@/utils/logger'
import commitment from '@/utils/commitment'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

interface Wallets {
  [key: string]: any
  [index: number]: any
}

export default Vue.extend({
  components: {
    Button,
    Modal,
    Icon,
  },

  data() {
    return {
      wallets: {
        Solong: '',
        // TrustWallet: '',
        MathWallet: '',
        Sollet: 'https://www.sollet.io',
        // Solflare: 'https://solflare.com/access-wallet',
        Bonfida: 'https://bonfida.com/wallet',
        // ezDeFi: '',
        // Coin98: '',
      } as Wallets,

      // 自动刷新倒计时
      walletTimer: null as any,
      liquidityTimer: null as any,
      // 订阅变动
      walletListenerId: null as number | undefined | null,
      poolListenerId: null,
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity']),
  },

  mounted() {
    const conn = new Connection(this.wallet.endpoint)
    Vue.prototype.$conn = conn

    this.$store.dispatch('liquidity/getLiquidityPoolInfo')

    this.setWalletTimer()
    this.setLiquidityTimer()
  },

  destroyed() {
    clearInterval(this.walletTimer)
    clearInterval(this.liquidityTimer)
  },

  methods: {
    importIcon,

    connect(walletName: string) {
      const self = this
      let wallet: SolanaWallet | SolongWallet | null = null

      switch (walletName) {
        case 'Solong': {
          if ((window as any).solong === undefined) {
            ;(this as any).$notify.error({
              message: 'Connect wallet failed',
              description: 'Please install and initialize Solong first',
            })
            return
          }

          wallet = new SolongWallet()
          break
        }
        case 'MathWallet': {
          if ((window as any).solana === undefined) {
            ;(this as any).$notify.error({
              message: 'Connect wallet failed',
              description: 'Please install and initialize MathWallet first',
            })
            return
          }

          wallet = new SolanaWallet(
            (window as any).solana,
            this.wallet.endpoint
          )
          break
        }
        default: {
          wallet = new SolanaWallet(
            this.wallets[walletName],
            this.wallet.endpoint
          )
          break
        }
      }

      wallet.on('connect', () => {
        this.$store.dispatch('wallet/closeModal').then(() => {
          Vue.prototype.$wallet = wallet

          self.$store.commit('wallet/connected', wallet.publicKey.toBase58())

          this.subWallet()
          ;(self as any).$notify.success({
            message: 'Wallet connected',
            description: '',
          })
        })
      })

      wallet.on('disconnect', () => {})

      try {
        wallet.connect()
      } catch (error) {
        ;(this as any).$notify.error({
          message: 'Connect wallet failed',
          description: error.message,
        })
      }
    },

    disconnect() {
      Vue.prototype.$wallet.disconnect()
      Vue.prototype.$wallet = null

      this.unsubWallet()

      this.$store.commit('wallet/disconnected')
      ;(self as any).$notify.warning({
        message: 'Wallet disconnected',
      })
    },

    onWalletChange(_accountInfo: AccountInfo<Buffer>, context: Context): void {
      logger('onAccountChange')

      const { slot } = context

      if (slot !== this.wallet.lastSubBlock) {
        this.$store.commit('wallet/setLastSubBlock', slot)
        this.$store.dispatch('wallet/getTokenAccounts')
      }
    },

    subWallet() {
      const conn = (this as any).$conn
      const wallet = (this as any).$wallet

      this.walletListenerId = conn.onAccountChange(
        wallet.publicKey,
        this.onWalletChange,
        commitment
      )

      this.$store.dispatch('wallet/getTokenAccounts')
    },

    unsubWallet() {
      const conn = (this as any).$conn

      if (this.walletListenerId) {
        conn.removeAccountChangeListener(this.walletListenerId)
      }
    },

    setWalletTimer() {
      const self = this

      this.walletTimer = setInterval(function () {
        if (self.wallet.connected && !self.wallet.loading) {
          if (self.wallet.countdown < self.wallet.autoRefreshTime) {
            self.$store.commit('wallet/setCountdown', self.wallet.countdown + 1)

            if (self.wallet.countdown === self.wallet.autoRefreshTime) {
              self.$store.dispatch('wallet/getTokenAccounts')
            }
          }
        }
      }, 1000)
    },

    setLiquidityTimer() {
      const self = this

      this.liquidityTimer = setInterval(function () {
        if (!self.liquidity.quoting) {
          if (self.liquidity.countdown < self.liquidity.autoRefreshTime) {
            self.$store.commit(
              'liquidity/setCountdown',
              self.liquidity.countdown + 1
            )

            if (self.liquidity.countdown === self.liquidity.autoRefreshTime) {
              self.$store.dispatch('liquidity/getLiquidityPoolInfo')
            }
          }
        }
      }, 1000)
    },
  },
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
