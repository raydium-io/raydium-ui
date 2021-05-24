<template>
  <div class="container" :class="isMobile ? 'create-pool-mobile' : 'create-pool'">
    <div class="page-head fs-container">
      <span class="title">Create Pool</span>
    </div>
    <div class="card">
      <div class="card-body" style="grid-row-gap: 0; row-gap: 0; padding-bottom: 15px">
        <Steps :current="current" size="small" direction="vertical" style="width: auto" :status="stepsStatus">
          <Step>
            <p slot="title" style="word-break: break-word">
              {{ stepTitleInputMarket }}
              <Tooltip placement="right">
                <div slot="title">
                  For details on creating a Serum Market, see
                  <a href="https://raydium.gitbook.io/raydium/permissionless/creating-a-pool" target="_blank"
                    >this guide.</a
                  >
                </div>
                <Icon type="info-circle" />
              </Tooltip>
            </p>
          </Step>
          <Step
            ><template slot="title">
              <div v-if="current > 1 || (current === 1 && stepsStatus !== 'error')">{{ stepTitleMarketInfo }}</div>
              <div v-else-if="current === 1 && stepsStatus === 'error'" style="color: red">
                {{ stepTitleMarketInfo }}
              </div>
              <div v-else style="color: rgb(87, 117, 147)">{{ stepTitleMarketInfo }}</div>
            </template></Step
          >
          <Step
            ><template slot="title">
              <div v-if="current > 2 || (current === 2 && stepsStatus !== 'error')">{{ stepTitleInit }}</div>
              <div v-else-if="current === 2 && stepsStatus === 'error'" style="color: red">{{ stepTitleInit }}</div>
              <div v-else style="color: rgb(87, 117, 147)">{{ stepTitleInit }}</div>
            </template></Step
          >
          <Step
            ><template slot="title">
              <div v-if="current > 3 && stepsStatus !== 'error'">Pool Created</div>
              <div v-else-if="current === 3 && stepsStatus === 'error'" style="color: red">Pool Created</div>
              <div v-else slot="title" style="color: rgb(87, 117, 147)">Pool Created</div>
            </template></Step
          >
        </Steps>
        <Row style="align-items: baseline; line-height: 40px; padding-bottom: 20px" v-if="current === 0">
          <Col style="line-height: 20px" :span="24" :class="isMobile ? 'item-title-mobile' : 'item-title'"
            ><div style="padding-bottom: 10px; word-break: break-word">
              This tool is for advanced users. Before attempting to create a new liquidity pool, we suggest going
              through this
              <a href="https://raydium.gitbook.io/raydium/permissionless/creating-a-pool" target="_blank">
                detailed guide.</a
              >
            </div>
            <div>Input Serum Market ID:</div>
          </Col>
          <Col style="line-height: 20px" :span="24"><input v-model="inputMarket" :disabled="!marketInputFlag" /></Col>

          <Col :span="isMobile ? 24 : 24" style="padding-bottom: 20px; padding-top: 10px">
            <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal" style="width: 100%">
              Connect
            </Button>
            <Button
              v-else
              size="large"
              ghost
              class="button_div"
              :disabled="!wallet.connected"
              style="position: absolute; z-index: 999; width: 100%"
              :loading="getMarketLoading"
              @click="marketInputFlag ? getMarketMsg() : rewriteMarket()"
            >
              {{ !wallet.connected ? 'Connect' : getMarketLoading ? '' : marketInputFlag ? 'Confirm' : 'Cancel' }}
            </Button>
          </Col>
        </Row>
        <div v-if="current >= 1" style="margin-top: 10px" class="msgClass">
          <Row>
            <Col :span="isMobile ? 24 : 24" :class="isMobile ? 'item-title-mobile' : 'item-title'">Market Info:</Col>
            <Col :span="isMobile ? 24 : 24">
              <div style="padding-left: 10px">
                <div style="width: 100%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Base Token Mint Address:
                </div>
                <div
                  style="width: 100%; display: inline-block; text-align: right"
                  :class="isMobile ? 'item-msg-mobile' : ''"
                >
                  {{ getNameForMint(marketMsg.baseMintAddress.toBase58()) }}
                </div>
                <div style="width: 100%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Quote Token Mint Address:
                </div>
                <div
                  style="width: 100%; display: inline-block; text-align: right"
                  :class="isMobile ? 'item-msg-mobile' : ''"
                >
                  {{ getNameForMint(marketMsg.quoteMintAddress.toBase58()) }}
                </div>
                <div style="width: 100%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Expected AMM ID
                </div>
                <div
                  style="width: 100%; display: inline-block; text-align: right"
                  :class="isMobile ? 'item-msg-mobile' : ''"
                >
                  {{ expectAmmId }}
                </div>

                <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Tick Size:
                </div>
                <div style="width: 30%; display: inline-block" :class="isMobile ? 'item-msg-mobile' : ''">
                  {{ marketTickSize }}
                </div>
                <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Min Order Size:
                </div>
                <div style="width: 30%; display: inline-block" :class="isMobile ? 'item-msg-mobile' : ''">
                  {{ marketMsg.minOrderSize }}
                </div>
                <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Current Price:
                </div>
                <div style="width: 30%; display: inline-block" :class="isMobile ? 'item-msg-mobile' : ''">
                  {{
                    marketMsg.tickSize.toString().split('.').length === 2
                      ? marketPrice.toFixed(marketMsg.tickSize.toString().split('.')[1].length)
                      : parseInt((marketPrice / marketMsg.tickSize).toFixed(0)) * marketMsg.tickSize
                  }}
                </div>
              </div>
            </Col>
            <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
              Set Base Token Starting Price:
            </div>
            <div style="width: 30%; display: inline-block">
              <input
                v-model="inputPrice"
                type="number"
                :disabled="createAmmFlag"
                :step="1"
                accuracy="2"
                style="width: 100%"
              />
            </div>
            <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
              Base Token Initial Liquidity:
            </div>
            <div style="width: 30%; display: inline-block">
              <input
                v-model="inputBaseValue"
                type="number"
                :disabled="createAmmFlag"
                :step="1"
                accuracy="2"
                style="width: 100%"
              />
            </div>
            <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
              Quote Token Initial Liquidity:
            </div>
            <div style="width: 30%; display: inline-block">
              <input
                v-model="inputQuoteValue"
                type="number"
                :disabled="createAmmFlag"
                :step="1"
                accuracy="2"
                style="width: 100%"
              />
            </div>
            <Col :span="24" style="padding-top: 10px">
              <Button
                style="position: absolute; z-index: 999; width: 100%"
                v-if="!wallet.connected"
                size="large"
                ghost
                @click="$accessor.wallet.openModal"
              >
                Connect
              </Button>
              <Row v-else-if="current == 3">
                <Col span="24" style="text-align: center; margin-top: 10px"
                  ><strong>Pool has been successfully created!</strong></Col
                >
                <Col span="24" style="word-break: break-word; line-height: 20px"
                  >Save the AMM ID below to easily search for this pool on the Swap and Liquidity page.</Col
                >
                <Col
                  style="margin-top: 10px"
                  :span="isMobile ? 24 : 6"
                  :class="isMobile ? 'item-title-mobile' : 'item-title'"
                  >New AMM ID:</Col
                >
                <Col style="margin-top: 10px" :span="isMobile ? 24 : 18">
                  <NuxtLink :to="`/liquidity/?ammId=${userCreateAmmId}`">{{ userCreateAmmId }}</NuxtLink>
                </Col>
              </Row>
              <div v-else style="text-align: center; padding-top: 20px">
                <Button
                  size="large"
                  ghost
                  class="button_div"
                  :disabled="!wallet.connected"
                  style="z-index: 999; width: 20%"
                  :loading="getMarketLoading"
                  @click="marketInputFlag ? getMarketMsg() : rewriteMarket()"
                >
                  {{ !wallet.connected ? 'Connect' : getMarketLoading ? '' : marketInputFlag ? 'OK' : 'Cancel' }}
                </Button>
                <Button
                  size="large"
                  ghost
                  class="button_div"
                  style="z-index: 999; width: 70%"
                  :loading="createAmmFlag"
                  @click="createKey"
                  :disabled="
                    createAmmFlag ||
                    !(this.inputPrice !== null && this.inputBaseValue !== null && this.inputQuoteValue !== null)
                  "
                >
                  {{ createAmmFlag ? '' : 'Confirm and Initialize Liquidity Pool' }}
                </Button>

                <p style="padding-top: 20px; word-break: break-word; line-height: 20px; margin: 0">
                  After clicking 'Confirm' you will need to approve three transactions in your wallet to initialize the
                  pool, create the AMM account, and add liquidity.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
    <div class="card" v-if="userLocalAmmIdList.length > 0" style="margin-top: 20px">
      <div class="card-body" style="grid-row-gap: 0; row-gap: 0; padding-bottom: 15px; padding-top: 12px">
        <div style="font-size: 30px; font-weight: 700">Your Created Pools</div>
        <template v-for="item in userLocalAmmIdList">
          <div v-if="item.split('---').length === 5" :key="item" style="margin: 10px 0">
            <div>AMM ID: {{ item.split('---')[1] }}</div>
            <div style="text-indent: 1em; font-size: 13px">Serum Market ID: {{ item.split('---')[2] }}</div>
            <div style="text-indent: 1em; font-size: 13px">Base Token: {{ item.split('---')[3] }}</div>
            <div style="text-indent: 1em; font-size: 13px">Quote Token: {{ item.split('---')[4] }}</div>
            <div style="text-indent: 1em; font-size: 13px">
              Created on: {{ $dayjs(parseInt(item.split('---')[0])).toString() }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { Steps, Row, Col, Button, Tooltip, Icon } from 'ant-design-vue'
import { getMarket, createAmm, clearLocal } from '@/utils/market'
import BigNumber from '@/../node_modules/bignumber.js/bignumber'
import { TOKENS } from '@/utils/tokens'
import { createAmmId } from '@/utils/web3'
import { PublicKey } from '@solana/web3.js'
import { LIQUIDITY_POOL_PROGRAM_ID_V4 } from '@/utils/ids'

const Step = Steps.Step

@Component({
  head: {
    title: 'Raydium Create Pool'
  },
  components: {
    Steps,
    Row,
    Col,
    Button,
    Step,
    Tooltip,
    Icon
  }
})
export default class CreatePool extends Vue {
  current: number = 0
  marketInputFlag: boolean = true
  marketFlag: boolean = false
  inputMarket: string = ''
  inputQuoteValue: number | null = null
  inputBaseValue: number | null = null
  inputPrice: number | null = null
  marketMsg: any | null = null
  getMarketLoading: boolean = false
  marketError: null | string = null
  stepsStatus: string = 'process'
  marketStr: string | null = null
  marketPrice: number | null = null
  baseMintDecimals: number | null = null
  quoteMintDecimals: number | null = null

  createAmmFlag: boolean = false

  stepTitleInputMarket: string = 'Import Serum Market ID'
  stepTitleMarketInfo: string = 'Price & Initial Liquidity'
  stepTitleInit: string = 'Initialize'

  marketTickSize: number = 1

  userCreateAmmId: string = ''

  liquidityValueChangeFlag: boolean = true

  userLocalAmmIdList: string[] = []

  expectAmmId: undefined | string

  get isMobile() {
    return this.$accessor.isMobile
  }

  get wallet() {
    return this.$accessor.wallet
  }

  @Watch('inputQuoteValue')
  oniIputQuoteValueChanged(val: string) {
    if (
      this.inputPrice !== null &&
      this.baseMintDecimals !== null &&
      this.quoteMintDecimals !== null &&
      this.liquidityValueChangeFlag
    ) {
      this.liquidityValueChangeFlag = false
      if (val.toString().split('.').length > 1 && val.toString().split('.')[1].length > this.quoteMintDecimals) {
        this.inputQuoteValue = parseFloat(parseFloat(val).toFixed(this.quoteMintDecimals))
      }
      this.inputBaseValue =
        Math.floor(((this.inputQuoteValue ?? parseFloat(val)) / this.inputPrice) * 10 ** this.baseMintDecimals) /
        10 ** this.baseMintDecimals
    }
    setTimeout(() => {
      this.liquidityValueChangeFlag = true
    }, 1)
  }

  @Watch('inputBaseValue')
  onInputBaseValueChanged(val: string) {
    if (
      this.inputPrice !== null &&
      this.baseMintDecimals !== null &&
      this.quoteMintDecimals !== null &&
      this.liquidityValueChangeFlag
    ) {
      this.liquidityValueChangeFlag = false
      if (val.toString().split('.').length > 1 && val.toString().split('.')[1].length > this.baseMintDecimals) {
        this.inputBaseValue = parseFloat(parseFloat(val).toFixed(this.baseMintDecimals))
      }
      this.inputQuoteValue =
        Math.floor((this.inputBaseValue ?? parseFloat(val)) * this.inputPrice * 10 ** this.quoteMintDecimals) /
        10 ** this.quoteMintDecimals
    }
    setTimeout(() => {
      this.liquidityValueChangeFlag = true
    }, 1)
  }

  @Watch('inputPrice')
  onInputPriceValueChanged(val: number) {
    if (this.inputPrice) {
      if (this.inputBaseValue && this.quoteMintDecimals) {
        this.inputQuoteValue =
          Math.floor(val * this.inputPrice * 10 ** this.quoteMintDecimals) / 10 ** this.quoteMintDecimals
      } else if (this.inputQuoteValue && this.baseMintDecimals) {
        this.inputBaseValue =
          Math.floor((val / this.inputPrice) * 10 ** this.baseMintDecimals) / 10 ** this.baseMintDecimals
      }
    }
  }

  @Watch('inputMarket')
  onInputMarketChanged(val: string) {
    this.inputMarket = val.replace(/(^\s*)|(\s*$)/g, '')
  }

  mounted() {
    const localMarket = localStorage.getItem('createMarket')
    if (localMarket !== null && localMarket.length > 30) {
      this.inputMarket = localMarket
      this.getMarketMsg()
    } else {
      clearLocal()
    }
    this.updateLocalData()
  }

  updateLocalData() {
    if (localStorage.getItem('userCreateAMMID') !== null) {
      // @ts-ignore
      this.userLocalAmmIdList = localStorage.getItem('userCreateAMMID').split('+++')
    } else {
      this.userLocalAmmIdList = []
    }
  }

  getNameForMint(mint: string) {
    const mintToken = Object.keys(TOKENS).find((item) => TOKENS[item].mintAddress === mint)
    if (mintToken) {
      return `${mintToken}: ${mint}`
    }
    return mint
  }

  async getMarketMsg() {
    this.getMarketLoading = true
    this.marketInputFlag = !this.marketInputFlag
    const { market, price, msg, baseMintDecimals, quoteMintDecimals } = await getMarket(this.$web3, this.inputMarket)

    if (this.inputMarket && market !== null) {
      this.expectAmmId = (
        await createAmmId(new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4), new PublicKey(this.inputMarket))
      ).toString()
    }
    if (market === null) {
      this.marketInputFlag = !this.marketInputFlag
      this.stepsStatus = 'error'
      this.stepTitleInputMarket = msg
    } else {
      this.stepsStatus = 'process'
      this.stepTitleInputMarket = 'Import Serum Market ID'
      this.current = 1
      this.marketMsg = market
      this.marketPrice = price
      this.marketTickSize = new BigNumber(market.tickSize).toNumber()
      this.baseMintDecimals = baseMintDecimals
      this.quoteMintDecimals = quoteMintDecimals
      this.marketStr = this.inputMarket
    }
    this.getMarketLoading = false
  }

  rewriteMarket() {
    this.marketInputFlag = !this.marketInputFlag
    this.current = 0
    this.marketMsg = null
    this.inputMarket = ''
    this.inputQuoteValue = 0
    this.inputBaseValue = 0
    this.inputPrice = 0
    this.marketError = null
    this.createAmmFlag = false
    this.userCreateAmmId = ''
    this.stepTitleMarketInfo = 'Price & Initial Liquidity'
    this.stepTitleInit = 'Initialize'
    clearLocal()
  }

  createKey() {
    this.stepTitleMarketInfo = 'Price & Initial Liquidity'
    this.stepTitleInit = 'Initialize'
    if (
      this.marketMsg == null ||
      this.inputQuoteValue === null ||
      this.inputBaseValue === null ||
      this.inputPrice === null ||
      this.inputQuoteValue <= 0 ||
      this.inputBaseValue <= 0 ||
      this.inputPrice <= 0
    ) {
      this.stepTitleMarketInfo = 'Please input coin value'
      this.stepsStatus = 'error'
      return
    } else {
      this.stepTitleMarketInfo = 'Price & Initial Liquidity'
      this.stepsStatus = 'process'
    }

    this.createAmmFlag = true

    createAmm(this.$web3, this.$wallet, this.marketMsg, this.inputBaseValue, this.inputQuoteValue)
      .then(async (data) => {
        this.current = 3
        this.stepsStatus = 'process'
        this.userCreateAmmId = data
        if (localStorage.getItem('userCreateAMMID') !== null) {
          localStorage.setItem('userCreateAMMID', localStorage.getItem('userCreateAMMID') + '+++')
        } else {
          localStorage.setItem('userCreateAMMID', '')
        }
        localStorage.setItem(
          'userCreateAMMID',
          localStorage.getItem('userCreateAMMID') +
            `${new Date().getTime()}---${data}---${
              this.marketMsg.address
            }---${this.marketMsg.baseMint.toString()}---${this.marketMsg.quoteMint.toString()}`
        )
        this.updateLocalData()
        this.createAmmFlag = true
        await this.$accessor.liquidity.requestInfos()
      })
      .catch((error) => {
        this.stepsStatus = 'error'
        this.current = 2
        this.createAmmFlag = false
        this.stepTitleInit = error.message
        throw error
      })
  }
}
</script>
<style lang="less" scoped>
.create-pool {
  max-width: 570px;
}
.create-pool-mobile {
  width: 100%;
}
input {
  background: transparent;
  outline: none;
  border: none;
  border-bottom: 1px #ccc solid;
  width: 90%;
  margin: 0 5%;
}
.item-title {
  text-align: left;
  padding-right: 5%;
}
.item-title-mobile {
  text-align: left;
  padding-right: 5%;
}
div {
  word-break: break-all;
  word-wrap: break-word;
}
.item-msg-mobile {
  padding-left: 10px;
}

.ant-col {
  margin-bottom: 10px;
}
.msgClass div {
  line-height: 30px;
}
</style>
