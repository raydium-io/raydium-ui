<template>
  <Modal v-if="!showSelectSourceFlag" title="Select a token" :visible="true" @cancel="$emit('onClose')">
    <div class="select-token">
      <input ref="userInput" v-model="keyword" placeholder="Search name or mint address" />
      <div v-if="!addUserCoin" class="sort fs-container">
        <span class="title">Token name</span>
        <Icon :type="desc ? 'arrow-up' : 'arrow-down'" @click="setDesc" />
      </div>
      <div v-if="!addUserCoin" class="token-list">
        <template v-for="token of tokenList">
          <div
            v-if="token.cache !== true && token.mintAddress !== 'So11111111111111111111111111111111111111112'"
            :key="token.symbol + token.mintAddress"
            class="token-info"
            @click="$emit('onSelect', token)"
            @mouseenter="tokenHover(token)"
            @mouseleave="tokenMove(token)"
          >
            <CoinIcon :mint-address="token.mintAddress" />
            <div>
              <span>{{ token.symbol }}</span>
              <button
                v-if="token.tags.includes('userAdd') && showUserButton[token.symbol + token.mintAddress]"
                style="
                  margin: 0 10px;
                  color: rgb(90, 196, 190);
                  outline: none;
                  background-color: transparent;
                  padding: 0;
                  border: 0 solid transparent;
                "
                @click.stop="delCoinToAttention(token)"
              >
                (Remove Token)
              </button>
              <button
                v-if="
                  !token.tags.includes('userAdd') &&
                  showUserButton[token.symbol + token.mintAddress] &&
                  !token.tags.find((item) => tokensTags[item].mustShow)
                "
                style="
                  margin: 0 10px;
                  color: rgb(90, 196, 190);
                  outline: none;
                  background-color: transparent;
                  padding: 2px;
                  border: 0 solid transparent;
                "
                @click.stop="addCoinToAttention(token)"
              >
                (Add Token)
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
            (Add To Attention)
          </button>
        </div>
      </div>
    </div>
    <template slot="footer">
      <Button
        class="source-manager"
        @click="
          () => {
            showSelectSourceFlag = true
          }
        "
        >View Token Lists</Button
      >
    </template>
  </Modal>
  <CoinSelectSource v-else @onClose="() => (showSelectSourceFlag = false)" />
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Modal, Icon } from 'ant-design-vue'

