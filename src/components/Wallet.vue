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
        <Button v-for="info in wallets" :key="info.name" ghost @click="connect(info)">
          <span>{{ info.name }}</span>
          <img :src="importIcon(`/wallets/${info.name.replace(' ', '-').toLowerCase()}.png`)" />
        </Button>
      </div>
      <div v-else class="wallet-info">
        <p class="address" @click="debug">{{ wallet.address }}</p>

        <Button ghost @click="disconnect"> DISCONNECT </Button>

        <div v-if="historyList.length" class="tx-history-panel">
          <h2>Recent Transactions</h2>
          <div v-for="txInfo in historyList" :key="txInfo.txid" class="tx-item">
            <div class="extra-info">
              <Icon v-if="txInfo.status === 'success'" class="icon" type="check-circle" :style="{ color: '#52c41a' }" />
              <Icon
                v-else-if="txInfo.status === 'fail'"
                class="icon"
                type="close-circle"
                :style="{ color: '#f5222d' }"
              />
              <Icon v-else class="icon" type="loading" :style="{ color: '#1890ff' }" />
              <a :href="`${$accessor.url.explorer}/tx/${txInfo.txid}`" target="_blank">{{
                txInfo.description || txInfo.d /* old data polyfill*/
              }}</a>
            </div>
            <div class="extra-info time">{{ $dayjs(txInfo.time || txInfo.t /* old data polyfill*/) }}</div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { Button, Modal, Icon } from 'ant-design-vue'
import {
  AccountInfo,
  Context
  // PublicKey
} from '@solana/web3.js'
// @ts-ignore
import SolanaWalletAdapter from '@project-serum/sol-wallet-adapter'

import importIcon from '@/utils/import-icon'
import logger from '@/utils/logger'
import { web3Config, commitment } from '@/utils/web3'
import {
  SolongWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  BloctoWalletAdapter,
  LedgerWalletAdapter,
  Coin98WalletAdapter,
  SafePalWalletAdapter
} from '@/wallets'
import { WalletAdapter } from '@solana/wallet-base'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

interface WalletInfo {
  name: string
  url: string
  installUrl?: string
  // isExtension: boolean
  getAdapter: ({ providerUrl, endpoint }: { providerUrl: any; endpoint: string }) => WalletAdapter | undefined
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
  // TrustWallet ezDeFi
  wallets: WalletInfo[] = [
    {
      name: 'Phantom',
      url: 'https://phantom.app',
      installUrl: 'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
      getAdapter() {
        if ((window as any).solana === undefined || !(window as any).solana.isPhantom) {
          return
        }

        return new PhantomWalletAdapter()
      }
    },
    {
      name: 'Sollet Web',
      url: 'https://www.sollet.io',
      getAdapter({ providerUrl, endpoint }: { providerUrl: string; endpoint: string }) {
        return new SolanaWalletAdapter(providerUrl, endpoint)
      }
    },
    {
      name: 'Sollet Extension',
      url: 'https://www.sollet.io',
      installUrl: 'https://chrome.google.com/webstore/detail/sollet/fhmfendgdocmcbmfikdcogofphimnkno',
      getAdapter({ endpoint }: { endpoint: string }) {
        if ((window as any).sollet === undefined) {
          return
        }

        return new SolanaWalletAdapter((window as any).sollet, endpoint)
      }
    },
    {
      name: 'Ledger',
      url: 'https://www.ledger.com',
      getAdapter() {
        return new LedgerWalletAdapter()
      }
    },
    {
      name: 'MathWallet',
      url: 'https://mathwallet.org',
      installUrl: 'https://chrome.google.com/webstore/detail/math-wallet/afbcbjpbpfadlkmhmclhkeeodmamcflc',
      getAdapter() {
        if ((window as any).solana === undefined || !(window as any).solana.isMathWallet) {
          return
        }

        return new MathWalletAdapter()
      }
    },
    {
      name: 'Solong',
      url: 'https://solongwallet.com',
      installUrl: 'https://chrome.google.com/webstore/detail/solong/memijejgibaodndkimcclfapfladdchj',
      getAdapter() {
        if ((window as any).solong === undefined) {
          return
        }

        return new SolongWalletAdapter()
      }
    },
    {
      name: 'Coin98',
      url: 'https://www.coin98.com',
      installUrl: 'https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg',
      getAdapter() {
        if ((window as any).coin98 === undefined) {
          return
        }

        return new Coin98WalletAdapter()
      }
    },
    {
      name: 'Blocto',
      url: 'https://blocto.portto.io',
      getAdapter() {
        if ((window as any).solana === undefined || !(window as any).solana.isBlocto) {
          return
        }

        return new BloctoWalletAdapter()
      }
    },
    {
      name: 'SafePal',
      url: 'https://safepal.io',
      getAdapter() {
        if ((window as any).solana === undefined || !(window as any).solana.isSafePalWallet) {
          return
        }

        return new SafePalWalletAdapter()
      }
    },
    {
      name: 'Solflare',
      url: 'https://solflare.com/access-wallet',
      getAdapter({ providerUrl, endpoint }: { providerUrl: string; endpoint: string }) {
        return new SolanaWalletAdapter(providerUrl, endpoint)
      }
    },
    {
      name: 'Bonfida',
      url: 'https://bonfida.com/wallet',
      getAdapter({ providerUrl, endpoint }: { providerUrl: string; endpoint: string }) {
        return new SolanaWalletAdapter(providerUrl, endpoint)
      }
    }
  ]

