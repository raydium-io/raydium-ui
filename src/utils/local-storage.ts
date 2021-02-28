export default class LocalStorage {
  static get(name: string) {
    return localStorage.getItem(name)
  }

  static set(name: string, val: any) {
    return localStorage.setItem(name, val)
  }
}
