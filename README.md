# React Updaters

React updaters are a ready-made event handlers for updating state or props.
They prevent you from having to re-invent the wheel for updating state/props
every time.

## Motivation

Have you ever found yourself writing code like the below to handle event
changes to your object models/properties?

With `react-updaters`, don't repeat yourself with event handlers! It helps:

* Automatically link event handlers up with state or props, and
* Preserves immutable semantics by repeatedly returning the same functions (when called with the same arguments) and making deep copies so that PureRender/PureComponents work as expected.

### Typical Javascript

```js
class MyComponent extends React.PureComponent {
  handleNameChange = (e) => {
    // Preserve immutable semantics
    this.setState({
      person: {
        ...this.state.person,
        name: e.target.value
      }
    });
  }

  handleNextAvailableChange = (newDate) => {
    this.props.onAppointmentChange({
      ...this.props.appointment,
      nextAvailable: newDate
    });
  }

  render() {
    return (
      <input
        type="text"
        value={this.state.person.name}
        onChange={this.handleNameChange}
      />
      <DatePicker
        value={this.props.appointment.nextAvailable}
        onChange={this.handleNextAvailableChange}
      />
    );
  }
}
```

### The same, using `react-updaters`

```js
import { update, setProp } from 'react-updaters';

class MyComponent extends React.PureComponent {
  render() {
    return (
      <input
        type="text"
        value={this.state.person.name}
        onChange={update(this, 'person.name')}
        // alternatively:
        onChange={update(this, ['person', 'name'])}
      />
      <DatePicker
        value={this.props.appointment.nextAvailable}
        onChange={setProp(this, 'onAppointmentsChange', 'appointment', 'nextAvailable')}
      />
    );
  }
}
```

# API

`react-updaters` includes handlers to update state/props and call functions:

