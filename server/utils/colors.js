const specChar = char => '\x1b[' + char + 'm'

const textColorModifier = colorCode => str =>
  specChar(colorCode) + str + specChar(39)

const fgColorModifier = colorCode => str =>
  specChar(colorCode) + str + specChar(49)

module.exports = {
  yellow: textColorModifier(33),
  red: textColorModifier(31),
  grey: textColorModifier(90),
  blue: textColorModifier(34),
  cyan: textColorModifier(36),
  magentaFg: fgColorModifier(45),
}