import { TOKENS, TokenInfo, NATIVE_SOL, TOKENS_TAGS } from '@/utils/tokens'
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
      tokensTags: TOKENS_TAGS,
      keyword: '',
      tokenList: [] as Array<TokenInfo>,
      desc: false,
      addUserCoin: false,
      addUserCoinToken: null as any | null,

      userInputCoinName: undefined,
      showSelectSourceFlag: false,
      showUserButton: {} as { [key: string]: boolean }
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity'])
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
    },

    tokensTags: {
      handler(_newTokenAccounts: any, _oldTokenAccounts: any) {
        this.createTokenList(this.keyword)
        this.findMint(this.keyword)
      },
      deep: true
    },
    'liquidity.initialized': {
      handler(_newTokenAccounts: any, _oldTokenAccounts: any) {
        this.createTokenList(this.keyword)
        this.findMint(this.keyword)
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
    tokenHover(token: any) {
      this.$set(this.showUserButton, token.symbol + token.mintAddress, true)
    },
    tokenMove(token: any) {
      this.$set(this.showUserButton, token.symbol + token.mintAddress, false)
    },
    addCoinToAttention(token: any) {
      if (token.mintAddress === NATIVE_SOL.mintAddress) {
        NATIVE_SOL.tags.push('userAdd')
      }
      if (TOKENS[token.key] && !TOKENS[token.key].tags.includes('userAdd')) {
        TOKENS[token.key].tags.push('userAdd')
      }
      if (window.localStorage.addSolanaCoin) {
        window.localStorage.addSolanaCoin = window.localStorage.addSolanaCoin + '---' + token.mintAddress
      } else {
        window.localStorage.addSolanaCoin = token.mintAddress
      }
      this.createTokenList(this.keyword)
      this.findMint(this.keyword)
    },
    delCoinToAttention(token: any) {
      if (window.localStorage.addSolanaCoin) {
        window.localStorage.addSolanaCoin = window.localStorage.addSolanaCoin
          .split('---')
          .filter((item: any) => item !== token.mintAddress)
          .join('---')
      }
      this.delUserMintToLocal(token.mintAddress)

      if (TOKENS[token.key] && TOKENS[token.key].tags.includes('userAdd')) {
        this.delTags(TOKENS[token.key], 'userAdd')
      }
      if (NATIVE_SOL.mintAddress === token.mintAddress && NATIVE_SOL.tags.includes('userAdd')) {
        this.delTags(NATIVE_SOL, 'userAdd')
      }
      this.createTokenList(this.keyword)
      this.findMint(this.keyword)
    },

    delTags(token: any, key: string) {
      const indexItem = token.tags.indexOf(key)
      if (indexItem === 0) {
        token.tags = token.tags.splice(1, token.tags.length - 1)
      } else if (indexItem > 0) {
        token.tags = [
          ...token.tags.splice(0, indexItem),
          ...token.tags.splice(indexItem + 1, token.tags.length - indexItem - 1)
        ]
      }
      if (token.tags.length === 0) {
        token.cache = true
        token.symbol = 'unknown'
        token.name = 'unknown'
      }
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
    },

    addUserMintToLocal() {
      if (this.userInputCoinName === undefined) {
        this.$notify.warning({
          message: 'Please enter name',
          description: ''
        })
      } else if (Object.values(TOKENS).find((item: any) => item.symbol === this.userInputCoinName)) {
        this.$notify.warning({
          message: 'Duplicate name',
          description: ''
        })
      } else if (this.addUserCoinToken !== null) {
        const key = Object.keys(TOKENS).find((item) => TOKENS[item].mintAddress === this.keyword)
        if (key === undefined) {
          return
        }
        TOKENS[key].name = this.userInputCoinName
        TOKENS[key].symbol = this.userInputCoinName
        TOKENS[key].cache = false
        TOKENS[key].tags.push('userAdd')

        const userAddCoinMintLocal = window.localStorage.user_add_coin_mint ?? ''
        let userAddCoinMintLocalArray = userAddCoinMintLocal.split('---')
        if (userAddCoinMintLocalArray.length % 3 === 0) {
          userAddCoinMintLocalArray.push(
            this.userInputCoinName ?? '',
            this.addUserCoinToken.mintAddress,
            this.addUserCoinToken.decimals
          )
        } else {
          userAddCoinMintLocalArray = [
            this.userInputCoinName ?? '',
            this.addUserCoinToken.mintAddress,
            this.addUserCoinToken.decimals
          ]
        }
        window.localStorage.user_add_coin_mint = userAddCoinMintLocalArray.join('---')

        this.keyword = this.userInputCoinName ?? ''
      }
      this.$accessor.liquidity.requestInfos()
      this.createTokenList(this.keyword)
      this.findMint(this.keyword)
    },

    async findMint(keyword = '') {
      if (keyword.length > 40) {
        const hasTokenKey = Object.keys(TOKENS).find(
          (item) => TOKENS[item].mintAddress === keyword && TOKENS[item].cache === true
        )
        if (hasTokenKey) {
          this.addUserCoinToken = { ...TOKENS[hasTokenKey], key: hasTokenKey }
          this.addUserCoin = true
        } else {
          try {
            const acc = await this.$web3.getAccountInfo(new PublicKey(keyword))
            if (acc != null) {
              const mint = MINT_LAYOUT.decode(acc.data)
              if (mint.initialized === true && this.tokenList.length === 0) {
                TOKENS[this.keyword + 'userSearch'] = {
                  symbol: 'unknown',
                  name: 'unknown',
                  mintAddress: this.keyword,
                  decimals: mint.decimals,
                  cache: true,
                  tags: []
                }
                this.addUserCoinToken = { ...TOKENS[this.keyword + 'userSearch'], key: this.keyword + 'userSearch' }
                this.addUserCoin = true
              } else {
                this.addUserCoin = false
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
      keyword = keyword.trim()
      let tokenList = []

      let ray = {}
      let nativeSol = cloneDeep(NATIVE_SOL)

      let hasBalance = []
      let noBalance = []

      for (const symbol of Object.keys(TOKENS)) {
        let tokenInfo = cloneDeep(TOKENS[symbol])

        const tokenAccount = this.wallet.tokenAccounts[tokenInfo.mintAddress]

        if (tokenAccount) {
          tokenInfo = { ...tokenInfo, ...tokenAccount, key: symbol }

          if (tokenInfo.symbol === 'RAY') {
            ray = cloneDeep({ ...tokenInfo, key: symbol })
          } else {
            hasBalance.push({ ...tokenInfo, key: symbol })
          }
        } else if (tokenInfo.symbol === 'RAY') {
          ray = cloneDeep({ ...tokenInfo, key: symbol })
        } else {
          noBalance.push({ ...tokenInfo, key: symbol })
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
      const showTagsList: string[] = []
      for (const [itemTagsName, itemTagsValue] of Object.entries(TOKENS_TAGS)) {
        if (itemTagsValue.show) {
          showTagsList.push(itemTagsName)
        }
      }

      const showToken = []
      for (const item of tokenList) {
        const showFlag = item.tags
          ? item.tags.filter((itemTags: string) => (showTagsList.includes(itemTags) ? 1 : null)).length > 0 ||
            item.mintAddress === this.keyword
          : false

        if (showFlag) {
          showToken.push(item)
        }
      }
      this.tokenList = cloneDeep(showToken)
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
.source-manager {
  text-align: center;
  background: transparent;
  border: none;
  width: 100%;
}
.source-manager:hover {
  color: #5ac4be;
}

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
