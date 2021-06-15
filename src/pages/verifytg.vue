<template>
  <div class="container">
    <div class="page-head fs-container">
      <span class="title">Verify Telegram Username</span>
    </div>

    <div class="card">
      <div class="card-body">
        <Row>
          <Col :span="16"><input v-model="userInputName" placeholder="Please enter an account" class="inputName" /></Col
          ><Col :span="8"><Button ghost style="width: 100%" @click="startVerify">Confirm</Button></Col>
        </Row>
        <div>{{ verifyValue }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Button, Row, Col } from 'ant-design-vue'

export default Vue.extend({
  components: {
    Button,
    Row,
    Col
  },

  data() {
    return {
      userInputName: '',
      verifyValue: ''
    }
  },

  head: {
    title: 'Raydium Verifytg'
  },

  methods: {
    startVerify() {
      if (this.userInputName.length === 0) {
        this.verifyValue = 'please input name'
        return
      }
      this.verifyValue = 'loading'
      this.$axios.get('https://api.raydium.io/verifytg', { params: { s: this.userInputName } }).then((data) => {
        // @ts-ignore
        this.verifyValue = data.msg
      })
    }
  }
})
</script>

<style lang="less" sxcoped>
.container {
  max-width: 450px;
}
.inputName {
  width: 80%;
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 2px solid #ccc;
  line-height: 30px;
}
</style>
