export default function (moduleOptions: any) {
  const options = {
    // @ts-ignore
    ...this.options.alexa,
    ...moduleOptions
  }

  if (!options.id) {
    console.warn('No id provided.')
    return
  }

  // @ts-ignore
  this.options.head.script.push({
    hid: 'alexa-script',
    innerHTML: `_atrk_opts = { atrk_acct:"${options.id}", domain:"raydium.io", dynamic: true};`
  })

  // @ts-ignore
  this.options.head.script.push({
    src: `https://certify-js.alexametrics.com/atrk.js`,
    async: true
  })

  // @ts-ignore
  this.options.head.noscript.push({
    hid: 'alexa-noscript',
    pbody: true,
    innerHTML: `<img src="https://certify.alexametrics.com/atrk.gif?account=${options.id}" style="display:none" height="1" width="1" alt="" />`
  })

  // @ts-ignore
  this.options.head.__dangerouslyDisableSanitizersByTagID['alexa-script'] = ['innerHTML']
  // @ts-ignore
  this.options.head.__dangerouslyDisableSanitizersByTagID['alexa-noscript'] = ['innerHTML']
}
