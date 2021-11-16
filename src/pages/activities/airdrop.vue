<template>
  <div class="airdrop">
    <section class="page-title">
      <div class="page-sub-leading">Learn, Trade, Follow, Refer and Earn RAY</div>
      <div class="page-main-title">Raydium Bounty Airdrop</div>
      <div class="page-additional-description">
        The Airdrop is <span class="alert">complete!</span> Rewards have been sent to winners, connect your wallet to
        see results!
      </div>
    </section>

    <section v-if="isWinningPanelOpen" :class="`box winner-panel ${$accessor.wallet.connected ? 'has-result' : ''}`">
      <div class="close-btn" @click="isWinningPanelOpen = false">
        <div class="icon minimize" />
      </div>

      <a v-if="rewardIsOut" class="download-full-list" href="/activities/winner-list/" target="_blank">
        Check Winners
      </a>

      <div class="title">Airdrop Points</div>

      <div v-if="rewardIsOut" class="note" style="text-align: center; margin-top: 12px">
        Rewards have already been sent to winning addresses
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
          <div v-if="!rewardIsOut">Cacluating...</div>
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
        <div v-else>Cacluating...</div>
      </template>
      <template v-else>
        <div class="subtitle">Connect wallet to view your current points</div>
        <button @click="$accessor.wallet.openModal()">CONNECT WALLET</button>
      </template>
    </section>

    <div v-else class="winner-trigger" @click="isWinningPanelOpen = true">
      <div class="icon" />
    </div>

    <section class="TLDR">
      <div class="title">Earn up to $2,000 in RAY in 3 easy steps</div>
      <table class="TLDR-table">
        <tr>
          <th class="th"></th>
          <th class="th">Task</th>
          <th class="th">Points</th>
        </tr>
        <tr>
          <td class="td order">1</td>
          <td class="td">Swap & Confirm Referral</td>
          <td class="td"><div class="point-label">+5 POINTS</div></td>
        </tr>
        <tr>
          <td class="td order">2</td>
          <td class="td">Earn Bonus Entries</td>
          <td class="td"><div class="point-label">+2 POINTS</div></td>
        </tr>
        <tr>
          <td class="td order">3</td>
          <td class="td">Refer More Friends</td>
          <td class="td"><div class="point-label">+1 POINT / REFERRAL</div></td>
        </tr>
      </table>
    </section>

    <section class="nav-btns">
      <button @click="to('details')">REWARD DETAILS</button>
    </section>

    <section class="step-game">
      <div class="task-level">STEP 1</div>
      <div class="title">Get Started on Raydium</div>

      <div ref="step-1" class="box watch-video">
        <div class="box-title has-step">
          Watch how to create a wallet on Solana and make your first Swap on Raydium.
        </div>
        <div class="video-box">
          <iframe
            width="100%"
            height="480"
            src="https://www.youtube.com/embed/ViFSfsAqSLg"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <a :href="`https://youtu.be/XUnEQ6cy9WI`" rel="nofollow noopener noreferrer" target="_blank" class="footnote"
          >Chinese Version</a
        >
      </div>

      <svg class="step-gap-line" viewBox="0 0 532 132">
        <polyline points="266,0 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>

      <div class="box wallet">
        <div class="box-title has-step">Connect wallet to recieve airdrop rewards</div>
        <div class="box-text">
          <div>
            Download<a href="https://phantom.app/" rel="nofollow noopener noreferrer" target="_blank">
              Phantom (desktop)
            </a>
          </div>
          <div>
            On mobile? Try
            <a href="https://sollet.io" rel="nofollow noopener noreferrer" target="_blank">Sollet</a>
          </div>
        </div>
        <Wallet />
      </div>
    </section>

    <section class="connect-wallet">
      <div class="task-level">STEP 2</div>
      <div class="title">Try Raydium’s Light Speed Swaps & Confirm Referral</div>
      <div class="subtitle">Total Points +5</div>
      <div class="box-grid">
        <div class="box">
          <div class="box-title has-step">
            Swap on Raydium
            <div>
              <div
                :class="`icon-reward ${haveSwap ? 'finished' : isSwapPending ? 'pending' : 'muted'}`"
                :title="`${
                  haveSwap
                    ? 'Congratulations! You completed this task.'
                    : isSwapPending
                    ? 'Points pending. Please check again in 30 minutes.'
                    : 'you have not done this task'
                }`"
              />
            </div>
          </div>
          <a href="/swap/" target="_blank" style="align-self: end"><button>GO TO SWAP</button></a>
        </div>

        <div class="box">
          <div class="box-title">
            Share to Twitter
            <div>
              <div
                :class="`icon-reward ${haveTweet ? 'finished' : isTweetPending ? 'pending' : 'muted'}`"
                :title="`${
                  haveTweet
                    ? 'Congratulations! You completed this task.'
                    : isTweetPending
                    ? 'Points pending. Please check again in 30 minutes.'
                    : 'you have not done this task'
                }`"
              />
              <div class="point-label">BONUS +1 POINT / REFERRAL</div>
            </div>
          </div>

          <div class="box-text red">*Tweet must include referral code for API tracking</div>

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
                <img class="icon" src="../../assets/icons/guide-twitter-icon.svg" />TWEET NOW
              </button>
            </a>
            <button v-else @click="$accessor.wallet.openModal()">CONNECT WALLET</button>
          </div>
        </div>
      </div>
    </section>

    <section class="media-entries">
      <div class="task-level">EARN BONUS POINTS</div>
      <div class="title">Join Forces With Raydium</div>
      <div class="subtitle">Total Points +2</div>
      <div class="box-grid">
        <div class="twitter">
          <div class="box social-media">
            <div class="box-title">
              Follow Raydium
              <div>
                <div
                  :class="`icon-reward ${haveFollow ? 'finished' : isFollowPending ? 'pending' : 'muted'}`"
                  :title="`${
                    haveFollow
                      ? 'Congratulations! You completed this task.'
                      : isFollowPending
                      ? 'Points pending. Please check again in 30 minutes.'
                      : 'you have not done this task'
                  }`"
                />
                <div class="point-label">+1 POINTS</div>
              </div>
            </div>
            <div class="btn-row">
              <a
                :href="`https://twitter.com/RaydiumProtocol`"
                class="link"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <button
                  @click="
                    () => {
                      !isActivityEnd && submit({ task: 'twitter', result: '' })
                    }
                  "
                >
                  <img class="icon" src="../../assets/icons/guide-twitter-icon.svg" />FOLLOW
                </button>
              </a>
            </div>
          </div>
        </div>
        <div class="discord">
          <div class="box social-media">
            <div class="box-title">
              Join the Raydium Discord
              <div>
                <div
                  :class="`icon-reward ${haveDiscord ? 'finished' : isDiscordPending ? 'pending' : 'muted'}`"
                  :title="`${
                    haveDiscord
                      ? 'Congratulations! You completed this task.'
                      : isDiscordPending
                      ? 'Points pending. Please check again in 30 minutes.'
                      : 'you have not done this task'
                  }`"
                />
                <div class="point-label">+1 POINT</div>
              </div>
            </div>
            <a
              v-if="$accessor.wallet.connected"
              href="https://discord.com/invite/6EvFwvCfpx"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              <button
                @click="
                  () => {
                    if (!$accessor.wallet.connected) {
                      $accessor.wallet.openModal()
                    } else {
                      showLinkInput = true
                    }
                  }
                "
              >
                <img class="icon" src="../../assets/icons/guide-discord-icon.svg" />JOIN DISCORD
              </button>
            </a>
            <button v-else @click="$accessor.wallet.openModal()">CONNECT WALLET</button>
          </div>

          <svg
            v-if="!isActivityEnd && showLinkInput && !haveDiscord"
            class="step-gap-line social-media"
            viewBox="0 0 440 88"
          >
            <polyline points="220,0 220,88" fill="none" stroke-width="2" stroke-dasharray="12" />
          </svg>

          <div v-if="!isActivityEnd && showLinkInput && !haveDiscord" class="box form">
            <div class="box-title">Input Discord Username</div>
            <div class="input-box">
              <label>Discord Username</label>
              <input v-model="discordUserName" />
            </div>
            <button
              :disabled="$accessor.wallet.connected && (!canSubmitDiscord || isDiscording)"
              @click="submitDiscord"
            >
              {{ $accessor.wallet.connected ? (isDiscording ? 'SUBMITING...' : 'SUBMIT') : 'CONNECT WALLET' }}
              <div
                v-if="$accessor.wallet.connected"
                :class="`icon ${haveDiscord ? 'finished' : isDiscordPending ? 'pending' : 'muted'}`"
                :title="`${
                  haveDiscord
                    ? 'Congratulations! You completed this task.'
                    : isDiscordPending
                    ? 'Points pending. Please check again in 30 minutes.'
                    : 'you have not done this task'
                }`"
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="referrals">
      <div class="title">Share With More Friends</div>
      <div class="subtitle">To Earn $2,000 in RAY</div>
      <div class="box">
        <div class="box-title">
          Refer now with your customized link below
          <div class="point-label">+1 POINT / REFERRAL</div>
        </div>

        <div class="box-text small">
          Your referral link:
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
            <img class="icon" src="../../assets/icons/guide-share-icon.svg" />
          </button>
        </div>
      </div>
    </section>

    <section ref="details" class="reward-details">
      <div class="title">REWARD DETAILS</div>
      <ol>
        <li>
          Qualified users are defined as having connected a wallet, completed a swap, and completed Twitter verification
          by tweeting their customized referral code. Qualified users will receive a minimum of 5 points for the lucky
          airdrop pool and are eligible to receive an airdrop of up to $1,000 in RAY tokens.
        </li>
        <li>
          The first 4,000 users to connect a wallet, swap, verify Twitter, and refer at least 1 qualified user are
          guaranteed to win $10 in RAY tokens each. The aforementioned steps are worth 5 points in the lucky draw
          airdrop pool where verified users will also be eligible to receive an airdrop of up to $1,000 in RAY tokens.
        </li>
        <li>
          Qualified users can earn extra points for the lucky airdrop pool by completing bonus tasks; 1) Following
          Raydium on Twitter and 2) Joining the Raydium Discord, worth 1 entry each.
        </li>
        <li>
          The top 5 finishers on the referral leaderboard will win $2,000 in RAY tokens each. Referrals do not count as
          extra points for the lucky draw pool.
        </li>
        <li>
          Prizes for the lucky draw will be issued in descending order (ie: 3 winners of $1,000, 15 winners of $300, 100
          winners of $100, 250 winners of $50, and 1,000 winners of $20). Winners are ineligible to win multiple prizes
          from the lucky draw pool.
        </li>
      </ol>
      <hr />
      <table class="detail-panel">
        <tr>
          <th>Requirements</th>
          <th style="width: 200px">Number of Winners</th>
          <th style="width: 200px">Airdrop Amounts</th>
          <th>Airdrop Eligibility</th>
        </tr>
        <tr>
          <td>
            <strong>First 4,000</strong> to Swap on Raydium, Complete Twitter Verification, & Successfully Refer at
            least 1 Friend
          </td>
          <td>4,000 Winners</td>
          <td>$10 of RAY tokens</td>
          <td>Guaranteed $10 airdrop + Lucky Draw Pool</td>
        </tr>
        <tr>
          <td style="white-space: pre-line">
            <strong>Lucky Draw Pool</strong> Swap on Raydium & Complete Twitter Verification (Worth 5 Entries)
            <br />
            <strong>Earn Bonus Entries!</strong> Follow Raydium and Join us on Discord
          </td>
          <td>
            3 Winners
            <div class="ghost-line" />
            15 Winners
            <div class="ghost-line" />
            100 Winners
            <div class="ghost-line" />
            250 Winners
            <div class="ghost-line" />
            1000 Winners
          </td>
          <td>
            $1,000 of RAY tokens
            <div class="ghost-line" />
            $300 of RAY tokens
            <div class="ghost-line" />
            $100 of RAY tokens
            <div class="ghost-line" />
            $50 of RAY tokens
            <div class="ghost-line" />
            $20 of RAY tokens
          </td>
          <td>All users who complete a swap and share their referral code to Twitter are eligible</td>
        </tr>
        <tr>
          <td><strong>Top 5 on the referral leaderboard</strong></td>
          <td>5 Winners</td>
          <td>$2,000 of RAY tokens</td>
          <td>Guaranteed $2,000 airdrop</td>
        </tr>
      </table>
    </section>

    <section class="teams-conditions">
      <div class="title">TEAMS & CONDITIONS</div>
      <ul>
        <li>
          Users that qualify for a guaranteed airdrop of the equivalent of $10 in RAY tokens are also eligible to
          participate and win the random draws for the $20, $50, $100, $300, and $1,000 in rewards. However,
          participants will not be able to win multiple lucky draws.
        </li>

        <li>
          Users will need to verify their completion of tasks via the Raydium Airdrop Page in order to qualify for the
          lucky draw. Lucky draw winners will be selected by the Raydium team.
        </li>

        <li>
          Raydium reserves the right to cancel or amend any Activity Rules at our sole discretion, as well as the final
          interpretation of user task completion.
        </li>

        <li>
          Rewards will be distributed to eligible participants via the address linked to the account they used to swap.
        </li>

        <li>The airdrop campaign will conclude at 12:00 (UTC) on August 19.</li>
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

  async asyncData({ $accessor, route }) {
    if (!$accessor.ido.initialized) {
      await $accessor.ido.requestInfos()
    }
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
  --secondary: #8d9695;
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
  mask-image: url('../../assets/icons/reward.svg');
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
      mask-image: url('../../assets/icons/minimize.svg');
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
    mask-image: url('../../assets/icons/reward.svg');
    &:hover {
      width: 32px;
      height: 32px;
      mask-image: url('../../assets/icons/maximize.svg');
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

.teams-conditions {
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
