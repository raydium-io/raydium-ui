const fs = require('fs')
const path = require('path')

;(() => {
  const file = path.join(__dirname, '../dist/airdrop/index.html')
  const html = fs.readFileSync(file).toString()
  const url = 'https://raydium.io'

  const newHtml = html.replace(
    '</head>',
    `<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:url" content="${url}"/><meta name="twitter:title" content="Raydium Bounty Airdrop"/><meta name="twitter:description" content="To continue recent momentum and further drive growth for the Solana ecosystem, Raydium is launching a bounty airdrop campaign."/><meta name="twitter:image" content="${url}/airdrop.jpg"/></head>`
  )
  fs.writeFileSync(file, newHtml, 'utf-8')
})()
