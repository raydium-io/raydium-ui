const fs = require('fs')
const path = require('path')

;(function () {
  const file = path.join(__dirname, '../src/utils/tokens.ts')
  const js = fs.readFileSync(file).toString()

  const regex =
    /export const TOKENS: Tokens = ([\s\S]+)export const LP_TOKENS: Tokens = ([\s\S]+)function addUserLocalCoinMint/g
  regex.test(js)
  let lpResult = RegExp.$2

  lpResult = lpResult.replace(/coin:[\S ]+,/g, '')
  lpResult = lpResult.replace(/pc:[\S ]+,/g, '')
  lpResult = lpResult.replace(/decimals:[\S ]+/g, '')

  const lpTokens = eval(`(${lpResult})`)
  for (const [key, { symbol, name, mintAddress }] of Object.entries(lpTokens)) {
    if (key.includes('-V4')) {
      const [_base, _quote] = symbol.split('-')
      let base = _base
      let quote = _quote

      if (base === 'SOL') {
        base = 'WSOL'
      }
      if (quote === 'SOL') {
        quote = 'WSOL'
      }

      console.log(`  ${_base}_${_quote}_V4: {
    symbol: "${_base}-${_quote}",
    name: "${_base}-${_quote} V4 LP",
    mint: "${mintAddress}",

    base: MAINNET_SPL_TOKENS.${base},
    quote: MAINNET_SPL_TOKENS.${quote},
    decimals: MAINNET_SPL_TOKENS.${base}.decimals,

    version: 4,
  },`)
    }
  }
})()
