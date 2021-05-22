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
              <div v-if="fromCoin" class="info">
                <div class="symbol">{{ fromCoin.symbol }}</div>
                <div class="address">
                  {{ fromCoin.mintAddress.substr(0, 14) }}
                  ...
                  {{ fromCoin.mintAddress.substr(fromCoin.mintAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$accessor.copy(fromCoin.mintAddress)" />
                  <a :href="`${url.explorer}/address/${fromCoin.mintAddress}`" target="_blank">
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
                  <a :href="`${url.explorer}/address/${toCoin.mintAddress}`" target="_blank">
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
                  <a :href="`${url.explorer}/address/${marketAddress}`" target="_blank">
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
                  <a :href="`${url.explorer}/address/${ammId}`" target="_blank">
                    <Icon type="link" />
                  </a>
                </div>
              </div>
            </div>
          </template>
          <Icon type="info-circle" />
        </Tooltip>
        <Icon type="setting" @click="$accessor.setting.open" />
        <Icon type="search" @click="ammIdOrMarketSearchShow = true" />
      </div>
    </div>

    <CoinSelect v-if="coinSelectShow" @onClose="() => (coinSelectShow = false)" @onSelect="onCoinSelect" />
    <AmmIdSelect
      :show="ammIdSelectShow"
      :liquidityList="ammIdSelectList"
      @onClose="() => ((ammIdSelectShow = false), (ammIdSelectOld = true))"
      @onSelect="onAmmIdSelect"
      :userClose="true"
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
          :coin-name="fromCoin ? fromCoin.symbol : ''"
          :balance="fromCoin ? fromCoin.balance : null"
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
        <div style="padding: 0 12px">
          <div v-if="fromCoin && toCoin && isWrap && fromCoinAmount" class="fs-container">
            <span> Price </span>
            <span>
              1 {{ fromCoin.symbol }} = 1
              {{ toCoin.symbol }}
            </span>
          </div>
          <div v-else-if="fromCoin && toCoin && lpMintAddress && fromCoinAmount" class="fs-container">
            <span> Price </span>
            <span>
              1 {{ fromCoin.symbol }} ≈
              {{ outToPirceValue }}
              {{ toCoin.symbol }}
            </span>
          </div>
          <div
            v-else-if="fromCoin && toCoin && marketAddress && market && asks && bids && fromCoinAmount"
            class="fs-container"
          >
            <span> Price </span>
            <span>
              1 {{ fromCoin.symbol }} ≈
              {{ outToPirceValue }}
              {{ toCoin.symbol }}
            </span>
          </div>
          <div class="fs-container">
            <span> Slippage Tolerance </span>
            <span> {{ $accessor.setting.slippage }}% </span>
          </div>
          <div v-if="endpoint" class="fs-container">
            <span> Swap powered by </span>
            <span style="text-transform: capitalize"> {{ endpoint }} </span>
          </div>
          <div v-if="fromCoin && toCoin && fromCoinAmount && toCoinAmount" class="fs-container">
            <span> Minimum received </span>
            <span> {{ toCoinAmount }} {{ toCoin.symbol }} </span>
          </div>
          <div v-if="endpoint" class="fs-container">
            <span> Price Impact </span>
            <span :style="`color: ${priceImpact > 10 ? '#ed4b9e' : priceImpact > 5 ? '#f0b90b' : '#31d0aa'}`">
              {{ priceImpact.toFixed(2) }}%
            </span>
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
          @click="userCheckUnofficialShow = true"
        >
          Please identify known risk warnings
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
            gt(fromCoinAmount, fromCoin && fromCoin.balance ? fromCoin.balance.fixed() : '0') ||
            (get(liquidity.infos, `${lpMintAddress}.status`) &&
              get(liquidity.infos, `${lpMintAddress}.status`) !== 1) ||
            swaping ||
            (fromCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, fromCoinAmount)) ||
            (toCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, toCoinAmount))
          "
          :loading="swaping"
          @click="placeOrder"
        >
          <template v-if="!fromCoin || !toCoin"> Select a token </template>
          <template v-else-if="(!marketAddress && !lpMintAddress && !isWrap) || !initialized">
            Insufficient liquidity for this trade
          </template>
          <template v-else-if="!fromCoinAmount"> Enter an amount </template>
          <template v-else-if="loading"> Updating price information </template>
          <template v-else-if="gt(fromCoinAmount, fromCoin && fromCoin.balance ? fromCoin.balance.fixed() : '0')">
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
          <template v-else>{{ isWrap ? 'Unwrap' : 'Swap' }}</template>
        </Button>
      </div>
    </div>

    <div v-if="isFetchingUnsettled || baseUnsettledAmount || quoteUnsettledAmount" class="card extra">
      <div class="settle card-body">
        <div v-if="isFetchingUnsettled" class="fetching-unsettled">
          <Spin :spinning="true">
            <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
          </Spin>
          <span>Fetching info from market. Please wait.</span>
        </div>

        <table
          v-else-if="(!isFetchingUnsettled && baseSymbol && quoteSymbol && baseUnsettledAmount) || quoteUnsettledAmount"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Icon, Tooltip, Button, Progress, Spin } from 'ant-design-vue'

