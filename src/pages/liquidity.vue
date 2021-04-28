<template>
  <div class="liquidity container">
    <div class="page-head fs-container">
      <span class="title">Add Liquidity</span>
      <div class="buttons">
        <Tooltip v-if="lpMintAddress" placement="bottomRight">
          <template slot="title">
            <span>
              Quote auto refresh countdown after
              {{ liquidity.autoRefreshTime - liquidity.countdown }} seconds, you can click to update manually
            </span>
            <br />
            <span> Automatically refreshes when the current pool had changed </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / liquidity.autoRefreshTime) * liquidity.countdown"
            :show-info="false"
            :class="lpMintAddress && liquidity.loading ? 'disabled' : ''"
            @click="$accessor.liquidity.requestInfos"
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
                  <Icon type="copy" @click="$accessor.copy(fromCoin.mintAddress)" />
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
                  <Icon type="copy" @click="$accessor.copy(toCoin.mintAddress)" />
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
                  <Icon type="copy" @click="$accessor.copy(lpMintAddress)" />
                </div>
              </div>
            </div>
          </template>
          <Icon type="info-circle" />
        </Tooltip>
        <Icon type="setting" @click="$accessor.setting.open" />
      </div>
    </div>

    <CoinSelect v-if="coinSelectShow" @onClose="() => (coinSelectShow = false)" @onSelect="onCoinSelect" />

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
              fixedCoin = fromCoin.mintAddress
            }
          "
          @onMax="
            () => {
              fixedCoin = fromCoin.mintAddress
              fromCoinAmount = fromCoin.balance.fixed()
            }
          "
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
              fixedCoin = toCoin.mintAddress
            }
          "
          @onMax="
            () => {
              fixedCoin = toCoin.mintAddress
              toCoinAmount = toCoin.balance.fixed()
            }
          "
          @onSelect="openToCoinSelect"
        />

        <LiquidityPoolInfo :initialized="liquidity.initialized" :pool-info="liquidity.infos[lpMintAddress]" />

        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
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
            liquidity.loading ||
            gt(fromCoinAmount, fromCoin.balance.fixed()) ||
            gt(toCoinAmount, toCoin.balance.fixed()) ||
            suppling ||
            (fromCoin.mintAddress === TOKENS.COPE.mintAddress && gt(5, fromCoinAmount)) ||
            (toCoin.mintAddress === TOKENS.COPE.mintAddress && gt(5, toCoinAmount))
          "
          :loading="suppling"
          @click="supply"
        >
          <template v-if="!fromCoin || !toCoin"> Select a token </template>
          <template v-else-if="!lpMintAddress || !liquidity.initialized"> Invalid pair </template>
          <template v-else-if="!fromCoinAmount"> Enter an amount </template>
          <template v-else-if="liquidity.loading"> Updating pool information </template>
          <template v-else-if="gt(fromCoinAmount, fromCoin.balance.fixed())">
            Insufficient {{ fromCoin.symbol }} balance
          </template>
          <template v-else-if="gt(toCoinAmount, toCoin.balance.fixed())">
            Insufficient {{ toCoin.symbol }} balance
          </template>
          <template v-else-if="fromCoin.mintAddress === TOKENS.COPE.mintAddress && gt(50, fromCoinAmount)">
            COPE amount must greater than 50
          </template>
          <template v-else-if="toCoin.mintAddress === TOKENS.COPE.mintAddress && gt(50, toCoinAmount)">
            COPE amount must greater than 50
          </template>
          <template v-else>Supply</template>
        </Button>
      </div>
    </div>

    <div class="page-head your-liquidity fs-container">
      <span class="title">Your Liquidity</span>
    </div>

    <YourLiquidity @onAdd="setCoinFromMint" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Icon, Tooltip, Button, Progress } from 'ant-design-vue'
import {
  PublicKey,
  // types
  AccountInfo,
  Context
} from '@solana/web3.js'

