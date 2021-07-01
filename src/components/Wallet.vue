<template>
  <div>
    <Button v-if="!wallet.connected" ghost @click="$accessor.wallet.openModal">
      <Icon type="wallet" />
      Connect
    </Button>
    <Button v-else ghost @click="$accessor.wallet.openModal">
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
      @cancel="$accessor.wallet.closeModal"
    >
      <div v-if="!wallet.connected" class="select-wallet">
        <Button v-for="(providerUrl, name) in wallets" :key="name" ghost @click="connect(name)">
          <span>{{ name }}</span>
          <img :src="importIcon(`/wallets/${name.replace(' ', '-').toLowerCase()}.png`)" />
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
import { Vue, Component } from 'nuxt-property-decorator'
import { Button, Modal, Icon } from 'ant-design-vue'
import { AccountInfo, Context } from '@solana/web3.js'
// @ts-ignore
import SolanaWalletAdapter from '@project-serum/sol-wallet-adapter'

import importIcon from '@/utils/import-icon'
import logger from '@/utils/logger'
import { web3Config, commitment } from '@/utils/web3'
import {
  WalletAdapter,
  SolongWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  BloctoWalletAdapter,
  LedgerWalletAdapter
} from '@/wallets'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

interface Wallets {
  [key: string]: string
}

@Component({
  components: {
    Button,
    Modal,
    Icon
  }
})
export default class Wallet extends Vue {
  /* ========== DATA ========== */
  wallets = {
    Ledger: '',
    'Sollet Extension': '',
    Solong: '',
    // TrustWallet: '',
    MathWallet: '',
    Phantom: '',
    Blocto: '',
    Sollet: 'https://www.sollet.io',
    Solflare: 'https://solflare.com/access-wallet',
    Bonfida: 'https://bonfida.com/wallet'
    // https://docs.coin98.app/coin98-extension/developer-guide
    // Coin98: ''
    // ezDeFi: '',
  } as Wallets

  // auto refresh
  walletTimer: number | undefined = undefined
  priceTimer: number | undefined = undefined
  liquidityTimer: number | undefined = undefined
  farmTimer: number | undefined = undefined
  idoTimer: number | undefined = undefined
  // web3 listener
  walletListenerId = null as number | null

  /* ========== COMPUTED ========== */
  get wallet() {
    return this.$accessor.wallet
  }

  get price() {
    return this.$accessor.price
  }

  get liquidity() {
    return this.$accessor.liquidity
  }

  get farm() {
    return this.$accessor.farm
  }

  get ido() {
    return this.$accessor.ido
  }

  /* ========== LIFECYCLE ========== */
  async beforeMount() {
    await this.$accessor.price.requestPrices()
    await this.$accessor.liquidity.requestInfos()
    await this.$accessor.swap.getMarkets()
    await this.$accessor.farm.requestInfos()

    this.setWalletTimer()
    this.setPriceTimer()
    this.setLiquidityTimer()
    this.setFarmTimer()
    this.setIdoTimer()
  }

  beforeDestroy() {
    window.clearInterval(this.walletTimer)
    window.clearInterval(this.priceTimer)
    window.clearInterval(this.liquidityTimer)
    window.clearInterval(this.farmTimer)
    window.clearInterval(this.idoTimer)
  }

  /* ========== WATCH ========== */

  /* ========== METHODS ========== */
  importIcon = importIcon

  connect(walletName: string) {
    let wallet: WalletAdapter
    const { rpcs } = web3Config
    const endpoint = rpcs[0]

    switch (walletName) {
      case 'Ledger': {
        wallet = new LedgerWalletAdapter()
        break
      }
      case 'Sollet Extension': {
        if ((window as any).sollet === undefined) {
          this.$notify.error({
            message: 'Connect wallet failed',
            description: 'Please install and initialize Sollet wallet extension first'
          })
          return
        }

        wallet = new SolanaWalletAdapter((window as any).sollet, endpoint)
        break
      }
      case 'Solong': {
        if ((window as any).solong === undefined) {
          this.$notify.error({
            message: 'Connect wallet failed',
            description: 'Please install and initialize Solong wallet extension first'
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
            description: 'Please install and initialize Math wallet extension first'
          })
          return
        }

        wallet = new MathWalletAdapter()
        break
      }
      case 'Phantom': {
        if ((window as any).solana === undefined || !(window as any).solana.isPhantom) {
          this.$notify.error({
            message: 'Connect wallet failed',
            description: 'Please install and initialize Phantom wallet extension first'
          })
          return
        }

        wallet = new PhantomWalletAdapter()
        break
      }
      case 'Blocto': {
        if ((window as any).solana === undefined || !(window as any).solana.isBlocto) {
          this.$notify.error({
            message: 'Connect wallet failed',
            description: 'Please install and open Blocto app first'
          })
          return
        }

        wallet = new BloctoWalletAdapter()
        break
      }
      default: {
        wallet = new SolanaWalletAdapter(this.wallets[walletName], endpoint)
        break
      }
    }

    wallet.on('connect', () => {
      this.$accessor.wallet.closeModal().then(() => {
        if (wallet.publicKey) {
          Vue.prototype.$wallet = wallet
          this.$accessor.wallet.setConnected(wallet.publicKey.toBase58())

          this.subWallet()
          this.$notify.success({
            message: 'Wallet connected',
            description: ''
          })
        }
      })
    })

    wallet.on('disconnect', () => {
      this.disconnect()
    })

    try {
      wallet.connect()
    } catch (error) {
      this.$notify.error({
        message: 'Connect wallet failed',
        description: error.message
      })
    }
  }

