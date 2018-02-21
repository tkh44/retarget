import 'setimmediate'

// Used to transfer object from a `toPrimitive` call
// to the recieving retarget
let transfer

const removeTransferOnNextTick = () => {
  setImmediate(() => {
    transfer = undefined
  })
}

// Create an instance fn and attach
// a path array
const createInstance = prop => {
  const fn = obj => fn.path.reduce((last, part) => last && last[part], obj)
  fn.toString = () => `retarget.${fn.path.join('.')}`
  fn.path = [prop]
  return fn
}

// Handler for each instance
const retargetHandler = {
  get(target, prop, reciever) {
    // prop will be Symbol(toPrimitive) when
    // other handler was used like this
    // retarget.a[retarget.b];
    // should be the same as retarget.a.b
    if (prop === Symbol.toPrimitive) {
      transfer = target.path
      removeTransferOnNextTick()
      return target.toString
    }

    if (prop === 'toString') {
      return target.toString
    }

    // If there is a transfer use it
    if (transfer) {
      target.path = target.path.concat(transfer)
      transfer = undefined // remove it afterwards
    } else {
      target.path.push(prop)
    }

    return reciever
  },

  apply(target, value, args) {
    return target(args[0])
  }
}

// Create Retarget Instances
const retargetCreator = {
  get(target, prop) {
    return new Proxy(createInstance(prop), retargetHandler)
  },
  apply(target, value, args) {
    const woven = target(...args)
      .filter(Boolean)
      .map(createInstance)
    console.log('woven', woven)
    return woven
  }
}

function interleave(strings, ...exprs) {
  // return strings.join()
  return strings.reduce((accum, s, i) => {
    return accum.concat(s.split('.'), exprs[i] && handleInterpolation(exprs[i]))
  }, [])
}

function handleInterpolation(interpolation) {
  switch (typeof interpolation) {
    case 'boolean':
      return ''
    case 'function':
      if (typeof interpolation['__selector'] === 'function')
        return interpolation['__selector']()

      return handleInterpolation.call(this)
    case 'object':
      if (Array.isArray(interpolation)) {
        return interpolation.map(handleInterpolation)
      }
    // eslint-disable-next-line no-fallthrough
    default:
      return interpolation ? interpolation.toString() : ''
  }
}

export default new Proxy(interleave, retargetCreator)
