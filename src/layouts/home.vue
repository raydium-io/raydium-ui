<template>
  <div class="home-container-background">
    <Nuxt />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({})
export default class Home extends Vue {}
</script>

<style lang="less">
.home-container-background {
  background-color: #141041;
  background-image: url('../assets/background/index_page_background.webp');
  background-size: 100% 95%;
  background-repeat: no-repeat;
  display: flow-root;
}
</style>
