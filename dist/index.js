"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const setWith_1 = __importDefault(require("lodash/setWith"));
const get_1 = __importDefault(require("lodash/get"));
const set_1 = __importDefault(require("lodash/set"));
const clone_1 = __importDefault(require("lodash/clone"));
/* eslint-disable prefer-rest-params */
function preventDefault(event) {
    if (event)
        event.preventDefault();
}
exports.preventDefault = preventDefault;
function stopPropagation(event) {
    if (event)
        event.stopPropagation();
}
exports.stopPropagation = stopPropagation;
function preventDefaultAndBlur(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
        event.stopPropagation();
        if (event.target) {
            event.target.blur();
        }
    }
}
exports.preventDefaultAndBlur = preventDefaultAndBlur;
function getValueFromEventOrValue(e) {
    return e && e.target ? e.target.value : e;
}
function normalizeKeys(keys) {
    if (typeof keys === 'string')
        keys = keys.split('.');
    if (!(keys instanceof Array))
        keys = [keys];
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
    const curValue = keys && keys.length !== 0 ? get_1.default(obj, keys) : obj;
    if (curValue === value) {
        // Prevent unneeded changes
        return obj;
    }
    const keysSoFar = [];
    // Clone parents so that we still have good behavior
    // with PureRenderMixin
    obj = clone_1.default(obj);
    for (let i = 0; i !== keys.length - 1; i++) {
        const key = keys[i];
        keysSoFar.push(key);
        set_1.default(obj, keysSoFar, clone_1.default(get_1.default(obj, keysSoFar)));
    }
    if (!withType) {
        set_1.default(obj, keys, value);
    }
    else {
        setWith_1.default(obj, keys, value, withType);
    }
    return obj;
}
exports.set = set;
/**
 * Get a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj   object to get
 * @param keys  path to the property to get
 * @return value or undefined
 */
function get(obj, keys) {
    return get_1.default(obj, keys);
}
exports.get = get;
/**
 * Delete a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj   object to delete in
 * @param keys  path of item to delete
 * @return updated obj (with shallow copies to preserve immutable semantics)
 */
function deleteDeep(obj, keys) {
    keys = normalizeKeys(keys);
    const keysSoFar = [];
    // Clone parents so that we still have good behavior
    // with PureRenderMixin
    obj = clone_1.default(obj);
    for (let i = 0; i !== keys.length - 1; i++) {
        const key = keys[i];
        keysSoFar.push(key);
        set_1.default(obj, keysSoFar, clone_1.default(get_1.default(obj, keysSoFar)));
    }
    // Use the second-to-last key to get the object to delete in
    const deleteObjKey = keys.slice(0, -1);
    const deleteObj = deleteObjKey.length !== 0 ? get_1.default(obj, deleteObjKey) : obj;
    const deleteKey = keys[keys.length - 1];
    if (deleteObj instanceof Array) {
        if (typeof deleteKey !== 'number') {
            throw new Error(`We expected a number for the key to delete in an array (in deleteDeep), but got a ${typeof deleteKey} ("${deleteKey.toString()}")`);
        }
        deleteObj.splice(deleteKey, 1);
    }
    else {
        delete deleteObj[deleteKey];
    }
    return obj;
}
exports.deleteDeep = deleteDeep;
exports.setMixed = set;
exports.getMixed = get;
exports.deleteMixed = deleteDeep;
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
exports.toggle = toggle;
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
exports.toggleProp = toggleProp;
/**
 * Get an event handler that will toggle the value of the given
 * state key to either the value given or null
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param value           value to set (if it's not already the current value)
 * @param preventDefault  whether to preventDefault
 */
function toggleValue(elem, stateIndex, value, preventDefault) {
    return changeState(elem, stateIndex, toggleConstant(value), preventDefault, [
        'toggleConstant',
        value,
    ]);
}
exports.toggleValue = toggleValue;
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
exports.togglePropValue = togglePropValue;
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
exports.toggleFromEvent = toggleFromEvent;
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
exports.togglePropFromEvent = togglePropFromEvent;
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
exports.toggleArrayMemberFromEvent = toggleArrayMemberFromEvent;
/**
 * Get an event handler that will toggle whether a value is present
 * in an array at the given state key (by adding or removing it)
 * @param elem            React element; usually "this"
 * @param stateIndex      path (array or string) of array in state to toggle
 * @param value           value to toggle
 * @param preventDefault  whether to preventDefault
 */
