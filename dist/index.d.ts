import React from 'react';
export declare function preventDefault(event: EventOrReactEvent): void;
export declare function stopPropagation(event: EventOrReactEvent): void;
/**
 * This function can handle any type gracefully, so calling functions don't
 * have to check if the input is an event. It'll do nothing if the input isn't
 * an event.
 */
export declare function preventDefaultAndBlur(eventOrAny: any): void;
/**
 * Many onChange functions either get passed an event (with the changed value
 * in e.target.value) or just the changed value; this disambiguates the two
 */
declare type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
declare type EventOrReactEvent = Event | React.SyntheticEvent | InputChangeEvent;
declare type EventOrValue = InputChangeEvent | string;
declare type Key = string | number | symbol;
/** This complex type allows us to typecheck arrays of paths up to 5 deep */
declare type TypeSafeKeys<T, T1 extends keyof T = keyof T> = T1 | TypeSafeKeysArray<T>;
declare type TypeSafeKeysArray<T, T1 extends keyof T = keyof T, T2 extends keyof T[T1] = keyof T[T1], T3 extends keyof T[T1][T2] = keyof T[T1][T2], T4 extends keyof T[T1][T2][T3] = keyof T[T1][T2][T3], T5 extends keyof T[T1][T2][T3][T4] = keyof T[T1][T2][T3][T4]> = TypeSafeKeysArray1<T, T1> | TypeSafeKeysArray2<T, T1, T2> | TypeSafeKeysArray3<T, T1, T2, T3> | TypeSafeKeysArray4<T, T1, T2, T3, T4> | TypeSafeKeysArray5Plus<T, T1, T2, T3, T4, T5>;
declare type TypeSafeKeysArray1<T, T1 extends keyof T> = [T1];
declare type TypeSafeKeysArray2<T, T1 extends keyof T, T2 extends keyof T[T1]> = [T1, T2];
declare type TypeSafeKeysArray3<T, T1 extends keyof T, T2 extends keyof T[T1], T3 extends keyof T[T1][T2]> = [T1, T2, T3];
declare type TypeSafeKeysArray4<T, T1 extends keyof T, T2 extends keyof T[T1], T3 extends keyof T[T1][T2], T4 extends keyof T[T1][T2][T3]> = [T1, T2, T3, T4];
declare type TypeSafeKeysArray5Plus<T, T1 extends keyof T, T2 extends keyof T[T1], T3 extends keyof T[T1][T2], T4 extends keyof T[T1][T2][T3], T5 extends keyof T[T1][T2][T3][T4]> = [T1, T2, T3, T4, T5, ...Key[]];
/**
 * Like TypeSafeKeys, but for `indexInProp` which excludes the prop itself.
 * Typechecks keys (including array keys) up to 5 levels deep.
 */
