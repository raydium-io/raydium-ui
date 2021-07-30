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
        *** Binance UID is required to receive airdrop. Don’t forget to enter your Binance account below.
      </div>
    </section>

    <section class="nav-btns">
      <button @click="to('details')">REWARD DETAILS</button>
    </section>

    <section class="media-entries">
      <div class="task-level">Task 1</div>
      <div class="title">Join Forces With Raydium</div>
      <div class="subtitle">Total Points +2</div>
      <div class="box-grid">
        <div class="box social-media">
          <div class="box-title">
            Follow & Retweet Raydium
            <div class="point-label">+1 POINTS</div>
          </div>
          <button><img class="icon" src="../assets/icons/guide-twitter-icon.svg" />GO TO TWITTER</button>
        </div>
        <div class="box social-media">
          <div class="box-title">
            Join the Raydium Discord
            <div class="point-label">+1 POINTS</div>
          </div>
          <button><img class="icon" src="../assets/icons/guide-discord-icon.svg" />JOIN DISCORD</button>
        </div>
      </div>
    </section>

    <section class="step-game">
      <div class="task-level">Task 2</div>
      <div class="title">Try Raydium’s Light Speed Swaps</div>
      <div class="subtitle">Total Points +7</div>

      <div ref="step-1" class="box watch-video">
        <div class="box-title has-step">
          Watch how to create a wallet on Solana and make your first Swap on Raydium.
        </div>
        <div class="video-box">
          <div
            v-if="!isVideoPlaying"
            class="play-icon"
            @click="
              () => {
                $refs.video.play()
                $refs.video.controls = true
              }
            "
          >
            <svg viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke-width="2" stroke="var(--secondary)" />
              <path
                d="M56.6667 37.6906C58.4445 38.717 58.4445 41.283 56.6667 42.3094L32.6667 56.1658C30.8889 57.1922 28.6667 55.9092 28.6667 53.8564L28.6667 26.1436C28.6667 24.0908 30.8889 22.8078 32.6667 23.8342L56.6667 37.6906Z"
                fill="var(--secondary)"
              />
            </svg>
          </div>
          <video
            ref="video"
            src="http://media.w3.org/2010/05/sintel/trailer.mp4"
            @pause="isVideoPlaying = false"
            @play="isVideoPlaying = true"
          />
        </div>
      </div>

      <svg class="step-gap-line" viewBox="0 0 532 132">
        <polyline points="266,0 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>

      <div class="box wallet">
        <div class="box-title has-step">Connect your Wallet</div>
        <Wallet />
      </div>

      <svg class="step-gap-line" viewBox="0 0 532 132">
        <polyline points="266,0 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>

      <div class="box">
        <div class="box-title has-step">
          Swap on Raydium
          <div class="point-label">+7 POINTS</div>
        </div>
        <NuxtLink to="/swap/">
          <button>GO TO SWAP</button>
        </NuxtLink>
      </div>
    </section>

    <section class="referrals">
      <div class="task-level">Task 3</div>
      <div class="title">Maximize Points By Referring Friends</div>
      <div class="subtitle">Referral Board Top 10 Earn $2,000 in RAY, each!</div>
      <div class="box">
        <div class="box-title">
          Refer now with your customized link below
          <div class="point-label">+1 POINTS / REFERRAL</div>
        </div>
        <div class="icon-btns">
          <button class="icon-btn">
            <a
              href="https://docs.google.com/forms/d/1Mk-x0OcI1tCZzL0Lj_WY8d02dMXsc-Z2AG3AaO6W_Rc/edit#responses"
              rel="nofollow noopener noreferrer"
              target="_blank"
              ><img class="icon" src="../assets/icons/guide-facebook-icon.svg"
            /></a>
          </button>
          <button class="icon-btn"><img class="icon" src="../assets/icons/guide-twitter-icon-2.svg" /></button>
          <button class="icon-btn"><img class="icon" src="../assets/icons/guide-share-icon.svg" /></button>
        </div>
      </div>
    </section>

    <section class="binance-id-form">
      <div class="task-level">Task 4</div>
      <div class="title">Trade on Binance</div>
      <div class="box form">
        <div class="box-title">Binance UID is Required to Receive Airdrop</div>
        <div class="input-box">
          <label>Binance User ID</label><a rel="nofollow noopener noreferrer">Where do I find it?</a>
          <input v-model="inputContent" />
        </div>
        <div class="check-box">
          <Checkbox v-model="inputChecked" class="checkbox" />
          <div class="text">I am the owner of this Binance account</div>
        </div>
        <button>SUBMIT</button>
      </div>

      <svg class="step-gap-line" viewBox="0 0 532 132">
        <polyline points="266,0 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>

      <div class="box">
        <div class="box-title">
          Trade 250 RAY on Binance
          <div class="point-label">+3 POINTS</div>
        </div>
        <button :style="{ '--secondary': '#f3ba2f' }">
          <img class="icon" src="../assets/icons/guide-binance-icon.svg" />GO TO BINANCE
        </button>
      </div>
    </section>

    <section ref="details" class="reward-details">
      <div class="title">REWARD DETAILS</div>
      <ol>
        <li>The first 4,000 users to be verified as completing all 4 tasks will win $20 in RAY tokens each.</li>
        <li>
          All users that are verified as completing a minimum of 2 out of 4 tasks will be entered into a random draw to
          win $10 of RAY tokens of which there will be 6,000 winners.
        </li>
        <li>
          All users that are verified as completing a minimum of 3 out of 4 tasks will be entered into a random draw to
          win $100 of RAY tokens of which there will be 100 winners.
        </li>
        <li>
          All users that are verified as completing 4 out of 4 tasks will be entered into a random draw to win $1,000 of
          RAY tokens of which there will be 40 winners.
        </li>
        <li>The top 5 finishers on the referral leaderboard will win $2,000 in RAY tokens each.</li>
      </ol>
      <hr />
      <table class="detail-panel">
        <tr>
          <th>Requirements</th>
          <th>Number of Winners</th>
          <th>Airdrop Amounts</th>
          <th>Airdrop Eligibility</th>
          <th>Total in USD</th>
        </tr>
        <tr>
          <td>First 1,000 to complete all 4 tasks</td>
          <td>1,000</td>
          <td>$20 of RAY tokens</td>
          <td>Guaranteed $20 airdrop</td>
          <td>$20 000</td>
        </tr>
        <tr>
          <td>Completed 2/4 tasks</td>
          <td>6,000</td>
          <td>$5 of RAY tokens</td>
          <td>Random draw for $5</td>
          <td>$30 000</td>
        </tr>
        <tr>
          <td>Completed 3/4 tasks</td>
          <td>2,000</td>
          <td>$40 of RAY tokens</td>
          <td>
            Random draw for $5 <br />
            + Random draw for $40
          </td>
          <td>$80 000</td>
        </tr>
        <tr>
          <td>Completed all 4 tasks</td>
          <td>1,000</td>
          <td>$50 of RAY tokens</td>
          <td>
            Random draw for $5 <br />
            + Random draw for $40 <br />
            + Random draw for $50 <br />
            + Guaranteed $20 airdrop <br />(if within first 4,000)
          </td>
          <td>$60 000</td>
        </tr>
        <tr>
          <td>Top 5 on the referral leaderboard</td>
          <td>5</td>
          <td>$2,000 of RAY tokens</td>
          <td>Random draw for $5</td>
          <td>$10 000</td>
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
import { Vue, Component } from 'nuxt-property-decorator'

import { Input, Icon, Table, Checkbox } from 'ant-design-vue'

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

  async asyncData({ $accessor }) {
    if (!$accessor.ido.initialized) {
      await $accessor.ido.requestInfos()
    }
  },

  mounted() {
    window.addEventListener('beforeunload', function (ev) {
      ev.preventDefault()
      ev.returnValue = 'hello' // not work
      return 'world' // not work
    })
  }
})
export default class Guide extends Vue {
  isVideoPlaying = false
  inputContent = ''
  inputChecked = false

  to(anchor: 'step-1' | 'details') {
    const el = this.$refs[anchor] as Element | undefined
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth' })
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

  button:not(.icon-btn) {
    width: 100%;
    grid-area: button;
    align-self: flex-end;
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
    max-width: 800px;
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
