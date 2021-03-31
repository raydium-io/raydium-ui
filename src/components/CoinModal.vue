<template>
  <Modal :title="title" :visible="true" :footer="null" :width="400" centered @cancel="$emit('onCancel')">
    <div class="coin-modal">
      <div class="label fs-container">
        <span></span>
        <span v-if="coin.balance && !coin.balance.wei.isNaN()"> Balance: {{ coin.balance.fixed() }} </span>
      </div>
      <div class="coin-input fs-container">
        <input
          v-model="value"
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
        <button
          v-if="coin.balance && (isNullOrZero(value) || lt(value, coin.balance.toEther()))"
          class="max-button"
          @click="setMax"
        >
          MAX
        </button>
        <div v-if="coin.symbol" class="coin-name">
          {{ coin.symbol }}
        </div>
      </div>
    </div>

    <Row :gutter="32" class="actions">
      <Col :span="12">
        <Button ghost @click="$emit('onCancel')"> Cancel </Button>
      </Col>
      <Col :span="12">
        <Button
          :loading="loading"
          :disabled="loading || isNullOrZero(value) || !lte(value, coin.balance.toEther())"
          ghost
          @click="$emit('onOk', value)"
        >
          Confirm
        </Button>
      </Col>
    </Row>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Row, Col, Button } from 'ant-design-vue'

import { inputRegex, escapeRegExp } from '@/utils/regex'
import { lt, lte, isNullOrZero } from '@/utils/safe-math'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Row,
    Col,
    Button
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    coin: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      value: ''
    }
  },

  watch: {
    // input amount change
    value(newValue: string, oldValue: string) {
      this.$nextTick(() => {
        if (!inputRegex.test(escapeRegExp(newValue))) {
          this.value = oldValue
        }
      })
    }
  },

  methods: {
    lt,
    lte,
    isNullOrZero,

    setMax() {
      this.value = this.coin.balance.fixed()
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.actions {
  margin-top: 10px;

  button {
    width: 100%;
  }
}

.coin-modal {
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

    .coin-name {
      padding: 0.5rem;
      line-height: 24px;
      font-weight: 600;
    }
  }
}
</style>
