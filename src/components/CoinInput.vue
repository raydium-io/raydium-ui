<template>
  <div class="coin-select">
    <div class="label fs-container">
      <span>{{ label }}</span>
      <span v-if="balance"> Balance: {{ balance }} </span>
    </div>
    <div class="fs-container">
      <input
        v-model="amount"
        inputmode="decimal"
        autocomplete="off"
        autocorrect="off"
        placeholder="0.00"
        type="text"
        pattern="^[0-9]*[.,]?[0-9]*$"
        minlength="1"
        maxlength="79"
        spellcheck="false"
      />
      <button class="fc-container" @click="onSelect">
        <div v-if="coinName">
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
import Component from 'vue-class-component'
import { Button, Icon } from 'ant-design-vue'

import { inputRegex, escapeRegExp } from '@/utils/regex'

const CoinInputProps = Vue.extend({
  props: {
    label: {
      type: String,
      default: 'From',
    },
    coinName: {
      type: String,
      default: '',
    },
    balance: {
      type: String,
      default: '',
    },
  },
})

@Component({
  components: {
    Button,
    Icon,
  },

  watch: {
    amount(newAmount: string, oldAmount: string) {
      if (inputRegex.test(escapeRegExp(newAmount))) {
        this.$emit('onInput', newAmount)
      } else {
        ;(this as any).amount = oldAmount
      }
    },
  },
})
export default class CoinInput extends CoinInputProps {
  amount = ''

  onSelect() {
    this.$emit('onSelect')
  }
}
</script>

<style lang="less" scoped>
.coin-select {
  padding: 12px 16px;
  background: #000829;
  border-radius: 4px;

  .label {
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 14px;
    color: rgb(133, 133, 141);

    .can-max {
      border-bottom: 1px dashed rgb(133, 133, 141);
      cursor: pointer;

      &:hover {
        color: #fff;
        border-bottom: 1px dashed #fff;
      }
    }
  }

  input {
    padding: 0;
    border: none;
    background-color: transparent;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:focus {
      outline: 0;
    }
  }

  button {
    padding: 0;
    border: none;
    background-color: transparent;
    font-weight: 600;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;

    &:focus {
      outline: 0;
    }

    .anticon {
      margin-left: 4px;
      font-size: 8px;
    }
  }
}
</style>
