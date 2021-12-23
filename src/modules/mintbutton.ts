export default function (_moduleOptions: any) {
  // @ts-ignore
  // this.options.head.script.push({
  //   src: `https://unpkg.com/@magiceden/mintbutton`,
  //   async: false
  // })

  // @ts-ignore
  this.options.head.script.push({
    src: `https://unpkg.com/@magiceden/mintbutton@latest/umd/runtime-main.js`,
    async: false
  })
  // @ts-ignore
  this.options.head.script.push({
    src: `https://unpkg.com/@magiceden/mintbutton@latest/umd/main.js`,
    async: false
  })
  // @ts-ignore
  this.options.head.script.push({
    src: `https://unpkg.com/@magiceden/mintbutton@latest/umd/2.js`,
    async: false
  })
  // @ts-ignore
  this.options.head.link.push({
    rel: 'stylesheet',
    href: `https://unpkg.com/@magiceden/mintbutton@latest/umd/main.css`,
    async: false
  })
}
