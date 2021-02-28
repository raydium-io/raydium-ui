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
                <template v-if="!fromCoin || !toCoin">
                  Select a token
                </template>
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
        <TabPane key="position" tab="Your Liquidity">
          <div class="card">
            <div class="card-body">
              <Collapse
                v-for="liquidity in yourLiquidity"
                :key="liquidity.mintAddress"
                expand-icon-position="right"
              >
                <CollapsePanel class="liquidity-info" :header="liquidity.name">
                  <div class="fs-container">
                    <div>Pooled:</div>
                    <div>1</div>
                  </div>
                  <div class="fs-container">
                    <div>Pooled:</div>
                    <div>1</div>
                  </div>
                  <div class="fs-container">
                    <div>Your pool tokens:</div>
                    <div>{{ liquidity.uiBalance }}</div>
                  </div>
                  <div class="fs-container">
                    <div>Your pool share:</div>
                    <div>%</div>
                  </div>
                  <Row :gutter="32" class="actions">
                    <Col :span="12">
                      <Button ghost> Add </Button>
                    </Col>
                    <Col :span="12">
                      <Button ghost> Remove </Button>
                    </Col>
                  </Row>
                </CollapsePanel>
              </Collapse>
              <span>
                If you staked your LP tokens in a farm, unstake them to see them
                here.
              </span>
            </div>
          </div>
        </TabPane>
        <div slot="tabBarExtraContent" class="buttons">
          <Tooltip
            v-if="activeTab === 'add'"
            placement="bottomRight"
            trigger="click"
          >
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
import { Icon, Tooltip, Button, Tabs, Collapse, Row, Col } from 'ant-design-vue'

import { getTokenBySymbol, TokenInfo } from '@/utils/tokens'
import { getPoolByLpMintAddress } from '@/utils/pools'
import { inputRegex, escapeRegExp } from '@/utils/regex'

const { TabPane } = Tabs
const CollapsePanel = Collapse.Panel

const RAY = { ...getTokenBySymbol('RAY') }

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Tabs,
    TabPane,
    Collapse,
    CollapsePanel,
    Row,
    Col,
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

      activeTab: 'add',
      // your liquidity
      yourLiquidity: [] as any,
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
        this.updateYourLiquidity(newTokenAccounts)
      },
      deep: true,
    },
  },

  mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)
    this.updateYourLiquidity(this.wallet.tokenAccounts)
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

    updateYourLiquidity(tokenAccounts: any) {
      let yourLiquidity = []

      for (const [mintAddress, tokenAccount] of Object.entries(tokenAccounts)) {
        const liquidityPool = getPoolByLpMintAddress(mintAddress)

        if (liquidityPool) {
          // @ts-ignore
          yourLiquidity.push({ ...liquidityPool, ...tokenAccount })
        }
      }

      yourLiquidity = yourLiquidity.filter(
        (liquidity) => liquidity.uiBalance !== 0
      )

      this.yourLiquidity = yourLiquidity
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

.liquidity-info {
  .ant-collapse-content-box {
    display: grid;
    grid-auto-rows: auto;
    row-gap: 8px;
    font-size: 16px;
    line-height: 24px;

    .actions {
      margin-top: 10px;

      button {
        width: 100%;
      }
    }
  }
}
</style>
