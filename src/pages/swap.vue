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
              <div v-if="swap.fromCoin" class="info">
                <div class="symbol">{{ swap.fromCoin.symbol }}</div>
                <div class="address">
                  {{ swap.fromCoin.mintAddress.substr(0, 14) }}
                  ...
                  {{ swap.fromCoin.mintAddress.substr(swap.fromCoin.mintAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$accessor.copy(swap.fromCoin.mintAddress)" />
                </div>
              </div>
              <div v-if="swap.toCoin" class="info">
                <div class="symbol">{{ swap.toCoin.symbol }}</div>
                <div class="address">
                  {{ swap.toCoin.mintAddress.substr(0, 14) }}
                  ...
                  {{ swap.toCoin.mintAddress.substr(swap.toCoin.mintAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$accessor.copy(swap.toCoin.mintAddress)" />
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
              <div v-else-if="marketAddress" class="info">
                <div class="symbol">Market</div>
                <div class="address">
                  {{ marketAddress.substr(0, 14) }}
                  ...
                  {{ marketAddress.substr(marketAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$accessor.copy(marketAddress)" />
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
          label="From"
          :coin-name="swap.fromCoin ? swap.fromCoin.symbol : ''"
          :balance="swap.fromCoin ? swap.fromCoin.balance : null"
          @onInput="(amount) => (fromCoinAmount = amount)"
          @onFocus="
            () => {
              fixedFromCoin = true
            }
          "
          @onMax="
            () => {
              fixedFromCoin = true
              fromCoinAmount = swap.fromCoin && swap.fromCoin.balance ? swap.fromCoin.balance.fixed() : '0'
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
          :coin-name="swap.toCoin ? swap.toCoin.symbol : ''"
          :balance="swap.toCoin ? swap.toCoin.balance : null"
          :show-max="false"
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
              toCoinAmount = swap.toCoin.balance.fixed()
            }
          "
          @onSelect="openToCoinSelect"
        />
        <div style="padding: 0 12px">
          <div v-if="swap.fromCoin && swap.toCoin && isWrap && fromCoinAmount" class="fs-container">
            <span> Price </span>
            <span>
              1 {{ swap.fromCoin.symbol }} = 1
              {{ swap.toCoin.symbol }}
            </span>
          </div>
          <div v-else-if="swap.fromCoin && swap.toCoin && lpMintAddress && fromCoinAmount" class="fs-container">
            <span> Price </span>
            <span>
              1 {{ swap.fromCoin.symbol }} ≈
              {{ outToPirceValue }}
              {{ swap.toCoin.symbol }}
            </span>
          </div>
          <div
            v-else-if="swap.fromCoin && swap.toCoin && marketAddress && market && asks && bids && fromCoinAmount"
            class="fs-container"
          >
            <span> Price </span>
            <span>
              1 {{ swap.fromCoin.symbol }} ≈
              {{ outToPirceValue }}
              {{ swap.toCoin.symbol }}
            </span>
          </div>
          <div class="fs-container">
            <span> Slippage Tolerance </span>
            <span> {{ $accessor.setting.slippage }}% </span>
          </div>
          <div v-if="swap.fromCoin && swap.toCoin && fromCoinAmount && toCoinAmount" class="fs-container">
            <span> Minimum received </span>
            <span> {{ toCoinAmount }} {{ swap.toCoin.symbol }} </span>
          </div>
        </div>
        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
        </Button>
        <Button
          v-else
          size="large"
          ghost
          :disabled="
            !swap.fromCoin ||
            !fromCoinAmount ||
            !swap.toCoin ||
            (!marketAddress && !lpMintAddress && !isWrap) ||
            !initialized ||
            loading ||
            gt(fromCoinAmount, swap.fromCoin && swap.fromCoin.balance ? swap.fromCoin.balance.fixed() : '0') ||
            swaping ||
            (swap.fromCoin.mintAddress === TOKENS.COPE.mintAddress && gt(5, fromCoinAmount)) ||
            (swap.toCoin.mintAddress === TOKENS.COPE.mintAddress && gt(5, toCoinAmount))
          "
          :loading="swaping"
          @click="placeOrder"
        >
          <template v-if="!swap.fromCoin || !swap.toCoin"> Select a token </template>
          <template v-else-if="(!marketAddress && !lpMintAddress && !isWrap) || !initialized">
            Insufficient liquidity for this trade
          </template>
          <template v-else-if="!fromCoinAmount"> Enter an amount </template>
          <template v-else-if="loading"> Updating price information </template>
          <template v-else-if="gt(fromCoinAmount, swap.fromCoin && swap.fromCoin.balance ? swap.fromCoin.balance.fixed() : '0')">
            Insufficient {{ swap.fromCoin.symbol }} balance
          </template>
          <template v-else-if="swap.fromCoin.mintAddress === TOKENS.COPE.mintAddress && gt(5, fromCoinAmount)">
            COPE amount must greater than 5
          </template>
          <template v-else-if="swap.toCoin.mintAddress === TOKENS.COPE.mintAddress && gt(5, toCoinAmount)">
            COPE amount must greater than 5
          </template>
          <template v-else>{{ isWrap ? 'Unwrap' : 'Swap' }}</template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import { Icon, Tooltip, Button, Progress } from 'ant-design-vue'

import { cloneDeep, get } from 'lodash-es'
import { Market, Orderbook } from '@project-serum/serum/lib/market.js'

import { TokenInfo, NATIVE_SOL, TOKENS } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getMultipleAccounts, commitment } from '@/utils/web3'
import { PublicKey } from '@solana/web3.js'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { getOutAmount, getSwapOutAmount, place, swap, wrap } from '@/utils/swap'
import { TokenAmount, gt } from '@/utils/safe-math'
import { getUnixTs } from '@/utils'
import { getPoolByTokenMintAddresses, canWrap } from '@/utils/liquidity'

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

      autoRefreshTime: 60,
      countdown: 0,
      marketTimer: null as any,
      initialized: false,
      loading: false,
      // swaping
      swaping: false,
      asks: {} as any,
      bids: {} as any,

      coinSelectShow: false,
      selectFromCoin: true,
      fixedFromCoin: true,

      fromCoinAmount: '',
      toCoinAmount: '',

      // wrap
      isWrap: false,
      // serum
      market: null as any,
      marketAddress: '',
      lpMintAddress: '',

      coinBasePrice: true,
      outToPirceValue: null as any
    }
  },

  head: {
    title: 'Raydium Swap'
  },

  computed: {
    ...mapState(['wallet', 'swap', 'liquidity', 'url', 'setting'])
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

    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateCoinInfo(newTokenAccounts)
      },
      deep: true
    },
    marketAddress() {
      this.updateAmounts()
    },

    asks() {
      this.updateAmounts()
    },

    bids() {
      this.updateAmounts()
    }
  },

  mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)

    this.setMarketTimer()
  },

  methods: {
    ...mapMutations({ setFromCoin: 'swap/setFromCoin', setToCoin: 'swap/setToCoin' }),
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
        this.setFromCoin(cloneDeep(tokenInfo))

        if (this.swap.toCoin?.mintAddress === tokenInfo.mintAddress) {
          this.setToCoin(null)
          this.changeCoinAmountPosition()
        }
      } else {
        this.setToCoin(cloneDeep(tokenInfo))

        if (this.swap.fromCoin?.mintAddress === tokenInfo.mintAddress) {
          this.setFromCoin(null)
          this.changeCoinAmountPosition()
        }
      }

      this.coinSelectShow = false
    },

    changeCoinPosition() {
      const tempFromCoin = this.swap.fromCoin
      const tempToCoin = this.swap.toCoin
      this.setFromCoin(tempToCoin)
      this.setToCoin(tempFromCoin)

      this.changeCoinAmountPosition()
    },

    changeCoinAmountPosition() {
      const tempFromCoinAmount = this.fromCoinAmount
      const tempToCoinAmount = this.toCoinAmount

      this.fromCoinAmount = tempToCoinAmount
      this.toCoinAmount = tempFromCoinAmount
    },

    updateCoinInfo(tokenAccounts: any) {
      if (this.swap.fromCoin) {
        const fromCoin = tokenAccounts[this.swap.fromCoin.mintAddress]

        if (fromCoin) {
          this.setFromCoin({ ...this.swap.fromCoin, ...fromCoin })
        }
      }

      if (this.swap.toCoin) {
        const toCoin = tokenAccounts[this.swap.toCoin.mintAddress]

        if (toCoin) {
          this.setToCoin({ ...this.swap.toCoin, ...toCoin })
        }
      }
    },
    findMarket() {
      if (this.swap.fromCoin && this.swap.toCoin) {
        let marketAddress = ''

        // wrap & unwrap
        if (canWrap(this.swap.fromCoin.mintAddress, this.swap.toCoin.mintAddress)) {
          this.isWrap = true
          this.initialized = true
          return
        }

        const pool = getPoolByTokenMintAddresses(this.swap.fromCoin.mintAddress, this.swap.toCoin.mintAddress)
        if (pool && pool.version === 4) {
          this.lpMintAddress = pool.lp.mintAddress
          this.initialized = true
          return
        }

        // serum
        for (const address of Object.keys(this.swap.markets)) {
          const info = cloneDeep(this.swap.markets[address])

          let fromMint = this.swap.fromCoin.mintAddress
          let toMint = this.swap.toCoin.mintAddress

          if (fromMint === NATIVE_SOL.mintAddress) {
            fromMint = TOKENS.WSOL.mintAddress
          }
          if (toMint === NATIVE_SOL.mintAddress) {
            toMint = TOKENS.WSOL.mintAddress
          }

          if (
            (info.baseMint.toBase58() === fromMint && info.quoteMint.toBase58() === toMint) ||
            (info.baseMint.toBase58() === toMint && info.quoteMint.toBase58() === fromMint)
          ) {
            if (!info.baseDepositsTotal.isZero() && !info.quoteDepositsTotal.isZero()) {
              marketAddress = address
            }
          }
        }

        if (marketAddress) {
          if (this.marketAddress !== marketAddress) {
            this.marketAddress = marketAddress
            this.lpMintAddress = ''
            this.isWrap = false
            Market.load(this.$web3, new PublicKey(marketAddress), {}, new PublicKey(SERUM_PROGRAM_ID_V3)).then(
              (market) => {
                this.market = market
                this.getOrderBooks()
              }
            )

            // this.unsubPoolChange()
            // this.subPoolChange()
          }
        } else {
          this.marketAddress = ''
          this.market = null
          this.lpMintAddress = ''
          this.isWrap = false
          // this.unsubPoolChange()
        }
      } else {
        this.marketAddress = ''
        this.market = null
        this.lpMintAddress = ''
        this.isWrap = false
        // this.unsubPoolChange()
      }
    },

    getOrderBooks() {
      this.loading = true
      this.countdown = this.autoRefreshTime

      const conn = this.$web3

      if (this.marketAddress) {
        const marketInfo = get(this.swap.markets, this.marketAddress)
        const { bids, asks } = marketInfo

        getMultipleAccounts(conn, [bids, asks], commitment)
          .then((infos) => {
            infos.forEach((info) => {
              // @ts-ignore
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
            this.initialized = true
            this.loading = false
            this.countdown = 0
          })
      } else {
        this.loading = false
      }
    },

    updateAmounts() {
      if (this.swap.fromCoin && this.swap.toCoin && this.isWrap && this.fromCoinAmount) {
        this.toCoinAmount = this.fromCoinAmount
      } else if (this.swap.fromCoin && this.swap.toCoin && this.lpMintAddress && this.fromCoinAmount) {
        const { amountOut } = getSwapOutAmount(
          get(this.liquidity.infos, this.lpMintAddress),
          this.swap.fromCoin.mintAddress,
          this.swap.toCoin.mintAddress,
          this.fromCoinAmount,
          this.setting.slippage
        )
        if (amountOut.isNullOrZero()) {
          this.toCoinAmount = ''
        } else {
          const toCoinAmount = amountOut.fixed()

          this.toCoinAmount = toCoinAmount
          this.outToPirceValue = new TokenAmount(
            parseFloat(toCoinAmount) / parseFloat(this.fromCoinAmount),
            this.swap.toCoin.decimals,
            false
          ).format()
        }
      } else if (
        this.swap.fromCoin &&
        this.swap.toCoin &&
        this.marketAddress &&
        this.market &&
        this.asks &&
        this.bids &&
        this.fromCoinAmount
      ) {
        const { amountOut } = getOutAmount(
          this.market,
          this.asks,
          this.bids,
          this.swap.fromCoin.mintAddress,
          this.swap.toCoin.mintAddress,
          this.fromCoinAmount,
          this.setting.slippage
        )

        const out = new TokenAmount(amountOut, this.swap.toCoin.decimals, false)

        if (out.isNullOrZero()) {
          this.toCoinAmount = ''
        } else {
          this.toCoinAmount = out.fixed()
          this.outToPirceValue = new TokenAmount(
            amountOut / parseFloat(this.fromCoinAmount),
            this.swap.toCoin.decimals,
            false
          ).format()
        }
      } else {
        this.toCoinAmount = ''
      }
    },

    setMarketTimer() {
      this.marketTimer = setInterval(() => {
        if (!this.loading) {
          if (this.countdown < this.autoRefreshTime) {
            this.countdown += 1

            if (this.countdown === this.autoRefreshTime) {
              this.getOrderBooks()
            }
          }
        }
      }, 1000)
    },

    placeOrder() {
      this.swaping = true

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      if (this.isWrap) {
        wrap(
          this.$axios,
          this.$web3,
          // @ts-ignore
          this.$wallet,
          // @ts-ignore
          this.swap.fromCoin.mintAddress,
          // @ts-ignore
          this.swap.toCoin.mintAddress,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.swap.fromCoin.mintAddress}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.swap.toCoin.mintAddress}.tokenAccountAddress`),
          this.fromCoinAmount
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

            const description = `Unwrap ${this.fromCoinAmount} ${this.swap.fromCoin?.symbol} to ${this.toCoinAmount} ${this.swap.toCoin?.symbol}`
            this.$accessor.transaction.sub({ txid, description })
          })
          .catch((error) => {
            this.$notify.error({
              key,
              message: 'Swap failed',
              description: error.message
            })
          })
          .finally(() => {
            this.swaping = false
          })
      } else if (this.lpMintAddress) {
        swap(
          this.$web3,
          // @ts-ignore
          this.$wallet,
          get(this.liquidity.infos, this.lpMintAddress),
          // @ts-ignore
          this.swap.fromCoin.mintAddress,
          // @ts-ignore
          this.swap.toCoin.mintAddress,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.swap.fromCoin.mintAddress}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.swap.toCoin.mintAddress}.tokenAccountAddress`),
          this.fromCoinAmount,
          this.setting.slippage
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

            const description = `Swap ${this.fromCoinAmount} ${this.swap.fromCoin?.symbol} to ${this.toCoinAmount} ${this.swap.toCoin?.symbol}`
            this.$accessor.transaction.sub({ txid, description })
          })
          .catch((error) => {
            this.$notify.error({
              key,
              message: 'Swap failed',
              description: error.message
            })
          })
          .finally(() => {
            this.swaping = false
          })
      } else {
        place(
          this.$web3,
          // @ts-ignore
          this.$wallet,
          this.market,
          this.asks,
          this.bids,
          // @ts-ignore
          this.swap.fromCoin.mintAddress,
          // @ts-ignore
          this.swap.toCoin.mintAddress,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.swap.fromCoin.mintAddress}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.swap.toCoin.mintAddress}.tokenAccountAddress`),
          this.fromCoinAmount,
          this.setting.slippage
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

            const description = `Swap ${this.fromCoinAmount} ${this.swap.fromCoin?.symbol} to ${this.toCoinAmount} ${this.swap.toCoin?.symbol}`
            this.$accessor.transaction.sub({ txid, description })
          })
          .catch((error) => {
            this.$notify.error({
              key,
              message: 'Swap failed',
              description: error.message
            })
          })
          .finally(() => {
            this.swaping = false
          })
      }
    }
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
