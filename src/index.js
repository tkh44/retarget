// END GOAL:
// const selector = select`profile.name.last`;

// function reducer(state, action) {
//   const lastNameSelector = selector(state);
//   // getting the value is handy in components and mapStateToProps
//   let currentVal = lastNameSelector.get();

//   // But I think its more handy for setting
//   lastNameSelector.set(action.payload);

//   // if it was an array value
//   lastNameSelector.push("foo");
//   let someIndex = action.payload;
//   lastNameSelector.remove(someIndex);

//   return lastNameSelector.save();
// }

export default function select(strings, ...exprs) {
  const woven = strings.raw ? interleave(strings, ...exprs) : strings

  // console.log(woven)

  let key = woven.filter(Boolean)

  // console.log('key', key)

  let INITIAL = Symbol('INITIAL')
  let oldObj
  let prev = INITIAL

  function selectorFn(obj) {
    // console.log('obj', obj, 'key', key)
    // from dlv https://raw.githubusercontent.com/developit/dlv/master/index.js
    let p = 0

    if (obj == null) {
      return obj
    }

    if (oldObj === obj && prev !== INITIAL) {
      // console.log('cache working', prev)
      return prev
    }
    oldObj = obj

    while (obj && p < key.length) {
      let k = key[p++]
      let val = obj[k]
      obj = val
    }
    prev = obj
    return obj
  }

  selectorFn['__selector'] = function() {
    // console.log('__selector', key)
    return key
  }

  function interleave(strings, ...exprs) {
    // return strings.join()
    return strings.reduce((accum, s, i) => {
      // console.log(i, exprs[i]);
      return accum.concat(
        s.split('.'),
        exprs[i] && handleInterpolation(exprs[i])
      )
    }, [])
  }

  function handleInterpolation(interpolation) {
    if (interpolation == null) {
      return ''
    }

    switch (typeof interpolation) {
      case 'boolean':
        return ''
      case 'function':
        if (typeof interpolation['__selector'] === 'function')
          return interpolation['__selector']()

        return handleInterpolation.call(this)
      case 'object':
        if (Array.isArray(interpolation)) {
          return interpolation.map(handleInterpolation).join('.')
        }
        return interpolation.toString()
      default:
        return interpolation
    }
  }

  return selectorFn
}
