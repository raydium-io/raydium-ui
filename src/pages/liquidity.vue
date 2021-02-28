<template>
  <div class="container">
    <div class="page-head fs-container">
      <Tabs>
        <TabPane key="add" tab="Add">
          <div class="card">
            <div class="card-body">
              <CoinInput
                v-model="fromCoinAmount"
                label="Input"
                :coin-name="fromCoin ? fromCoin.symbol : ''"
                :ui-balance="fromCoin ? fromCoin.uiBalance : null"
                @onInput="(amount) => (fromCoinAmount = amount)"
                @onMax="() => (fromCoinAmount = fromCoin.uiBalance.toString())"
                @onSelect="openFromCoinSelect"
              />

              <div class="add-icon fc-container">
                <div class="fc-container">
                  <Icon type="plus" />
                </div>
              </div>

              <CoinInput
                v-model="toCoinAmount"
                label="Input"
                :coin-name="toCoin ? toCoin.symbol : ''"
                :ui-balance="toCoin ? toCoin.uiBalance : null"
                @onInput="(amount) => (toCoinAmount = amount)"
                @onMax="() => (toCoinAmount = toCoin.uiBalance.toString())"
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
                :disabled="
                  !fromCoin || !fromCoinAmount || !toCoin || !tradePairExist
                "
                @click="swap"
              >
                <template v-if="!fromCoin || !toCoin"> Invalid pair </template>
                <template v-else-if="!fromCoinAmount">
                  Enter an amount
                </template>
                <template v-else-if="!tradePairExist"> Invalid pair </template>
                <template v-else-if="fromCoinAmount > fromCoin.uiBalance">
                  Insufficient BNB balance
                </template>
                <template v-else-if="toCoinAmount > toCoin.uiBalance">
                  Insufficient BNB balance
                </template>
                <template v-else>Supply</template>
              </Button>
            </div>
          </div>
        </TabPane>
        <TabPane key="position" tab="Your Liquidity"> 1 </TabPane>
        <div slot="tabBarExtraContent" class="buttons">
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
                      @click="
                        $store.dispatch('setting/copy', toCoin.mintAddress)
                      "
                    />
                  </div>
                </div>
              </div>
            </template>
            <Icon type="info-circle" />
          </Tooltip>
          <Icon type="setting" @click="$store.dispatch('setting/open')" />
        </div>
      </Tabs>
    </div>
    <CoinSelect
      v-if="coinSelectShow"
      :close="closeCoinSelect"
      :on-select="onCoinSelect"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Icon, Tooltip, Button, Tabs } from 'ant-design-vue'

import { getTokenBySymbol, TokenInfo } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'

const { TabPane } = Tabs
const RAY = { ...getTokenBySymbol('RAY') }

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Tabs,
    TabPane,
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

  .add-icon {
    div {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background: #000829;
    }
  }
}
</style>

<style lang="less">
@import '../styles/variables';

.ant-tabs {
  width: 100%;

  .ant-tabs-bar {
    border: none;

    .ant-tabs-nav-container {
      margin-bottom: 0;
      line-height: 40px;

      .ant-tabs-nav-wrap {
        margin-bottom: 0;
      }
    }

    .ant-tabs-extra-content {
      line-height: 1;
    }

    .ant-tabs-tab {
      font-weight: 600;
      opacity: 0.5;

      &:active,
      &:focus,
      &:hover {
        color: @text-color;
        opacity: 1;
      }
    }

    .ant-tabs-tab-active {
      opacity: 1;
    }
  }
}
</style>
