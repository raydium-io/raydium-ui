<template>
  <div class="home-container-background">
    <Nuxt />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({})
export default class Single extends Vue {}
</script>

<style lang="less">
.home-container-background {
  // background: left / cover url('../assets/background/index_page_background.svg'), linear-gradient(#131a35, #131a35);
  background: url('../assets/background/index_page_background.svg'), #131a35;
  background-position: left top;
  background-size: 100%;
  display: flow-root;
}
</style>
