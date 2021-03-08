<template>
  <div class="all_background">
    <Wallet v-show="false" /><Nuxt />
    <!-- <footer>
      <p>1111111111111111111111111111111111111111111111111111111111111111111111111111</p>
    </footer> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style lang="less">
.all_background {
  background: linear-gradient(180deg, rgba(19, 26, 53, 0) 0%, rgba(10, 14, 28, 0.5) 100%),
    linear-gradient(
      120.31deg,
      rgba(90, 196, 190, 0.1) 2.18%,
      rgba(55, 115, 254, 0.1) 49.46%,
      rgba(220, 31, 255, 0.1) 88.86%
    ),
    #131a35;
}
</style>
