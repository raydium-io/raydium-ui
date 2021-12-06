<template>
  <div class="airdrop">
    <section class="page-title">
      <img
        class="icon"
        src="../assets/background/huobi.svg"
        style="margin-bottom: 40px; width: 100%; max-width: 400px"
      />
      <div class="page-sub-leading">{{ $t('airdrop.pre-title') }}</div>
      <div class="page-main-title">{{ $t('airdrop.title') }}</div>
      <!-- <div class="page-additional-description">
        The Airdrop is <span class="alert">complete!</span> Rewards have been sent to winners, connect your wallet to
        see results!
      </div> -->
    </section>

    <section v-if="isWinningPanelOpen" :class="`box winner-panel ${$accessor.wallet.connected ? 'has-result' : ''}`">
      <div class="close-btn" @click="isWinningPanelOpen = false">
        <div class="icon minimize" />
      </div>

      <a v-if="rewardIsOut" class="download-full-list" href="/activities/winner-list/" target="_blank">
        {{ $t('airdrop.user.finish.winner-list') }}
      </a>

      <div class="title">{{ $t('airdrop.user.title') }}</div>

      <div v-if="rewardIsOut" class="note" style="text-align: center; margin-top: 12px">
        {{ $t('airdrop.user.finish.prompt') }}
      </div>

      <template v-if="$accessor.wallet.connected">
        <template v-if="isActivityEnd">
          <h1 :class="`table-caption ${rewardIsOut ? 'have-reward' : ''}`">
            Your reward<span v-if="rewardIsOut && rewardInfos"
              >: ${{ Object.values(rewardInfos).reduce((sum, value) => sum + value, 0) }}</span
            >
          </h1>
          <table v-if="rewardIsOut" class="your-reward">
            <tr>
              <th class="th" style="width: 70%"></th>
              <th class="th" style="width: 24%"></th>
            </tr>
            <tr v-for="(value, key) in rewardInfos" :key="key">
              <td v-if="key === 'refer'" class="td">Top 5</td>
              <td v-if="key === 'first'" class="td">First 4,000</td>
              <td v-if="key === 'luck'" class="td">Lucky Draw Pool</td>
              <td class="td">
                <div class="point-label">${{ value }}</div>
              </td>
            </tr>
          </table>
          <div v-if="!rewardIsOut">{{ $t('airdrop.user.calculating') }}</div>
        </template>
        <h1 :class="`table-caption ${rewardIsOut ? 'have-reward' : ''}`">Total Points</h1>
        <table class="your-table">
          <tr>
            <th class="th" style="width: 70%"></th>
            <th class="th" style="width: 24%"></th>
          </tr>
          <tr>
            <td class="td">
              Eligible for Lucky Draw?
              <Tooltip placement="left">
                <template slot="title">
                  Qualified users are defined as having connected a wallet, completed a swap, and completed Twitter
                  verification by tweeting their customized referral code.
                </template>
                <Icon type="question-circle" style="cursor: pointer; margin-left: 8px" />
              </Tooltip>
            </td>
            <td class="td">
              {{ initBackendResponse && initBackendResponse.user && initBackendResponse.user.valid ? 'Yes' : 'No' }}
            </td>
          </tr>
          <tr>
            <td class="td">
              Points for Lucky Draw
              <Tooltip placement="left">
                <template slot="title">
                  1 point = 1 entry. Prizes for the lucky draw will be issued in descending order (ie: 3 winners of
                  $1,000, 15 winners of $300, 100 winners of $100, etc). Winners are ineligible to win multiple prizes
                  from the lucky draw pool.
                </template>
                <Icon type="question-circle" style="cursor: pointer; margin-left: 8px" />
              </Tooltip>
            </td>
            <td class="td">
              <div class="point-label">
                {{ (initBackendResponse && initBackendResponse.user && initBackendResponse.user.point) || 0 }}
              </div>
            </td>
          </tr>
          <tr>
            <td class="td">
              Qualified Referrals
              <Tooltip placement="left">
                <template slot="title">
                  Referral points are earned from users who used your code to connect a wallet, complete a swap, and
                  complete Twitter verification.
                </template>
                <Icon type="question-circle" style="cursor: pointer; margin-left: 8px" />
              </Tooltip>
            </td>
            <td class="td">
              <div class="point-label">
                {{ (initBackendResponse && initBackendResponse.user && initBackendResponse.user.referral_count) || 0 }}
              </div>
            </td>
          </tr>
        </table>

        <h1 :class="`table-caption ${rewardIsOut ? 'have-reward' : ''}`">
          {{ rewardIsOut ? 'Top 5: $2,000 Each' : 'Referral Leaderboard' }}
        </h1>
        <table v-if="!isActivityEnd" class="winner-table">
          <tbody>
            <tr v-for="winnerInfo in winners" :key="winnerInfo.owner">
              <td class="td address">{{ winnerInfo.owner }}</td>
              <td class="td">
                <div class="point-label">
                  {{ winnerInfo.count }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <table v-else-if="rewardIsOut" class="winner-table">
          <tbody>
            <tr v-for="winnerInfo in winnerList['top 5']" :key="winnerInfo.owner">
              <td class="td address">{{ winnerInfo.owner }}</td>
              <td class="td">
                <div class="point-label">${{ winnerInfo.reward }}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else>{{ $t('airdrop.user.calculating') }}</div>
      </template>
      <template v-else>
        <div class="subtitle">{{ $t('airdrop.user.not-connect') }}</div>
        <button @click="$accessor.wallet.openModal()">{{ $t('connect-wallet') }}</button>
      </template>
    </section>

    <div v-else class="winner-trigger" @click="isWinningPanelOpen = true">
      <div class="icon" />
    </div>

    <section class="TLDR">
      <div class="title">{{ $t('airdrop.introduction-activities.title') }}</div>
      <table class="TLDR-table">
        <tr>
          <th class="th"></th>
          <th class="th">{{ $t('airdrop.introduction-activities.tasks') }}</th>
          <th class="th">{{ $t('airdrop.introduction-activities.points') }}</th>
        </tr>
        <tr>
          <td class="td order">1</td>
          <td class="td">{{ $t('airdrop.introduction-activities.task.huobi.title') }}</td>
          <td class="td">
            <div class="point-label">{{ $t('airdrop.introduction-activities.task.huobi.point') }}</div>
          </td>
        </tr>
        <tr>
          <td class="td order">2</td>
          <td class="td">{{ $t('airdrop.introduction-activities.task.swap.title') }}</td>
          <td class="td">
            <div class="point-label">{{ $t('airdrop.introduction-activities.task.swap.point') }}</div>
          </td>
        </tr>
        <tr>
          <td class="td order">3</td>
          <td class="td">{{ $t('airdrop.introduction-activities.task.earn-bonus.title') }}</td>
          <td class="td">
            <div class="point-label">{{ $t('airdrop.introduction-activities.task.earn-bonus.point') }}</div>
          </td>
        </tr>
        <tr>
          <td class="td order">4</td>
          <td class="td">{{ $t('airdrop.introduction-activities.task.refer.title') }}</td>
          <td class="td">
            <div class="point-label">{{ $t('airdrop.introduction-activities.task.refer.point') }}</div>
          </td>
        </tr>
      </table>
    </section>

    <section class="nav-btns">
      <button @click="to('details')">{{ $t('airdrop.reward-details.link-name') }}</button>
    </section>

    <section class="step-game">
      <div class="task-level">{{ $t('airdrop.step1.step') }}</div>
      <div class="title">{{ $t('airdrop.video.title') }}</div>

      <div ref="step-1" class="box watch-video">
        <div class="box-title has-step">
          {{ $t('airdrop.video.video-title') }}
        </div>
        <div class="video-box">
          <iframe
            v-if="$i18n.locale === 'en'"
            width="100%"
            height="480"
            src="https://www.youtube.com/embed/ViFSfsAqSLg"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <iframe
            v-else
            width="100%"
            height="480"
            src="https://www.youtube.com/embed/XUnEQ6cy9WI"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <svg class="step-gap-line" viewBox="0 0 532 132">
        <polyline points="266,0 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>

      <div class="box wallet">
        <div class="box-title has-step">{{ $t('airdrop.video.connect-wallet') }}</div>
        <div class="box-text">
          <div>
            {{ $t('airdrop.video.download')
            }}<a href="https://phantom.app/" rel="nofollow noopener noreferrer" target="_blank">
              {{ $t('airdrop.video.phantom') }}
            </a>
          </div>
          <div>
            {{ $t('airdrop.video.try-sollet') }}
            <a href="https://sollet.io" rel="nofollow noopener noreferrer" target="_blank">{{
              $t('airdrop.video.sollet')
            }}</a>
          </div>
        </div>
        <Wallet />
      </div>
    </section>

    <section class="step-game">
      <div class="task-level">{{ $t('airdrop.step2.step') }}</div>

      <div class="box form">
        <div class="box-title">{{ $t('airdrop.huobiID.title') }}</div>
        <div class="input-box">
          <input v-model="discordUserName" :placeholder="$t('airdrop.huobiID.sub-btn-loading')" />
        </div>
        <button :disabled="$accessor.wallet.connected && (!canSubmitDiscord || isDiscording)" @click="submitDiscord">
          {{
            $accessor.wallet.connected
              ? isDiscording
                ? $t('airdrop.huobiID.sub-btn-loading')
                : $t('airdrop.huobiID.sub-btn')
              : $t('connect-wallet')
          }}
          <!-- <div
            v-if="$accessor.wallet.connected"
            :class="`icon ${haveDiscord ? 'finished' : isDiscordPending ? 'pending' : 'muted'}`"
            :title="`${
              haveDiscord
                ? 'Congratulations! You completed this task.'
                : isDiscordPending
                ? 'Points pending. Please check again in 30 minutes.'
                : 'you have not done this task'
            }`"
          /> -->
        </button>
      </div>
    </section>

    <section class="connect-wallet">
      <div class="task-level">{{ $t('airdrop.step3.step') }}</div>
      <div class="title">{{ $t('airdrop.step3.title') }}</div>
      <div class="subtitle">{{ $t('airdrop.step3.point') }}</div>
      <div class="box-grid">
        <div class="box">
          <div class="box-title has-step">
            {{ $t('airdrop.swap.title') }}
            <div>
              <div
                :class="`icon-reward ${haveSwap ? 'finished' : isSwapPending ? 'pending' : 'muted'}`"
                :title="`${
                  haveSwap
                    ? $t('airdrop.swap.completed')
                    : isSwapPending
                    ? $t('airdrop.swap.pending')
                    : $t('airdrop.swap.notDoneTask')
                }`"
              />
            </div>
          </div>
          <a href="/swap/" target="_blank" style="align-self: end"
            ><button>{{ $t('airdrop.swap.btn') }}</button></a
          >
        </div>
      </div>
    </section>

    <section class="media-entries">
      <div class="task-level">{{ $t('airdrop.step4.step') }}</div>
      <div class="title">{{ $t('airdrop.step4.title') }}</div>
      <div class="subtitle">{{ $t('airdrop.step4.point') }}</div>
      <div class="box-grid">
        <div class="box">
          <div class="box-title">
            {{ $t('airdrop.twitter.title') }}
            <div>
              <div
                :class="`icon-reward ${haveTweet ? 'finished' : isTweetPending ? 'pending' : 'muted'}`"
                :title="`${
                  haveTweet
                    ? $t('airdrop.twitter.completed')
                    : isTweetPending
                    ? $t('airdrop.twitter.pending')
                    : $t('airdrop.twitter.notDoneTask')
                }`"
              />
              <div class="point-label">{{ $t('airdrop.twitter.point-msg') }}</div>
            </div>
          </div>

          <div class="box-text red">*{{ $t('airdrop.twitter.prompt') }}</div>

          <div class="btn-row">
            <a
              v-if="$accessor.wallet.connected"
              :href="`https://twitter.com/intent/tweet?text=${getDefaultText()}`"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              <button
                @click="
                  () => {
                    if (!$accessor.wallet.connected) {
                      $accessor.wallet.openModal()
                    } else {
                      !isActivityEnd && submit({ task: 'referral', result: '' })
                    }
                  }
                "
              >
                <img class="icon" src="../assets/icons/guide-twitter-icon.svg" />{{ $t('airdrop.twitter.btn') }}
              </button>
            </a>
            <button v-else @click="$accessor.wallet.openModal()">{{ $t('connect-wallet') }}</button>
          </div>
        </div>

        <div class="box">
          <div class="box-title">
            {{ $t('airdrop.refer.title') }}
            <div class="point-label">{{ $t('airdrop.refer.point-msg') }}</div>
          </div>

          <div class="box-text small">
            {{ $t('airdrop.refer.prompt') }}:
            <br />
            {{ referralLink }}
          </div>

          <div class="icon-btns">
            <button
              class="icon-btn"
              title="click here to copy it"
              @click="
                () => {
                  if (!$accessor.wallet.connected) {
                    $accessor.wallet.openModal()
                  } else {
                    $accessor.copy(referralLink)
                  }
                }
              "
            >
              <img class="icon" src="../assets/icons/guide-share-icon.svg" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- <section class="referrals">
      <div class="title">Share With More Friends</div>
      <div class="subtitle">To Earn $2,000 in RAY</div>
    </section> -->

    <section ref="details" class="reward-details">
      <div class="title">{{ $t('airdrop.reward-details.title') }}</div>
      <ol>
        <li v-for="item of $t('airdrop.reward-details.words')" :key="item">{{ item }}</li>
      </ol>
      <hr />
      <table class="detail-panel">
        <tr>
          <th>{{ $t('airdrop.reward-details.table.head[0]') }}</th>
          <th style="width: 200px">{{ $t('airdrop.reward-details.table.head[1]') }}</th>
          <th style="width: 200px">{{ $t('airdrop.reward-details.table.head[2]') }}</th>
          <th>{{ $t('airdrop.reward-details.table.head[3]') }}</th>
        </tr>
        <tr>
          <td>
            <strong>{{ $t('airdrop.reward-details.table.R1.requirements[0]') }}</strong>
            {{ $t('airdrop.reward-details.table.R1.requirements[1]') }}
          </td>
          <td>{{ $t('airdrop.reward-details.table.R1.winners') }}</td>
          <td>{{ $t('airdrop.reward-details.table.R1.amount') }}</td>
          <td>{{ $t('airdrop.reward-details.table.R1.eligibility') }}</td>
        </tr>
        <tr>
          <td style="white-space: pre-line">
            <strong>{{ $t('airdrop.reward-details.table.R2.requirements[0]') }}</strong>
            {{ $t('airdrop.reward-details.table.R2.requirements[1]') }}
            <br />
            <strong>{{ $t('airdrop.reward-details.table.R2.requirements[2]') }}</strong>
            {{ $t('airdrop.reward-details.table.R2.requirements[3]') }}
          </td>
          <td>
            <div v-for="item of $t('airdrop.reward-details.table.R2.winners')" :key="item">{{ item }}</div>
          </td>
          <td>
            <div v-for="item of $t('airdrop.reward-details.table.R2.amount')" :key="item">{{ item }}</div>
          </td>
          <td>{{ $t('airdrop.reward-details.table.R2.eligibility') }}</td>
        </tr>
        <tr>
          <td>
            <strong>{{ $t('airdrop.reward-details.table.R3.requirements') }}</strong>
          </td>
          <td>{{ $t('airdrop.reward-details.table.R3.winners') }}</td>
          <td>{{ $t('airdrop.reward-details.table.R3.amount') }}</td>
          <td>{{ $t('airdrop.reward-details.table.R3.eligibility') }}</td>
        </tr>
      </table>
    </section>

    <section class="terms-conditions">
      <div class="title">{{ $t('airdrop.terms-conditions.title') }}</div>
      <ul>
        <li v-for="item of $t('airdrop.terms-conditions.words')" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
