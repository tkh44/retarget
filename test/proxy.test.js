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

test('compose with props', () => {
  const d = retarget.d
  const bc = retarget.b.c
  const abcdProp = retarget.a[bc][d]
  expect(abcdProp.toString()).toEqual('a.b.c.d')
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
