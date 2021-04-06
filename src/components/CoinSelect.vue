<template>
  <Modal title="Select a token" :visible="true" :footer="null" @cancel="$emit('onClose')">
    <div class="select-token">
      <input v-model="keyword" placeholder="Search name" />
      <div class="sort fs-container">
        <span class="title">Token name</span>
        <Icon :type="desc ? 'arrow-up' : 'arrow-down'" @click="setDesc" />
      </div>
      <div class="token-list">
        <div v-for="token in tokenList" :key="token.symbol" class="token-info" @click="$emit('onSelect', token)">
          <img :src="importIcon(`/coins/${token.symbol.toLowerCase()}.png`)" />
          <div>
            <div>{{ token.symbol }}</div>
          </div>
          <span></span>
          <div class="balance">
            <div v-if="wallet.loading">
              <Icon type="loading" />
            </div>
            <div v-else-if="token.tokenAccountAddress">
              {{ token.balance.toEther() }}
            </div>
            <div v-else></div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Modal, Icon } from 'ant-design-vue'

import importIcon from '@/utils/import-icon'
import { TOKENS, TokenInfo, NATIVE_SOL } from '@/utils/tokens'
import { cloneDeep } from 'lodash-es'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Icon
  },

  data() {
    return {
      keyword: '',
      tokenList: [] as Array<TokenInfo>,
      desc: false
    }
  },

  computed: {
    ...mapState(['wallet'])
  },

  watch: {
    keyword(newKeyword) {
      this.createTokenList(newKeyword)
    },

    'wallet.tokenAccounts': {
      handler(_newTokenAccounts: any, _oldTokenAccounts: any) {
        this.createTokenList()
      },
      deep: true
    }
  },

  mounted() {
    this.createTokenList()
  },

  methods: {
    importIcon,

    createTokenList(keyword = '') {
      let tokenList = []

      let ray = {}
      let nativeSol = cloneDeep(NATIVE_SOL)

      let hasBalance = []
      let noBalance = []

      for (const symbol of Object.keys(TOKENS)) {
        let tokenInfo = cloneDeep(TOKENS[symbol])
        tokenInfo.symbol = symbol

        const tokenAccount = this.wallet.tokenAccounts[tokenInfo.mintAddress]

        if (tokenAccount) {
          tokenInfo = { ...tokenInfo, ...tokenAccount }

          if (tokenInfo.symbol === 'RAY') {
            ray = cloneDeep(tokenInfo)
          } else {
            hasBalance.push(tokenInfo)
          }
        } else if (tokenInfo.symbol === 'RAY') {
          ray = cloneDeep(tokenInfo)
        } else {
          noBalance.push(tokenInfo)
        }
      }

      const solAccount = this.wallet.tokenAccounts[NATIVE_SOL.mintAddress]

      if (solAccount) {
        nativeSol = { ...nativeSol, ...solAccount }
      }

      // balance sort
      hasBalance = hasBalance.sort((a, b) => {
        return b.balance.toEther() - a.balance.toEther()
      })

      // no balance sort
      noBalance = noBalance.sort((a, b) => {
        return a.symbol.localeCompare(b.symbol)
      })

      if (!this.desc) {
        tokenList = [...[ray, nativeSol], ...hasBalance, ...noBalance]
      } else {
        tokenList = [...[ray, nativeSol], ...noBalance.reverse(), ...hasBalance]
      }

      if (keyword) {
        tokenList = tokenList.filter((token) => token.symbol.includes(keyword.toUpperCase()))
      }

      this.tokenList = cloneDeep(tokenList)
    },

    setDesc() {
      this.desc = !this.desc
      this.createTokenList()
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
