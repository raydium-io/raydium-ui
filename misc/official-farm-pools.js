const fs = require('fs')
const path = require('path')

;(function () {
  const file = path.join(__dirname, '../src/utils/farms.ts')
  const js = fs.readFileSync(file).toString()

  const regex = /export const FARMS: FarmInfo\[\] = ([\s\S]+)\.sort/g
  regex.test(js)
  let result = RegExp.$1

  result = result.replace(/reward:[\S ]+,/g, '')
  result = result.replace(/rewardB:[\S ]+,/g, '')
  result = result.replace(/version:[\S ]+,/g, '')
  result = result.replace(/(lp): { \.\.\.LP_TOKENS\[(\S+)\] },/g, '$1: $2,')
  result = result.replace(/(lp): { \.\.\.TOKENS\.(\S+) },/g, "$1: '$2',")

  const STAKE_PROGRAM_ID = 3
  const STAKE_PROGRAM_ID_V4 = 4
  const STAKE_PROGRAM_ID_V5 = 5

  const pools = eval(result)

  for (const { programId, poolId, lp } of pools) {
    if (programId === 3 && !lp.includes('-V4') && lp !== 'RAY') {
      continue
    }
    if (programId === 4) {
      continue
    }
    if (lp.includes('-V3')) {
      continue
    }

    const lpName = lp === 'RAY' ? 'MAINNET_SPL_TOKENS.RAY' : `MAINNET_LP_TOKENS.${lp.replace(/-/g, '_')}`
    console.log(`  {
  id: "${poolId}",
  lp: ${lpName},
  version: ${programId},
  },`)
  }
})()
