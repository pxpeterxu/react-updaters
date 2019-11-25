import React from 'react';
import _setWith from 'lodash/setWith';
import _get from 'lodash/get';
import _set from 'lodash/set';
import _clone from 'lodash/clone';

export function preventDefault(event: AnyEvent) {
  if (event) event.preventDefault();
}

export function stopPropagation(event: AnyEvent) {
  if (event) event.stopPropagation();
}

export function preventDefaultAndBlur<EventT extends AnyEvent>(event: EventT) {
  if (event && event.preventDefault) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target) {
      (event.target as any).blur();
    }
  }
}

/**
 * Many onChange functions either get passed an event (with the changed value
 * in e.target.value) or just the changed value; this disambiguates the two
 */
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
type EventOrValue = InputChangeEvent | string;
function getValueFromEventOrValue(e: EventOrValue) {
  return e && typeof e !== 'string' && 'target' in e ? e.target.value : e;
}
type AnyEvent = React.SyntheticEvent | Event;

type Key = string | number | symbol;
type Keys = Key | Key[];
type TypeSafeKeys<T> = keyof T | [keyof T, ...(string | number)[]];
type GetNewValueFunc = (curValue: unknown, event: EventOrValue) => unknown;

function normalizeKeys<T>(keys: T | T[]): T[] {
  if (!(keys instanceof Array)) return [keys];
  return keys;
}

/**
 * Set a variable deep in a map/array while preserving immutable semantics
 * @param obj         object to set
 * @param stateIndex  path to the property to set
 * @param value       value to set to
 * @param withType    if specified, used with _setWith; currently disabled
 * @return modified root obj
 */
export function set<T extends Object>(
  obj: T,
  keys: Keys,
  value: any,
  withType?: any | null,
) {
  keys = normalizeKeys(keys);
  const curValue = keys && keys.length !== 0 ? _get(obj, keys) : obj;
  if (curValue === value) {
    // Prevent unneeded changes
    return obj;
  }

  const keysSoFar = [];

  // Clone parents so that we still have good behavior
  // with PureRenderMixin
  obj = _clone(obj);
  for (let i = 0; i !== keys.length - 1; i++) {
    const key = keys[i];
    keysSoFar.push(key);
    _set(obj, keysSoFar, _clone(_get(obj, keysSoFar)));
  }

  if (!withType) {
    _set(obj, keys, value);
  } else {
    _setWith(obj, keys, value, withType);
  }

  return obj;
}

/**
 * Get a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj   object to get
 * @param keys  path to the property to get
 * @return value or undefined
 */
export function get(obj: Object | any[], keys: Keys) {
  return _get(obj, keys);
}

/**
 * Delete a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj   object to delete in
 * @param keys  path of item to delete
 * @return updated obj (with shallow copies to preserve immutable semantics)
 */
export function deleteDeep<T extends Object>(obj: T, keys: Keys) {
  keys = normalizeKeys(keys);
  const keysSoFar = [];

  // Clone parents so that we still have good behavior
  // with PureRenderMixin
  obj = _clone(obj);
  for (let i = 0; i !== keys.length - 1; i++) {
    const key = keys[i];
    keysSoFar.push(key);
    _set(obj, keysSoFar, _clone(_get(obj, keysSoFar)));
  }

  // Use the second-to-last key to get the object to delete in
  const deleteObjKey = keys.slice(0, -1);
  const deleteObj = deleteObjKey.length !== 0 ? _get(obj, deleteObjKey) : obj;
  const deleteKey = keys[keys.length - 1];

  if (deleteObj instanceof Array) {
    if (typeof deleteKey !== 'number') {
      throw new Error(
        `We expected a number for the key to delete in an array (in deleteDeep), but got a ${typeof deleteKey} ("${deleteKey.toString()}")`,
      );
    }
    deleteObj.splice(deleteKey, 1);
  } else {
    delete deleteObj[deleteKey];
  }

  return obj;
}

export const setMixed = set;
export const getMixed = get;
export const deleteMixed = deleteDeep;

/**
 * Get an event handler that will toggle the value of the given
 * state key given by path
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param preventDefault  whether to preventDefault
 */
export function toggle<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  preventDefault?: boolean,
) {
  return changeState(elem, stateIndex, negate, preventDefault, 'negate');
}