declare type TypeSafeIndexInProp<T, PropK extends keyof T = keyof T, T1 extends keyof T[PropK] = keyof T[PropK], T2 extends keyof T[PropK][T1] = keyof T[PropK][T1], T3 extends keyof T[PropK][T1][T2] = keyof T[PropK][T1][T2], T4 extends keyof T[PropK][T1][T2][T3] = keyof T[PropK][T1][T2][T3], T5 extends keyof T[PropK][T1][T2][T3][T4] = keyof T[PropK][T1][T2][T3][T4]> = T1 | TypeSafeIndexInPropArray1<T, PropK, T1> | TypeSafeIndexInPropArray2<T, PropK, T1, T2> | TypeSafeIndexInPropArray3<T, PropK, T1, T2, T3> | TypeSafeIndexInPropArray4<T, PropK, T1, T2, T3, T4> | TypeSafeIndexInPropArray5Plus<T, PropK, T1, T2, T3, T4, T5>;
declare type TypeSafeIndexInPropArray1<T, PropK extends keyof T, T1 extends keyof T[PropK]> = [T1];
declare type TypeSafeIndexInPropArray2<T, PropK extends keyof T, T1 extends keyof T[PropK], T2 extends keyof T[PropK][T1]> = [T1, T2];
declare type TypeSafeIndexInPropArray3<T, PropK extends keyof T, T1 extends keyof T[PropK], T2 extends keyof T[PropK][T1], T3 extends keyof T[PropK][T1][T2]> = [T1, T2, T3];
declare type TypeSafeIndexInPropArray4<T, PropK extends keyof T, T1 extends keyof T[PropK], T2 extends keyof T[PropK][T1], T3 extends keyof T[PropK][T1][T2], T4 extends keyof T[PropK][T1][T2][T3]> = [T1, T2, T3, T4];
declare type TypeSafeIndexInPropArray5Plus<T, PropK extends keyof T, T1 extends keyof T[PropK], T2 extends keyof T[PropK][T1], T3 extends keyof T[PropK][T1][T2], T4 extends keyof T[PropK][T1][T2][T3], T5 extends keyof T[PropK][T1][T2][T3][T4]> = [T1, T2, T3, T4, T5, ...Key[]];
declare type GetNewValueFunc = (curValue: unknown, event: EventOrValue) => unknown;
/**
 * Set a variable deep in a map/array while preserving immutable semantics
 * @param obj         object to set
 * @param stateIndex  path to the property to set
 * @param value       value to set to
 * @param withType    if specified, used with _setWith; currently disabled
 * @return modified root obj
 */
export declare function set<T extends Object>(obj: T, keys: TypeSafeKeys<T>, value: any, withType?: any | null): T;
/**
 * Get a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj   object to get
 * @param keys  path to the property to get
 * @return value or undefined
 */
export declare function get<T extends Object>(obj: T, keys: TypeSafeKeys<T>): any;
/**
 * Delete a variable deep in a map that's potentially partly
 * immutable and partly not
 * @param obj   object to delete in
 * @param keys  path of item to delete
 * @return updated obj (with shallow copies to preserve immutable semantics)
 */
export declare function deleteDeep<T extends Object>(obj: T, keys: TypeSafeKeys<T>): T;
export declare const setMixed: typeof set;
export declare const getMixed: typeof get;
export declare const deleteMixed: typeof deleteDeep;
/**
 * Get an event handler that will toggle the value of the given
 * state key given by path
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param preventDefault  whether to preventDefault
 */
export declare function toggle<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, preventDefault?: boolean): (e?: any) => StateT;
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
export declare function toggleProp<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp?: TypeSafeIndexInProp<PropT> | null, preventDefault?: boolean): (e?: any) => any;
/**
 * Get an event handler that will toggle the value of the given
 * state key to either the value given or null
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param value           value to set (if it's not already the current value)
 * @param preventDefault  whether to preventDefault
 */
export declare function toggleValue<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, value: any, preventDefault?: boolean): (e?: any) => StateT;
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
export declare function togglePropValue<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT> | null, value: any, preventDefault?: boolean): (e?: any) => any;
/**
 * Get an event handler that will toggle the value of the given
 * state key given by path to either the value passed (if it's
 * currently set to something else) or null
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to toggle (array or string)
 * @param preventDefault  whether to preventDefault
 */
export declare function toggleFromEvent<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, preventDefault?: boolean): (e?: any) => StateT;
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
export declare function togglePropFromEvent<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT>, value: any, preventDefault?: boolean): (e?: any) => any;
/**
 * Get an event handler that will toggle whether a value is present
 * in an array at the given state key (by adding or removing it);
 * the value is passed from the calling event
 * @param elem            React element; usually "this"
 * @param stateIndex      path (array or string) of array in state to toggle
 * @param preventDefault  whether to preventDefault
 */
export declare function toggleArrayMemberFromEvent<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, preventDefault?: boolean): (e?: any) => StateT;
/**
 * Get an event handler that will toggle whether a value is present
 * in an array at the given state key (by adding or removing it)
 * @param elem            React element; usually "this"
 * @param stateIndex      path (array or string) of array in state to toggle
 * @param value           value to toggle
 * @param preventDefault  whether to preventDefault
 */
