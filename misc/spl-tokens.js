const fs = require('fs')
const path = require('path')

;(function () {
  const file = path.join(__dirname, '../src/utils/tokens.ts')
  const js = fs.readFileSync(file).toString()

  const regex =
    /export const TOKENS: Tokens = ([\s\S]+)export const LP_TOKENS: Tokens = ([\s\S]+)function addUserLocalCoinMint/g
  regex.test(js)
  const tokenResult = RegExp.$1

  const tokens = eval(`(${tokenResult})`)
  for (const { symbol, name, mintAddress, decimals } of Object.values(tokens)) {
    console.log(`  ${symbol}: {
    symbol: "${symbol}",
    name: "${name}",
    mint: "${mintAddress}",
    decimals: ${decimals},
    extensions: {
    },
  },`)
  }
})()
