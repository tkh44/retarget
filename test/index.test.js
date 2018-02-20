import select from '../src/index'

test('basic', () => {
  const selector = select`profile.name.last`

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

  const arraySelector = select(['profile', 'name', 'first'])
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

  const userSelector = select`users`
  const selector2 = select`${userSelector}.2.profile.name.last`
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
  // I can't figure out how to dedupe selectors
  // If you use the 2 above one after the other you will get ['profile', 'name', 'last'] twice in the key

  // I think going from right to left with the head of the new key array
  // looking for a match and then overwriting (left to right) from there might work
  // need to do some sort of check before doing this check as it is stupid innefficent
  // unless we know there is a hit
  const selectorA = select`users.1`
  const selectorB = select`profile`
  const selectorC = select`first`
  const compoundSelector = select`entities.${selectorA}${selectorB}.name.${selectorC}`
  expect(compoundSelector(STATE3)).toMatchSnapshot()
})