function toggleArrayMember(elem, stateIndex, value, preventDefault) {
    return changeState(elem, stateIndex, toggleMembership(value), preventDefault, ['toggleMembership']);
}
exports.toggleArrayMember = toggleArrayMember;
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
exports.togglePropArrayMember = togglePropArrayMember;
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
exports.togglePropArrayMemberFromEvent = togglePropArrayMemberFromEvent;
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
exports.setProp = setProp;
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
exports.setPropNumber = setPropNumber;
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
exports.setPropValue = setPropValue;
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
exports.deleteProp = deleteProp;
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
exports.update = update;
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
exports.updateNumber = updateNumber;
/**
 * Get a function that will set the state for a certain element
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
function setState(elem, stateIndex, value, preventDefault) {
    return changeState(elem, stateIndex, constant(value), preventDefault, [
        'constant',
        value,
    ]);
}
exports.setState = setState;
/**
 * Get a function that will delete a key from within the state
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
function deleteState(elem, stateIndex, preventDefault) {
    stateIndex = normalizeKeys(stateIndex);
    return changeState(elem, stateIndex[0], remove(stateIndex.slice(1)), preventDefault, ['remove', stateIndex]);
}
exports.deleteState = deleteState;
/**
 * Filters a changed state variable so that we only include
 * keys that were changed
 * @param origState      original state
 * @param changedState   new state
 * @return changeState, with only the keys that are different from origState
 */
function getChanged(origState, changedState) {
    const changes = {};
    for (const key of Object.keys(changedState)) {
        if (origState[key] !== changedState[key]) {
            changes[key] = changedState[key];
        }
    }
    return changes;
}
exports.getChanged = getChanged;
/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
function getThen(elem, responseKey = 'response', loadingKey = 'loading', dataKey = 'data') {
    // Avoid creating new functions if possible
    const cacheKey = [
        '__cache',
        JSON.stringify(['getThen', responseKey, loadingKey]),
    ];
    const cached = get_1.default(elem, cacheKey);
    if (cached)
        return cached;
    const func = function (data) {
        const newState = {};
        newState[loadingKey] = false;
        newState[responseKey] = data;
        if (data.success && dataKey && data.data) {
            newState[dataKey] = data.data;
        }
        elem.setState(newState);
    };
    setWith_1.default(elem, cacheKey, func, Object);
    return func;
}
exports.getThen = getThen;
/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
function getCatch(elem, responseKey = 'response', loadingKey = 'loading') {
    // Avoid creating new functions if possible
    const cacheKey = [
        '__cache',
        JSON.stringify(['getCatch', responseKey, loadingKey]),
    ];
    responseKey = responseKey || 'response';
    loadingKey = loadingKey || 'loading';
    const cached = get_1.default(elem, cacheKey);
    if (cached)
        return cached;
    const func = function (err) {
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
    setWith_1.default(elem, cacheKey, func, Object);
    return func;
}
exports.getCatch = getCatch;
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
    const type = options.type || 'alert'; // Can be substituted with 'text'
    const additionalClasses = options.additionalClasses || '';
    const onClick = options.onClick;
    const errorsOnly = !!options.errorsOnly;
    if (!response)
        return null;
    if (response.success && errorsOnly)
        return null;
    return (response &&
        response.messages && (react_1.default.createElement("div", { className: `${type} ${type}-` +
            (response.success ? 'success' : 'danger') +
            (additionalClasses ? ' ' + additionalClasses : '') +
            (onClick ? ' wa-link' : ''), onClick: onClick }, response.messages.map((message, i) => (react_1.default.createElement("p", { key: i }, message))))));
}
exports.renderResponse = renderResponse;
/**
 * Get an event handler that does all of the entries
 * supplied
 * @param handlers  array of handlers from other functions
 *                  (e.g., setState, update, etc.)
 * @param preventDefault  whether to call preventDefault
 * @return event handler
 */
function all(elem, handlers, preventDefault) {
    const cacheKey = ['__cache', 'all'];
    const allCached = get_1.default(elem, cacheKey) || [];
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
        if (item.args[1] !== preventDefault)
            matched = false;
        if (matched) {
            cached = item;
            break;
        }
    }
    if (cached)
        return cached.func;
    const func = function (e) {
        if (preventDefault)
            preventDefaultAndBlur(e);
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
    set_1.default(elem, cacheKey, allCached);
    return func;
}
exports.all = all;
/**
 * getNewValue (updater) function that sets the value to that
 * received in the event
 */
function fromEvent(curValue, e) {
    return getValueFromEventOrValue(e);
}
exports.fromEvent = fromEvent;
/**
 * getNewValue (updater) function that sets the value to that
 * received in the event, cast to a number
 */
function numberFromEvent(curValue, e) {
    const value = parseFloat(getValueFromEventOrValue(e));
    return isNaN(value) ? null : value;
}
exports.numberFromEvent = numberFromEvent;
/**
 * Generator of a getNewValue (updater) function that
 * sets the value to a constant specified ahead of time
 */
function constant(value) {
    return function () {
        return value;
    };
}
exports.constant = constant;
/**
 * Generator of a getNewValue (updater) function that
 * deletes a key from within an object
 */
function remove(indexToDelete) {
    return function (curValue) {
        return exports.deleteMixed(curValue, indexToDelete);
    };
}
exports.remove = remove;
/**
 * Generator of a getNewValue (updater) function that
 * adds or splices an element from an array based on
 * whether it's in the array already
 */
