# Heptapod

#### Experiments with tagged template literals and custom `css` functions for [emotion](https://emotion.sh)

## Install

```bash
npm i heptapod -S
```

**or**

```bash
yarn add heptapod
```

---

```javascript
import createResponsiveCss from 'heptapod'

const css = createResponsiveCss([
  '@media(min-width: 420px)',
  '@media(min-width: 920px)',
])

const cls3 = css`
  font-size: 16px;
  background: rgba(45, 213, 47, 0.11);
  color: aquamarine;
``
  background-color: hotpink;
``
  font-size: 16px;
  background: rgba(0, 0, 0, 0.11);
`

<div className={cls3.toString()}>Basic</div>

```

This will insert the following styles into the current Stylesheet emotion is using.

```css
.emotion-0 {
  font-size: 16px;
  background: rgba(45,213,47,0.11);
  color: aquamarine;
}

@media (min-width:420px) {
  .emotion-0 {
    background-color: hotpink;
  }
}

@media (min-width:920px) {
  .emotion-0 {
    font-size: 16px;
    background: rgba(0,0,0,0.11);
  }
}
```

It works for both string and object based styles. The following object styles will output the same styles as the string variant above.

```javascript
const cls3 = css({
  fontSize: 16,
  background: 'rgba(45, 213, 47, 0.11)',
  color: 'aquamarine'
})({ backgroundColor: 'hotpink' })({
  fontSize: 16,
  background: 'rgba(0, 0, 0, 0.11)'
})

<div className={cls3.toString()}>Basic</div>
```




## API

#### createResponsiveCss `function`

```javascript
import createResponsiveCss from 'heptapod'

createResponsiveCss(selectors: Array<Selector>) : DynamicStyleFunction
```

**Arguments**
* *breakpoints*
  ```javascript
  const customCssFunction = createResponsiveCss([
    '@media(min-width: 420px)',
    '@media(min-width: 920px)',
    '@media(min-width: 1120px)'
  ])
  ```

**Returns**

`heptapod` returns a function that can be used in place of emotion`s `css` function. This function can be partially applied to add further media query styles.



