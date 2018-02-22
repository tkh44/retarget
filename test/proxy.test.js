import retarget from '../src/index'

test('basic', () => {
  const selector = retarget.profile.name.last

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

  const userSelector = retarget.users
  const selector2 = userSelector[2].profile.name.last
  expect(selector2(STATE2)).toMatchSnapshot()
})

test('fun fun functions', () => {
  const STATE = {
    users: {
      '1': {
        profile: {
          name: {
            first: 'Waylon',
            last: 'Jennings'
          }
        }
      }
    }
  }

  const lastNameSelector = retarget.profile.name.last

  const createUserSelector = id => retarget.users[id][lastNameSelector]

  const userSelector = createUserSelector(1)

  expect(userSelector(STATE)).toMatchSnapshot()
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
  // I can't figure out how to dedupe selectors
  // If you use the 2 above one after the other you will get ['profile', 'name', 'last'] twice in the key

  // I think going from right to left with the head of the new key array
  // looking for a match and then overwriting (left to right) from there might work
  // need to do some sort of check before doing this check as it is stupid innefficent
  // unless we know there is a hit
  const selectorA = retarget.users[1]
  const selectorB = retarget.profile
  const selectorC = retarget.first
  const compoundSelector =
    retarget.entities[selectorA][selectorB].name[selectorC]

  expect(compoundSelector(STATE3)).toMatchSnapshot()
})

test('toPrimitiv', () => {
  expect(retarget.a.b + '').toEqual('a.b')
})

test('toString', () => {
  expect(retarget.a.b.toString()).toEqual('a.b')
})

test('compose with props or functions', () => {
  const d = retarget.d
  const bc = retarget.b.c
  const abcdProp = retarget.a[bc][d]
  expect(abcdProp.toString()).toEqual('a.b.c.d')

  const abcdFunc = retarget.a(bc)(d)
  expect(abcdFunc.toString()).toEqual(abcdProp.toString())
})

test('prop as dot path', () => {
  expect(retarget['a.b.c'].d['e.f'].toString(), 'a.b.c.d.e.f')
})

test('identity', () => {
  const data = {}
  expect(retarget(data) === data).toBeTruthy()
})

test('allow `path` prop in retarget', () => {
  expect(retarget.a.path.b.toString()).toEqual('a.path.b')
})
