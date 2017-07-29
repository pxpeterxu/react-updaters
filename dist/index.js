'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preventDefault = preventDefault;
exports.stopPropagation = stopPropagation;
exports.preventDefaultAndBlur = preventDefaultAndBlur;
exports.toggle = toggle;
exports.toggleProp = toggleProp;
exports.toggleValue = toggleValue;
exports.togglePropValue = togglePropValue;
exports.toggleFromEvent = toggleFromEvent;
exports.togglePropFromEvent = togglePropFromEvent;
exports.setProp = setProp;
exports.setPropNumber = setPropNumber;
exports.setPropValue = setPropValue;
exports.deleteProp = deleteProp;
exports.update = update;
exports.updateNumber = updateNumber;
exports.setState = setState;
exports.deleteState = deleteState;
exports.getChanged = getChanged;
exports.getThen = getThen;
exports.getCatch = getCatch;
exports.renderResponse = renderResponse;
exports.all = all;
exports.fromEvent = fromEvent;
exports.numberFromEvent = numberFromEvent;
exports.constant = constant;
exports.remove = remove;
exports.negate = negate;
exports.toggleConstant = toggleConstant;
exports.setOrNull = setOrNull;
exports.changeProp = changeProp;
exports.changeState = changeState;
exports.call = call;
exports.callProp = callProp;
exports.registerRef = registerRef;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable prefer-rest-params */

function preventDefault(event) {
  if (event) event.preventDefault();
}

function stopPropagation(event) {
  if (event) event.stopPropagation();
}

function preventDefaultAndBlur(event) {
  if (event && event.preventDefault) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target) {
      event.target.blur();
    }
  }
}

/**
 * Split a stateIndex path into two parts:
 * 1. Up to where the first immutable object is
 * 2. Everything after that
 * @param obj    object to look in
 * @param index  array of keys to look in obj
 * @note  this must be called with "this" bound correctly
 * @note  this assumes the mutable part comes first
 *        (e.g., with passing a React state object)
 */
function splitMutableImmutable(obj, index) {
  if (typeof index === 'string') {
    index = index.split('.');
  } else if (typeof index === 'number') {
    index = [index];
  }

  var cur = obj;
  var immutableParts = [];
  var mutableParts = [];

  for (var i = 0; i !== index.length; i++) {
    if (_immutable2.default.Iterable.isIterable(cur)) {
      // Everything after the current is mutable
      immutableParts = index.slice(i);
      break;
    }
    var part = index[i];
    mutableParts.push(part);
    cur = obj[part];
  }

  return {
    mutable: mutableParts,
    immutable: immutableParts
  };
}

/**
 * Set a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj         object to set
 * @param stateIndex  path to the property to set
 * @param value       value to set to
 * @param withType    if specified, used with _.setWith; currently disabled
 * @return modified root obj
 */
function setMixed(obj, stateIndex, value, withType) {
  var keys = splitMutableImmutable(obj, stateIndex);
  var hasMutable = !!keys.mutable.length;
  var hasImmutable = !!keys.immutable.length;

  var immutable = hasMutable ? _lodash2.default.get(obj, keys.mutable) : obj;
  var curValue = hasImmutable ? immutable.getIn(keys.immutable) : immutable;
  if (curValue === value) {
    // Prevent unneeded changes
    return obj;
  }

  var toSet = hasImmutable ? immutable.setIn(keys.immutable, value) : value;

  if (hasMutable) {
    var keysSoFar = [];

    // Clone parents so that we still have good behavior
    // with PureRenderMixin
    obj = _lodash2.default.clone(obj);
    for (var i = 0; i !== keys.mutable.length - 1; i++) {
      var key = keys.mutable[i];
      keysSoFar.push(key);
      _lodash2.default.set(obj, keysSoFar, _lodash2.default.clone(_lodash2.default.get(obj, keysSoFar)));
    }

    if (!withType) {
      _lodash2.default.set(obj, keys.mutable, toSet);
    } else {
      _lodash2.default.setWith(obj, keys.mutable, toSet, withType);
    }
    return obj;
  } else {
    // Purely immutable
    return toSet;
  }
}

/**
 * Get a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj         object to get
 * @param stateIndex  path to the property to set
 * @return value or undefined
 */
function getMixed(obj, stateIndex) {
  var keys = splitMutableImmutable(obj, stateIndex);
  var hasMutable = !!keys.mutable.length;
  var hasImmutable = !!keys.immutable.length;

  var immutable = hasMutable ? _lodash2.default.get(obj, keys.mutable) : obj;
  var value = hasImmutable ? immutable.getIn(keys.immutable) : immutable;

  return value;
}

/**
 * Delete a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj         object to delete in
 * @param stateIndex  path of item to delete
 * @return updated obj (with shallow copies to preserve immutable semantices)
 */
