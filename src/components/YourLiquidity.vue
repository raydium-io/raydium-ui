<template>
  <div class="card">
    <div class="card-body">
      <div v-if="!wallet.connected" class="fc-container">
        <Button size="large" ghost @click="$store.dispatch('wallet/openModal')"> Unlock Wallet </Button>
      </div>
      <Spin v-else :spinning="wallet.loading">
        <CoinModal
          v-if="modalOpening"
          title="Remove Liquidity"
          :coin="lp"
          :loading="removing"
          @onOk="remove"
          @onCancel="cancelRemove"
        />

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
                <Button ghost @click="openModal(info.poolInfo, info.lp, info.userLpBalance)"> Remove </Button>
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
import { LiquidityPoolInfo } from '@/utils/pools'
import { removeLiquidity } from '@/utils/liquidity'

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
      liquids: [] as any,

      modalOpening: false,
      lp: null,
      poolInfo: null as any,
      removing: false
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity'])
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateLiquids(newTokenAccounts)

        this.updateCurrentLp(newTokenAccounts)
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

          const userLpBalance = cloneDeep((tokenAccount as any).balance)
          const lpCoinBalance = cloneDeep(coin.balance)
          const lpPcBalance = cloneDeep(pc.balance)

          const percent = userLpBalance.wei.dividedBy(lp.totalSupply.wei)
          const userCoinBalance = new TokenAmount(lpCoinBalance.wei.multipliedBy(percent), lpCoinBalance.decimals)
          const userPcBalance = new TokenAmount(lpPcBalance.wei.multipliedBy(percent), lpPcBalance.decimals)

          liquids.push({
            poolInfo,
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
    },

    openModal(poolInfo: LiquidityPoolInfo, lp: any, lpBalance: any) {
      const coin = cloneDeep(lp)
      coin.balance = lpBalance

      this.lp = coin
      this.poolInfo = cloneDeep(poolInfo)
      this.modalOpening = true
    },

    // 更新正在移除流动性的币种余额
    updateCurrentLp(newTokenAccounts: any) {
      if (this.lp && this.poolInfo) {
        // @ts-ignore
        const poolInfo = get(this.liquidity.infos, this.lp.mintAddress)
        const lp = cloneDeep(poolInfo.lp)

        const lpBalance = get(newTokenAccounts, `${lp.mintAddress}.balance`)
        lp.balance = lpBalance

        this.lp = lp
        this.poolInfo = cloneDeep(poolInfo)
      }
    },

    cancelRemove() {
      this.lp = null
      this.poolInfo = null
      this.modalOpening = false
    },

    remove(value: string) {
      this.removing = true

      const conn = (this as any).$conn
      const wallet = (this as any).$wallet

      const { coin, pc, lp } = this.poolInfo

      const lpAccount = get(this.wallet.tokenAccounts, `${lp.mintAddress}.tokenAccountAddress`)
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${coin.mintAddress}.tokenAccountAddress`)
      const toCoinAccount = get(this.wallet.tokenAccounts, `${pc.mintAddress}.tokenAccountAddress`)

      removeLiquidity(conn, wallet, this.poolInfo, lpAccount, fromCoinAccount, toCoinAccount, value)
        .then((txid) => {
          console.log(txid)
          this.$store.dispatch('transaction/sub', txid)
        })
        .catch((error) => {
          ;(this as any).$notify.error({
            message: 'Add liquidity failed',
            description: error.message
          })
        })
        .finally(() => {
          this.removing = false
        })
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