function toggleMembership(value) {
    return function (curValue) {
        const index = curValue.indexOf(value);
        if (index === -1) {
            return curValue.concat([value]);
        }
        else {
            return curValue.filter(val => val !== value);
        }
    };
}
exports.toggleMembership = toggleMembership;
/**
 * Generator of a getNewValue (updater) function that
 * adds or splices a value (from an event or caller)
 * from an array based on whether it's in the array
 */
function toggleMembershipFromEvent(curValue, event) {
    const value = getValueFromEventOrValue(event);
    const index = curValue.indexOf(value);
    if (index === -1) {
        return curValue.concat([value]);
    }
    else {
        return curValue.filter(val => val !== value);
    }
}
exports.toggleMembershipFromEvent = toggleMembershipFromEvent;
/**
 * getNewValue (updater) function that negates the value
 */
function negate(curValue) {
    return !curValue;
}
exports.negate = negate;
/**
 * getNewValue (updater) function that sets the value to that of the constant,
 * or if it's already the same, nulls it
 */
function toggleConstant(value) {
    return function (curValue) {
        return curValue === value ? null : value;
    };
}
exports.toggleConstant = toggleConstant;
/**
 * getNewValue (updater) function that sets the value to that from an event,
 * or if it's already the same, nulls it
 */
function setOrNull(curValue, e) {
    const value = getValueFromEventOrValue(e);
    return curValue === value ? null : value;
}
exports.setOrNull = setOrNull;
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
    const cached = get_1.default(elem, cacheKey);
    if (cached)
        return cached;
    const func = function (e) {
        if (preventDefault)
            preventDefaultAndBlur(e);
        let newPropObj = null;
        if (propIndex != null) {
            const curPropObj = exports.getMixed(elem.props, propIndex);
            if (indexInProp != null) {
                const curValue = exports.getMixed(curPropObj, indexInProp);
                const newValue = getNewValue(curValue, e);
                newPropObj = exports.setMixed(curPropObj, indexInProp, newValue);
            }
            else {
                newPropObj = getNewValue(curPropObj, e);
            }
        }
        else {
            newPropObj = getNewValue(null, e);
        }
        elem.props[propFunc](newPropObj);
        return newPropObj;
    };
    setWith_1.default(elem, cacheKey, func, Object);
    return func;
}
exports.changeProp = changeProp;
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
    const cacheKey = [
        '__cache',
        JSON.stringify(['changeState', stateIndex, preventDefault, extraCacheKey]),
    ];
    const cached = get_1.default(elem, cacheKey);
    if (cached)
        return cached;
    const func = function (e) {
        if (preventDefault)
            preventDefaultAndBlur(e);
        const curValue = exports.getMixed(elem.state, stateIndex);
        const newValue = getNewValue(curValue, e);
        const newState = exports.setMixed(elem.state, stateIndex, newValue);
        elem.setState(getChanged(elem.state, newState));
        return newState;
    };
    setWith_1.default(elem, cacheKey, func, Object);
    return func;
}
exports.changeState = changeState;
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
    const cached = get_1.default(elem, cacheKey);
    if (cached)
        return cached;
    const func = function () {
        const args = Array.prototype.slice.call(arguments);
        if (preventDefault && args[0])
            preventDefaultAndBlur(args[0]);
        const callArgs = (prefixArgs || []).concat(args);
        const func = get_1.default(elem, funcName);
        if (func) {
            return func.apply(elem, callArgs);
        }
        else {
            return null;
        }
    };
    setWith_1.default(elem, cacheKey, func, Object);
    return func;
}
exports.call = call;
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
    const cached = get_1.default(elem, cacheKey);
    if (cached)
        return cached;
    const func = function () {
        const args = Array.prototype.slice.call(arguments);
        if (preventDefault && args[0])
            preventDefaultAndBlur(args[0]);
        const callArgs = (prefixArgs || []).concat(args);
        const func = get_1.default(elem.props, funcName);
        if (func) {
            return func.apply(elem, callArgs);
        }
        else {
            return null;
        }
    };
    setWith_1.default(elem, cacheKey, func, Object);
    return func;
}
exports.callProp = callProp;
/**
 * Get a function to be used with ref={} to register a ref into
 * a variable in the current object
 * @param {Object} elem          React component (usually `this`)
 * @param {String} variableName  Name to save ref (e.g., '_elem' for this._elem)
 * @return {function} handler for ref=}}
 */
function registerRef(elem, variableName) {
    const cacheKey = ['__cache', JSON.stringify(['registerRef', variableName])];
    const cached = get_1.default(elem, cacheKey);
    if (cached)
        return cached;
    const func = function (pageElem) {
        setWith_1.default(elem, variableName, pageElem, Object);
    };
    setWith_1.default(elem, cacheKey, func, Object);
    return func;
}
exports.registerRef = registerRef;
exports.default = {
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
    setMixed: exports.setMixed,
    getMixed: exports.getMixed,
    deleteMixed: exports.deleteMixed,
    set,
    get,
    deleteDeep,
};
//# sourceMappingURL=index.js.map