/**
 * Get an event handler that will toggle the value of the given
 * prop key given by path using the propFunc
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the value to toggle
 * @param preventDefault  whether to preventDefault
 */
export function toggleProp<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp?: Keys | null,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    negate,
    preventDefault,
    'negate',
  );
}

/**
 * Get an event handler that will toggle the value of the given
 * state key to either the value given or null
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param value           value to set (if it's not already the current value)
 * @param preventDefault  whether to preventDefault
 */
export function toggleValue<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  value: any,
  preventDefault?: boolean,
) {
  return changeState(elem, stateIndex, toggleConstant(value), preventDefault, [
    'toggleConstant',
    value,
  ]);
}

/**
 * Get an event handler that will toggle the value of the given
 * prop key given by path using the propFunc
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the value to toggle
 * @param value           value to set (if it's not already the current value)
 * @param preventDefault  whether to preventDefault
 */
export function togglePropValue<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys | null,
  value: any,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    toggleConstant(value),
    preventDefault,
    ['toggleConstant', value],
  );
}

/**
 * Get an event handler that will toggle the value of the given
 * state key given by path to either the value passed (if it's
 * currently set to something else) or null
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param preventDefault  whether to preventDefault
 */
export function toggleFromEvent<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  preventDefault?: boolean,
) {
  return changeState(elem, stateIndex, setOrNull, preventDefault, 'setOrNull');
}

/**
 * Get an event handler that will toggle the value of the given
 * prop key given by path using the propFunc to:
 * 1. The value from the event (if it's not already that value), or
 * 2. null, if it already is that value
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the value to toggle
 * @param preventDefault  whether to preventDefault
 */
export function togglePropFromEvent<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys,
  value: any,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    setOrNull,
    preventDefault,
    'setOrNull',
  );
}

/**
 * Get an event handler that will toggle whether a value is present
 * in an array at the given state key (by adding or removing it);
 * the value is passed from the calling event
 * @param elem            React element; usually "this"
 * @param stateIndex      path (array or string) of array in state to toggle
 * @param preventDefault  whether to preventDefault
 */
export function toggleArrayMemberFromEvent<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  preventDefault?: boolean,
) {
  return changeState(
    elem,
    stateIndex,
    toggleMembershipFromEvent,
    preventDefault,
    'toggleMembershipFromEvent',
  );
}

/**
 * Get an event handler that will toggle whether a value is present
 * in an array at the given state key (by adding or removing it)
 * @param elem            React element; usually "this"
 * @param stateIndex      path (array or string) of array in state to toggle
 * @param value           value to toggle
 * @param preventDefault  whether to preventDefault
 */
export function toggleArrayMember<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  value: any,
  preventDefault?: boolean,
) {
  return changeState(
    elem,
    stateIndex,
    toggleMembership(value),
    preventDefault,
    ['toggleMembership', value],
  );
}

/**
 * Get an event handler that will toggle whether a value is present
 * in an array at the given prop key (by adding or removing it)
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the array to change (or null
 *                        if propIndex already points to the array)
 * @param value           value to toggle
 * @param preventDefault  whether to preventDefault
 */
export function togglePropArrayMember<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys | null | undefined,
  value: any,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    toggleMembership(value),
    preventDefault,
    ['toggleMembership', value],
  );
}

/**
 * Get an event handler that will toggle whether a value (passed in
 * as an argument) should be in an array at the given prop key
 * (by adding or removing it)
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the array to change (or null
 *                        if propIndex already points to the array)
 * @param preventDefault  whether to preventDefault
 */
export function togglePropArrayMemberFromEvent<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys | null | undefined,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    toggleMembershipFromEvent,
    preventDefault,
    'toggleMembershipFromEvent',
  );
}

/**
 * Get an event handler that will set the value of a prop
 * based on the information given
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the value to change
 * @param preventDefault  whether to preventDefault
 * @return function to handle events or values being changed
 */
export function setProp<PropT>(
  elem: React.Component<any>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys | null | undefined,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    fromEvent,
    preventDefault,
    'fromEvent',
  );
}

/**
 * Get an event handler that will set the value of a prop
 * based on the information from an event
 * to a numeric value (or null if non-numeric)
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the value to change
 * @param preventDefault  whether to preventDefault
 * @return function to handle events or values being changed
 */
