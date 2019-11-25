"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preventDefault = preventDefault;
exports.stopPropagation = stopPropagation;
exports.preventDefaultAndBlur = preventDefaultAndBlur;
exports.set = set;
exports.get = get;
exports.deleteDeep = deleteDeep;
exports.toggle = toggle;
exports.toggleProp = toggleProp;
exports.toggleValue = toggleValue;
exports.togglePropValue = togglePropValue;
exports.toggleFromEvent = toggleFromEvent;
exports.togglePropFromEvent = togglePropFromEvent;
exports.toggleArrayMemberFromEvent = toggleArrayMemberFromEvent;
exports.toggleArrayMember = toggleArrayMember;
exports.togglePropArrayMember = togglePropArrayMember;
exports.togglePropArrayMemberFromEvent = togglePropArrayMemberFromEvent;
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
exports.toggleMembership = toggleMembership;
exports.toggleMembershipFromEvent = toggleMembershipFromEvent;
exports.negate = negate;
exports.toggleConstant = toggleConstant;
exports.setOrNull = setOrNull;
exports.changeProp = changeProp;
exports.changeState = changeState;
exports.call = call;
exports.callProp = callProp;
exports.registerRef = registerRef;
exports["default"] = exports.deleteMixed = exports.getMixed = exports.setMixed = void 0;

var _react = _interopRequireDefault(require("react"));

var _setWith2 = _interopRequireDefault(require("lodash/setWith"));

var _get2 = _interopRequireDefault(require("lodash/get"));

var _set2 = _interopRequireDefault(require("lodash/set"));