function deleteMixed(obj, stateIndex) {
  var keys = splitMutableImmutable(obj, stateIndex);
  var hasMutable = !!keys.mutable.length;
  var hasImmutable = !!keys.immutable.length;
  var immutable = hasMutable ? _lodash2.default.get(obj, keys.mutable) : obj;
  var toSet = hasImmutable ? immutable.deleteIn(keys.immutable) : immutable;

  if (hasMutable) {
    var keysSoFar = [];

    // Clone parents so that we still have good behavior
    // with PureRenderMixin
    obj = _lodash2.default.clone(obj);
    for (var i = 0; i !== keys.mutable.length - 1; i++) {
      var key = keys.mutable[i];
      keysSoFar.push(key);
      _lodash2.default.set(obj, keysSoFar, _lodash2.default.clone(_lodash2.default.get(obj, keysSoFar)));
    }

    if (hasImmutable) {
      // The deletion took place in the immutable part
      _lodash2.default.set(obj, keys.mutable, toSet);
    } else {
      // Use the second-to-last key to get the object to delete in
      var deleteObjKey = keys.mutable.slice(0, -1);
      var deleteObj = deleteObjKey.length !== 0 ? _lodash2.default.get(obj, deleteObjKey) : obj;
      var deleteKey = keys.mutable[keys.mutable.length - 1];

      if (deleteObj instanceof Array) {
        deleteObj.splice(deleteKey, 1);
      } else {
        delete deleteObj[deleteKey];
      }
    }
    return obj;
  } else {
    // Purely immutable
    return toSet;
  }
}

/**
 * Get an event handler that will toggle the value of the given
 * state key given by path
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param preventDefault  whether to preventDefault
 */
function toggle(elem, stateIndex, preventDefault) {
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
function toggleProp(elem, propFunc, propIndex, indexInProp, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, negate, preventDefault, 'negate');
}

/**
 * Get an event handler that will toggle the value of the given
 * state key to either the value given or null
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param value           value to set (if it's not already the current value)
 * @param preventDefault  whether to preventDefault
 */
function toggleValue(elem, stateIndex, value, preventDefault) {
  return changeState(elem, stateIndex, toggleConstant(value), preventDefault, ['toggleConstant', value]);
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
function togglePropValue(elem, propFunc, propIndex, indexInProp, value, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, toggleConstant(value), preventDefault, ['toggleConstant', value]);
}

/**
 * Get an event handler that will toggle the value of the given
 * state key given by path to either the value passed (if it's
 * currently set to something else) or null
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param preventDefault  whether to preventDefault
 */
