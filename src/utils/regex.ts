// https://github.com/pancakeswap/pancake-swap-interface/blob/master/src/utils/index.ts

// eslint-disable-next-line
export const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