/**
 * @file it is the main page of airdrop activity. **useless** now.
 */

import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { mapState } from 'vuex'

import { Tooltip, Input, Icon, Table, Checkbox } from 'ant-design-vue'
import { CampaignInfo, CampaignWinners } from '@/types/api'

const getWinnerList = () => import('static/winner-list.json' as any).then((m) => m.default || m)

@Component({
  components: {
    Tooltip,
    Input,
    Icon,
    Table,
    Checkbox
  },

  head: {
    title: 'Raydium Bounty Airdrop'
  },

  async asyncData({ route }) {
    if (route.query?.referral) {
      window.localStorage.setItem('airdrop:referral', route.query?.referral as string)
    } else {
      const storedItem = window.localStorage.getItem('airdrop:referral')
      if (storedItem) location.href = `${window.location.origin}/airdrop/?referral=${storedItem}`
    }
    const winnerList = await getWinnerList()

    return { winnerList }
  },

  computed: {
    ...mapState(['isMobile'])
  }
})
export default class Airdrop extends Vue {
  inputContent = ''
  inputChecked = false
  initBackendResponse = {} as CampaignInfo['data'] // info from backend
  isActivityEnd = true
  showLinkInput = false
  videoHasFinished = false
  videoHasCachedComplete = false
  retweetLink = ''
  discordUserName = ''
  referralLink = ''
  canSubmitDiscord = false
  haveTweet = false
  haveFollow = false
  haveDiscord = false
  haveSwap = false
  isTweetPending = false
  isFollowPending = false
  isDiscordPending = false
  isSwapPending = false

