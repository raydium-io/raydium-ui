<template>
  <div class="page-container">
    <div class="card forsted-glass lightsmoke">
      <div class="page-title">Disclaimer</div>
      <div class="content">
        <div class="paragraph">
          This website-hosted user interface (this “Interface”) is made available by the Raydium Holding Foundation.
        </div>
        <div class="paragraph">
          This Interface is an open source software portal to Raydium, a protocol which is a community-driven collection
          of blockchain-enabled smart contracts and tools maintained by the Raydium Holding Foundation.
        </div>
        <div class="paragraph">
          THIS INTERFACE AND THE RAYDIUM PROTOCOL ARE PROVIDED ”AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY
          KIND. The Raydium Holding Foundation does not provide, own, or control Raydium. By using or accessing this
          Interface or Raydium, you agree that no developer or entity involved in creating, deploying or maintaining
          this Interface or Raydium will be liable for any claims or damages whatsoever associated with your use,
          inability to use, or your interaction with other users of, this Interface or Raydium, including any direct,
          indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits,
          cryptocurrencies, tokens, or anything else of value.
        </div>
        <div class="paragraph">
          By using or accessing this Interface, you represent that you are not subject to sanctions or otherwise
          designated on any list of prohibited or restricted parties or excluded or denied persons, including but not
          limited to the lists maintained by the United States’ Department of Treasury’s Office of Foreign Assets
          Control, the United Nations Security Council, the European Union or its Member States, or any other government
          authority.
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { Icon, Popover } from 'ant-design-vue'

@Component({
  components: {
    Icon,
    Popover
  },
  layout: 'home'
})
export default class Index extends Vue {}
</script>
<style scoped>
.forsted-glass {
  position: relative;
  backdrop-filter: blur(var(--blur-size));
  color: var(--text-color);
  border-radius: var(--border-radius);
  background: linear-gradient(126.7deg, var(--bg-board-color) 28.7%, var(--bg-board-color-2, var(--bg-board-color)));
}
.forsted-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.7;
  background: transparent;
  border-radius: inherit;
  box-shadow: inset 0 0 0 var(--border-line-width, 1.5px) var(--border-color);
  mask-image: radial-gradient(at -31% -58%, hsl(0, 0%, 0%, 0.5) 34%, transparent 60%),
    linear-gradient(to left, hsl(0, 0%, 0%, 0.2) 0%, transparent 13%),
    linear-gradient(hsl(0deg 0% 0% / 5%), hsl(0deg 0% 0% / 5%));
}
.forsted-glass.buriedlightsmoke,
.forsted-glass.lightsmoke {
  --border-color: hsl(0, 0%, 100%);
  --bg-board-color: hsl(0, 0%, 100%, 0.08);
  --bg-board-color-2: hsl(0, 0%, 100%, 0);
  --text-color: hsl(0, 0%, 100%);
  --blur-size: 1.5px;
  --border-radius: 20px;
  --border-line-width: 2px;
}
</style>
<style lang="less" scoped>
.page-container {
  padding: 4vw 20vh;
  min-height: 100vh;
  background-color: #141041;
  background-image: url('../../assets/background/index_page_background.webp');
  background-size: 100%;
  background-repeat: no-repeat;
  display: flow-root;
}
.card {
  padding: 4% 8%;

  .page-title {
    text-align: center;
    font-size: 48px;
    margin-bottom: 20px;
  }
  .paragraph {
    color: hsl(222deg, 100%, 84%);
    margin-bottom: 16px;
    line-height: 1.7;
  }
}
</style>
