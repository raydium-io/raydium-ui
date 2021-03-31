const style = `
  background: #00BCD4;
  border-radius: 0.5em;
  color: white;
  font-weight: bold;
  padding: 2px 0.5em;
`

function logger(...args: any) {
  // eslint-disable-next-line
  console.info(`%c${new Date().toLocaleString()}`, style, ...args)
}
export default logger