var _clone2 = _interopRequireDefault(require("lodash/clone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
 * Many onChange functions either get passed an event (with the changed value
 * in e.target.value) or just the changed value; this disambiguates the two
 */


function getValueFromEventOrValue(e) {
  return e && typeof e !== 'string' && 'target' in e ? e.target.value : e;
}

function normalizeKeys(keys) {
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


function set(obj, keys, value, withType) {
  keys = normalizeKeys(keys);
  var curValue = keys && keys.length !== 0 ? (0, _get2["default"])(obj, keys) : obj;

  if (curValue === value) {
    // Prevent unneeded changes
    return obj;
  }

  var keysSoFar = []; // Clone parents so that we still have good behavior
  // with PureRenderMixin

  obj = (0, _clone2["default"])(obj);

  for (var i = 0; i !== keys.length - 1; i++) {
    var key = keys[i];
    keysSoFar.push(key);
    (0, _set2["default"])(obj, keysSoFar, (0, _clone2["default"])((0, _get2["default"])(obj, keysSoFar)));
  }

  if (!withType) {
    (0, _set2["default"])(obj, keys, value);
  } else {
    (0, _setWith2["default"])(obj, keys, value, withType);
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


function get(obj, keys) {
  return (0, _get2["default"])(obj, keys);
}
/**
 * Delete a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj   object to delete in
 * @param keys  path of item to delete
 * @return updated obj (with shallow copies to preserve immutable semantics)
 */


function deleteDeep(obj, keys) {
  keys = normalizeKeys(keys);
  var keysSoFar = []; // Clone parents so that we still have good behavior
  // with PureRenderMixin

  obj = (0, _clone2["default"])(obj);

  for (var i = 0; i !== keys.length - 1; i++) {
    var key = keys[i];
    keysSoFar.push(key);
    (0, _set2["default"])(obj, keysSoFar, (0, _clone2["default"])((0, _get2["default"])(obj, keysSoFar)));
  } // Use the second-to-last key to get the object to delete in


  var deleteObjKey = keys.slice(0, -1);
  var deleteObj = deleteObjKey.length !== 0 ? (0, _get2["default"])(obj, deleteObjKey) : obj;
  var deleteKey = keys[keys.length - 1];

  if (deleteObj instanceof Array) {
    if (typeof deleteKey !== 'number') {
      throw new Error("We expected a number for the key to delete in an array (in deleteDeep), but got a ".concat(_typeof(deleteKey), " (\"").concat(deleteKey.toString(), "\")"));
    }

    deleteObj.splice(deleteKey, 1);
  } else {
    delete deleteObj[deleteKey];
  }

  return obj;
}

var setMixed = set;
exports.setMixed = setMixed;
var getMixed = get;
exports.getMixed = getMixed;
var deleteMixed = deleteDeep;
/**
 * Get an event handler that will toggle the value of the given
 * state key given by path
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param preventDefault  whether to preventDefault
 */

exports.deleteMixed = deleteMixed;

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
 * Get an event handler that will toggle whether a value is present
 * in an array at the given state key (by adding or removing it);
 * the value is passed from the calling event
 * @param elem            React element; usually "this"
 * @param stateIndex      path (array or string) of array in state to toggle
 * @param preventDefault  whether to preventDefault
 */


function toggleArrayMemberFromEvent(elem, stateIndex, preventDefault) {
  return changeState(elem, stateIndex, toggleMembershipFromEvent, preventDefault, 'toggleMembershipFromEvent');
}
/**
 * Get an event handler that will toggle whether a value is present
 * in an array at the given state key (by adding or removing it)
 * @param elem            React element; usually "this"
 * @param stateIndex      path (array or string) of array in state to toggle
 * @param value           value to toggle
 * @param preventDefault  whether to preventDefault
 */


function toggleArrayMember(elem, stateIndex, value, preventDefault) {
  return changeState(elem, stateIndex, toggleMembership(value), preventDefault, ['toggleMembership', value]);
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


function togglePropArrayMember(elem, propFunc, propIndex, indexInProp, value, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, toggleMembership(value), preventDefault, ['toggleMembership', value]);
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


function togglePropArrayMemberFromEvent(elem, propFunc, propIndex, indexInProp, preventDefault) {
  return changeProp(elem, propFunc, propIndex, indexInProp, toggleMembershipFromEvent, preventDefault, 'toggleMembershipFromEvent');
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
  var arrayStateIndex = normalizeKeys(stateIndex);
  return changeState(elem, stateIndex[0], remove(arrayStateIndex.slice(1)), preventDefault, ['remove', arrayStateIndex.slice(1)]);
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

  for (var _i = 0, _Object$keys = Object.keys(changedState); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];

    if (origState[key] !== changedState[key]) {
      changes[key] = changedState[key];
    }
  }

  return changes;
}

/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
function getThen(elem) {
  var responseKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'response';
  var loadingKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'loading';
  var dataKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'data';
  // Avoid creating new functions if possible
  var cacheKey = ['__cache', JSON.stringify(['getThen', responseKey, loadingKey])];
  var func = (0, _get2["default"])(elem, cacheKey);
  if (func) return func;

  func = function func(data) {
    var newState = {};
    newState[loadingKey] = false;
    newState[responseKey] = data;

    if (data.success && dataKey && data.data) {
      newState[dataKey] = data.data;
    }

    elem.setState(newState);
  };

  (0, _setWith2["default"])(elem, cacheKey, func, Object);
  return func;
}
/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */


function getCatch(elem) {
  var responseKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'response';
  var loadingKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'loading';
  // Avoid creating new functions if possible
  var cacheKey = ['__cache', JSON.stringify(['getCatch', responseKey, loadingKey])];
  responseKey = responseKey || 'response';
  loadingKey = loadingKey || 'loading';
  var cached = (0, _get2["default"])(elem, cacheKey);
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

  (0, _setWith2["default"])(elem, cacheKey, func, Object);
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
  return response && response.messages && _react["default"].createElement("div", {
    className: "".concat(type, " ").concat(type, "-") + (response.success ? 'success' : 'danger') + (additionalClasses ? ' ' + additionalClasses : '') + (onClick ? ' wa-link' : ''),
    onClick: onClick
  }, response.messages.map(function (message, i) {
    return _react["default"].createElement("p", {
      key: i
    }, message);
  }));
}
/** Item within the array for the `all()` cache */


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
  var allCached = (0, _get2["default"])(elem, cacheKey) || []; // Try to find one in the cache by deep comparisons

  var cached = null;

  for (var j = 0; j !== allCached.length; j++) {
    var item = allCached[j];
    var cachedHandlers = item.args[0];
    var matched = cachedHandlers.length !== 0; // Check if all the functions match

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
    if (preventDefault && 'preventDefault' in e) {
      preventDefaultAndBlur(e);
    }

    var origState = elem.state;

    for (var _i2 = 0; _i2 !== handlers.length; _i2++) {
      // We may be calling multiple sequential setStates
      // which all act on the initial (pre-setState) state
      // so we'll fake it by saving the state each time
      elem.state = handlers[_i2](e);
    }

    elem.state = origState; // We want setState to still work
    // Restore the original state
  };

  cached = {
    args: [handlers, preventDefault],
    func: func
  };
  allCached.push(cached);
  (0, _set2["default"])(elem, cacheKey, allCached);
  return func;
}
/**
 * getNewValue (updater) function that sets the value to that
 * received in the event
 */


function fromEvent(curValue, e) {
  return getValueFromEventOrValue(e);
}
/**
 * getNewValue (updater) function that sets the value to that
 * received in the event, cast to a number
 */


function numberFromEvent(curValue, e) {
  var value = parseFloat(getValueFromEventOrValue(e));
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
 * Generator of a getNewValue (updater) function that
 * adds or splices an element from an array based on
 * whether it's in the array already
 */


function toggleMembership(value) {
  return function (curValue) {
    var index = curValue.indexOf(value);

    if (index === -1) {
      return curValue.concat([value]);
    } else {
      return curValue.filter(function (val) {
        return val !== value;
      });
    }
  };
}
/**
 * Generator of a getNewValue (updater) function that
 * adds or splices a value (from an event or caller)
 * from an array based on whether it's in the array
 */


function toggleMembershipFromEvent(curValue, event) {
  var value = getValueFromEventOrValue(event);
  var index = curValue.indexOf(value);

  if (index === -1) {
    return curValue.concat([value]);
  } else {
    return curValue.filter(function (val) {
      return val !== value;
    });
  }
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
  var value = getValueFromEventOrValue(e);
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
  var func = (0, _get2["default"])(elem, cacheKey);
  if (func) return func;

  func = function func(e) {
    if (preventDefault) preventDefaultAndBlur(e);
    var newPropObj = null;

    if (propIndex != null) {
      var curPropObj = getMixed(elem.props, propIndex);

      if (indexInProp != null) {
        var _curValue = getMixed(curPropObj, indexInProp);

        var newValue = getNewValue(_curValue, e);
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

  (0, _setWith2["default"])(elem, cacheKey, func, Object);
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
  var func = (0, _get2["default"])(elem, cacheKey);
  if (func) return func;

  func = function func(e) {
    if (preventDefault) preventDefaultAndBlur(e);
    var curValue = getMixed(elem.state, stateIndex);
    var newValue = getNewValue(curValue, e);
    var newState = setMixed(elem.state, stateIndex, newValue); // We need the cast because Partial<StateT> can't be assigned to the
    // value of setState due to the stricter type-checking

    elem.setState(getChanged(elem.state, newState));
    return newState;
  };

  (0, _setWith2["default"])(elem, cacheKey, func, Object);
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
  var func = (0, _get2["default"])(elem, cacheKey);
  if (func) return func;

  func = function func() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (preventDefault && args[0]) preventDefaultAndBlur(args[0]);
    var callArgs = (prefixArgs || []).concat(args);
    var func = (0, _get2["default"])(elem, funcName);

    if (func) {
      return func.apply(elem, callArgs);
    } else {
      return null;
    }
  };

  (0, _setWith2["default"])(elem, cacheKey, func, Object);
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
  var func = (0, _get2["default"])(elem, cacheKey);
  if (func) return func;

  func = function func() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (preventDefault && args[0]) preventDefaultAndBlur(args[0]);
    var callArgs = (prefixArgs || []).concat(args);
    var func = (0, _get2["default"])(elem.props, funcName);

    if (func) {
      return func.apply(elem, callArgs);
    } else {
      return null;
    }
  };

  (0, _setWith2["default"])(elem, cacheKey, func, Object);
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


function registerRef(elem, variableName) {
  var cacheKey = ['__cache', JSON.stringify(['registerRef', variableName])];
  var cached = (0, _get2["default"])(elem, cacheKey);
  if (cached) return cached;

  var func = function func(pageElem) {
    (0, _setWith2["default"])(elem, variableName, pageElem, Object);
  };

  (0, _setWith2["default"])(elem, cacheKey, func, Object);
  return func;
}

var _default = {
  preventDefault: preventDefault,
  stopPropagation: stopPropagation,
  toggle: toggle,
  toggleValue: toggleValue,
  toggleFromEvent: toggleFromEvent,
  toggleArrayMember: toggleArrayMember,
  toggleArrayMemberFromEvent: toggleArrayMemberFromEvent,
  toggleProp: toggleProp,
  togglePropValue: togglePropValue,
  togglePropFromEvent: togglePropFromEvent,
  togglePropArrayMember: togglePropArrayMember,
  togglePropArrayMemberFromEvent: togglePropArrayMemberFromEvent,
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
  // Legacy names
  setMixed: setMixed,
  getMixed: getMixed,
  deleteMixed: deleteMixed,
  set: set,
  get: get,
  deleteDeep: deleteDeep
};
exports["default"] = _default;

