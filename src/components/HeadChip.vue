<template>
  <div class="head-chip">
    <div class="chip-name">The <span class="color-board">$100,000</span> Raydium Airdrop is live!</div>
    <NuxtLink to="/airdrop/">
      <button class="button-like">JOIN AIRDROP NOW</button>
    </NuxtLink>
  </div>
</template>

<style scoped>
.head-chip {
  display: flex;
  position: relative;
  justify-content: space-around;
  align-items: center;
  font-weight: 500;
  font-size: 18px;
  background-color: rgba(35, 28, 115, 0.5);
  height: 78px;
}
.head-chip .color-board {
  padding: 4px 8px;
  border-radius: 8px;
  position: relative;
}
.head-chip .color-board::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  background: linear-gradient(245.22deg, #da2eef 7.97%, #2b6aff 49.17%, #39d0d8 92.1%);
  border-radius: inherit;
  mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><rect rx='8' width='100%' height='100%' fill='none' stroke='black' stroke-width='4'/></svg>");
}
.head-chip button {
  color: #1b1659;
  background: #39d0d8;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  padding: 9px 27px;
}
.head-chip::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(245.22deg, #da2eef 7.97%, #2b6aff 49.17%, #39d0d8 92.1%);
}
</style>