  isDiscording = false
  intervalTimer = 0

  isWinningPanelOpen = true
  winners = [] as CampaignWinners
  rewardIsOut = false
  cachedWinnerList: Record<string, string> = {}
  // eslint-disable-next-line camelcase
  rewardInfos = undefined as
    | {
        first: number
        refer: number
        luck: number
      }
    | undefined

  mounted() {
    this.intervalTimer = window.setInterval(this.fetchData, 1000 * 60 * 3)
  }

  @Watch('initBackendResponse', { deep: true })
  getReferralLink(res: CampaignInfo['data']) {
    this.referralLink = `${window.location.origin}${window.location.pathname}${
      res?.user?.referral ? `?referral=${res.user?.referral}` : ''
    }`
  }

  to(anchor: 'step-1' | 'details') {
    // const reu = this.$route.path
    const el = this.$refs[anchor] as Element | undefined
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth' })
  }

  @Watch('initBackendResponse', { immediate: true })
  checkRewardIsOut(res: CampaignInfo['data']) {
    if (!res.user) return
    // trueData
    this.rewardIsOut = Boolean(res.user.reward)
    this.rewardInfos = res.user.reward
  }

  @Watch('initBackendResponse', { immediate: true })
  checkCanSubmitDiscord(res: CampaignInfo['data']) {
    this.canSubmitDiscord = !(res.tasks?.discard?.finished || res.tasks?.discard?.enabled)
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveTweet(res: CampaignInfo['data']) {
    this.haveTweet = res.tasks?.referral?.finished
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveFollow(res: CampaignInfo['data']) {
    this.haveFollow = res.tasks?.twitter?.finished
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveDiscord(res: CampaignInfo['data']) {
    this.haveDiscord = res.tasks?.discord?.finished
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveSwap(res: CampaignInfo['data']) {
    this.haveSwap = res.tasks?.swap?.finished
  }

  @Watch('initBackendResponse', { immediate: true })
  checkIsTweetPending(res: CampaignInfo['data']) {
    this.isTweetPending = res.tasks?.referral?.enabled
  }

  @Watch('initBackendResponse', { immediate: true })
  checkIsFollowPending(res: CampaignInfo['data']) {
    this.isFollowPending = res.tasks?.twitter?.enabled
  }

  @Watch('initBackendResponse', { immediate: true })
  checkIsDiscordPending(res: CampaignInfo['data']) {
    this.isDiscordPending = res.tasks?.discord?.enabled
  }

  @Watch('initBackendResponse', { immediate: true })
  checkIsSwapPending(res: CampaignInfo['data']) {
    this.isSwapPending = res.tasks?.swap?.enabled
  }

  @Watch('$accessor.wallet.connected', { immediate: true })
  resetDiscord() {
    this.isDiscording = false
  }

  @Watch('$accessor.wallet.connected', { immediate: true })
  async fetchData() {
    if (this.$accessor.wallet.connected) {
      try {
        const response = await this.$api.getCompaign({
          address: this.$accessor.wallet.address,
          referral: (this.$route.query?.referral as string) || undefined
        })
        this.initBackendResponse = response?.data ?? {}
        this.isActivityEnd = new Date(response?.campaign_info?.end).getTime() < Date.now()
        if (!this.isActivityEnd) {
          this.winners = await this.$api.getCompaignWinners()
        }
      } catch (err) {}
    }
  }

  async downloadCSV({ targetFileName, type }: { targetFileName: string; type: 'luck' | 'valid' }) {
    // get data content
    let data = ''
    if (this.cachedWinnerList[targetFileName]) {
      data = this.cachedWinnerList[targetFileName]
    } else {
      try {
        const freshRawData = await this.$api.getCompaignWinnerList({ type })
        const parsedData = freshRawData.join('\n')
        this.cachedWinnerList[targetFileName] = parsedData
        data = parsedData
      } catch (err) {}
    }

    // download
    const blob = new Blob([data], { type: 'csv' })
    const url = URL.createObjectURL(blob)
    const tempA = document.createElement('a')
    tempA.href = url
    tempA.download = `${targetFileName}.csv`
    tempA.target = '_blank'
    tempA.click()
  }

  async submit({
    task,
    result,
    sign
  }: {
    task: 'video' | 'twitter' | 'discord' | 'swap' | 'referral'
    result?: string
    sign?: string
  }) {
    const response = await this.$api.postCompaign({
      address: this.initBackendResponse.user?.address,
      task,
      result,
      sign
    })
    if (response) this.initBackendResponse = response.data
    return response
  }

  async submitDiscord() {
    if (!this.$accessor.wallet.connected) {
      this.$accessor.wallet.openModal()
    } else if (this.discordUserName) {
      this.isDiscording = true
      try {
        const result = await this.submit({ task: 'discord', result: this.discordUserName })
        if (result) {
          this.initBackendResponse = result.data
        }
      } finally {
        this.showLinkInput = false
        this.isDiscording = false
      }
    }
  }

  getDefaultText() {
    const defaultText = `Did you hear about the @RaydiumProtocol $100k Bounty Airdrop?😎

Learn, swap, and refer for a chance at up to $2k in $RAY!

#SolanaSummer

Join now: ${window.location.origin}/airdrop/?referral=${this.initBackendResponse.user?.referral ?? ''}`
    const encoded = encodeURIComponent(defaultText)
    return encoded
  }
}
</script>

<style>
.ant-checkbox .ant-checkbox-inner {
  background-color: transparent;
  border-color: var(--secondary-text);
}
</style>

<style lang="less" scoped>
.airdrop {
  --primary: #141040;
  --secondary: #39d0d8;
  --primary-text: #fff;
  --secondary-text: #c4d6ff;
  --video-bg: hsla(0, 0%, 0%, 0.8);
  --point-label-bg: #da2eef;
  --reward-card-bg: #191542;

  min-height: 100vh;
  width: 90vw;
  max-width: 1400px;
  margin: 0 auto;
}

section {
  padding-top: 32px;
  padding-bottom: 104px;
  display: grid;
  justify-items: center;
  position: relative;
}
section.nav-btns {
  margin-top: -100px;
}

button {
  padding: 8px 40px;
  border: 2px solid var(--secondary);
  color: var(--secondary);
  box-sizing: border-box;
  border-radius: 8px;
  background: transparent;
  font-weight: 500;
  font-size: 20px;
  line-height: 26px;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  &.primary {
    background-color: var(--secondary);
    color: var(--primary);
  }
  &:hover {
    filter: brightness(0.8);
  }
  &:active {
    filter: brightness(0.5);
    transform: translate(1px, 1px);
  }
}
button[disabled] {
  color: gray;
  border-color: gray;
  cursor: not-allowed;
}
a.disabled {
  pointer-events: none;
}
.task-level {
  white-space: nowrap;
  font-weight: 500;
  font-size: 36px;
  color: var(--secondary-text);
  opacity: 0.7;
  position: absolute;
  top: 0;
  left: 0;
  &::after {
    position: absolute;
    content: '';
    bottom: 0;
    right: -16px;
    width: 60%;
    height: 2px;
    background-color: var(--secondary);
  }
}
.icon-reward {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: gray;
  mask-image: url('../assets/icons/reward.svg');
}
.icon-reward.finished {
  background-color: aquamarine;
}
.icon-reward.pending {
  background-color: goldenrod;
}
.icon-reward.icon.muted {
  background-color: rgba(128, 128, 128, 0.527);
}

.title {
  font-weight: 500;
  font-size: 28px;
  line-height: 31px;
  color: var(--primary-text);
  margin-top: 40px;
  margin-bottom: 56px;
  position: relative;
  max-width: 800px;
  text-align: center;
}
.TLDR .title {
  margin-top: 20px;
  margin-bottom: 20px;
  font-size: 24px;
}

.subtitle {
  font-weight: 500;
  font-size: 18px;
  color: var(--secondary-text);
  margin-top: -40px;
  margin-bottom: 56px;
  position: relative;
  max-width: 400px;
  text-align: center;
}

.point-label {
  padding: 4px 12px;
  display: inline-block;
  background-color: var(--point-label-bg);
  color: var(--primary-text);
  border-radius: 1000px;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;

  .box-title & {
    margin-left: 8px;
  }
}
.icon.muted {
  filter: saturate(0.1);
}

.page-title {
  margin-top: 64px;
  padding-bottom: 48px;
  .page-sub-leading {
    font-size: 20px;
    line-height: 26px;
    color: var(--secondary);
    margin-bottom: 12px;
  }
  .page-main-title {
    font-weight: 500;
    font-size: 56px;
    line-height: 60px;
    color: var(--primary-text);
    margin-bottom: 8px;
  }
  .page-additional-description {
    font-size: 24px;
    line-height: 31px;
    text-align: center;
    .alert {
      color: #40bf4c;
      font-weight: 600;
      display: inline-block;
    }
  }
}

.box {
  height: 100%;
  position: relative;
  padding: 24px;
  border: 2px solid var(--secondary);
  box-shadow: 12px 12px 0 var(--secondary);
  background: var(--primary);
  max-width: 426px;
  border-radius: 20px;
  display: grid;

  .box-title {
    font-weight: 500;
    font-size: 24px;
    line-height: 36px;
    color: var(--primary-text);
    margin-bottom: 36px;
  }
  .box-text {
    display: block;
    margin-bottom: 20px;
    font-size: 1.1em;

    a {
      margin-bottom: 4px;
      text-decoration: underline;
    }
    &.red {
      color: crimson;
    }
    &.small {
      margin-bottom: 1rem;
      font-size: 1rem;
    }
  }

  .btn-row,
  button:not(.icon-btn) {
    width: 100%;
    align-self: flex-end;
  }
  .btn-row {
    display: flex;
    gap: 16px;
    > * {
      flex-grow: 1;
    }
  }

  .step-label {
    position: absolute;
    right: -0.5px; // if 0 , there may be a slim gap
    top: 24px;
    padding: 8px 12px;
    border-radius: 8px 0 0 8px;
    background: var(--secondary);
    font-weight: 500;
    font-size: 24px;
    line-height: 28px;
    color: var(--primary);
  }

  &.watch-video {
    max-width: 1200px;
    .video-box {
      position: relative;
      .play-icon {
        cursor: pointer;
        position: absolute;
        z-index: 1;
        inset: 0;
        margin: auto;
        width: 80px;
        height: 80px;
      }
      video {
        border-radius: 20px;
        background-color: var(--video-bg);
        width: 100%;
      }
    }
  }

  &.form {
    max-width: 580px;
    .input-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 24px;
      label {
        justify-self: start;
      }
      a {
        justify-self: end;
        text-decoration: underline;
      }
      input {
        margin-top: 8px;
        border: 1.5px solid var(--secondary-text);
        caret-color: var(--secondary);
        padding: 8px;
        border-radius: 8px;
        grid-column: span 2;
        background-color: transparent;
        color: var(--secondary-text);
      }
    }
    .check-box {
      display: flex;
      align-items: center;
      margin-bottom: 32px;
      .checkbox {
        margin-right: 16px;
      }
      .text {
        font-size: 12px;
        line-height: 15px;
        color: var(--secondary-text);
      }
    }
  }
}

.step-gap-line {
  width: 532px;
  max-width: 80vw;
  height: 132px;
  stroke: var(--secondary);
  &.social-media {
    width: 440px;
    height: 88px;
  }
}

.winner-panel {
  --secondary: #39d0d8;

  position: fixed;
  right: 4vw;
  bottom: 4vh;
  height: 240px;
  width: 350px;
  z-index: 99;
  box-shadow: 12px 12px 0 var(--secondary), 12px 12px 32px 8px var(--secondary);

  .close-btn {
    position: absolute;
    right: 4%;
    top: 4%;
    .icon.minimize {
      cursor: pointer;
      display: inline-block;
      width: 24px;
      height: 24px;
      background-size: 100% 100%;
      background-color: aquamarine;
      mask-image: url('../assets/icons/minimize.svg');
    }
  }
  .download-full-list {
    color: var(--secondary);
    padding: 2px 16px;
    cursor: pointer;
    text-decoration: underline;
  }
  .title {
    margin: 12px 0 0;
  }
  .subtitle {
    margin: 0;
    font-size: 0.9em;
    color: var(--secondary-text);
  }

  table {
    width: 100%;
  }
  .table-caption {
    margin-top: 36px;
    margin-bottom: 8px;
    font-size: 1.4em;
    opacity: 0.4;
    justify-self: start;
    &.have-reward {
      margin-top: 18px;
    }
  }
  .winner-table {
    display: block;
    overflow: auto;
    .td.address {
      width: 222px;
    }
  }
  .td {
    padding: 2px 24px 4px 0;
  }
  &.has-result {
    height: 634px;
  }
}

.winner-trigger {
  --secondary: #39d0d8;

  position: fixed;
  right: 4vw;
  bottom: 4vh;
  width: 80px;
  height: 80px;
  background-color: var(--primary);
  border: 4px solid var(--secondary);
  border-radius: 50%;
  z-index: 99;
  cursor: pointer;
  display: grid;
  place-content: center;
  box-shadow: 0 0 32px var(--secondary);

  .icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    background-size: 100% 100%;
    background-color: aquamarine;
    mask-image: url('../assets/icons/reward.svg');
    &:hover {
      width: 32px;
      height: 32px;
      mask-image: url('../assets/icons/maximize.svg');
    }
  }
}

.TLDR {
  margin: 24px auto 120px;
  max-width: 880px;
  border-radius: 20px;
  border: 2px solid var(--secondary);
  padding: 32px 48px;

  table.TLDR-table {
    width: 60%;
    margin-bottom: 48px;
    th.th {
      padding: 12px 16px;
      color: var(--secondary-text);
    }
    td.td {
      padding: 4px 16px;
    }
  }
}
.footnote {
  display: block;
  color: var(--secondary-text);
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  text-decoration: underline;
  margin: 8px auto;
}

.row {
  display: flex;
  justify-content: space-between;
}
.box-grid {
  width: 100%;
  display: grid;
  gap: 96px;
  justify-content: center;
  align-items: start;
  grid-template-columns: repeat(auto-fit, minmax(~'min(200px, 80vw)', 428px));
}

.referrals {
  .box {
    max-width: 432px;
  }
  .icon-btns {
    width: max-content;
    display: grid;
    gap: 32px;
    grid-auto-flow: column;

    .icon-btn {
      width: 48px;
      height: 48px;
      border: 2px solid var(--secondary);
      padding: 0;
      display: grid;
      place-items: center;
      border-radius: 8px;
    }
    .icon {
      width: 24px;
      height: 24px;
    }
  }
}

.reward-details {
  background-color: var(--reward-card-bg);
  padding: 64px 5vw 96px;
  border-radius: 20px;
  margin-bottom: 64px;
  .title {
    font-weight: 500;
    font-size: 24px;
    line-height: 31px;
    color: var(--primary-text);
    margin-bottom: 20px;
  }
  ol {
    margin-bottom: 40px;
    li {
      font-size: 16px;
      line-height: 20px;
      color: var(--primary-text);
      margin: 16px;

      &::marker {
        font-size: 24px;
        line-height: 31px;
        color: var(--secondary);
      }
    }
  }
  hr {
    margin: 0;
    width: 320px;
    border: none;
    border-bottom: 1px solid var(--secondary);
    margin-bottom: 48px;
  }
  table {
    th {
      border-bottom: 1px solid var(--secondary-text);
      padding: 12px 16px;
      color: var(--secondary-text);
    }
    tr {
      td {
        border-bottom: 1px solid var(--secondary-text);
        padding: 12px 16px;
        vertical-align: top;
      }
      &:last-child {
        td {
          border-bottom: none;
        }
      }
    }
  }
}

.terms-conditions {
  .title {
    font-weight: 500;
    font-size: 24px;
    line-height: 31px;
    color: var(--primary-text);
  }
  .subtitle {
    font-size: 16px;
    line-height: 20px;
    color: var(--secondary-text);
  }
  ul {
    max-width: 800px;
    li {
      font-weight: 300;
      font-size: 14px;
      line-height: 1.8;
      color: var(--secondary-text);
      margin-bottom: 8px;
    }
  }
}
</style>

<style lang="less">
:root {
  background-color: #131a35;
}
.airdrop .wallet button {
  width: 100%;
  border: 2px solid var(--secondary);
  border-radius: 8px;
  padding: 8px 16px;
  height: auto;
  font-weight: 500;
  font-size: 20px;
  line-height: 26px;
  color: var(--secondary);
  &:hover {
    filter: brightness(0.8);
  }
  &:active {
    filter: brightness(0.5);
    transform: translate(1px, 1px);
  }
}
</style>
