<template>
  <div class="coin-select">
    <div class="label fs-container">
      <span>{{ label }}</span>
      <span v-if="balance && !balance.wei.isNaN()"> Balance: {{ balance.fixed() }} </span>
    </div>
    <div class="coin-input">
      <div class="main-input fs-container">
        <input
          ref="input"
          :value="value"
          inputmode="decimal"
          autocomplete="off"
          autocorrect="off"
          placeholder="0.00"
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minlength="1"
          maxlength="79"
          spellcheck="false"
          :disabled="disabled"
          @input="$emit('onInput', $event.target.value)"
          @focus="$emit('onFocus')"
        />
        <button v-if="!disabled && showHalf && balance" class="input-button" @click="inputBalanceByPercent(0.5)">
          HALF
        </button>
        <button v-if="!disabled && balance" class="input-button" @click="inputBalanceByPercent(1)">MAX</button>
        <button class="select-button fc-container" @click="$emit('onSelect')">
          <div v-if="coinName" class="fc-container">
            <CoinIcon :mint-address="mintAddress" />
            <span>{{ coinName }}</span>
          </div>
          <span v-else>Select a token</span>
          <Icon type="caret-down" />
        </button>
      </div>
      <!-- <input // Maybe it will use soon or later
        v-if="!disabled && balance"
        ref="range"
        :value="value"
        class="input-range"
        type="range"
        min="0"
        :max="balance ? balance.toEther() : ''"
        step="any"
        @change="$emit('onInput', $event.target.value)"
        @mousedown="focusInput()"
      />
      <div v-if="!disabled && balance" class="shortcut-btns">
        <button class="input-button" @click="inputBalanceByPercent(0)">0</button>
        <button class="input-button" @click="inputBalanceByPercent(0.25)">25%</button>
        <button class="input-button" @click="inputBalanceByPercent(0.5)">50%</button>
        <button class="input-button" @click="inputBalanceByPercent(0.75)">75%</button>
        <button class="input-button" @click="inputBalanceByPercent(1)">MAX</button>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Icon } from 'ant-design-vue'

import { lt } from '@/utils/safe-math'

export default Vue.extend({
  components: {
    Icon
  },

  model: {
    prop: 'value',
    event: 'onInput'
  },

  props: {
    label: {
      type: String,
      default: 'From'
    },
    coinName: {
      type: String,
      default: ''
    },
    mintAddress: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    balance: {
      type: Object,
      default: null
    },
    balanceOffset: {
      type: Number,
      default: 0
    },
    showMax: {
      type: Boolean,
      default: true
    },
    showHalf: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    lt,
    focusInput() {
      const input = this.$refs.input as HTMLInputElement
      input.focus()
    },
    inputBalanceByPercent(percent: number) {
      // error balance
      if (!this.balance || this.balance.wei.isNaN()) return

      const availableBalance = Number(this.balance.toEther()) + (this.balanceOffset ?? 0)

      // can't send negative balance
      if (availableBalance < 0) return

      const inputValue = (availableBalance * percent).toFixed(this.balance.decimals)
      this.focusInput()
      this.$emit('onInput', inputValue)
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.coin-select {
  background: #000829;
  border-radius: 4px;

  .label {
    padding: 0.75rem 1rem 0;
    font-size: 12px;
    line-height: 14px;
    color: rgb(133, 133, 141);
  }

  input {
    width: 0;
    padding: 0;
    border: none;
    background-color: transparent;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    flex: 1 1 auto;
    color: @text-color;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:active,
    &:focus,
    &:hover {
      outline: 0;
    }
  }

  input[disabled] {
    cursor: not-allowed;
  }

  .coin-input {
    padding: 0.75rem 0.75rem 0.75rem 1rem;

    button {
      border: none;
      background-color: transparent;
      font-weight: 600;
      font-size: 14px;
      line-height: 22px;
      border-radius: 4px;
      white-space: nowrap;
      cursor: pointer;

      &:active,
      &:focus,
      &:hover {
        outline: 0;
      }

      &:hover {
        background-color: @modal-header-bg;
      }
    }

    .input-range {
      width: 100%;
      // &::-webkit-slider-runnable-track {
      //   background: #ddd;
      // }
      // &::-webkit-slider-thumb {
      //   background: dodgerblue;
      //   width: 4px;
      //   height: 4px;
      //   border-radius: 50%;
      // }
    }
    .input-button {
      height: 32px;
      padding: 0 4px;
      color: @primary-color;
      font-size: 0.9em;
    }

    .select-button {
      padding: 0.5rem;
      line-height: 24px;

      .anticon {
        margin-left: 4px;
        font-size: 8px;
      }

      img {
        margin-right: 5px;
        height: 24px;
        width: 24px;
      }
    }

    .shortcut-btns {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
