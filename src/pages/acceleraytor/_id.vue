<template>
  <div class="accele-raytor-project container">
    <Row>
      <Col :span="isMobile ? 24 : 16" class="preview">
        <div class="fs-container">
          <div class="fc-container">
            <img :src="importIcon(`/coins/${pool.base.symbol.toLowerCase()}.png`)" />
            <span class="symbol">{{ pool.base.symbol }}</span>
          </div>
          <div>
            <span class="access">
              <span v-if="pool.isRayPool" class="ray">
                <span>RAY Pool</span>
              </span>
              <span v-else class="community"><span>Community Pool</span></span>
            </span>
            <span class="status">
              <span v-if="pool.info.endTime < getUnixTs() / 1000" class="ended"> Ended </span>
              <span v-else-if="pool.info.startTime < getUnixTs() / 1000" class="open"> Open </span>
              <span v-else class="upcoming"> Upcoming </span>
            </span>
          </div>
        </div>
        <hr />
        <div class="fs-container">
          <div class="state">
            <span class="value"> {{ pool.raise.format() }} {{ pool.base.symbol }} </span>
            <span class="desc"> Total raise </span>
          </div>
          <div class="state">
            <span class="value"> {{ pool.price.toEther() }} {{ pool.quote.symbol }} </span>
            <span class="desc"> Per {{ pool.base.symbol }} </span>
          </div>
          <div class="state">
            <span class="value"> {{ pool.info.minDepositLimit.format() }} {{ pool.quote.symbol }}</span>
            <span class="desc"> Min. allocation </span>
          </div>
          <div class="state">
            <span class="value"> {{ pool.info.maxDepositLimit.format() }} {{ pool.quote.symbol }}</span>
            <span class="desc"> Max. allocation </span>
          </div>
        </div>
        <Progress
          :percent="
            pool.info.quoteTokenDeposited
              .toEther()
              .dividedBy(pool.raise.toEther().multipliedBy(pool.price.toEther()))
              .multipliedBy(100)
              .toNumber()
          "
          status="active"
        >
          <span slot="format">
            {{
              pool.info.quoteTokenDeposited
                .toEther()
                .dividedBy(pool.raise.toEther().multipliedBy(pool.price.toEther()))
                .multipliedBy(100)
                .toNumber()
            }}%
          </span>
        </Progress>
        <hr />
        <div class="fs-container">
          <div class="state">
            <span class="value">
              {{ pool.userInfo && pool.userInfo.deposited ? pool.userInfo.deposited.format() : 0 }}
              {{ pool.quote.symbol }}
            </span>
            <span class="desc"> Your deposit </span>
          </div>
          <div class="state">
            <span class="value">
              {{
                pool.userInfo && pool.userInfo.deposited
                  ? pool.userInfo.deposited.wei
                      .dividedBy(pool.info.quoteTokenDeposited.wei)
                      .multipliedBy(100)
                      .toFixed(2)
                  : 0
              }}%
            </span>
            <span class="desc"> Your share </span>
          </div>
          <div class="state">
            <span class="value">
              {{
                pool.userInfo && pool.userInfo.deposited
                  ? gt(pool.info.quoteTokenDeposited.wei, pool.raise.wei.multipliedBy(pool.price.toEther()))
                    ? new TokenAmount(
                        pool.userInfo.deposited.wei
                          .dividedBy(pool.info.quoteTokenDeposited.wei)
                          .multipliedBy(pool.raise.wei),
                        pool.base.decimals
                      ).format()
                    : pool.userInfo.deposited.wei.dividedBy(pool.price.wei).toNumber()
                  : 0
              }}
              {{ pool.base.symbol }}
            </span>
            <span class="desc"> Your allocation </span>
          </div>
        </div>
      </Col>
      <Col :span="isMobile ? 24 : 8" class="purchase">
        <div class="fs-container">
          <span class="title">Join Pool</span>
          <div class="min-max fc-container">
            <div @click="value = pool.info.minDepositLimit.fixed()">MIN</div>
            <div @click="value = pool.info.maxDepositLimit.fixed()">MAX</div>
          </div>
        </div>
        <div v-if="pool.info.endTime > getUnixTs() / 1000" class="deposit">
          <div class="label fs-container">
            <span>Deposit</span>
            <span>
              {{ void (tokenAccount = safeGet(wallet.tokenAccounts, pool.quote.mintAddress)) }}
              Balance: {{ wallet.connected ? (tokenAccount ? tokenAccount.balance.fixed() : '0') : '--' }}
            </span>
          </div>
          <div class="input fs-container">
            <input
              v-model="value"
              inputmode="decimal"
              autocomplete="off"
              autocorrect="off"
              placeholder="0.00"
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              minlength="1"
              maxlength="79"
              spellcheck="false"
            />
            <div class="icon fc-container">
              <img :src="importIcon(`/coins/${pool.quote.symbol.toLowerCase()}.png`)" />
              <span>{{ pool.quote.symbol }}</span>
            </div>
          </div>
        </div>
        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
        </Button>
        <Button v-else-if="pool.info.startTime > getUnixTs() / 1000" size="large" ghost disabled> Upcoming </Button>
        <Button
          v-else-if="pool.info.endTime < getUnixTs() / 1000 && pool.info.startWithdrawTime > getUnixTs() / 1000"
          size="large"
          ghost
          disabled
          style="font-size: 13px"
        >
          Claim after {{ $dayjs(pool.info.startWithdrawTime * 1000) }}
        </Button>
        <Button
          v-else-if="pool.info.endTime < getUnixTs() / 1000"
          size="large"
          ghost
          :loading="purchasing"
          :disabled="purchasing"
          @click="withdraw"
        >
          Claim
        </Button>
        <Button v-else-if="(!pool.userInfo || !pool.userInfo.snapshoted) && pool.isRayPool" size="large" ghost disabled>
          Wallet not eligible for this pool
        </Button>
        <Button
          v-else-if="pool.info.startTime < getUnixTs() / 1000"
          size="large"
          ghost
          :loading="purchasing"
          :disabled="
            !value ||
            lt(value, pool.info.minDepositLimit.toEther()) ||
            gt(value, pool.info.maxDepositLimit.toEther()) ||
            gt(value, tokenAccount ? tokenAccount.balance.fixed() : '0') ||
            purchasing
          "
          @click="deposit"
        >
          <template v-if="!value"> Enter an amount </template>
          <template v-else-if="lt(value, pool.info.minDepositLimit.toEther())">
            Min. allocation is {{ pool.info.minDepositLimit.toEther() }} {{ pool.quote.symbol }}
          </template>
          <template v-else-if="gt(value, pool.info.maxDepositLimit.toEther())">
            Max. allocation is {{ pool.info.maxDepositLimit.toEther() }} {{ pool.quote.symbol }}
          </template>
          <template v-else-if="gt(value, tokenAccount ? tokenAccount.balance.fixed() : '0')">
            Insufficient {{ pool.quote.symbol }} balance
          </template>
          <template v-else>Join pool</template>
        </Button>
        <Button v-else size="large" ghost disabled> Upcoming Pool </Button>
        <hr />
        <Alert
          :description="`${pool.quote.symbol} can't be withdrawn after joining. Tokens can be claimed after ${$dayjs(
            pool.info.startWithdrawTime * 1000
          ).toString()}`"
          type="warning"
          show-icon
          banner
        />
      </Col>
    </Row>

    <div class="page-head fs-container">
      <span class="title">Project details</span>
    </div>
    <Row class="project-details" :gutter="32">
      <Col :span="isMobile ? 24 : 12">
        <div class="flex">
          <a v-for="(link, key) in pool.base.docs" :key="key" class="link" :href="link" target="_blank">{{ key }}</a>
          <a class="link" :href="`${url.explorer}/address/${pool.base.mintAddress}`" target="_blank">Solana Explorer</a>
        </div>
        <p class="details">{{ pool.base.details }}</p>
        <div class="flex">
          <a v-for="(link, key) in pool.base.socials" :key="key" class="icon-link" :href="link" target="_blank">
            <img :src="importIcon(`/icons/${key.toLowerCase()}.svg`)" />
          </a>
        </div>
      </Col>
      <Col :span="isMobile ? 24 : 12">
        <Tabs>
          <TabPane key="pool" tab="Pool information">
            <div class="infos flex">
              <span class="key">Pool opens</span>
              <span class="text">{{ $dayjs(pool.info.startTime * 1000) }}</span>
            </div>
            <div class="infos flex">
              <span class="key">Pool closes</span>
              <span class="text">{{ $dayjs(pool.info.endTime * 1000) }}</span>
            </div>
            <div class="infos flex">
              <span class="key">Total raise</span>
              <span class="text">{{ pool.raise.format() }} {{ pool.base.symbol }} </span>
            </div>
            <div class="infos flex">
              <span class="key">Price</span>
              <span class="text">{{ pool.price.toEther() }} {{ pool.quote.symbol }}</span>
            </div>
            <div class="infos flex">
              <span class="key">Min. purchase limit</span>
              <span class="text"> {{ pool.info.minDepositLimit.format() }} {{ pool.quote.symbol }}</span>
            </div>
            <div class="infos flex">
              <span class="key">Max. purchase limit</span>
              <span class="text"> {{ pool.info.maxDepositLimit.format() }} {{ pool.quote.symbol }}</span>
            </div>
            <div class="infos flex">
              <span class="key">Access type</span>
              <span class="text">
                <span class="access">
                  <span v-if="pool.isRayPool" class="ray">
                    <span>RAY Pool</span>
                  </span>
                  <span v-else class="community"><span>Community Pool</span></span>
                </span>
              </span>
            </div>
            <div class="infos flex">
              <span class="key">Requirements to join</span>
              <span class="text">
                {{ pool.isRayPool ? `${pool.info.minStakeLimit.format()} RAY staked` : 'No limit' }}
              </span>
            </div>
            <div class="infos flex">
              <span class="key">RAY staking deadline</span>
              <span class="text">
                {{ $dayjs((pool.info.startTime - 3600 * 24 * 7) * 1000) }}
              </span>
            </div>
          </TabPane>
          <TabPane key="token" tab="Token information">
            <div class="infos flex">
              <span class="key">Name</span>
              <span class="text">{{ pool.base.name }}</span>
            </div>
            <div class="infos flex">
              <span class="key">Symbol</span>
              <span class="text">{{ pool.base.symbol }}</span>
            </div>
            <div class="infos flex">
              <span class="key">Decimals</span>
              <span class="text">{{ pool.base.decimals }}</span>
            </div>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'

import { Row, Col, Progress, Button, Alert, Tabs } from 'ant-design-vue'
import { get as safeGet } from 'lodash-es'

import { getUnixTs } from '@/utils'
import importIcon from '@/utils/import-icon'
import { TokenAmount, gt, lt } from '@/utils/safe-math'
import { IdoPool, purchase, claim } from '@/utils/ido'

const { TabPane } = Tabs

@Component({
  head: {
    title: 'Raydium AcceleRaytor'
  },

  components: {
    Row,
    Col,
    Progress,
    Button,
    Alert,
    Tabs,
    TabPane
  },

  async asyncData({ $accessor, params, error }) {
    if (!$accessor.ido.initialized) {
      await $accessor.ido.requestInfos()
    }
    const { id } = params
    const pool = $accessor.ido.pools.find((pool) => pool.idoId === id)

    if (pool) {
      return { pool }
    } else {
      error({ statusCode: 404, message: 'Project not found' })
    }
  }
})
export default class AcceleRaytor extends Vue {
  value = ''
  pool = {} as IdoPool
  purchasing = false

  @Watch('$accessor.ido.pools', { immediate: true, deep: true })
  onIdoPoolsChanged(pools: any) {
    const { idoId } = this.pool
    const pool = pools.find((pool: any) => pool.idoId === idoId)
    if (pool) {
      this.pool = pool
    }
  }

  get isMobile() {
    return this.$accessor.isMobile
  }

  get wallet() {
    return this.$accessor.wallet
  }

  get farm() {
    return this.$accessor.farm
  }

  get ido() {
    return this.$accessor.ido
  }

  get url() {
    return this.$accessor.url
  }

  safeGet = safeGet
  getUnixTs = getUnixTs
  importIcon = importIcon
  TokenAmount = TokenAmount
  gt = gt
  lt = lt

  deposit() {
    this.purchasing = true

    const conn = this.$web3
    const wallet = (this as any).$wallet

    const userQuoteTokenAccount = safeGet(
      this.wallet.tokenAccounts,
      `${this.pool.quote.mintAddress}.tokenAccountAddress`
    )
    const stakeInfoAccount = safeGet(
      this.farm.stakeAccounts,
      '4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW.stakeAccountAddress'
    )

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })

    purchase(conn, wallet, this.pool, userQuoteTokenAccount, stakeInfoAccount, this.value)
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

        const description = `Join ${this.pool.base.symbol} pool`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Join pool failed',
          description: error.message
        })
      })
      .finally(() => {
        this.purchasing = false
      })
  }

  withdraw() {
    this.purchasing = true

    const conn = this.$web3
    const wallet = (this as any).$wallet

    const userQuoteTokenAccount = safeGet(
      this.wallet.tokenAccounts,
      `${this.pool.quote.mintAddress}.tokenAccountAddress`
    )
    const userBaseTokenAccount = safeGet(this.wallet.tokenAccounts, `${this.pool.base.mintAddress}.tokenAccountAddress`)

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })

    claim(conn, wallet, this.pool, userBaseTokenAccount, userQuoteTokenAccount)
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

        const description = `Claim`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Claim failed',
          description: error.message
        })
      })
      .finally(() => {
        this.purchasing = false
      })
  }
}
</script>

<style lang="less" scoped>
.accele-raytor-project.container {
  max-width: 1200px;
}

hr {
  margin: 20px 0;
  border: 1px solid rgba(55, 114, 255, 0.2);
}

.preview {
  min-height: 390px;
  padding: 40px;
  background: #0f1429;
  border-radius: 32px 0 0 32px;

  img {
    width: 48px;
    height: 48px;
  }

  .symbol {
    margin-left: 16px;
    font-weight: 600;
    font-size: 24px;
    line-height: 34px;
  }

  .status {
    margin-left: 16px;

    .upcoming,
    .open,
    .ended {
      padding: 4px 14px;
      border-radius: 16px;
    }

    .upcoming {
      background: rgba(90, 196, 190, 0.2);
      border: 1px solid #5ac4be;
    }

    .open {
      background: rgba(90, 196, 190, 0.2);
      border: 1px solid #5ac4be;
    }

    .ended {
      background: rgba(194, 0, 251, 0.2);
      border: 1px solid #c200fb;
    }
  }

  .state {
    display: flex;
    flex-direction: column;

    .value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
    }

    .desc {
      color: rgba(241, 241, 242, 0.75);
      font-size: 12px;
      line-height: 22px;
    }
  }
}

.access {
  .community,
  .ray {
    padding: 5px 1px;
    border-radius: 16px;

    span {
      padding: 4px 14px;
      border-radius: 16px;
    }
  }

  .community {
    background: #364371;
  }

  .ray {
    background: linear-gradient(245.22deg, #c200fb 7.97%, #3772ff 49.17%, #3773fe 49.17%, #5ac4be 92.1%);

    span {
      background: #1c274f;
      opacity: 0.9;
    }
  }
}

.project-details {
  .link,
  .icon-link {
    background: rgba(241, 241, 242, 0.1);
    border-radius: 4px;
    color: #f1f1f2;
    text-transform: uppercase;
  }

  .link {
    padding: 6px 16px;
  }

  .icon-link {
    padding: 8px;
    img {
      width: 20px;
      height: 20px;
    }
  }

  .link:not(:first-child),
  .icon-link:not(:first-child) {
    margin-left: 20px;
  }

  .details {
    margin-top: 24px;
    font-size: 16px;
    line-height: 24px;
    color: #f1f1f2;
    white-space: pre-line;
  }

  .infos {
    padding: 24px;
    background: #1c274f;

    .key,
    .text {
      width: 50%;
    }

    .key {
      font-weight: 600;
    }
  }

  .infos:not(:first-child) {
    border-top: 1px solid #364371;
  }
}

.purchase {
  min-height: 390px;
  padding: 40px;
  background: linear-gradient(221.5deg, rgba(194, 0, 251, 0.1) 16.15%, rgba(194, 0, 251, 0) 84.46%),
    radial-gradient(
      53.22% 53.22% at 93.67% 75.22%,
      rgba(194, 0, 251, 0.1) 0%,
      rgba(90, 196, 190, 0.1) 55.21%,
      rgba(55, 114, 255, 0.1) 100%
    ),
    #131a35;
  border-radius: 0 32px 32px 0;

  .title {
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  .min-max {
    div {
      padding: 4px 16px;
      background: rgba(90, 196, 190, 0.1);
      border-radius: 4px;
      cursor: pointer;
    }

    div:not(:first-child) {
      margin-left: 8px;
    }
  }

  .deposit {
    margin-top: 24px;
    padding: 16px;
    border: 1px solid rgba(241, 241, 242, 0.75);
    border-radius: 4px;

    .label {
      font-size: 12px;
      line-height: 20px;
      color: #f1f1f2;
      opacity: 0.5;
    }

    .input {
      margin-top: 8px;
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;

      input {
        width: 0;
        padding: 0;
        border: none;
        background-color: transparent;
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:active,
        &:focus,
        &:hover {
          outline: 0;
        }
      }

      input[disabled] {
        cursor: not-allowed;
      }

      .icon {
        img {
          margin-right: 8px;
          width: 24px;
          height: 24px;
        }
      }
    }
  }

  button {
    margin-top: 24px;
    width: 100%;
  }
}
</style>

<style lang="less">
.ant-progress {
  margin-top: 20px;
}

.ant-progress-outer {
  margin-right: 0 !important;
  padding-right: 0 !important;
}

.ant-progress-text {
  margin: 0;
  width: 100%;
  text-align: right;
  color: #f1f1f2;
}

.ant-alert-warning {
  padding: 0 0 0 22px;
  background: transparent;

  .ant-alert-icon {
    top: 3px;
    left: 0;
    font-size: 14px;
    color: #f1f1f2bf;
  }

  .ant-alert-description {
    color: #f1f1f2bf;
  }
}

.ant-tabs-bar {
  margin: 0;
}

.ant-tabs-nav {
  width: 100%;
  background: #0f1429;
}

.ant-tabs-nav .ant-tabs-tab {
  width: 50%;
  margin: 0;
  text-align: center;
}
</style>
