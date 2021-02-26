<template>
  <div>
    <Button v-if="!wallet.connected" ghost @click="openModal">
      CONNECT WALLET
    </Button>
    <Button v-else ghost @click="openModal">
      <Icon type="wallet" />
      {{ wallet.address.substr(0, 4) }}
      ...
      {{ wallet.address.substr(wallet.address.length - 4, 4) }}
    </Button>

    <Modal
      :title="!wallet.connected ? 'Connect to a wallet' : 'Your wallet'"
      :visible="modalShow"
      :footer="null"
      @cancel="closeModal"
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
import Component from 'vue-class-component'
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

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

@Component({
  components: {
    Button,
    Modal,
    Icon,
  },

  computed: {
    ...mapState(['wallet']),
  },

  methods: {
    importIcon,
  },
})
export default class Wallet extends Vue {
  $wallet: SolanaWallet | SolongWallet | null = null
  $conn: Connection | null = null

  wallets = {
    Solong: '',
    // TrustWallet: '',
    MathWallet: '',
    Sollet: 'https://www.sollet.io',
    // Solflare: 'https://solflare.com/access-wallet',
    Bonfida: 'https://bonfida.com/wallet',
    // ezDeFi: '',
    // Coin98: '',
  }

  // wallet websocket listeners
  accountChangeListenerId: number | undefined | null = null

  modalShow = false

  openModal() {
    this.modalShow = true
  }

  closeModal() {
    return new Promise((resolve) => {
      this.modalShow = false
      setTimeout(() => {
        resolve(true)
      }, 500)
    })
  }

  connect(walletName: string) {
    const self = this
    let wallet: SolanaWallet | SolongWallet | null = null

    switch (walletName) {
      case 'Solong': {
        wallet = new SolongWallet()
        break
      }
      case 'MathWallet': {
        wallet = new SolanaWallet(
          (window as any).solana,
          (this as any).wallet.endpoint
        )
        break
      }
      default: {
        wallet = new SolanaWallet(
          (this.wallets as any)[walletName],
          (this as any).wallet.endpoint
        )
        break
      }
    }

    wallet.on('connect', () => {
      this.closeModal().then(() => {
        const connection = new Connection((this as any).wallet.endpoint)

        Vue.prototype.$wallet = wallet
        Vue.prototype.$conn = connection

        self.$store.commit('wallet/connected', wallet.publicKey.toBase58())

        this.subWebsocket()
        ;(self as any).$notify.success({
          message: 'Wallet connected',
          description: '',
        })
      })
    })

    wallet.on('disconnect', () => {
      Vue.prototype.$wallet = null
      Vue.prototype.$conn = null

      this.unsubWebsocket()

      this.$store.commit('wallet/disconnected')
      ;(self as any).$notify.warning({
        message: 'Wallet disconnected',
      })
    })

    try {
      wallet.connect()
    } catch (error) {
      ;(this as any).error({
        message: 'Connect wallet failed',
        description: error.message,
      })
    }
  }

  disconnect() {
    Vue.prototype.$wallet.disconnect()
  }

  onAccountChange(accountInfo: AccountInfo<Buffer>, context: Context): void {
    logger('onAccountChange')
    logger(accountInfo, context)

    this.$store.dispatch('wallet/getTokenAccounts')
  }

  subWebsocket() {
    const conn = this.$conn
    const wallet = this.$wallet

    this.accountChangeListenerId = conn?.onAccountChange(
      wallet.publicKey,
      this.onAccountChange,
      'confirmed'
    )

    this.$store.dispatch('wallet/getTokenAccounts')
  }

  unsubWebsocket() {
    const conn = this.$conn

    if (this.accountChangeListenerId) {
      conn?.removeAccountChangeListener(this.accountChangeListenerId)
    }
  }
}
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
