export function throwIfUndefined<T>(
  value: T | undefined,
  message = 'Not found'
): T {
  if (value === undefined) {
    throw new Error(message)
  }
  return value
}

export function throwIfNull<T>(value: T | null, message = 'Not found'): T {
  if (value === null) {
    throw new Error(message)
  }
  return value
}

export function throwIfEmpty<T>(
  value: Array<T>,
  message = 'Not found'
): Array<T> {
  if (value.length === 0) {
    throw new Error(message)
  }
  return value
}
