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
      :visible="showModal"
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
          {{ name }}
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

// @ts-ignore
import SolanaWallet from '@project-serum/sol-wallet-adapter'

import SolongWallet from '@/utils/solong-wallet'

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
})
export default class Wallet extends Vue {
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

  showModal = false

  openModal() {
    this.showModal = true
  }

  closeModal() {
    return new Promise((resolve) => {
      this.showModal = false
      setTimeout(() => {
        resolve(true)
      }, 500)
    })
  }

  connect(walletName: string) {
    const self = this
    let wallet: any

    switch (walletName) {
      case 'Solong': {
        wallet = new SolongWallet()
        break
      }
      case 'MathWallet': {
        wallet = new SolanaWallet((window as any).solana)
        break
      }
      default: {
        wallet = new SolanaWallet((this.wallets as any)[walletName])
        break
      }
    }

    wallet.on('connect', () => {
      this.closeModal().then(() => {
        ;(window as any).rayWallet = wallet

        self.$store.commit('wallet/connected', wallet.publicKey.toBase58())
        ;(self as any).$notify.success({
          message: 'Wallet connected',
          description: '',
        })
      })
    })

    wallet.on('disconnect', () => {
      ;(window as any).rayWallet = null

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
    ;(window as any).rayWallet.disconnect()
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
    width: 100%;
    height: 48px;
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
