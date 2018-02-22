import retarget from '../src/index'

test('first use tagged template', () => {
  const selector = retarget`profile.name.${retarget.last}`

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

test('first use proxy', () => {
  const selector = retarget.profile`name.${retarget.last}`

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
