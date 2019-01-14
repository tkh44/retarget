[![npm version](https://badge.fury.io/js/retarget.svg)](https://badge.fury.io/js/retarget)
[![Build Status](https://travis-ci.org/tkh44/retarget.svg?branch=master)](https://travis-ci.org/tkh44/retarget)
[![codecov](https://codecov.io/gh/tkh44/retarget/branch/master/graph/badge.svg)](https://codecov.io/gh/tkh44/retarget)

# retarget

#### selectors via targets


## Install

```bash
npm i retarget -S
```

**or**

```bash
yarn add retarget
```

---

```javascript
import retarget from 'retarget'

const STATE = {
  profile: {
    name: {
      first: 'Waylon',
      last: 'Jennings'
    }
  }
}

const lastNameSelector  = retarget.profile.name.last;

console.log(lastNameSelector(STATE)) // logs "Jennings"

```

## Composing

It is possible to compose multiple selectors together to create a new one.

```javascript
import retarget from 'retarget'

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

const lastNameSelector  = retarget.profile.name.last;
const usersSelector = retarget.users;

const createUserSelector = (id) =>
  usersSelector[id][lastNameSelector]


const userSelector = createUserSelector(1)

console.log(userSelector(STATE)) // logs "Jennings"

```

## API

#### retarget `function`

```javascript
import retarget from 'retarget'

const selector = retarget.dot.seperated.path.to.value;

const state = {/* Huge object */}
selector(state) // returns the value at "dot.seperated.path.to.value"
```


**Returns**

`retarget` will build a path of all properites that where accessed and attempts to get the value for the given path.



