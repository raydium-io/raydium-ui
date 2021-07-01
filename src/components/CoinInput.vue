<template>
  <div class="coin-select">
    <div class="label fs-container">
      <span>{{ label }}</span>
      <span v-if="balance && !balance.wei.isNaN()"> Balance: {{ balance.fixed() }} </span>
    </div>
    <div class="coin-input fs-container">
      <input
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
      <button
        v-if="showMax && balance && (!value || lt(value, balance.toEther()))"
        class="max-button"
        @click="$emit('onMax')"
      >
        MAX
      </button>
      <button class="select-button fc-container" @click="$emit('onSelect')">
        <div v-if="coinName" class="fc-container">
          <CoinIcon :mint-address="mintAddress" />
          <span>{{ coinName }}</span>
        </div>
        <span v-else>Select a token</span>
        <Icon type="caret-down" />
      </button>
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
    showMax: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    lt
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

    .max-button {
      height: 32px;
      padding: 0 16px;
      color: @primary-color;
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
  }
}
</style>
