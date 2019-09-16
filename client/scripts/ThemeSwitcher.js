import _ from 'lodash'
import WindowAttached from '../helpers/WindowAttached'

export const THEMES = {
  WHITE: 'white',
  DARK: 'dark',
}

export default class ThemeSwitcher extends WindowAttached('ThemeSwitcher') {
  theme = THEMES.WHITE

  onSwitchTheme = _.noop

  setTheme = newTheme => {
    localStorage.setItem('theme', newTheme)
    document.body.setAttribute('theme', newTheme)
    this.theme = newTheme

    this.onSwitchTheme(this.theme)
  }

  switchTheme = () => {
    const newTheme = this.theme === THEMES.DARK ? THEMES.WHITE : THEMES.DARK
    this.setTheme(newTheme)
  }

  constructor({ onSwitchTheme }) {
    super()
    this.onSwitchTheme = onSwitchTheme
  }
}
