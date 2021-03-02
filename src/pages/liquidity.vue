<template>
  <div class="container">
    <div class="page-head fs-container">
      <Tabs v-model="activeTab">
        <TabPane key="add" tab="Add">
          <div class="card">
            <div class="card-body">
              <CoinInput
                v-model="fromCoinAmount"
                label="Input"
                :coin-name="fromCoin ? fromCoin.symbol : ''"
                :balance="fromCoin ? fromCoin.balance : null"
                @onInput="(amount) => (fromCoinAmount = amount)"
                @onFocus="
                  () => {
                    fixedFromCoin = true
                  }
                "
                @onMax="() => (fromCoinAmount = fromCoin.balance.fixed())"
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
                :balance="toCoin ? toCoin.balance : null"
                @onInput="(amount) => (toCoinAmount = amount)"
                @onFocus="
                  () => {
                    fixedFromCoin = false
                  }
                "
                @onMax="() => (toCoinAmount = toCoin.balance.fixed())"
                @onSelect="openToCoinSelect"
              />

              <LiquidityPoolInfo :liquidity-pool="liquidityPool" />

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
                  !fromCoin ||
                  !fromCoinAmount ||
                  !toCoin ||
                  !liquidityPool ||
                  liquidityPool.quoting ||
                  parseFloat(fromCoinAmount) > fromCoin.balance ||
                  parseFloat(toCoinAmount) > toCoin.balance
                "
                @click="supply"
              >
                <template v-if="!fromCoin || !toCoin">
                  Select a token
                </template>
                <template v-else-if="!fromCoinAmount">
                  Enter an amount
                </template>
                <template v-else-if="!liquidityPool"> Invalid pair </template>
                <template v-else-if="liquidityPool.quoting">
                  Updating pool's infomations
                </template>
                <template
                  v-else-if="parseFloat(fromCoinAmount) > fromCoin.balance"
                >
                  Insufficient {{ fromCoin.symbol }} balance
                </template>
                <template v-else-if="parseFloat(toCoinAmount) > toCoin.balance">
                  Insufficient {{ toCoin.symbol }} balance
                </template>
                <template v-else>Supply</template>
              </Button>
            </div>
          </div>
        </TabPane>
        <TabPane key="position" tab="Your Liquidity">
          <YourLiquidity />
        </TabPane>
        <div slot="tabBarExtraContent" class="buttons">
          <Tooltip v-if="activeTab === 'add'" placement="bottomRight">
            <template slot="title">
              <span>Quote auto refresh countdown</span>
            </template>
            <Progress
              type="circle"
              :width="20"
              :stroke-width="10"
              :percent="10 * countdown"
              :show-info="false"
              :class="liquidityPool && liquidityPool.quoting ? 'disabled' : ''"
            />
          </Tooltip>
          <Tooltip v-if="activeTab === 'add'" placement="bottomRight">
            <template slot="title">
              <p>Addresses</p>
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
                      @click="$store.dispatch('app/copy', fromCoin.mintAddress)"
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
                      @click="$store.dispatch('app/copy', toCoin.mintAddress)"
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
import { Icon, Tooltip, Button, Tabs, Progress } from 'ant-design-vue'

import { getTokenBySymbol, TokenInfo } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import Liquidity from '@/utils/liquidity'
import logger from '@/utils/logger'

const { TabPane } = Tabs

const RAY = { ...getTokenBySymbol('RAY') }

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Tabs,
    TabPane,
    Progress,
  },

  data() {
    return {
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

      liquidityPool: null as Liquidity | null,
      // 自动刷新倒计时
      countdown: 0,
      timer: null as any,

      activeTab: 'add',
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

    fromCoin() {
      this.findLiquidityPool()
    },

    toCoin() {
      this.findLiquidityPool()
    },
  },

  mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)

    this.setTimer()
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

    // 更新选中币种的余额
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

    findLiquidityPool() {
      if (this.fromCoin && this.toCoin) {
        const liquidityPoolInfo = Liquidity.getByTokenMintAddresses(
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress
        )
        if (liquidityPoolInfo) {
          // 处理 老的和新的 LP 一样
          if (
            !this.liquidityPool ||
            this.liquidityPool.poolInfo.lp.mintAddress !==
              liquidityPoolInfo.lp.mintAddress
          ) {
            this.liquidityPool = Liquidity.load(liquidityPoolInfo)
            this.updatePoolInfo()
          }
        } else {
          this.liquidityPool = null
        }
      } else {
        this.liquidityPool = null
      }
    },

    setTimer() {
      const self = this

      this.timer = setInterval(function () {
        if (self.liquidityPool && !self.liquidityPool.quoting) {
          if (self.countdown < 10) {
            self.countdown += 1

            if (self.countdown === 10) {
              self.updatePoolInfo()
            }
          }
        }
      }, 1000)
    },

    updatePoolInfo() {
      if (this.liquidityPool) {
        this.countdown = 10

        const conn = (this as any).$conn

        this.liquidityPool
          .requestQuote(conn)
          .then()
          .finally(() => {
            logger('Liquidity pool quote updated')

            this.countdown = 0
          })
      }
    },

    supply() {},
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
