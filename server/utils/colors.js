const specChar = char => '\x1b[' + char + 'm'

const colorModifier = (colorCode, isFg = false) => str =>
  specChar(colorCode) + str + specChar(isFg ? 39 : 49)

module.exports = {
  yellow: colorModifier(33),
  red: colorModifier(31),
  grey: colorModifier(90),
  blue: colorModifier(34),
  cyan: colorModifier(36),
  magentaFg: colorModifier(45, true),
}
