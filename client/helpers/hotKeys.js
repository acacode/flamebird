export const clearifyEvent = (e = window.event) => {
  e.preventDefault()
  e.stopPropagation()
}
