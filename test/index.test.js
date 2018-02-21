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

test('debug output', () => {
  const selectorA = retarget.users[1]
  const selectorB = retarget.profile
  const selectorC = retarget.first
  const compoundSelector =
    retarget.entities[selectorA][selectorB].name[selectorC]

  expect(compoundSelector.toString()).toEqual(
    'retarget.entities.users.1.profile.name.first'
  )
})

test('basic', () => {
  const selector = retarget`profile.name.last`

  const arraySelector = retarget(['profile', 'name', 'first'])
  const STATE = {
    profile: {
      name: {
        first: 'Waylon',
        last: 'Jennings'
      }
    }
  }

  expect(selector(STATE)).toMatchSnapshot()
  expect(arraySelector(STATE)).toMatchSnapshot()
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
  const selector2 = retarget`${userSelector}.2.profile.name.last`
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

  const lastNameSelector = retarget`profile.name.last`

  const createUserSelector = id => retarget`users.${id}${lastNameSelector}`

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
  const selectorA = retarget`users.1`
  const selectorB = retarget`profile`
  const selectorC = retarget`first`
  const compoundSelector = retarget`entities.${selectorA}${selectorB}.name.${selectorC}`
  expect(compoundSelector(STATE3)).toMatchSnapshot()
})
