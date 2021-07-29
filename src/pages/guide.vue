<template>
  <div class="guide">
    <section class="title-part">
      <div class="sub-leading">Learn, Trade, Follow, Refer and Earn RAY</div>
      <div class="main-title">Raydium Bounty Airdrop</div>
      <div class="additional-description">in partnership with <img src="../assets/icons/binance-test-logo.svg" /></div>
    </section>

    <section class="step-game">
      <div class="btns">
        <button class="primary">GET STARTED</button>
        <button>REWARD DETAILS</button>
      </div>
      <svg class="p-1" viewBox="0 0 532 132">
        <polyline points="126,0 126,66 266,65 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>
      <div class="step-box watch-video">
        <div class="step-label">Step 1</div>
        <div class="step-title">Watch how to create a wallet on Solana and make your first Swap on Raydium.</div>
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
      <svg class="p-2" viewBox="0 0 532 132">
        <polyline points="266,0 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>
      <div class="step-box -2">
        <div class="step-label">Step 2</div>
        <div class="step-title">Swap on Raydium</div>
        <button>GO TO SWAP</button>
      </div>
      <svg class="p-3" viewBox="0 0 532 132">
        <polyline points="266,0 266,132" fill="none" stroke-width="2" stroke-dasharray="12" />
      </svg>
      <div class="step-box form">
        <div class="step-label">Step 3</div>
        <div class="step-title">Fill out the form to enter</div>
        <div class="input-box">
          <label>Binance User ID</label><a rel="nofollow noopener noreferrer">Where do I find it?</a>
          <input v-model="inputContent" />
        </div>
        <div class="check-box">
          <Checkbox v-model="inputChecked" class="checkbox" />
          <div class="text">
            I am the owner of this Binance UID and have decided that I want to share my Solana Wallet Address to receive
            +150 points for swapping on Raydium.
          </div>
        </div>
        <button>SUBMIT</button>
      </div>
    </section>

    <section class="media-entries">
      <div class="title">EARN MORE POINT BY COMPLETING THE FOLLOWING TASKS</div>
      <div class="box-grid">
        <div class="box">
          <div class="box-title">Compete in the RAY Trading Competition on Binance</div>
          <div class="point-label">+100 POINTS</div>
          <button :style="{ '--secondary': '#f3ba2f' }">
            <img class="icon" src="../assets/icons/guide-binance-icon.svg" />GO TO BINANCE
          </button>
        </div>
        <div class="box">
          <div class="box-title">Follow Raydium on Twitter</div>
          <div class="point-label">+10 POINTS</div>
          <button><img class="icon" src="../assets/icons/guide-twitter-icon.svg" />GO TO TWITTER</button>
        </div>
        <div class="box">
          <div class="box-title">Join the Raydium Discord</div>
          <div class="point-label">+10 POINTS</div>
          <button><img class="icon" src="../assets/icons/guide-discord-icon.svg" />JOIN DISCORD</button>
        </div>
        <div class="box">
          <div class="box-title">Retweet Raydium</div>
          <div class="point-label">+5 POINTS</div>
          <button><img class="icon" src="../assets/icons/guide-retweet-icon.svg" />RETWEET</button>
        </div>
      </div>
    </section>

    <section class="referrals">
      <div class="title">EARN BONUS POINTS FOR REFERRALS</div>
      <div class="box">
        <div class="box-title">Share this site with friends via your customized links below</div>
        <div class="point-label">+25 POINTS/ REFERRAL</div>
        <div class="icon-btns">
          <div class="icon-btn"><img class="icon" src="../assets/icons/guide-facebook-icon.svg" /></div>
          <div class="icon-btn"><img class="icon" src="../assets/icons/guide-twitter-icon-2.svg" /></div>
          <div class="icon-btn"><img class="icon" src="../assets/icons/guide-share-icon.svg" /></div>
        </div>
      </div>
    </section>

    <section class="reward-details">
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
  }
})
export default class Guide extends Vue {
  isVideoPlaying = false
  inputContent = ''
  inputChecked = false
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
  --video-bg: #231c73;
  --point-label-bg: #da2eef;
  --reward-card-bg: #191542;

  margin-left: 80px;
  margin-right: 80px;
  min-height: 100vh;
}
section {
  display: grid;
  justify-items: center;
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

.point-label {
  padding: 4px 12px;
  display: inline-block;
  background-color: var(--point-label-bg);
  color: var(--primary-text);
  border-radius: 1000px;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
}

.title-part {
  margin-top: 64px;
  margin-bottom: 52px;

  .sub-leading {
    font-size: 20px;
    line-height: 26px;
    color: var(--secondary);
    margin-bottom: 12px;
  }
  .main-title {
    font-weight: 500;
    font-size: 56px;
    line-height: 60px;
    color: var(--primary-text);
    margin-bottom: 8px;
  }
  .additional-description {
    font-size: 24px;
    line-height: 31px;
  }
}

.step-game {
  margin-bottom: 156px;

  .btns {
    display: grid;
    grid-auto-flow: column;
    gap: 40px;
  }
  button {
    width: 100%;
  }

  .step-box {
    padding: 24px;
    border: 2px solid var(--secondary);
    box-shadow: 12px 12px 0 var(--secondary);
    border-radius: 20px;
    background: var(--primary);
    position: relative;

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
    .step-title {
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
      color: var(--primary-text);
      margin-right: 144px;
      max-width: 316px;
      margin-bottom: 40px;
    }
    &.watch-video {
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
  .p-1,
  .p-2,
  .p-3 {
    width: 532px;
    height: 132px;
    stroke: var(--secondary);
  }
}
.box {
  max-width: 552px;
  padding: 32px 32px 40px;
  border: 2px solid var(--secondary);
  border-radius: 20px;
  background: var(--primary);
  position: relative;
  display: grid;
  grid-template:
    'title  point ' auto
    'button button' auto / 1fr auto;
  gap: 32px;
  align-items: center;

  .box-title {
    font-weight: 500;
    font-size: 24px;
    line-height: 28px;
    color: var(--primary-text);
  }
  button {
    grid-area: button;
    align-self: flex-end;
  }
}

.media-entries {
  margin-bottom: 144px;
  .title {
    font-weight: 500;
    font-size: 24px;
    line-height: 31px;
    color: var(--primary-text);
    margin-bottom: 72px;
    position: relative;
    max-width: 400px;
    text-align: center;
    &::after {
      position: absolute;
      content: '';
      bottom: -8px;
      right: 48px;
      width: 60%;
      height: 2px;
      background-color: var(--secondary);
    }
  }
  .box-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

.referrals {
  margin-bottom: 120px;
  .title {
    font-weight: 500;
    font-size: 24px;
    line-height: 31px;
    color: var(--primary-text);
    margin-bottom: 72px;
    position: relative;
    max-width: 420px;
    text-align: center;
    &::after {
      position: absolute;
      content: '';
      bottom: -8px;
      right: -32px;
      width: 60%;
      height: 2px;
      background-color: var(--secondary);
    }
  }
  .box .point-label {
    max-width: 116px;
    padding: 4px 16px;
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
