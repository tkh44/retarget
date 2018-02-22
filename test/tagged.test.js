import retarget from '../src/index'

test('basic', () => {
  const selector = retarget`profile.name.last`

  const STATE = {
    profile: {
      name: {
        first: 'Waylon',
        last: 'Jennings'
      }
    }
  }

  expect(selector(STATE)).toMatchSnapshot()
})

test('nested', () => {
  const STATE2 = {
    users: {
      '1': {
        profile: {
          name: {
            first: 'Waylon',
            last: 'Jennings'
          }
        }
      },
      '2': {
        profile: {
          name: {
            first: 'Waylon',
            last: 'Jennings'
          }
        }
      }
    }
  }

  const userSelector = retarget`users`
  const selector2 = userSelector`2.profile.name.last`
  expect(selector2(STATE2)).toMatchSnapshot()
})

test('compound', () => {
  const STATE3 = {
    entities: {
      users: {
        '1': {
          profile: {
            name: {
              first: 'Waylon',
              last: 'Jennings'
            }
          }
        },
        '2': {
          profile: {
            name: {
              first: 'Waylon',
              last: 'Jennings'
            }
          }
        }
      }
    }
  }

  const selectorA = retarget`users.1`
  const selectorB = retarget`profile`
  const selectorC = retarget`first`
  const compoundSelector = retarget`entities.${selectorA}${selectorB}.name.${selectorC}`
  expect(compoundSelector(STATE3)).toMatchSnapshot()
})

test('pass array', () => {
  const STATE = {
    a: {
      b: 'c'
    }
  }
  const selectorA = retarget`${['a', 'b']}`
  expect(selectorA(STATE)).toMatchSnapshot()
})

test('ignore null', () => {
  const selector = retarget`a.${null}.b.${null}`
  expect(selector.toString()).toEqual('a.b')
})

test('ignore false/true', () => {
  const selector = retarget`a.${false}.b.${true}.c`
  expect(selector.toString()).toEqual('a.b.c')
})

test('handle function', () => {
  const selector = retarget`a.${() => 'b'}.c`
  expect(selector.toString()).toEqual('a.b.c')
})

test('handle numbers', () => {
  const selector = retarget`a.${1}.b`
  expect(selector.toString()).toEqual('a.1.b')
})

test('handle object', () => {
  const selector = retarget`a.${{
    toString() {
      return 'b'
    }
  }}.c`
  expect(selector.toString()).toEqual('a.b.c')
})
