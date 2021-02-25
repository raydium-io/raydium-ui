<template>
  <div class="coin-select">
    <div class="label fs-container">
      <span>{{ label }}</span>
      <span v-if="showBalance"> Balance: 0.01 </span>
    </div>
    <div class="fs-container">
      <input
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
      <button class="fc-container" @click="openCoinSelect">
        <span>
          {{ coinName }}
        </span>
        <Icon type="caret-down" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { Button, Icon } from 'ant-design-vue'

const CoinInputProps = Vue.extend({
  props: {
    label: {
      type: String,
      default: 'From',
    },
    coinName: {
      type: String,
      default: 'RAY',
    },
    showBalance: {
      type: Boolean,
      default: false,
    },
    openCoinSelect: {
      type: Function,
      required: true,
    },
  },
})

@Component({
  components: {
    Button,
    Icon,
  },
})
export default class CoinInput extends CoinInputProps {}
</script>

<style lang="less" scoped>
.coin-select {
  padding: 12px 16px;
  background: rgb(0, 8, 41);
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
