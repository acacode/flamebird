import FileLoader from './file_loader'

export default new (class ThemeManager {
  theme

  setTheme = newTheme => {
    localStorage.setItem('theme', newTheme)
    if (newTheme !== 'white') {
      FileLoader.loadFile(newTheme + '-theme.css')
    }
    document.body.setAttribute('theme', newTheme)
    this.theme = newTheme
  }

  switchTheme = () => {
    const newTheme = this.theme === 'dark' ? 'white' : 'dark'
    if (this.theme !== 'white') {
      FileLoader.unloadFile(`${this.theme}-theme.css`)
    }
    this.setTheme(newTheme)
  }
})()
