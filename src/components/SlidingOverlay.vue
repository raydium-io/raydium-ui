<template>
  <div class="sliding_card_warper" v-bind:class="{ active_card: isActive }">
            <div class="sliding_card_switch" v-on:click="isActive = !isActive"></div>
            <div class="sliding_card_inner borrow_account_status_wrapper">
                <h2>Margin Account</h2>
                <div class="account-status-list">
                    <p>Assets</p>
                    <span>${{assets}}</span>
                </div>
                <div class="account-status-list">
                    <p>Margin available</p>
                    <span>${{usdcLeftToBorrow}}</span>
                </div>
                <div class="account-status-list">
                    <p>Leverage</p>
                    <span>{{leverage}}x</span>
                </div>
                <div class="progress-bar-wrapper">
                    <p>Health</p>
                    <Progress :percent="percent"/>
                </div>
                <!-- <Collapse 
                    defaultActiveKey="1"
                    expandIcon={({ isActive }) => <CaretDownOutlined rotate={isActive ? 180 : 0} />}
                    class="site-collapse-custom-collapse"
                    ghost
                >
                    <Panel header={
                        <div class={'sliding-card-panel-head'}>
                            <h4><div class="state-img" style={{'background': '#d27800'}}></div>USDC</h4>
                            <span>500$</span>
                        </div>
                    } key="1">
                    <table class="sliding-card-table">
                            <tr>
                                <th>Token</th>
                                <th>Amount</th>
                                <th>Value</th>
                            </tr>
                            <tr>
                                <td>SRM</td>
                                <td>11</td>
                                <td>$33</td>
                            </tr>
                            <tr>
                                <td>FTT</td>
                                <td>122</td>
                                <td>$2000</td>
                            </tr>
                    </table>
                    </Panel>
                    <Panel header={
                        <div class={'sliding-card-panel-head'}>
                            <h4><div class="state-img" style={{'background': '#2671C4'}}></div>RAY</h4>
                            <span>223$</span>
                        </div>
                    } key="2">
                        <table class="sliding-card-table">
                            <tr>
                                <th>Token</th>
                                <th>Amount</th>
                                <th>Value</th>
                            </tr>
                            <tr>
                                <td>SRM</td>
                                <td>11</td>
                                <td>$33</td>
                            </tr>
                            <tr>
                                <td>FTT</td>
                                <td>122</td>
                                <td>$2000</td>
                            </tr>
                        </table>
                    </Panel>
                    <Panel header={
                        <div class={'sliding-card-panel-head'}>
                            <h4><div class="state-img" style={{'background': '#00B65B'}}></div>IVN</h4>
                            <span>392$</span>
                        </div>
                    } key="3">
                    <table class="sliding-card-table">
                            <tr>
                                <th>Token</th>
                                <th>Amount</th>
                                <th>Value</th>
                            </tr>
                            <tr>
                                <td>SRM</td>
                                <td>11</td>
                                <td>$33</td>
                            </tr>
                            <tr>
                                <td>FTT</td>
                                <td>122</td>
                                <td>$2000</td>
                            </tr>
                        </table>
                    </Panel>
                </Collapse> -->
                <button class="sliding-card-btn">Get 200$ Faucet</button>
            </div>
        </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import { Progress, } from 'ant-design-vue'
// import 'ant-design-vue/dist/antd.css';

import { Progress } from 'ant-design-vue';
Vue.use(Progress);

