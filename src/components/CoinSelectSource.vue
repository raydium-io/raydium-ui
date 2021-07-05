<template>
  <Modal title="Select token source" :visible="true" :footer="null" @cancel="$emit('onClose')">
    <div v-for="value of data" :key="value.outName" style="padding: 10px">
      <div style="display: inline-block; width: 49%">{{ value.outName }}</div>
      <div style="display: inline-block; width: 49%; text-align: right">
        <Toggle
          v-model="value.show"
          checked-children="ON"
          un-checked-children="OFF"
          :disabled="value.mustShow"
          @change="test"
        ></Toggle>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Switch as Toggle } from 'ant-design-vue'

import { TOKENS_TAGS } from '@/utils/tokens'

Vue.use(Modal)
Vue.use(Toggle)

export default Vue.extend({
  components: {
    Modal,
    Toggle
  },

  data() {
    return {
      data: null as any
    }
  },
  mounted() {
    this.data = TOKENS_TAGS
  },

  methods: {
    test() {
      const outShowList: string[] = []
      for (const [name, item] of Object.entries(TOKENS_TAGS)) {
        if (!item.mustShow && item.show) {
          outShowList.push(name)
        }
      }
      window.localStorage.userSelectSource = outShowList.join('---')
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.select-token {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 14px;

  input {
    padding: 16px;
    border: 1px solid @primary-color;
    border-radius: 4px;
    background-color: transparent;
    font-size: 18px;
    color: @text-color;

    &:active,
    &:focus,
    &:hover {
      outline: 0;
    }
  }

  .sort {
    .title {
      font-size: 14px;
      line-height: 36px;
      font-weight: 400;
    }
  }

  .token-list {
    max-height: 50vh;
    padding-right: 10px;
    overflow: auto;
    direction: ltr;
    will-change: transform;

    .token-info {
      display: grid;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      padding: 4px 0;
      gap: 16px;
      grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
      cursor: pointer;
      opacity: 1;

      img {
        border-radius: 50%;
        height: 24px;
        width: 24px;
      }

      .balance {
        justify-self: flex-end;
        width: fit-content;

        div {
          white-space: nowrap;
          overflow: hidden;
          max-width: 5rem;
          text-overflow: ellipsis;
        }
      }
    }

    .token-info[disabled] {
      cursor: not-allowed;
      // pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
