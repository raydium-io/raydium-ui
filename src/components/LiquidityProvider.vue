<template>
  <div class="liquidity-provider container">
    <div class="page-head fs-container">
      <span class="title">Add liquidity</span>
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
        <button class="max-button" :disabled="coinToMaxRunning" @click="onTriggerLowerBalanceCoinToMax">
          <span v-if="!coinToMaxRunning">Set possible MAX</span>
          <span v-else>⏳</span>
        </button>

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
            isNullOrZero(fromCoinAmount) ||
            isNullOrZero(toCoinAmount) ||
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
          <template v-else-if="isNullOrZero(fromCoinAmount) || isNullOrZero(toCoinAmount)"> Enter an amount </template>
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
import { gt, isNullOrZero } from '@/utils/safe-math'
import { getUnixTs, sleep } from '@/utils'

const RAY = getTokenBySymbol('RAY')

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Progress
  },

  props: {
    fromCoinMintAddress: { type: String, default: '' },
    toCoinMintAddress: { type: String, default: '' },
    shouldSetMaxOnInit: { type: Boolean, default: false },
    triggerLowerBalanceCoinToMax: { type: Boolean, default: false },
    triggerSupplyLP: { type: Boolean, default: false }
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
      lastSubBlock: 0,

      coinToMaxRunning: false
    }
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
    },

    triggerLowerBalanceCoinToMax() {
      this.onTriggerLowerBalanceCoinToMax()
    },

    triggerSupplyLP() {
      this.onTriggerSupplyLP()
    }
  },

  async mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)

    const { from, to } = this.$route.query
    // @ts-ignore
    this.setCoinFromMint(from, to, true)

    if (this.$props.fromCoinMintAddress || this.$props.toCoinMintAddress) {
      this.setCoinFromMint(this.$props.fromCoinMintAddress, this.$props.toCoinMintAddress, false)
      if (this.$props.shouldSetMaxOnInit) {
        await this.setLowerBalanceCoinToMax()
      }
    }
  },

  methods: {
    gt,
    isNullOrZero,

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

    async setLowerBalanceCoinToMax(): Promise<boolean> {
      // reset both, otherwise a second cann would not wait till its filled in while loop
      this.toCoinAmount = ''
      this.fromCoinAmount = ''

      if (!this.fromCoin || !this.toCoin) {
        return false
      }

      this.fixedCoin = this.fromCoin.mintAddress
      this.fromCoinAmount = this.fromCoin.balance ? this.fromCoin.balance.fixed() : '0'

      while (!this.toCoinAmount) {
        // we need to wait till toCoinAmount gets filled via watcher
        await sleep(100)
      }
      // logger('fromCoinAmount', this.fromCoinAmount, 'this.fromCoin.balance', this.fromCoin.balance.fixed())
      // logger('toCoinAmount', this.toCoinAmount, 'this.toCoin.balance', this.toCoin.balance.fixed())

      if (this.toCoin.balance && gt(this.toCoinAmount, this.toCoin.balance.fixed())) {
        // logger(`Insufficient ${this.toCoin.symbol} balance`)
        this.fixedCoin = this.toCoin.mintAddress
        this.fromCoinAmount = '' // reset
        this.toCoinAmount = this.toCoin.balance.fixed()

        while (!this.fromCoinAmount) {
          // we need to wait till fromCoinAmount gets filled via watcher
          await sleep(100)
        }
      }

      if (this.toCoin.balance && (!this.fromCoin.balance || gt(this.fromCoinAmount, this.fromCoin.balance.fixed()))) {
        logger(
          `Insufficient balances on both side; only take 98% from to-coin`,
          this.toCoin.balance.toEther().multipliedBy(0.98).toFixed()
        )

        this.fromCoinAmount = '' // reset
        this.toCoinAmount = this.toCoin.balance.toEther().multipliedBy(0.98).toFixed()

        while (!this.fromCoinAmount) {
          // we need to wait till fromCoinAmount gets filled via watcher
          await sleep(100)
        }
      }

      if (!this.fromCoin.balance || gt(this.fromCoinAmount, this.fromCoin.balance.fixed())) {
        // logger(`Insufficient ${this.fromCoin.symbol} balance`)
        this.$notify.error({
          key: getUnixTs().toString(),
          message: 'Add liquidity failed',
          description: 'Cannot set max, due to insufficient balance on to & from coin'
        })
        this.$emit('onError', new Error('Cannot set max, due to insufficient balance on to & from coin'))
        this.coinToMaxRunning = false
        return false
      }

      // logger('✅ set amount to max for', getTokenByMintAddress(this.fixedCoin)?.symbol)
      this.coinToMaxRunning = false

      return true
    },

    async onTriggerLowerBalanceCoinToMax(): Promise<boolean> {
      this.coinToMaxRunning = true
      // update wallet
      await this.$accessor.wallet.getTokenAccounts()

      // update pools first
      await this.$accessor.liquidity.requestInfos()
      await sleep(500)
      return await this.setLowerBalanceCoinToMax()
    },

    async onTriggerSupplyLP() {
      const success = await this.onTriggerLowerBalanceCoinToMax()
      if (!success) {
        // end, error gets already $emit + $notify inside the function
        return
      }
      // supply LP
      logger('supply LP...')
      this.supply()
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
      // logger('onPoolChange')

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

        // logger('subPoolChange', poolInfo.lp.symbol)
      }
    },

    unsubPoolChange() {
      if (this.poolListenerId) {
        const conn = this.$web3

        conn.removeAccountChangeListener(this.poolListenerId)

        // logger('unsubPoolChange')
      }
    },

    supply() {
      // check if amount is not null or zero
      if (isNullOrZero(this.fromCoinAmount) || isNullOrZero(this.toCoinAmount)) {
        this.$notify.error({
          key: getUnixTs().toString(),
          message: 'Add liquidity failed',
          description: 'Please enter an amount'
        })

        // notify parent
        this.$emit('onError', new Error('Add liquidity failed - Please enter an amount'))
        return
      }

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
        message: 'Making supply transaction...',
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
        .then(async (txid) => {
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
          await this.$accessor.transaction.sub({ txid, description })

          // notify parent
          this.$emit('onLiquidityAdded', {
            txid,
            description,
            fromCoinAmount: this.fromCoinAmount,
            fromCoinSymbol: this.fromCoin?.symbol,
            toCoinAmount: this.toCoinAmount,
            toCoinSymbol: this.toCoin?.symbol,
            farmInfo: poolInfo
          })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Add liquidity failed',
            description: error.message
          })

          // notify parent
          this.$emit('onError', error)
        })
        .finally(() => {
          this.suppling = false
        })
    }
  }
})
</script>

<style lang="less" scoped>
.liquidity-provider.container {
  padding: 0;

  .page-head {
    margin: 10px 0;

    .title {
      font-size: 16px;
    }
  }

  .card {
    .card-body {
      padding-top: 14px;

      .max-button {
        border: none;
        background-color: transparent;
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        border-radius: 4px;
        white-space: nowrap;
        cursor: pointer;
        height: 32px;
        padding: 0 16px;
        color: @primary-color;

        &:active,
        &:focus,
        &:hover {
          outline: 0;
        }

        &:hover {
          background-color: @modal-header-bg;
        }

        &:disabled {
          cursor: progress;
        }
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
  }
}
</style>