export default Vue.extend({
  components: {
    Progress
  },
  data() {
    return {
      isActive : true,
      assets : 2000,
      percent: 90,
      usdcLeftToBorrow: 500,
      leverage: 1.4
    }
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    liquidityList: {
      // type: List,
      default: []
    },
    userClose: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.select-token {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 14px;

  .token-list {
    max-height: 60vh;
    padding-right: 10px;
    overflow: auto;
    direction: ltr;
    will-change: transform;

    .token-info {
      width: 100%;
      justify-content: space-between;
      padding: 4px 0;
      cursor: pointer;
      opacity: 1;
      height: 70px;
      &:hover,
      &:active {
        background: rgb(107, 128, 185);
      }
    }

    .token-info[disabled] {
      cursor: not-allowed;
      // pointer-events: none;
      opacity: 0.5;
    }
  }
}


.sliding_card_warper {
  width: 316px;

  /* height: 100%; */
  position: fixed;
  display: flex;
  align-items: center;
  top: 0;
  left: 0;
  padding: 15% 0;
  z-index: 99;
  transition: all ease-in-out 0.4s;
}

.sliding_card_warper.active_card {
  left: -316px;
}

.sliding_card_switch {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 46px;
  height: 78.43px;
  left: 316px;
  top: calc(50% - 22px);
  background: radial-gradient(
    166.67% 155% at -84.31% -26.5%,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  border: 1px solid rgba(204, 204, 204, 0.24);
  border-left: none;
  box-shadow: inset -5px -5px 250px rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);

  /* Note: backdrop-filter has minimal browser support */
  border-radius: 0 14px 14px 0;
  z-index: 9;
}

.sliding_card_inner {
  width: 316px;
  max-height: 660px;
  height: 100%;
  background: radial-gradient(
    100% 100% at 0% 0%,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  border: 1px solid rgba(204, 204, 204, 0.24);
  box-shadow: inset -5px -5px 250px rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border-radius: 0 21px 21px 0;
  padding: 25px 28px;
  overflow-y: auto;
}

.sliding_card_inner h2 {
  color: #fff;
  font-weight: 600;
  font-size: 20px;
  padding-bottom: 13px;
  margin: 0 -28px;
  text-align: center;
  border-bottom: 1px solid rgba(204, 204, 204, 0.24);
}

.sliding_card_inner .account-status-list,
.sliding_card_inner .sliding-card-panel-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  border-bottom: 1px solid rgba(117, 117, 117, 0.15);
  padding: 10px 0;
}

.sliding_card_inner .account-status-list p,
.sliding_card_inner .sliding-card-panel-head p {
  font-family: 'Maven Pro', sans-serif !important;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  margin-bottom: 0;
}

.sliding_card_inner .account-status-list span,
.sliding_card_inner .sliding-card-panel-head span {
  font-family: 'Exo 2',  sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
}

.sliding_card_inner .sliding-card-panel-head {
  padding: 0;
  padding-right: 28px;
  border-bottom: none;
}

.sliding_card_inner .account-status-list:first-child,
.sliding_card_inner .sliding-card-panel-head:first-child {
  padding-top: 0;
}

.sliding_card_inner .account-status-list.leverage,
.sliding_card_inner .sliding-card-panel-head.leverage {
  border-bottom: none;
}

.sliding_card_inner .progress-bar-wrapper {
  margin-bottom: 30px;
  padding-top: 10px;
}

.sliding_card_inner .progress-bar-wrapper p {
  margin-bottom: 8px;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  color: #fff;
}

.sliding_card_inner .ant-progress-inner {
  background-color: #25303b;
  height: 15px;
}

.ant-progress-bg .ant-progress-bg {
  background-color: #369126 !important;
  height: 15px !important;
}

.sliding_card_inner .ant-progress-inner .ant-progress-bg {
  background-color: #369126 !important;
  height: 15px !important;
}

.sliding_card_inner .sliding-card-btn {
  background: linear-gradient(90.33deg, #52c33d -97.42%, #2b7d1c 146.99%);
  border-radius: 10px;
  width: 100%;
  border: 0;
  color: white;
  font-weight: 700;
  font-size: 18px;
  height: 58px;
  cursor: pointer;
}

.sliding_card_inner
  .ant-collapse
  > .ant-collapse-item
  > .ant-collapse-header
  .ant-collapse-arrow {
  color: #40a42e;
  position: absolute;
  right: 2px;
  top: 12px;
  font-size: 15px;
}


.sliding_card_inner .sliding-card-panel-head .state-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 40px;
}

.sliding_card_inner .sliding-card-panel-head h4 {
  position: relative;
  padding-left: 30px;
  color: #fff;
  margin-bottom: 0;
}

.sliding_card_inner .sliding-card-panel-head span {
  font-size: 14px;
  font-weight: 400;
}

.sliding_card_inner .ant-collapse > .ant-collapse-item > .ant-collapse-header {
  padding: 7px 8px;
}

.sliding_card_inner .ant-collapse-item {
  background: radial-gradient(
    100% 100% at 0% 0%,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  border: 1px solid rgba(204, 204, 204, 0.24) !important;
  box-shadow: inset -5px -5px 250px rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border-radius: 19px !important;
  margin-bottom: 18px;
}

.sliding_card_inner .sliding-card-table {
  width: 100%;
  border-top: 1px solid rgba(117, 117, 117, 0.15);
}

.sliding_card_inner .sliding-card-table tr th {
  color: #fff;
  padding-top: 8px;
}

.sliding_card_inner .sliding-card-table tr td {
  color: #fff;
  text-align: center;
}

</style>
