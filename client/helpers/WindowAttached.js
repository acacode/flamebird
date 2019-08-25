export default function WindowAttached(windowProperty) {
  return class WindowAttached {
    constructor() {
      window[windowProperty] = this
      console.log('WindowAttached windowProperty -> ', windowProperty, this)
    }
  }
}
