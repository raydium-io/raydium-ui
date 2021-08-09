<template>
  <div class="guide">
    <section class="page-title">
      <div class="page-sub-leading">Learn, Trade, Follow, Refer and Earn RAY</div>
      <div class="page-main-title">Raydium Bounty Airdrop</div>
      <div class="page-additional-description">
        in partnership with <img src="../assets/icons/binance-test-logo.svg" />
      </div>
    </section>

    <section class="TLDR">
      <div class="title">Earn up to $2,000 in RAY in 4 easy steps</div>
      <table class="TLDR-table">
        <tr>
          <th class="th"></th>
          <th class="th">Task</th>
          <th class="th">Points</th>
        </tr>
        <tr>
          <td class="td order">1</td>
          <td class="td">Follow Socials</td>
          <td class="td"><div class="point-label">+2 POINTS</div></td>
        </tr>
        <tr>
          <td class="td order">2</td>
          <td class="td">Swap on Raydium</td>
          <td class="td"><div class="point-label">+7 POINTS</div></td>
        </tr>
        <tr>
          <td class="td order">3</td>
          <td class="td">Refer Friends</td>
          <td class="td"><div class="point-label">+1 POINTS / REFERRAL</div></td>
        </tr>
        <tr>
          <td class="td order">4</td>
          <td class="td">Trade 250 RAY</td>
          <td class="td"><div class="point-label">+3 POINTS</div></td>
        </tr>
      </table>
      <div class="footnote">
        * Binance UID is required to receive airdrop. Don’t forget to enter your Binance account below.
      </div>
    </section>

    <section class="nav-btns">
      <button @click="to('details')">REWARD DETAILS</button>
    </section>

    <section class="step-game">
      <div class="task-level">Task 1</div>
      <div class="title">Watch video</div>
      <div class="subtitle">Total Points +7</div>

      <div ref="step-1" class="box watch-video">
        <div class="box-title has-step">
          Watch how to create a wallet on Solana and make your first Swap on Raydium.
        </div>
        <div class="video-box">
          <iframe
            width="100%"
            height="480"
            src="https://www.youtube.com/embed/gFd12SBXcJs"
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
        <div class="box-title has-step">Connect wallet so we can recognize you</div>
        <Wallet />
      </div>
    </section>

    <section class="connect-wallet">
      <div class="task-level">Task 2</div>
      <div class="title">Try Raydium’s Light Speed Swaps</div>
      <div class="box">
        <div class="box-title has-step">
          Swap on Raydium
          <div class="point-label">+7 POINTS</div>
        </div>
        <a href="/swap/" target="_blank"><button>GO TO SWAP</button></a>
      </div>
    </section>

    <section class="media-entries">
      <div class="task-level">Task 3</div>
      <div class="title">Join Forces With Raydium</div>
      <div class="subtitle">Total Points +2</div>
      <div class="box-grid">
        <div class="twitter">
          <div class="box social-media">
            <div class="box-title">
              Follow & Retweet Raydium
              <div class="point-label">+1 POINTS</div>
            </div>
            <div class="btn-row">
              <a
                :href="`https://twitter.com/RaydiumProtocol`"
                class="link"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <button><img class="icon" src="../assets/icons/guide-twitter-icon.svg" />FELLOW</button>
              </a>
              <a
                :href="`https://twitter.com/intent/tweet?text=${getDefaultText()}`"
                class="link"
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                <button @click="showLinkInput = true">
                  <img class="icon" src="../assets/icons/guide-twitter-icon.svg" />RETWEET
                </button>
              </a>
            </div>
          </div>

          <svg v-if="showLinkInput" class="step-gap-line social-media" viewBox="0 0 440 88">
            <polyline points="220,0 220,88" fill="none" stroke-width="2" stroke-dasharray="12" />
          </svg>

          <div v-if="showLinkInput" class="box form">
            <div class="box-title">Paste Retweet Link</div>
            <div class="input-box">
              <label>Retweet Link</label>
              <input v-model="retweetLink" />
            </div>
            <button @click="() => submit({ task: 'twitter', result: retweetLink })">SUBMIT</button>
          </div>
        </div>
        <div class="discord">
          <div class="box social-media">
            <div class="box-title">
              Join the Raydium Discord
              <div class="point-label">+1 POINTS</div>
            </div>
            <a
              href="https://discord.com/invite/6EvFwvCfpx"
              class="link"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              <button @click="() => submit({ task: 'twitter', result: '' })">
                <img class="icon" src="../assets/icons/guide-discord-icon.svg" />JOIN DISCORD
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="referrals">
      <div class="title">Tell your Friends about us</div>
      <div class="subtitle">balabalabala</div>
      <div class="box">
        <div class="box-title">
          Refer now with your customized link below
          <div class="point-label">+1 POINTS / REFERRAL</div>
        </div>

        <div class="box-text">
          your referral link:
          <br />
          {{ referralLink }}
        </div>

        <div class="icon-btns">
          <button class="icon-btn" title="click here to copy it" @click="copyTextFromParagraph(referralLink)">
            <img class="icon" src="../assets/icons/guide-share-icon.svg" />
          </button>
        </div>
      </div>
    </section>

    <section ref="details" class="reward-details">
      <div class="title">REWARD DETAILS</div>
      <ol>
        <li>
          Qualified users are defined as having connected a wallet, completing a swap, and completing twitter
          verification by sharing their customized referral code and @RaydiumProtocol. Qualified users will receive a
          minimum of 3 entries in the lucky airdrop pool and are eligible to receive an airdrop of up to $1,000 in RAY
          tokens.
        </li>
        <li>
          The first 4,000 users to be verified as completing wallet connecting, swapping, twitter verification, and
          successfully referring at least 1 friend are guaranteed to win $10 in RAY tokens each. The aforementioned
          steps are worth 5 entries in the lucky draw airdrop pool where verified users will also be eligible to receive
          an airdrop of up to $1,000 in RAY tokens.
        </li>
        <li>
          Qualified users can earn extra entries for the lucky airdrop pool by completing the bonus tasks; 1) Following
          Raydium, 2) Retweeting Raydium’s Binance Announcement, and 3) Joining the Raydium Discord worth 1 entry each.
        </li>
        <li>
          The top 5 finishers on the referral leaderboard will win $2,000 in RAY tokens each. Referrals do not count as
          extra entries for the lucky draw pool.
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
          <th>Number of Winners</th>
          <th>Airdrop Amounts</th>
          <th>Airdrop Eligibility</th>
        </tr>
        <tr>
          <td>
            <strong>First 5,000</strong> to Swap on Raydium, Complete Twitter Verification, Successfully Refer at least
            1 Friend
          </td>
          <td>5,000 Winners</td>
          <td>$10 of RAY tokens</td>
          <td>Guaranteed $5 airdrop + Lucky Draw Pool</td>
        </tr>
        <tr>
          <td>
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
          <td></td>
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
      <div class="subtitle">subject to change</div>
      <ul>
        <li>Bounty rewards will be distributed in RAY tokens, at a rate of 1 RAY token = $XX USD</li>
        <li>
          Users that qualify for a guaranteed airdrop of the equivalent of $20 in RAY tokens are also eligible to
          participate and win the random draws for the $10, $100 and $1,000 bounty rewards. However, participants will
          not be able to win multiple lucky draws.
        </li>

        <li>
          Users will need to verify their completion of tasks 1-3 via the Raydium Airdrop Page in order to qualify for
          the random draws.
        </li>

        <li>The random draws to select the winners will be made by the Raydium team.</li>
        <li>
          Users are limited to one entry per Binance account. Any multiple entries will result in disqualification of
          all entries.
        </li>

        <li>
          Binance reserves the right to cancel or amend any Activity Rules at our sole discretion, as well as the final
          interpretation of user task completion.
        </li>

        <li>
          Rewards will be distributed to eligible participants before the time of trading. Users will be able to confirm
          receipt of the rewards via the “Distribution History” page in the Wallet page.
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

  async asyncData({ $accessor, $api, route }) {
    if (!$accessor.ido.initialized) {
      await $accessor.ido.requestInfos()
    }
    const initBackendResponse = await $api.getCompaign({
      address: '111111111',
      referral: (route.query.referral as string) || undefined
    })
    return {
      initBackendResponse
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
  discordLink = ''
  referralLink = ''

  @Watch('initBackendResponse', { immediate: true, deep: true })
  getReferralLink(res: CampaignInfo) {
    this.referralLink = `${window.location.href}${res.user.referral ? `referral=${res.user?.referral}` : ''}`
  }

  to(anchor: 'step-1' | 'details') {
    // const reu = this.$route.path
    const el = this.$refs[anchor] as Element | undefined
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth' })
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
    this.$api.postCompaign({ address: this.initBackendResponse.user.address, task, result, sign })
  }

  copyTextFromParagraph(text = '') {
    navigator.clipboard?.writeText(text).then(() => alert(`copied!\n\n${text}`))
  }

  getDefaultText() {
    console.log({ ...this.$route })
    const defaultText = 'hello 😳\rit is a $test'
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

  margin-left: 20vw;
  margin-right: 20vw;
  min-height: 100vh;
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
    margin-left: 32px;
  }
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
    gap: 8px;
    > button {
      width: unset;
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

  .footnote {
    color: var(--secondary-text);
    font-size: 14px;
    line-height: 18px;
  }
}

.media-entries {
  .box-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 96px;
  }
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
    margin: 32px 246px 116px;
    li {
      font-weight: 300;
      font-size: 14px;
      line-height: 18px;
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