export function setPropNumber<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys | null | undefined,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    numberFromEvent,
    preventDefault,
    'numberFromEvent',
  );
}

/**
 * Get an event handler that will set the value of a prop
 * to a set value
 * @param elem            React element; usually "this"
 * @param propFun         function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param indexInProp     index within the prop of the value to change
 * @param value           value to set that prop to
 * @param preventDefault  whether to preventDefault
 * @return function to handle events or values being changed
 */
export function setPropValue<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys | null | undefined,
  value: any,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    indexInProp,
    constant(value),
    preventDefault,
    ['constant', value],
  );
}

/**
 * Get an event handler that will delete a certain key from a prop
 * and then call an onChange handler; works for both arrays and
 * for objects
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param indexInProp     index within the prop of the value to change
 * @param value           value to set that prop to
 * @param preventDefault  whether to preventDefault
 * @return function to handle events or values being changed
 */
export function deleteProp<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys,
  preventDefault?: boolean,
) {
  return changeProp(
    elem,
    propFunc,
    propIndex,
    null,
    remove(indexInProp),
    preventDefault,
    ['remove', indexInProp],
  );
}

/**
 * Get a function that will update a part of the current element's
 * state based on the stateIndex passed
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param preventDefault  whether to preventDefault on the event
 */
export function update<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  preventDefault?: boolean,
) {
  return changeState(elem, stateIndex, fromEvent, preventDefault, 'fromEvent');
}

/**
 * Get a function that will update a part of the current element's
 * state based on the stateIndex passed to a numeric (or null) value
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param preventDefault  whether to preventDefault on the event
 */
export function updateNumber<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  preventDefault?: boolean,
) {
  return changeState(
    elem,
    stateIndex,
    numberFromEvent,
    preventDefault,
    'numberFromEvent',
  );
}

/**
 * Get a function that will set the state for a certain element
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
export function setState<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  value: any,
  preventDefault?: boolean,
) {
  return changeState(elem, stateIndex, constant(value), preventDefault, [
    'constant',
    value,
  ]);
}

/**
 * Get a function that will delete a key from within the state
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
export function deleteState<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  preventDefault?: boolean,
) {
  const arrayStateIndex = normalizeKeys(stateIndex);
  return changeState(
    elem,
    stateIndex[0],
    remove(arrayStateIndex.slice(1)),
    preventDefault,
    ['remove', arrayStateIndex.slice(1)],
  );
}

/**
 * Filters a changed state variable so that we only include
 * keys that were changed
 * @param origState      original state
 * @param changedState   new state
 * @return changeState, with only the keys that are different from origState
 */
export function getChanged<StateT extends Object>(
  origState: StateT,
  changedState: StateT,
) {
  const changes: Partial<StateT> = {};
  for (const key of Object.keys(changedState)) {
    if (origState[key] !== changedState[key]) {
      changes[key] = changedState[key];
    }
  }

  return changes;
}

interface Response {
  success: boolean;
  data: any;
  messages?: string[];
}

