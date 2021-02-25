export default function importIcon(path: string) {
  try {
    return require(`../assets${path}`)
  } catch (e) {
    return ''
  }
}