export declare function toggleArrayMember<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, value: any, preventDefault?: boolean): (e?: any) => StateT;
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
export declare function togglePropArrayMember<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT> | null | undefined, value: any, preventDefault?: boolean): (e?: any) => any;
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
export declare function togglePropArrayMemberFromEvent<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT> | null | undefined, preventDefault?: boolean): (e?: any) => any;
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
export declare function setProp<PropT>(elem: React.Component<any>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT> | null | undefined, preventDefault?: boolean): (e?: any) => any;
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
export declare function setPropNumber<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT> | null | undefined, preventDefault?: boolean): (e?: any) => any;
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
export declare function setPropValue<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT> | null | undefined, value: any, preventDefault?: boolean): (e?: any) => any;
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
export declare function deleteProp<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT>, preventDefault?: boolean): (e?: any) => any;
/**
 * Get a function that will update a part of the current element's
 * state based on the stateIndex passed
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param preventDefault  whether to preventDefault on the event
 */
export declare function update<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, preventDefault?: boolean): (e?: any) => StateT;
/**
 * Get a function that will update a part of the current element's
 * state based on the stateIndex passed to a numeric (or null) value
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param preventDefault  whether to preventDefault on the event
 */
export declare function updateNumber<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, preventDefault?: boolean): (e?: any) => StateT;
/**
 * Get a function that will set the state for a certain element
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
export declare function setState<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, value: any, preventDefault?: boolean): (e?: any) => StateT;
/**
 * Get a function that will delete a key from within the state
 * @param elem            React element; usually "this"
 * @param stateIndex      path of variable in state to set
 * @param value           value to set the variable to
 * @param preventDefault  whether to preventDefault on the event
 */
export declare function deleteState<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, preventDefault?: boolean): (e?: any) => StateT;
/**
 * Filters a changed state variable so that we only include
 * keys that were changed
 * @param origState      original state
 * @param changedState   new state
 * @return changeState, with only the keys that are different from origState
 */
export declare function getChanged<StateT extends Object>(origState: StateT, changedState: StateT): Partial<StateT>;
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
export declare function getThen(elem: React.Component<any>, responseKey?: string, loadingKey?: string, dataKey?: string): (data: Response) => void;
/**
 * The default message handler for request from the server
 * @param elem  element to get a "then" handler for
 * @param responseKey  key in elem.state to set the response (data)
 * @param loadingKey   key in elem.state to set the loading
 * @param dataKey      key in elem.state to set the data (from data.data)
 */
export declare function getCatch(elem: React.Component<any>, responseKey?: string, loadingKey?: string): (err: Error) => void;
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
export declare function renderResponse(response: Response, options: {
    type?: 'alert' | 'text' | null;
    additionalClasses?: string | null;
    onClick?: (event: MouseEvent) => void;
    errorsOnly?: boolean | null;
}): JSX.Element | null | undefined;
/**
 * Get an event handler that does all of the entries
 * supplied
 * @param handlers  array of handlers from other functions
 *                  (e.g., setState, update, etc.)
 * @param preventDefault  whether to call preventDefault
 * @return event handler
 */
export declare function all(elem: React.Component<any>, handlers: Function[], preventDefault?: boolean): (e?: any) => void;
/**
 * getNewValue (updater) function that sets the value to that
 * received in the event
 */
export declare function fromEvent(curValue: unknown, e: EventOrValue): string;
/**
 * getNewValue (updater) function that sets the value to that
 * received in the event, cast to a number
 */
export declare function numberFromEvent(curValue: unknown, e: EventOrValue): number | null;
/**
 * Generator of a getNewValue (updater) function that
 * sets the value to a constant specified ahead of time
 */
export declare function constant<T>(value: T): () => T;
/**
 * Generator of a getNewValue (updater) function that
 * deletes a key from within an object
 */