  disconnect() {
    Vue.prototype.$wallet.disconnect()
    Vue.prototype.$wallet = null

    this.unsubWallet()

    this.$accessor.wallet.setDisconnected()
    this.$notify.warning({
      message: 'Wallet disconnected',
      description: ''
    })
  }

  onWalletChange(_accountInfo: AccountInfo<Buffer>, context: Context): void {
    logger('onAccountChange')

    const { slot } = context

    if (slot !== this.wallet.lastSubBlock) {
      this.$accessor.wallet.setLastSubBlock(slot)
      this.$accessor.wallet.getTokenAccounts()
      this.$accessor.farm.getStakeAccounts()
      this.$accessor.ido.requestInfos()
    }
  }

  subWallet() {
    const wallet = this.$wallet
    if (wallet && wallet.publicKey) {
      this.walletListenerId = this.$web3.onAccountChange(wallet.publicKey, this.onWalletChange, commitment)

      this.$accessor.wallet.getTokenAccounts()
      this.$accessor.farm.getStakeAccounts()
      this.$accessor.ido.requestInfos()
    }
  }

  unsubWallet() {
    if (this.walletListenerId) {
      this.$web3.removeAccountChangeListener(this.walletListenerId)
    }
  }

  setWalletTimer() {
    this.walletTimer = window.setInterval(async () => {
      if (this.wallet.connected && !this.wallet.loading) {
        // vuex is connected but $wallet not, meaning window closed
        if (this.$wallet && this.$wallet.connected) {
          if (this.wallet.countdown < this.wallet.autoRefreshTime) {
            this.$accessor.wallet.setCountdown(this.$accessor.wallet.countdown + 1)
            if (this.wallet.countdown === this.wallet.autoRefreshTime) {
              await this.$accessor.wallet.getTokenAccounts()
            }
          }
        } else {
          this.disconnect()
        }
      }
    }, 1000)
  }

  setPriceTimer() {
    this.priceTimer = window.setInterval(async () => {
      if (!this.price.loading) {
        if (this.price.countdown < this.price.autoRefreshTime) {
          this.$accessor.price.setCountdown(this.$accessor.price.countdown + 1)
          if (this.price.countdown === this.price.autoRefreshTime) {
            await this.$accessor.price.requestPrices()
          }
        }
      }
    }, 1000)
  }

  setLiquidityTimer() {
    this.liquidityTimer = window.setInterval(async () => {
      if (!this.liquidity.loading) {
        if (this.liquidity.countdown < this.liquidity.autoRefreshTime) {
          this.$accessor.liquidity.setCountdown(this.$accessor.liquidity.countdown + 1)
          if (this.liquidity.countdown === this.liquidity.autoRefreshTime) {
            await this.$accessor.liquidity.requestInfos()
          }
        }
      }
    }, 1000)
  }

  setFarmTimer() {
    this.farmTimer = window.setInterval(async () => {
      if (!this.farm.loading) {
        if (this.farm.countdown < this.farm.autoRefreshTime) {
          this.$accessor.farm.setCountdown(this.$accessor.farm.countdown + 1)
          if (this.farm.countdown === this.farm.autoRefreshTime) {
            await this.$accessor.farm.requestInfos()
          }
        }
      }
    }, 1000)
  }

  setIdoTimer() {
    this.idoTimer = window.setInterval(async () => {
      if (!this.ido.loading) {
        if (this.ido.countdown < this.ido.autoRefreshTime) {
          this.$accessor.ido.setCountdown(this.$accessor.ido.countdown + 1)
          if (this.ido.countdown === this.ido.autoRefreshTime) {
            await this.$accessor.ido.requestInfos()
          }
        }
      }
    }, 1000)
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
