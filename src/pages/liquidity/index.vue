<template>
  <div class="liquidity container">
    <div class="page-head fs-container">
      <span class="title">Add Liquidity</span>
      <div class="buttons">
        <Tooltip placement="bottomRight">
          <template slot="title">
            <span>
              Displayed data will auto-refresh after
              {{ liquidity.autoRefreshTime - liquidity.countdown }} seconds. Click this circle to update manually.
            </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / liquidity.autoRefreshTime) * liquidity.countdown"
            :show-info="false"
            :class="lpMintAddress && liquidity.loading ? 'disabled' : ''"
            @click="
              () => {
                $accessor.liquidity.requestInfos()
                $accessor.wallet.getTokenAccounts()
              }
            "
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
              <div v-if="lpMintAddress" class="info">
                <div class="symbol">LP Mint</div>
                <div class="address">
                  {{ lpMintAddress.substr(0, 14) }}
                  ...
                  {{ lpMintAddress.substr(lpMintAddress.length - 14, 14) }}
                </div>
                <div class="action">
                  <Icon type="copy" @click="$accessor.copy(lpMintAddress)" />
                  <a :href="`${url.explorer}/token/${lpMintAddress}`" target="_blank">
                    <Icon type="link" />
                  </a>
                </div>
              </div>
              <div v-if="ammId" class="info">
                <div class="symbol">AMM ID</div>
                <div class="address">
                  {{ ammId.substr(0, 14) }}
                  ...
                  {{ ammId.substr(ammId.length - 14, 14) }}
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

        <Tooltip placement="bottomRight">
          <template slot="title"> Create new pool </template>
          <NuxtLink to="/liquidity/create-pool/">
            <Icon type="plus" />
          </NuxtLink>
        </Tooltip>
      </div>
    </div>

    <CoinSelect v-if="coinSelectShow" @onClose="() => (coinSelectShow = false)" @onSelect="onCoinSelect" />
    <AmmIdSelect
      :show="ammIdSelectShow"
      :liquidity-list="ammIdSelectList"
      :user-close="false"
      @onClose="() => (ammIdSelectShow = false)"
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
          label="Input"
          :mint-address="fromCoin ? fromCoin.mintAddress : ''"
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
              fromCoinAmount = fromCoin.balance ? fromCoin.balance.fixed() : ''
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
          :mint-address="toCoin ? toCoin.mintAddress : ''"
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
              toCoinAmount = toCoin.balance ? toCoin.balance.fixed() : ''
            }
          "
          @onSelect="openToCoinSelect"
        />

        <LiquidityPoolInfo :initialized="liquidity.initialized" :pool-info="liquidity.infos[lpMintAddress]" />
        <div v-if="officialPool === false">
          <div style="margin: 10px">
            <div>AMM ID:</div>
            <div>
              {{ ammId.substr(0, 14) }}
              ...
              {{ ammId.substr(ammId.length - 14, 14) }}
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
            !lpMintAddress ||
            !liquidity.initialized ||
            liquidity.loading ||
            gt(fromCoinAmount, fromCoin.balance ? fromCoin.balance.fixed() : '0') ||
            gt(toCoinAmount, toCoin.balance ? toCoin.balance.fixed() : '0') ||
            suppling ||
            (fromCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, fromCoinAmount)) ||
            (toCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(5, toCoinAmount))
          "
          :loading="suppling"
          @click="supply"
        >
          <template v-if="!fromCoin || !toCoin"> Select a token </template>
          <template v-else-if="!lpMintAddress || !liquidity.initialized"> Invalid pair </template>
          <template v-else-if="!fromCoinAmount"> Enter an amount </template>
          <template v-else-if="liquidity.loading"> Updating pool information </template>
          <template v-else-if="gt(fromCoinAmount, fromCoin.balance ? fromCoin.balance.fixed() : '0')">
            Insufficient {{ fromCoin.symbol }} balance
          </template>
          <template v-else-if="gt(toCoinAmount, toCoin.balance ? toCoin.balance.fixed() : '')">
            Insufficient {{ toCoin.symbol }} balance
          </template>
          <template v-else-if="fromCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(50, fromCoinAmount)">
            xCOPE amount must greater than 50
          </template>
          <template v-else-if="toCoin.mintAddress === TOKENS.xCOPE.mintAddress && gt(50, toCoinAmount)">
            xCOPE amount must greater than 50
          </template>
          <template v-else>Supply</template>
        </Button>
      </div>
    </div>

    <div class="page-head your-liquidity fs-container">
      <span class="title">Your Liquidity</span>
    </div>

    <YourLiquidity @onAdd="yourliquidityAdd" />
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

import { cloneDeep, get } from 'lodash-es'
import { getTokenBySymbol, NATIVE_SOL, TokenInfo, TOKENS } from '@/utils/tokens'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { getOutAmount, addLiquidity, getLiquidityInfoSimilar, getOutAmountStable } from '@/utils/liquidity'
import logger from '@/utils/logger'
import { commitment } from '@/utils/web3'
import { gt } from '@/utils/safe-math'
import { getUnixTs } from '@/utils'
import { getLpListByTokenMintAddresses, LiquidityPoolInfo } from '@/utils/pools'
import AmmIdSelect from '@/components/AmmIdSelect.vue'

const RAY = getTokenBySymbol('RAY')

