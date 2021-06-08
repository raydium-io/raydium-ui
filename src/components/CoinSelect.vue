<template>
  <Modal title="Select a token" :visible="true" :footer="null" @cancel="$emit('onClose')">
    <div class="select-token">
      <input ref="userInput" v-model="keyword" placeholder="Search name or mint address" />
      <div v-if="!addUserCoin" class="sort fs-container">
        <span class="title">Token name</span>
        <Icon :type="desc ? 'arrow-up' : 'arrow-down'" @click="setDesc" />
      </div>
      <div v-if="!addUserCoin" class="token-list">
        <template v-for="token in tokenList">
          <div
            v-if="
              (token.showDefault || (token.mintAddress === keyword && token.cache !== true)) &&
              token.mintAddress !== 'So11111111111111111111111111111111111111112'
            "
            :key="token.symbol"
            class="token-info"
            @click="$emit('onSelect', token)"
          >
            <img :src="importIcon(`/coins/${token.symbol.toLowerCase()}.png`)" />
            <div>
              <span>{{ token.symbol }}</span>
              <span v-if="!token.official" style="margin-left: 10px">User Added</span>
              <button
                v-if="!token.official"
                style="
                  margin: 0 10px;
                  color: rgb(90, 196, 190);
                  outline: none;
                  background-color: transparent;
                  padding: 0;
                  border: 0 solid transparent;
                "
                @click="delUserMintToLocal(token.mintAddress)"
              >
                (Remove)
              </button>
              <button
                v-if="!token.showDefault && token.mintAddress === keyword"
                style="
                  margin: 0 10px;
                  color: rgb(90, 196, 190);
                  outline: none;
                  background-color: transparent;
                  padding: 0;
                  border: 0 solid transparent;
                "
                @click="addSolanaCoin"
              >
                Add
              </button>
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
        </template>
      </div>
      <div v-if="addUserCoin" class="sort fs-container">
        <span class="title">Create a name for this token</span>
        <Icon :type="desc ? 'arrow-up' : 'arrow-down'" @click="setDesc" />
      </div>
      <div v-if="addUserCoin" class="token-list">
        <div><input v-model="userInputCoinName" placeholder="Input Name" style="width: 100%; height: 10px" /></div>
        <div style="margin: 5px 0">
          Located from mint address
          <button
            style="
              margin: 0 10px;
              color: rgb(90, 196, 190);
              background-color: transparent;
              outline: none;
              padding: 0;
              border: 0 solid transparent;
            "
            @click="addUserMintToLocal"
          >
            (Add to token list)
          </button>
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
import { TOKENS, TokenInfo, NATIVE_SOL, Tokens } from '@/utils/tokens'
import { cloneDeep } from 'lodash-es'
import { PublicKey } from '@solana/web3.js'
// import { getFilteredProgramAccounts } from '@/utils/web3'
import { MINT_LAYOUT } from '@/utils/layouts'

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
      desc: false,
      addUserCoin: false,
      addUserCoinMint: null as Tokens | null,
      userInputCoinName: undefined
    }
  },

  computed: {
    ...mapState(['wallet'])
  },

  watch: {
    keyword(newKeyword) {
      this.createTokenList(newKeyword)
      this.findMint(newKeyword)
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
    this.$nextTick(function () {
      // @ts-ignore
      this.$refs.userInput.focus()
    })
  },

  methods: {
    importIcon,

    addSolanaCoin() {
      Object.keys(TOKENS).forEach((item) => {
        if (TOKENS[item].mintAddress === this.keyword) {
          TOKENS[item].showDefault = true
          if (window.localStorage.addSolanaCoin && !window.localStorage.addSolanaCoin.includes(this.keyword)) {
            window.localStorage.addSolanaCoin = window.localStorage.addSolanaCoin + '---' + this.keyword
          } else {
            window.localStorage.addSolanaCoin = this.keyword
          }
        }
      })
      this.$accessor.liquidity.requestInfos()
    },

    delUserMintToLocal(mintAddress: string) {
      // LOCAL
      const localMintStr = window.localStorage.user_add_coin_mint ?? ''
      const localMintList = localMintStr.split('---')
      const newMintList = []
      for (let index = 0; index < Math.floor(localMintList.length); index += 1) {
        if (
          localMintList[index * 3 + 1] !== '' &&
          localMintList[index * 3 + 1] !== undefined &&
          localMintList[index * 3 + 1] !== mintAddress
        ) {
          newMintList.push(localMintList[index * 3 + 0], localMintList[index * 3 + 1], localMintList[index * 3 + 2])
        }
      }
      window.localStorage.user_add_coin_mint = newMintList.join('---')
      // TOKENS
      const tokensName = Object.keys(TOKENS).find((item) => TOKENS[item].mintAddress === mintAddress)

      if (tokensName) {
        delete TOKENS[tokensName]
      }
      this.$emit('onSelect', null)
      this.$accessor.liquidity.requestInfos()
    },

    addUserMintToLocal() {
      if (this.userInputCoinName === undefined) {
        this.$notify.warning({
          message: 'Please enter name',
          description: ''
        })
      } else if (Object.keys(TOKENS).find((itemName) => itemName === this.userInputCoinName)) {
        this.$notify.warning({
          message: 'Duplicate name',
          description: ''
        })
      } else if (this.addUserCoinMint !== null) {
        const key = Object.keys(TOKENS).find((item) => TOKENS[item].mintAddress === this.keyword)
        if (key) {
          delete TOKENS[key]
        }

        TOKENS[this.userInputCoinName ?? ''] = {
          name: this.userInputCoinName,
          symbol: this.userInputCoinName,
          mintAddress: this.keyword,
          decimals: this.addUserCoinMint.decimals,
          official: false,
          showDefault: true
        }

        const userAddCoinMintLocal = window.localStorage.user_add_coin_mint ?? ''
        let userAddCoinMintLocalArray = userAddCoinMintLocal.split('---')
        if (userAddCoinMintLocalArray.length % 3 === 0) {
          userAddCoinMintLocalArray.push(this.userInputCoinName ?? '', this.keyword, this.addUserCoinMint.decimals)
        } else {
          userAddCoinMintLocalArray = [this.userInputCoinName ?? '', this.keyword, this.addUserCoinMint.decimals]
        }
        window.localStorage.user_add_coin_mint = userAddCoinMintLocalArray.join('---')

        this.keyword = this.userInputCoinName ?? ''
      }
      this.$accessor.liquidity.requestInfos()
    },

    async findMint(keyword = '') {
      if (keyword.length === 44) {
        const hasToken = Object.values(TOKENS).find((item) => item.mintAddress === keyword && item.cache !== true)
        if (hasToken && hasToken.showDefault) {
          this.keyword = hasToken.symbol
        } else {
          try {
            const acc = await this.$web3.getAccountInfo(new PublicKey(keyword))
            if (acc != null) {
              const mint = MINT_LAYOUT.decode(acc.data)
              if (mint.initialized === true) {
                this.addUserCoin = true
                this.addUserCoinMint = mint
              }
            }
          } catch (error) {
            this.addUserCoin = false
          }
        }
      } else {
        this.addUserCoin = false
      }
    },

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
        tokenList = tokenList.filter(
          (token) => token.symbol.toUpperCase().includes(keyword.toUpperCase()) || token.mintAddress === keyword
        )
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