  // auto refresh
  walletTimer: number | undefined = undefined
  priceTimer: number | undefined = undefined
  liquidityTimer: number | undefined = undefined
  farmTimer: number | undefined = undefined
  idoTimer: number | undefined = undefined
  // web3 listener
  walletListenerId = null as number | null

  debugCount = 0

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

  // history
  get historyList() {
    const rawList = Object.entries(this.$accessor.transaction.history[this.$accessor.wallet.address] ?? {}).map(
      ([txid, txInfo]) => ({
        ...(txInfo as any),
        txid
      })
    )
    return rawList.sort((a, b) => {
      return (b.time || b.t) - (a.time || a.t)
    })
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

  connect(wallet: WalletInfo) {
    const { rpcs } = web3Config
    const endpoint = rpcs[0].url

    const { name, url, installUrl } = wallet
    const adapter = wallet.getAdapter({ providerUrl: url, endpoint })

    if (!adapter) {
      // is extension and not installed
      this.$notify.error({
        message: 'Connect wallet failed',
        description: (h: any) => {
          const msg = [
            `Please install and initialize ${name} wallet extension first, `,
            h('a', { attrs: { href: url, target: '_blank' } }, 'click here to visit official website')
          ]

          if (installUrl) {
            msg.push(' or ')
            msg.push(h('a', { attrs: { href: installUrl, target: '_blank' } }, 'click here to install extension'))
          }

          return h('div', msg)
        }
      })
      return
    }

    adapter.on('connect', () => {
      this.$accessor.wallet.closeModal().then(() => {
        if (adapter.publicKey) {
          // mock wallet
          // const address = new PublicKey('')
          // Vue.prototype.$wallet = {
          //   connected: true,
          //   publicKey: address,
          //   signTransaction: (transaction: any) => {
          //     console.log(transaction)
          //   }
          // }
          // this.$accessor.wallet.setConnected(address.toBase58())

          Vue.prototype.$wallet = adapter
          this.$accessor.wallet.setConnected(adapter.publicKey.toBase58())

          this.subWallet()
          this.$notify.success({
            message: 'Wallet connected',
            description: ''
          })
        }
      })
    })

    adapter.on('disconnect', () => {
      this.disconnect()
    })

    try {
      adapter.connect()
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

  debug() {
    if (this.debugCount < 10) {
      this.debugCount += 1
    } else {
      this.$router.push({ path: '/debug/' })
      this.debugCount = 0
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
.tx-history-panel {
  h2 {
    margin-top: 32px;
    text-align: left;
  }
  .tx-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .extra-info {
      font-size: 0.9em;
      opacity: 0.8;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      a {
        font-size: 1.2em;
      }

      .icon {
        margin-right: 8px;
      }
    }
    .extra-info.time {
      flex-shrink: 0;
    }
  }
}
</style>
