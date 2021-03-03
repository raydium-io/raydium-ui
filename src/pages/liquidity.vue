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

              <LiquidityPoolInfo
                :initialized="liquidity.initialized"
                :pool-info="liquidity.infos[lpMintAddress]"
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
                  !fromCoin ||
                  !fromCoinAmount ||
                  !toCoin ||
                  !lpMintAddress ||
                  !liquidity.initialized ||
                  liquidity.quoting ||
                  parseFloat(fromCoinAmount) > fromCoin.balance ||
                  parseFloat(toCoinAmount) > toCoin.balance
                "
                @click="supply"
              >
                <template v-if="!fromCoin || !toCoin">
                  Select a token
                </template>
                <template v-else-if="!lpMintAddress || !liquidity.initialized">
                  Invalid pair
                </template>
                <template v-else-if="!fromCoinAmount">
                  Enter an amount
                </template>
                <template v-else-if="liquidity.quoting">
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
          <Tooltip
            v-if="activeTab === 'add' && lpMintAddress"
            placement="bottomRight"
          >
            <template slot="title">
              <span>
                Quote auto refresh countdown after
                {{ liquidity.autoRefreshTime - liquidity.countdown }} seconds,
                you can click to update manually
              </span>
              <br />
              <span>
                Automatically refreshes when the current pool had changed
              </span>
            </template>
            <Progress
              type="circle"
              :width="20"
              :stroke-width="10"
              :percent="(100 / liquidity.autoRefreshTime) * liquidity.countdown"
              :show-info="false"
              :class="lpMintAddress && liquidity.quoting ? 'disabled' : ''"
              @click="$store.dispatch('liquidity/getLiquidityPoolInfo')"
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
                <div v-if="lpMintAddress" class="info">
                  <div class="symbol">Pool</div>
                  <div class="address">
                    {{ lpMintAddress.substr(0, 14) }}
                    ...
                    {{ lpMintAddress.substr(lpMintAddress.length - 14, 14) }}
                  </div>
                  <div class="action">
                    <Icon
                      type="copy"
                      @click="$store.dispatch('app/copy', lpMintAddress)"
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
import {
  PublicKey,
  // types
  AccountInfo,
  Context,
} from '@solana/web3.js'

import { getTokenBySymbol, TokenInfo } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getLpMintByTokenMintAddresses } from '@/utils/liquidity'
import logger from '@/utils/logger'
import commitment from '@/utils/commitment'
import { cloneDeep } from 'lodash-es'

const { TabPane } = Tabs

const RAY = getTokenBySymbol('RAY')

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
      activeTab: 'add',

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

      lpMintAddress: null as string | null,

      // 订阅池子变动
      poolListenerId: null,
      lastSubBlock: 0,
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity']),
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

    // this.setTimer()
  },

  destroyed() {
    // clearInterval(this.timer)
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

    // 根据选择的双币找池子
    findLiquidityPool() {
      if (this.fromCoin && this.toCoin) {
        const lpMintAddress = getLpMintByTokenMintAddresses(
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress
        )
        if (lpMintAddress) {
          // 处理 老的和新的 LP 一样
          if (this.lpMintAddress !== lpMintAddress) {
            this.lpMintAddress = lpMintAddress
            this.unsubPoolChange()
            this.subPoolChange()
          }
        } else {
          this.lpMintAddress = null
          this.unsubPoolChange()
        }
      } else {
        this.lpMintAddress = null
        this.unsubPoolChange()
      }
    },

    onPoolChange(_accountInfo: AccountInfo<Buffer>, context: Context): void {
      logger('onPoolChange')

      const { slot } = context

      if (slot !== this.liquidity.lastSubBlock) {
        this.$store.commit('liquidity/setLastSubBlock', slot)
        this.$store.dispatch('liquidity/getLiquidityPoolInfo')
      }
    },

    subPoolChange() {
      if (this.lpMintAddress) {
        const conn = (this as any).$conn

        const poolInfo = this.liquidity.infos[this.lpMintAddress]

        this.poolListenerId = conn.onAccountChange(
          new PublicKey(poolInfo.ammQuantities),
          this.onPoolChange,
          commitment
        )

        logger('subPoolChange', poolInfo.lp.symbol)
      }
    },

    unsubPoolChange() {
      if (this.poolListenerId) {
        const conn = (this as any).$conn

        conn.removeAccountChangeListener(this.poolListenerId)

        logger('unsubPoolChange')
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
