<template>
  <div class="accele-raytor-project container">
    <Row class="top-box">
      <Col :span="isMobile ? 24 : 16" :class="`preview ${pool.version === 3 ? 'lottery' : ''}`">
        <div class="fs-container">
          <div class="fc-container">
            <CoinIcon :mint-address="pool.base.mintAddress" />
            <span class="symbol">{{ pool.base.symbol }}</span>
          </div>
          <div>
            <span class="access">
              <span v-if="pool.isPrivate" class="community">
                <span>Private Pool</span>
              </span>
              <span v-else-if="pool.isRayPool" class="ray">
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
            <span class="desc"> Total Raise </span>
          </div>
          <div class="state">
            <span class="value"> {{ pool.price.toEther() }} {{ pool.quote.symbol }} </span>
            <span class="desc"> Per {{ pool.base.symbol }} </span>
          </div>
          <template v-if="pool.version === 3">
            <div class="state">
              <span class="value"> {{ pool.info.perLotteryWorthQuoteAmount.format() }} {{ pool.quote.symbol }}</span>
              <span class="desc"> Allocation Per Winning Ticket </span>
            </div>
            <div class="state">
              <span class="value"> {{ pool.info.currentLotteryNumber }} Tickets</span>
              <span class="desc"> Total Tickets Deposited</span>
            </div>
          </template>
          <template v-else>
            <div class="state">
              <span class="value"> {{ pool.info.minDepositLimit.format() }} {{ pool.quote.symbol }}</span>
              <span class="desc"> Min. allocation </span>
            </div>
            <div class="state">
              <span class="value"> {{ pool.info.maxDepositLimit.format() }} {{ pool.quote.symbol }}</span>
              <span class="desc"> Max. allocation </span>
            </div>
          </template>
        </div>
        <Progress
          v-if="pool.version === 3"
          :percent="(pool.info.currentLotteryNumber / pool.info.totalWinLotteryLimit) * 100"
          status="active"
        >
          <span slot="format"> {{ (pool.info.currentLotteryNumber / pool.info.totalWinLotteryLimit) * 100 }}% </span>
        </Progress>
        <Progress
          v-else
          :percent="
            pool.info.quoteTokenDeposited
              ? pool.info.quoteTokenDeposited
                  .toEther()
                  .dividedBy(pool.raise.toEther().multipliedBy(pool.price.toEther()))
                  .multipliedBy(100)
                  .toNumber()
              : 0
          "
          status="active"
        >
          <span slot="format">
            {{
              pool.info.quoteTokenDeposited
                ? pool.info.quoteTokenDeposited
                    .toEther()
                    .dividedBy(pool.raise.toEther().multipliedBy(pool.price.toEther()))
                    .multipliedBy(100)
                    .toFixed(2)
                : 0
            }}%
          </span>
        </Progress>
        <hr />
        <div class="fs-container">
          <template v-if="pool.version === 3">
            <div class="state">
              <span class="value">
                {{
                  (pool.userInfo && pool.userInfo.eligibleTicketAmount) ||
                  0 /* i don't know why, but this code will force computed get recalculate */
                }}
                Ticket(s)
              </span>
              <span class="desc"> Your Eligible Tickets </span>
            </div>

            <div class="state">
              <span class="value"> {{ depositedTickets.length }} Ticket(s) </span>
              <span class="desc"> Your Deposited Tickets </span>
            </div>

            <div class="state">
              <span class="value"> {{ winningTickets.length }} Ticket(s) </span>
              <span class="desc"> Your Winning Tickets </span>
            </div>

            <div class="state">
              <span v-if="pool.version === 3" class="value">
                {{
                  pool.userInfo && pool.userInfo.deposited
                    ? new TokenAmount(
                        pool.info.perLotteryWorthQuoteAmount.wei
                          .dividedBy(pool.price.wei)
                          .multipliedBy(winningTickets.length),
                        pool.base.decimals,
                        false
                      ).format()
                    : 0
                }}
                {{ pool.base.symbol }}
              </span>
              <span v-else class="value">
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
          </template>
          <template v-else>
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
          </template>
        </div>
      </Col>
      <Col :span="isMobile ? 24 : 8" :class="`purchase ${pool.version === 3 ? 'lottery' : ''}`">
        <div v-if="pool.version === 3">
          <span class="title">Join Lottery</span>
          <Tooltip v-if="ido.initialized" placement="bottomRight">
            <template slot="title">
              <span>
                Displayed data will auto-refresh after
                {{ ido.autoRefreshTime - ido.countdown }} seconds. Click this circle to update manually.
              </span>
            </template>
            <Progress
              type="circle"
              :width="20"
              :stroke-width="10"
              :percent="(100 / ido.autoRefreshTime) * ido.countdown"
              :show-info="false"
              :class="ido.loading ? 'disabled' : ''"
              @click="$accessor.ido.requestInfos"
            />
          </Tooltip>
        </div>

        <Alert
          v-if="pool.version === 3 && pool.info.status === 1 && pool.info.endTime > getUnixTs() / 1000"
          description="Users can only deposit once, and cannot add tickets or deposit a second time."
          type="warning"
          class="alert-text"
          show-icon
          banner
        />

        <div v-if="pool.version !== 3" class="fs-container">
          <div class="fs-container">
            <span class="title">Join Pool</span>
            <Tooltip v-if="ido.initialized" placement="bottomRight">
              <template slot="title">
                <span>
                  Displayed data will auto-refresh after
                  {{ ido.autoRefreshTime - ido.countdown }} seconds. Click this circle to update manually.
                </span>
              </template>
              <Progress
                type="circle"
                :width="20"
                :stroke-width="10"
                :percent="(100 / ido.autoRefreshTime) * ido.countdown"
                :show-info="false"
                :class="ido.loading ? 'disabled' : ''"
                @click="$accessor.ido.requestInfos"
              />
            </Tooltip>
          </div>
          <div class="min-max fc-container">
            <div @click="value = pool.info.minDepositLimit.fixed()">MIN</div>
            <div @click="value = pool.info.maxDepositLimit.fixed()">MAX</div>
          </div>
        </div>

        <template v-if="pool.info.endTime > getUnixTs() / 1000">
          <template v-if="pool.version === 3">
            <div class="input-box">
              <div class="label fs-container">
                <span></span>
                <span>Eligible Ticket(s): {{ eligibleTicketAmount }} </span>
              </div>
              <div class="input fs-container">
                {{ void (tokenAccount = safeGet(wallet.tokenAccounts, pool.quote.mintAddress)) }}
                <input
                  v-model="value"
                  inputmode="numeric"
                  autocomplete="off"
                  autocorrect="off"
                  placeholder="(ticket amount)"
                  type="text"
                  pattern="^[0-9]*[0-9]*$"
                  minlength="1"
                  maxlength="79"
                  spellcheck="false"
                  :disabled="Boolean(depositedTickets.length)"
                />
                <div class="min-max fc-container">
                  <div
                    @click="
                      value = eligibleTicketAmount < pool.info.perUserMinLottery ? 0 : pool.info.perUserMinLottery
                    "
                  >
                    MIN
                  </div>
                  <div
                    @click="
                      value =
                        eligibleTicketAmount > pool.info.perUserMaxLottery
                          ? pool.info.perUserMaxLottery
                          : eligibleTicketAmount
                    "
                  >
                    MAX
                  </div>
                </div>
              </div>
            </div>
            <div class="input-box">
              <div class="label fs-container">
                <span>Deposit</span>
                <span>
                  {{ void (tokenAccount = safeGet(wallet.tokenAccounts, pool.quote.mintAddress)) }}
                  Balance: {{ wallet.connected ? (tokenAccount ? tokenAccount.balance.fixed() : '0') : '--' }}
                </span>
              </div>
              <div class="input fs-container">
                <input
                  :value="value * pool.info.perLotteryWorthQuoteAmount.toEther()"
                  inputmode="decimal"
                  placeholder="0.00"
                  type="text"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  minlength="1"
                  maxlength="79"
                  spellcheck="false"
                  disabled
                />
                <div class="icon fc-container">
                  <CoinIcon :mint-address="pool.quote.mintAddress" />
                  <span>{{ pool.quote.symbol }}</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="input-box">
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
                  <CoinIcon :mint-address="pool.quote.mintAddress" />
                  <span>{{ pool.quote.symbol }}</span>
                </div>
              </div>
            </div>
          </template>
        </template>

        <Button v-if="!wallet.connected" size="large" ghost @click="$accessor.wallet.openModal">
          Connect Wallet
        </Button>
        <Button
          v-else-if="
            (!pool.userInfo || (!pool.userInfo.snapshoted && (pool.isRayPool || pool.isPrivate))) &&
            pool.info.endTime > getUnixTs() / 1000
          "
          size="large"
          ghost
          disabled
        >
          Wallet not eligible for this pool
        </Button>
        <Button v-else-if="pool.info.startTime > getUnixTs() / 1000" size="large" ghost disabled> Upcoming </Button>

        <template v-else-if="pool.info.endTime < getUnixTs() / 1000">
          <div v-if="pool.version === 3" class="btn-group">
            <Button
              v-if="pool.userInfo && pool.userInfo.quoteTokenDeposited > 0"
              size="large"
              ghost
              style="font-size: 13px"
              :disabled="
                !(
                  (
                    pool.info.status === 2 /* allow user withdraw pc and coin */ || pool.info.status === 3
                  ) /* allow user withdraw pc */
                ) ||
                Boolean(pool.userInfo && pool.userInfo.eligibleTicketAmount <= 0) ||
                Boolean(pool.userInfo && pool.userInfo.quoteTokenWithdrawn > 0)
              "
              @click="withdraw('quote')"
            >
              Claim {{ pool.quote.symbol }}
            </Button>

            <Button
              v-if="pool.userInfo && pool.userInfo.quoteTokenDeposited > 0"
              size="large"
              ghost
              :disabled="
                !(pool.info.status === 2) /* allow user withdraw pc */ ||
                winningTickets.length === 0 || // have no winning tickets
                getUnixTs() / 1000 < pool.info.startWithdrawTime ||
                Boolean(pool.userInfo && pool.userInfo.eligibleTicketAmount <= 0) ||
                Boolean(pool.userInfo && pool.userInfo.baseTokenWithdrawn > 0)
              "
              style="font-size: 13px"
              @click="withdraw('base')"
            >
              Claim {{ pool.base.symbol }}
            </Button>

            <Button v-else size="large" ghost disabled style="font-size: 13px"> You have not deposited </Button>
          </div>

          <template v-else>
            <Button
              v-if="getUnixTs() / 1000 < pool.info.startWithdrawTime"
              size="large"
              ghost
              disabled
              style="font-size: 13px"
            >
              Claim after {{ $dayjs(pool.info.startWithdrawTime * 1000) }}
            </Button>

            <Button
              v-else
              size="large"
              ghost
              :loading="purchasing"
              :disabled="
                purchasing || !pool.userInfo || !pool.userInfo.deposited || pool.userInfo.deposited.isNullOrZero()
              "
              @click="withdraw"
            >
              Claim
            </Button>
          </template>
        </template>
        <Button v-else-if="depositedTickets.length > 0" size="large" ghost disabled>
          You have already deposited
        </Button>

        <template v-else-if="pool.info.startTime < getUnixTs() / 1000">
          <template v-if="depositedTickets.length"></template>
          <Button
            v-else-if="pool.info.startTime < getUnixTs() / 1000"
            size="large"
            ghost
            :loading="purchasing"
            :disabled="
              !value ||
              (pool.version === 3
                ? eligibleTicketAmount > 0 &&
                  (lt(value, pool.info.perUserMinLottery) || gt(value, pool.info.perUserMaxLottery))
                : lt(value, pool.info.minDepositLimit.toEther()) || gt(value, pool.info.maxDepositLimit.toEther())) ||
              gt(value, tokenAccount ? tokenAccount.balance.fixed() : '0') ||
              purchasing
            "
            @click="deposit"
          >
            <template v-if="!value">{{ pool.version === 3 ? 'Enter ticket amount' : 'Enter an amount' }}</template>
            <template
              v-else-if="
                pool.version === 3
                  ? lt(value, pool.info.perUserMinLottery)
                  : lt(value, pool.info.minDepositLimit.toEther())
              "
            >
              {{
                pool.version === 3
                  ? `Min. tickets amount is ${pool.info.perUserMinLottery}`
                  : `Min. allocation is ${pool.info.minDepositLimit.toEther()} ${pool.quote.symbol}`
              }}
            </template>
            <template
              v-else-if="
                pool.version === 3
                  ? gt(value, pool.info.perUserMaxLottery)
                  : gt(value, pool.info.maxDepositLimit.toEther())
              "
            >
              {{
                pool.version === 3
                  ? `Max. tickets amount is ${pool.info.perUserMaxLottery}`
                  : `Max. allocation is ${pool.info.maxDepositLimit.toEther()} ${pool.quote.symbol}`
              }}
            </template>
            <template v-else-if="gt(value, tokenAccount ? tokenAccount.balance.fixed() : '0')">
              Insufficient {{ pool.quote.symbol }} balance
            </template>
            <template v-else>Join {{ pool.version === 3 ? 'Lottery' : 'pool' }}</template>
          </Button>
        </template>

        <Button v-else size="large" ghost disabled>
          {{ pool.version === 3 ? 'Unable To Join Lottery' : 'Upcoming Pool' }}
        </Button>
        <hr />
        <Alert
          :description="
            pool.version === 3
              ? `Once deposited, ${
                  pool.quote.symbol
                } can be claimed after lottery ends. Tokens can be claimed after ${$dayjs(
                  pool.info.startWithdrawTime * 1000
                ).toString()}`
              : `${pool.quote.symbol} can't be withdrawn after joining. Tokens can be claimed after ${$dayjs(
                  pool.info.startWithdrawTime * 1000
                ).toString()}`
          "
          type="warning"
          class="alert-text"
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
          <a class="link" :href="`${url.explorer}/token/${pool.base.mintAddress}`" target="_blank">SOLSCAN</a>
        </div>

        <p class="details">{{ pool.base.details }}</p>

        <div class="flex">
          <a v-for="(link, key) in pool.base.socials" :key="key" class="icon-link" :href="link" target="_blank">
            <img :src="importIcon(`/icons/${key.toLowerCase()}.svg`)" />
          </a>
        </div>
      </Col>
      <Col :span="isMobile ? 24 : 12">
        <Tabs :class="pool.version === 3 ? 'tab-count-3' : 'tab-count-2'">
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
            <template v-if="pool.version === 3">
              <div class="infos flex">
                <span class="key">Max winners</span>
                <span class="text"> {{ pool.info.totalWinLotteryLimit }} </span>
              </div>
            </template>
            <template v-else>
              <div class="infos flex">
                <span class="key">Min. purchase limit</span>
                <span class="text"> {{ pool.info.minDepositLimit.format() }} {{ pool.quote.symbol }}</span>
              </div>
              <div class="infos flex">
                <span class="key">Max. purchase limit</span>
                <span class="text"> {{ pool.info.maxDepositLimit.format() }} {{ pool.quote.symbol }}</span>
              </div>
            </template>
            <div class="infos flex">
              <span class="key">Access type</span>
              <span class="text">
                <span class="access">
                  <span v-if="pool.isPrivate" class="community">
                    <span>Private Pool</span>
                  </span>
                  <span v-else-if="pool.isRayPool" class="ray">
                    <span>RAY Pool</span>
                  </span>
                  <span v-else class="community"><span>Community Pool</span></span>
                </span>
              </span>
            </div>
            <div class="infos flex">
              <span class="key">Requirements to join</span>
              <span v-if="pool.version === 3">
                For full details,
                <a :href="pool.base.detailLink">click here</a>
              </span>
              <span v-else class="text">
                {{ pool.isRayPool ? `${pool.info.minStakeLimit.format()} RAY staked` : 'No limit' }}
              </span>
            </div>
            <div v-if="!pool.isPrivate" class="infos flex">
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
          <TabPane v-if="pool.version === 3" key="tickets" tab="Tickets Information">
            <div class="infos big-box">
              <span class="key">Your Tickets</span>
              <div class="content">
                <div v-for="item in depositedTickets" :key="item" class="ticket-item">ticket: {{ item }}</div>
              </div>
            </div>
            <div class="infos big-box">
              <span class="key">Your Winning Tickets</span>
              <div class="content">
                <div v-for="item in winningTickets" :key="item" class="ticket-item">ticket: {{ item }}</div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'

