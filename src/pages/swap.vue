<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Swap</span>
      <div class="buttons">
        <Tooltip v-if="marketAddress" placement="bottomRight">
          <template slot="title">
            <span>
              Quote auto refresh countdown after
              {{ autoRefreshTime - countdown }} seconds, you can click to update manually
            </span>
            <br />
            <span> Automatically refreshes when the current pool had changed </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / autoRefreshTime) * countdown"
            :show-info="false"
            :class="marketAddress && loading ? 'disabled' : ''"
            @click="getOrderBooks"
          />
        </Tooltip>
        <Tooltip placement="bottomRight">
          <template slot="title">
            <p>Addresses</p>
            <div class="swap-info">
              <div v-if="fromCoin" class="info">
                <div class="symbol">{{ fromCoin.symbol }}</div>
                <div class="address">
                  {{ fromCoin.mintAddress.substr(0, 14) }}
                  ...
                  {{ fromCoin.mintAddress.substr(fromCoin.mintAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$store.dispatch('app/copy', fromCoin.mintAddress)" />
                </div>
              </div>
              <div v-if="toCoin" class="info">
                <div class="symbol">{{ toCoin.symbol }}</div>
                <div class="address">
                  {{ toCoin.mintAddress.substr(0, 14) }}
                  ...
                  {{ toCoin.mintAddress.substr(toCoin.mintAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$store.dispatch('app/copy', toCoin.mintAddress)" />
                </div>
              </div>
              <div v-if="marketAddress" class="info">
                <div class="symbol">Market</div>
                <div class="address">
                  {{ marketAddress.substr(0, 14) }}
                  ...
                  {{ marketAddress.substr(marketAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$store.dispatch('app/copy', marketAddress)" />
                </div>
              </div>
            </div>
          </template>
          <Icon type="info-circle" />
        </Tooltip>
        <Icon type="setting" @click="$store.dispatch('setting/open')" />
      </div>
    </div>

    <CoinSelect v-if="coinSelectShow" @onClose="() => (coinSelectShow = false)" @onSelect="onCoinSelect" />

    <div class="card">
      <div class="card-body">
        <CoinInput
          v-model="fromCoinAmount"
          label="From"
          :coin-name="fromCoin ? fromCoin.symbol : ''"
          :balance="fromCoin ? fromCoin.balance : null"
          @onInput="(amount) => (fromCoinAmount = amount)"
          @onFocus="
            () => {
              fixedFromCoin = true
            }
          "
          @onMax="
            () => {
              fixedFromCoin = true
              fromCoinAmount = fromCoin.balance.fixed()
            }
          "
          @onSelect="openFromCoinSelect"
        />

        <div class="change-side fc-container">
          <div class="fc-container" @click="changeCoinPosition">
            <Icon type="swap" :rotate="90" />
          </div>
        </div>

        <CoinInput
          v-model="toCoinAmount"
          label="To (Estimate)"
          :coin-name="toCoin ? toCoin.symbol : ''"
          :balance="toCoin ? toCoin.balance : null"
          :disabled="true"
          @onInput="(amount) => (toCoinAmount = amount)"
          @onFocus="
            () => {
              fixedFromCoin = false
            }
          "
          @onMax="
            () => {
              fixedFromCoin = false
              toCoinAmount = toCoin.balance.fixed()
            }
          "
          @onSelect="openToCoinSelect"
        />

        <Button v-if="!wallet.connected" size="large" ghost @click="$store.dispatch('wallet/openModal')">
          Connect Wallet
        </Button>
        <Button
          v-else
          size="large"
          ghost
          :disabled="!fromCoin || !fromCoinAmount || !toCoin || !marketAddress"
          @click="placeOrder"
        >
          <template v-if="!fromCoin || !toCoin"> Select a token </template>
          <template v-else-if="!fromCoinAmount"> Enter an amount </template>
          <template v-else-if="!marketAddress"> Insufficient liquidity for this trade </template>
          <template v-else-if="fromCoinAmount > fromCoin.balance"> Insufficient BNB balance </template>
          <template v-else>Swap</template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Icon, Tooltip, Button, Progress } from 'ant-design-vue'

import { cloneDeep, get } from 'lodash-es'
import { Orderbook } from '@project-serum/serum/lib/market.js'

import { getTokenBySymbol, TokenInfo } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getMultipleAccounts, commitment } from '@/utils/web3'

const RAY = getTokenBySymbol('RAY')

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Progress
  },

  data() {
    return {
      autoRefreshTime: 60,
      countdown: 0,
      loading: false,
      // swap ing
      swaping: false,
      asks: {} as any,
      bids: {} as any,

      coinSelectShow: false,
      // 正在弹框选择哪个的币种
      selectFromCoin: true,
      // 哪个币种的金额固定，从而动态计算另一个
      fixedFromCoin: true,

      // 已选择的币种
      fromCoin: RAY as TokenInfo | null,
      toCoin: null as TokenInfo | null,
      fromCoinAmount: '',
      toCoinAmount: '',

      marketAddress: ''
    }
  },

  computed: {
    ...mapState(['wallet', 'swap'])
  },

  watch: {
    // 监听输入金额变动
    fromCoinAmount(newAmount: string, oldAmount: string) {
      this.$nextTick(() => {
        if (!inputRegex.test(escapeRegExp(newAmount))) {
          this.fromCoinAmount = oldAmount
        }
      })
    },

    // 监听输入金额变动
    toCoinAmount(newAmount: string, oldAmount: string) {
      this.$nextTick(() => {
        if (!inputRegex.test(escapeRegExp(newAmount))) {
          this.toCoinAmount = oldAmount
        }
      })
    },

    // 监听钱包余额变动
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateCoinInfo(newTokenAccounts)
      },
      deep: true
    },

    // 监听选择币种变动
    fromCoin() {
      this.findMarket()
    },

    // 监听选择币种变动
    toCoin() {
      this.findMarket()
    }
  },

  mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)
  },

  methods: {
    openFromCoinSelect() {
      this.selectFromCoin = true
      this.coinSelectShow = true
    },

    openToCoinSelect() {
      this.selectFromCoin = false
      this.coinSelectShow = true
    },

    onCoinSelect(tokenInfo: TokenInfo) {
      if (this.selectFromCoin) {
        this.fromCoin = cloneDeep(tokenInfo)

        // 如果选的币种被另一个选了 把另一个重置
        if (this.toCoin?.mintAddress === tokenInfo.mintAddress) {
          this.toCoin = null
          this.changeCoinAmountPosition()
        }
      } else {
        this.toCoin = cloneDeep(tokenInfo)

        // 如果选的币种被另一个选了 把另一个重置
        if (this.fromCoin?.mintAddress === tokenInfo.mintAddress) {
          this.fromCoin = null
          this.changeCoinAmountPosition()
        }
      }

      this.coinSelectShow = false
    },

    changeCoinPosition() {
      const tempFromCoin = this.fromCoin
      const tempToCoin = this.toCoin

      this.fromCoin = tempToCoin
      this.toCoin = tempFromCoin

      this.changeCoinAmountPosition()
    },

    // 切换币种金额位置
    changeCoinAmountPosition() {
      const tempFromCoinAmount = this.fromCoinAmount
      const tempToCoinAmount = this.toCoinAmount

      this.fromCoinAmount = tempToCoinAmount
      this.toCoinAmount = tempFromCoinAmount
    },

    updateCoinInfo(tokenAccounts: any) {
      if (this.fromCoin) {
        const fromCoin = tokenAccounts[this.fromCoin.mintAddress]

        if (fromCoin) {
          this.fromCoin = { ...this.fromCoin, ...fromCoin }
        }
      }

      if (this.toCoin) {
        const toCoin = tokenAccounts[this.toCoin.mintAddress]

        if (toCoin) {
          this.toCoin = { ...this.toCoin, ...toCoin }
        }
      }
    },

    findMarket() {
      if (this.fromCoin && this.toCoin) {
        let marketAddress = ''

        for (const address of Object.keys(this.swap.markets)) {
          const info = cloneDeep(this.swap.markets[address])

          if (
            (info.baseMint.toBase58() === this.fromCoin.mintAddress &&
              info.quoteMint.toBase58() === this.toCoin.mintAddress) ||
            (info.baseMint.toBase58() === this.toCoin.mintAddress &&
              info.quoteMint.toBase58() === this.fromCoin.mintAddress)
          ) {
            marketAddress = address
          }
        }

        if (marketAddress) {
          // 处理 老的和新的市场一样
          if (this.marketAddress !== marketAddress) {
            this.marketAddress = marketAddress
            // this.unsubPoolChange()
            // this.subPoolChange()
          }
        } else {
          this.marketAddress = ''
          // this.unsubPoolChange()
        }
      } else {
        this.marketAddress = ''
        // this.unsubPoolChange()
      }
    },

    getOrderBooks() {
      this.loading = true

      const conn = this.$conn

      const marketInfo = get(this.swap.markets, this.marketAddress)
      const { bids, asks } = marketInfo

      getMultipleAccounts(conn, [bids, asks], commitment)
        .then((infos) => {
          infos.forEach((info) => {
            const data = info.account.data

            const orderbook = Orderbook.decode(marketInfo, data)

            const { isBids, slab } = orderbook

            if (isBids) {
              this.bids = slab
            } else {
              this.asks = slab
            }
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    placeOrder() {}
  }
})
</script>

<style lang="less" scoped>
.container {
  max-width: 450px;

  .change-side {
    div {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background: #000829;
      cursor: pointer;
    }
  }
}
</style>
