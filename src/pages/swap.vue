<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Swap</span>
      <div class="buttons">
        <Tooltip placement="bottomRight" trigger="click">
          <template slot="title">
            <h3>Addresses</h3>
            <div class="swap-info">
              <div v-if="fromCoin" class="info">
                <div class="symbol">{{ fromCoin.symbol }}</div>
                <div class="address">
                  {{ fromCoin.mintAddress.substr(0, 14) }}
                  ...
                  {{
                    fromCoin.mintAddress.substr(
                      fromCoin.mintAddress.length - 14,
                      14
                    )
                  }}
                </div>
                <div class="action">
                  <Icon
                    type="copy"
                    @click="
                      $store.dispatch('setting/copy', fromCoin.mintAddress)
                    "
                  />
                </div>
              </div>
              <div v-if="toCoin" class="info">
                <div class="symbol">{{ toCoin.symbol }}</div>
                <div class="address">
                  {{ toCoin.mintAddress.substr(0, 14) }}
                  ...
                  {{
                    toCoin.mintAddress.substr(
                      toCoin.mintAddress.length - 14,
                      14
                    )
                  }}
                </div>
                <div class="action">
                  <Icon
                    type="copy"
                    @click="$store.dispatch('setting/copy', toCoin.mintAddress)"
                  />
                </div>
              </div>
            </div>
          </template>
          <Icon type="info-circle" />
        </Tooltip>
        <Icon type="setting" @click="$store.dispatch('setting/open')" />
      </div>
    </div>
    <CoinSelect
      v-if="coinSelectShow"
      :close="closeCoinSelect"
      :on-select="onCoinSelect"
    />
    <div class="card">
      <div class="card-body">
        <CoinInput
          v-model="fromCoinAmount"
          label="From"
          :coin-name="fromCoin ? fromCoin.symbol : ''"
          :ui-balance="fromCoin ? fromCoin.uiBalance : null"
          @onInput="(amount) => (fromCoinAmount = amount)"
          @onMax="() => (fromCoinAmount = fromCoin.uiBalance.toString())"
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
          :ui-balance="toCoin ? toCoin.uiBalance : null"
          :show-max="false"
          :disabled="true"
          @onInput="(amount) => (toCoinAmount = amount)"
          @onSelect="openToCoinSelect"
        />

        <Button
          v-if="!wallet.connected"
          size="large"
          ghost
          @click="$store.dispatch('wallet/openModal')"
        >
          Unlock Wallet
        </Button>
        <Button
          v-else
          size="large"
          ghost
          :disabled="!fromCoin || !fromCoinAmount || !toCoin || !tradePairExist"
          @click="swap"
        >
          <template v-if="!fromCoinAmount"> Enter an amount </template>
          <template v-else-if="!fromCoin || !toCoin"> Select a token </template>
          <template v-else-if="!tradePairExist">
            Insufficient liquidity for this trade
          </template>
          <template v-else-if="fromCoinAmount > fromCoin.uiBalance">
            Insufficient BNB balance
          </template>
          <template v-else>Swap</template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Icon, Tooltip, Button } from 'ant-design-vue'

import { getTokenBySymbol, TokenInfo } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'

const RAY = { ...getTokenBySymbol('RAY') }

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
  },

  data() {
    return {
      coinSelectShow: false,
      // 正在弹框选择哪个的币种
      selectFromCoin: true,

      // 已选择的币种
      fromCoin: RAY as TokenInfo | null,
      toCoin: null as TokenInfo | null,
      fromCoinAmount: '',
      toCoinAmount: '',

      tradePairExist: false,
    }
  },

  computed: {
    ...mapState(['wallet']),
  },

  watch: {
    fromCoinAmount(newAmount: string, oldAmount: string) {
      this.$nextTick(() => {
        if (!inputRegex.test(escapeRegExp(newAmount))) {
          this.fromCoinAmount = oldAmount
        }
      })
    },

    toCoinAmount(newAmount: string, oldAmount: string) {
      this.$nextTick(() => {
        if (!inputRegex.test(escapeRegExp(newAmount))) {
          this.toCoinAmount = oldAmount
        }
      })
    },

    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateCoinInfo(newTokenAccounts)
      },
      deep: true,
    },
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

    closeCoinSelect() {
      this.coinSelectShow = false
    },

    onCoinSelect(tokenInfo: TokenInfo) {
      if (this.selectFromCoin) {
        this.fromCoin = { ...tokenInfo }

        // 如果选的币种被另一个选了 把另一个重置
        if (this.toCoin?.mintAddress === tokenInfo.mintAddress) {
          this.toCoin = null
          this.changeCoinAmountPosition()
        }
      } else {
        this.toCoin = { ...tokenInfo }

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

    updateCoinInfo(newTokenAccounts: any) {
      if (this.fromCoin) {
        const fromCoin = newTokenAccounts[this.fromCoin.mintAddress]

        if (fromCoin) {
          this.fromCoin = { ...this.fromCoin, ...fromCoin }
        }
      }

      if (this.toCoin) {
        const toCoin = newTokenAccounts[this.toCoin.mintAddress]

        if (toCoin) {
          this.toCoin = { ...this.toCoin, ...toCoin }
        }
      }
    },

    swap() {},
  },
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
