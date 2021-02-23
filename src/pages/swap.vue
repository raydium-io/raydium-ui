<template>
  <div class="container">
    <Card>11</Card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { Card } from 'ant-design-vue'

@Component({
  components: {
    Card,
  },
})
export default class Swap extends Vue {}
</script>
