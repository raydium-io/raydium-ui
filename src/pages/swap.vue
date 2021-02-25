<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Swap</span>
      <div class="buttons">
        <Tooltip placement="bottom" trigger="click">
          <template slot="title">
            <span>Address</span>
          </template>
          <Icon type="info-circle" />
        </Tooltip>
        <Icon type="setting" />
      </div>
    </div>
    <CoinSelect
      v-if="coinSelectShow"
      :close="closeCoinSelect"
      :on-select="onCoinSelect"
    />
    <div class="card">
      <div class="card-body">
        <CoinInput
          label="From"
          :coin-name="fromCoin ? fromCoin.symbol : ''"
          @onInput="onFromCoinInput"
          @onSelect="openFromCoinSelect"
        />

        <div class="change-side fc-container">
          <div class="fc-container" @click="changeCoinPosition">
            <Icon type="swap" :rotate="90" />
          </div>
        </div>

        <CoinInput
          label="To (Estimate)"
          :coin-name="toCoin ? toCoin.symbol : ''"
          @onInput="onToCoinInput"
          @onSelect="openToCoinSelect"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Icon, Tooltip } from 'ant-design-vue'

import {
  getTokenBySymbol,
  getTokenByMintAddress,
  TokenInfo,
} from '@/utils/tokens'

@Component({
  components: {
    Icon,
    Tooltip,
  },
})
export default class Swap extends Vue {
  coinSelectShow = false
  // 正在选择哪个的币种
  selectFromCoin = true

  fromCoin: TokenInfo | null = getTokenBySymbol('RAY')
  toCoin: TokenInfo | null = null
  fromCoinAmount = ''
  toCoinAmount = ''

  openFromCoinSelect() {
    this.selectFromCoin = true
    this.coinSelectShow = true
  }

  openToCoinSelect() {
    this.selectFromCoin = false
    this.coinSelectShow = true
  }

  closeCoinSelect() {
    this.coinSelectShow = false
  }

  onCoinSelect(mintAddress: string) {
    if (this.selectFromCoin) {
      this.fromCoin = getTokenByMintAddress(mintAddress)

      // 如果选的币种被另一个选了 把另一个重置
      if (this.toCoin?.mintAddress === mintAddress) {
        this.toCoin = null
      }
    } else {
      this.toCoin = getTokenByMintAddress(mintAddress)

      // 如果选的币种被另一个选了 把另一个重置
      if (this.fromCoin?.mintAddress === mintAddress) {
        this.fromCoin = null
      }
    }

    this.coinSelectShow = false
  }

  changeCoinPosition() {
    const tempFromCoin = this.fromCoin
    const tempToCoin = this.toCoin
    const tempFromCoinAmount = this.fromCoinAmount
    const tempToCoinAmount = this.toCoinAmount

    this.fromCoin = tempToCoin
    this.toCoin = tempFromCoin
    this.fromCoinAmount = tempToCoinAmount
    this.toCoinAmount = tempFromCoinAmount
  }

  onFromCoinInput(amount: string) {
    console.log(amount)
    this.fromCoinAmount = amount
  }

  onToCoinInput(amount: string) {
    this.toCoinAmount = amount
  }
}
</script>

<style lang="less">
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