* Update state:
  * [`update(elem, stateIndex[, preventDefault])`](#update): updates an index within state
    with the data passed in the event/call to the handler function.
  * [`updateNumber(elem, stateIndex[, preventDefault)`](#updateNumber): same as `update`, except
    casts the value into a number using `parseFloat`.
  * [`setState(elem, stateIndex, value[, preventDefault]`](#setState): set a certain key in
    the component's state to a constant `value`.
  * [`deleteState(elem, stateIndex, value[, preventDefault]`](#deleteState): deletes a certain
    key in the component's state. For arrays, it splices out that key.
  * [`toggle(elem, stateIndex[, preventDefault]`](#toggle): toggles a certain key within
    state between `true` and `false`.
  * [`toggleValue(elem, stateIndex, value[, preventDefault]`](#toggleValue): toggles a certain
    key in state between `null` and the `value` provided. If the key is another
    value, it sets it to `value`. This is useful for tabs or a group of
    expandable panels (accordion panels).
  * [`toggleFromEvent(elem, stateIndex[, preventDefault]`](#toggleFromEvent): toggles a certain key
    in state between `null` and the value in the event/call to the handler.
  * [`toggleArrayMember(elem, stateIndex, value[, preventDefault]`](#toggleArrayMember):
    toggles whether a certain value is in an array in `props`. This is useful
    for arrays where you want to add/remove members based on clicks.

* Update props for controlled components (through an `onChange` handler within the props). These
  are analogous to the ones for `state` above:
  * [`setProp(elem, propFunc, propIndex, indexInProp[, preventDefault])`](#setProp): update
    a controlled prop through the `propFunc` onChange handler with the data
    passed in the event/call to the handler.
  * [`setPropNumber(elem, propFunc, propIndex, indexInProp[, preventDefault])`](#setPropNumber):
    same as `setProp`, except casts the value into a number using `parseFloat`.
  * [`setPropValue(elem, propFunc, propIndex, indexInProp, value[, preventDefault])`](#setPropValue):
    set a controlled prop through the `propFunc` onChange handler to a constant
    `value`.
  * [`deleteProp(elem, propFunc, propIndex, indexInProp[, preventDefault])`](#deleteProp):
    deletes a certain key in the component's props, and then passes the resulting
    object through the `propFunc` onChange handler. For arrays, it splices out
    that key.
  * [`toggleProp(elem, propFunc, propIndex, indexInProp[, preventDefault])`](#toggleProp):
    toggles a certain key within props between `true` and `false`, and updates it
    using `propFunc`.
  * [`togglePropValue(elem, propFunc, propIndex, indexInProp, value[, preventDefault])`](#togglePropValue):
    toggles a certain key in props between `null` and the `value` provided and
    passes it to the `propFunc` onChange handler. If the key is currently a different value,
    it sets it to `value`.
  * [`togglePropFromEvent(elem, propFunc, propIndex, indexInProp[, preventDefault])`](#togglePropFromEvent):
    toggles a certain key in props between `null` and the value in the event/call
    to the handler.
  * [`togglePropArrayMember(elem, propFunc, propIndex, indexInProp, value[, preventDefault])`](#toggleArrayMember):
    toggles whether a certain value is in an array in `props`. This is useful
    for arrays where you want to add/remove members based on clicks.

* Calls functions on either the current component or a prop:
  * [`call(elem, funcName, prefixArgs[, preventDefault, extraCacheKey])`](#call): calls
    a function on the component. This is very similar to `bind`ing an event
    handler, but has a cache backing it (i.e. multiple calls to `call` with the
    same arguments will always return one function).
  * [`callProp(elem, funcName, prefixArgs[, preventDefault, extraCacheKey])`](#callProp):
    same as `call`, except instead of calling a function on the current
    component, it calls a function within the component's props.

* Miscellaneous functions:
  * [`registerRef(elem, variableName)`](#registerRef): useful for refs: use
    `<ChildComponent ref={registerRef(this, '_blah')} />`,
    and `this._blah` will become the reference to the child component.
  * [`preventDefault` and `stopPropagation`](#preventDefault): two event handlers that do nothing
    but prevent the default action/stops event bubbling respectively.

* Compositors:
  * [`all(this, [handler1, handler2])`](#all): allows one to combine multiple event
    handlers (from `react-updaters` or from elsewhere) into a single event
    handler, while preserving PureRender semantics (i.e., if you pass the same
    `handler1` and `handler2` multiple times, you get one identical function
    back).

## Detailed examples

### State updaters

#### <a id="update"></a> `update(elem, stateIndex[, preventDefault])`
#### <a id="updateNumber"></a> `updateNumber(elem, stateIndex[, preventDefault])`

**Description**: updates an index within state. The handler automatically figures out if it's getting an `Event` (for which it needs to get `event.target.value`) or just an object itself, and uses the value from there to set the state.

**Example**

```js
import Select from 'react-select';
import { update } from 'react-updaters';

// This gets back an event (with event.target.value)
<input
  type="text"
  value={this.state.salmon.color}
  onChange={update(this, ['salmon', 'color'])}
/>

// This gets back a Javascript object; it just works!
<Select
  options={...}
  value={this.state.iceCream.flavor}
  onChange={update(this, 'iceCream.flavor')}
/>
```

#### <a id="setState"></a> `setState(elem, stateIndex, value[, preventDefault])`

**Description**: set a certain key in the component's state to a constant `value`.

**Example**
```js
import { setState } from 'react-updaters';

// How hot would you like your pizza?
<input name="heat" type="radio" checked={this.state.heat === 'cold'} onChange={setState(this, 'heat', 'cold')} />
<input name="heat" type="radio" checked={this.state.heat === 'hot'} onChange={setState(this, 'heat', 'hot')} />
<input name="heat" type="radio" checked={this.state.heat === 'on fire'} onChange={setState(this, 'heat', 'on fire')} />
```

#### <a id="deleteState"></a> `deleteState(elem, stateIndex[, preventDefault]`

**Description**: deletes a certain key in the component's state. For arrays, it splices out that key. Useful for tables and lists with "delete" buttons.

**Example**

```js
import { deleteState } from 'react-updaters';

render() {
  const birds = this.state.birds; // ['Hummingbird', 'Duck', 'Penguin'];
  return (
    <ul>
      {birds.map((bird, index) => (
        <li key={index}>
          {bird}
          <a href="#" onClick={deleteState(this, ['birds', index], true)}>
            (Delete)
          </a>
        </li>
      )}
    </ul>
  );
}
```

#### <a id="toggle"></a> `toggle(elem, stateIndex[, preventDefault]`

**Description**: toggles a certain key within state between `true` and `false`. Useful for checkboxes and switches.

**Example**

```js
import { toggle } from 'react-updaters';

<input
  type="checkbox"
  checked={this.state.robot.shouldKillAllHumans}
  onChange={toggle(this, 'robot.shouldKillAllHumans')}
/>
<a
  href="#"
  className={this.state.isSelected ? 'selected' : ''}
  onClick={toggle(this, 'isSelected', true)}
>
  {/* The `true` argument prevents the default (href="#") action here */}
  Select this
</a>
```

#### <a id="toggleValue"></a> `toggleValue(elem, stateIndex, value[, preventDefault])`

**Description**: toggles a certain key in state between `null` and the `value` provided. If the key is another value, it sets it to `value`. This is useful for tabs or a group of expandable panels (accordion panels).

**Example**

```js
import { toggleValue } from 'react-updaters';

render() {
  const { expandedBio } = this.state;

  // This is an accordion of biographies where only one can be open at a time
  return (<div>
    <a href="#" onClick={toggleValue(this, 'expandedBio', 'Superman')}>Superman</a>
    {expandedBio === 'Superman' && (
      <p>Superman was raised by Clark Kent...</p>
    )}
    <a href="#" onClick={toggleValue(this, 'expandedBio', 'Batman')}>Batman</a>
    {expandedBio === 'Batman' && (
      <p>Batman reigns supreme in Gotham City...</p>
    )}
  </div>);
```
#### <a id="toggleFromEvent"></a> `toggleFromEvent(elem, stateIndex[, preventDefault])`

**Description**: toggles a certain key in state between `null` and the value in the event/call to the handler. Useful for accordions.

**Example**

```js
import { PanelGroup } from 'react-bootstrap';
import { toggleValue } from 'react-updaters';

render() {
  const { expandedBio } = this.state;

  // Similar to the example above, but using the `react-bootstrap`
  // library's <PanelGroup> component
  return (
    <PanelGroup
      accordion
      activeKey={expandedBio}
      onSelect={toggleFromEvent(this, 'expandedBio')}
    >
      <Panel eventKey="Superman" ... />
      <Panel eventKey="Batman" ... />
    </PanelGroup>
  );
}
```

#### <a id="toggleArrayMember"></a> `toggleArrayMember(elem, stateIndex, value[, preventDefault])`

**Description**: toggles whether a certain array in state contains a given value.
This is useful for arrays where each values' membership in the array is controlled
by a checkbox, for example.

**Example**

```js
import { PanelGroup } from 'react-bootstrap';
import { toggleArrayMember } from 'react-updaters';

class ToppingsSelect extends React.Component {
  constructor() {
    this.state = { toppings: ['pineapples'] };
  }

  render() {
    const { toppings } = this.state;

    return (<div>
      {['anchovies', 'canadian bacon', 'mushrooms', 'peppers', 'pineapples'].map(option => (<div>
        <input
          type="checkbox"
          checked={toppings.indexOf(option) !== -1}
          onChange={toggleArrayMember(this, 'toppings', option)}
        />
        {' '}
        {option}
      </div>))}
    </div>);
  }
}
```

### Props updaters

In general, props updaters have the same few arguments:

* `propFunc`: the name of the onChange handler within props (e.g., `'onLlamaChange'` for the prop `this.props.onLlamaChange`)
* `propIndex`: the index of the object that should get passed to the `propFunc` onChange handler after we modify it. (e.g., `llama` for `this.props.llama`)
* `indexInProp` (optional): if the value we're changing is not the whole prop at `propIndex` but only a part/child of it, this specifies the index within that value we should change. (e.g., `color` with the above example would refer to `this.props.llama.color`).

Putting it all together, the event handler generally is equivalent to:

```js
handleEvent = (e) => {
  const obj = this.props[propIndex];

  const newValue = doSomething(e);
  // Note that we actually use a version of _.set that preserves
  // immutable semantics
  _.set(obj, indexInProp, newValue);

  this.props[propFunc](obj);
}
```

#### <a id="setProp"></a> `setProp(elem, propFunc, propIndex, indexInProp[, preventDefault])`
#### <a id="setPropNumber"></a> `setPropNumber(elem, propFunc, propIndex, indexInProp[, preventDefault])`

**Description**: update a controlled prop through the `propFunc` onChange handler with the data passed in the event/call to the handler.

**Example**

```js
import Select from 'react-select';
import { setProp } from 'react-updaters';

<input
  type="text"
  value={this.props.salmon.color}
  onChange={setProp(this, 'onSalmonChange', 'salmon', 'color')}
/>

<Select
  options={...}
  value={this.props.iceCream}
  onChange={setProp(this, 'onIceCreamChange', 'iceCream')}
/>
```

#### <a id="setPropValue"></a> `setPropValue(elem, propFunc, propIndex, indexInProp, value[, preventDefault])`

**Description**: set a controlled prop through the `propFunc` onChange handler to a constant `value`.

**Example**
```js
import { setPropValue } from 'react-updaters';

// How hot would you like your pizza?
<input name="heat" type="radio" checked={this.props.pizza.heat === 'cold'} onChange={setPropValue(this, 'onPizzaChange', 'pizza', 'heat', 'cold')} />
<input name="heat" type="radio" checked={this.props.pizza.heat === 'hot'} onChange={setPropValue(this, 'onPizzaChange', 'pizza', 'heat', 'hot')} />
<input name="heat" type="radio" checked={this.props.pizza.heat === 'on fire'} onChange={setPropValue(this, 'onPizzaChange', 'pizza', 'heat', 'on fire')} />
```

#### <a id="deleteProp"></a> `deleteProp(elem, propFunc, propIndex, indexInProp[, preventDefault])`:

**Description**: deletes a certain key in the component's props, and then passes the resulting object through the `propFunc` onChange handler. For arrays, it splices out that key. Useful for tables and lists with "delete" buttons.

**Example**

```js
import { deleteProp } from 'react-updaters';

render() {
  const birds = this.props.birds; // ['Hummingbird', 'Duck', 'Penguin'];
  return (
    <ul>
      {birds.map((bird, index) => (
        <li key={index}>
          {bird}
          <a href="#" onClick={deleteProp(this, 'onBirdsChange', 'birds', index, true)}>
            {/* The `true` argument prevents the default (href="#") action here */}
            (Delete)
          </a>
        </li>
      )}
    </ul>
  );
}
```

#### <a id="toggleProp"></a> `toggleProp(elem, propFunc, propIndex, indexInProp[, preventDefault])`

**Description**: toggles a certain key within props between `true` and `false`, and updates it using `propFunc`. Useful for checkboxes and switches.

**Example**

```js
import { toggleProp } from 'react-updaters';

<input
  type="checkbox"
  checked={this.props.robot.shouldKillAllHumans}
  onChange={toggleProp(this, 'onRobotChange', 'robot', 'shouldKillAllHumans')}
/>

<a
  href="#"
  className={this.props.isSelected ? 'selected' : ''}
  onClick={toggleProp(this, 'onSelectedChange', 'selected', true)}
>
  {/* The `true` argument prevents the default (href="#") action here */}
  Select this
</a>
```

#### <a id="togglePropValue"></a> `togglePropValue(elem, propFunc, propIndex, indexInProp, value[, preventDefault])`

**Description**: toggles a certain key in props between `null` and the `value` provided and passes it to the `propFunc` onChange handler. If the key is currently a different value, it sets it to `value`. Useful for accordions, grouped radio buttons, etc.

**Example**

```js
import { togglePropValue } from 'react-updaters';

render() {
  const { expandedBio } = this.props;

  // This is an accordion of biographies where only one can be open at a time
  return (<div>
    <a href="#" onClick={togglePropValue(this, 'onExpandedBioChange', 'expandedBio', null, 'Superman', true)}>Superman</a>
    {expandedBio === 'Superman' && (
      <p>Superman was raised by Clark Kent...</p>
    )}
    <a href="#" onClick={togglePropValue(this, 'onExpandedBioChange', 'expandedBio', null, 'Batman', true)}>Batman</a>
    {expandedBio === 'Batman' && (
      <p>Batman reigns supreme in Gotham City...</p>
    )}
  </div>);
```
#### <a id="togglePropFromEvent"></a> `togglePropFromEvent(elem, propFunc, propIndex, indexInProp[, preventDefault])`

**Description**: toggles a certain key in props between `null` and the value in the event/call to the handler. Useful for accordions.

**Example**

```js
import { PanelGroup } from 'react-bootstrap';
import { toggleValue } from 'react-updaters';

render() {
  const { expandedBio } = this.props;

  // Similar to the example above, but using the `react-bootstrap`
  // library's <PanelGroup> component
  return (
    <PanelGroup
      accordion
      activeKey={expandedBio}
      onSelect={togglePropFromEvent(this, 'onExpandedBioChange', 'expandedBio'/* , null */)}
    >
      <Panel eventKey="Superman" ... />
      <Panel eventKey="Batman" ... />
    </PanelGroup>
  );
}
```

#### <a id="togglePropArrayMember"></a> `togglePropArrayMember(elem, stateIndex, value[, preventDefault])`

**Description**: toggles whether a certain array in props contains a given value.
This is useful for arrays where each values' membership in the array is controlled
by a checkbox, for example.

**Example**

```js
import { PanelGroup } from 'react-bootstrap';
import { togglePropArrayMember } from 'react-updaters';

type Pizza = {
  toppings: Array<string>,
  size: 'small' | 'medium' | 'large',
};

type Props = {
  pizza: Pizza,
  onChange: Pizza => mixed,
};

class ToppingsSelect extends React.Component {
  render() {
    const toppings = this.props.pizza.toppings;

    return (<div>
      {['anchovies', 'canadian bacon', 'mushrooms', 'peppers', 'pineapples'].map(option => (<div>
        <input
          type="checkbox"
          checked={toppings.indexOf(option) !== -1}
          onChange={togglePropArrayMember(this, 'onChange', 'pizza', 'toppings', option)}
        />
        {' '}
        {option}
      </div>))}
    </div>);
  }
}
```

### Function callers

#### <a id="call"></a> `call(elem, funcName, prefixArgs[, preventDefault, extraCacheKey])`

**Description:** calls a function on the component. This is very similar to using `this[funcName].bind(this, ...)` with an event handler, but has a cache backing it (i.e. multiple calls to `call` with the same arguments always return the same function), making it a bit better for `PureComponent`s that use shallow comparisons to see if a re-render is needed.

The `extraCacheKey` is useful if any of the `prefixArgs` are not serializable to a JSON string. We use JSON.stringify to generate the cache key, so two different exceptions, DOM nodes, or other non-serializable objects might look the same in the cache unless you specify `extraCacheKey`.

**Example**

```js
import { call } from 'react-updaters';

class FriedChickenOrderer extends React.PureComponent {
  orderFriedChicken = (amount, event) => {
    // The `prefixArgs` are prepended to whatever the event
    // call arguments were
    event.preventDefault();
    $.ajax(`/order/${amount}`) // ...
  }

  render() {
    return (<p>
      How many fried chicken pieces would you like?

      {/* Equivalent to `this.orderFriedChicken.bind(this, 1) */}
      <button onClick={call(this, 'orderFriedChicken', [1])}>
        One
      </button>
      <button onClick={call(this, 'orderFriedChicken', [2])}>
        Two
      </button>
      <button onClick={call(this, 'orderFriedChicken', [5])}>
        Five
      </button>
      <button onClick={call(this, 'orderFriedChicken', [100])}>
        All of them
      </button>
    </p>);
  }
}
```

#### <a id="callProp"></a> `callProp(elem, funcName, prefixArgs[, preventDefault, extraCacheKey])`

**Description:** calls a function on the component's props. This is very similar to doing `this.props[funcName].bind(this, ...)`, but has a cache backing it (i.e. multiple calls to `callProp` with the same arguments always return the same function), making it a bit better for `PureComponent`s that use shallow comparisons to see if a re-render is needed.

The `extraCacheKey` is useful if any of the `prefixArgs` are not serializable to a JSON string. We use JSON.stringify to generate the cache key, so two different exceptions, DOM nodes, or other non-serializable objects might look the same in the cache unless you specify `extraCacheKey`.

**Example**

```js
import { callProp } from 'react-updaters';

class ControlledFriedChickenOrderer extends React.PureComponent {
  static propTypes = {
    orderFriedChicken: PropTypes.func.isRequired,
  };

  render() {
    return (<p>
      How many fried chicken pieces would you like?

      {/* Equivalent to `this.props.orderFriedChicken.bind(this, 1) */}
      <button onClick={callProp(this, 'orderFriedChicken', [1])}>
        One
      </button>
      <button onClick={callProp(this, 'orderFriedChicken', [2])}>
        Two
      </button>
      <button onClick={callProp(this, 'orderFriedChicken', [5])}>
        Five
      </button>
      <button onClick={callProp(this, 'orderFriedChicken', [100])}>
        All of them
      </button>
    </p>);
  }
}
```

### Miscellaneous functions

#### <a id="registerRef"></a> `registerRef(elem, variableName)`

**Description:** helps register a ref by storing it as `elem[variableName]` on the component `elem`. The following are equivalent:

**Example**

```js
import { registerRef } from 'react-updaters';

<ChildComponent ref={(component) => this._childComponent = component} />
<ChildComponent ref={registerRef(this, '_childComponent')} />
```

#### <a id="preventDefault"></a> `preventDefault` and `stopPropagation`

**Description:** two functions that can be used as event handlers to prevent default event actions/bubbling. These are useful for e.g., links that just trigger tooltips.

**Example**

```js
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { preventDefault } from 'react-updaters';

<OverlayTrigger overlay={<Tooltip>This is a tooltip!</Tooltip>}>
  <a href="#" onClick={preventDefault}>Hover to show tooltip</a>
</OverlayTrigger>
```

### Compositors

#### <a id="all"></a> `all(this, [handler1, handler2])`

**Description:** allows one to combine multiple event handlers (from `react-updaters` or from elsewhere) into a single event handler, while preserving PureRender semantics (i.e., calling `all(this, [handler1, handler2])` with the same `handler1` and `handler2` will give you the same (`===`) function each time.)

**Example**

```js
import { setState, update, all } from 'react-updaters';

render() {
  const { name, nameChanged } = this.state;
  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={all(this, [
          setState(this, 'nameChanged', true),
          update(this, 'name'),
        ])}
      />
      {nameChanged && 'Warning: you have edited your name!'}
    </div>
  );
}
```
