<template>
  <div class="guide">
    <section class="page-title">
      <div class="page-sub-leading">Learn, Trade, Follow, Refer and Earn RAY</div>
      <div class="page-main-title">Raydium Bounty Airdrop</div>
    </section>

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
              <img :class="`icon ${haveSwap ? '' : 'muted'}`" src="../assets/icons/reward.svg" />
            </div>
          </div>
          <a href="/swap/" target="_blank"><button>GO TO SWAP</button></a>
        </div>

        <div class="box">
          <div class="box-title">
            Share to Twitter
            <div>
              <img :class="`icon ${haveTweet ? '' : 'muted'}`" src="../assets/icons/reward.svg" />
              <div class="point-label">BONUS +1 POINT / REFERRAL</div>
            </div>
          </div>
          <div class="btn-row">
            <a
              v-if="$accessor.wallet.connected"
              :href="
                (initBackendResponse.tasks &&
                  initBackendResponse.tasks.referral &&
                  initBackendResponse.tasks.referral.key) ||
                `https://twitter.com/intent/tweet?text=${getDefaultText()}`
              "
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              <button
                @click="
                  () => {
                    if (!$accessor.wallet.connected) {
                      $accessor.wallet.openModal()
                    } else {
                      submit({ task: 'referral', result: '' })
                    }
                  }
                "
              >
                <img class="icon" src="../assets/icons/guide-twitter-icon.svg" />TWEET NOW
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
              Follow & Retweet Raydium
              <div>
                <img :class="`icon ${haveFollow ? '' : 'muted'}`" src="../assets/icons/reward.svg" />
                <div class="point-label">+1 POINTS</div>
              </div>
            </div>
            <div class="btn-row">
              <a
                :href="
                  (initBackendResponse.tasks &&
                    initBackendResponse.tasks.twitter &&
                    initBackendResponse.tasks.twitter.key) ||
                  `https://twitter.com/RaydiumProtocol`
                "
                class="link"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <button
                  @click="
                    () => {
                      submit({ task: 'twitter', result: '' })
                    }
                  "
                >
                  <img class="icon" src="../assets/icons/guide-twitter-icon.svg" />FOLLOW
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
                <img :class="`icon ${haveDiscord ? '' : 'muted'}`" src="../assets/icons/reward.svg" />
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
                <img class="icon" src="../assets/icons/guide-discord-icon.svg" />JOIN DISCORD
              </button>
            </a>
            <button v-else @click="$accessor.wallet.openModal()">CONNECT WALLET</button>
          </div>

          <svg v-if="showLinkInput" class="step-gap-line social-media" viewBox="0 0 440 88">
            <polyline points="220,0 220,88" fill="none" stroke-width="2" stroke-dasharray="12" />
          </svg>

          <div v-if="showLinkInput" class="box form">
            <div class="box-title">Input Discord Username</div>
            <div class="input-box">
              <label>Discord Username</label>
              <input v-model="discordUserName" />
            </div>
            <button
              :disabled="$accessor.wallet.connected && !canSubmitDiscord"
              @click="
                () => {
                  if (!$accessor.wallet.connected) {
                    $accessor.wallet.openModal()
                  } else {
                    submit({ task: 'discord', result: discordUserName })
                  }
                }
              "
            >
              {{ $accessor.wallet.connected ? 'SUBMIT' : 'CONNECT WALLET'
              }}<img
                v-if="$accessor.wallet.connected"
                :class="`icon ${haveDiscord ? 'muted' : ''}`"
                src="../assets/icons/reward.svg"
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

        <div class="box-text">
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
            <img class="icon" src="../assets/icons/guide-share-icon.svg" />
          </button>
        </div>
      </div>
    </section>

    <section ref="details" class="reward-details">
      <div class="title">REWARD DETAILS</div>
      <ol>
        <li>
          Qualified users are defined as having connected a wallet, completed a swap, and completed Twitter verification
          by tweeting their customized referral code and @RaydiumProtocol. Qualified users will receive a minimum of 5
          points for the lucky airdrop pool and are eligible to receive an airdrop of up to $1,000 in RAY tokens.
        </li>
        <li>
          The first 4,000 users to be verified as having connected a wallet, swapping, twitter verification, and
          successfully referring at least 1 friend are guaranteed to win $10 in RAY tokens each. The aforementioned
          steps are worth 5 points in the lucky draw airdrop pool where verified users will also be eligible to receive
          an airdrop of up to $1,000 in RAY tokens.
        </li>
        <li>
          Qualified users can earn extra points for the lucky airdrop pool by completing bonus tasks; 1) Following
          Raydium, 2) Retweeting Raydium’s Airdrop Announcement, and 3) Joining the Raydium Discord, worth 1 entry each.
        </li>
        <li>
          The top 5 finishers on the referral leaderboard will win $2,000 in RAY tokens each. Referrals do not count as
          extra points for the lucky draw pool.
        </li>
        <li>
          Prizes for the lucky draw will be issued in descending order (ie: 3 winners of $1,000, 15 winners of $300, 100
          winners of $100, etc). Winners are ineligible to win multiple prizes from the lucky draw pool.
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
            <strong>First 4,000</strong> to Swap on Raydium, Complete Twitter Verification, Successfully Refer at least
            1 Friend
          </td>
          <td>4,000 Winners</td>
          <td>$10 of RAY tokens</td>
          <td>Guaranteed $10 airdrop + Lucky Draw Pool</td>
        </tr>
        <tr>
          <td style="white-space: pre-line">
            <strong>Lucky Draw Pool</strong> Swap on Raydium & Complete Twitter Verification (Worth 5 Entries)
            <br />
            <strong>Earn Bonus Entries!</strong> Follow Raydium, Retweet Raydium’s Binance Announcement, and Join us on
            Discord
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
            4000 Winners
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
          <td>All users who complete a swap and share their referral code to Twitter are eligible5</td>
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
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'

