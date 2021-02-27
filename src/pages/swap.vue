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
        <Icon type="setting" />
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
          @onInput="(amount) => (fromCoinAmount = amount)"
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
          :show-max="false"
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
          <template v-else-if="fromCoinAmount > fromCoin.uiAmount">
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

import {
  getTokenBySymbol,
  getTokenByMintAddress,
  TokenInfo,
} from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'

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

      fromCoin: getTokenBySymbol('RAY') as TokenInfo | null,
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

    onCoinSelect(mintAddress: string) {
      if (this.selectFromCoin) {
        this.fromCoin = getTokenByMintAddress(mintAddress)

        // 如果选的币种被另一个选了 把另一个重置
        if (this.toCoin?.mintAddress === mintAddress) {
          this.toCoin = null
          this.changeCoinAmountPosition()
        }
      } else {
        this.toCoin = getTokenByMintAddress(mintAddress)

        // 如果选的币种被另一个选了 把另一个重置
        if (this.fromCoin?.mintAddress === mintAddress) {
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

<style lang="less">
.ant-tooltip-inner {
  display: inline-block;

  h3 {
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    color: #f1f1f2;
  }

  .swap-info {
    font-size: 12px;
    line-height: 20px;
    color: #f1f1f2;

    .info {
      display: grid;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      gap: 10px;
      grid-template-columns: minmax(auto, 1fr) auto auto;

      .symbol {
        opacity: 0.75;
      }

      .address {
        padding: 2px 4px;
        background: #131a35;
        border-radius: 4px;
        opacity: 0.75;
      }

      .action {
        font-size: 16px;
        cursor: pointer;

        &:hover {
          color: #5ac4be;
        }
      }
    }
  }
}
</style>
