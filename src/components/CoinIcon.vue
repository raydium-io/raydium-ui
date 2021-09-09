<template>
  <img
    :src="coinPicUrl"
    @error="
      (event) => {
        errorCount++
        getCoinPicUrl()
      }
    "
  />
</template>

<script lang="ts">
import { TOKENS, NATIVE_SOL } from '@/utils/tokens'
import importIcon from '@/utils/import-icon'
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  components: {},
  props: {
    mintAddress: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      coinPicUrl: '',
      coinName: '',
      errorCount: 0
    }
  },
  computed: {
    ...mapState(['liquidity'])
  },
  watch: {
    mintAddress() {
      this.getCoinPicUrl()
    }
  },
  mounted() {
    this.getCoinPicUrl()
  },
  methods: {
    importIcon,
    getCoinPicUrl() {
      let token
      if (this.mintAddress === NATIVE_SOL.mintAddress) {
        token = NATIVE_SOL
      } else {
        token = Object.values(TOKENS).find((item) => item.mintAddress === this.mintAddress)
      }
      if (token) {
        this.coinName = token.symbol.toLowerCase()

        if (this.errorCount === 0) {
          this.coinPicUrl = `https://sdk.raydium.io/icons/${this.mintAddress}.png`
        } else if (token.picUrl && this.errorCount === 1) {
          this.coinPicUrl = token.picUrl
        } else {
          this.coinPicUrl = importIcon(`/coins/${this.coinName}.png`)
        }
      }
    }
  }
})
</script>
