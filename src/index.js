import 'setimmediate';

// Used to transfer object from a `toPrimitive` call
// to the recieving retarget
let transfer;

const removeTransferOnNextTick = () => {
  setImmediate(() => {
    transfer = undefined;
  });
};

// Create an instance fn and attach
// a path array
const createInstance = prop => {
  const fn = obj => fn.path.reduce((last, part) => last && last[part], obj);
  fn.toString = () => `retarget.${fn.path.join('.')}`;
  fn.path = [prop];
  return fn;
};

// Handler for each instance
const retargetHandler = {
  get(target, prop, reciever) {
    // prop will be Symbol(toPrimitive) when
    // other handler was used like this
    // retarget.a[retarget.b];
    // should be the same as retarget.a.b
    if (prop === Symbol.toPrimitive) {
      transfer = target.path;
      removeTransferOnNextTick();
      return target.toString;
    }

    if (prop === 'toString') {
      return target.toString;
    }

    // If there is a transfer use it
    if (transfer) {
      target.path = target.path.concat(transfer);
      transfer = undefined; // remove it afterwards
    } else {
      target.path.push(prop);
    }

    return reciever;
  },

  apply(target, value, args) {
    return target(args[0]);
  }
};

// Create Retarget Instances
const retargetCreator = {
  get(target, prop) {
    return new Proxy(createInstance(prop), retargetHandler);
  }
};

export default new Proxy({}, retargetCreator);
