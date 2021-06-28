<template>
  <img
    v-if="coinPicUrl"
    :src="coinPicUrl"
    @error="
      (event) => {
        event.path[0].src = importIcon(`/coins/${coinName}.png`)
      }
    "
  />
  <img v-else :src="importIcon(`/coins/${coinName}.png`)" />
</template>

<script lang="ts">
import { TOKENS } from '@/utils/tokens'
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
      coinName: ''
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
      const token = Object.values(TOKENS).find((item) => item.mintAddress === this.mintAddress)
      console.log(this.mintAddress, token)
      if (token) {
        this.coinName = token.symbol.toLowerCase()
        if (token.picUrl) {
          this.coinPicUrl = token.picUrl
        } else {
          this.coinPicUrl = ''
        }
      }
    }
  }
})
</script>
