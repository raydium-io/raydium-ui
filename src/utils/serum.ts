// https://github.com/project-serum/serum-ts/blob/master/packages/serum/src/markets.json
// .forEach(m => {if (!m.deprecated) {console.log(`// ${m.name}\n`, `'${m.address}',`)}})

import { MARKETS as SERUM_MARKETS } from '@project-serum/serum/lib/tokens_and_markets'
import { LIQUIDITY_POOLS } from '@/utils/pools'
import { SERUM_PROGRAM_ID_V3 } from '@/utils/ids'

const MARKETS: Array<string> = []

for (const market of SERUM_MARKETS) {
  const address = market.address.toBase58()
  if (!market.deprecated && !(address in MARKETS)) {
    MARKETS.push(address)
  }
}

for (const market of LIQUIDITY_POOLS) {
  if (market.serumProgramId === SERUM_PROGRAM_ID_V3 && !(market.serumMarket in MARKETS)) {
    MARKETS.push(market.serumMarket)
  }
}

export { MARKETS }
