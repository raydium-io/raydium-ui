<template>
  <div class="card">
    <div class="card-body">
      <div v-if="!wallet.connected" class="fc-container">
        <Button size="large" ghost @click="$accessor.wallet.openModal"> Connect Wallet </Button>
      </div>
      <div v-else-if="!wallet.initialized" class="fc-container">
        <Spin :spinning="true">
          <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
        </Spin>
      </div>
      <div v-else class="your-liquidity">
        <CoinModal
          v-if="modalOpening"
          title="Remove Liquidity"
          :coin="lp"
          :loading="removing"
          @onOk="remove"
          @onCancel="cancelRemove"
        />

        <Collapse v-for="info in liquids" :key="info.lp.mintAddress" expand-icon-position="right">
          <CollapsePanel class="liquidity-info">
            <div slot="header" class="lp-icons">
              <div class="icons">
                <CoinIcon :mint-address="info.coin.mintAddress" />
                <CoinIcon :mint-address="info.pc.mintAddress" />
              </div>
              {{ info.lp.symbol }} {{ info.poolInfo.official ? '' : '(Permissionless)' }}
              <Tag v-if="info.poolInfo.version === 2" color="pink">Legacy</Tag>
            </div>
            <div class="fs-container">
              <div>Pooled:</div>
              <div>
                ≈ {{ info.userCoinBalance ? info.userCoinBalance.toEther().toFixed(info.coin.decimals) : '' }}
                {{ info.coin.symbol }}
              </div>
            </div>
            <div class="fs-container">
              <div>Pooled:</div>
              <div>
                ≈ {{ info.userPcBalance ? info.userPcBalance.toEther().toFixed(info.pc.decimals) : '' }}
                {{ info.pc.symbol }}
              </div>
            </div>
            <div class="fs-container">
              <div>Your pool tokens:</div>
              <div>{{ info.userLpBalance ? info.userLpBalance.toEther() : '' }}</div>
            </div>
            <div class="fs-container">
              <div>Your pool share:</div>
              <div>
                ≈ {{ info.percent.isLessThan(0.0001) ? '&lt;0.01' : info.percent.multipliedBy(100).toFixed(2) }}%
              </div>
            </div>
            <Row v-if="[3, 4].includes(info.poolInfo.version)" :gutter="32" class="actions">
              <Col :span="12">
                <Button ghost @click="$emit('onAdd', info.poolInfo.ammId, info.coin.mintAddress, info.pc.mintAddress)">
                  Add
                </Button>
              </Col>
              <Col :span="12">
                <Button ghost @click="openModal(info.poolInfo, info.lp, info.userLpBalance)"> Remove </Button>
              </Col>
            </Row>
            <Row v-else :gutter="32" class="actions">
              <Col :span="24">
                <Button ghost @click="$router.push({ path: '/migrate/' })"> Remove & Migrate </Button>
              </Col>
            </Row>
          </CollapsePanel>
        </Collapse>
      </div>

      <span> If you staked your LP tokens in a farm, unstake them to see them here. </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Button, Collapse, Row, Col, Spin, Icon, Tag } from 'ant-design-vue'
import { cloneDeep, get } from 'lodash-es'

import { TokenAmount } from '@/utils/safe-math'
import { LiquidityPoolInfo } from '@/utils/pools'
import { removeLiquidity } from '@/utils/liquidity'
import { getUnixTs } from '@/utils'

const CollapsePanel = Collapse.Panel

export default Vue.extend({
  components: {
    Button,
    Collapse,
    CollapsePanel,
    Row,
    Col,
    Spin,
    Icon,
    Tag
  },

  data() {
    return {
      liquids: [] as any,

      lp: null,
      poolInfo: null as any,
      modalOpening: false,
      removing: false
    }
  },

  computed: {
    ...mapState(['wallet', 'liquidity', 'url'])
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateLiquids(newTokenAccounts)

        this.updateCurrentLp(newTokenAccounts)
      },
      deep: true
    },
    'liquidity.infos': {
      handler() {
        this.updateLiquids(this.wallet.tokenAccounts)
        this.updateCurrentLp(this.wallet.tokenAccounts)
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
        .filter((liquidity: any) => !liquidity.userLpBalance.isNullOrZero())
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

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const { coin, pc, lp } = this.poolInfo

      const lpAccount = get(this.wallet.tokenAccounts, `${lp.mintAddress}.tokenAccountAddress`)
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${coin.mintAddress}.tokenAccountAddress`)
      const toCoinAccount = get(this.wallet.tokenAccounts, `${pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      removeLiquidity(conn, wallet, this.poolInfo, lpAccount, fromCoinAccount, toCoinAccount, value)
        .then((txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Remove liquidity for ${value} ${lp.name}`

          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Remove liquidity failed',
            description: error.message
          })
        })
        .finally(() => {
          this.removing = false
          this.cancelRemove()
        })
    }
  }
})
</script>

<style lang="less">
@import '../styles/variables';

.your-liquidity {
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

    .lp-icons {
      .icons {
        margin-right: 14px;
      }
    }
  }

  .ant-tag-pink {
    position: absolute;
    right: 24px;
    background: transparent;
    border-color: #eb2f96;
  }
}
</style>
