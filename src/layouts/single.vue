<template>
  <div class="all-background">
    <Nuxt />
    <div
      style="
        height: 1px;
        background: linear-gradient(90deg, rgba(90, 196, 190, 0) 0%, #3772ff 50%, rgba(194, 0, 251, 0) 100%);
      "
    />
    <Foot />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({})
export default class Single extends Vue {}
</script>

<style lang="less">
.all-background {
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
