// Access the path prop from the proxy
const PATH_PROP = Symbol('PATH');

const toPath = prop => {
  return prop.split('.');
};

const handleInterpolation = interpolation => {
  switch (typeof interpolation) {
    case 'boolean':
      return '';
    case 'function':
      if (interpolation[PATH_PROP]) {
        return interpolation[PATH_PROP];
      }
      return interpolation.call(this);
    case 'object':
      if (Array.isArray(interpolation)) {
        return interpolation;
      }
      return interpolation.toString();
    default:
      return interpolation;
  }
};

const interleave = (strings, exprs) => {
  return strings.reduce((accum, s, i) => {
    return accum.concat(
      s.split('.'),
      exprs[i] && handleInterpolation(exprs[i])
    );
  }, []);
};

const createInstance = (path, handler) => {
  const instance = (param, ...exprs) => {
    // Handle template strings after using proxy syntax
    if (param && Array.isArray(param) && exprs && Array.isArray(exprs)) {
      instance.path = instance.path.concat(
        interleave(param, exprs).filter(Boolean)
      );
      return instance.proxy;
    }

    // This allows for retarget.a.b(retarget.c) => retarget.a.b.c
    if (param && param[PATH_PROP]) {
      instance.path = instance.path.concat(param[PATH_PROP]);
      return instance.proxy;
    }

    return instance.path.reduce((last, part) => last && last[part], param);
  };

  instance.toString = () => instance.path.join('.');
  instance.path = path;

  instance.proxy = new Proxy(instance, handler);

  return instance.proxy;
};

// Handler for each retarget instance
const retargetHandler = {
  get(instance, prop, reciever) {
    // makes it possible to access path
    // without preventing retarget.path.a.b
    if (prop === PATH_PROP) {
      return instance.path;
    }

    // retarget.a.b.toString() => "a.b"
    if (prop === 'toString' || prop === Symbol.toPrimitive) {
      return instance.toString;
    }

    // There are two cases here
    // 1) Prop is just a plain property access like obj.a
    //    prop will be 'a'
    // 2) Prop is a string path like a.b.c either because it was acces like
    //    obj['a.b.c'] or because another retarget coercion via
    //    obj[retarget.a.b.c]
    //
    if (prop.indexOf('.') === -1) {
      instance.path.push(prop);
    } else {
      instance.path = instance.path.concat(toPath(prop));
    }

    return reciever;
  }
};

const rootInstance = (strings, ...args) => {
  // Handle tagged template literal on the root element
  if (strings && Array.isArray(strings) && args && Array.isArray(args)) {
    return createInstance(
      interleave(strings, args).filter(Boolean),
      retargetHandler
    );
  } else {
    return strings;
  }
};

// Always create a new instance for a new retarget usage.
export default new Proxy(rootInstance, {
  get(target, prop) {
    return createInstance(toPath(prop), retargetHandler);
  }
});