/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
export function getThen(
  elem: React.Component<any>,
  responseKey: string = 'response',
  loadingKey: string = 'loading',
  dataKey: string = 'data',
) {
  // Avoid creating new functions if possible
  const cacheKey = [
    '__cache',
    JSON.stringify(['getThen', responseKey, loadingKey]),
  ];

  const cached: (data: Response) => void = _get(elem, cacheKey);
  if (cached) return cached;

  const func = function(data: Response) {
    const newState = {};
    newState[loadingKey] = false;
    newState[responseKey] = data;

    if (data.success && dataKey && data.data) {
      newState[dataKey] = data.data;
    }

    elem.setState(newState);
  };

  _setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
export function getCatch(
  elem: React.Component<any>,
  responseKey: string = 'response',
  loadingKey: string = 'loading',
) {
  // Avoid creating new functions if possible
  const cacheKey = [
    '__cache',
    JSON.stringify(['getCatch', responseKey, loadingKey]),
  ];

  responseKey = responseKey || 'response';
  loadingKey = loadingKey || 'loading';

  const cached: (err: Error) => void = _get(elem, cacheKey);
  if (cached) return cached;

  const func = function(err: Error) {
    console.error(err.stack);
    const newState = {};
    newState[loadingKey] = false;
    newState[responseKey] = {
      success: false,
      messages: ['An unexpected error has occurred. Please try again later.'],
      error: err,
    };
    elem.setState(newState);
  };

  _setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * Render an alert based on the output from a defaultThen
 * and defaultCatch
 * @param response this.state.response variable
 * @param options.type  type of the container (alert or text)
 * @param options.additionalClasses additional CSS classes for alert
 * @param options.errorsOnly  only render if it's an error
 * @param options.onClick     onClick handler
 * @return alert if success or fail
 */
export function renderResponse(
  response: Response,
  options: {
    type?: 'alert' | 'text' | null;
    additionalClasses?: string | null;
    onClick?: (event: MouseEvent) => void;
    errorsOnly?: boolean | null;
  },
) {
  options = options || {};
  const type = options.type || 'alert'; // Can be substituted with 'text'
  const additionalClasses = options.additionalClasses || '';
  const onClick = options.onClick;
  const errorsOnly = !!options.errorsOnly;

  if (!response) return null;
  if (response.success && errorsOnly) return null;

  return (
    response &&
    response.messages && (
      <div
        className={
          `${type} ${type}-` +
          (response.success ? 'success' : 'danger') +
          (additionalClasses ? ' ' + additionalClasses : '') +
          (onClick ? ' wa-link' : '')
        }
        onClick={onClick as any}
      >
        {response.messages.map((message, i) => (
          <p key={i}>{message}</p>
        ))}
      </div>
    )
  );
}

/**
 * Get an event handler that does all of the entries
 * supplied
 * @param handlers  array of handlers from other functions
 *                  (e.g., setState, update, etc.)
 * @param preventDefault  whether to call preventDefault
 * @return event handler
 */
export function all<EventT extends AnyEvent>(
  elem: React.Component<any>,
  handlers: Function[],
  preventDefault?: boolean,
) {
  const cacheKey = ['__cache', 'all'];
  const allCached = _get(elem, cacheKey) || [];

  // Try to find one in the cache by deep comparisons
  let cached = null;

  for (let j = 0; j !== allCached.length; j++) {
    const item = allCached[j];
    const cachedHandlers = item.args[0];

    let matched = cachedHandlers.length !== 0;
    // Check if all the functions match
    for (let i = 0; i !== cachedHandlers.length; i++) {
      if (cachedHandlers[i] !== handlers[i]) {
        matched = false;
        break;
      }
    }
    if (item.args[1] !== preventDefault) matched = false;

    if (matched) {
      cached = item;
      break;
    }
  }
  if (cached) return cached.func as (e: EventT) => void;

  const func = function(e: EventT) {
    if (preventDefault) preventDefaultAndBlur(e);
    const origState = elem.state;

    for (let i = 0; i !== handlers.length; i++) {
      // We may be calling multiple sequential setStates
      // which all act on the initial (pre-setState) state
      // so we'll fake it by saving the state each time
      elem.state = handlers[i](e);
    }

    elem.state = origState;
    // We want setState to still work
    // Restore the original state
  };

  cached = {
    args: [handlers, preventDefault],
    func,
  };
  allCached.push(cached);
  _set(elem, cacheKey, allCached);

  return func;
}

/**
 * getNewValue (updater) function that sets the value to that
 * received in the event
 */
export function fromEvent(curValue: unknown, e: EventOrValue) {
  return getValueFromEventOrValue(e);
}

/**
 * getNewValue (updater) function that sets the value to that
 * received in the event, cast to a number
 */
export function numberFromEvent(curValue: unknown, e: EventOrValue) {
  const value = parseFloat(getValueFromEventOrValue(e));
  return isNaN(value) ? null : value;
}

/**
 * Generator of a getNewValue (updater) function that
 * sets the value to a constant specified ahead of time
 */
export function constant<T>(value: T): (() => T) {
  return function() {
    return value;
  };
}

/**
 * Generator of a getNewValue (updater) function that
 * deletes a key from within an object
 */
export function remove(indexToDelete: Keys) {
  return function<T extends Object>(curValue: T) {
    return deleteMixed(curValue, indexToDelete);
  };
}

/**
 * Generator of a getNewValue (updater) function that
 * adds or splices an element from an array based on
 * whether it's in the array already
 */
export function toggleMembership(value: unknown) {
  return function(curValue: unknown[]) {
    const index = curValue.indexOf(value);
    if (index === -1) {
      return curValue.concat([value]);
    } else {
      return curValue.filter(val => val !== value);
    }
  };
}

/**
 * Generator of a getNewValue (updater) function that
 * adds or splices a value (from an event or caller)
 * from an array based on whether it's in the array
 */
export function toggleMembershipFromEvent(
  curValue: unknown[],
  event: EventOrValue,
) {
  const value = getValueFromEventOrValue(event);
  const index = curValue.indexOf(value);
  if (index === -1) {
    return curValue.concat([value]);
  } else {
    return curValue.filter(val => val !== value);
  }
}

/**
 * getNewValue (updater) function that negates the value
 */
export function negate(curValue: unknown) {
  return !curValue;
}

/**
 * getNewValue (updater) function that sets the value to that of the constant,
 * or if it's already the same, nulls it
 */
export function toggleConstant<T>(value: T | null) {
  return function(curValue: T | null) {
    return curValue === value ? null : value;
  };
}

/**
 * getNewValue (updater) function that sets the value to that from an event,
 * or if it's already the same, nulls it
 */
export function setOrNull(curValue: any, e: EventOrValue) {
  const value = getValueFromEventOrValue(e);
  return curValue === value ? null : value;
}

/**
 * Get an event handler that will set the value of a prop
 * based on the "getNewValue" function supplied
 * @param elem            React element; usually "this"
 * @param propFunc        function to call to update the prop
 *                        (e.g., 'onPropChanged')
 * @param propIndex       index of the object to change in props
 * @param getNewValue     the function which, when passed the current value, gets the new value
 * @param preventDefault  whether to preventDefault
 * @param extraCacheKey   extra data for the cache key (e.g., for data in changeFunc)
 * @return function to handle events or values being changed
 */
export function changeProp<PropT>(
  elem: React.Component<PropT>,
  propFunc: string,
  propIndex: TypeSafeKeys<PropT>,
  indexInProp: Keys | null | undefined,
  getNewValue: GetNewValueFunc,
  preventDefault?: boolean,
  extraCacheKey?: any,
) {
  const cacheKey = [
    '__cache',
    JSON.stringify([
      'changeProp',
      propFunc,
      propIndex,
      indexInProp,
      preventDefault,
      extraCacheKey,
    ]),
  ];
  const cached = _get(elem, cacheKey);
  if (cached) return cached;

  const func = function(e: InputChangeEvent) {
    if (preventDefault) preventDefaultAndBlur(e);

    let newPropObj = null;
    if (propIndex != null) {
      const curPropObj = getMixed(elem.props, propIndex);
      if (indexInProp != null) {
        const curValue = getMixed(curPropObj, indexInProp);
        const newValue = getNewValue(curValue, e);
        newPropObj = setMixed(curPropObj, indexInProp, newValue);
      } else {
        newPropObj = getNewValue(curPropObj, e);
      }
    } else {
      newPropObj = getNewValue(null, e);
    }

    elem.props[propFunc](newPropObj);
    return newPropObj;
  };

  _setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * Get an event handler that will set the value of a state
 * based on the "getNewValue" function supplied
 * @param elem            React element; usually "this"
 * @param stateIndex      index of the object to change in state
 * @param getNewValue     the function which, when passed the current value, gets the new value
 * @param preventDefault  whether to preventDefault
 * @param extraCacheKey   extra data for the cache key (e.g., for data in changeFunc)
 * @return function to handle events or values being changed
 */
export function changeState<StateT>(
  elem: React.Component<unknown, StateT>,
  stateIndex: TypeSafeKeys<StateT>,
  getNewValue: GetNewValueFunc,
  preventDefault?: boolean,
  extraCacheKey?: any,
) {
  const cacheKey = [
    '__cache',
    JSON.stringify(['changeState', stateIndex, preventDefault, extraCacheKey]),
  ];
  const cached = _get(elem, cacheKey);
  if (cached) return cached;

  const func = function(e: InputChangeEvent) {
    if (preventDefault) preventDefaultAndBlur(e);

    const curValue = getMixed(elem.state, stateIndex);
    const newValue = getNewValue(curValue, e);
    const newState: StateT = setMixed(elem.state, stateIndex, newValue);

    // We need the cast because Partial<StateT> can't be assigned to the
    // value of setState due to the stricter type-checking
    elem.setState(getChanged(elem.state, newState) as StateT);
    return newState;
  };

  _setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * Get an event handler that will call a function on the React
 * component
 * @param elem            React element; usually "this"
 * @param funcName        name of the function (this.blah -> "blah")
 * @param prefixArgs      arguments to prefix onto the called arguments
 * @param preventDefault  whether to preventDefault
 * @param extraCacheKey   extra data for the cache key (e.g., for data in changeFunc)
 * @return handler that calls a component function
 */
export function call<T extends Object>(
  elem: T,
  funcName: TypeSafeKeys<T>,
  prefixArgs?: any[] | null,
  preventDefault?: boolean,
  extraCacheKey?: any,
) {
  const cacheKey = [
    '__cache',
    JSON.stringify([
      'call',
      funcName,
      prefixArgs,
      preventDefault,
      extraCacheKey,
    ]),
  ];
  const cached = _get(elem, cacheKey);
  if (cached) return cached;

  const func = function() {
    const args = Array.prototype.slice.call(arguments);

    if (preventDefault && args[0]) preventDefaultAndBlur(args[0]);
    const callArgs = (prefixArgs || []).concat(args);

    const func = _get(elem, funcName);
    if (func) {
      return func.apply(elem, callArgs);
    } else {
      return null;
    }
  };

  _setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * Get an event handler that will call a function on the React
 * component's props with given arguments
 * @param elem            React element; usually "this"
 * @param funcName        name of the function (this.blah -> "blah")
 * @param prefixArgs      arguments to prefix onto the called arguments
 * @param preventDefault  whether to preventDefault
 * @param extraCacheKey   extra data for the cache key (e.g., for data in changeFunc)
 * @return handler that calls a component function
 */
export function callProp<PropT>(
  elem: React.Component<PropT>,
  funcName: TypeSafeKeys<PropT>,
  prefixArgs?: any[] | null,
  preventDefault?: boolean,
  extraCacheKey?: any,
) {
  const cacheKey = [
    '__cache',
    JSON.stringify([
      'callProp',
      funcName,
      prefixArgs,
      preventDefault,
      extraCacheKey,
    ]),
  ];
  const cached = _get(elem, cacheKey);
  if (cached) return cached;

  const func = function() {
    const args = Array.prototype.slice.call(arguments);

    if (preventDefault && args[0]) preventDefaultAndBlur(args[0]);
    const callArgs = (prefixArgs || []).concat(args);

    const func = _get(elem.props, funcName);
    if (func) {
      return func.apply(elem, callArgs);
    } else {
      return null;
    }
  };

  _setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * @deprecated
 * Prefer using `React.createRef` object-based refs instead of this function.
 * 
 * Get a function to be used with ref={} to register a ref into
 * a variable in the current object.
 * @param {Object} elem          React component (usually `this`)
 * @param {String} variableName  Name to save ref (e.g., '_elem' for this._elem)
 * @return {function} handler for ref=}}
 */
export function registerRef<T extends Object>(elem: T, variableName: Keys) {
  const cacheKey = ['__cache', JSON.stringify(['registerRef', variableName])];
  const cached = _get(elem, cacheKey);
  if (cached) return cached;

  const func = function(pageElem: any) {
    _setWith(elem, variableName, pageElem, Object);
  };

  _setWith(elem, cacheKey, func, Object);
  return func;
}

export default {
  preventDefault,
  stopPropagation,
  toggle,
  toggleValue,
  toggleFromEvent,
  toggleArrayMember,
  toggleArrayMemberFromEvent,
  toggleProp,
  togglePropValue,
  togglePropFromEvent,
  togglePropArrayMember,
  togglePropArrayMemberFromEvent,
  setProp,
  setPropNumber,
  setPropValue,
  deleteProp,
  callProp,
  call,
  update,
  updateNumber,
  setState,
  deleteState,
  registerRef,

  // AJAX response handlers
  getThen,
  getCatch,
  renderResponse,

  // Updaters
  fromEvent,
  numberFromEvent,
  constant,
  negate,
  toggleConstant,

  // Compositors
  all,
  changeState,
  changeProp,

  // Utility functions
  // Legacy names
  setMixed,
  getMixed,
  deleteMixed,

  set,
  get,
  deleteDeep,
};
