<template>
  <div class="card">
    <div class="card-body">
      <div v-if="!wallet.connected" class="fc-container">
        <Button size="large" ghost @click="$store.dispatch('wallet/openModal')"> Unlock Wallet </Button>
      </div>
      <Spin v-else :spinning="wallet.loading">
        <Icon slot="indicator" type="loading" style="font-size: 24px" spin />

        <Collapse v-for="info in liquids" :key="info.lp.mintAddress" expand-icon-position="right">
          <CollapsePanel class="liquidity-info" :header="info.lp.symbol">
            <div class="fs-container">
              <div>Pooled:</div>
              <div>≈ {{ info.userCoinBalance.format() }} {{ info.coin.symbol }}</div>
            </div>
            <div class="fs-container">
              <div>Pooled:</div>
              <div>≈ {{ info.userPcBalance.format() }} {{ info.pc.symbol }}</div>
            </div>
            <div class="fs-container">
              <div>Your pool tokens:</div>
              <div>{{ info.userLpBalance.format() }}</div>
            </div>
            <div class="fs-container">
              <div>Your pool share:</div>
              <div>
                ≈ {{ info.percent.isLessThan(0.0001) ? '&lt;0.01' : info.percent.multipliedBy(100).toFixed(2) }}%
              </div>
            </div>
            <Row :gutter="32" class="actions">
              <Col :span="12">
                <Button ghost> Add </Button>
              </Col>
              <Col :span="12">
                <Button ghost> Remove </Button>
              </Col>
            </Row>
          </CollapsePanel>
        </Collapse>
      </Spin>
      <span> If you staked your LP tokens in a farm, unstake them to see them here. </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Button, Collapse, Row, Col, Spin, Icon } from 'ant-design-vue'
import { cloneDeep, get } from 'lodash-es'

import { TokenAmount } from '@/utils/safe-math'

const CollapsePanel = Collapse.Panel

export default Vue.extend({
  components: {
    Button,
    Collapse,
    CollapsePanel,
    Row,
    Col,
    Spin,
    Icon
  },

  data() {
    return {
      loading: false,
      liquids: [] as any
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity'])
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateLiquids(newTokenAccounts)
      },
      deep: true
    }
  },

  mounted() {
    this.updateLiquids(this.wallet.tokenAccounts)
  },

  methods: {
    updateLiquids(tokenAccounts: any) {
      let liquids = [] as any

      for (const [mintAddress, tokenAccount] of Object.entries(tokenAccounts)) {
        const poolInfo = get(this.liquidity.infos, mintAddress)

        if (poolInfo) {
          const lp = cloneDeep(poolInfo.lp)
          const coin = cloneDeep(poolInfo.coin)
          const pc = cloneDeep(poolInfo.pc)

          const userLpBalance = cloneDeep(tokenAccount.balance)
          const lpCoinBalance = cloneDeep(coin.balance)
          const lpPcBalance = cloneDeep(pc.balance)

          const percent = userLpBalance.wei.dividedBy(lp.totalSupply.wei)
          const userCoinBalance = new TokenAmount(lpCoinBalance.wei.multipliedBy(percent), lpCoinBalance.decimals)
          const userPcBalance = new TokenAmount(lpPcBalance.wei.multipliedBy(percent), lpPcBalance.decimals)

          liquids.push({
            lp,
            coin,
            pc,

            userCoinBalance,
            userPcBalance,
            userLpBalance,
            percent
          })
        }
      }

      liquids = liquids
        .filter((liquidity: any) => !liquidity.userLpBalance.wei.isZero())
        .sort((a: any, b: any) => {
          return b.userLpBalance.toEther() - a.userLpBalance.toEther()
        })

      this.liquids = liquids
    }
  }
})
</script>

<style lang="less">
@import '../styles/variables';
.ant-spin-container {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 12px;

  .liquidity-info {
    .ant-collapse-content-box {
      display: grid;
      grid-auto-rows: auto;
      row-gap: 8px;
      font-size: 16px;
      line-height: 24px;

      .actions {
        margin-top: 10px;

        button {
          width: 100%;
        }
      }
    }
  }
}
</style>
