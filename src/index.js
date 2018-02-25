const reduceObjectUsingPath = (obj, path) =>
  path.reduce((last, part) => last && last[part], obj)

// retarget -- proxy
const toPath = prop => {
  return prop.split('.')
}

const createProxyInstance = path => {
  const instance = obj => reduceObjectUsingPath(obj, instance.path)
  instance.toString = () => instance.path.join('.')
  instance.path = path
  instance.proxy = new Proxy(instance, proxyHandler)
  return instance.proxy
}

// Handler for each retarget instance
const proxyHandler = {
  get(instance, prop, reciever) {
    // retarget.a.b.toString() => "a.b"
    if (prop === 'toString' || prop === Symbol.toPrimitive) {
      return instance.toString
    }
    // There are two cases here
    // 1) Prop is just a plain property access like obj.a
    //    prop will be 'a'
    // 2) Prop is a string path like a.b.c either because it was acces like
    //    obj['a.b.c'] or because another retarget coercion via
    //    obj[retarget.a.b.c]
    //
    if (prop.includes('.')) {
      // 2)
      instance.path = instance.path.concat(toPath(prop))
    } else {
      // 1)
      instance.path.push(prop)
    }

    return reciever
  }
}
// retarget -- tagged template literal
// Access the path prop from handleInterpolation
const PATH_PROP = Symbol('PATH')

const handleInterpolation = interpolation => {
  switch (typeof interpolation) {
    case 'boolean':
      return ''
    case 'function':
      if (interpolation[PATH_PROP]) {
        return interpolation[PATH_PROP]
      }
      return interpolation.call(this)
    case 'object':
      if (Array.isArray(interpolation)) {
        return interpolation
      }
      return interpolation.toString()
    default:
      return interpolation
  }
}

const interleave = (strings, exprs) => {
  return strings
    .reduce((accum, s, i) => {
      return accum.concat(
        s.split('.'),
        exprs[i] && handleInterpolation(exprs[i])
      )
    }, [])
    .filter(Boolean)
}

const createSelector = (strings, ...args) => {
  // allow for identitfy retarget({}) === {};
  if (!Array.isArray(strings)) return strings

  const instance = (strings, ...args) => {
    if (Array.isArray(strings)) {
      instance[PATH_PROP] = instance[PATH_PROP].concat(
        // Called as retarget`` or retarget([])
        strings.raw ? interleave(strings, args) : strings
      )
      return instance
    } else {
      // Called as retarget() or retarget({})
      return reduceObjectUsingPath(strings, instance[PATH_PROP])
    }
  }
  // Ensures that retarget`a.b.c`.toString() evaluates to 'a.b.c'
  instance.toString = () => instance[PATH_PROP].join('.')
  instance[PATH_PROP] = strings.raw ? interleave(strings, args) : strings
  return instance
}

const hasProxySupport = typeof Proxy !== 'undefined'

export default (hasProxySupport
  ? new Proxy(createSelector, {
      get(target, prop) {
        return createProxyInstance(toPath(prop))
      }
    })
  : createSelector)
