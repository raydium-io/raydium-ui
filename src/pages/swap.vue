<template>
  <div class="swap container">
    <div class="page-head fs-container">
      <span class="title">Swap</span>
      <div class="buttons">
        <Tooltip placement="bottomRight">
          <template slot="title">
            <span>
              Displayed data will auto-refresh after
              {{ autoRefreshTime - countdown }} seconds. Click this circle to update manually.
            </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / autoRefreshTime) * countdown"
            :show-info="false"
            :class="marketAddress && loading ? 'disabled' : ''"
            @click="
              () => {
                getOrderBooks()
                $accessor.wallet.getTokenAccounts()
              }
            "
          />
        </Tooltip>
        <Tooltip placement="bottomRight">
          <template slot="title">
            <p>Program Addresses (DO NOT DEPOSIT)</p>
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
                  <a :href="`${url.explorer}/token/${fromCoin.mintAddress}`" target="_blank">
                    <Icon type="link" />
                  </a>
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
                  <a :href="`${url.explorer}/token/${toCoin.mintAddress}`" target="_blank">
                    <Icon type="link" />
                  </a>
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
                  <Icon type="copy" @click="$accessor.copy(marketAddress)" />
                  <a v-if="!officialPool" :href="`${url.explorer}/account/${marketAddress}`" target="_blank">
                    <Icon type="link" />
                  </a>
                  <a v-else :href="`${url.trade}/${marketAddress}`" target="_blank">
                    <Icon type="link" />
                  </a>
                </div>
              </div>
              <div v-if="ammId" class="info">
                <div class="symbol">AMM ID</div>
                <div class="address">
                  {{ ammId ? ammId.substr(0, 14) : '' }}
                  ...
                  {{ ammId ? ammId.substr(ammId.length - 14, 14) : '' }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$accessor.copy(ammId)" />
                  <a :href="`${url.explorer}/account/${ammId}`" target="_blank">
                    <Icon type="link" />
                  </a>
                </div>
              </div>
            </div>
          </template>
          <Icon type="info-circle" />
        </Tooltip>
        <Icon type="setting" @click="$accessor.setting.open" />
        <Tooltip placement="bottomRight">
          <template slot="title"> Search for a pool </template>
          <Icon type="search" @click="ammIdOrMarketSearchShow = true" />
        </Tooltip>
      </div>
    </div>

    <CoinSelect v-if="coinSelectShow" @onClose="() => (coinSelectShow = false)" @onSelect="onCoinSelect" />
    <AmmIdSelect
      :show="ammIdSelectShow"
      :liquidity-list="ammIdSelectList"
      :user-close="true"
      @onClose="() => ((ammIdSelectShow = false), (ammIdSelectOld = true))"
      @onSelect="onAmmIdSelect"
    />

    <UnofficialPoolConfirmUser
      v-if="userCheckUnofficialShow"
      @onClose="() => (userCheckUnofficialShow = false)"
      @onSelect="onUserCheckUnofficialSelect"
    />

    <InputAmmIdOrMarket
      v-if="ammIdOrMarketSearchShow"
      @onClose="() => (ammIdOrMarketSearchShow = false)"
      @onInput="onAmmIdOrMarketInput"
    ></InputAmmIdOrMarket>

    <div class="card">
      <div class="card-body">
        <CoinInput
          v-model="fromCoinAmount"
          label="From"
          :balance-offset="fromCoin && fromCoin.symbol === 'SOL' ? -0.05 : 0"
          :mint-address="fromCoin ? fromCoin.mintAddress : ''"
          :coin-name="fromCoin ? fromCoin.symbol : ''"
          :balance="fromCoin ? fromCoin.balance : null"
          :show-half="true"
          @onInput="(amount) => (fromCoinAmount = amount)"
          @onFocus="
            () => {
              fixedFromCoin = true
            }
          "
          @onMax="
            () => {
              fixedFromCoin = true
              fromCoinAmount = fromCoin && fromCoin.balance ? fromCoin.balance.fixed() : '0'
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
          :mint-address="toCoin ? toCoin.mintAddress : ''"
          :coin-name="toCoin ? toCoin.symbol : ''"
          :balance="toCoin ? toCoin.balance : null"
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
              toCoinAmount = toCoin.balance.fixed()
            }
          "
          @onSelect="openToCoinSelect"
        />
        <div class="price-info" style="padding: 0 12px">
          <div v-if="fromCoin && toCoin && isWrap && fromCoinAmount" class="price-base fc-container">
            <span>
              1 {{ fromCoin.symbol }} = 1
              {{ toCoin.symbol }}
            </span>
          </div>
          <div v-else-if="fromCoin && toCoin && lpMintAddress && fromCoinAmount" class="price-base fc-container">
            <span>
              1 {{ hasPriceSwapped ? toCoin.symbol : fromCoin.symbol }} ≈
              {{ hasPriceSwapped ? (1 / outToPirceValue).toFixed(6) : outToPirceValue }}
              {{ hasPriceSwapped ? fromCoin.symbol : toCoin.symbol }}
              <Icon type="swap" @click="() => (hasPriceSwapped = !hasPriceSwapped)" />
            </span>
          </div>
          <div
            v-else-if="fromCoin && toCoin && marketAddress && market && asks && bids && fromCoinAmount"
            class="price-base fc-container"
          >
            <span>
              1 {{ hasPriceSwapped ? toCoin.symbol : fromCoin.symbol }} ≈
              {{ hasPriceSwapped ? (1 / outToPirceValue).toFixed(6) : outToPirceValue }}
              {{ hasPriceSwapped ? fromCoin.symbol : toCoin.symbol }}
              <Icon type="swap" @click="() => (hasPriceSwapped = !hasPriceSwapped)" />
            </span>
          </div>
          <div class="fs-container">
            <span class="name">
              Slippage Tolerance
              <Tooltip placement="right">
                <template slot="title">
                  The maximum difference between your estimated price and execution price.
                </template>
                <Icon type="question-circle" /> </Tooltip
            ></span>
            <span> {{ $accessor.setting.slippage }}% </span>
          </div>
          <div v-if="endpoint" class="fs-container">
            <span class="name">
              Swapping Through
              <Tooltip placement="right">
                <template slot="title"> This venue gave the best price for your trade </template>
                <Icon type="question-circle" /> </Tooltip
            ></span>
            <span style="text-transform: capitalize"> {{ endpoint }} </span>
          </div>
          <div v-if="fromCoin && toCoin && fromCoinAmount && toCoinWithSlippage" class="fs-container">
            <span class="name">
              Minimum Received
              <Tooltip placement="right">
                <template slot="title"> The least amount of tokens you will recieve on this trade </template>
                <Icon type="question-circle" /> </Tooltip
            ></span>
            <span> {{ toCoinWithSlippage }} {{ toCoin.symbol }} </span>
          </div>
          <div
            v-if="endpoint"
            :class="`fs-container price-impact ${
              priceImpact > 10 ? 'error-style' : priceImpact > 5 ? 'warning-style' : ''
            }`"
          >
            <span class="name">
              Price Impact {{ priceImpact > 5 ? 'Warning' : '' }}
              <Tooltip placement="right">
                <template slot="title">
                  The difference between the market price and estimated price due to trade size
                </template>
                <Icon type="question-circle" style="cursor: pointer" /> </Tooltip
            ></span>
            <span :style="`color: ${priceImpact <= 5 ? '#31d0aa' : ''}`"> {{ priceImpact.toFixed(2) }}% </span>
          </div>
        </div>

        <div v-if="officialPool === false">
          <div style="margin: 10px">
            <div>AMM ID:</div>
            <div>
              {{ ammId ? ammId.substr(0, 14) : '' }}
              ...
              {{ ammId ? ammId.substr(ammId.length - 14, 14) : '' }}
            </div>
          </div>
        </div>
        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
        </Button>

        <Button
          v-else-if="!(officialPool || (!officialPool && userCheckUnofficial))"
          size="large"
          ghost
          @click="
            () => {
              setTimeout(() => {
                userCheckUnofficialShow = true
              }, 1)
            }
          "
        >
          Confirm Risk Warning
        </Button>
        <Button
          v-else
          size="large"
          ghost
          :disabled="
            !fromCoin ||
            !fromCoinAmount ||
            !toCoin ||
            (!marketAddress && !lpMintAddress && !isWrap) ||
            !initialized ||
            loading ||
            gt(
              fromCoinAmount,
              fromCoin && fromCoin.balance
                ? fromCoin.symbol === 'SOL'
                  ? fromCoin.balance.toEther().minus(0.05).toFixed(fromCoin.balance.decimals)
                  : fromCoin.balance.fixed()
                : '0'
            ) || // not enough SOL to swap SOL to another coin
            (get(liquidity.infos, `${lpMintAddress}.status`) &&
              get(liquidity.infos, `${lpMintAddress}.status`) !== 1) ||
            swaping ||
            (fromCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, fromCoinAmount)) ||
            (toCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, toCoinAmount))
          "
          :loading="swaping"
          style="width: 100%"
          :class="`swap-btn ${priceImpact > 10 ? 'error-style' : priceImpact > 5 ? 'warning-style' : ''}`"
          @click="
            () => {
              if (priceImpact > 10) {
                confirmModalIsOpen = true
              } else {
                placeOrder()
              }
            }
          "
        >
          <template v-if="!fromCoin || !toCoin"> Select a token </template>
          <template v-else-if="(!marketAddress && !lpMintAddress && !isWrap) || !initialized">
            Pool Not Found
          </template>
          <template v-else-if="!fromCoinAmount"> Enter an amount </template>
          <template v-else-if="loading"> Updating price information </template>
          <template
            v-else-if="
              gt(
                fromCoinAmount,
                fromCoin && fromCoin.balance
                  ? fromCoin.symbol === 'SOL'
                    ? fromCoin.balance.toEther().minus(0.05).toFixed(fromCoin.balance.decimals)
                    : fromCoin.balance.fixed()
                  : '0'
              )
            "
          >
            Insufficient {{ fromCoin.symbol }} balance
          </template>
          <template
            v-else-if="
              get(liquidity.infos, `${lpMintAddress}.status`) && get(liquidity.infos, `${lpMintAddress}.status`) !== 1
            "
          >
            Pool coming soon
          </template>
          <template v-else-if="fromCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, fromCoinAmount)">
            xCOPE amount must greater than 5
          </template>
          <template v-else-if="toCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, toCoinAmount)">
            xCOPE amount must greater than 5
          </template>
          <template v-else>{{ isWrap ? 'Unwrap' : priceImpact > 5 ? 'Swap Anyway' : 'Swap' }}</template>
        </Button>
        <div v-if="solBalance && +solBalance.balance.fixed() - 0.05 <= 0" class="not-enough-sol-alert">
          <span class="caution-text">Caution: Your SOL balance is low</span>

          <Tooltip placement="bottomLeft">
            <template slot="title">
              SOL is needed for Solana network fees. A minimum balance of 0.05 SOL is recommended to avoid failed
              transactions.
            </template>
            <Icon type="question-circle" />
          </Tooltip>
        </div>
      </div>
    </div>

    <div
      v-if="(!baseSymbol && !quoteSymbol && isFetchingUnsettled) || baseUnsettledAmount || quoteUnsettledAmount"
      class="card extra"
    >
      <div class="settle card-body">
        <div v-if="!baseSymbol && !quoteSymbol && isFetchingUnsettled" class="fetching-unsettled">
          <Spin :spinning="true">
            <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
          </Spin>
          <span>Fetching info from market. Please wait.</span>
        </div>

        <table
          v-else-if="(baseSymbol && quoteSymbol && !isFetchingUnsettled && baseUnsettledAmount) || quoteUnsettledAmount"
          class="settel-panel"
        >
          <thead>
            <tr>
              <th colspan="2">You have unsettled balances:</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="baseSymbol && baseUnsettledAmount" class="row">
              <td>{{ baseSymbol }}</td>
              <td>{{ baseUnsettledAmount }}</td>
              <td class="align-right" rowspan="2">
                <Button class="btn" :loading="isSettlingBase" ghost @click="settleFunds('base')">Settle</Button>
              </td>
            </tr>

            <tr v-if="quoteSymbol && quoteUnsettledAmount" class="row">
              <td>{{ quoteSymbol }}</td>
              <td>{{ quoteUnsettledAmount }}</td>
              <td v-if="!baseUnsettledAmount" class="align-right" rowspan="2">
                <Button class="btn" :loading="isSettlingBase" ghost @click="settleFunds('base')">Settle</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal
      class="swap-confirm-modal"
      title="Warning"
      :visible="confirmModalIsOpen === true"
      :footer="null"
      @cancel="confirmModalIsOpen = false"
      @ok="
        () => {
          confirmModalIsOpen = false
          placeOrder()
        }
      "
    >
      <div class="title">Price Impact Warning</div>
      <div class="description">
        Your swap is large relative to liquidity in the pool. Price impact is
        <span class="highlight">higher than 10%</span>. If you're unsure what to do, read about price impact
        <a
          href="https://raydium.gitbook.io/raydium/trading-on-serum/faq#what-is-price-impact"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          here</a
        >.
      </div>
      <div class="description-secondary">Are you sure you want to confirm this swap?</div>
      <div class="btn-group">
        <Button class="cancel-btn" ghost size="large" @click="confirmModalIsOpen = false"> Cancel </Button>
        <Button
          class="swap-btn"
          type="text"
          @click="
            () => {
              confirmModalIsOpen = false
              placeOrder()
            }
          "
        >
          Swap anyway
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Icon, Tooltip, Button, Progress, Spin, Modal } from 'ant-design-vue'

import { cloneDeep, get } from 'lodash-es'
import { Market, Orderbook } from '@project-serum/serum/lib/market.js'

import { PublicKey } from '@solana/web3.js'
import { getTokenBySymbol, TokenInfo, NATIVE_SOL, TOKENS } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getMultipleAccounts, commitment } from '@/utils/web3'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { getOutAmount, getSwapOutAmount, place, swap, wrap, checkUnsettledInfo, settleFund } from '@/utils/swap'
import { TokenAmount, gt } from '@/utils/safe-math'
import { getUnixTs } from '@/utils'
import { canWrap, getLiquidityInfoSimilar } from '@/utils/liquidity'
import {
  getLpListByTokenMintAddresses,
  getPoolListByTokenMintAddresses,
  isOfficalMarket,
  LiquidityPoolInfo
} from '@/utils/pools'

const RAY = getTokenBySymbol('RAY')

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Progress,
    Spin,
    Modal
  },

  data() {
    return {
      TOKENS,

      // should check if user have enough SOL to have a swap
      solBalance: null as TokenAmount | null,

      autoRefreshTime: 60,
      countdown: 0,
      marketTimer: null as any,
      initialized: false,
      loading: false,
      // swaping
      swaping: false,
      asks: {} as any,
      bids: {} as any,

      isFetchingUnsettled: false,
      unsettledOpenOrders: null as any,

      // whether have symbol will
      baseSymbol: '',
      baseUnsettledAmount: 0,
      isSettlingBase: false,

      quoteSymbol: '',
      quoteUnsettledAmount: 0,
      isSettlingQuote: false,

      coinSelectShow: false,
      selectFromCoin: true,
      fixedFromCoin: true,

      fromCoin: RAY as TokenInfo | null,
      toCoin: null as TokenInfo | null,
      fromCoinAmount: '',
      toCoinAmount: '',
      toCoinWithSlippage: '',

      // wrap
      isWrap: false,
      // if priceImpact is higher than 10%, a confirm modal will be shown
      confirmModalIsOpen: false,

      // serum
      market: null as any,
      marketAddress: '',
      // amm
      lpMintAddress: '',
      // trading endpoint
      endpoint: '',
      priceImpact: 0,

      coinBasePrice: true,
      outToPirceValue: 0,

      // whether user has toggle swap button
      hasPriceSwapped: false,

      officialPool: true,
      userCheckUnofficial: false,
      userCheckUnofficialMint: undefined as string | undefined,
      userCheckUnofficialShow: false,
      findUrlAmmId: false,

      ammId: undefined as string | undefined,

      ammIdSelectShow: false,
      ammIdSelectList: [] as LiquidityPoolInfo[] | [],

      ammIdSelectOld: false,

      ammIdOrMarketSearchShow: false,

      userNeedAmmIdOrMarket: undefined as string | undefined,

      setCoinFromMintLoading: false,

      asksAndBidsLoading: true
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
        this.findMarket()
        if (this.ammId) {
          this.needUserCheckUnofficialShow(this.ammId)
        }
        if (this.market) {
          this.fetchUnsettledByMarket()
        }
        this.solBalance = this.wallet.tokenAccounts[NATIVE_SOL.mintAddress]
      },
      deep: true
    },

    fromCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        this.userNeedAmmIdOrMarket = undefined
        this.findMarket()
        this.fromCoinAmount = ''
        this.toCoinAmount = ''
        this.ammIdSelectOld = false
      }
    },

    baseUnsettledAmount() {
      this.isSettlingBase = false
    },

    quoteUnsettledAmount() {
      this.isSettlingQuote = false
    },

    toCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        this.userNeedAmmIdOrMarket = undefined
        this.findMarket()
        this.fromCoinAmount = ''
        this.toCoinAmount = ''
        this.ammIdSelectOld = false
      }
    },

    market() {
      this.baseSymbol = ''
      this.baseUnsettledAmount = 0
      this.quoteSymbol = ''
      this.quoteUnsettledAmount = 0
      this.unsettledOpenOrders = null as any
      this.fetchUnsettledByMarket()
    },

    marketAddress() {
      this.updateAmounts()
    },

    asks() {
      this.updateAmounts()
    },

    bids() {
      this.updateAmounts()
    },

    'liquidity.infos': {
      handler(_newInfos: any) {
        this.updateAmounts()
        const { from, to, ammId } = this.$route.query
        if (this.findUrlAmmId) {
          // @ts-ignore
          this.setCoinFromMint(ammId, from, to)
        }
        this.findMarket()
      },
      deep: true
    },

    'swap.markets': {
      handler(_newInfos: any) {
        this.findMarket()
      },
      deep: true
    },

    'setting.slippage': {
      handler() {
        this.updateAmounts()
      },
      deep: true
    }
  },

  mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)

    this.setMarketTimer()

    const { from, to, ammId } = this.$route.query
    // @ts-ignore
    this.setCoinFromMint(ammId, from, to)
  },

  methods: {
    gt,
    get,

    openFromCoinSelect() {
      this.selectFromCoin = true
      this.closeAllModal('coinSelectShow')
      setTimeout(() => {
        this.coinSelectShow = true
      }, 1)
    },

    openToCoinSelect() {
      this.selectFromCoin = false
      this.closeAllModal('coinSelectShow')
      setTimeout(() => {
        this.coinSelectShow = true
      }, 1)
    },

    onCoinSelect(tokenInfo: TokenInfo) {
      if (tokenInfo !== null) {
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
      } else {
        // check coin
        if (this.fromCoin !== null) {
          const newFromCoin = Object.values(TOKENS).find((item) => item.mintAddress === this.fromCoin?.mintAddress)
          if (newFromCoin === null || newFromCoin === undefined) {
            this.fromCoin = null
          }
        }
        if (this.toCoin !== null) {
          const newToCoin = Object.values(TOKENS).find((item) => item.mintAddress === this.toCoin?.mintAddress)
          if (newToCoin === null || newToCoin === undefined) {
            this.toCoin = null
          }
        }
      }
      this.coinSelectShow = false
    },

    setCoinFromMint(ammIdOrMarket: string | undefined, from: string | undefined, to: string | undefined) {
      this.setCoinFromMintLoading = true
      let fromCoin, toCoin
      try {
        this.findUrlAmmId = !this.liquidity.initialized
        this.userNeedAmmIdOrMarket = ammIdOrMarket
        // @ts-ignore
        const liquidityUser = getLiquidityInfoSimilar(ammIdOrMarket, from, to)
        if (liquidityUser) {
          if (from) {
            fromCoin = liquidityUser.coin.mintAddress === from ? liquidityUser.coin : liquidityUser.pc
            toCoin = liquidityUser.coin.mintAddress === fromCoin.mintAddress ? liquidityUser.pc : liquidityUser.coin
          }
          if (to) {
            toCoin = liquidityUser.coin.mintAddress === to ? liquidityUser.coin : liquidityUser.pc
            fromCoin = liquidityUser.coin.mintAddress === toCoin.mintAddress ? liquidityUser.pc : liquidityUser.coin
          }
          if (!(from && to)) {
            fromCoin = liquidityUser.coin
            toCoin = liquidityUser.pc
          }
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
        }
      } catch (error) {
        this.$notify.warning({
          message: error.message,
          description: ''
        })
      }
      setTimeout(() => {
        this.setCoinFromMintLoading = false
        this.findMarket()
      }, 1)
    },

    needUserCheckUnofficialShow(ammId: string) {
      if (!this.wallet.connected) {
        return
      }
      if (this.officialPool) {
        return
      }

      const localCheckStr = localStorage.getItem(`${this.wallet.address}--checkAmmId`)
      const localCheckAmmIdList = localCheckStr ? localCheckStr.split('---') : []
      if (localCheckAmmIdList.includes(ammId)) {
        this.userCheckUnofficial = true
        this.userCheckUnofficialMint = ammId
        this.userCheckUnofficialShow = false
        return
      }
      if (this.userCheckUnofficialMint === ammId) {
        this.userCheckUnofficial = true
        this.userCheckUnofficialShow = false
        return
      }
      this.userCheckUnofficial = false
      this.closeAllModal('userCheckUnofficialShow')
      setTimeout(() => {
        this.userCheckUnofficialShow = true
      }, 1)
    },

    onAmmIdSelect(liquidityInfo: LiquidityPoolInfo | undefined) {
      this.ammIdSelectShow = false
      if (liquidityInfo) {
        this.lpMintAddress = liquidityInfo.lp.mintAddress
        this.ammId = liquidityInfo.ammId
        this.userNeedAmmIdOrMarket = this.ammId
        this.officialPool = liquidityInfo.official
        this.findMarket()
      } else {
        this.ammIdSelectOld = true
        this.findMarket()
      }
    },

    onAmmIdOrMarketInput(ammIdOrMarket: string) {
      this.ammIdOrMarketSearchShow = false
      this.setCoinFromMint(ammIdOrMarket, undefined, undefined)
      this.findMarket()
    },

    onUserCheckUnofficialSelect(userSelect: boolean, userSelectAll: boolean) {
      this.userCheckUnofficialShow = false
      if (userSelect) {
        this.userCheckUnofficial = true
        this.userCheckUnofficialMint = this.ammId
        if (userSelectAll) {
          const localCheckStr = localStorage.getItem(`${this.wallet.address}--checkAmmId`)
          if (localCheckStr) {
            localStorage.setItem(`${this.wallet.address}--checkAmmId`, localCheckStr + `---${this.ammId}`)
          } else {
            localStorage.setItem(`${this.wallet.address}--checkAmmId`, `${this.ammId}`)
          }
        }
      } else {
        this.fromCoin = null
        this.toCoin = null
        this.ammId = undefined
        this.officialPool = true
      }
    },

    changeCoinPosition() {
      this.setCoinFromMintLoading = true
      const tempFromCoin = this.fromCoin
      const tempToCoin = this.toCoin
      setTimeout(() => {
        this.setCoinFromMintLoading = false
      }, 1)

      this.fromCoin = tempToCoin
      this.toCoin = tempFromCoin

      this.changeCoinAmountPosition()
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

    findMarket() {
      if (this.fromCoin && this.toCoin && this.liquidity.initialized) {
        const InputAmmIdOrMarket = this.userNeedAmmIdOrMarket

        // let userSelectFlag = false
        // wrap & unwrap
        if (canWrap(this.fromCoin.mintAddress, this.toCoin.mintAddress)) {
          this.isWrap = true
          this.initialized = true
          this.officialPool = true
          this.ammId = undefined
          return
        }

        let marketAddress = ''

        // serum
        for (const address of Object.keys(this.swap.markets)) {
          if (isOfficalMarket(address)) {
            const info = cloneDeep(this.swap.markets[address])
            let fromMint = this.fromCoin.mintAddress
            let toMint = this.toCoin.mintAddress
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
              // if (!info.baseDepositsTotal.isZero() && !info.quoteDepositsTotal.isZero()) {
              marketAddress = address
              // }
            }
          }
        }

        if (this.fromCoin.mintAddress && this.toCoin.mintAddress) {
          const liquidityListV4 = getPoolListByTokenMintAddresses(
            this.fromCoin.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.fromCoin.mintAddress,
            this.toCoin.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.toCoin.mintAddress,
            typeof InputAmmIdOrMarket === 'string' ? InputAmmIdOrMarket : undefined
          )
          const liquidityListV3 = getLpListByTokenMintAddresses(
            this.fromCoin.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.fromCoin.mintAddress,
            this.toCoin.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.toCoin.mintAddress,
            typeof InputAmmIdOrMarket === 'string' ? InputAmmIdOrMarket : undefined,
            [3]
          )

          let lpMintAddress
          let ammId
          let officialPool = true
          if (liquidityListV4.length === 1 && !liquidityListV4[0].official && liquidityListV3.length > 0) {
            console.log('v3')
          } else if (liquidityListV4.length === 1 && liquidityListV4[0].official) {
            // official
            lpMintAddress = liquidityListV4[0].lp.mintAddress
            ammId = liquidityListV4[0].ammId
            // mark
            officialPool = liquidityListV4[0].official
            this.userCheckUnofficialMint = undefined
            marketAddress = liquidityListV4[0].serumMarket
          } else if (
            marketAddress !== '' &&
            (InputAmmIdOrMarket === undefined || InputAmmIdOrMarket === marketAddress)
          ) {
            console.log('official market')
          } else if (liquidityListV4.length === 1 && InputAmmIdOrMarket) {
            // user select
            ammId = liquidityListV4[0].ammId
            lpMintAddress = liquidityListV4[0].lp.mintAddress
            officialPool = liquidityListV4[0].official
            marketAddress = liquidityListV4[0].serumMarket
          } else if (liquidityListV4.length > 0 && this.ammIdSelectOld) {
            console.log('last user select none')
          } else if (liquidityListV4.length > 0) {
            // user select amm id
            this.coinSelectShow = false
            setTimeout(() => {
              this.ammIdSelectShow = true
              // @ts-ignore
              this.ammIdSelectList = Object.values(this.liquidity.infos).filter((item: LiquidityPoolInfo) =>
                liquidityListV4.find((liquidityItem) => liquidityItem.ammId === item.ammId)
              )
            }, 1)
            return
          }
          this.lpMintAddress = lpMintAddress ?? ''
          this.initialized = true
          this.ammId = ammId
          this.officialPool = officialPool
          if (ammId !== this.userCheckUnofficialMint) {
            this.userCheckUnofficialMint = undefined
          }
          if (ammId) {
            this.needUserCheckUnofficialShow(ammId)
          }
        }

        if (marketAddress) {
          // const lpPool = LIQUIDITY_POOLS.find((item) => item.serumMarket === marketAddress)
          if (this.marketAddress !== marketAddress) {
            this.marketAddress = marketAddress
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
          this.endpoint = ''
          this.marketAddress = ''
          this.market = null
          this.lpMintAddress = ''
          this.isWrap = false
          // this.unsubPoolChange()
        }
        this.updateUrl()
      } else {
        this.ammId = undefined
        this.endpoint = ''
        this.marketAddress = ''
        this.market = null
        this.lpMintAddress = ''
        this.isWrap = false
        // this.unsubPoolChange()
      }
    },

    getOrderBooks() {
      this.loading = true
      this.asksAndBidsLoading = true
      this.countdown = this.autoRefreshTime

      const conn = this.$web3
      if (this.marketAddress && get(this.swap.markets, this.marketAddress)) {
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
              this.asksAndBidsLoading = false
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
      let toCoinAmount = ''
      let toCoinWithSlippage = null
      let price = 0
      let impact = 0
      let endpoint = ''
      if (this.fromCoin && this.toCoin && this.isWrap && this.fromCoinAmount) {
        // wrap & unwrap
        this.toCoinAmount = this.fromCoinAmount
        return
      }
      if (this.fromCoin && this.toCoin && this.ammId && this.fromCoinAmount) {
        // amm
        const poolInfo = Object.values(this.$accessor.liquidity.infos).find((p: any) => p.ammId === this.ammId)
        const { amountOut, amountOutWithSlippage, priceImpact } = getSwapOutAmount(
          poolInfo,
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress,
          this.fromCoinAmount,
          this.setting.slippage
        )
        if (!amountOut.isNullOrZero()) {
          console.log(`input: ${this.fromCoinAmount} raydium out: ${amountOutWithSlippage.fixed()}`)
          toCoinAmount = amountOut.fixed()
          toCoinWithSlippage = amountOutWithSlippage
          price = +new TokenAmount(
            parseFloat(toCoinAmount) / parseFloat(this.fromCoinAmount),
            this.toCoin.decimals,
            false
          ).fixed()
          impact = priceImpact
          endpoint = 'Raydium Pool'
        }
      }
      if (
        this.fromCoin &&
        this.toCoin &&
        this.marketAddress &&
        this.market &&
        this.asks &&
        this.bids &&
        this.fromCoinAmount &&
        !this.asksAndBidsLoading
      ) {
        // serum
        const { amountOut, amountOutWithSlippage, priceImpact } = getOutAmount(
          this.market,
          this.asks,
          this.bids,
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress,
          this.fromCoinAmount,
          this.setting.slippage
        )

        const out = new TokenAmount(amountOut, this.toCoin.decimals, false)
        const outWithSlippage = new TokenAmount(amountOutWithSlippage, this.toCoin.decimals, false)

        if (!out.isNullOrZero()) {
          console.log(`input: ${this.fromCoinAmount}   serum out: ${outWithSlippage.fixed()}`)
          if (!toCoinWithSlippage || toCoinWithSlippage.wei.isLessThan(outWithSlippage.wei)) {
            toCoinAmount = out.fixed()
            toCoinWithSlippage = outWithSlippage
            price = +new TokenAmount(
              parseFloat(toCoinAmount) / parseFloat(this.fromCoinAmount),
              this.toCoin.decimals,
              false
            ).fixed()
            impact = priceImpact
            endpoint = 'serum DEX'
          }
        }
      }

      if (toCoinWithSlippage) {
        this.toCoinAmount = toCoinAmount
        this.toCoinWithSlippage = toCoinWithSlippage.fixed()
        this.outToPirceValue = price
        this.priceImpact = impact
        this.endpoint = endpoint
      } else {
        this.toCoinAmount = ''
        this.toCoinWithSlippage = ''
        this.outToPirceValue = 0
        this.priceImpact = 0
        this.endpoint = ''
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
          this.fromCoin.mintAddress,
          // @ts-ignore
          this.toCoin.mintAddress,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.fromCoin.mintAddress}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.toCoin.mintAddress}.tokenAccountAddress`),
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

            const description = `Unwrap ${this.fromCoinAmount} ${this.fromCoin?.symbol} to ${this.toCoinAmount} ${this.toCoin?.symbol}`
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
      } else if (this.endpoint === 'Raydium Pool' && this.ammId) {
        const poolInfo = Object.values(this.$accessor.liquidity.infos).find((p: any) => p.ammId === this.ammId)
        swap(
          this.$web3,
          // @ts-ignore
          this.$wallet,
          poolInfo,
          // @ts-ignore
          this.fromCoin.mintAddress,
          // @ts-ignore
          this.toCoin.mintAddress,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.fromCoin.mintAddress}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.toCoin.mintAddress}.tokenAccountAddress`),
          this.fromCoinAmount,
          this.toCoinWithSlippage
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

            const description = `Swap ${this.fromCoinAmount} ${this.fromCoin?.symbol} to ${this.toCoinAmount} ${this.toCoin?.symbol}`
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
          this.fromCoin.mintAddress,
          // @ts-ignore
          this.toCoin.mintAddress,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.fromCoin.mintAddress}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${this.toCoin.mintAddress}.tokenAccountAddress`),
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

            const description = `Swap ${this.fromCoinAmount} ${this.fromCoin?.symbol} to ${this.toCoinAmount} ${this.toCoin?.symbol}`
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
    },

    async updateUrl() {
      if (this.$route.path !== '/swap/') {
        return
      }
      const { from, to } = this.$route.query
      if (this.ammId) {
        await this.$router.push({
          path: '/swap/',
          query: {
            ammId: this.ammId
          }
        })
      } else if (this.fromCoin && this.toCoin) {
        if (this.fromCoin.mintAddress !== from || this.toCoin.mintAddress !== to) {
          await this.$router.push({
            path: '/swap/',
            query: {
              from: this.fromCoin.mintAddress,
              to: this.toCoin.mintAddress
            }
          })
        }
      } else if (!(this.$route.query && Object.keys(this.$route.query).length === 0)) {
        await this.$router.push({
          path: '/swap/'
        })
      }
    },

    closeAllModal(showName: string) {
      if (showName !== 'coinSelectShow') {
        this.coinSelectShow = false
      }
      if (showName !== 'ammIdSelectShow') {
        this.ammIdSelectShow = false
      }
      if (showName !== 'userCheckUnofficialShow') {
        this.userCheckUnofficialShow = false
      }
      if (showName !== 'ammIdOrMarketSearchShow') {
        this.ammIdOrMarketSearchShow = false
      }
    },

    async fetchUnsettledByMarket() {
      if (this.isFetchingUnsettled) return
      if (!this.$web3 || !this.$wallet || !this.market) return
      this.isFetchingUnsettled = true
      try {
        const info = await checkUnsettledInfo(this.$web3, this.$wallet, this.market)
        if (!info) throw new Error('not enough data')
        this.baseSymbol = info.baseSymbol ?? ''
        this.baseUnsettledAmount = info.baseUnsettledAmount

        this.quoteSymbol = info.quoteSymbol ?? ''
        this.quoteUnsettledAmount = info.quoteUnsettledAmount
        this.unsettledOpenOrders = info.openOrders // have to establish an extra state, to store this value
      } catch (e) {
      } finally {
        this.isFetchingUnsettled = false
      }
    },

    settleFunds(from: 'base' | 'quote') {
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      let baseMint = (this.market as Market).baseMintAddress.toBase58()
      let quoteMint = (this.market as Market).quoteMintAddress.toBase58()

      let baseWallet = get(this.wallet.tokenAccounts, `${baseMint}.tokenAccountAddress`)
      let quoteWallet = get(this.wallet.tokenAccounts, `${quoteMint}.tokenAccountAddress`)
      if (from === 'quote') {
        ;[baseWallet, quoteWallet] = [quoteWallet, baseWallet]
        ;[baseMint, quoteMint] = [quoteMint, baseMint]
      }
      if (from === 'quote') {
        this.isSettlingQuote = true
      } else {
        this.isSettlingBase = true
      }

      settleFund(
        this.$web3,
        this.market,
        this.unsettledOpenOrders,
        this.$wallet,
        baseMint,
        quoteMint,
        baseWallet,
        quoteWallet
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

          const description = `Settle`
          this.$accessor.transaction.sub({ txid, description })
        })
        .then(() => {
          this.fetchUnsettledByMarket()
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Settle failed',
            description: error.message
          })
          this.isSettlingQuote = false
          this.isSettlingBase = false
        })
    }
  }
})
</script>

