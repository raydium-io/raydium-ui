<template>
  <Modal title="Select a token" :visible="true" :footer="null" @cancel="close">
    <div class="select-token">
      <Input size="large" placeholder="Search name or paste mint address" />
      <div class="sort fs-container">
        <span class="title">Token name</span>
        <Icon :type="desc ? 'arrow-up' : 'arrow-down'" @click="setDesc" />
      </div>
      <div class="token-list">
        <div
          v-for="token in tokenList"
          :key="token.symbol"
          class="token-info"
          @click="onSelect(token.mintAddress)"
        >
          <img :src="importIcon(`/coins/${token.symbol.toLowerCase()}.png`)" />
          <div>
            <div>{{ token.symbol }}</div>
          </div>
          <span></span>
          <div class="balance">
            <div>0.001</div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { mapState } from 'vuex'
import { Input, Modal, Icon } from 'ant-design-vue'

import importIcon from '@/utils/import-icon'
import { TOKENS, TokenInfo } from '@/utils/tokens'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

const CoinSelectProps = Vue.extend({
  props: {
    close: {
      type: Function,
      required: true,
    },
    onSelect: {
      type: Function,
      required: true,
    },
  },
})

@Component({
  components: {
    Input,
    Modal,
    Icon,
  },

  computed: {
    ...mapState(['wallet']),
  },

  methods: {
    importIcon,
  },
})
export default class CoinSelect extends CoinSelectProps {
  tokenList: Array<TokenInfo> = []
  desc = false

  mounted() {
    this.createTokenList()
  }

  createTokenList() {
    this.tokenList = []

    let ray = {}
    let sortedTokenList = []

    for (const symbol of Object.keys(TOKENS[(this as any).wallet.env])) {
      const token = TOKENS[(this as any).wallet.env][symbol]
      token.symbol = symbol
      if (symbol === 'RAY') {
        ray = token
      } else {
        sortedTokenList.push(token)
      }
    }

    sortedTokenList = sortedTokenList.sort((a, b) => {
      return a.symbol.localeCompare(b.symbol)
    })

    if (this.desc) {
      sortedTokenList.reverse()
    }

    this.tokenList = [...[ray], ...sortedTokenList]
  }

  setDesc() {
    this.desc = !this.desc
    this.createTokenList()
  }
}
</script>

<style lang="less" scoped>
.select-token {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 14px;

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

    .token-info.disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
