export const actions = {
  copy({ _commit }: { _commit: any }, text: string) {
    const copy = (this as any)._vm.$copyText
    const notify = (this as any)._vm.$notify

    copy(text)
      .then(() => {
        notify.success({
          message: 'Copy success',
          description: '',
        })
      })
      .catch(() => {
        notify.error({
          message: 'Copy failed',
          description: '',
        })
      })
  },
}