import { Row, Col, Tooltip, Progress, Button, Alert, Tabs } from 'ant-design-vue'
import { get as safeGet } from 'lodash-es'

import { getUnixTs } from '@/utils'
import importIcon from '@/utils/import-icon'
import { TokenAmount, gt, lt } from '@/utils/safe-math'
import { IdoPool, purchase, claim, IdoLotteryUserInfo, IdoLotteryPoolInfo } from '@/utils/ido'

const { TabPane } = Tabs

@Component({
  head: {
    title: 'Raydium AcceleRaytor'
  },

  components: {
    Row,
    Col,
    Tooltip,
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

  // only for lottery
  get eligibleTicketAmount() {
    return (this.pool.userInfo as IdoLotteryUserInfo)?.eligibleTicketAmount ?? 0
  }

  get depositedTickets() {
    const begin = (this.pool.userInfo as IdoLotteryUserInfo)?.lotteryBeginNumber
    const end = (this.pool.userInfo as IdoLotteryUserInfo)?.lotteryEndNumber
    return begin && end ? Array.from({ length: end - begin + 1 }, (_, i) => begin + i) : []
  }

  isTicketWin(ticketNumber: number): boolean {
    const luckyInfos = (this.pool.info as IdoLotteryPoolInfo).luckyInfos
    const isTargeted = luckyInfos.some(
      ({ luckyTailDigits, luckyTailNumber, luckyWithinNumber }) =>
        luckyTailDigits &&
        ticketNumber <= luckyWithinNumber &&
        String(ticketNumber)
          .padStart(luckyTailDigits, '0')
          .endsWith(String(luckyTailNumber).padStart(luckyTailDigits, '0'))
    )
    return this.getWinProperty() < 0.5 ? isTargeted : !isTargeted
  }

  getWinProperty(): number {
    const luckyInfos = (this.pool.info as IdoLotteryPoolInfo).luckyInfos
    const totalWinAmount = luckyInfos.reduce((acc, { luckyNumberExist }) => acc + luckyNumberExist, 0)
    return totalWinAmount / (this.pool.info as IdoLotteryPoolInfo).currentLotteryNumber
  }

  get winningTickets() {
    return this.depositedTickets.filter((ticket) => this.isTicketWin(ticket))
  }

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

    purchase({
      connection: conn,
      wallet,
      poolInfo: this.pool,
      userQuoteTokenAccount,
      stakeInfoAccount,
      amount: this.value
    })
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
        const description = this.pool.version === 3 ? 'Join lottery' : `Join ${this.pool.base.symbol} pool`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: this.pool.version === 3 ? 'Join lottery failed' : 'Join pool failed',
          description: error.message
        })
      })
      .finally(() => {
        this.purchasing = false
      })
  }

  withdraw(/* this prarmeter is only for lottery */ aim?: 'quote' | 'base') {
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

    claim({
      connection: conn,
      wallet,
      poolInfo: this.pool,
      userBaseTokenAccount,
      userQuoteTokenAccount,
      aim: this.pool.version === 3 ? aim : undefined
    })
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
.alert-text {
  width: 100%;
  white-space: pre-wrap;
}

.top-box {
  display: flex;
}
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
.preview.lottery {
  min-height: 350px;
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
  .infos.big-box {
    display: flex;
    align-items: flex-start;
    .key {
      width: 30%;
    }
    .content {
      // display: inline-block;
      width: 70%;
      max-height: 286px;
      overflow: auto;
      display: inline-grid;
      grid-template-columns: repeat(3, 1fr);
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
    margin-right: 8px;
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

  .input-box {
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
.purchase.lottery {
  padding: 25px 40px;
  min-height: 350px;

  .title {
    margin-bottom: 8px;
  }
  .min-max {
    div {
      padding: 0 8px;
      font-size: 0.8em;
    }
  }
  .input-box {
    margin-top: 16px;
    padding: 12px 16px;
  }
  .input.fs-container {
    margin-top: 0;
  }
  button {
    margin-top: 16px;
  }
  hr {
    margin: 12px 0;
  }
  .btn-group {
    display: flex;
    gap: 8px;
  }
  input::placeholder {
    font-size: 0.9em;
    color: white;
    opacity: 0.5;
  }
}
</style>

<style lang="less">
.ant-progress-line {
  margin-top: 20px;
}

.ant-progress-circle {
  cursor: pointer;
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

.ant-tabs .ant-tabs-tab {
  width: 50%;
  margin: 0;
  text-align: center;
}
.ant-tabs.tab-count-3 .ant-tabs-tab {
  width: 33.3333%;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
