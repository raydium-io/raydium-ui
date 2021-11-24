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
            :class="loading ? 'disabled' : ''"
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
              <div v-if="showMarket" class="info">
                <div class="symbol">Market</div>
                <div class="address">
                  {{ showMarket.substr(0, 14) }}
                  ...
                  {{ showMarket.substr(showMarket.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$accessor.copy(showMarket)" />
                  <a :href="`${url.explorer}/account/${showMarket}`" target="_blank">
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

    <InputAmmIdOrMarket
      v-if="ammIdOrMarketSearchShow"
      @onClose="() => (ammIdOrMarketSearchShow = false)"
      @onInput="onAmmIdOrMarketInput"
    ></InputAmmIdOrMarket>

    <UnofficialCoinConfirmUser
      v-if="userCheckUnofficialShow"
      @onClose="() => (userCheckUnofficialShow = false)"
      @onSelect="onUserCheckUnofficialSelect"
    />

    <div class="card">
      <div class="card-body">
        <CoinInput
          v-model="fromCoinAmount"
          label="From"
          :balance-offset="
            fromCoin && fromCoin.symbol === 'SOL' && get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`)
              ? get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`).fixed() - 0.05
              : 0
          "
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
          <div v-if="fromCoin && toCoin && fromCoinAmount && outToPirceValue" class="price-base fc-container">
            <span>
              1 {{ hasPriceSwapped ? toCoin.symbol : fromCoin.symbol }} ≈
              {{
                hasPriceSwapped
                  ? (1 / outToPirceValue).toFixed(fromCoin.decimals)
                  : outToPirceValue.toFixed(toCoin.decimals)
              }}
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
            <span> {{ endpoint }} </span>
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
              priceImpact > 5 ? 'error-style' : priceImpact > 1 ? 'warning-style' : ''
            }`"
          >
            <span class="name" style="opacity: 1">
              Price Impact {{ priceImpact > 1 ? 'Warning' : '' }}
              <Tooltip placement="right">
                <template slot="title">
                  The difference between the market price and estimated price due to trade size
                </template>
                <Icon type="question-circle" style="cursor: pointer" /> </Tooltip
            ></span>
            <span :style="`color: ${priceImpact <= 1 ? '#31d0aa' : ''}`">
              {{ priceImpact.toFixed(2) === '0.00' ? '&lt; 0.01' : priceImpact.toFixed(2) }}%
            </span>
          </div>
        </div>

        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
        </Button>

        <Button
          v-else-if="
            toCoin &&
            userCheckUnofficialMint !== toCoin.mintAddress &&
            !toCoin.tags.includes('raydium') &&
            needUserCheckUnofficial()
          "
          size="large"
          ghost
          @click="needUserCheckUnofficialShow()"
        >
          Confirm Risk Warning
        </Button>
        <div
          v-else-if="
            fromCoin &&
            fromCoinAmount &&
            toCoin &&
            toCoinAmount &&
            initialized &&
            !loading &&
            (usedAmmId || usedRouteInfo) &&
            (setupFlag || needCreateTokens() || needWrapSol()) &&
            !gt(
              fromCoinAmount,
              fromCoin && fromCoin.balance
                ? fromCoin.symbol === 'SOL'
                  ? fromCoin.balance
                      .toEther()
                      .minus(0.05)
                      .plus(
                        get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`)
                          ? get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`).toEther()
                          : 0
                      )
                      .toFixed(fromCoin.balance.decimals)
                  : fromCoin.balance.fixed()
                : '0'
            )
          "
        >
          <div style="width: 45%; float: left">
            <Tooltip style="width: 100%">
              <template slot="title">
                <span>
                  {{
                    setupFlagWSOL
                      ? 'Due to limits on Solana transaction sizes, this step is required to create wrapped SOL (wSOL) in your wallet before swapping.'
                      : 'Due to limits on Solana transaction sizes, this step is required to create token accounts in your wallet before swapping.'
                  }}
                </span>
              </template>
              <Button
                style="width: 100%"
                :disabled="!(needCreateTokens() || needWrapSol())"
                size="large"
                :loading="loadingArr['setup']"
                :class="`${
                  priceImpact > 5 && (needCreateTokens() || needWrapSol())
                    ? 'error-style'
                    : priceImpact > 1
                    ? 'warning-style'
                    : ''
                }`"
                ghost
                @click="
                  () => {
                    if (priceImpact > 5) {
                      confirmModalIsOpen = true
                    } else {
                      placeOrder('setup')
                    }
                  }
                "
              >
                Setup
              </Button>
            </Tooltip>
          </div>
          <div style="width: 45%; float: right">
            <Button
              style="width: 100%"
              :disabled="!(!needCreateTokens() && !needWrapSol())"
              size="large"
              :loading="loadingArr['swap']"
              :class="`${
                priceImpact > 5 && !needCreateTokens() && !needWrapSol()
                  ? 'error-style'
                  : priceImpact > 1
                  ? 'warning-style'
                  : ''
              }`"
              ghost
              @click="
                () => {
                  if (priceImpact > 5) {
                    confirmModalIsOpen = true
                  } else {
                    placeOrder('swap')
                  }
                }
              "
            >
              Swap
            </Button>
          </div>
          <div style="clear: both"></div>

          <div class="step-box" style="margin-top: 20px">
            <div
              class="setup-item"
              :style="{ borderColor: needCreateTokens() || needWrapSol() ? '#82d1ca' : '#82d1ca99' }"
            >
              1
            </div>
            <div
              style="width: 50%; height: 2px; display: inline-block"
              :style="{ background: needCreateTokens() || needWrapSol() ? '#85858d' : '#82d1ca99' }"
            ></div>
            <div
              class="setup-item"
              :style="{ borderColor: needCreateTokens() || needWrapSol() ? '#85858d' : '#82d1ca' }"
            >
              2
            </div>
          </div>
        </div>

        <Button
          v-else
          size="large"
          ghost
          :disabled="
            !fromCoin ||
            !fromCoinAmount ||
            !toCoin ||
            !initialized ||
            loading ||
            swaping ||
            (fromCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, fromCoinAmount)) ||
            (toCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, toCoinAmount)) ||
            gt(
              fromCoinAmount,
              fromCoin && fromCoin.balance
                ? fromCoin.symbol === 'SOL'
                  ? fromCoin.balance
                      .toEther()
                      .minus(0.05)
                      .plus(
                        get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`)
                          ? get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`).toEther()
                          : 0
                      )
                      .toFixed(fromCoin.balance.decimals)
                  : fromCoin.balance.fixed()
                : '0'
            ) ||
            amms.length + routeInfos.length + Object.keys(market) === 0 ||
            (get(liquidity.infos, `${lpMintAddress}.status`) &&
              get(liquidity.infos, `${lpMintAddress}.status`) !== 1) ||
            (amms.length + routeInfos.length === 0 && Object.keys(market).length !== 0)
          "
          :loading="swaping"
          style="width: 100%"
          :class="`swap-btn ${priceImpact > 5 ? 'error-style' : priceImpact > 1 ? 'warning-style' : ''}`"
          @click="
            () => {
              if (priceImpact > 5) {
                confirmModalIsOpen = true
              } else {
                placeOrder()
              }
            }
          "
        >
          <template v-if="!fromCoin || !toCoin"> Select a token </template>
          <template v-else-if="amms.length + routeInfos.length + Object.keys(market).length === 0">
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
                    ? fromCoin.balance
                        .toEther()
                        .minus(0.05)
                        .plus(
                          get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`)
                            ? get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`).toEther()
                            : 0
                        )
                        .toFixed(fromCoin.balance.decimals)
                    : fromCoin.balance.fixed()
                  : '0'
              )
            "
          >
            Insufficient {{ fromCoin.symbol }} balance
          </template>
          <template
            v-else-if="
              (get(liquidity.infos, `${lpMintAddress}.status`) &&
                get(liquidity.infos, `${lpMintAddress}.status`) !== 1) ||
              (amms.length + routeInfos.length === 0 && Object.keys(market).length !== 0)
            "
          >
            Pool coming soon
          </template>
          <template v-else-if="needCreateTokens()"> Create Tokens </template>
          <template v-else-if="needWrapSol()"> Wrap {{ Math.ceil(needWrapSol() / 10 ** 3) / 10 ** 6 }} SOL </template>
          <template v-else-if="fromCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, fromCoinAmount)">
            xCOPE amount must greater than 5
          </template>
          <template v-else-if="toCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, toCoinAmount)">
            xCOPE amount must greater than 5
          </template>
          <template v-else>{{ priceImpact > 1 ? 'Swap Anyway' : 'Swap' }}</template>
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

    <!-- <div v-if="get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`)" class="card extra">
      <div class="settle card-body">
        <table class="settel-panel">
          <thead>
            <tr>
              <th colspan="2">You have WSOL balances:</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row">
              <td>{{ get(wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`).fixed() }}</td>
              <td class="align-right" rowspan="2">
                <Button class="btn" :loading="isSettlingBase" ghost @click="unwrap">UnwrapWsol</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->

    <Modal
      class="swap-confirm-modal"
      title="Price Impact Warning"
      :visible="confirmModalIsOpen === true"
      :footer="null"
      style="font-size: 20px; text-align: center"
      @cancel="confirmModalIsOpen = false"
      @ok="
        () => {
          confirmModalIsOpen = false
          placeOrder()
        }
      "
    >
      <div class="description-secondary">
        Your price impact is <span class="highlight">{{ priceImpact.toFixed(2) }}%</span> on this swap.
      </div>

      <div class="description">
        You are receiving an unfavorable price as your trade is large relative to liquidity in the pool. Read about
        price impact
        <a
          href="https://raydium.gitbook.io/raydium/trading-on-serum/faq#what-is-price-impact"
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          here</a
        >.
      </div>

      <div class="description-secondary">Are you sure you want to continue this swap?</div>

      <div class="description-secondary" style="font-size: 14px; margin: 0">
        {{ fromCoinAmount }} {{ fromCoin && fromCoin.symbol }} → {{ toCoinAmount }} {{ toCoin && toCoin.symbol }}
      </div>

      <div class="description-secondary" style="font-size: 14px; margin: 0">
        Exchange rate:
        <span class="price-info" style="padding: 0 12px">
          <span v-if="fromCoin && toCoin && fromCoinAmount && outToPirceValue" class="price-base">
            <span>
              1 {{ hasPriceSwapped ? toCoin.symbol : fromCoin.symbol }} ≈
              {{
                hasPriceSwapped
                  ? (1 / outToPirceValue).toFixed(fromCoin.decimals)
                  : outToPirceValue.toFixed(toCoin.decimals)
              }}
              {{ hasPriceSwapped ? fromCoin.symbol : toCoin.symbol }}
              <Icon type="swap" @click="() => (hasPriceSwapped = !hasPriceSwapped)" />
            </span>
          </span>
        </span>
      </div>
      <div class="description-secondary" style="font-size: 14px; margin: 0">
        Minimum received: <span class="highlight">{{ toCoinWithSlippage }} {{ toCoin && toCoin.symbol }}</span>
      </div>

      <div class="btn-group" style="margin-top: 20px; display: flex; justify-content: center; align-items: center">
        <Button class="cancel-btn" ghost size="large" style="margin-right: 10px" @click="confirmModalIsOpen = false">
          Cancel
        </Button>
        <Button
          class="cancel-btn"
          ghost
          size="large"
          style="color: #ed4b9e; border-color: #ed4b9e"
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
import { Market, OpenOrders, Orderbook } from '@project-serum/serum/lib/market.js'

import { Account, PublicKey, Transaction } from '@solana/web3.js'
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import { getTokenBySymbol, TokenInfo, NATIVE_SOL, TOKENS } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getMultipleAccounts, commitment, sendTransaction } from '@/utils/web3'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import {
  getOutAmount,
  getSwapOutAmount,
  place,
  swap,
  checkUnsettledInfo,
  settleFund,
  swapRoute,
  getSwapRouter,
  preSwapRoute
} from '@/utils/swap'
import { TokenAmount, gt } from '@/utils/safe-math'
import { getUnixTs } from '@/utils'
import { getLiquidityInfoSimilar } from '@/utils/liquidity'
import { isOfficalMarket, LiquidityPoolInfo, LIQUIDITY_POOLS } from '@/utils/pools'
import { RouterInfo, RouterInfoItem } from '@/types/api'
import { getBigNumber } from '@/utils/layouts'

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

      isFetchingUnsettled: false,
      unsettledOpenOrders: null as any,

      // whether have symbol will
      baseSymbol: '',
      baseUnsettledAmount: 0,
      isSettlingBase: false,

      quoteSymbol: '',
      quoteUnsettledAmount: 0,

      coinSelectShow: false,
      selectFromCoin: true,
      fixedFromCoin: true,

      fromCoin: RAY as TokenInfo | null,
      toCoin: null as TokenInfo | null,
      fromCoinAmount: '',
      toCoinAmount: '',
      toCoinWithSlippage: '',

      // if priceImpact is higher than 10%, a confirm modal will be shown
      confirmModalIsOpen: false,

      // serum
      market: {} as {
        [marketAddress: string]: {
          market: Market
          asks?: {}
          bids?: {}
          unSettleConfig?: {
            baseSymbol: string
            baseUnsettledAmount: number
            quoteSymbol: string
            quoteUnsettledAmount: number
            unsettledOpenOrders: OpenOrders
          }
        }
      },
      side: null as 'buy' | 'sell' | null,
      worstPrice: null as number | null,
      // amm
      lpMintAddress: '',
      // trading endpoint
      endpoint: '',
      priceImpact: 0,

      coinBasePrice: true,
      outToPirceValue: 0,

      // whether user has toggle swap button
      hasPriceSwapped: false,

      userCheckUnofficialMint: undefined as string | undefined,
      userCheckUnofficialShow: false,

      ammIdOrMarketSearchShow: false,

      setCoinFromMintLoading: false,

      asksAndBidsLoading: true,

      routeInfo: undefined as RouterInfo['data'] | undefined,
      usedAmmId: undefined as string | undefined,
      usedRouteInfo: undefined as RouterInfoItem | undefined,
      middleCoinAmount: null as any,

      amms: [] as LiquidityPoolInfo[],
      routeInfos: [] as [LiquidityPoolInfo, LiquidityPoolInfo][],

      loadingArr: {
        setup: false,
        swap: false
      } as { [key: string]: boolean },

      setupFlag: false as boolean,
      setupLastData: '' as string,
      setupFlagWSOL: false as boolean,

      showMarket: undefined as string | undefined
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
        if (this.market) {
          this.fetchUnsettledByMarket()
        }
        this.solBalance = this.wallet.tokenAccounts[NATIVE_SOL.mintAddress]
        if (this.toCoin) this.needUserCheckUnofficialShow()
      },
      deep: true
    },

    fromCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        this.findMarket()
        this.fromCoinAmount = ''
        this.toCoinAmount = ''
      }
    },

    baseUnsettledAmount() {
      this.isSettlingBase = false
    },

    toCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        this.findMarket()
        this.fromCoinAmount = ''
        this.toCoinAmount = ''
        this.userCheckUnofficialMint = ''
        this.needUserCheckUnofficialShow()
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
        // @ts-ignore
        this.setCoinFromMint(from, to, ammId)
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
    this.setCoinFromMint(from, to, ammId)
  },

  methods: {
    gt,
    get,
    getBigNumber,

    needUserCheckUnofficial() {
      const userCheckCoinStr = localStorage.getItem(`${this.wallet.address}--checkCoinMint`)
      const userCheckCoin = userCheckCoinStr ? userCheckCoinStr.split('---') : []
      return (
        this.toCoin &&
        this.toCoin.mintAddress !== this.userCheckUnofficialMint &&
        !this.toCoin.tags.includes('raydium') &&
        !userCheckCoin.includes(this.toCoin.mintAddress)
      )
    },
    needUserCheckUnofficialShow() {
      if (!this.wallet.connected) {
        return
      }

      if (this.needUserCheckUnofficial()) {
        this.closeAllModal('userCheckUnofficialShow')

        this.$nextTick(() => {
          this.userCheckUnofficialShow = true
        })
      }
    },

    onUserCheckUnofficialSelect(userSelect: boolean, userSelectAll: boolean) {
      this.userCheckUnofficialShow = false
      if (userSelect && this.toCoin) {
        this.userCheckUnofficialMint = this.toCoin.mintAddress
        if (userSelectAll) {
          const localCheckStr = localStorage.getItem(`${this.wallet.address}--checkCoinMint`)
          if (localCheckStr) {
            localStorage.setItem(
              `${this.wallet.address}--checkCoinMint`,
              localCheckStr + `---${this.toCoin.mintAddress}`
            )
          } else {
            localStorage.setItem(`${this.wallet.address}--checkCoinMint`, `${this.toCoin.mintAddress}`)
          }

          if (this.toCoin.mintAddress === NATIVE_SOL.mintAddress) {
            NATIVE_SOL.tags.push('userAdd')
          } else {
            const tokensKey = Object.keys(TOKENS).find((item) => TOKENS[item].mintAddress === this.toCoin?.mintAddress)
            if (tokensKey && TOKENS[tokensKey] && !TOKENS[tokensKey].tags.includes('userAdd')) {
              TOKENS[tokensKey].tags.push('userAdd')
            }
          }
          if (window.localStorage.addSolanaCoin) {
            window.localStorage.addSolanaCoin = window.localStorage.addSolanaCoin + '---' + this.toCoin.mintAddress
          } else {
            window.localStorage.addSolanaCoin = this.toCoin.mintAddress
          }
        }
      } else {
        this.toCoin = null
      }
    },

    unwrap() {
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      this.unwrapWsol()
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

          const description = `Unwrap WSOL`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Unwrap WSOL failed',
            description: error.message
          })
        })
    },

    async unwrapWsol() {
      const wsolMint = TOKENS.WSOL.mintAddress
      const tokenAccount = get(this.wallet.tokenAccounts, `${wsolMint}.tokenAccountAddress`)

      if (!tokenAccount) throw new Error('No any WSOL account')

      const connection = this.$web3
      const wallet = this.$wallet

      const transaction = new Transaction()
      const signers: Account[] = []

      const owner = wallet?.publicKey

      transaction.add(
        closeAccount({
          source: new PublicKey(tokenAccount),
          destination: owner,
          owner
        })
      )

      return await sendTransaction(connection, wallet, transaction, signers)
    },

    needCreateTokens() {
      if (
        this.endpoint !== 'Serum DEX' &&
        !this.usedAmmId &&
        this.usedRouteInfo !== undefined &&
        this.fromCoin !== null &&
        this.toCoin !== null
      ) {
        let fromMint = this.fromCoin.mintAddress
        let midMint = this.usedRouteInfo.middle_coin
        let toMint = this.toCoin.mintAddress
        if (fromMint === NATIVE_SOL.mintAddress) fromMint = TOKENS.WSOL.mintAddress
        if (midMint === NATIVE_SOL.mintAddress) midMint = TOKENS.WSOL.mintAddress
        if (toMint === NATIVE_SOL.mintAddress) toMint = TOKENS.WSOL.mintAddress
        return !(
          get(this.wallet.tokenAccounts, `${fromMint}.tokenAccountAddress`) &&
          get(this.wallet.tokenAccounts, `${midMint}.tokenAccountAddress`) &&
          get(this.wallet.tokenAccounts, `${toMint}.tokenAccountAddress`)
        )
      }
      return false
    },

    needWrapSol() {
      if (
        this.endpoint !== 'Serum DEX' &&
        !this.usedAmmId &&
        this.usedRouteInfo !== undefined &&
        this.fromCoin !== null
      ) {
        if ([NATIVE_SOL.mintAddress, TOKENS.WSOL.mintAddress].includes(this.fromCoin.mintAddress)) {
          let amount = get(this.wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.balance`)
          amount = Math.ceil((amount ? Number(amount.fixed()) : 0) * 10 ** 9)
          const fromCoinAmountData = Math.ceil(Number(this.fromCoinAmount) * 10 ** 9)
          if (fromCoinAmountData > amount) return fromCoinAmountData - amount
        }
      }
      return 0
    },

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

    setCoinFromMint(from: string | undefined, to: string | undefined, ammIdOrMarket: string | undefined) {
      this.setCoinFromMintLoading = true
      let fromCoin, toCoin
      try {
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
      } catch (error: any) {
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

    onAmmIdOrMarketInput(ammIdOrMarket: string) {
      this.ammIdOrMarketSearchShow = false
      this.setCoinFromMint(undefined, undefined, ammIdOrMarket)
      this.findMarket()
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

      this.findMarket()

      this.needUserCheckUnofficialShow()
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
        this.amms = (Object.values(this.$accessor.liquidity.infos) as LiquidityPoolInfo[]).filter(
          (p: any) =>
            p.version === 4 &&
            [1, 5].includes(p.status) &&
            ((p.coin.mintAddress === this.fromCoin?.mintAddress && p.pc.mintAddress === this.toCoin?.mintAddress) ||
              (p.coin.mintAddress === this.toCoin?.mintAddress && p.pc.mintAddress === this.fromCoin?.mintAddress))
        )

        this.routeInfos = getSwapRouter(
          Object.values(this.$accessor.liquidity.infos),
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress
        )

        const marketAddress: string[] = []

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
              marketAddress.push(address)
            }
          }
        }

        for (const itemLiquidityInfo of LIQUIDITY_POOLS) {
          let fromMint = this.fromCoin.mintAddress
          let toMint = this.toCoin.mintAddress
          if (fromMint === NATIVE_SOL.mintAddress) {
            fromMint = TOKENS.WSOL.mintAddress
          }
          if (toMint === NATIVE_SOL.mintAddress) {
            toMint = TOKENS.WSOL.mintAddress
          }
          if (
            (itemLiquidityInfo.coin.mintAddress === fromMint && itemLiquidityInfo.pc.mintAddress === toMint) ||
            (itemLiquidityInfo.coin.mintAddress === toMint && itemLiquidityInfo.pc.mintAddress === fromMint)
          ) {
            if (!marketAddress.find((item) => item === itemLiquidityInfo.serumMarket)) {
              marketAddress.push(itemLiquidityInfo.serumMarket)
            }
          }
        }

        this.initialized = true
        this.updateUrl()

        for (const itemOldMarket of Object.keys(this.market)) {
          if (!marketAddress.includes(itemOldMarket)) {
            delete this.market[itemOldMarket]
          }
        }

        Promise.all(
          marketAddress
            .filter((itemMarket) => !Object.keys(this.market).includes(itemMarket))
            .map((itemMarketAddress) =>
              Market.load(this.$web3, new PublicKey(itemMarketAddress), {}, new PublicKey(SERUM_PROGRAM_ID_V3))
            )
        ).then((marketList) => {
          marketList.forEach((itemMarket) => {
            this.market[itemMarket.address.toString()] = { market: itemMarket }
          })
          this.getOrderBooks()
        })
      } else {
        this.market = {}
      }
    },

    getOrderBooks() {
      this.loading = true
      this.asksAndBidsLoading = true
      this.countdown = this.autoRefreshTime

      const conn = this.$web3

      const asksAndBidsAddressToMarket: { [address: string]: string } = {}

      for (const [marketAddress, marketConfig] of Object.entries(this.market)) {
        asksAndBidsAddressToMarket[marketConfig.market.asksAddress.toString()] = marketAddress
        asksAndBidsAddressToMarket[marketConfig.market.bidsAddress.toString()] = marketAddress
      }

      if (asksAndBidsAddressToMarket) {
        getMultipleAccounts(
          conn,
          Object.keys(asksAndBidsAddressToMarket).map((item) => new PublicKey(item)),
          commitment
        )
          .then((infos) => {
            infos.forEach((info) => {
              if (info === null) return

              const address = info.publicKey.toString()

              if (!asksAndBidsAddressToMarket[address]) return
              const market = asksAndBidsAddressToMarket[address]

              const orderbook = Orderbook.decode(this.market[market].market, info.account.data)

              const { isBids, slab } = orderbook

              if (isBids) {
                this.market[market].bids = slab
              } else {
                this.market[market].asks = slab
              }
            })
          })
          .finally(() => {
            this.initialized = true
            this.loading = false
            this.countdown = 0
            this.asksAndBidsLoading = false
          })
      } else {
        this.loading = false
      }
    },

    updateAmounts() {
      let toCoinAmount = ''
      let toCoinWithSlippage = null

      let impact = 0
      let endpoint = ''

      let usedAmmId
      let usedRouteInfo
      let middleCoinAmount

      let showMarket
      let _side = null
      let _worstPrice = null

      if (this.fromCoin && this.toCoin) {
        let maxAmountOut = 0

        if (this.amms) {
          for (const poolInfo of this.amms) {
            if (poolInfo.status !== 1) continue
            const { amountOut, amountOutWithSlippage, priceImpact } = getSwapOutAmount(
              poolInfo,
              this.fromCoin.mintAddress,
              this.toCoin.mintAddress,
              this.fromCoinAmount,
              this.setting.slippage
            )
            const fAmountOut = parseFloat(amountOut.fixed())
            if (fAmountOut > maxAmountOut) {
              maxAmountOut = fAmountOut
              toCoinAmount = amountOut.fixed()
              toCoinWithSlippage = amountOutWithSlippage
              impact = priceImpact
              // price = fAmountOut
              usedAmmId = poolInfo.ammId
              endpoint = `${this.fromCoin.symbol} > ${this.toCoin.symbol}`
              showMarket = poolInfo.serumMarket
            }
            console.log(
              'amm -> ',
              this.fromCoin.symbol,
              '>',
              this.toCoin.symbol,
              poolInfo.ammId,
              amountOut.fixed(),
              amountOutWithSlippage.fixed(),
              priceImpact / 100
            )
          }
        }

        const slippage = (Math.sqrt(1 + this.setting.slippage / 100) - 1) * 100
        console.log('slippage', this.setting.slippage, slippage)

        if (this.routeInfos) {
          for (const r of this.routeInfos) {
            let middleCoint
            if (r[0].coin.mintAddress === this.fromCoin.mintAddress) {
              middleCoint = r[0].pc
            } else {
              middleCoint = r[0].coin
            }
            const { amountOutWithSlippage: amountOutWithSlippageA, priceImpact: priceImpactA } = getSwapOutAmount(
              r[0],
              this.fromCoin.mintAddress,
              middleCoint.mintAddress,
              this.fromCoinAmount,
              slippage
            )

            const { amountOut, amountOutWithSlippage, priceImpact } = getSwapOutAmount(
              r[1],
              middleCoint.mintAddress,
              this.toCoin.mintAddress,
              amountOutWithSlippageA.fixed(),
              slippage
            )
            const fAmountOut = parseFloat(amountOut.fixed())
            if (fAmountOut > maxAmountOut) {
              toCoinAmount = amountOut.fixed()
              maxAmountOut = fAmountOut
              toCoinWithSlippage = amountOutWithSlippage
              impact = (((priceImpactA + 100) * (priceImpact + 100)) / 10000 - 1) * 100
              usedRouteInfo = {
                middle_coin: middleCoint.mintAddress,
                route: [
                  {
                    type: 'amm',
                    id: r[0].ammId,
                    amountA: 0,
                    amountB: 0,
                    mintA: this.fromCoin.mintAddress,
                    mintB: middleCoint.mintAddress
                  },
                  {
                    type: 'amm',
                    id: r[1].ammId,
                    amountA: 0,
                    amountB: 0,
                    mintA: middleCoint.mintAddress,
                    mintB: this.toCoin.mintAddress
                  }
                ]
              }
              usedAmmId = undefined
              middleCoinAmount = amountOutWithSlippageA.fixed()
              endpoint = `${this.fromCoin.symbol} > ${middleCoint.symbol} > ${this.toCoin.symbol}`
              showMarket = undefined
            }
            console.log(
              'route -> ',
              `${this.fromCoin.symbol} > ${middleCoint.symbol} > ${this.toCoin.symbol}`,
              amountOut.fixed(),
              amountOutWithSlippage.fixed(),
              priceImpact / 100,
              ((priceImpactA + 100) * (priceImpact + 100)) / 10000
            )
          }
        }

        if (this.fromCoin && this.toCoin && this.market && this.fromCoinAmount && !this.asksAndBidsLoading) {
          for (const [marketAddress, marketConfig] of Object.entries(this.market)) {
            if (!marketConfig.asks || !marketConfig.bids) continue

            const { amountOut, amountOutWithSlippage, priceImpact, side, worstPrice } = getOutAmount(
              marketConfig.market,
              marketConfig.asks,
              marketConfig.bids,
              this.fromCoin.mintAddress,
              this.toCoin.mintAddress,
              this.fromCoinAmount,
              this.setting.slippage
            )
            const out = new TokenAmount(amountOut, this.toCoin.decimals, false)
            const outWithSlippage = new TokenAmount(amountOutWithSlippage, this.toCoin.decimals, false)

            _side = side
            _worstPrice = worstPrice

            console.log('dex -> ', marketAddress, outWithSlippage.fixed())
            if (!out.isNullOrZero()) {
              if (!toCoinWithSlippage || toCoinWithSlippage.wei.isLessThan(outWithSlippage.wei)) {
                toCoinAmount = out.fixed()
                toCoinWithSlippage = outWithSlippage
                impact = priceImpact
                endpoint = 'Serum DEX'
                showMarket = marketAddress
              }
            }
          }
        }

        this.usedAmmId = usedAmmId
        this.usedRouteInfo = usedRouteInfo
        this.middleCoinAmount = middleCoinAmount

        if (toCoinWithSlippage) {
          this.toCoinAmount = toCoinAmount
          this.toCoinWithSlippage = toCoinWithSlippage.fixed()
          this.outToPirceValue =
            parseFloat(toCoinAmount) / parseFloat(parseFloat(this.fromCoinAmount).toFixed(this.toCoin.decimals))

          this.priceImpact = impact
          this.endpoint = endpoint
        } else {
          this.toCoinAmount = ''
          this.toCoinWithSlippage = ''
          this.outToPirceValue = 0
          this.priceImpact = 0
          this.endpoint = ''
        }
        console.log(
          'end -> ',
          this.endpoint,
          this.usedAmmId,
          this.usedRouteInfo,
          maxAmountOut,
          toCoinWithSlippage?.fixed(),
          impact,
          'outToPirceValue',
          this.outToPirceValue
        )

        let setupFlag = this.setupFlag
        let setupFlagWSOL = this.setupFlagWSOL
        if (this.endpoint !== this.setupLastData) {
          this.setupLastData = this.endpoint
          setupFlag = false
          setupFlagWSOL = false
        }
        this.setupFlag = setupFlag || this.needCreateTokens() || this.needWrapSol() > 0

        this.setupFlagWSOL = setupFlagWSOL || this.needWrapSol() > 0

        this.showMarket = showMarket
        this.side = _side
        this.worstPrice = _worstPrice
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

    placeOrder(loadingName: string) {
      this.swaping = true
      if (this.loadingArr[loadingName] !== undefined) this.loadingArr[loadingName] = true

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })
      let description = 'Swap'

      if (this.endpoint !== 'Serum DEX' && this.usedAmmId) {
        const poolInfo = Object.values(this.$accessor.liquidity.infos).find((p: any) => p.ammId === this.usedAmmId)
        description = `Swap ${this.fromCoinAmount} ${this.fromCoin?.symbol} to ${this.toCoinAmount} ${this.toCoin?.symbol}`

        swap(
          this.$web3,
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
          this.toCoinWithSlippage,
          get(this.wallet.tokenAccounts, `${TOKENS.WSOL.mintAddress}.tokenAccountAddress`)
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
            if (this.loadingArr[loadingName]) this.loadingArr[loadingName] = false
          })
      } else if (this.needCreateTokens() || this.needWrapSol()) {
        console.log(this.fromCoin?.mintAddress, this.usedRouteInfo?.middle_coin, this.toCoin?.mintAddress)
        let fromMint = this.fromCoin?.mintAddress
        let midMint = this.usedRouteInfo?.middle_coin
        let toMint = this.toCoin?.mintAddress
        if (fromMint === NATIVE_SOL.mintAddress) fromMint = TOKENS.WSOL.mintAddress
        if (midMint === NATIVE_SOL.mintAddress) midMint = TOKENS.WSOL.mintAddress
        if (toMint === NATIVE_SOL.mintAddress) toMint = TOKENS.WSOL.mintAddress
        description = `Create Tokens`

        preSwapRoute(
          this.$web3,
          // @ts-ignore
          this.$wallet,
          // @ts-ignore
          this.fromCoin.mintAddress,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${fromMint}.tokenAccountAddress`),
          // @ts-ignore
          midMint,
          get(this.wallet.tokenAccounts, `${midMint}.tokenAccountAddress`),
          // @ts-ignore
          toMint,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${toMint}.tokenAccountAddress`),
          this.needWrapSol()
        )
          .then((txid: string) => {
            this.$notify.info({
              key,
              message: 'Transaction has been sent',
              description: (h: any) =>
                h('div', [
                  'Confirmation is in progress.  Check your transaction on ',
                  h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
                ])
            })
            this.$accessor.transaction.sub({ txid, description })
          })
          .catch((error: Error) => {
            this.$notify.error({
              key,
              message: 'Create Tokens failed',
              description: error.message
            })
          })
          .finally(() => {
            this.swaping = false
            if (this.loadingArr[loadingName]) this.loadingArr[loadingName] = false
          })
      } else if (this.endpoint !== 'Serum DEX' && this.usedRouteInfo !== undefined) {
        const poolInfoA = Object.values(this.$accessor.liquidity.infos).find(
          (p: any) => p.ammId === this.usedRouteInfo?.route[0].id
        )
        const poolInfoB = Object.values(this.$accessor.liquidity.infos).find(
          (p: any) => p.ammId === this.usedRouteInfo?.route[1].id
        )

        let fromMint = this.fromCoin?.mintAddress
        let midMint = this.usedRouteInfo?.middle_coin
        let toMint = this.toCoin?.mintAddress
        if (fromMint === NATIVE_SOL.mintAddress) fromMint = TOKENS.WSOL.mintAddress
        if (midMint === NATIVE_SOL.mintAddress) midMint = TOKENS.WSOL.mintAddress
        if (toMint === NATIVE_SOL.mintAddress) toMint = TOKENS.WSOL.mintAddress
        description = `Swap ${this.fromCoinAmount} ${this.fromCoin?.symbol} to ${this.toCoinAmount} ${this.toCoin?.symbol}`

        swapRoute(
          this.$web3,
          // @ts-ignore
          this.$wallet,
          poolInfoA,
          poolInfoB,
          this.usedRouteInfo,
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${fromMint}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${midMint}.tokenAccountAddress`),
          // @ts-ignore
          get(this.wallet.tokenAccounts, `${toMint}.tokenAccountAddress`),
          this.fromCoinAmount,
          this.toCoinWithSlippage
        )
          .then((txid: string) => {
            this.$notify.info({
              key,
              message: 'Transaction has been sent',
              description: (h: any) =>
                h('div', [
                  'Confirmation is in progress.  Check your transaction on ',
                  h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
                ])
            })

            this.$accessor.transaction.sub({ txid, description })
          })
          .catch((error: Error) => {
            this.$notify.error({
              key,
              message: 'Swap failed',
              description: error.message
            })
          })
          .finally(() => {
            this.swaping = false
            if (this.loadingArr[loadingName]) this.loadingArr[loadingName] = false
          })
      } else {
        if (
          !this.showMarket ||
          !this.market ||
          !this.fromCoin ||
          !this.toCoin ||
          !this.market[this.showMarket] ||
          !this.market[this.showMarket].asks ||
          !this.market[this.showMarket].bids
        )
          return
        const marketConfig = this.market[this.showMarket]
        description = `Swap ${this.fromCoinAmount} ${this.fromCoin?.symbol} to ${this.toCoinAmount} ${this.toCoin?.symbol}`

        place(
          this.$web3,
          this.$wallet,
          marketConfig.market,
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress,
          get(this.wallet.tokenAccounts, `${this.fromCoin.mintAddress}.tokenAccountAddress`),
          get(this.wallet.tokenAccounts, `${this.toCoin.mintAddress}.tokenAccountAddress`),
          this.side,
          this.fromCoinAmount,
          this.toCoinWithSlippage,
          this.worstPrice
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
            if (this.loadingArr[loadingName]) this.loadingArr[loadingName] = false
          })
      }
    },

    async updateUrl() {
      if (this.$route.path !== '/swap/') {
        return
      }
      if (!this.liquidity.initialized) return
      const { from, to } = this.$route.query
      if (this.fromCoin && this.toCoin) {
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
        for (const marketAddress of Object.keys(this.market)) {
          const info = await checkUnsettledInfo(this.$web3, this.$wallet, this.market[marketAddress].market)
          if (!info) {
            if (this.market[marketAddress].unSettleConfig) {
              delete this.market[marketAddress].unSettleConfig
            }
            throw new Error('not enough data')
          }
          this.market[marketAddress].unSettleConfig = {
            baseSymbol: info.baseSymbol ?? '',
            baseUnsettledAmount: info.baseUnsettledAmount,
            quoteSymbol: info.quoteSymbol ?? '',
            quoteUnsettledAmount: info.quoteUnsettledAmount,
            unsettledOpenOrders: info.openOrders // have to establish an extra state, to store this value
          }
        }
      } catch (e) {
      } finally {
        this.isFetchingUnsettled = false
      }
    },

    settleFunds(marketAddress: string) {
      if (!this.market[marketAddress]) return
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      const marketConfig = this.market[marketAddress]

      const baseMint = marketConfig.market.baseMintAddress.toBase58()
      const quoteMint = marketConfig.market.quoteMintAddress.toBase58()

      const baseWallet = get(this.wallet.tokenAccounts, `${baseMint}.tokenAccountAddress`)
      const quoteWallet = get(this.wallet.tokenAccounts, `${quoteMint}.tokenAccountAddress`)

      this.isSettlingBase = true

      settleFund(
        this.$web3,
        marketConfig.market,
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
          this.isSettlingBase = false
        })
    }
  }
})
</script>

<style>
.swap-confirm-modal .ant-modal-header .ant-modal-title {
  font-size: 22px;
}
.step-box {
  width: 100%;
  text-align: center;
  padding-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.step-box > *:not(:last-child) {
  margin-right: -1px;
}
.setup-item {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  padding-top: 3px;
  border: 2px solid;
}
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
.swap-confirm-modal .description-secondary .highlight {
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
  border-color: #ed4b9e !important;
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