import { cloneDeep, get } from 'lodash-es'
import { Market, Orderbook } from '@project-serum/serum/lib/market.js'

import { getTokenBySymbol, TokenInfo, NATIVE_SOL, TOKENS } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getMultipleAccounts, commitment } from '@/utils/web3'
import { PublicKey } from '@solana/web3.js'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'
import { getOutAmount, getSwapOutAmount, place, swap, wrap, checkUnsettledInfo, settleFunds } from '@/utils/swap'
import { TokenAmount, gt } from '@/utils/safe-math'
import { getUnixTs } from '@/utils'
import { canWrap, getLiquidityInfoSimilar } from '@/utils/liquidity'
import { getLpListByTokenMintAddresses, getPoolListByTokenMintAddresses, LiquidityPoolInfo } from '@/utils/pools'

const RAY = getTokenBySymbol('RAY')

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Progress,
    Spin
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

      isFetchingUnsettled: false,
      unsettledOpenOrders: null as any,

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
      // serum
      market: null as any,
      marketAddress: '',
      // amm
      lpMintAddress: '',
      // trading endpoint
      endpoint: '',
      priceImpact: 0,

      coinBasePrice: true,
      outToPirceValue: null as any,

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

      setCoinFromMintLoading: false
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
      },
      deep: true
    },

    fromCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        console.log('fromCoin')
        this.userNeedAmmIdOrMarket = undefined
        this.findMarket()
        this.fromCoinAmount = ''
        this.toCoinAmount = ''
        this.ammIdSelectOld = false
      }
    },

    toCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        console.log('toCoin')
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
        console.log('liquidity.infos')
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
        console.log('swap.markets')
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
      this.coinSelectShow = true
    },

    openToCoinSelect() {
      this.selectFromCoin = false
      this.coinSelectShow = true
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
      }, 1)
    },

    needUserCheckUnofficialShow(ammId: string) {
      console.log('needUserCheckUnofficialShow', this.wallet.connected, this.officialPool)
      if (!this.wallet.connected) {
        return
      }
      if (this.officialPool) {
        return
      }

      const localCheckStr = localStorage.getItem(`${this.wallet.address}--checkAmmId`)
      const localCheckAmmIdList = localCheckStr ? localCheckStr.split('---') : []
      console.log(localCheckAmmIdList)
      if (localCheckAmmIdList.includes(ammId)) {
        console.log(111)
        this.userCheckUnofficial = true
        this.userCheckUnofficialMint = ammId
        this.userCheckUnofficialShow = false
        return
      }
      if (this.userCheckUnofficialMint === ammId) {
        console.log(222)
        this.userCheckUnofficial = true
        this.userCheckUnofficialShow = false
        return
      }
      console.log(333)
      this.userCheckUnofficial = false
      this.coinSelectShow = false
      this.userCheckUnofficialShow = true
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
      console.log('onUserCheck')
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
        if (this.fromCoin.mintAddress && this.toCoin.mintAddress) {
          const liquidityListV4 = getPoolListByTokenMintAddresses(
            this.fromCoin.mintAddress,
            this.toCoin.mintAddress,
            typeof InputAmmIdOrMarket === 'string' ? InputAmmIdOrMarket : undefined
          )
          const liquidityListV3 = getLpListByTokenMintAddresses(
            this.fromCoin.mintAddress,
            this.toCoin.mintAddress,
            typeof InputAmmIdOrMarket === 'string' ? InputAmmIdOrMarket : undefined,
            [3]
          )

          let lpMintAddress
          let ammId
          let officialPool = true
          console.log(liquidityListV4, liquidityListV3)
          if (liquidityListV4.length === 1 && !liquidityListV4[0].official && liquidityListV3.length > 0) {
            console.log('v3')
          } else if (liquidityListV4.length === 1 && liquidityListV4[0].official) {
            console.log('official')
            // official
            lpMintAddress = liquidityListV4[0].lp.mintAddress
            ammId = liquidityListV4[0].ammId
            // mark
            officialPool = liquidityListV4[0].official
            this.userCheckUnofficialMint = undefined
            marketAddress = liquidityListV4[0].serumMarket
          } else if (liquidityListV4.length === 1 && InputAmmIdOrMarket) {
            console.log('user select', liquidityListV4[0].serumMarket)
            ammId = liquidityListV4[0].ammId
            lpMintAddress = liquidityListV4[0].lp.mintAddress
            officialPool = liquidityListV4[0].official
            marketAddress = liquidityListV4[0].serumMarket
          } else if (liquidityListV4.length > 0 && this.ammIdSelectOld) {
            console.log('last user select none')
          } else if (liquidityListV4.length > 0) {
            console.log('user select')
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
          console.log('ttt', lpMintAddress, lpMintAddress ?? '')
          if (ammId !== this.userCheckUnofficialMint) {
            this.userCheckUnofficialMint = undefined
          }
          if (ammId) {
            this.needUserCheckUnofficialShow(ammId)
          }
        }
        console.log(123, Object.keys(this.swap.markets))
        // serum

        for (const address of Object.keys(this.swap.markets)) {
          const info = cloneDeep(this.swap.markets[address])
          let fromMint = this.fromCoin.mintAddress
          let toMint = this.toCoin.mintAddress
          if (fromMint === NATIVE_SOL.mintAddress) {
            fromMint = TOKENS.WSOL.mintAddress
          }
          if (toMint === NATIVE_SOL.mintAddress) {
            toMint = TOKENS.WSOL.mintAddress
          }
          console.log(
            info.baseMint.toString(),
            info.quoteMint.toString(),
            fromMint,
            toMint,
            info.baseDepositsTotal.isZero(),
            info.quoteDepositsTotal.isZero()
          )
          if (
            (info.baseMint.toBase58() === fromMint && info.quoteMint.toBase58() === toMint) ||
            (info.baseMint.toBase58() === toMint && info.quoteMint.toBase58() === fromMint)
          ) {
            // if (!info.baseDepositsTotal.isZero() && !info.quoteDepositsTotal.isZero()) {
            marketAddress = address
            // }
          }
        }
        console.log('market', marketAddress)
        if (marketAddress) {
          // const lpPool = LIQUIDITY_POOLS.find((item) => item.serumMarket === marketAddress)
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
      if (this.fromCoin && this.toCoin && this.isWrap && this.fromCoinAmount) {
        this.toCoinAmount = this.fromCoinAmount
      } else if (this.fromCoin && this.toCoin && this.lpMintAddress && this.fromCoinAmount) {
        const { amountOut, amountOutWithSlippage } = getSwapOutAmount(
          get(this.liquidity.infos, this.lpMintAddress),
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress,
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
            this.toCoin.decimals,
            false
          ).format()
          this.toCoinWithSlippage = amountOutWithSlippage.fixed()
        }
      } else if (
        this.fromCoin &&
        this.toCoin &&
        this.marketAddress &&
        this.market &&
        this.asks &&
        this.bids &&
        this.fromCoinAmount
      ) {
        const { amountOut, amountOutWithSlippage } = getOutAmount(
          this.market,
          this.asks,
          this.bids,
          this.fromCoin.mintAddress,
          this.toCoin.mintAddress,
          this.fromCoinAmount,
          this.setting.slippage
        )

        const out = new TokenAmount(amountOut, this.toCoin.decimals, false)

        if (out.isNullOrZero()) {
          this.toCoinAmount = ''
          this.toCoinWithSlippage = ''
        } else {
          this.toCoinAmount = out.fixed()
          this.outToPirceValue = new TokenAmount(
            amountOut / parseFloat(this.fromCoinAmount),
            this.toCoin.decimals,
            false
          ).format()
          this.toCoinWithSlippage = new TokenAmount(amountOutWithSlippage, this.toCoin.decimals, false).fixed()
        }
      } else {
        this.toCoinAmount = ''
        this.toCoinWithSlippage = ''
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
      } else if (this.lpMintAddress) {
        swap(
          this.$web3,
          // @ts-ignore
          this.$wallet,
          get(this.liquidity.infos, this.lpMintAddress),
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

    async fetchUnsettledByMarket() {
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
        this.isSettlingQuote = false
        this.isSettlingBase = false
        this.isFetchingUnsettled = false
      }
    },

    async settleFunds(from: 'base' | 'quote') {
      let baseWallet = get(this.wallet.tokenAccounts, `${(this.market as Market).baseMintAddress}.tokenAccountAddress`)
      let quoteWallet = get(
        this.wallet.tokenAccounts,
        `${(this.market as Market).quoteMintAddress}.tokenAccountAddress`
      )
      if (from === 'quote') {
        ;[baseWallet, quoteWallet] = [quoteWallet, baseWallet]
      }
      if (from === 'quote') {
        this.isSettlingQuote = true
      } else {
        this.isSettlingBase = true
      }
      await settleFunds(this.$web3, this.market, this.unsettledOpenOrders, this.$wallet, baseWallet, quoteWallet)
    }
  }
})
</script>

<style lang="less" sxcoped>
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