export default Vue.extend({
  components: {
    Icon,
    Tooltip,
    Button,
    Progress,
    AmmIdSelect
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

      officialPool: true,
      userCheckUnofficial: false,
      userCheckUnofficialMint: undefined as string | undefined,
      userCheckUnofficialShow: false,
      findUrlAmmId: false,

      ammId: undefined as string | undefined,

      ammIdSelectShow: false,
      ammIdSelectList: [] as LiquidityPoolInfo[] | [],

      ammIdOrMarketSearchShow: false,

      userNeedAmmIdOrMarket: undefined as string | undefined,

      setCoinFromMintLoading: false
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
        this.findLiquidityPool()
        if (this.ammId) {
          this.needUserCheckUnofficialShow(this.ammId)
        }
      },
      deep: true
    },

    fromCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        this.userNeedAmmIdOrMarket = undefined
        this.findLiquidityPool()
        this.fromCoinAmount = ''
        this.toCoinAmount = ''
      }
    },

    toCoin(newCoin, oldCoin) {
      if (
        !this.setCoinFromMintLoading &&
        (oldCoin === null || newCoin === null || newCoin.mintAddress !== oldCoin.mintAddress)
      ) {
        this.userNeedAmmIdOrMarket = undefined
        this.findLiquidityPool()
        this.fromCoinAmount = ''
        this.toCoinAmount = ''
      }
    },

    lpMintAddress() {
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
        this.findLiquidityPool()
      },
      deep: true
    }
  },

  mounted() {
    this.updateCoinInfo(this.wallet.tokenAccounts)

    const { from, to, ammId } = this.$route.query
    // @ts-ignore
    this.setCoinFromMint(ammId, from, to)
    this.findLiquidityPool()
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
    yourliquidityAdd(ammIdOrMarket: string | undefined, from: string | undefined, to: string | undefined) {
      this.setCoinFromMint(ammIdOrMarket, from, to)
      this.findLiquidityPool()
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
      this.coinSelectShow = false
      this.userCheckUnofficialShow = true
    },

    onAmmIdSelect(liquidityInfo: LiquidityPoolInfo) {
      this.lpMintAddress = liquidityInfo.lp.mintAddress
      this.ammId = liquidityInfo.ammId
      this.userNeedAmmIdOrMarket = this.ammId
      this.ammIdSelectShow = false
      this.officialPool = liquidityInfo.official
      this.findLiquidityPool()
    },

    onAmmIdOrMarketInput(ammIdOrMarket: string) {
      this.ammIdOrMarketSearchShow = false
      this.setCoinFromMint(ammIdOrMarket, undefined, undefined)
      this.findLiquidityPool()
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
      if (this.fromCoin && this.toCoin && this.liquidity.initialized) {
        const InputAmmIdOrMarket = this.userNeedAmmIdOrMarket

        const liquidityList = getLpListByTokenMintAddresses(
          this.fromCoin.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.fromCoin.mintAddress,
          this.toCoin.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.toCoin.mintAddress,
          typeof InputAmmIdOrMarket === 'string' ? InputAmmIdOrMarket : undefined
        )
        let lpMintAddress
        let ammId
        let officialPool = true
        if (liquidityList.length === 1 && liquidityList[0].official) {
          // official
          lpMintAddress = liquidityList[0].lp.mintAddress
          ammId = liquidityList[0].ammId
          officialPool = liquidityList[0].official
          this.userCheckUnofficialMint = undefined
        } else if (liquidityList.length === 1 && InputAmmIdOrMarket) {
          ammId = liquidityList[0].ammId
          lpMintAddress = liquidityList[0].lp.mintAddress
          officialPool = liquidityList[0].official
        } else if (liquidityList.length > 0) {
          this.coinSelectShow = false
          setTimeout(() => {
            this.ammIdSelectShow = true
            // @ts-ignore
            this.ammIdSelectList = Object.values(this.liquidity.infos).filter((item: LiquidityPoolInfo) =>
              liquidityList.find((liquidityItem) => liquidityItem.ammId === item.ammId)
            )
          }, 1)
          return
        }

        this.ammId = ammId
        this.officialPool = officialPool
        if (ammId) {
          this.needUserCheckUnofficialShow(ammId)
        }
        if (lpMintAddress) {
          if (this.lpMintAddress !== lpMintAddress) {
            this.lpMintAddress = lpMintAddress
            this.unsubPoolChange()
            this.subPoolChange()
          }
        } else {
          this.lpMintAddress = ''
          this.officialPool = true
          this.unsubPoolChange()
        }
        this.updateUrl()
      } else {
        this.lpMintAddress = ''
        this.officialPool = true
        this.unsubPoolChange()

        this.ammId = undefined
        this.officialPool = true
      }
    },

    updateAmounts() {
      if (this.fromCoin && this.toCoin && this.lpMintAddress) {
        const poolInfo = this.liquidity.infos[this.lpMintAddress]

        if (this.fixedCoin === this.fromCoin.mintAddress) {
          const amount = (poolInfo.version === 4 ? getOutAmount : getOutAmountStable)(
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

          const amount = (poolInfo.version === 4 ? getOutAmount : getOutAmountStable)(
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

        this.poolListenerId = null
      }
    },

    async updateUrl() {
      if (this.$route.path !== '/liquidity/') {
        return
      }
      const { from, to } = this.$route.query
      if (this.ammId) {
        await this.$router.push({
          path: '/liquidity/',
          query: {
            ammId: this.ammId
          }
        })
      } else if (this.fromCoin && this.toCoin) {
        if (this.fromCoin.mintAddress !== from || this.toCoin.mintAddress !== to) {
          await this.$router.push({
            path: '/liquidity/',
            query: {
              from: this.fromCoin.mintAddress,
              to: this.toCoin.mintAddress
            }
          })
        }
      } else if (!(this.$route.query && Object.keys(this.$route.query).length === 0)) {
        await this.$router.push({
          path: '/liquidity/'
        })
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
