// Access the path prop from the proxy
const PATH_PROP = Symbol('PATH');

const toPath = prop => {
  return prop.split('.');
};

const createInstance = path => {
  const fn = param => {
    // This allows for retarget.a.b(retarget.c) => retarget.a.b.c
    if (param && param[PATH_PROP]) {
      return new Proxy(
        createInstance(fn.path.concat(param[PATH_PROP])),
        retargetHandler
      );
    }
    return fn.path.reduce((last, part) => last && last[part], param);
  };

  fn.toString = () => fn.path.join('.');
  fn.path = path;
  return fn;
};

// Handler for each retarget instance
const retargetHandler = {
  get(target, prop, reciever) {
    // makes it possible to access path
    // without preventing retarget.path.a.b
    if (prop === PATH_PROP) {
      return target.path;
    }

    // retarget.a.b.toString() => "a.b"
    if (prop === 'toString' || prop === Symbol.toPrimitive) {
      return target.toString;
    }

    // There are two cases here
    // 1) Prop is just a plain property access like obj.a
    //    prop will be 'a'
    // 2) Prop is a string path like a.b.c either because it was acces like
    //    obj['a.b.c'] or because another retarget coercion via
    //    obj[retarget.a.b.c]
    //
    if (prop.indexOf('.') === -1) {
      target.path.push(prop);
    } else {
      target.path = target.path.concat(toPath(prop));
    }

    return reciever;
  }
};

// Create retarget instances
const retargetCreator = {
  get(target, prop) {
    return new Proxy(createInstance(toPath(prop)), retargetHandler);
  }
};

export default new Proxy(createInstance([]), retargetCreator);
