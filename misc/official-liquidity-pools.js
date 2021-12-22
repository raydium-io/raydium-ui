const fs = require('fs')
const path = require('path')

;(function () {
  const file = path.join(__dirname, '../src/utils/pools.ts')
  const js = fs.readFileSync(file).toString()

  const regex = /export const LIQUIDITY_POOLS: LiquidityPoolInfo\[\] = ([\s\S]+)/g
  regex.test(js)
  let result = RegExp.$1

  result = result.replace(/coin:[\S ]+,/g, '')
  result = result.replace(/pc:[\S ]+,/g, '')
  result = result.replace(/lp:[\S ]+,/g, '')
  result = result.replace(/programId:[\S ]+,/g, '')
  result = result.replace(/serumProgramId:[\S ]+,/g, '')
  result = result.replace(/ammQuantities:[\S ]+,/g, '')

  const pools = eval(result)

  for (const { version, name, ammId } of pools) {
    if (version === 4) {
      console.log(`  // ${name}
  "${ammId}",`)
    }
  }
})()
