<template>
  <Modal title="Select a token" :visible="true" :footer="null" @cancel="close">
    <div class="select-token">
      <input placeholder="Search name" />
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
            <div v-if="wallet.tokenAccountsLoading">
              <Icon type="loading" />
            </div>
            <div v-else-if="token.tokenAccountAddress">
              {{ token.uiBalance }}
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

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Icon,
  },

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

  data() {
    return {
      tokenList: [] as Array<TokenInfo>,
      desc: false,
    }
  },

  computed: {
    ...mapState(['wallet']),
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(_newTokenAccounts: any, _oldTokenAccounts: any) {
        this.createTokenList()
      },
      deep: true,
    },
  },

  mounted() {
    this.createTokenList()
  },

  methods: {
    importIcon,

    createTokenList() {
      this.tokenList = []

      let ray = {}
      const nativeSol = NATIVE_SOL

      let hasBalance = []
      let noBalance = []

      for (const symbol of Object.keys(TOKENS)) {
        const token = TOKENS[symbol]
        token.symbol = symbol

        const tokenAccount = this.wallet.tokenAccounts[token.mintAddress]

        if (tokenAccount) {
          token.balance = tokenAccount.balance
          token.tokenAccountAddress = tokenAccount.tokenAccountAddress
          token.uiBalance = tokenAccount.uiBalance

          if (token.symbol === 'RAY') {
            ray = token
          } else {
            hasBalance.push(token)
          }
        } else if (token.symbol === 'RAY') {
          ray = token
        } else {
          noBalance.push(token)
        }
      }

      const solAccount = this.wallet.tokenAccounts[NATIVE_SOL.mintAddress]

      if (solAccount) {
        nativeSol.balance = solAccount.balance
        nativeSol.tokenAccountAddress = solAccount.tokenAccountAddress
        nativeSol.uiBalance = solAccount.uiBalance
      }

      // 余额排序
      hasBalance = hasBalance.sort((a, b) => {
        return b.uiBalance - a.uiBalance
      })

      // 无余额的名字排序
      noBalance = noBalance.sort((a, b) => {
        return a.symbol.localeCompare(b.symbol)
      })

      // 正序 或 倒序
      if (!this.desc) {
        this.tokenList = [...[ray, nativeSol], ...hasBalance, ...noBalance]
      } else {
        this.tokenList = [
          ...[ray, nativeSol],
          ...noBalance.reverse(),
          ...hasBalance,
        ]
      }
    },

    setDesc() {
      this.desc = !this.desc
      this.createTokenList()
    },
  },
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
