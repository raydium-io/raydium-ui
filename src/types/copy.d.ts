export interface CopyTextInterface {
  action: string
  text: string
  trigger: String | HTMLElement | HTMLCollection | NodeList
  clearSelection: () => void
}
