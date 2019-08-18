import WindowAttached from '../helpers/WindowAttached'

const THEMES = {
  WHITE: 'white',
  DARK: 'dark',
}

export default new (class ThemeSwitcher extends WindowAttached('Theme') {
  theme = THEMES.WHITE

  setTheme = newTheme => {
    localStorage.setItem('theme', newTheme)
    document.body.setAttribute('theme', newTheme)
    this.theme = newTheme
  }

  switchTheme = () => {
    const newTheme = this.theme === THEMES.DARK ? THEMES.WHITE : THEMES.DARK
    this.setTheme(newTheme)
  }
})()