export declare function remove<T extends Object>(indexToDelete: TypeSafeKeys<T>): (curValue: T) => T;
/**
 * Generator of a getNewValue (updater) function that
 * adds or splices an element from an array based on
 * whether it's in the array already
 */
export declare function toggleMembership(value: unknown): (curValue: unknown[]) => unknown[];
/**
 * Generator of a getNewValue (updater) function that
 * adds or splices a value (from an event or caller)
 * from an array based on whether it's in the array
 */
export declare function toggleMembershipFromEvent(curValue: unknown[], event: EventOrValue): unknown[];
/**
 * getNewValue (updater) function that negates the value
 */
export declare function negate(curValue: unknown): boolean;
/**
 * getNewValue (updater) function that sets the value to that of the constant,
 * or if it's already the same, nulls it
 */
export declare function toggleConstant<T>(value: T | null): (curValue: T | null) => T | null;
/**
 * getNewValue (updater) function that sets the value to that from an event,
 * or if it's already the same, nulls it
 */
export declare function setOrNull(curValue: any, e: EventOrValue): string | null;
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
export declare function changeProp<PropT>(elem: React.Component<PropT>, propFunc: keyof PropT, propIndex: keyof PropT, indexInProp: TypeSafeIndexInProp<PropT> | null | undefined, getNewValue: GetNewValueFunc, preventDefault?: boolean, extraCacheKey?: any): (e?: any) => any;
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
export declare function changeState<PropT, StateT>(elem: React.Component<PropT, StateT>, stateIndex: TypeSafeKeys<StateT>, getNewValue: GetNewValueFunc, preventDefault?: boolean, extraCacheKey?: any): (e?: any) => StateT;
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
export declare function call<T extends Object>(elem: T, funcName: keyof T, prefixArgs?: any[] | null, preventDefault?: boolean, extraCacheKey?: any): (...args: any[]) => any;
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
export declare function callProp<PropT>(elem: React.Component<PropT>, funcName: keyof PropT, prefixArgs?: any[] | null, preventDefault?: boolean, extraCacheKey?: any): (...args: any[]) => any;
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
export declare function registerRef<T extends Object>(elem: T, variableName: keyof T): (pageElem: any) => void;
declare const _default: {
    preventDefault: typeof preventDefault;
    stopPropagation: typeof stopPropagation;
    toggle: typeof toggle;
    toggleValue: typeof toggleValue;
    toggleFromEvent: typeof toggleFromEvent;
    toggleArrayMember: typeof toggleArrayMember;
    toggleArrayMemberFromEvent: typeof toggleArrayMemberFromEvent;
    toggleProp: typeof toggleProp;
    togglePropValue: typeof togglePropValue;
    togglePropFromEvent: typeof togglePropFromEvent;
    togglePropArrayMember: typeof togglePropArrayMember;
    togglePropArrayMemberFromEvent: typeof togglePropArrayMemberFromEvent;
    setProp: typeof setProp;
    setPropNumber: typeof setPropNumber;
    setPropValue: typeof setPropValue;
    deleteProp: typeof deleteProp;
    callProp: typeof callProp;
    call: typeof call;
    update: typeof update;
    updateNumber: typeof updateNumber;
    setState: typeof setState;
    deleteState: typeof deleteState;
    registerRef: typeof registerRef;
    getThen: typeof getThen;
    getCatch: typeof getCatch;
    renderResponse: typeof renderResponse;
    fromEvent: typeof fromEvent;
    numberFromEvent: typeof numberFromEvent;
    constant: typeof constant;
    negate: typeof negate;
    toggleConstant: typeof toggleConstant;
    all: typeof all;
    changeState: typeof changeState;
    changeProp: typeof changeProp;
    setMixed: typeof set;
    getMixed: typeof get;
    deleteMixed: typeof deleteDeep;
    set: typeof set;
    get: typeof get;
    deleteDeep: typeof deleteDeep;
};
export default _default;