import { getTokenBySymbol, getTokenByMintAddress, TokenInfo, TOKENS } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getLpMintByTokenMintAddresses, getOutAmount, addLiquidity } from '@/utils/liquidity'
import logger from '@/utils/logger'
import { commitment } from '@/utils/web3'
import { cloneDeep, get } from 'lodash-es'
import { gt } from '@/utils/safe-math'
import { getUnixTs } from '@/utils'

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
      TOKENS,
      // supply ing
      suppling: false,

      coinSelectShow: false,
      selectFromCoin: true,
      fixedCoin: '',

      fromCoin: RAY as TokenInfo | null,
      toCoin: null as TokenInfo | null,
      fromCoinAmount: '',
      toCoinAmount: '',

      lpMintAddress: '',

      poolListenerId: null as number | null,
      lastSubBlock: 0
    }
  },

  head: {
    title: 'Raydium Liquidity'
  },

  computed: {
    ...mapState(['wallet', 'liquidity', 'transaction', 'setting', 'url'])
  },

  watch: {
    fromCoinAmount(newAmount: string, oldAmount: string) {
      this.$nextTick(() => {
        if (!inputRegex.test(escapeRegExp(newAmount))) {
          this.fromCoinAmount = oldAmount
        } else {
          this.updateAmounts()
        }
      })
    },

    toCoinAmount(newAmount: string, oldAmount: string) {
      this.$nextTick(() => {
        if (!inputRegex.test(escapeRegExp(newAmount))) {
          this.toCoinAmount = oldAmount
        } else {
          this.updateAmounts()
        }
      })
    },

    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateCoinInfo(newTokenAccounts)
      },
      deep: true
    },

    fromCoin() {
      this.findLiquidityPool()
    },

    toCoin() {
      this.findLiquidityPool()
    },

    lpMintAddress() {
      this.updateAmounts()
    },

    'liquidity.infos': {
      handler(_newInfos: any) {
        this.updateAmounts()
      },
      deep: true
    }
  },

  mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)

    const { from, to } = this.$route.query
    // @ts-ignore
    this.setCoinFromMint(from, to, true)
  },

  methods: {
    gt,

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

        if (this.toCoin?.mintAddress === tokenInfo.mintAddress) {
          this.toCoin = null
          this.changeCoinAmountPosition()
        }
      } else {
        this.toCoin = cloneDeep(tokenInfo)

        if (this.fromCoin?.mintAddress === tokenInfo.mintAddress) {
          this.fromCoin = null
          this.changeCoinAmountPosition()
        }
      }

      this.coinSelectShow = false
    },

    setCoinFromMint(from: string | undefined, to: string | undefined, fixRoute = false) {
      let fromCoin, toCoin

      if (from) {
        fromCoin = getTokenByMintAddress(from)
      }

      if (to) {
        toCoin = getTokenByMintAddress(to)
      }

      if (fromCoin || toCoin) {
        if (fromCoin) {
          fromCoin.balance = get(this.wallet.tokenAccounts, `${fromCoin.mintAddress}.balance`)
          this.fromCoin = fromCoin
        }

        if (toCoin) {
          toCoin.balance = get(this.wallet.tokenAccounts, `${toCoin.mintAddress}.balance`)
          this.toCoin = toCoin
        }

        if (fixRoute) {
          this.$router.replace({ path: '/liquidity/' })
        }
      }
    },

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

    findLiquidityPool() {
      if (this.fromCoin && this.toCoin) {
        const lpMintAddress = getLpMintByTokenMintAddresses(this.fromCoin.mintAddress, this.toCoin.mintAddress)
        if (lpMintAddress) {
          if (this.lpMintAddress !== lpMintAddress) {
            this.lpMintAddress = lpMintAddress
            this.unsubPoolChange()
            this.subPoolChange()
          }
        } else {
          this.lpMintAddress = ''
          this.unsubPoolChange()
        }
      } else {
        this.lpMintAddress = ''
        this.unsubPoolChange()
      }
    },

    updateAmounts() {
      if (this.fromCoin && this.toCoin && this.lpMintAddress) {
        const poolInfo = this.liquidity.infos[this.lpMintAddress]

        if (this.fixedCoin === this.fromCoin.mintAddress) {
          const amount = getOutAmount(
            poolInfo,
            this.fromCoinAmount,
            this.fromCoin.mintAddress,
            this.toCoin.mintAddress,
            this.setting.slippage
          )

          if (amount.isNaN() || !amount.isFinite()) {
            this.toCoinAmount = ''
          } else {
            this.toCoinAmount = amount.toFixed(this.toCoin.decimals)
          }
        } else {
          const poolInfo = this.liquidity.infos[this.lpMintAddress]

          const amount = getOutAmount(
            poolInfo,
            this.toCoinAmount,
            this.toCoin.mintAddress,
            this.fromCoin.mintAddress,
            this.setting.slippage
          )

          if (amount.isNaN() || !amount.isFinite()) {
            this.fromCoinAmount = ''
          } else {
            this.fromCoinAmount = amount.toFixed(this.toCoin.decimals)
          }
        }
      }
    },

    onPoolChange(_accountInfo: AccountInfo<Buffer>, context: Context): void {
      logger('onPoolChange')

      const { slot } = context

      if (slot !== this.liquidity.lastSubBlock) {
        this.$accessor.liquidity.setLastSubBlock(slot)
        this.$accessor.liquidity.requestInfos()
      }
    },

    subPoolChange() {
      if (this.lpMintAddress) {
        const conn = this.$web3

        const poolInfo = this.liquidity.infos[this.lpMintAddress]

        this.poolListenerId = conn.onAccountChange(new PublicKey(poolInfo.ammQuantities), this.onPoolChange, commitment)

        logger('subPoolChange', poolInfo.lp.symbol)
      }
    },

    unsubPoolChange() {
      if (this.poolListenerId) {
        const conn = this.$web3

        conn.removeAccountChangeListener(this.poolListenerId)

        logger('unsubPoolChange')
      }
    },

    supply() {
      this.suppling = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const poolInfo = get(this.liquidity.infos, this.lpMintAddress)

      // @ts-ignore
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${this.fromCoin.mintAddress}.tokenAccountAddress`)
      // @ts-ignore
      const toCoinAccount = get(this.wallet.tokenAccounts, `${this.toCoin.mintAddress}.tokenAccountAddress`)
      const lpAccount = get(this.wallet.tokenAccounts, `${this.lpMintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      addLiquidity(
        conn,
        wallet,
        poolInfo,
        fromCoinAccount,
        toCoinAccount,
        lpAccount,
        this.fromCoin,
        this.toCoin,
        this.fromCoinAmount,
        this.toCoinAmount,
        this.fixedCoin
      )
        .then((txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Add liquidity for ${this.fromCoinAmount} ${this.fromCoin?.symbol} and ${this.toCoinAmount} ${this.toCoin?.symbol}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Add liquidity failed',
            description: error.message
          })
        })
        .finally(() => {
          this.suppling = false
        })
    }
  }
})
</script>

<style lang="less" scoped>
.liquidity.container {
  max-width: 450px;

  .your-liquidity {
    margin-top: 40px !important;
  }

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
.ant-alert-warning {
  width: 500px;
  margin-top: 30px;
  background-color: transparent;
  border: 1px solid #85858d;

  .anticon-close {
    color: #fff;
  }
}
</style>