import { Input, Icon, Table, Checkbox } from 'ant-design-vue'
import { CampaignInfo } from '@/types/api'

@Component({
  head: {
    title: 'Raydium AcceleRaytor Guide'
  },

  components: {
    Input,
    Icon,
    Table,
    Checkbox
  },

  async asyncData({ $accessor, route }) {
    if (!$accessor.ido.initialized) {
      await $accessor.ido.requestInfos()
    }
    if (route.query?.referral) {
      window.localStorage.setItem('guide:referral', route.query?.referral as string)
    } else {
      const storedItem = window.localStorage.getItem('guide:referral')
      if (storedItem) location.href = `${window.location.origin}${window.location.pathname}?referral=${storedItem}`
    }
  }
})
export default class Guide extends Vue {
  inputContent = ''
  inputChecked = false
  initBackendResponse = {} as CampaignInfo // info from backend
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
  intervalTimer = 0

  mounted() {
    this.intervalTimer = window.setInterval(this.fetchData, 1000 * 60 * 3)
  }

  @Watch('initBackendResponse', { deep: true })
  getReferralLink(res: CampaignInfo) {
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
  checkCanSubmitDiscord(res: CampaignInfo) {
    this.canSubmitDiscord = !(res.tasks?.discard?.finished || res.tasks?.discard?.enabled)
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveTweet(res: CampaignInfo) {
    this.haveTweet = res.tasks?.referral?.finished || res.tasks?.referral?.enabled
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveFollow(res: CampaignInfo) {
    this.haveFollow = res.tasks?.twitter?.finished || res.tasks?.twitter?.enabled
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveDiscord(res: CampaignInfo) {
    this.haveDiscord = res.tasks?.discord?.finished || res.tasks?.discord?.enabled
  }

  @Watch('initBackendResponse', { immediate: true })
  checkHaveSwap(res: CampaignInfo) {
    this.haveSwap = res.tasks?.swap?.finished || res.tasks?.swap?.enabled
  }

  @Watch('$accessor.wallet.connected', { immediate: true })
  async fetchData() {
    if (this.$accessor.wallet.connected) {
      this.initBackendResponse =
        (await this.$api.getCompaign({
          address: this.$accessor.wallet.address,
          referral: (this.$route.query?.referral as string) || undefined
        })) ?? {}
    }
  }

  submit({
    task,
    result,
    sign
  }: {
    task: 'video' | 'twitter' | 'discord' | 'swap' | 'referral'
    result?: string
    sign?: string
  }) {
    this.$api.postCompaign({ address: this.initBackendResponse.user?.address, task, result, sign })
  }

  copyTextFromParagraph(text = '') {
    navigator.clipboard?.writeText(text).then(() => alert(`copied!\n\n${text}`))
  }

  getDefaultText() {
    const defaultText = `🎉 Join the Raydium Airdrop Bounty & Earn $2,000 in RAY \r\r${
      this.referralLink
    }\r\rMy code is: //${this.initBackendResponse?.user?.referral ?? ''}`
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
.guide {
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
  }
}

.box {
  position: relative;
  padding: 24px;
  border: 2px solid var(--secondary);
  box-shadow: 12px 12px 0 var(--secondary);
  background: var(--primary);
  max-width: 552px;
  border-radius: 20px;

  .box-title {
    font-weight: 500;
    font-size: 24px;
    line-height: 36px;
    color: var(--primary-text);
    margin-bottom: 36px;
    &.has-step {
      margin-right: 144px;
    }
  }
  .btn-row,
  button:not(.icon-btn) {
    width: 100%;
    grid-area: button;
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

  .box-text {
    margin-bottom: 1rem;
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
  height: 132px;
  stroke: var(--secondary);
  &.social-media {
    width: 440px;
    height: 88px;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 96px;
}

.referrals {
  .box {
    max-width: 432px;
  }
  .icon-btns {
    grid-area: button;
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
  padding: 64px 172px 96px;
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
    margin: 0 246px 116px;
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
.guide .wallet button {
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
