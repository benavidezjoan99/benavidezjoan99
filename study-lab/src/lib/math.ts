/** Small expression evaluator for study worksheets (+ − × ÷ and parentheses). */
export function quickMath(expr: string): number {
  const source = expr.replace(/×/g, '*').replace(/÷/g, '/')
  const tokens = source.match(/\d+(?:\.\d+)?|[()+*/-]/g)
  if (!tokens || tokens.join('') !== source.replace(/\s+/g, '')) {
    throw new Error('Use numbers, parentheses and + − × ÷')
  }

  let i = 0

  function factor(): number {
    if (tokens![i] === '-') {
      i += 1
      return -factor()
    }
    if (tokens![i] === '+') {
      i += 1
      return factor()
    }
    if (tokens![i] === '(') {
      i += 1
      const value = sum()
      if (tokens![i++] !== ')') throw new Error('Missing closing parenthesis')
      return value
    }
    const value = Number(tokens![i++])
    if (!Number.isFinite(value)) throw new Error('Invalid number')
    return value
  }

  function product(): number {
    let value = factor()
    while (tokens![i] === '*' || tokens![i] === '/') {
      const op = tokens![i++]
      const rhs = factor()
      value = op === '*' ? value * rhs : value / rhs
    }
    return value
  }

  function sum(): number {
    let value = product()
    while (tokens![i] === '+' || tokens![i] === '-') {
      const op = tokens![i++]
      const rhs = product()
      value = op === '+' ? value + rhs : value - rhs
    }
    return value
  }

  const result = sum()
  if (i !== tokens.length || !Number.isFinite(result)) {
    throw new Error('Invalid or undefined expression')
  }
  return Number(result.toPrecision(12))
}
