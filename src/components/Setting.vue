<template>
  <Modal
    title="Settings"
    :visible="setting.show"
    :footer="null"
    centered
    @cancel="$store.dispatch('setting/close')"
  >
    <div class="slippage">
      <h3>Slippage tolerance</h3>
      <Row class="slippage-setting" :gutter="30">
        <Col :span="6">
          <button>0.1%</button>
        </Col>
        <Col :span="6">
          <button>0.5%</button>
        </Col>
        <Col :span="6">
          <button>1%</button>
        </Col>
        <Col :span="6">
          <Input size="large" suffix="%" />
        </Col>
      </Row>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Modal, Row, Col, Input } from 'ant-design-vue'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Row,
    Col,
    Input,
  },

  computed: {
    ...mapState(['setting']),
  },
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.slippage {
  h3 {
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    color: @text-color;
  }

  .slippage-setting {
    display: flex;
    align-items: center;
    flex-direction: row;

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      background-color: @bg-color;
      color: @text-color;
      padding: 10px 12px;
      border: 0;
      border-radius: 4px;
      font-size: 12px;
      line-height: 20px;
      font-weight: 600;
      cursor: pointer;
      opacity: 1;

      &:active,
      &:focus,
      &:hover {
        background-color: @primary-color;
        outline: 0;
      }
    }
  }
}
</style>

<style lang="less">
@import '../styles/variables';

.ant-input-affix-wrapper {
  input {
    background-color: @bg-color;
    text-align: center !important;
    font-size: 12px;
    line-height: 20px;
    font-weight: 600;
  }
}
</style>