<style>
.swap-confirm-modal .ant-btn-text {
  background: transparent;
  border: none;
}
.swap-confirm-modal .title {
  font-size: 22px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 8px;
}
.swap-confirm-modal .description {
  text-align: center;
  margin: 0 64px 32px;
}
.swap-confirm-modal .description-secondary {
  font-size: 16px;
  text-align: center;
  margin: 0 32px 16px;
}
.swap-confirm-modal .description .highlight {
  font-weight: bold;
  color: #ed4b9e;
}
.swap-confirm-modal .btn-group {
  display: grid;
  justify-items: center;
  gap: 4px;
}
.swap-confirm-modal .btn-group .cancel-btn {
  width: 156px;
}
</style>

<style lang="less" sxcoped>
.warning-style {
  font-weight: bold;
  color: #f0b90b;
}
.swap-btn.warning-style {
  font-weight: normal;
}
.error-style {
  font-weight: bold;
  color: #ed4b9e;
}
.swap-btn.error-style {
  font-weight: normal;
}

.container {
  max-width: 450px;

  .price-info {
    display: grid;
    grid-auto-rows: auto;
    grid-row-gap: 8px;
    row-gap: 8px;
    padding: 0 12px;
    font-size: 12px;
    line-height: 20px;
    margin-bottom: 6px;
    .anticon-swap {
      margin-left: 10px;
      padding: 5px;
      border-radius: 50%;
      background: #000829;
    }
    .price-base {
      line-height: 24px;
    }
    .fs-container {
      .name {
        opacity: 0.75;
      }
    }
  }

  .not-enough-sol-alert {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-bottom: -18px;
    margin-top: 4px;
  }

  .change-side {
    div {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background: #000829;
      cursor: pointer;
    }
  }

  .fetching-unsettled {
    margin: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #ffffffad;
    span {
      margin-top: 16px;
      text-align: center;
    }
  }

  .settle.card-body {
    padding: 16px 24px;
  }
  .extra {
    margin-top: 32px;
    margin-bottom: 32px;

    .settel-panel {
      .align-right {
        text-align: right;
      }
      th {
        font-weight: normal;
      }
      td {
        padding-bottom: 4px;
        width: 25%;
      }
      thead {
        font-size: 14px;
        tr:first-child {
          margin-top: 8px;
        }
      }
      tbody {
        tr:first-child {
          td {
            padding-top: 6px;
          }
        }
      }
    }
  }
}
</style>