function toggleFromEvent(elem, stateIndex, preventDefault) {
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
function togglePropFromEvent(elem, propFunc, propIndex, indexInProp, value, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, setOrNull, preventDefault, 'setOrNull');
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
function setProp(elem, propFunc, propIndex, indexInProp, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, fromEvent, preventDefault, 'fromEvent');
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
function setPropNumber(elem, propFunc, propIndex, indexInProp, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, numberFromEvent, preventDefault, 'numberFromEvent');
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
function setPropValue(elem, propFunc, propIndex, indexInProp, value, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, constant(value), preventDefault, ['constant', value]);
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
function deleteProp(elem, propFunc, propIndex, indexInProp, preventDefault) {
  return changeProp(elem, propFunc, propIndex, null, remove(indexInProp), preventDefault, ['remove', indexInProp]);
}

/**
 * Get a function that will update a part of the current element's
 * state based on the stateIndex passed
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param preventDefault  whether to preventDefault on the event
 */
function update(elem, stateIndex, preventDefault) {
  return changeState(elem, stateIndex, fromEvent, preventDefault, 'fromEvent');
}

/**
 * Get a function that will update a part of the current element's
 * state based on the stateIndex passed to a numeric (or null) value
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param preventDefault  whether to preventDefault on the event
 */
function updateNumber(elem, stateIndex, preventDefault) {
  return changeState(elem, stateIndex, numberFromEvent, preventDefault, 'numberFromEvent');
}

/**
 * Get a function that will set the state for a certain element
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
function setState(elem, stateIndex, value, preventDefault) {
  return changeState(elem, stateIndex, constant(value), preventDefault, ['constant', value]);
}

/**
 * Get a function that will delete a key from within the state
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
function deleteState(elem, stateIndex, preventDefault) {
  return changeState(elem, stateIndex[0], remove(stateIndex.slice(1)), preventDefault, ['remove', stateIndex]);
}

/**
 * Filters a changed state variable so that we only include
 * keys that were changed
 * @param origState      original state
 * @param changedState   new state
 * @return changeState, with only the keys that are different from origState
 */
function getChanged(origState, changedState) {
  var changes = {};
  _lodash2.default.forEach(changedState, function (val, key) {
    if (origState[key] !== changedState[key]) {
      changes[key] = val;
    }
  });

  return changes;
}

/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
function getThen(elem, responseKey, loadingKey, dataKey) {
  // Avoid creating new functions if possible
  var cacheKey = ['__cache', JSON.stringify(['getThen', responseKey, loadingKey])];

  responseKey = responseKey || 'response';
  loadingKey = loadingKey || 'loading';
  dataKey = dataKey || 'data';

  var cached = _lodash2.default.get(elem, cacheKey);
  if (cached) return cached;

  var func = function func(data) {
    var newState = {};
    newState[loadingKey] = false;
    newState[responseKey] = data;

    if (data.success && dataKey && data.data) {
      newState[dataKey] = data.data;
    }

    elem.setState(newState);
  };

  _lodash2.default.setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
function getCatch(elem, responseKey, loadingKey) {
  // Avoid creating new functions if possible
  var cacheKey = ['__cache', JSON.stringify(['getCatch', responseKey, loadingKey])];

  responseKey = responseKey || 'response';
  loadingKey = loadingKey || 'loading';

  var cached = _lodash2.default.get(elem, cacheKey);
  if (cached) return cached;

  var func = function func(err) {
    console.error(err.stack);
    var newState = {};
    newState[loadingKey] = false;
    newState[responseKey] = {
      success: false,
      messages: ['An unexpected error has occurred. Please try again later.'],
      error: err
    };
    elem.setState(newState);
  };

  _lodash2.default.setWith(elem, cacheKey, func, Object);
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
function renderResponse(response, options) {
  options = options || {};
  var type = options.type || 'alert'; // Can be substituted with 'text'
  var additionalClasses = options.additionalClasses || '';
  var onClick = options.onClick;
  var errorsOnly = !!options.errorsOnly;

  if (!response) return null;
  if (response.success && errorsOnly) return null;

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return response && response.messages && _react2.default.createElement(
    'div',
    {
      className: type + ' ' + type + '-' + (response.success ? 'success' : 'danger') + (additionalClasses ? ' ' + additionalClasses : '') + (onClick ? ' wa-link' : ''),
      onClick: onClick
    },
    response.messages.map(function (message, i) {
      return _react2.default.createElement(
        'p',
        { key: i },
        message
      );
    })
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
function all(elem, handlers, preventDefault) {
  var cacheKey = ['__cache', 'all'];
  var allCached = _lodash2.default.get(elem, cacheKey) || [];

  // Try to find one in the cache by deep comparisons
  var cached = null;

  for (var j = 0; j !== allCached.length; j++) {
    var item = allCached[j];
    var cachedHandlers = item.args[0];

    var matched = cachedHandlers.length !== 0;
    // Check if all the functions match
    for (var i = 0; i !== cachedHandlers.length; i++) {
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
  if (cached) return cached.func;

  var func = function func(e) {
    if (preventDefault) preventDefaultAndBlur(e);
    var origState = elem.state;

    for (var _i = 0; _i !== handlers.length; _i++) {
      // We may be calling multiple sequential setStates
      // which all act on the initial (pre-setState) state
      // so we'll fake it by saving the state each time
      elem.state = handlers[_i](e);
    }

    elem.state = origState;
    // We want setState to still work
    // Restore the original state
  };

  cached = {
    args: [handlers, preventDefault],
    func: func
  };
  allCached.push(cached);
  _lodash2.default.set(elem, cacheKey, allCached);

  return func;
}

/**
 * getNewValue (updater) function that sets the value to that
 * received in the event
 */
function fromEvent(curValue, e) {
  return e && e.target ? e.target.value : e;
}

/**
 * getNewValue (updater) function that sets the value to that
 * received in the event, cast to a number
 */
function numberFromEvent(curValue, e) {
  var value = parseFloat(e && e.target ? e.target.value : e);
  return isNaN(value) ? null : value;
}

/**
 * Generator of a getNewValue (updater) function that
 * sets the value to a constant specified ahead of time
 */
function constant(value) {
  return function () {
    return value;
  };
}

/**
 * Generator of a getNewValue (updater) function that
 * deletes a key from within an object
 */
function remove(indexToDelete) {
  return function (curValue) {
    return deleteMixed(curValue, indexToDelete);
  };
}

/**
 * getNewValue (updater) function that negates the value
 */
function negate(curValue) {
  return !curValue;
}

/**
 * getNewValue (updater) function that sets the value to that of the constant,
 * or if it's already the same, nulls it
 */
function toggleConstant(value) {
  return function (curValue) {
    return curValue === value ? null : value;
  };
}

/**
 * getNewValue (updater) function that sets the value to that from an event,
 * or if it's already the same, nulls it
 */
function setOrNull(curValue, e) {
  var value = e && e.target ? e.target.value : e;
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
function changeProp(elem, propFunc, propIndex, indexInProp, getNewValue, preventDefault, extraCacheKey) {
  var cacheKey = ['__cache', JSON.stringify(['changeProp', propFunc, propIndex, indexInProp, preventDefault, extraCacheKey])];
  var cached = _lodash2.default.get(elem, cacheKey);
  if (cached) return cached;

  var func = function func(e) {
    if (preventDefault) preventDefaultAndBlur(e);

    var newPropObj = null;
    if (propIndex) {
      var curPropObj = getMixed(elem.props, propIndex);
      if (indexInProp) {
        var curValue = getMixed(curPropObj, indexInProp);
        var newValue = getNewValue(curValue, e);
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

  _lodash2.default.setWith(elem, cacheKey, func, Object);
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
function changeState(elem, stateIndex, getNewValue, preventDefault, extraCacheKey) {
  var cacheKey = ['__cache', JSON.stringify(['changeState', stateIndex, preventDefault, extraCacheKey])];
  var cached = _lodash2.default.get(elem, cacheKey);
  if (cached) return cached;

  var func = function func(e) {
    if (preventDefault) preventDefaultAndBlur(e);

    var curValue = getMixed(elem.state, stateIndex);
    var newValue = getNewValue(curValue, e);
    var newState = setMixed(elem.state, stateIndex, newValue);

    elem.setState(getChanged(elem.state, newState));
    return newState;
  };

  _lodash2.default.setWith(elem, cacheKey, func, Object);
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
function call(elem, funcName, prefixArgs, preventDefault, extraCacheKey) {
  var cacheKey = ['__cache', JSON.stringify(['call', funcName, prefixArgs, preventDefault, extraCacheKey])];
  var cached = _lodash2.default.get(elem, cacheKey);
  if (cached) return cached;

  var func = function func() {
    var args = Array.prototype.slice.call(arguments);

    if (preventDefault && args[0]) preventDefaultAndBlur(args[0]);
    var callArgs = [].concat(prefixArgs).concat(args);

    var func = _lodash2.default.get(elem, funcName);
    if (func) {
      return func.apply(elem, callArgs);
    } else {
      return null;
    }
  };

  _lodash2.default.setWith(elem, cacheKey, func, Object);
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
function callProp(elem, funcName, prefixArgs, preventDefault, extraCacheKey) {
  var cacheKey = ['__cache', JSON.stringify(['callProp', funcName, prefixArgs, preventDefault, extraCacheKey])];
  var cached = _lodash2.default.get(elem, cacheKey);
  if (cached) return cached;

  var func = function func() {
    var args = Array.prototype.slice.call(arguments);

    if (preventDefault && args[0]) preventDefaultAndBlur(args[0]);
    var callArgs = [].concat(prefixArgs || []).concat(args);

    var func = _lodash2.default.get(elem.props, funcName);
    if (func) {
      return func.apply(elem, callArgs);
    } else {
      return null;
    }
  };

  _lodash2.default.setWith(elem, cacheKey, func, Object);
  return func;
}

/**
 * Get a function to be used with ref={} to register a ref into
 * a variable in the current object
 * @param {Object} elem          React component (usually `this`)
 * @param {String} variableName  Name to save ref (e.g., '_elem' for this._elem)
 * @return {function} handler for ref=}}
 */
function registerRef(elem, variableName) {
  var cacheKey = ['__cache', JSON.stringify(['registerRef', variableName])];
  var cached = _lodash2.default.get(elem, cacheKey);
  if (cached) return cached;

  var func = function func(pageElem) {
    _lodash2.default.setWith(elem, variableName, pageElem, Object);
  };

  _lodash2.default.setWith(elem, cacheKey, func, Object);
  return func;
}

exports.default = {
  preventDefault: preventDefault,
  stopPropagation: stopPropagation,
  toggle: toggle,
  toggleValue: toggleValue,
  toggleFromEvent: toggleFromEvent,
  toggleProp: toggleProp,
  togglePropValue: togglePropValue,
  togglePropFromEvent: togglePropFromEvent,
  setProp: setProp,
  setPropNumber: setPropNumber,
  setPropValue: setPropValue,
  deleteProp: deleteProp,
  callProp: callProp,
  call: call,
  update: update,
  updateNumber: updateNumber,
  setState: setState,
  deleteState: deleteState,
  registerRef: registerRef,

  // AJAX response handlers
  getThen: getThen,
  getCatch: getCatch,
  renderResponse: renderResponse,

  // Updaters
  fromEvent: fromEvent,
  numberFromEvent: numberFromEvent,
  constant: constant,
  negate: negate,
  toggleConstant: toggleConstant,

  // Compositors
  all: all,
  changeState: changeState,
  changeProp: changeProp,

  // Utility functions
  setMixed: setMixed,
  getMixed: getMixed,
  deleteMixed: deleteMixed
};