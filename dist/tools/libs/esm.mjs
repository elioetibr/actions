import { a as __toCommonJS, i as __require, n as __esmMin, o as __toESM, r as __exportAll, t as __commonJSMin } from "./rolldown-runtime.mjs";
//#region node_modules/axios/lib/helpers/bind.js
/**
* Create a bound version of a function with a specified `this` context
*
* @param {Function} fn - The function to bind
* @param {*} thisArg - The value to be passed as the `this` parameter
* @returns {Function} A new function that will call the original function with the specified `this` context
*/
function bind(fn, thisArg) {
	return function wrap() {
		return fn.apply(thisArg, arguments);
	};
}
//#endregion
//#region node_modules/axios/lib/utils.js
var { toString } = Object.prototype;
var { getPrototypeOf } = Object;
var { iterator, toStringTag } = Symbol;
var kindOf = ((cache) => (thing) => {
	const str = toString.call(thing);
	return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));
var kindOfTest = (type) => {
	type = type.toLowerCase();
	return (thing) => kindOf(thing) === type;
};
var typeOfTest = (type) => (thing) => typeof thing === type;
/**
* Determine if a value is a non-null object
*
* @param {Object} val The value to test
*
* @returns {boolean} True if value is an Array, otherwise false
*/
var { isArray } = Array;
/**
* Determine if a value is undefined
*
* @param {*} val The value to test
*
* @returns {boolean} True if the value is undefined, otherwise false
*/
var isUndefined$1 = typeOfTest("undefined");
/**
* Determine if a value is a Buffer
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a Buffer, otherwise false
*/
function isBuffer(val) {
	return val !== null && !isUndefined$1(val) && val.constructor !== null && !isUndefined$1(val.constructor) && isFunction$1(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
/**
* Determine if a value is an ArrayBuffer
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is an ArrayBuffer, otherwise false
*/
var isArrayBuffer = kindOfTest("ArrayBuffer");
/**
* Determine if a value is a view on an ArrayBuffer
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
*/
function isArrayBufferView(val) {
	let result;
	if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) result = ArrayBuffer.isView(val);
	else result = val && val.buffer && isArrayBuffer(val.buffer);
	return result;
}
/**
* Determine if a value is a String
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a String, otherwise false
*/
var isString$1 = typeOfTest("string");
/**
* Determine if a value is a Function
*
* @param {*} val The value to test
* @returns {boolean} True if value is a Function, otherwise false
*/
var isFunction$1 = typeOfTest("function");
/**
* Determine if a value is a Number
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a Number, otherwise false
*/
var isNumber$1 = typeOfTest("number");
/**
* Determine if a value is an Object
*
* @param {*} thing The value to test
*
* @returns {boolean} True if value is an Object, otherwise false
*/
var isObject$2 = (thing) => thing !== null && typeof thing === "object";
/**
* Determine if a value is a Boolean
*
* @param {*} thing The value to test
* @returns {boolean} True if value is a Boolean, otherwise false
*/
var isBoolean = (thing) => thing === true || thing === false;
/**
* Determine if a value is a plain Object
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a plain Object, otherwise false
*/
var isPlainObject$1 = (val) => {
	if (kindOf(val) !== "object") return false;
	const prototype = getPrototypeOf(val);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(toStringTag in val) && !(iterator in val);
};
/**
* Determine if a value is an empty object (safely handles Buffers)
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is an empty object, otherwise false
*/
var isEmptyObject = (val) => {
	if (!isObject$2(val) || isBuffer(val)) return false;
	try {
		return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
	} catch (e) {
		return false;
	}
};
/**
* Determine if a value is a Date
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a Date, otherwise false
*/
var isDate = kindOfTest("Date");
/**
* Determine if a value is a File
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a File, otherwise false
*/
var isFile = kindOfTest("File");
/**
* Determine if a value is a React Native Blob
* React Native "blob": an object with a `uri` attribute. Optionally, it can
* also have a `name` and `type` attribute to specify filename and content type
*
* @see https://github.com/facebook/react-native/blob/26684cf3adf4094eb6c405d345a75bf8c7c0bf88/Libraries/Network/FormData.js#L68-L71
* 
* @param {*} value The value to test
* 
* @returns {boolean} True if value is a React Native Blob, otherwise false
*/
var isReactNativeBlob = (value) => {
	return !!(value && typeof value.uri !== "undefined");
};
/**
* Determine if environment is React Native
* ReactNative `FormData` has a non-standard `getParts()` method
* 
* @param {*} formData The formData to test
* 
* @returns {boolean} True if environment is React Native, otherwise false
*/
var isReactNative = (formData) => formData && typeof formData.getParts !== "undefined";
/**
* Determine if a value is a Blob
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a Blob, otherwise false
*/
var isBlob = kindOfTest("Blob");
/**
* Determine if a value is a FileList
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a File, otherwise false
*/
var isFileList = kindOfTest("FileList");
/**
* Determine if a value is a Stream
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a Stream, otherwise false
*/
var isStream = (val) => isObject$2(val) && isFunction$1(val.pipe);
/**
* Determine if a value is a FormData
*
* @param {*} thing The value to test
*
* @returns {boolean} True if value is an FormData, otherwise false
*/
function getGlobal() {
	if (typeof globalThis !== "undefined") return globalThis;
	if (typeof self !== "undefined") return self;
	if (typeof window !== "undefined") return window;
	if (typeof global !== "undefined") return global;
	return {};
}
var G = getGlobal();
var FormDataCtor = typeof G.FormData !== "undefined" ? G.FormData : void 0;
var isFormData = (thing) => {
	let kind;
	return thing && (FormDataCtor && thing instanceof FormDataCtor || isFunction$1(thing.append) && ((kind = kindOf(thing)) === "formdata" || kind === "object" && isFunction$1(thing.toString) && thing.toString() === "[object FormData]"));
};
/**
* Determine if a value is a URLSearchParams object
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a URLSearchParams object, otherwise false
*/
var isURLSearchParams = kindOfTest("URLSearchParams");
var [isReadableStream, isRequest, isResponse, isHeaders] = [
	"ReadableStream",
	"Request",
	"Response",
	"Headers"
].map(kindOfTest);
/**
* Trim excess whitespace off the beginning and end of a string
*
* @param {String} str The String to trim
*
* @returns {String} The String freed of excess whitespace
*/
var trim = (str) => {
	return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
};
/**
* Iterate over an Array or an Object invoking a function for each item.
*
* If `obj` is an Array callback will be called passing
* the value, index, and complete array for each item.
*
* If 'obj' is an Object callback will be called passing
* the value, key, and complete object for each property.
*
* @param {Object|Array<unknown>} obj The object to iterate
* @param {Function} fn The callback to invoke for each item
*
* @param {Object} [options]
* @param {Boolean} [options.allOwnKeys = false]
* @returns {any}
*/
function forEach(obj, fn, { allOwnKeys = false } = {}) {
	if (obj === null || typeof obj === "undefined") return;
	let i;
	let l;
	if (typeof obj !== "object") obj = [obj];
	if (isArray(obj)) for (i = 0, l = obj.length; i < l; i++) fn.call(null, obj[i], i, obj);
	else {
		if (isBuffer(obj)) return;
		const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
		const len = keys.length;
		let key;
		for (i = 0; i < len; i++) {
			key = keys[i];
			fn.call(null, obj[key], key, obj);
		}
	}
}
/**
* Finds a key in an object, case-insensitive, returning the actual key name.
* Returns null if the object is a Buffer or if no match is found.
*
* @param {Object} obj - The object to search.
* @param {string} key - The key to find (case-insensitive).
* @returns {?string} The actual key name if found, otherwise null.
*/
function findKey(obj, key) {
	if (isBuffer(obj)) return null;
	key = key.toLowerCase();
	const keys = Object.keys(obj);
	let i = keys.length;
	let _key;
	while (i-- > 0) {
		_key = keys[i];
		if (key === _key.toLowerCase()) return _key;
	}
	return null;
}
var _global = (() => {
	if (typeof globalThis !== "undefined") return globalThis;
	return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
var isContextDefined = (context) => !isUndefined$1(context) && context !== _global;
/**
* Accepts varargs expecting each argument to be an object, then
* immutably merges the properties of each object and returns result.
*
* When multiple objects contain the same key the later object in
* the arguments list will take precedence.
*
* Example:
*
* ```js
* const result = merge({foo: 123}, {foo: 456});
* console.log(result.foo); // outputs 456
* ```
*
* @param {Object} obj1 Object to merge
*
* @returns {Object} Result of all merge properties
*/
function merge$1() {
	const { caseless, skipUndefined } = isContextDefined(this) && this || {};
	const result = {};
	const assignValue = (val, key) => {
		if (key === "__proto__" || key === "constructor" || key === "prototype") return;
		const targetKey = caseless && findKey(result, key) || key;
		if (isPlainObject$1(result[targetKey]) && isPlainObject$1(val)) result[targetKey] = merge$1(result[targetKey], val);
		else if (isPlainObject$1(val)) result[targetKey] = merge$1({}, val);
		else if (isArray(val)) result[targetKey] = val.slice();
		else if (!skipUndefined || !isUndefined$1(val)) result[targetKey] = val;
	};
	for (let i = 0, l = arguments.length; i < l; i++) arguments[i] && forEach(arguments[i], assignValue);
	return result;
}
/**
* Extends object a by mutably adding to it the properties of object b.
*
* @param {Object} a The object to be extended
* @param {Object} b The object to copy properties from
* @param {Object} thisArg The object to bind function to
*
* @param {Object} [options]
* @param {Boolean} [options.allOwnKeys]
* @returns {Object} The resulting value of object a
*/
var extend$1 = (a, b, thisArg, { allOwnKeys } = {}) => {
	forEach(b, (val, key) => {
		if (thisArg && isFunction$1(val)) Object.defineProperty(a, key, {
			value: bind(val, thisArg),
			writable: true,
			enumerable: true,
			configurable: true
		});
		else Object.defineProperty(a, key, {
			value: val,
			writable: true,
			enumerable: true,
			configurable: true
		});
	}, { allOwnKeys });
	return a;
};
/**
* Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
*
* @param {string} content with BOM
*
* @returns {string} content value without BOM
*/
var stripBOM = (content) => {
	if (content.charCodeAt(0) === 65279) content = content.slice(1);
	return content;
};
/**
* Inherit the prototype methods from one constructor into another
* @param {function} constructor
* @param {function} superConstructor
* @param {object} [props]
* @param {object} [descriptors]
*
* @returns {void}
*/
var inherits = (constructor, superConstructor, props, descriptors) => {
	constructor.prototype = Object.create(superConstructor.prototype, descriptors);
	Object.defineProperty(constructor.prototype, "constructor", {
		value: constructor,
		writable: true,
		enumerable: false,
		configurable: true
	});
	Object.defineProperty(constructor, "super", { value: superConstructor.prototype });
	props && Object.assign(constructor.prototype, props);
};
/**
* Resolve object with deep prototype chain to a flat object
* @param {Object} sourceObj source object
* @param {Object} [destObj]
* @param {Function|Boolean} [filter]
* @param {Function} [propFilter]
*
* @returns {Object}
*/
var toFlatObject = (sourceObj, destObj, filter, propFilter) => {
	let props;
	let i;
	let prop;
	const merged = {};
	destObj = destObj || {};
	if (sourceObj == null) return destObj;
	do {
		props = Object.getOwnPropertyNames(sourceObj);
		i = props.length;
		while (i-- > 0) {
			prop = props[i];
			if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
				destObj[prop] = sourceObj[prop];
				merged[prop] = true;
			}
		}
		sourceObj = filter !== false && getPrototypeOf(sourceObj);
	} while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
	return destObj;
};
/**
* Determines whether a string ends with the characters of a specified string
*
* @param {String} str
* @param {String} searchString
* @param {Number} [position= 0]
*
* @returns {boolean}
*/
var endsWith = (str, searchString, position) => {
	str = String(str);
	if (position === void 0 || position > str.length) position = str.length;
	position -= searchString.length;
	const lastIndex = str.indexOf(searchString, position);
	return lastIndex !== -1 && lastIndex === position;
};
/**
* Returns new array from array like object or null if failed
*
* @param {*} [thing]
*
* @returns {?Array}
*/
var toArray = (thing) => {
	if (!thing) return null;
	if (isArray(thing)) return thing;
	let i = thing.length;
	if (!isNumber$1(i)) return null;
	const arr = new Array(i);
	while (i-- > 0) arr[i] = thing[i];
	return arr;
};
/**
* Checking if the Uint8Array exists and if it does, it returns a function that checks if the
* thing passed in is an instance of Uint8Array
*
* @param {TypedArray}
*
* @returns {Array}
*/
var isTypedArray = ((TypedArray) => {
	return (thing) => {
		return TypedArray && thing instanceof TypedArray;
	};
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
/**
* For each entry in the object, call the function with the key and value.
*
* @param {Object<any, any>} obj - The object to iterate over.
* @param {Function} fn - The function to call for each entry.
*
* @returns {void}
*/
var forEachEntry = (obj, fn) => {
	const _iterator = (obj && obj[iterator]).call(obj);
	let result;
	while ((result = _iterator.next()) && !result.done) {
		const pair = result.value;
		fn.call(obj, pair[0], pair[1]);
	}
};
/**
* It takes a regular expression and a string, and returns an array of all the matches
*
* @param {string} regExp - The regular expression to match against.
* @param {string} str - The string to search.
*
* @returns {Array<boolean>}
*/
var matchAll = (regExp, str) => {
	let matches;
	const arr = [];
	while ((matches = regExp.exec(str)) !== null) arr.push(matches);
	return arr;
};
var isHTMLForm = kindOfTest("HTMLFormElement");
var toCamelCase = (str) => {
	return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
		return p1.toUpperCase() + p2;
	});
};
var hasOwnProperty = (({ hasOwnProperty }) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);
/**
* Determine if a value is a RegExp object
*
* @param {*} val The value to test
*
* @returns {boolean} True if value is a RegExp object, otherwise false
*/
var isRegExp = kindOfTest("RegExp");
var reduceDescriptors = (obj, reducer) => {
	const descriptors = Object.getOwnPropertyDescriptors(obj);
	const reducedDescriptors = {};
	forEach(descriptors, (descriptor, name) => {
		let ret;
		if ((ret = reducer(descriptor, name, obj)) !== false) reducedDescriptors[name] = ret || descriptor;
	});
	Object.defineProperties(obj, reducedDescriptors);
};
/**
* Makes all methods read-only
* @param {Object} obj
*/
var freezeMethods = (obj) => {
	reduceDescriptors(obj, (descriptor, name) => {
		if (isFunction$1(obj) && [
			"arguments",
			"caller",
			"callee"
		].indexOf(name) !== -1) return false;
		const value = obj[name];
		if (!isFunction$1(value)) return;
		descriptor.enumerable = false;
		if ("writable" in descriptor) {
			descriptor.writable = false;
			return;
		}
		if (!descriptor.set) descriptor.set = () => {
			throw Error("Can not rewrite read-only method '" + name + "'");
		};
	});
};
/**
* Converts an array or a delimited string into an object set with values as keys and true as values.
* Useful for fast membership checks.
*
* @param {Array|string} arrayOrString - The array or string to convert.
* @param {string} delimiter - The delimiter to use if input is a string.
* @returns {Object} An object with keys from the array or string, values set to true.
*/
var toObjectSet = (arrayOrString, delimiter) => {
	const obj = {};
	const define = (arr) => {
		arr.forEach((value) => {
			obj[value] = true;
		});
	};
	isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
	return obj;
};
var noop = () => {};
var toFiniteNumber = (value, defaultValue) => {
	return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
/**
* If the thing is a FormData object, return true, otherwise return false.
*
* @param {unknown} thing - The thing to check.
*
* @returns {boolean}
*/
function isSpecCompliantForm(thing) {
	return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
/**
* Recursively converts an object to a JSON-compatible object, handling circular references and Buffers.
*
* @param {Object} obj - The object to convert.
* @returns {Object} The JSON-compatible object.
*/
var toJSONObject = (obj) => {
	const stack = new Array(10);
	const visit = (source, i) => {
		if (isObject$2(source)) {
			if (stack.indexOf(source) >= 0) return;
			if (isBuffer(source)) return source;
			if (!("toJSON" in source)) {
				stack[i] = source;
				const target = isArray(source) ? [] : {};
				forEach(source, (value, key) => {
					const reducedValue = visit(value, i + 1);
					!isUndefined$1(reducedValue) && (target[key] = reducedValue);
				});
				stack[i] = void 0;
				return target;
			}
		}
		return source;
	};
	return visit(obj, 0);
};
/**
* Determines if a value is an async function.
*
* @param {*} thing - The value to test.
* @returns {boolean} True if value is an async function, otherwise false.
*/
var isAsyncFn = kindOfTest("AsyncFunction");
/**
* Determines if a value is thenable (has then and catch methods).
*
* @param {*} thing - The value to test.
* @returns {boolean} True if value is thenable, otherwise false.
*/
var isThenable = (thing) => thing && (isObject$2(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);
/**
* Provides a cross-platform setImmediate implementation.
* Uses native setImmediate if available, otherwise falls back to postMessage or setTimeout.
*
* @param {boolean} setImmediateSupported - Whether setImmediate is supported.
* @param {boolean} postMessageSupported - Whether postMessage is supported.
* @returns {Function} A function to schedule a callback asynchronously.
*/
var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
	if (setImmediateSupported) return setImmediate;
	return postMessageSupported ? ((token, callbacks) => {
		_global.addEventListener("message", ({ source, data }) => {
			if (source === _global && data === token) callbacks.length && callbacks.shift()();
		}, false);
		return (cb) => {
			callbacks.push(cb);
			_global.postMessage(token, "*");
		};
	})(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(typeof setImmediate === "function", isFunction$1(_global.postMessage));
/**
* Schedules a microtask or asynchronous callback as soon as possible.
* Uses queueMicrotask if available, otherwise falls back to process.nextTick or _setImmediate.
*
* @type {Function}
*/
var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
var isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);
var utils_default = {
	isArray,
	isArrayBuffer,
	isBuffer,
	isFormData,
	isArrayBufferView,
	isString: isString$1,
	isNumber: isNumber$1,
	isBoolean,
	isObject: isObject$2,
	isPlainObject: isPlainObject$1,
	isEmptyObject,
	isReadableStream,
	isRequest,
	isResponse,
	isHeaders,
	isUndefined: isUndefined$1,
	isDate,
	isFile,
	isReactNativeBlob,
	isReactNative,
	isBlob,
	isRegExp,
	isFunction: isFunction$1,
	isStream,
	isURLSearchParams,
	isTypedArray,
	isFileList,
	forEach,
	merge: merge$1,
	extend: extend$1,
	trim,
	stripBOM,
	inherits,
	toFlatObject,
	kindOf,
	kindOfTest,
	endsWith,
	toArray,
	forEachEntry,
	matchAll,
	isHTMLForm,
	hasOwnProperty,
	hasOwnProp: hasOwnProperty,
	reduceDescriptors,
	freezeMethods,
	toObjectSet,
	toCamelCase,
	noop,
	toFiniteNumber,
	findKey,
	global: _global,
	isContextDefined,
	isSpecCompliantForm,
	toJSONObject,
	isAsyncFn,
	isThenable,
	setImmediate: _setImmediate,
	asap,
	isIterable
};
//#endregion
//#region node_modules/axios/lib/core/AxiosError.js
var AxiosError = class AxiosError extends Error {
	static from(error, code, config, request, response, customProps) {
		const axiosError = new AxiosError(error.message, code || error.code, config, request, response);
		axiosError.cause = error;
		axiosError.name = error.name;
		if (error.status != null && axiosError.status == null) axiosError.status = error.status;
		customProps && Object.assign(axiosError, customProps);
		return axiosError;
	}
	/**
	* Create an Error with the specified message, config, error code, request and response.
	*
	* @param {string} message The error message.
	* @param {string} [code] The error code (for example, 'ECONNABORTED').
	* @param {Object} [config] The config.
	* @param {Object} [request] The request.
	* @param {Object} [response] The response.
	*
	* @returns {Error} The created error.
	*/
	constructor(message, code, config, request, response) {
		super(message);
		Object.defineProperty(this, "message", {
			value: message,
			enumerable: true,
			writable: true,
			configurable: true
		});
		this.name = "AxiosError";
		this.isAxiosError = true;
		code && (this.code = code);
		config && (this.config = config);
		request && (this.request = request);
		if (response) {
			this.response = response;
			this.status = response.status;
		}
	}
	toJSON() {
		return {
			message: this.message,
			name: this.name,
			description: this.description,
			number: this.number,
			fileName: this.fileName,
			lineNumber: this.lineNumber,
			columnNumber: this.columnNumber,
			stack: this.stack,
			config: utils_default.toJSONObject(this.config),
			code: this.code,
			status: this.status
		};
	}
};
AxiosError.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
AxiosError.ERR_BAD_OPTION = "ERR_BAD_OPTION";
AxiosError.ECONNABORTED = "ECONNABORTED";
AxiosError.ETIMEDOUT = "ETIMEDOUT";
AxiosError.ERR_NETWORK = "ERR_NETWORK";
AxiosError.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
AxiosError.ERR_DEPRECATED = "ERR_DEPRECATED";
AxiosError.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
AxiosError.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
AxiosError.ERR_CANCELED = "ERR_CANCELED";
AxiosError.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
AxiosError.ERR_INVALID_URL = "ERR_INVALID_URL";
//#endregion
//#region node_modules/axios/lib/helpers/toFormData.js
/**
* Determines if the given thing is a array or js object.
*
* @param {string} thing - The object or array to be visited.
*
* @returns {boolean}
*/
function isVisitable(thing) {
	return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
/**
* It removes the brackets from the end of a string
*
* @param {string} key - The key of the parameter.
*
* @returns {string} the key without the brackets.
*/
function removeBrackets(key) {
	return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
/**
* It takes a path, a key, and a boolean, and returns a string
*
* @param {string} path - The path to the current key.
* @param {string} key - The key of the current object being iterated over.
* @param {string} dots - If true, the key will be rendered with dots instead of brackets.
*
* @returns {string} The path to the current key.
*/
function renderKey(path, key, dots) {
	if (!path) return key;
	return path.concat(key).map(function each(token, i) {
		token = removeBrackets(token);
		return !dots && i ? "[" + token + "]" : token;
	}).join(dots ? "." : "");
}
/**
* If the array is an array and none of its elements are visitable, then it's a flat array.
*
* @param {Array<any>} arr - The array to check
*
* @returns {boolean}
*/
function isFlatArray(arr) {
	return utils_default.isArray(arr) && !arr.some(isVisitable);
}
var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
	return /^is[A-Z]/.test(prop);
});
/**
* Convert a data object to FormData
*
* @param {Object} obj
* @param {?Object} [formData]
* @param {?Object} [options]
* @param {Function} [options.visitor]
* @param {Boolean} [options.metaTokens = true]
* @param {Boolean} [options.dots = false]
* @param {?Boolean} [options.indexes = false]
*
* @returns {Object}
**/
/**
* It converts an object into a FormData object
*
* @param {Object<any, any>} obj - The object to convert to form data.
* @param {string} formData - The FormData object to append to.
* @param {Object<string, any>} options
*
* @returns
*/
function toFormData(obj, formData, options) {
	if (!utils_default.isObject(obj)) throw new TypeError("target must be an object");
	formData = formData || new FormData();
	options = utils_default.toFlatObject(options, {
		metaTokens: true,
		dots: false,
		indexes: false
	}, false, function defined(option, source) {
		return !utils_default.isUndefined(source[option]);
	});
	const metaTokens = options.metaTokens;
	const visitor = options.visitor || defaultVisitor;
	const dots = options.dots;
	const indexes = options.indexes;
	const useBlob = (options.Blob || typeof Blob !== "undefined" && Blob) && utils_default.isSpecCompliantForm(formData);
	if (!utils_default.isFunction(visitor)) throw new TypeError("visitor must be a function");
	function convertValue(value) {
		if (value === null) return "";
		if (utils_default.isDate(value)) return value.toISOString();
		if (utils_default.isBoolean(value)) return value.toString();
		if (!useBlob && utils_default.isBlob(value)) throw new AxiosError("Blob is not supported. Use a Buffer instead.");
		if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
		return value;
	}
	/**
	* Default visitor.
	*
	* @param {*} value
	* @param {String|Number} key
	* @param {Array<String|Number>} path
	* @this {FormData}
	*
	* @returns {boolean} return true to visit the each prop of the value recursively
	*/
	function defaultVisitor(value, key, path) {
		let arr = value;
		if (utils_default.isReactNative(formData) && utils_default.isReactNativeBlob(value)) {
			formData.append(renderKey(path, key, dots), convertValue(value));
			return false;
		}
		if (value && !path && typeof value === "object") {
			if (utils_default.endsWith(key, "{}")) {
				key = metaTokens ? key : key.slice(0, -2);
				value = JSON.stringify(value);
			} else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
				key = removeBrackets(key);
				arr.forEach(function each(el, index) {
					!(utils_default.isUndefined(el) || el === null) && formData.append(indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]", convertValue(el));
				});
				return false;
			}
		}
		if (isVisitable(value)) return true;
		formData.append(renderKey(path, key, dots), convertValue(value));
		return false;
	}
	const stack = [];
	const exposedHelpers = Object.assign(predicates, {
		defaultVisitor,
		convertValue,
		isVisitable
	});
	function build(value, path) {
		if (utils_default.isUndefined(value)) return;
		if (stack.indexOf(value) !== -1) throw Error("Circular reference detected in " + path.join("."));
		stack.push(value);
		utils_default.forEach(value, function each(el, key) {
			if ((!(utils_default.isUndefined(el) || el === null) && visitor.call(formData, el, utils_default.isString(key) ? key.trim() : key, path, exposedHelpers)) === true) build(el, path ? path.concat(key) : [key]);
		});
		stack.pop();
	}
	if (!utils_default.isObject(obj)) throw new TypeError("data must be an object");
	build(obj);
	return formData;
}
//#endregion
//#region node_modules/axios/lib/helpers/AxiosURLSearchParams.js
/**
* It encodes a string by replacing all characters that are not in the unreserved set with
* their percent-encoded equivalents
*
* @param {string} str - The string to encode.
*
* @returns {string} The encoded string.
*/
function encode$3(str) {
	const charMap = {
		"!": "%21",
		"'": "%27",
		"(": "%28",
		")": "%29",
		"~": "%7E",
		"%20": "+",
		"%00": "\0"
	};
	return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
		return charMap[match];
	});
}
/**
* It takes a params object and converts it to a FormData object
*
* @param {Object<string, any>} params - The parameters to be converted to a FormData object.
* @param {Object<string, any>} options - The options object passed to the Axios constructor.
*
* @returns {void}
*/
function AxiosURLSearchParams(params, options) {
	this._pairs = [];
	params && toFormData(params, this, options);
}
var prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
	this._pairs.push([name, value]);
};
prototype.toString = function toString(encoder) {
	const _encode = encoder ? function(value) {
		return encoder.call(this, value, encode$3);
	} : encode$3;
	return this._pairs.map(function each(pair) {
		return _encode(pair[0]) + "=" + _encode(pair[1]);
	}, "").join("&");
};
//#endregion
//#region node_modules/axios/lib/helpers/buildURL.js
/**
* It replaces URL-encoded forms of `:`, `$`, `,`, and spaces with
* their plain counterparts (`:`, `$`, `,`, `+`).
*
* @param {string} val The value to be encoded.
*
* @returns {string} The encoded value.
*/
function encode$2(val) {
	return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
/**
* Build a URL by appending params to the end
*
* @param {string} url The base of the url (e.g., http://www.google.com)
* @param {object} [params] The params to be appended
* @param {?(object|Function)} options
*
* @returns {string} The formatted url
*/
function buildURL(url, params, options) {
	if (!params) return url;
	const _encode = options && options.encode || encode$2;
	const _options = utils_default.isFunction(options) ? { serialize: options } : options;
	const serializeFn = _options && _options.serialize;
	let serializedParams;
	if (serializeFn) serializedParams = serializeFn(params, _options);
	else serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, _options).toString(_encode);
	if (serializedParams) {
		const hashmarkIndex = url.indexOf("#");
		if (hashmarkIndex !== -1) url = url.slice(0, hashmarkIndex);
		url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
	}
	return url;
}
//#endregion
//#region node_modules/axios/lib/core/InterceptorManager.js
var InterceptorManager = class {
	constructor() {
		this.handlers = [];
	}
	/**
	* Add a new interceptor to the stack
	*
	* @param {Function} fulfilled The function to handle `then` for a `Promise`
	* @param {Function} rejected The function to handle `reject` for a `Promise`
	* @param {Object} options The options for the interceptor, synchronous and runWhen
	*
	* @return {Number} An ID used to remove interceptor later
	*/
	use(fulfilled, rejected, options) {
		this.handlers.push({
			fulfilled,
			rejected,
			synchronous: options ? options.synchronous : false,
			runWhen: options ? options.runWhen : null
		});
		return this.handlers.length - 1;
	}
	/**
	* Remove an interceptor from the stack
	*
	* @param {Number} id The ID that was returned by `use`
	*
	* @returns {void}
	*/
	eject(id) {
		if (this.handlers[id]) this.handlers[id] = null;
	}
	/**
	* Clear all interceptors from the stack
	*
	* @returns {void}
	*/
	clear() {
		if (this.handlers) this.handlers = [];
	}
	/**
	* Iterate over all the registered interceptors
	*
	* This method is particularly useful for skipping over any
	* interceptors that may have become `null` calling `eject`.
	*
	* @param {Function} fn The function to call for each interceptor
	*
	* @returns {void}
	*/
	forEach(fn) {
		utils_default.forEach(this.handlers, function forEachHandler(h) {
			if (h !== null) fn(h);
		});
	}
};
//#endregion
//#region node_modules/axios/lib/defaults/transitional.js
var transitional_default = {
	silentJSONParsing: true,
	forcedJSONParsing: true,
	clarifyTimeoutError: false,
	legacyInterceptorReqResOrdering: true
};
//#endregion
//#region node_modules/axios/lib/platform/browser/index.js
var browser_default = {
	isBrowser: true,
	classes: {
		URLSearchParams: typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams,
		FormData: typeof FormData !== "undefined" ? FormData : null,
		Blob: typeof Blob !== "undefined" ? Blob : null
	},
	protocols: [
		"http",
		"https",
		"file",
		"blob",
		"url",
		"data"
	]
};
//#endregion
//#region node_modules/axios/lib/platform/common/utils.js
var utils_exports = /* @__PURE__ */ __exportAll({
	hasBrowserEnv: () => hasBrowserEnv,
	hasStandardBrowserEnv: () => hasStandardBrowserEnv,
	hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
	navigator: () => _navigator,
	origin: () => origin
});
var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
var _navigator = typeof navigator === "object" && navigator || void 0;
/**
* Determine if we're running in a standard browser environment
*
* This allows axios to run in a web worker, and react-native.
* Both environments support XMLHttpRequest, but not fully standard globals.
*
* web workers:
*  typeof window -> undefined
*  typeof document -> undefined
*
* react-native:
*  navigator.product -> 'ReactNative'
* nativescript
*  navigator.product -> 'NativeScript' or 'NS'
*
* @returns {boolean}
*/
var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || [
	"ReactNative",
	"NativeScript",
	"NS"
].indexOf(_navigator.product) < 0);
/**
* Determine if we're running in a standard browser webWorker environment
*
* Although the `isStandardBrowserEnv` method indicates that
* `allows axios to run in a web worker`, the WebWorker will still be
* filtered out due to its judgment standard
* `typeof window !== 'undefined' && typeof document !== 'undefined'`.
* This leads to a problem when axios post `FormData` in webWorker
*/
var hasStandardBrowserWebWorkerEnv = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
var origin = hasBrowserEnv && window.location.href || "http://localhost";
//#endregion
//#region node_modules/axios/lib/platform/index.js
var platform_default = {
	...utils_exports,
	...browser_default
};
//#endregion
//#region node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
	return toFormData(data, new platform_default.classes.URLSearchParams(), {
		visitor: function(value, key, path, helpers) {
			if (platform_default.isNode && utils_default.isBuffer(value)) {
				this.append(key, value.toString("base64"));
				return false;
			}
			return helpers.defaultVisitor.apply(this, arguments);
		},
		...options
	});
}
//#endregion
//#region node_modules/axios/lib/helpers/formDataToJSON.js
/**
* It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
*
* @param {string} name - The name of the property to get.
*
* @returns An array of strings.
*/
function parsePropPath(name) {
	return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
		return match[0] === "[]" ? "" : match[1] || match[0];
	});
}
/**
* Convert an array to an object.
*
* @param {Array<any>} arr - The array to convert to an object.
*
* @returns An object with the same keys and values as the array.
*/
function arrayToObject(arr) {
	const obj = {};
	const keys = Object.keys(arr);
	let i;
	const len = keys.length;
	let key;
	for (i = 0; i < len; i++) {
		key = keys[i];
		obj[key] = arr[key];
	}
	return obj;
}
/**
* It takes a FormData object and returns a JavaScript object
*
* @param {string} formData The FormData object to convert to JSON.
*
* @returns {Object<string, any> | null} The converted object.
*/
function formDataToJSON(formData) {
	function buildPath(path, value, target, index) {
		let name = path[index++];
		if (name === "__proto__") return true;
		const isNumericKey = Number.isFinite(+name);
		const isLast = index >= path.length;
		name = !name && utils_default.isArray(target) ? target.length : name;
		if (isLast) {
			if (utils_default.hasOwnProp(target, name)) target[name] = [target[name], value];
			else target[name] = value;
			return !isNumericKey;
		}
		if (!target[name] || !utils_default.isObject(target[name])) target[name] = [];
		if (buildPath(path, value, target[name], index) && utils_default.isArray(target[name])) target[name] = arrayToObject(target[name]);
		return !isNumericKey;
	}
	if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
		const obj = {};
		utils_default.forEachEntry(formData, (name, value) => {
			buildPath(parsePropPath(name), value, obj, 0);
		});
		return obj;
	}
	return null;
}
//#endregion
//#region node_modules/axios/lib/defaults/index.js
/**
* It takes a string, tries to parse it, and if it fails, it returns the stringified version
* of the input
*
* @param {any} rawValue - The value to be stringified.
* @param {Function} parser - A function that parses a string into a JavaScript object.
* @param {Function} encoder - A function that takes a value and returns a string.
*
* @returns {string} A stringified version of the rawValue.
*/
function stringifySafely(rawValue, parser, encoder) {
	if (utils_default.isString(rawValue)) try {
		(parser || JSON.parse)(rawValue);
		return utils_default.trim(rawValue);
	} catch (e) {
		if (e.name !== "SyntaxError") throw e;
	}
	return (encoder || JSON.stringify)(rawValue);
}
var defaults = {
	transitional: transitional_default,
	adapter: [
		"xhr",
		"http",
		"fetch"
	],
	transformRequest: [function transformRequest(data, headers) {
		const contentType = headers.getContentType() || "";
		const hasJSONContentType = contentType.indexOf("application/json") > -1;
		const isObjectPayload = utils_default.isObject(data);
		if (isObjectPayload && utils_default.isHTMLForm(data)) data = new FormData(data);
		if (utils_default.isFormData(data)) return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
		if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) return data;
		if (utils_default.isArrayBufferView(data)) return data.buffer;
		if (utils_default.isURLSearchParams(data)) {
			headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
			return data.toString();
		}
		let isFileList;
		if (isObjectPayload) {
			if (contentType.indexOf("application/x-www-form-urlencoded") > -1) return toURLEncodedForm(data, this.formSerializer).toString();
			if ((isFileList = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
				const _FormData = this.env && this.env.FormData;
				return toFormData(isFileList ? { "files[]": data } : data, _FormData && new _FormData(), this.formSerializer);
			}
		}
		if (isObjectPayload || hasJSONContentType) {
			headers.setContentType("application/json", false);
			return stringifySafely(data);
		}
		return data;
	}],
	transformResponse: [function transformResponse(data) {
		const transitional = this.transitional || defaults.transitional;
		const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
		const JSONRequested = this.responseType === "json";
		if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) return data;
		if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
			const strictJSONParsing = !(transitional && transitional.silentJSONParsing) && JSONRequested;
			try {
				return JSON.parse(data, this.parseReviver);
			} catch (e) {
				if (strictJSONParsing) {
					if (e.name === "SyntaxError") throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
					throw e;
				}
			}
		}
		return data;
	}],
	/**
	* A timeout in milliseconds to abort a request. If set to 0 (default) a
	* timeout is not created.
	*/
	timeout: 0,
	xsrfCookieName: "XSRF-TOKEN",
	xsrfHeaderName: "X-XSRF-TOKEN",
	maxContentLength: -1,
	maxBodyLength: -1,
	env: {
		FormData: platform_default.classes.FormData,
		Blob: platform_default.classes.Blob
	},
	validateStatus: function validateStatus(status) {
		return status >= 200 && status < 300;
	},
	headers: { common: {
		Accept: "application/json, text/plain, */*",
		"Content-Type": void 0
	} }
};
utils_default.forEach([
	"delete",
	"get",
	"head",
	"post",
	"put",
	"patch"
], (method) => {
	defaults.headers[method] = {};
});
//#endregion
//#region node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf = utils_default.toObjectSet([
	"age",
	"authorization",
	"content-length",
	"content-type",
	"etag",
	"expires",
	"from",
	"host",
	"if-modified-since",
	"if-unmodified-since",
	"last-modified",
	"location",
	"max-forwards",
	"proxy-authorization",
	"referer",
	"retry-after",
	"user-agent"
]);
/**
* Parse headers into an object
*
* ```
* Date: Wed, 27 Aug 2014 08:58:49 GMT
* Content-Type: application/json
* Connection: keep-alive
* Transfer-Encoding: chunked
* ```
*
* @param {String} rawHeaders Headers needing to be parsed
*
* @returns {Object} Headers parsed into an object
*/
var parseHeaders_default = (rawHeaders) => {
	const parsed = {};
	let key;
	let val;
	let i;
	rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
		i = line.indexOf(":");
		key = line.substring(0, i).trim().toLowerCase();
		val = line.substring(i + 1).trim();
		if (!key || parsed[key] && ignoreDuplicateOf[key]) return;
		if (key === "set-cookie") if (parsed[key]) parsed[key].push(val);
		else parsed[key] = [val];
		else parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
	});
	return parsed;
};
//#endregion
//#region node_modules/axios/lib/core/AxiosHeaders.js
var $internals = Symbol("internals");
function normalizeHeader(header) {
	return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
	if (value === false || value == null) return value;
	return utils_default.isArray(value) ? value.map(normalizeValue) : String(value).replace(/[\r\n]+$/, "");
}
function parseTokens(str) {
	const tokens = Object.create(null);
	const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
	let match;
	while (match = tokensRE.exec(str)) tokens[match[1]] = match[2];
	return tokens;
}
var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
	if (utils_default.isFunction(filter)) return filter.call(this, value, header);
	if (isHeaderNameFilter) value = header;
	if (!utils_default.isString(value)) return;
	if (utils_default.isString(filter)) return value.indexOf(filter) !== -1;
	if (utils_default.isRegExp(filter)) return filter.test(value);
}
function formatHeader(header) {
	return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
		return char.toUpperCase() + str;
	});
}
function buildAccessors(obj, header) {
	const accessorName = utils_default.toCamelCase(" " + header);
	[
		"get",
		"set",
		"has"
	].forEach((methodName) => {
		Object.defineProperty(obj, methodName + accessorName, {
			value: function(arg1, arg2, arg3) {
				return this[methodName].call(this, header, arg1, arg2, arg3);
			},
			configurable: true
		});
	});
}
var AxiosHeaders = class {
	constructor(headers) {
		headers && this.set(headers);
	}
	set(header, valueOrRewrite, rewrite) {
		const self = this;
		function setHeader(_value, _header, _rewrite) {
			const lHeader = normalizeHeader(_header);
			if (!lHeader) throw new Error("header name must be a non-empty string");
			const key = utils_default.findKey(self, lHeader);
			if (!key || self[key] === void 0 || _rewrite === true || _rewrite === void 0 && self[key] !== false) self[key || _header] = normalizeValue(_value);
		}
		const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
		if (utils_default.isPlainObject(header) || header instanceof this.constructor) setHeaders(header, valueOrRewrite);
		else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) setHeaders(parseHeaders_default(header), valueOrRewrite);
		else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
			let obj = {}, dest, key;
			for (const entry of header) {
				if (!utils_default.isArray(entry)) throw TypeError("Object iterator must return a key-value pair");
				obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
			}
			setHeaders(obj, valueOrRewrite);
		} else header != null && setHeader(valueOrRewrite, header, rewrite);
		return this;
	}
	get(header, parser) {
		header = normalizeHeader(header);
		if (header) {
			const key = utils_default.findKey(this, header);
			if (key) {
				const value = this[key];
				if (!parser) return value;
				if (parser === true) return parseTokens(value);
				if (utils_default.isFunction(parser)) return parser.call(this, value, key);
				if (utils_default.isRegExp(parser)) return parser.exec(value);
				throw new TypeError("parser must be boolean|regexp|function");
			}
		}
	}
	has(header, matcher) {
		header = normalizeHeader(header);
		if (header) {
			const key = utils_default.findKey(this, header);
			return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
		}
		return false;
	}
	delete(header, matcher) {
		const self = this;
		let deleted = false;
		function deleteHeader(_header) {
			_header = normalizeHeader(_header);
			if (_header) {
				const key = utils_default.findKey(self, _header);
				if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
					delete self[key];
					deleted = true;
				}
			}
		}
		if (utils_default.isArray(header)) header.forEach(deleteHeader);
		else deleteHeader(header);
		return deleted;
	}
	clear(matcher) {
		const keys = Object.keys(this);
		let i = keys.length;
		let deleted = false;
		while (i--) {
			const key = keys[i];
			if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
				delete this[key];
				deleted = true;
			}
		}
		return deleted;
	}
	normalize(format) {
		const self = this;
		const headers = {};
		utils_default.forEach(this, (value, header) => {
			const key = utils_default.findKey(headers, header);
			if (key) {
				self[key] = normalizeValue(value);
				delete self[header];
				return;
			}
			const normalized = format ? formatHeader(header) : String(header).trim();
			if (normalized !== header) delete self[header];
			self[normalized] = normalizeValue(value);
			headers[normalized] = true;
		});
		return this;
	}
	concat(...targets) {
		return this.constructor.concat(this, ...targets);
	}
	toJSON(asStrings) {
		const obj = Object.create(null);
		utils_default.forEach(this, (value, header) => {
			value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
		});
		return obj;
	}
	[Symbol.iterator]() {
		return Object.entries(this.toJSON())[Symbol.iterator]();
	}
	toString() {
		return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
	}
	getSetCookie() {
		return this.get("set-cookie") || [];
	}
	get [Symbol.toStringTag]() {
		return "AxiosHeaders";
	}
	static from(thing) {
		return thing instanceof this ? thing : new this(thing);
	}
	static concat(first, ...targets) {
		const computed = new this(first);
		targets.forEach((target) => computed.set(target));
		return computed;
	}
	static accessor(header) {
		const accessors = (this[$internals] = this[$internals] = { accessors: {} }).accessors;
		const prototype = this.prototype;
		function defineAccessor(_header) {
			const lHeader = normalizeHeader(_header);
			if (!accessors[lHeader]) {
				buildAccessors(prototype, _header);
				accessors[lHeader] = true;
			}
		}
		utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
		return this;
	}
};
AxiosHeaders.accessor([
	"Content-Type",
	"Content-Length",
	"Accept",
	"Accept-Encoding",
	"User-Agent",
	"Authorization"
]);
utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
	let mapped = key[0].toUpperCase() + key.slice(1);
	return {
		get: () => value,
		set(headerValue) {
			this[mapped] = headerValue;
		}
	};
});
utils_default.freezeMethods(AxiosHeaders);
//#endregion
//#region node_modules/axios/lib/core/transformData.js
/**
* Transform the data for a request or a response
*
* @param {Array|Function} fns A single function or Array of functions
* @param {?Object} response The response object
*
* @returns {*} The resulting transformed data
*/
function transformData(fns, response) {
	const config = this || defaults;
	const context = response || config;
	const headers = AxiosHeaders.from(context.headers);
	let data = context.data;
	utils_default.forEach(fns, function transform(fn) {
		data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
	});
	headers.normalize();
	return data;
}
//#endregion
//#region node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
	return !!(value && value.__CANCEL__);
}
//#endregion
//#region node_modules/axios/lib/cancel/CanceledError.js
var CanceledError = class extends AxiosError {
	/**
	* A `CanceledError` is an object that is thrown when an operation is canceled.
	*
	* @param {string=} message The message.
	* @param {Object=} config The config.
	* @param {Object=} request The request.
	*
	* @returns {CanceledError} The created error.
	*/
	constructor(message, config, request) {
		super(message == null ? "canceled" : message, AxiosError.ERR_CANCELED, config, request);
		this.name = "CanceledError";
		this.__CANCEL__ = true;
	}
};
//#endregion
//#region node_modules/axios/lib/core/settle.js
/**
* Resolve or reject a Promise based on response status.
*
* @param {Function} resolve A function that resolves the promise.
* @param {Function} reject A function that rejects the promise.
* @param {object} response The response.
*
* @returns {object} The response.
*/
function settle(resolve, reject, response) {
	const validateStatus = response.config.validateStatus;
	if (!response.status || !validateStatus || validateStatus(response.status)) resolve(response);
	else reject(new AxiosError("Request failed with status code " + response.status, [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4], response.config, response.request, response));
}
//#endregion
//#region node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url) {
	const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
	return match && match[1] || "";
}
//#endregion
//#region node_modules/axios/lib/helpers/speedometer.js
/**
* Calculate data maxRate
* @param {Number} [samplesCount= 10]
* @param {Number} [min= 1000]
* @returns {Function}
*/
function speedometer(samplesCount, min) {
	samplesCount = samplesCount || 10;
	const bytes = new Array(samplesCount);
	const timestamps = new Array(samplesCount);
	let head = 0;
	let tail = 0;
	let firstSampleTS;
	min = min !== void 0 ? min : 1e3;
	return function push(chunkLength) {
		const now = Date.now();
		const startedAt = timestamps[tail];
		if (!firstSampleTS) firstSampleTS = now;
		bytes[head] = chunkLength;
		timestamps[head] = now;
		let i = tail;
		let bytesCount = 0;
		while (i !== head) {
			bytesCount += bytes[i++];
			i = i % samplesCount;
		}
		head = (head + 1) % samplesCount;
		if (head === tail) tail = (tail + 1) % samplesCount;
		if (now - firstSampleTS < min) return;
		const passed = startedAt && now - startedAt;
		return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
	};
}
//#endregion
//#region node_modules/axios/lib/helpers/throttle.js
/**
* Throttle decorator
* @param {Function} fn
* @param {Number} freq
* @return {Function}
*/
function throttle(fn, freq) {
	let timestamp = 0;
	let threshold = 1e3 / freq;
	let lastArgs;
	let timer;
	const invoke = (args, now = Date.now()) => {
		timestamp = now;
		lastArgs = null;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		fn(...args);
	};
	const throttled = (...args) => {
		const now = Date.now();
		const passed = now - timestamp;
		if (passed >= threshold) invoke(args, now);
		else {
			lastArgs = args;
			if (!timer) timer = setTimeout(() => {
				timer = null;
				invoke(lastArgs);
			}, threshold - passed);
		}
	};
	const flush = () => lastArgs && invoke(lastArgs);
	return [throttled, flush];
}
//#endregion
//#region node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
	let bytesNotified = 0;
	const _speedometer = speedometer(50, 250);
	return throttle((e) => {
		const loaded = e.loaded;
		const total = e.lengthComputable ? e.total : void 0;
		const progressBytes = loaded - bytesNotified;
		const rate = _speedometer(progressBytes);
		const inRange = loaded <= total;
		bytesNotified = loaded;
		listener({
			loaded,
			total,
			progress: total ? loaded / total : void 0,
			bytes: progressBytes,
			rate: rate ? rate : void 0,
			estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
			event: e,
			lengthComputable: total != null,
			[isDownloadStream ? "download" : "upload"]: true
		});
	}, freq);
};
var progressEventDecorator = (total, throttled) => {
	const lengthComputable = total != null;
	return [(loaded) => throttled[0]({
		lengthComputable,
		total,
		loaded
	}), throttled[1]];
};
var asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));
//#endregion
//#region node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? ((origin, isMSIE) => (url) => {
	url = new URL(url, platform_default.origin);
	return origin.protocol === url.protocol && origin.host === url.host && (isMSIE || origin.port === url.port);
})(new URL(platform_default.origin), platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)) : () => true;
//#endregion
//#region node_modules/axios/lib/helpers/cookies.js
var cookies_default = platform_default.hasStandardBrowserEnv ? {
	write(name, value, expires, path, domain, secure, sameSite) {
		if (typeof document === "undefined") return;
		const cookie = [`${name}=${encodeURIComponent(value)}`];
		if (utils_default.isNumber(expires)) cookie.push(`expires=${new Date(expires).toUTCString()}`);
		if (utils_default.isString(path)) cookie.push(`path=${path}`);
		if (utils_default.isString(domain)) cookie.push(`domain=${domain}`);
		if (secure === true) cookie.push("secure");
		if (utils_default.isString(sameSite)) cookie.push(`SameSite=${sameSite}`);
		document.cookie = cookie.join("; ");
	},
	read(name) {
		if (typeof document === "undefined") return null;
		const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
		return match ? decodeURIComponent(match[1]) : null;
	},
	remove(name) {
		this.write(name, "", Date.now() - 864e5, "/");
	}
} : {
	write() {},
	read() {
		return null;
	},
	remove() {}
};
//#endregion
//#region node_modules/axios/lib/helpers/isAbsoluteURL.js
/**
* Determines whether the specified URL is absolute
*
* @param {string} url The URL to test
*
* @returns {boolean} True if the specified URL is absolute, otherwise false
*/
function isAbsoluteURL(url) {
	if (typeof url !== "string") return false;
	return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
//#endregion
//#region node_modules/axios/lib/helpers/combineURLs.js
/**
* Creates a new URL by combining the specified URLs
*
* @param {string} baseURL The base URL
* @param {string} relativeURL The relative URL
*
* @returns {string} The combined URL
*/
function combineURLs(baseURL, relativeURL) {
	return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
//#endregion
//#region node_modules/axios/lib/core/buildFullPath.js
/**
* Creates a new URL by combining the baseURL with the requestedURL,
* only when the requestedURL is not already an absolute URL.
* If the requestURL is absolute, this function returns the requestedURL untouched.
*
* @param {string} baseURL The base URL
* @param {string} requestedURL Absolute or relative URL to combine
*
* @returns {string} The combined full path
*/
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
	let isRelativeUrl = !isAbsoluteURL(requestedURL);
	if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) return combineURLs(baseURL, requestedURL);
	return requestedURL;
}
//#endregion
//#region node_modules/axios/lib/core/mergeConfig.js
var headersToObject = (thing) => thing instanceof AxiosHeaders ? { ...thing } : thing;
/**
* Config-specific merge-function which creates a new config-object
* by merging two configuration objects together.
*
* @param {Object} config1
* @param {Object} config2
*
* @returns {Object} New object resulting from merging config2 to config1
*/
function mergeConfig(config1, config2) {
	config2 = config2 || {};
	const config = {};
	function getMergedValue(target, source, prop, caseless) {
		if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) return utils_default.merge.call({ caseless }, target, source);
		else if (utils_default.isPlainObject(source)) return utils_default.merge({}, source);
		else if (utils_default.isArray(source)) return source.slice();
		return source;
	}
	function mergeDeepProperties(a, b, prop, caseless) {
		if (!utils_default.isUndefined(b)) return getMergedValue(a, b, prop, caseless);
		else if (!utils_default.isUndefined(a)) return getMergedValue(void 0, a, prop, caseless);
	}
	function valueFromConfig2(a, b) {
		if (!utils_default.isUndefined(b)) return getMergedValue(void 0, b);
	}
	function defaultToConfig2(a, b) {
		if (!utils_default.isUndefined(b)) return getMergedValue(void 0, b);
		else if (!utils_default.isUndefined(a)) return getMergedValue(void 0, a);
	}
	function mergeDirectKeys(a, b, prop) {
		if (prop in config2) return getMergedValue(a, b);
		else if (prop in config1) return getMergedValue(void 0, a);
	}
	const mergeMap = {
		url: valueFromConfig2,
		method: valueFromConfig2,
		data: valueFromConfig2,
		baseURL: defaultToConfig2,
		transformRequest: defaultToConfig2,
		transformResponse: defaultToConfig2,
		paramsSerializer: defaultToConfig2,
		timeout: defaultToConfig2,
		timeoutMessage: defaultToConfig2,
		withCredentials: defaultToConfig2,
		withXSRFToken: defaultToConfig2,
		adapter: defaultToConfig2,
		responseType: defaultToConfig2,
		xsrfCookieName: defaultToConfig2,
		xsrfHeaderName: defaultToConfig2,
		onUploadProgress: defaultToConfig2,
		onDownloadProgress: defaultToConfig2,
		decompress: defaultToConfig2,
		maxContentLength: defaultToConfig2,
		maxBodyLength: defaultToConfig2,
		beforeRedirect: defaultToConfig2,
		transport: defaultToConfig2,
		httpAgent: defaultToConfig2,
		httpsAgent: defaultToConfig2,
		cancelToken: defaultToConfig2,
		socketPath: defaultToConfig2,
		responseEncoding: defaultToConfig2,
		validateStatus: mergeDirectKeys,
		headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
	};
	utils_default.forEach(Object.keys({
		...config1,
		...config2
	}), function computeConfigValue(prop) {
		if (prop === "__proto__" || prop === "constructor" || prop === "prototype") return;
		const merge = utils_default.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
		const configValue = merge(config1[prop], config2[prop], prop);
		utils_default.isUndefined(configValue) && merge !== mergeDirectKeys || (config[prop] = configValue);
	});
	return config;
}
//#endregion
//#region node_modules/axios/lib/helpers/resolveConfig.js
var resolveConfig_default = (config) => {
	const newConfig = mergeConfig({}, config);
	let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
	newConfig.headers = headers = AxiosHeaders.from(headers);
	newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
	if (auth) headers.set("Authorization", "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : "")));
	if (utils_default.isFormData(data)) {
		if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) headers.setContentType(void 0);
		else if (utils_default.isFunction(data.getHeaders)) {
			const formHeaders = data.getHeaders();
			const allowedHeaders = ["content-type", "content-length"];
			Object.entries(formHeaders).forEach(([key, val]) => {
				if (allowedHeaders.includes(key.toLowerCase())) headers.set(key, val);
			});
		}
	}
	if (platform_default.hasStandardBrowserEnv) {
		withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
		if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
			const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
			if (xsrfValue) headers.set(xsrfHeaderName, xsrfValue);
		}
	}
	return newConfig;
};
var xhr_default = typeof XMLHttpRequest !== "undefined" && function(config) {
	return new Promise(function dispatchXhrRequest(resolve, reject) {
		const _config = resolveConfig_default(config);
		let requestData = _config.data;
		const requestHeaders = AxiosHeaders.from(_config.headers).normalize();
		let { responseType, onUploadProgress, onDownloadProgress } = _config;
		let onCanceled;
		let uploadThrottled, downloadThrottled;
		let flushUpload, flushDownload;
		function done() {
			flushUpload && flushUpload();
			flushDownload && flushDownload();
			_config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
			_config.signal && _config.signal.removeEventListener("abort", onCanceled);
		}
		let request = new XMLHttpRequest();
		request.open(_config.method.toUpperCase(), _config.url, true);
		request.timeout = _config.timeout;
		function onloadend() {
			if (!request) return;
			const responseHeaders = AxiosHeaders.from("getAllResponseHeaders" in request && request.getAllResponseHeaders());
			settle(function _resolve(value) {
				resolve(value);
				done();
			}, function _reject(err) {
				reject(err);
				done();
			}, {
				data: !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response,
				status: request.status,
				statusText: request.statusText,
				headers: responseHeaders,
				config,
				request
			});
			request = null;
		}
		if ("onloadend" in request) request.onloadend = onloadend;
		else request.onreadystatechange = function handleLoad() {
			if (!request || request.readyState !== 4) return;
			if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) return;
			setTimeout(onloadend);
		};
		request.onabort = function handleAbort() {
			if (!request) return;
			reject(new AxiosError("Request aborted", AxiosError.ECONNABORTED, config, request));
			request = null;
		};
		request.onerror = function handleError(event) {
			const err = new AxiosError(event && event.message ? event.message : "Network Error", AxiosError.ERR_NETWORK, config, request);
			err.event = event || null;
			reject(err);
			request = null;
		};
		request.ontimeout = function handleTimeout() {
			let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
			const transitional = _config.transitional || transitional_default;
			if (_config.timeoutErrorMessage) timeoutErrorMessage = _config.timeoutErrorMessage;
			reject(new AxiosError(timeoutErrorMessage, transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED, config, request));
			request = null;
		};
		requestData === void 0 && requestHeaders.setContentType(null);
		if ("setRequestHeader" in request) utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
			request.setRequestHeader(key, val);
		});
		if (!utils_default.isUndefined(_config.withCredentials)) request.withCredentials = !!_config.withCredentials;
		if (responseType && responseType !== "json") request.responseType = _config.responseType;
		if (onDownloadProgress) {
			[downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
			request.addEventListener("progress", downloadThrottled);
		}
		if (onUploadProgress && request.upload) {
			[uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
			request.upload.addEventListener("progress", uploadThrottled);
			request.upload.addEventListener("loadend", flushUpload);
		}
		if (_config.cancelToken || _config.signal) {
			onCanceled = (cancel) => {
				if (!request) return;
				reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
				request.abort();
				request = null;
			};
			_config.cancelToken && _config.cancelToken.subscribe(onCanceled);
			if (_config.signal) _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
		}
		const protocol = parseProtocol(_config.url);
		if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
			reject(new AxiosError("Unsupported protocol " + protocol + ":", AxiosError.ERR_BAD_REQUEST, config));
			return;
		}
		request.send(requestData || null);
	});
};
//#endregion
//#region node_modules/axios/lib/helpers/composeSignals.js
var composeSignals = (signals, timeout) => {
	const { length } = signals = signals ? signals.filter(Boolean) : [];
	if (timeout || length) {
		let controller = new AbortController();
		let aborted;
		const onabort = function(reason) {
			if (!aborted) {
				aborted = true;
				unsubscribe();
				const err = reason instanceof Error ? reason : this.reason;
				controller.abort(err instanceof AxiosError ? err : new CanceledError(err instanceof Error ? err.message : err));
			}
		};
		let timer = timeout && setTimeout(() => {
			timer = null;
			onabort(new AxiosError(`timeout of ${timeout}ms exceeded`, AxiosError.ETIMEDOUT));
		}, timeout);
		const unsubscribe = () => {
			if (signals) {
				timer && clearTimeout(timer);
				timer = null;
				signals.forEach((signal) => {
					signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener("abort", onabort);
				});
				signals = null;
			}
		};
		signals.forEach((signal) => signal.addEventListener("abort", onabort));
		const { signal } = controller;
		signal.unsubscribe = () => utils_default.asap(unsubscribe);
		return signal;
	}
};
//#endregion
//#region node_modules/axios/lib/helpers/trackStream.js
var streamChunk = function* (chunk, chunkSize) {
	let len = chunk.byteLength;
	if (!chunkSize || len < chunkSize) {
		yield chunk;
		return;
	}
	let pos = 0;
	let end;
	while (pos < len) {
		end = pos + chunkSize;
		yield chunk.slice(pos, end);
		pos = end;
	}
};
var readBytes = async function* (iterable, chunkSize) {
	for await (const chunk of readStream(iterable)) yield* streamChunk(chunk, chunkSize);
};
var readStream = async function* (stream) {
	if (stream[Symbol.asyncIterator]) {
		yield* stream;
		return;
	}
	const reader = stream.getReader();
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			yield value;
		}
	} finally {
		await reader.cancel();
	}
};
var trackStream = (stream, chunkSize, onProgress, onFinish) => {
	const iterator = readBytes(stream, chunkSize);
	let bytes = 0;
	let done;
	let _onFinish = (e) => {
		if (!done) {
			done = true;
			onFinish && onFinish(e);
		}
	};
	return new ReadableStream({
		async pull(controller) {
			try {
				const { done, value } = await iterator.next();
				if (done) {
					_onFinish();
					controller.close();
					return;
				}
				let len = value.byteLength;
				if (onProgress) onProgress(bytes += len);
				controller.enqueue(new Uint8Array(value));
			} catch (err) {
				_onFinish(err);
				throw err;
			}
		},
		cancel(reason) {
			_onFinish(reason);
			return iterator.return();
		}
	}, { highWaterMark: 2 });
};
//#endregion
//#region node_modules/axios/lib/adapters/fetch.js
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var { isFunction } = utils_default;
var globalFetchAPI = (({ Request, Response }) => ({
	Request,
	Response
}))(utils_default.global);
var { ReadableStream: ReadableStream$1, TextEncoder } = utils_default.global;
var test = (fn, ...args) => {
	try {
		return !!fn(...args);
	} catch (e) {
		return false;
	}
};
var factory = (env) => {
	env = utils_default.merge.call({ skipUndefined: true }, globalFetchAPI, env);
	const { fetch: envFetch, Request, Response } = env;
	const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
	const isRequestSupported = isFunction(Request);
	const isResponseSupported = isFunction(Response);
	if (!isFetchSupported) return false;
	const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
	const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
	const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
		let duplexAccessed = false;
		const body = new ReadableStream$1();
		const hasContentType = new Request(platform_default.origin, {
			body,
			method: "POST",
			get duplex() {
				duplexAccessed = true;
				return "half";
			}
		}).headers.has("Content-Type");
		body.cancel();
		return duplexAccessed && !hasContentType;
	});
	const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
	const resolvers = { stream: supportsResponseStream && ((res) => res.body) };
	isFetchSupported && [
		"text",
		"arrayBuffer",
		"blob",
		"formData",
		"stream"
	].forEach((type) => {
		!resolvers[type] && (resolvers[type] = (res, config) => {
			let method = res && res[type];
			if (method) return method.call(res);
			throw new AxiosError(`Response type '${type}' is not supported`, AxiosError.ERR_NOT_SUPPORT, config);
		});
	});
	const getBodyLength = async (body) => {
		if (body == null) return 0;
		if (utils_default.isBlob(body)) return body.size;
		if (utils_default.isSpecCompliantForm(body)) return (await new Request(platform_default.origin, {
			method: "POST",
			body
		}).arrayBuffer()).byteLength;
		if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) return body.byteLength;
		if (utils_default.isURLSearchParams(body)) body = body + "";
		if (utils_default.isString(body)) return (await encodeText(body)).byteLength;
	};
	const resolveBodyLength = async (headers, body) => {
		const length = utils_default.toFiniteNumber(headers.getContentLength());
		return length == null ? getBodyLength(body) : length;
	};
	return async (config) => {
		let { url, method, data, signal, cancelToken, timeout, onDownloadProgress, onUploadProgress, responseType, headers, withCredentials = "same-origin", fetchOptions } = resolveConfig_default(config);
		let _fetch = envFetch || fetch;
		responseType = responseType ? (responseType + "").toLowerCase() : "text";
		let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
		let request = null;
		const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
			composedSignal.unsubscribe();
		});
		let requestContentLength;
		try {
			if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
				let _request = new Request(url, {
					method: "POST",
					body: data,
					duplex: "half"
				});
				let contentTypeHeader;
				if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) headers.setContentType(contentTypeHeader);
				if (_request.body) {
					const [onProgress, flush] = progressEventDecorator(requestContentLength, progressEventReducer(asyncDecorator(onUploadProgress)));
					data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
				}
			}
			if (!utils_default.isString(withCredentials)) withCredentials = withCredentials ? "include" : "omit";
			const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
			const resolvedOptions = {
				...fetchOptions,
				signal: composedSignal,
				method: method.toUpperCase(),
				headers: headers.normalize().toJSON(),
				body: data,
				duplex: "half",
				credentials: isCredentialsSupported ? withCredentials : void 0
			};
			request = isRequestSupported && new Request(url, resolvedOptions);
			let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
			const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
			if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
				const options = {};
				[
					"status",
					"statusText",
					"headers"
				].forEach((prop) => {
					options[prop] = response[prop];
				});
				const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
				const [onProgress, flush] = onDownloadProgress && progressEventDecorator(responseContentLength, progressEventReducer(asyncDecorator(onDownloadProgress), true)) || [];
				response = new Response(trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
					flush && flush();
					unsubscribe && unsubscribe();
				}), options);
			}
			responseType = responseType || "text";
			let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
			!isStreamResponse && unsubscribe && unsubscribe();
			return await new Promise((resolve, reject) => {
				settle(resolve, reject, {
					data: responseData,
					headers: AxiosHeaders.from(response.headers),
					status: response.status,
					statusText: response.statusText,
					config,
					request
				});
			});
		} catch (err) {
			unsubscribe && unsubscribe();
			if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) throw Object.assign(new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, request, err && err.response), { cause: err.cause || err });
			throw AxiosError.from(err, err && err.code, config, request, err && err.response);
		}
	};
};
var seedCache = /* @__PURE__ */ new Map();
var getFetch = (config) => {
	let env = config && config.env || {};
	const { fetch, Request, Response } = env;
	const seeds = [
		Request,
		Response,
		fetch
	];
	let i = seeds.length, seed, target, map = seedCache;
	while (i--) {
		seed = seeds[i];
		target = map.get(seed);
		target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
		map = target;
	}
	return target;
};
getFetch();
//#endregion
//#region node_modules/axios/lib/adapters/adapters.js
/**
* Known adapters mapping.
* Provides environment-specific adapters for Axios:
* - `http` for Node.js
* - `xhr` for browsers
* - `fetch` for fetch API-based requests
*
* @type {Object<string, Function|Object>}
*/
var knownAdapters = {
	http: null,
	xhr: xhr_default,
	fetch: { get: getFetch }
};
utils_default.forEach(knownAdapters, (fn, value) => {
	if (fn) {
		try {
			Object.defineProperty(fn, "name", { value });
		} catch (e) {}
		Object.defineProperty(fn, "adapterName", { value });
	}
});
/**
* Render a rejection reason string for unknown or unsupported adapters
*
* @param {string} reason
* @returns {string}
*/
var renderReason = (reason) => `- ${reason}`;
/**
* Check if the adapter is resolved (function, null, or false)
*
* @param {Function|null|false} adapter
* @returns {boolean}
*/
var isResolvedHandle = (adapter) => utils_default.isFunction(adapter) || adapter === null || adapter === false;
/**
* Get the first suitable adapter from the provided list.
* Tries each adapter in order until a supported one is found.
* Throws an AxiosError if no adapter is suitable.
*
* @param {Array<string|Function>|string|Function} adapters - Adapter(s) by name or function.
* @param {Object} config - Axios request configuration
* @throws {AxiosError} If no suitable adapter is available
* @returns {Function} The resolved adapter function
*/
function getAdapter(adapters, config) {
	adapters = utils_default.isArray(adapters) ? adapters : [adapters];
	const { length } = adapters;
	let nameOrAdapter;
	let adapter;
	const rejectedReasons = {};
	for (let i = 0; i < length; i++) {
		nameOrAdapter = adapters[i];
		let id;
		adapter = nameOrAdapter;
		if (!isResolvedHandle(nameOrAdapter)) {
			adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
			if (adapter === void 0) throw new AxiosError(`Unknown adapter '${id}'`);
		}
		if (adapter && (utils_default.isFunction(adapter) || (adapter = adapter.get(config)))) break;
		rejectedReasons[id || "#" + i] = adapter;
	}
	if (!adapter) {
		const reasons = Object.entries(rejectedReasons).map(([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build"));
		throw new AxiosError(`There is no suitable adapter to dispatch the request ` + (length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
	}
	return adapter;
}
/**
* Exports Axios adapters and utility to resolve an adapter
*/
var adapters_default = {
	/**
	* Resolve an adapter from a list of adapter names or functions.
	* @type {Function}
	*/
	getAdapter,
	/**
	* Exposes all known adapters
	* @type {Object<string, Function|Object>}
	*/
	adapters: knownAdapters
};
//#endregion
//#region node_modules/axios/lib/core/dispatchRequest.js
/**
* Throws a `CanceledError` if cancellation has been requested.
*
* @param {Object} config The config that is to be used for the request
*
* @returns {void}
*/
function throwIfCancellationRequested(config) {
	if (config.cancelToken) config.cancelToken.throwIfRequested();
	if (config.signal && config.signal.aborted) throw new CanceledError(null, config);
}
/**
* Dispatch a request to the server using the configured adapter.
*
* @param {object} config The config that is to be used for the request
*
* @returns {Promise} The Promise to be fulfilled
*/
function dispatchRequest(config) {
	throwIfCancellationRequested(config);
	config.headers = AxiosHeaders.from(config.headers);
	config.data = transformData.call(config, config.transformRequest);
	if ([
		"post",
		"put",
		"patch"
	].indexOf(config.method) !== -1) config.headers.setContentType("application/x-www-form-urlencoded", false);
	return adapters_default.getAdapter(config.adapter || defaults.adapter, config)(config).then(function onAdapterResolution(response) {
		throwIfCancellationRequested(config);
		response.data = transformData.call(config, config.transformResponse, response);
		response.headers = AxiosHeaders.from(response.headers);
		return response;
	}, function onAdapterRejection(reason) {
		if (!isCancel(reason)) {
			throwIfCancellationRequested(config);
			if (reason && reason.response) {
				reason.response.data = transformData.call(config, config.transformResponse, reason.response);
				reason.response.headers = AxiosHeaders.from(reason.response.headers);
			}
		}
		return Promise.reject(reason);
	});
}
//#endregion
//#region node_modules/axios/lib/env/data.js
var VERSION = "1.14.0";
//#endregion
//#region node_modules/axios/lib/helpers/validator.js
var validators$1 = {};
[
	"object",
	"boolean",
	"number",
	"function",
	"string",
	"symbol"
].forEach((type, i) => {
	validators$1[type] = function validator(thing) {
		return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
	};
});
var deprecatedWarnings = {};
/**
* Transitional option validator
*
* @param {function|boolean?} validator - set to false if the transitional option has been removed
* @param {string?} version - deprecated version / removed since version
* @param {string?} message - some message with additional info
*
* @returns {function}
*/
validators$1.transitional = function transitional(validator, version, message) {
	function formatMessage(opt, desc) {
		return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
	}
	return (value, opt, opts) => {
		if (validator === false) throw new AxiosError(formatMessage(opt, " has been removed" + (version ? " in " + version : "")), AxiosError.ERR_DEPRECATED);
		if (version && !deprecatedWarnings[opt]) {
			deprecatedWarnings[opt] = true;
			console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
		}
		return validator ? validator(value, opt, opts) : true;
	};
};
validators$1.spelling = function spelling(correctSpelling) {
	return (value, opt) => {
		console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
		return true;
	};
};
/**
* Assert object's properties type
*
* @param {object} options
* @param {object} schema
* @param {boolean?} allowUnknown
*
* @returns {object}
*/
function assertOptions(options, schema, allowUnknown) {
	if (typeof options !== "object") throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
	const keys = Object.keys(options);
	let i = keys.length;
	while (i-- > 0) {
		const opt = keys[i];
		const validator = schema[opt];
		if (validator) {
			const value = options[opt];
			const result = value === void 0 || validator(value, opt, options);
			if (result !== true) throw new AxiosError("option " + opt + " must be " + result, AxiosError.ERR_BAD_OPTION_VALUE);
			continue;
		}
		if (allowUnknown !== true) throw new AxiosError("Unknown option " + opt, AxiosError.ERR_BAD_OPTION);
	}
}
var validator_default = {
	assertOptions,
	validators: validators$1
};
//#endregion
//#region node_modules/axios/lib/core/Axios.js
var validators = validator_default.validators;
/**
* Create a new instance of Axios
*
* @param {Object} instanceConfig The default config for the instance
*
* @return {Axios} A new instance of Axios
*/
var Axios = class {
	constructor(instanceConfig) {
		this.defaults = instanceConfig || {};
		this.interceptors = {
			request: new InterceptorManager(),
			response: new InterceptorManager()
		};
	}
	/**
	* Dispatch a request
	*
	* @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
	* @param {?Object} config
	*
	* @returns {Promise} The Promise to be fulfilled
	*/
	async request(configOrUrl, config) {
		try {
			return await this._request(configOrUrl, config);
		} catch (err) {
			if (err instanceof Error) {
				let dummy = {};
				Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = /* @__PURE__ */ new Error();
				const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
				try {
					if (!err.stack) err.stack = stack;
					else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) err.stack += "\n" + stack;
				} catch (e) {}
			}
			throw err;
		}
	}
	_request(configOrUrl, config) {
		if (typeof configOrUrl === "string") {
			config = config || {};
			config.url = configOrUrl;
		} else config = configOrUrl || {};
		config = mergeConfig(this.defaults, config);
		const { transitional, paramsSerializer, headers } = config;
		if (transitional !== void 0) validator_default.assertOptions(transitional, {
			silentJSONParsing: validators.transitional(validators.boolean),
			forcedJSONParsing: validators.transitional(validators.boolean),
			clarifyTimeoutError: validators.transitional(validators.boolean),
			legacyInterceptorReqResOrdering: validators.transitional(validators.boolean)
		}, false);
		if (paramsSerializer != null) if (utils_default.isFunction(paramsSerializer)) config.paramsSerializer = { serialize: paramsSerializer };
		else validator_default.assertOptions(paramsSerializer, {
			encode: validators.function,
			serialize: validators.function
		}, true);
		if (config.allowAbsoluteUrls !== void 0) {} else if (this.defaults.allowAbsoluteUrls !== void 0) config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
		else config.allowAbsoluteUrls = true;
		validator_default.assertOptions(config, {
			baseUrl: validators.spelling("baseURL"),
			withXsrfToken: validators.spelling("withXSRFToken")
		}, true);
		config.method = (config.method || this.defaults.method || "get").toLowerCase();
		let contextHeaders = headers && utils_default.merge(headers.common, headers[config.method]);
		headers && utils_default.forEach([
			"delete",
			"get",
			"head",
			"post",
			"put",
			"patch",
			"common"
		], (method) => {
			delete headers[method];
		});
		config.headers = AxiosHeaders.concat(contextHeaders, headers);
		const requestInterceptorChain = [];
		let synchronousRequestInterceptors = true;
		this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
			if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) return;
			synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
			const transitional = config.transitional || transitional_default;
			if (transitional && transitional.legacyInterceptorReqResOrdering) requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
			else requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
		});
		const responseInterceptorChain = [];
		this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
			responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
		});
		let promise;
		let i = 0;
		let len;
		if (!synchronousRequestInterceptors) {
			const chain = [dispatchRequest.bind(this), void 0];
			chain.unshift(...requestInterceptorChain);
			chain.push(...responseInterceptorChain);
			len = chain.length;
			promise = Promise.resolve(config);
			while (i < len) promise = promise.then(chain[i++], chain[i++]);
			return promise;
		}
		len = requestInterceptorChain.length;
		let newConfig = config;
		while (i < len) {
			const onFulfilled = requestInterceptorChain[i++];
			const onRejected = requestInterceptorChain[i++];
			try {
				newConfig = onFulfilled(newConfig);
			} catch (error) {
				onRejected.call(this, error);
				break;
			}
		}
		try {
			promise = dispatchRequest.call(this, newConfig);
		} catch (error) {
			return Promise.reject(error);
		}
		i = 0;
		len = responseInterceptorChain.length;
		while (i < len) promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
		return promise;
	}
	getUri(config) {
		config = mergeConfig(this.defaults, config);
		return buildURL(buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls), config.params, config.paramsSerializer);
	}
};
utils_default.forEach([
	"delete",
	"get",
	"head",
	"options"
], function forEachMethodNoData(method) {
	Axios.prototype[method] = function(url, config) {
		return this.request(mergeConfig(config || {}, {
			method,
			url,
			data: (config || {}).data
		}));
	};
});
utils_default.forEach([
	"post",
	"put",
	"patch"
], function forEachMethodWithData(method) {
	function generateHTTPMethod(isForm) {
		return function httpMethod(url, data, config) {
			return this.request(mergeConfig(config || {}, {
				method,
				headers: isForm ? { "Content-Type": "multipart/form-data" } : {},
				url,
				data
			}));
		};
	}
	Axios.prototype[method] = generateHTTPMethod();
	Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
//#endregion
//#region node_modules/axios/lib/cancel/CancelToken.js
/**
* A `CancelToken` is an object that can be used to request cancellation of an operation.
*
* @param {Function} executor The executor function.
*
* @returns {CancelToken}
*/
var CancelToken = class CancelToken {
	constructor(executor) {
		if (typeof executor !== "function") throw new TypeError("executor must be a function.");
		let resolvePromise;
		this.promise = new Promise(function promiseExecutor(resolve) {
			resolvePromise = resolve;
		});
		const token = this;
		this.promise.then((cancel) => {
			if (!token._listeners) return;
			let i = token._listeners.length;
			while (i-- > 0) token._listeners[i](cancel);
			token._listeners = null;
		});
		this.promise.then = (onfulfilled) => {
			let _resolve;
			const promise = new Promise((resolve) => {
				token.subscribe(resolve);
				_resolve = resolve;
			}).then(onfulfilled);
			promise.cancel = function reject() {
				token.unsubscribe(_resolve);
			};
			return promise;
		};
		executor(function cancel(message, config, request) {
			if (token.reason) return;
			token.reason = new CanceledError(message, config, request);
			resolvePromise(token.reason);
		});
	}
	/**
	* Throws a `CanceledError` if cancellation has been requested.
	*/
	throwIfRequested() {
		if (this.reason) throw this.reason;
	}
	/**
	* Subscribe to the cancel signal
	*/
	subscribe(listener) {
		if (this.reason) {
			listener(this.reason);
			return;
		}
		if (this._listeners) this._listeners.push(listener);
		else this._listeners = [listener];
	}
	/**
	* Unsubscribe from the cancel signal
	*/
	unsubscribe(listener) {
		if (!this._listeners) return;
		const index = this._listeners.indexOf(listener);
		if (index !== -1) this._listeners.splice(index, 1);
	}
	toAbortSignal() {
		const controller = new AbortController();
		const abort = (err) => {
			controller.abort(err);
		};
		this.subscribe(abort);
		controller.signal.unsubscribe = () => this.unsubscribe(abort);
		return controller.signal;
	}
	/**
	* Returns an object that contains a new `CancelToken` and a function that, when called,
	* cancels the `CancelToken`.
	*/
	static source() {
		let cancel;
		return {
			token: new CancelToken(function executor(c) {
				cancel = c;
			}),
			cancel
		};
	}
};
//#endregion
//#region node_modules/axios/lib/helpers/spread.js
/**
* Syntactic sugar for invoking a function and expanding an array for arguments.
*
* Common use case would be to use `Function.prototype.apply`.
*
*  ```js
*  function f(x, y, z) {}
*  const args = [1, 2, 3];
*  f.apply(null, args);
*  ```
*
* With `spread` this example can be re-written.
*
*  ```js
*  spread(function(x, y, z) {})([1, 2, 3]);
*  ```
*
* @param {Function} callback
*
* @returns {Function}
*/
function spread(callback) {
	return function wrap(arr) {
		return callback.apply(null, arr);
	};
}
//#endregion
//#region node_modules/axios/lib/helpers/isAxiosError.js
/**
* Determines whether the payload is an error thrown by Axios
*
* @param {*} payload The value to test
*
* @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
*/
function isAxiosError(payload) {
	return utils_default.isObject(payload) && payload.isAxiosError === true;
}
//#endregion
//#region node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode = {
	Continue: 100,
	SwitchingProtocols: 101,
	Processing: 102,
	EarlyHints: 103,
	Ok: 200,
	Created: 201,
	Accepted: 202,
	NonAuthoritativeInformation: 203,
	NoContent: 204,
	ResetContent: 205,
	PartialContent: 206,
	MultiStatus: 207,
	AlreadyReported: 208,
	ImUsed: 226,
	MultipleChoices: 300,
	MovedPermanently: 301,
	Found: 302,
	SeeOther: 303,
	NotModified: 304,
	UseProxy: 305,
	Unused: 306,
	TemporaryRedirect: 307,
	PermanentRedirect: 308,
	BadRequest: 400,
	Unauthorized: 401,
	PaymentRequired: 402,
	Forbidden: 403,
	NotFound: 404,
	MethodNotAllowed: 405,
	NotAcceptable: 406,
	ProxyAuthenticationRequired: 407,
	RequestTimeout: 408,
	Conflict: 409,
	Gone: 410,
	LengthRequired: 411,
	PreconditionFailed: 412,
	PayloadTooLarge: 413,
	UriTooLong: 414,
	UnsupportedMediaType: 415,
	RangeNotSatisfiable: 416,
	ExpectationFailed: 417,
	ImATeapot: 418,
	MisdirectedRequest: 421,
	UnprocessableEntity: 422,
	Locked: 423,
	FailedDependency: 424,
	TooEarly: 425,
	UpgradeRequired: 426,
	PreconditionRequired: 428,
	TooManyRequests: 429,
	RequestHeaderFieldsTooLarge: 431,
	UnavailableForLegalReasons: 451,
	InternalServerError: 500,
	NotImplemented: 501,
	BadGateway: 502,
	ServiceUnavailable: 503,
	GatewayTimeout: 504,
	HttpVersionNotSupported: 505,
	VariantAlsoNegotiates: 506,
	InsufficientStorage: 507,
	LoopDetected: 508,
	NotExtended: 510,
	NetworkAuthenticationRequired: 511,
	WebServerIsDown: 521,
	ConnectionTimedOut: 522,
	OriginIsUnreachable: 523,
	TimeoutOccurred: 524,
	SslHandshakeFailed: 525,
	InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
	HttpStatusCode[value] = key;
});
//#endregion
//#region node_modules/axios/lib/axios.js
/**
* Create an instance of Axios
*
* @param {Object} defaultConfig The default config for the instance
*
* @returns {Axios} A new instance of Axios
*/
function createInstance(defaultConfig) {
	const context = new Axios(defaultConfig);
	const instance = bind(Axios.prototype.request, context);
	utils_default.extend(instance, Axios.prototype, context, { allOwnKeys: true });
	utils_default.extend(instance, context, null, { allOwnKeys: true });
	instance.create = function create(instanceConfig) {
		return createInstance(mergeConfig(defaultConfig, instanceConfig));
	};
	return instance;
}
var axios = createInstance(defaults);
axios.Axios = Axios;
axios.CanceledError = CanceledError;
axios.CancelToken = CancelToken;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData;
axios.AxiosError = AxiosError;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
	return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders;
axios.formToJSON = (thing) => formDataToJSON(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters_default.getAdapter;
axios.HttpStatusCode = HttpStatusCode;
axios.default = axios;
Object.freeze({ status: "aborted" });
function $constructor(name, initializer, params) {
	function init(inst, def) {
		if (!inst._zod) Object.defineProperty(inst, "_zod", {
			value: {
				def,
				constr: _,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: false
		});
		if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		const proto = _.prototype;
		const keys = Object.keys(proto);
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		var _a;
		const inst = params?.Parent ? new Definition() : this;
		init(inst, def);
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		for (const fn of inst._zod.deferred) fn();
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
var globalConfig = {};
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}
//#endregion
//#region node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
	const numericValues = Object.values(entries).filter((v) => typeof v === "number");
	return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
}
function jsonStringifyReplacer(_, value) {
	if (typeof value === "bigint") return value.toString();
	return value;
}
function cached(getter) {
	return { get value() {
		{
			const value = getter();
			Object.defineProperty(this, "value", { value });
			return value;
		}
		throw new Error("cached value already set");
	} };
}
function nullish(input) {
	return input === null || input === void 0;
}
function cleanRegex(source) {
	const start = source.startsWith("^") ? 1 : 0;
	const end = source.endsWith("$") ? source.length - 1 : source.length;
	return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
	const valDecCount = (val.toString().split(".")[1] || "").length;
	const stepString = step.toString();
	let stepDecCount = (stepString.split(".")[1] || "").length;
	if (stepDecCount === 0 && /\d?e-\d?/.test(stepString)) {
		const match = stepString.match(/\d?e-(\d?)/);
		if (match?.[1]) stepDecCount = Number.parseInt(match[1]);
	}
	const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
	return Number.parseInt(val.toFixed(decCount).replace(".", "")) % Number.parseInt(step.toFixed(decCount).replace(".", "")) / 10 ** decCount;
}
var EVALUATING = Symbol("evaluating");
function defineLazy(object, key, getter) {
	let value = void 0;
	Object.defineProperty(object, key, {
		get() {
			if (value === EVALUATING) return;
			if (value === void 0) {
				value = EVALUATING;
				value = getter();
			}
			return value;
		},
		set(v) {
			Object.defineProperty(object, key, { value: v });
		},
		configurable: true
	});
}
function assignProp(target, prop, value) {
	Object.defineProperty(target, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
function mergeDefs(...defs) {
	const mergedDescriptors = {};
	for (const def of defs) Object.assign(mergedDescriptors, Object.getOwnPropertyDescriptors(def));
	return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
	return JSON.stringify(str);
}
function slugify(input) {
	return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject$1(data) {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = cached(() => {
	if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
	try {
		new Function("");
		return true;
	} catch (_) {
		return false;
	}
});
function isPlainObject(o) {
	if (isObject$1(o) === false) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return true;
	const prot = ctor.prototype;
	if (isObject$1(prot) === false) return false;
	if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
	return true;
}
function shallowClone(o) {
	if (isPlainObject(o)) return { ...o };
	if (Array.isArray(o)) return [...o];
	return o;
}
var propertyKeyTypes = new Set([
	"string",
	"number",
	"symbol"
]);
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
	const cl = new inst._zod.constr(def ?? inst._zod.def);
	if (!def || params?.parent) cl._zod.parent = inst;
	return cl;
}
function normalizeParams(_params) {
	const params = _params;
	if (!params) return {};
	if (typeof params === "string") return { error: () => params };
	if (params?.message !== void 0) {
		if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
		params.error = params.message;
	}
	delete params.message;
	if (typeof params.error === "string") return {
		...params,
		error: () => params.error
	};
	return params;
}
function optionalKeys(shape) {
	return Object.keys(shape).filter((k) => {
		return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
	});
}
var NUMBER_FORMAT_RANGES = {
	safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const newShape = {};
			for (const key in mask) {
				if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				newShape[key] = currDef.shape[key];
			}
			assignProp(this, "shape", newShape);
			return newShape;
		},
		checks: []
	}));
}
function omit(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const newShape = { ...schema._zod.def.shape };
			for (const key in mask) {
				if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				delete newShape[key];
			}
			assignProp(this, "shape", newShape);
			return newShape;
		},
		checks: []
	}));
}
function extend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) {
		const existingShape = schema._zod.def.shape;
		for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const _shape = {
			...schema._zod.def.shape,
			...shape
		};
		assignProp(this, "shape", _shape);
		return _shape;
	} }));
}
function safeExtend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const _shape = {
			...schema._zod.def.shape,
			...shape
		};
		assignProp(this, "shape", _shape);
		return _shape;
	} }));
}
function merge(a, b) {
	return clone(a, mergeDefs(a._zod.def, {
		get shape() {
			const _shape = {
				...a._zod.def.shape,
				...b._zod.def.shape
			};
			assignProp(this, "shape", _shape);
			return _shape;
		},
		get catchall() {
			return b._zod.def.catchall;
		},
		checks: []
	}));
}
function partial(Class, schema, mask) {
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const oldShape = schema._zod.def.shape;
			const shape = { ...oldShape };
			if (mask) for (const key in mask) {
				if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				shape[key] = Class ? new Class({
					type: "optional",
					innerType: oldShape[key]
				}) : oldShape[key];
			}
			else for (const key in oldShape) shape[key] = Class ? new Class({
				type: "optional",
				innerType: oldShape[key]
			}) : oldShape[key];
			assignProp(this, "shape", shape);
			return shape;
		},
		checks: []
	}));
}
function required(Class, schema, mask) {
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const oldShape = schema._zod.def.shape;
		const shape = { ...oldShape };
		if (mask) for (const key in mask) {
			if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
			if (!mask[key]) continue;
			shape[key] = new Class({
				type: "nonoptional",
				innerType: oldShape[key]
			});
		}
		else for (const key in oldShape) shape[key] = new Class({
			type: "nonoptional",
			innerType: oldShape[key]
		});
		assignProp(this, "shape", shape);
		return shape;
	} }));
}
function aborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
	return false;
}
function prefixIssues(path, issues) {
	return issues.map((iss) => {
		var _a;
		(_a = iss).path ?? (_a.path = []);
		iss.path.unshift(path);
		return iss;
	});
}
function unwrapMessage(message) {
	return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
	const full = {
		...iss,
		path: iss.path ?? []
	};
	if (!iss.message) full.message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
	delete full.inst;
	delete full.continue;
	if (!ctx?.reportInput) delete full.input;
	return full;
}
function getLengthableOrigin(input) {
	if (Array.isArray(input)) return "array";
	if (typeof input === "string") return "string";
	return "unknown";
}
function issue(...args) {
	const [iss, input, inst] = args;
	if (typeof iss === "string") return {
		message: iss,
		code: "custom",
		input,
		inst
	};
	return { ...iss };
}
//#endregion
//#region node_modules/zod/v4/core/errors.js
var initializer$1 = (inst, def) => {
	inst.name = "$ZodError";
	Object.defineProperty(inst, "_zod", {
		value: inst._zod,
		enumerable: false
	});
	Object.defineProperty(inst, "issues", {
		value: def,
		enumerable: false
	});
	inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
	Object.defineProperty(inst, "toString", {
		value: () => inst.message,
		enumerable: false
	});
};
var $ZodError = $constructor("$ZodError", initializer$1);
var $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
	const fieldErrors = {};
	const formErrors = [];
	for (const sub of error.issues) if (sub.path.length > 0) {
		fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
		fieldErrors[sub.path[0]].push(mapper(sub));
	} else formErrors.push(mapper(sub));
	return {
		formErrors,
		fieldErrors
	};
}
function formatError(error, mapper = (issue) => issue.message) {
	const fieldErrors = { _errors: [] };
	const processError = (error) => {
		for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }));
		else if (issue.code === "invalid_key") processError({ issues: issue.issues });
		else if (issue.code === "invalid_element") processError({ issues: issue.issues });
		else if (issue.path.length === 0) fieldErrors._errors.push(mapper(issue));
		else {
			let curr = fieldErrors;
			let i = 0;
			while (i < issue.path.length) {
				const el = issue.path[i];
				if (!(i === issue.path.length - 1)) curr[el] = curr[el] || { _errors: [] };
				else {
					curr[el] = curr[el] || { _errors: [] };
					curr[el]._errors.push(mapper(issue));
				}
				curr = curr[el];
				i++;
			}
		}
	};
	processError(error);
	return fieldErrors;
}
//#endregion
//#region node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
	const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	if (result.issues.length) {
		const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
		captureStackTrace(e, _params?.callee);
		throw e;
	}
	return result.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
	const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	if (result.issues.length) {
		const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
		captureStackTrace(e, params?.callee);
		throw e;
	}
	return result.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length ? {
		success: false,
		error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	} : {
		success: true,
		data: result.value
	};
};
var safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length ? {
		success: false,
		error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	} : {
		success: true,
		data: result.value
	};
};
var safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
	return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
	return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
	return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
	return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
	return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
	return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _safeParseAsync(_Err)(schema, value, _ctx);
};
//#endregion
//#region node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][^\s-]{8,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
var duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
var uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date$1 = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time$1(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime$1(args) {
	const time = timeSource({ precision: args.precision });
	const opts = ["Z"];
	if (args.local) opts.push("");
	if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
	const timeRegex = `${time}(?:${opts.join("|")})`;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string$1 = (params) => {
	const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
	return new RegExp(`^${regex}$`);
};
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean$1 = /^(?:true|false)$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;
//#endregion
//#region node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
var numericOriginMap = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
		if (def.value < curr) if (def.inclusive) bag.maximum = def.value;
		else bag.exclusiveMaximum = def.value;
	});
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
		if (def.value > curr) if (def.inclusive) bag.minimum = def.value;
		else bag.exclusiveMinimum = def.value;
	});
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.onattach.push((inst) => {
		var _a;
		(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
	});
	inst._zod.check = (payload) => {
		if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
		payload.issues.push({
			origin: typeof payload.value,
			code: "not_multiple_of",
			divisor: def.value,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
	$ZodCheck.init(inst, def);
	def.format = def.format || "float64";
	const isInt = def.format?.includes("int");
	const origin = isInt ? "int" : "number";
	const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = def.format;
		bag.minimum = minimum;
		bag.maximum = maximum;
		if (isInt) bag.pattern = integer;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (isInt) {
			if (!Number.isInteger(input)) {
				payload.issues.push({
					expected: origin,
					format: def.format,
					code: "invalid_type",
					continue: false,
					input,
					inst
				});
				return;
			}
			if (!Number.isSafeInteger(input)) {
				if (input > 0) payload.issues.push({
					input,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				else payload.issues.push({
					input,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				return;
			}
		}
		if (input < minimum) payload.issues.push({
			origin: "number",
			input,
			code: "too_small",
			minimum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
		if (input > maximum) payload.issues.push({
			origin: "number",
			input,
			code: "too_big",
			maximum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
		if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
		if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.minimum = def.length;
		bag.maximum = def.length;
		bag.length = def.length;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		const length = input.length;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = def.format;
		if (def.pattern) {
			bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
			bag.patterns.add(def.pattern);
		}
	});
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
	def.pattern = pattern;
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});
//#endregion
//#region node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = []) {
		this.content = [];
		this.indent = 0;
		if (this) this.args = args;
	}
	indented(fn) {
		this.indent += 1;
		fn(this);
		this.indent -= 1;
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const args = this?.args;
		const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
		return new F(...args, lines.join("\n"));
	}
};
//#endregion
//#region node_modules/zod/v4/core/versions.js
var version = {
	major: 4,
	minor: 3,
	patch: 6
};
//#endregion
//#region node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version;
	const checks = [...inst._zod.def.checks ?? []];
	if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		const handleCanaryResult = (canary, payload, ctx) => {
			if (aborted(canary)) {
				canary.aborted = true;
				return canary;
			}
			const checkResult = runChecks(payload, checks, ctx);
			if (checkResult instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
			}
			return inst._zod.parse(checkResult, ctx);
		};
		inst._zod.run = (payload, ctx) => {
			if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
			if (ctx.direction === "backward") {
				const canary = inst._zod.parse({
					value: payload.value,
					issues: []
				}, {
					...ctx,
					skipChecks: true
				});
				if (canary instanceof Promise) return canary.then((canary) => {
					return handleCanaryResult(canary, payload, ctx);
				});
				return handleCanaryResult(canary, payload, ctx);
			}
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
	defineLazy(inst, "~standard", () => ({
		validate: (value) => {
			try {
				const r = safeParse$1(inst, value);
				return r.success ? { value: r.data } : { issues: r.error?.issues };
			} catch (_) {
				return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	}));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const trimmed = payload.value.trim();
			const url = new URL(trimmed);
			if (def.hostname) {
				def.hostname.lastIndex = 0;
				if (!def.hostname.test(url.hostname)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid hostname",
					pattern: def.hostname.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (def.protocol) {
				def.protocol.lastIndex = 0;
				if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid protocol",
					pattern: def.protocol.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (def.normalize) payload.value = url.href;
			else payload.value = trimmed;
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
	def.pattern ?? (def.pattern = nanoid);
	$ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime$1(def));
	$ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date$1);
	$ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time$1(def));
	$ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration$1);
	$ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.format = `ipv6`;
	inst._zod.check = (payload) => {
		try {
			new URL(`http://[${payload.value}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		const parts = payload.value.split("/");
		try {
			if (parts.length !== 2) throw new Error();
			const [address, prefix] = parts;
			if (!prefix) throw new Error();
			const prefixNum = Number(prefix);
			if (`${prefixNum}` !== prefix) throw new Error();
			if (prefixNum < 0 || prefixNum > 128) throw new Error();
			new URL(`http://[${address}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.contentEncoding = "base64";
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64URL(data) {
	if (!base64url.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64url);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.contentEncoding = "base64url";
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = inst._zod.bag.pattern ?? number;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Number(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
		const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
		payload.issues.push({
			expected: "number",
			code: "invalid_type",
			input,
			inst,
			...received ? { received } : {}
		});
		return payload;
	};
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
	$ZodCheckNumberFormat.init(inst, def);
	$ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = boolean$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Boolean(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "boolean") return payload;
		payload.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input,
			inst
		});
		return payload;
	};
});
var $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = Array(input.length);
		const proms = [];
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else handleArrayResult(result, payload, i);
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handlePropertyResult(result, final, key, input, isOptionalOut) {
	if (result.issues.length) {
		if (isOptionalOut && !(key in input)) return;
		final.issues.push(...prefixIssues(key, result.issues));
	}
	if (result.value === void 0) {
		if (key in input) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
function normalizeDef(def) {
	const keys = Object.keys(def.shape);
	for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
	const okeys = optionalKeys(def.shape);
	return {
		...def,
		keys,
		keySet: new Set(keys),
		numKeys: keys.length,
		optionalKeys: new Set(okeys)
	};
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
	const unrecognized = [];
	const keySet = def.keySet;
	const _catchall = def.catchall._zod;
	const t = _catchall.def.type;
	const isOptionalOut = _catchall.optout === "optional";
	for (const key in input) {
		if (keySet.has(key)) continue;
		if (t === "never") {
			unrecognized.push(key);
			continue;
		}
		const r = _catchall.run({
			value: input[key],
			issues: []
		}, ctx);
		if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalOut)));
		else handlePropertyResult(r, payload, key, input, isOptionalOut);
	}
	if (unrecognized.length) payload.issues.push({
		code: "unrecognized_keys",
		keys: unrecognized,
		input,
		inst
	});
	if (!proms.length) return payload;
	return Promise.all(proms).then(() => {
		return payload;
	});
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
		const sh = def.shape;
		Object.defineProperty(def, "shape", { get: () => {
			const newSh = { ...sh };
			Object.defineProperty(def, "shape", { value: newSh });
			return newSh;
		} });
	}
	const _normalized = cached(() => normalizeDef(def));
	defineLazy(inst._zod, "propValues", () => {
		const shape = def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
			}
		}
		return propValues;
	});
	const isObject = isObject$1;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = {};
		const proms = [];
		const shape = value.shape;
		for (const key of value.keys) {
			const el = shape[key];
			const isOptionalOut = el._zod.optout === "optional";
			const r = el._zod.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalOut)));
			else handlePropertyResult(r, payload, key, input, isOptionalOut);
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
	};
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
	$ZodObject.init(inst, def);
	const superParse = inst._zod.parse;
	const _normalized = cached(() => normalizeDef(def));
	const generateFastpass = (shape) => {
		const doc = new Doc([
			"shape",
			"payload",
			"ctx"
		]);
		const normalized = _normalized.value;
		const parseStr = (key) => {
			const k = esc(key);
			return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		};
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.keys) ids[key] = `key_${counter++}`;
		doc.write(`const newResult = {};`);
		for (const key of normalized.keys) {
			const id = ids[key];
			const k = esc(key);
			const isOptionalOut = shape[key]?._zod?.optout === "optional";
			doc.write(`const ${id} = ${parseStr(key)};`);
			if (isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
			else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		const fn = doc.compile();
		return (payload, ctx) => fn(shape, payload, ctx);
	};
	let fastpass;
	const isObject = isObject$1;
	const jit = !globalConfig.jitless;
	const fastEnabled = jit && allowsEval.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
			if (!catchall) return payload;
			return handleCatchall([], input, payload, ctx, value, inst);
		}
		return superParse(payload, ctx);
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	const nonaborted = results.filter((r) => !aborted(r));
	if (nonaborted.length === 1) {
		final.value = nonaborted[0].value;
		return nonaborted[0];
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "values", () => {
		if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazy(inst._zod, "pattern", () => {
		if (def.options.every((o) => o._zod.pattern)) {
			const patterns = def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	const single = def.options.length === 1;
	const first = def.options[0]._zod.run;
	inst._zod.parse = (payload, ctx) => {
		if (single) return first(payload, ctx);
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		for (const key of sharedKeys) {
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	const unrecKeys = /* @__PURE__ */ new Map();
	let unrecIssue;
	for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
		unrecIssue ?? (unrecIssue = iss);
		for (const k of iss.keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k).l = true;
		}
	} else result.issues.push(iss);
	for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
		if (!unrecKeys.has(k)) unrecKeys.set(k, {});
		unrecKeys.get(k).r = true;
	}
	else result.issues.push(iss);
	const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
	if (bothKeys.length && unrecIssue) result.issues.push({
		...unrecIssue,
		keys: bothKeys
	});
	if (aborted(result)) return result;
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	result.value = merged.data;
	return result;
}
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	const valuesSet = new Set(values);
	inst._zod.values = valuesSet;
	inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (valuesSet.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		const _out = def.transform(payload.value, payload);
		if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		return payload;
	};
});
function handleOptionalResult(result, input) {
	if (result.issues.length && input === void 0) return {
		issues: [],
		value: void 0
	};
	return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	inst._zod.optout = "optional";
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
	});
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (def.innerType._zod.optin === "optional") {
			const result = def.innerType._zod.run(payload, ctx);
			if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, payload.value));
			return handleOptionalResult(result, payload.value);
		}
		if (payload.value === void 0) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
	inst._zod.parse = (payload, ctx) => {
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault returns the default value immediately in forward direction.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => {
		const v = def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => {
			payload.value = result.value;
			if (result.issues.length) {
				payload.value = def.catchValue({
					...payload,
					error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
					input: payload.value
				});
				payload.issues = [];
			}
			return payload;
		});
		payload.value = result.value;
		if (result.issues.length) {
			payload.value = def.catchValue({
				...payload,
				error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
				input: payload.value
			});
			payload.issues = [];
		}
		return payload;
	};
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => def.in._zod.values);
	defineLazy(inst._zod, "optin", () => def.in._zod.optin);
	defineLazy(inst._zod, "optout", () => def.out._zod.optout);
	defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") {
			const right = def.out._zod.run(payload, ctx);
			if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
			return handlePipeResult(right, def.in, ctx);
		}
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
		return handlePipeResult(left, def.out, ctx);
	};
});
function handlePipeResult(left, next, ctx) {
	if (left.issues.length) {
		left.aborted = true;
		return left;
	}
	return next._zod.run({
		value: left.value,
		issues: left.issues
	}, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
	defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	payload.value = Object.freeze(payload.value);
	return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}
//#endregion
//#region node_modules/zod/v4/core/registries.js
var _a;
var $ZodRegistry = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
	}
	add(schema, ..._meta) {
		const meta = _meta[0];
		this._map.set(schema, meta);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
		return this;
	}
	clear() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
		return this;
	}
	remove(schema) {
		const meta = this._map.get(schema);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
		this._map.delete(schema);
		return this;
	}
	get(schema) {
		const p = schema._zod.parent;
		if (p) {
			const pm = { ...this.get(p) ?? {} };
			delete pm.id;
			const f = {
				...pm,
				...this._map.get(schema)
			};
			return Object.keys(f).length ? f : void 0;
		}
		return this._map.get(schema);
	}
	has(schema) {
		return this._map.has(schema);
	}
};
function registry() {
	return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/zod/v4/core/api.js
/* @__NO_SIDE_EFFECTS__ */
function _string(Class, params) {
	return new Class({
		type: "string",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _int(Class, params) {
	return new Class({
		type: "number",
		check: "number_format",
		abort: false,
		format: "safeint",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _boolean(Class, params) {
	return new Class({
		type: "boolean",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _any(Class) {
	return new Class({ type: "any" });
}
/* @__NO_SIDE_EFFECTS__ */
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
/* @__NO_SIDE_EFFECTS__ */
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _lt(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _lte(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _gt(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _gte(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _multipleOf(value, params) {
	return new $ZodCheckMultipleOf({
		check: "multiple_of",
		...normalizeParams(params),
		value
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _normalize(form) {
	return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
/* @__NO_SIDE_EFFECTS__ */
function _trim() {
	return /* @__PURE__ */ _overwrite((input) => input.trim());
}
/* @__NO_SIDE_EFFECTS__ */
function _toLowerCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
/* @__NO_SIDE_EFFECTS__ */
function _toUpperCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
/* @__NO_SIDE_EFFECTS__ */
function _slugify() {
	return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
/* @__NO_SIDE_EFFECTS__ */
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _superRefine(fn) {
	const ch = /* @__PURE__ */ _check((payload) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	});
	return ch;
}
/* @__NO_SIDE_EFFECTS__ */
function _check(fn, params) {
	const ch = new $ZodCheck({
		check: "custom",
		...normalizeParams(params)
	});
	ch._zod.check = fn;
	return ch;
}
//#endregion
//#region node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
	let target = params?.target ?? "draft-2020-12";
	if (target === "draft-4") target = "draft-04";
	if (target === "draft-7") target = "draft-07";
	return {
		processors: params.processors ?? {},
		metadataRegistry: params?.metadata ?? globalRegistry,
		target,
		unrepresentable: params?.unrepresentable ?? "throw",
		override: params?.override ?? (() => {}),
		io: params?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: params?.cycles ?? "ref",
		reused: params?.reused ?? "inline",
		external: params?.external ?? void 0
	};
}
function process$1(schema, ctx, _params = {
	path: [],
	schemaPath: []
}) {
	var _a;
	const def = schema._zod.def;
	const seen = ctx.seen.get(schema);
	if (seen) {
		seen.count++;
		if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
		return seen.schema;
	}
	const result = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: _params.path
	};
	ctx.seen.set(schema, result);
	const overrideSchema = schema._zod.toJSONSchema?.();
	if (overrideSchema) result.schema = overrideSchema;
	else {
		const params = {
			..._params,
			schemaPath: [..._params.schemaPath, schema],
			path: _params.path
		};
		if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
		else {
			const _json = result.schema;
			const processor = ctx.processors[def.type];
			if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
			processor(schema, ctx, _json, params);
		}
		const parent = schema._zod.parent;
		if (parent) {
			if (!result.ref) result.ref = parent;
			process$1(parent, ctx, params);
			ctx.seen.get(parent).isParent = true;
		}
	}
	const meta = ctx.metadataRegistry.get(schema);
	if (meta) Object.assign(result.schema, meta);
	if (ctx.io === "input" && isTransforming(schema)) {
		delete result.schema.examples;
		delete result.schema.default;
	}
	if (ctx.io === "input" && result.schema._prefault) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
	delete result.schema._prefault;
	return ctx.seen.get(schema).schema;
}
function extractDefs(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const idToSchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.entries()) {
		const id = ctx.metadataRegistry.get(entry[0])?.id;
		if (id) {
			const existing = idToSchema.get(id);
			if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			idToSchema.set(id, entry[0]);
		}
	}
	const makeURI = (entry) => {
		const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
		if (ctx.external) {
			const externalId = ctx.external.registry.get(entry[0])?.id;
			const uriGenerator = ctx.external.uri ?? ((id) => id);
			if (externalId) return { ref: uriGenerator(externalId) };
			const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
			entry[1].defId = id;
			return {
				defId: id,
				ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
			};
		}
		if (entry[1] === root) return { ref: "#" };
		const defUriPrefix = `#/${defsSegment}/`;
		const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
		return {
			defId,
			ref: defUriPrefix + defId
		};
	};
	const extractToDef = (entry) => {
		if (entry[1].schema.$ref) return;
		const seen = entry[1];
		const { ref, defId } = makeURI(entry);
		seen.def = { ...seen.schema };
		if (defId) seen.defId = defId;
		const schema = seen.schema;
		for (const key in schema) delete schema[key];
		schema.$ref = ref;
	};
	if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (schema === entry[0]) {
			extractToDef(entry);
			continue;
		}
		if (ctx.external) {
			const ext = ctx.external.registry.get(entry[0])?.id;
			if (schema !== entry[0] && ext) {
				extractToDef(entry);
				continue;
			}
		}
		if (ctx.metadataRegistry.get(entry[0])?.id) {
			extractToDef(entry);
			continue;
		}
		if (seen.cycle) {
			extractToDef(entry);
			continue;
		}
		if (seen.count > 1) {
			if (ctx.reused === "ref") {
				extractToDef(entry);
				continue;
			}
		}
	}
}
function finalize(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const flattenRef = (zodSchema) => {
		const seen = ctx.seen.get(zodSchema);
		if (seen.ref === null) return;
		const schema = seen.def ?? seen.schema;
		const _cached = { ...schema };
		const ref = seen.ref;
		seen.ref = null;
		if (ref) {
			flattenRef(ref);
			const refSeen = ctx.seen.get(ref);
			const refSchema = refSeen.schema;
			if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
				schema.allOf = schema.allOf ?? [];
				schema.allOf.push(refSchema);
			} else Object.assign(schema, refSchema);
			Object.assign(schema, _cached);
			if (zodSchema._zod.parent === ref) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (!(key in _cached)) delete schema[key];
			}
			if (refSchema.$ref && refSeen.def) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
			}
		}
		const parent = zodSchema._zod.parent;
		if (parent && parent !== ref) {
			flattenRef(parent);
			const parentSeen = ctx.seen.get(parent);
			if (parentSeen?.schema.$ref) {
				schema.$ref = parentSeen.schema.$ref;
				if (parentSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
				}
			}
		}
		ctx.override({
			zodSchema,
			jsonSchema: schema,
			path: seen.path ?? []
		});
	};
	for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
	const result = {};
	if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
	else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
	else if (ctx.target === "openapi-3.0") {}
	if (ctx.external?.uri) {
		const id = ctx.external.registry.get(schema)?.id;
		if (!id) throw new Error("Schema is missing an `id` property");
		result.$id = ctx.external.uri(id);
	}
	Object.assign(result, root.def ?? root.schema);
	const defs = ctx.external?.defs ?? {};
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.def && seen.defId) defs[seen.defId] = seen.def;
	}
	if (ctx.external) {} else if (Object.keys(defs).length > 0) if (ctx.target === "draft-2020-12") result.$defs = defs;
	else result.definitions = defs;
	try {
		const finalized = JSON.parse(JSON.stringify(result));
		Object.defineProperty(finalized, "~standard", {
			value: {
				...schema["~standard"],
				jsonSchema: {
					input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
					output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
				}
			},
			enumerable: false,
			writable: false
		});
		return finalized;
	} catch (_err) {
		throw new Error("Error converting schema to JSON.");
	}
}
function isTransforming(_schema, _ctx) {
	const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
	if (ctx.seen.has(_schema)) return false;
	ctx.seen.add(_schema);
	const def = _schema._zod.def;
	if (def.type === "transform") return true;
	if (def.type === "array") return isTransforming(def.element, ctx);
	if (def.type === "set") return isTransforming(def.valueType, ctx);
	if (def.type === "lazy") return isTransforming(def.getter(), ctx);
	if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
	if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
	if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
	if (def.type === "pipe") return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
	if (def.type === "object") {
		for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
		return false;
	}
	if (def.type === "union") {
		for (const option of def.options) if (isTransforming(option, ctx)) return true;
		return false;
	}
	if (def.type === "tuple") {
		for (const item of def.items) if (isTransforming(item, ctx)) return true;
		if (def.rest && isTransforming(def.rest, ctx)) return true;
		return false;
	}
	return false;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
	const ctx = initializeContext({
		...params,
		processors
	});
	process$1(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
	const { libraryOptions, target } = params ?? {};
	const ctx = initializeContext({
		...libraryOptions ?? {},
		target,
		io,
		processors
	});
	process$1(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
//#endregion
//#region node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
var stringProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	json.type = "string";
	const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
	if (typeof minimum === "number") json.minLength = minimum;
	if (typeof maximum === "number") json.maxLength = maximum;
	if (format) {
		json.format = formatMap[format] ?? format;
		if (json.format === "") delete json.format;
		if (format === "time") delete json.format;
	}
	if (contentEncoding) json.contentEncoding = contentEncoding;
	if (patterns && patterns.size > 0) {
		const regexes = [...patterns];
		if (regexes.length === 1) json.pattern = regexes[0].source;
		else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
			...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: regex.source
		}))];
	}
};
var numberProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
	if (typeof format === "string" && format.includes("int")) json.type = "integer";
	else json.type = "number";
	if (typeof exclusiveMinimum === "number") if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
		json.minimum = exclusiveMinimum;
		json.exclusiveMinimum = true;
	} else json.exclusiveMinimum = exclusiveMinimum;
	if (typeof minimum === "number") {
		json.minimum = minimum;
		if (typeof exclusiveMinimum === "number" && ctx.target !== "draft-04") if (exclusiveMinimum >= minimum) delete json.minimum;
		else delete json.exclusiveMinimum;
	}
	if (typeof exclusiveMaximum === "number") if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
		json.maximum = exclusiveMaximum;
		json.exclusiveMaximum = true;
	} else json.exclusiveMaximum = exclusiveMaximum;
	if (typeof maximum === "number") {
		json.maximum = maximum;
		if (typeof exclusiveMaximum === "number" && ctx.target !== "draft-04") if (exclusiveMaximum <= maximum) delete json.maximum;
		else delete json.exclusiveMaximum;
	}
	if (typeof multipleOf === "number") json.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
	json.type = "boolean";
};
var neverProcessor = (_schema, _ctx, json, _params) => {
	json.not = {};
};
var enumProcessor = (schema, _ctx, json, _params) => {
	const def = schema._zod.def;
	const values = getEnumValues(def.entries);
	if (values.every((v) => typeof v === "number")) json.type = "number";
	if (values.every((v) => typeof v === "string")) json.type = "string";
	json.enum = values;
};
var customProcessor = (_schema, ctx, _json, _params) => {
	if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
};
var transformProcessor = (_schema, ctx, _json, _params) => {
	if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
};
var arrayProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const { minimum, maximum } = schema._zod.bag;
	if (typeof minimum === "number") json.minItems = minimum;
	if (typeof maximum === "number") json.maxItems = maximum;
	json.type = "array";
	json.items = process$1(def.element, ctx, {
		...params,
		path: [...params.path, "items"]
	});
};
var objectProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	json.type = "object";
	json.properties = {};
	const shape = def.shape;
	for (const key in shape) json.properties[key] = process$1(shape[key], ctx, {
		...params,
		path: [
			...params.path,
			"properties",
			key
		]
	});
	const allKeys = new Set(Object.keys(shape));
	const requiredKeys = new Set([...allKeys].filter((key) => {
		const v = def.shape[key]._zod;
		if (ctx.io === "input") return v.optin === void 0;
		else return v.optout === void 0;
	}));
	if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
	if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
	else if (!def.catchall) {
		if (ctx.io === "output") json.additionalProperties = false;
	} else if (def.catchall) json.additionalProperties = process$1(def.catchall, ctx, {
		...params,
		path: [...params.path, "additionalProperties"]
	});
};
var unionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const isExclusive = def.inclusive === false;
	const options = def.options.map((x, i) => process$1(x, ctx, {
		...params,
		path: [
			...params.path,
			isExclusive ? "oneOf" : "anyOf",
			i
		]
	}));
	if (isExclusive) json.oneOf = options;
	else json.anyOf = options;
};
var intersectionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const a = process$1(def.left, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			0
		]
	});
	const b = process$1(def.right, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			1
		]
	});
	const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
	json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
};
var nullableProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const inner = process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	if (ctx.target === "openapi-3.0") {
		seen.ref = def.innerType;
		json.nullable = true;
	} else json.anyOf = [inner, { type: "null" }];
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	let catchValue;
	try {
		catchValue = def.catchValue(void 0);
	} catch {
		throw new Error("Dynamic catch values are not supported in JSON Schema");
	}
	json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	const innerType = ctx.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
	process$1(innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	process$1(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
//#endregion
//#region node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function datetime(params) {
	return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function date(params) {
	return /* @__PURE__ */ _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function time(params) {
	return /* @__PURE__ */ _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function duration(params) {
	return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
}
//#endregion
//#region node_modules/zod/v4/classic/errors.js
var initializer = (inst, issues) => {
	$ZodError.init(inst, issues);
	inst.name = "ZodError";
	Object.defineProperties(inst, {
		format: { value: (mapper) => formatError(inst, mapper) },
		flatten: { value: (mapper) => flattenError(inst, mapper) },
		addIssue: { value: (issue) => {
			inst.issues.push(issue);
			inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
		} },
		addIssues: { value: (issues) => {
			inst.issues.push(...issues);
			inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
		} },
		isEmpty: { get() {
			return inst.issues.length === 0;
		} }
	});
};
var ZodError = $constructor("ZodError", initializer);
var ZodRealError = $constructor("ZodError", initializer, { Parent: Error });
//#endregion
//#region node_modules/zod/v4/classic/parse.js
var parse = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode$1 = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
//#endregion
//#region node_modules/zod/v4/classic/schemas.js
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
	$ZodType.init(inst, def);
	Object.assign(inst["~standard"], { jsonSchema: {
		input: createStandardJSONSchemaMethod(inst, "input"),
		output: createStandardJSONSchemaMethod(inst, "output")
	} });
	inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
	inst.def = def;
	inst.type = def.type;
	Object.defineProperty(inst, "_def", { value: def });
	inst.check = (...checks) => {
		return inst.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...checks.map((ch) => typeof ch === "function" ? { _zod: {
			check: ch,
			def: { check: "custom" },
			onattach: []
		} } : ch)] }), { parent: true });
	};
	inst.with = inst.check;
	inst.clone = (def, params) => clone(inst, def, params);
	inst.brand = () => inst;
	inst.register = ((reg, meta) => {
		reg.add(inst, meta);
		return inst;
	});
	inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
	inst.safeParse = (data, params) => safeParse(inst, data, params);
	inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
	inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
	inst.spa = inst.safeParseAsync;
	inst.encode = (data, params) => encode$1(inst, data, params);
	inst.decode = (data, params) => decode(inst, data, params);
	inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
	inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
	inst.safeEncode = (data, params) => safeEncode(inst, data, params);
	inst.safeDecode = (data, params) => safeDecode(inst, data, params);
	inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
	inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
	inst.refine = (check, params) => inst.check(refine(check, params));
	inst.superRefine = (refinement) => inst.check(superRefine(refinement));
	inst.overwrite = (fn) => inst.check(/* @__PURE__ */ _overwrite(fn));
	inst.optional = () => optional(inst);
	inst.exactOptional = () => exactOptional(inst);
	inst.nullable = () => nullable(inst);
	inst.nullish = () => optional(nullable(inst));
	inst.nonoptional = (params) => nonoptional(inst, params);
	inst.array = () => array(inst);
	inst.or = (arg) => union([inst, arg]);
	inst.and = (arg) => intersection(inst, arg);
	inst.transform = (tx) => pipe(inst, transform(tx));
	inst.default = (def) => _default(inst, def);
	inst.prefault = (def) => prefault(inst, def);
	inst.catch = (params) => _catch(inst, params);
	inst.pipe = (target) => pipe(inst, target);
	inst.readonly = () => readonly(inst);
	inst.describe = (description) => {
		const cl = inst.clone();
		globalRegistry.add(cl, { description });
		return cl;
	};
	Object.defineProperty(inst, "description", {
		get() {
			return globalRegistry.get(inst)?.description;
		},
		configurable: true
	});
	inst.meta = (...args) => {
		if (args.length === 0) return globalRegistry.get(inst);
		const cl = inst.clone();
		globalRegistry.add(cl, args[0]);
		return cl;
	};
	inst.isOptional = () => inst.safeParse(void 0).success;
	inst.isNullable = () => inst.safeParse(null).success;
	inst.apply = (fn) => fn(inst);
	return inst;
});
/** @internal */
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
	const bag = inst._zod.bag;
	inst.format = bag.format ?? null;
	inst.minLength = bag.minimum ?? null;
	inst.maxLength = bag.maximum ?? null;
	inst.regex = (...args) => inst.check(/* @__PURE__ */ _regex(...args));
	inst.includes = (...args) => inst.check(/* @__PURE__ */ _includes(...args));
	inst.startsWith = (...args) => inst.check(/* @__PURE__ */ _startsWith(...args));
	inst.endsWith = (...args) => inst.check(/* @__PURE__ */ _endsWith(...args));
	inst.min = (...args) => inst.check(/* @__PURE__ */ _minLength(...args));
	inst.max = (...args) => inst.check(/* @__PURE__ */ _maxLength(...args));
	inst.length = (...args) => inst.check(/* @__PURE__ */ _length(...args));
	inst.nonempty = (...args) => inst.check(/* @__PURE__ */ _minLength(1, ...args));
	inst.lowercase = (params) => inst.check(/* @__PURE__ */ _lowercase(params));
	inst.uppercase = (params) => inst.check(/* @__PURE__ */ _uppercase(params));
	inst.trim = () => inst.check(/* @__PURE__ */ _trim());
	inst.normalize = (...args) => inst.check(/* @__PURE__ */ _normalize(...args));
	inst.toLowerCase = () => inst.check(/* @__PURE__ */ _toLowerCase());
	inst.toUpperCase = () => inst.check(/* @__PURE__ */ _toUpperCase());
	inst.slugify = () => inst.check(/* @__PURE__ */ _slugify());
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
	inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
	inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
	inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
	inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
	inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
	inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
	inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
	inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
	inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
	inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
	inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
	inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
	inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
	inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
	inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
	inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
	inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
	inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
	inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
	inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
	inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
	inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
	inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
	inst.datetime = (params) => inst.check(datetime(params));
	inst.date = (params) => inst.check(date(params));
	inst.time = (params) => inst.check(time(params));
	inst.duration = (params) => inst.check(duration(params));
});
function string(params) {
	return /* @__PURE__ */ _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function url(params) {
	return /* @__PURE__ */ _url(ZodURL, params);
}
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
	inst.gt = (value, params) => inst.check(/* @__PURE__ */ _gt(value, params));
	inst.gte = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
	inst.min = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
	inst.lt = (value, params) => inst.check(/* @__PURE__ */ _lt(value, params));
	inst.lte = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
	inst.max = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
	inst.int = (params) => inst.check(int(params));
	inst.safe = (params) => inst.check(int(params));
	inst.positive = (params) => inst.check(/* @__PURE__ */ _gt(0, params));
	inst.nonnegative = (params) => inst.check(/* @__PURE__ */ _gte(0, params));
	inst.negative = (params) => inst.check(/* @__PURE__ */ _lt(0, params));
	inst.nonpositive = (params) => inst.check(/* @__PURE__ */ _lte(0, params));
	inst.multipleOf = (value, params) => inst.check(/* @__PURE__ */ _multipleOf(value, params));
	inst.step = (value, params) => inst.check(/* @__PURE__ */ _multipleOf(value, params));
	inst.finite = () => inst;
	const bag = inst._zod.bag;
	inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
	inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
	inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
	inst.isFinite = true;
	inst.format = bag.format ?? null;
});
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return /* @__PURE__ */ _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
	$ZodBoolean.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean(params) {
	return /* @__PURE__ */ _boolean(ZodBoolean, params);
}
var ZodAny = /* @__PURE__ */ $constructor("ZodAny", (inst, def) => {
	$ZodAny.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => void 0;
});
function any() {
	return /* @__PURE__ */ _any(ZodAny);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => void 0;
});
function unknown() {
	return /* @__PURE__ */ _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
	return /* @__PURE__ */ _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
	inst.element = def.element;
	inst.min = (minLength, params) => inst.check(/* @__PURE__ */ _minLength(minLength, params));
	inst.nonempty = (params) => inst.check(/* @__PURE__ */ _minLength(1, params));
	inst.max = (maxLength, params) => inst.check(/* @__PURE__ */ _maxLength(maxLength, params));
	inst.length = (len, params) => inst.check(/* @__PURE__ */ _length(len, params));
	inst.unwrap = () => inst.element;
});
function array(element, params) {
	return /* @__PURE__ */ _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
	$ZodObjectJIT.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
	defineLazy(inst, "shape", () => {
		return def.shape;
	});
	inst.keyof = () => _enum(Object.keys(inst._zod.def.shape));
	inst.catchall = (catchall) => inst.clone({
		...inst._zod.def,
		catchall
	});
	inst.passthrough = () => inst.clone({
		...inst._zod.def,
		catchall: unknown()
	});
	inst.loose = () => inst.clone({
		...inst._zod.def,
		catchall: unknown()
	});
	inst.strict = () => inst.clone({
		...inst._zod.def,
		catchall: never()
	});
	inst.strip = () => inst.clone({
		...inst._zod.def,
		catchall: void 0
	});
	inst.extend = (incoming) => {
		return extend(inst, incoming);
	};
	inst.safeExtend = (incoming) => {
		return safeExtend(inst, incoming);
	};
	inst.merge = (other) => merge(inst, other);
	inst.pick = (mask) => pick(inst, mask);
	inst.omit = (mask) => omit(inst, mask);
	inst.partial = (...args) => partial(ZodOptional, inst, args[0]);
	inst.required = (...args) => required(ZodNonOptional, inst, args[0]);
});
function object(shape, params) {
	return new ZodObject({
		type: "object",
		shape: shape ?? {},
		...normalizeParams(params)
	});
}
function strictObject(shape, params) {
	return new ZodObject({
		type: "object",
		shape,
		catchall: never(),
		...normalizeParams(params)
	});
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
	inst.enum = def.entries;
	inst.options = Object.values(def.entries);
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	return new ZodEnum({
		type: "enum",
		entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
		...normalizeParams(params)
	});
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
	inst._zod.parse = (payload, _ctx) => {
		if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = inst);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			return payload;
		});
		payload.value = output;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
	$ZodExactOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
	return new ZodExactOptional({
		type: "optional",
		innerType
	});
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
	});
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
	return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
	return /* @__PURE__ */ _superRefine(fn);
}
//#endregion
//#region node_modules/jira.js/dist/esm/config.mjs
var BasicAuthSchema = object({
	email: string(),
	apiToken: string()
}).strict();
var OAuth2Schema = object({ accessToken: string() }).strict();
var MiddlewaresSchema = object({
	onError: optional(any()),
	onResponse: optional(any())
}).strict();
var ConfigSchema = object({
	host: string().url(),
	strictGDPR: boolean().optional(),
	/** Adds `'X-Atlassian-Token': 'no-check'` to each request header */
	noCheckAtlassianToken: boolean().optional(),
	baseRequestConfig: any().optional(),
	authentication: union([object({ basic: BasicAuthSchema }), object({ oauth2: OAuth2Schema })]).optional(),
	middlewares: MiddlewaresSchema.optional()
}).strict();
//#endregion
//#region node_modules/jira.js/dist/esm/services/authenticationService/base64Encoder.mjs
/** @copyright The code was taken from the portal http://www.webtoolkit.info/javascript-base64.html */
var base64Sequence = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var utf8Encode = (value) => {
	value = value.replace(/\r\n/g, "\n");
	let utftext = "";
	for (let n = 0; n < value.length; n++) {
		const c = value.charCodeAt(n);
		if (c < 128) utftext += String.fromCharCode(c);
		else if (c > 127 && c < 2048) {
			utftext += String.fromCharCode(c >> 6 | 192);
			utftext += String.fromCharCode(c & 63 | 128);
		} else {
			utftext += String.fromCharCode(c >> 12 | 224);
			utftext += String.fromCharCode(c >> 6 & 63 | 128);
			utftext += String.fromCharCode(c & 63 | 128);
		}
	}
	return utftext;
};
var encode = (input) => {
	let output = "";
	let chr1;
	let chr2;
	let chr3;
	let enc1;
	let enc2;
	let enc3;
	let enc4;
	let i = 0;
	input = utf8Encode(input);
	while (i < input.length) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = (chr1 & 3) << 4 | chr2 >> 4;
		enc3 = (chr2 & 15) << 2 | chr3 >> 6;
		enc4 = chr3 & 63;
		if (isNaN(chr2)) enc3 = enc4 = 64;
		else if (isNaN(chr3)) enc4 = 64;
		output += `${base64Sequence.charAt(enc1)}${base64Sequence.charAt(enc2)}${base64Sequence.charAt(enc3)}${base64Sequence.charAt(enc4)}`;
	}
	return output;
};
//#endregion
//#region node_modules/jira.js/dist/esm/services/authenticationService/authentications/createBasicAuthenticationToken.mjs
function createBasicAuthenticationToken(authenticationData) {
	const login = authenticationData.email;
	const secret = authenticationData.apiToken;
	return `Basic ${encode(`${login}:${secret}`)}`;
}
//#endregion
//#region node_modules/jira.js/dist/esm/services/authenticationService/authentications/createOAuth2AuthenticationToken.mjs
function createOAuth2AuthenticationToken(authenticationData) {
	return `Bearer ${authenticationData.accessToken}`;
}
//#endregion
//#region node_modules/jira.js/dist/esm/services/authenticationService/getAuthenticationToken.mjs
async function getAuthenticationToken(authentication) {
	if (!authentication) return;
	if ("basic" in authentication) return createBasicAuthenticationToken(authentication.basic);
	return createOAuth2AuthenticationToken(authentication.oauth2);
}
//#endregion
//#region node_modules/jira.js/dist/esm/clients/httpException.mjs
var isUndefined = (obj) => typeof obj === "undefined";
var isNil = (val) => isUndefined(val) || val === null;
var isObject = (fn) => !isNil(fn) && typeof fn === "object";
var isString = (val) => typeof val === "string";
var isNumber = (val) => typeof val === "number";
var DEFAULT_EXCEPTION_MESSAGE = "Something went wrong";
var DEFAULT_EXCEPTION_CODE = "INTERNAL_SERVER_ERROR";
var DEFAULT_EXCEPTION_STATUS_TEXT = "Internal server error";
/** Defines the base HTTP exception, which is handled by the default Exceptions Handler. */
var HttpException = class extends Error {
	response;
	/**
	* Instantiate a plain HTTP Exception.
	*
	* @example
	*   throw new HttpException('message', HttpStatus.BAD_REQUEST);
	*   throw new HttpException('custom message', HttpStatus.BAD_REQUEST, {
	*     cause: new Error('Cause Error'),
	*   });
	*
	* @param response String, object describing the error condition or the error cause.
	* @param status HTTP response status code.
	* @param options An object used to add an error cause. Configures error chaining support
	* @usageNotes
	* The constructor arguments define the response and the HTTP response status code.
	* - The `response` argument (required) defines the JSON response body. alternatively, it can also be
	*  an error object that is used to define an error [cause](https://nodejs.org/en/blog/release/v16.9.0/#error-cause).
	* - The `status` argument (optional) defines the HTTP Status Code.
	* - The `options` argument (optional) defines additional error options. Currently, it supports the `cause` attribute,
	*  and can be used as an alternative way to specify the error cause: `const error = new HttpException('description', 400, { cause: new Error() });`
	*
	* By default, the JSON response body contains two properties:
	* - `statusCode`: the Http Status Code.
	* - `message`: a short description of the HTTP error by default; override this
	* by supplying a string in the `response` parameter.
	*
	* The `status` argument is required, and should be a valid HTTP status code.
	* Best practice is to use the `HttpStatus` enum imported from `nestjs/common`.
	* @see https://nodejs.org/en/blog/release/v16.9.0/#error-cause
	* @see https://github.com/microsoft/TypeScript/issues/45167
	*/
	constructor(response, status, options) {
		super();
		this.response = response;
		this.name = this.initName();
		this.cause = this.initCause(response, options);
		this.code = this.initCode(response);
		this.message = this.initMessage(response);
		this.status = this.initStatus(response, status);
		this.statusText = this.initStatusText(response, this.status);
	}
	cause;
	code;
	status;
	statusText;
	initMessage(response) {
		if (isString(response)) return response;
		if (isObject(response) && isString(response.message)) return response.message;
		if (this.constructor) return this.constructor.name.match(/[A-Z][a-z]+|[0-9]+/g)?.join(" ") ?? "Error";
		return DEFAULT_EXCEPTION_MESSAGE;
	}
	initCause(response, options) {
		if (options?.cause) return options.cause;
		if (isObject(response) && isObject(response.cause)) return response.cause;
	}
	initCode(response) {
		if (isObject(response) && isString(response.code)) return response.code;
		return DEFAULT_EXCEPTION_CODE;
	}
	initName() {
		return this.constructor.name;
	}
	initStatus(response, status) {
		if (status) return status;
		if (isObject(response) && isNumber(response.status)) return response.status;
		if (isObject(response) && isNumber(response.statusCode)) return response.statusCode;
		return 500;
	}
	initStatusText(response, status) {
		if (isObject(response) && isString(response.statusText)) return response.statusText;
		return status ? void 0 : DEFAULT_EXCEPTION_STATUS_TEXT;
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/clients/baseClient.mjs
var STRICT_GDPR_FLAG = "x-atlassian-force-account-id";
var ATLASSIAN_TOKEN_CHECK_FLAG = "X-Atlassian-Token";
var ATLASSIAN_TOKEN_CHECK_NOCHECK_VALUE = "no-check";
var BaseClient = class {
	config;
	instance;
	constructor(config) {
		this.config = config;
		try {
			this.config = ConfigSchema.parse(config);
		} catch (e) {
			if (e instanceof ZodError && e.issues[0].message === "Invalid URL") throw new Error("Couldn't parse the host URL. Perhaps you forgot to add 'http://' or 'https://' at the beginning of the URL?", e);
			throw e;
		}
		this.instance = axios.create({
			paramsSerializer: this.paramSerializer.bind(this),
			...config.baseRequestConfig,
			baseURL: config.host,
			headers: this.removeUndefinedProperties({
				[STRICT_GDPR_FLAG]: config.strictGDPR,
				[ATLASSIAN_TOKEN_CHECK_FLAG]: config.noCheckAtlassianToken ? ATLASSIAN_TOKEN_CHECK_NOCHECK_VALUE : void 0,
				...config.baseRequestConfig?.headers
			})
		});
	}
	paramSerializer(parameters) {
		const parts = [];
		Object.entries(parameters).forEach(([key, value]) => {
			if (value === null || typeof value === "undefined") return;
			if (Array.isArray(value)) value = value.join(",");
			if (value instanceof Date) value = value.toISOString();
			else if (value !== null && typeof value === "object") value = JSON.stringify(value);
			else if (value instanceof Function) {
				const part = value();
				return part && parts.push(part);
			}
			parts.push(`${this.encode(key)}=${this.encode(value)}`);
		});
		return parts.join("&");
	}
	encode(value) {
		return encodeURIComponent(value).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
	}
	removeUndefinedProperties(obj) {
		return Object.entries(obj).filter(([, value]) => typeof value !== "undefined").reduce((accumulator, [key, value]) => ({
			...accumulator,
			[key]: value
		}), {});
	}
	async sendRequest(requestConfig, callback) {
		try {
			const response = await this.sendRequestFullResponse(requestConfig);
			return this.handleSuccessResponse(response.data, callback);
		} catch (e) {
			return this.handleFailedResponse(e, callback);
		}
	}
	async sendRequestFullResponse(requestConfig) {
		const modifiedRequestConfig = {
			...requestConfig,
			headers: this.removeUndefinedProperties({
				Authorization: await getAuthenticationToken(this.config.authentication),
				...requestConfig.headers
			})
		};
		return this.instance.request(modifiedRequestConfig);
	}
	handleSuccessResponse(response, callback) {
		const callbackResponseHandler = callback && ((data) => callback(null, data));
		const defaultResponseHandler = (data) => data;
		const responseHandler = callbackResponseHandler ?? defaultResponseHandler;
		this.config.middlewares?.onResponse?.(response.data);
		return responseHandler(response);
	}
	handleFailedResponse(e, callback) {
		const err = this.buildErrorHandlingResponse(e);
		const callbackErrorHandler = callback && ((error) => callback(error));
		const defaultErrorHandler = (error) => {
			throw error;
		};
		const errorHandler = callbackErrorHandler ?? defaultErrorHandler;
		this.config.middlewares?.onError?.(err);
		return errorHandler(err);
	}
	buildErrorHandlingResponse(e) {
		if (axios.isAxiosError(e) && e.response) return new HttpException({
			code: e.code,
			message: e.message,
			data: e.response.data,
			status: e.response.status,
			statusText: e.response.statusText
		}, e.response.status, { cause: e });
		if (axios.isAxiosError(e)) return e;
		if (isObject(e) && isObject(e.response)) return new HttpException(e.response);
		if (e instanceof Error) return new HttpException(e);
		return new HttpException("Unknown error occurred.", 500, { cause: e });
	}
};
//#endregion
//#region node_modules/mime-db/db.json
var db_exports = /* @__PURE__ */ __exportAll({ default: () => db_default });
var db_default;
var init_db = __esmMin((() => {
	db_default = {
		"application/1d-interleaved-parityfec": { "source": "iana" },
		"application/3gpdash-qoe-report+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/3gpp-ims+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/3gpphal+json": {
			"source": "iana",
			"compressible": true
		},
		"application/3gpphalforms+json": {
			"source": "iana",
			"compressible": true
		},
		"application/a2l": { "source": "iana" },
		"application/ace+cbor": { "source": "iana" },
		"application/activemessage": { "source": "iana" },
		"application/activity+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-costmap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-costmapfilter+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-directory+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointcost+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointcostparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointprop+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointpropparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-error+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-networkmap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-networkmapfilter+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-updatestreamcontrol+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-updatestreamparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/aml": { "source": "iana" },
		"application/andrew-inset": {
			"source": "iana",
			"extensions": ["ez"]
		},
		"application/applefile": { "source": "iana" },
		"application/applixware": {
			"source": "apache",
			"extensions": ["aw"]
		},
		"application/at+jwt": { "source": "iana" },
		"application/atf": { "source": "iana" },
		"application/atfx": { "source": "iana" },
		"application/atom+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atom"]
		},
		"application/atomcat+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atomcat"]
		},
		"application/atomdeleted+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atomdeleted"]
		},
		"application/atomicmail": { "source": "iana" },
		"application/atomsvc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atomsvc"]
		},
		"application/atsc-dwd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dwd"]
		},
		"application/atsc-dynamic-event-message": { "source": "iana" },
		"application/atsc-held+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["held"]
		},
		"application/atsc-rdt+json": {
			"source": "iana",
			"compressible": true
		},
		"application/atsc-rsat+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rsat"]
		},
		"application/atxml": { "source": "iana" },
		"application/auth-policy+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/bacnet-xdd+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/batch-smtp": { "source": "iana" },
		"application/bdoc": {
			"compressible": false,
			"extensions": ["bdoc"]
		},
		"application/beep+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/calendar+json": {
			"source": "iana",
			"compressible": true
		},
		"application/calendar+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xcs"]
		},
		"application/call-completion": { "source": "iana" },
		"application/cals-1840": { "source": "iana" },
		"application/captive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/cbor": { "source": "iana" },
		"application/cbor-seq": { "source": "iana" },
		"application/cccex": { "source": "iana" },
		"application/ccmp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ccxml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ccxml"]
		},
		"application/cdfx+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["cdfx"]
		},
		"application/cdmi-capability": {
			"source": "iana",
			"extensions": ["cdmia"]
		},
		"application/cdmi-container": {
			"source": "iana",
			"extensions": ["cdmic"]
		},
		"application/cdmi-domain": {
			"source": "iana",
			"extensions": ["cdmid"]
		},
		"application/cdmi-object": {
			"source": "iana",
			"extensions": ["cdmio"]
		},
		"application/cdmi-queue": {
			"source": "iana",
			"extensions": ["cdmiq"]
		},
		"application/cdni": { "source": "iana" },
		"application/cea": { "source": "iana" },
		"application/cea-2018+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cellml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cfw": { "source": "iana" },
		"application/city+json": {
			"source": "iana",
			"compressible": true
		},
		"application/clr": { "source": "iana" },
		"application/clue+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/clue_info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cms": { "source": "iana" },
		"application/cnrp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/coap-group+json": {
			"source": "iana",
			"compressible": true
		},
		"application/coap-payload": { "source": "iana" },
		"application/commonground": { "source": "iana" },
		"application/conference-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cose": { "source": "iana" },
		"application/cose-key": { "source": "iana" },
		"application/cose-key-set": { "source": "iana" },
		"application/cpl+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["cpl"]
		},
		"application/csrattrs": { "source": "iana" },
		"application/csta+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cstadata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/csvm+json": {
			"source": "iana",
			"compressible": true
		},
		"application/cu-seeme": {
			"source": "apache",
			"extensions": ["cu"]
		},
		"application/cwt": { "source": "iana" },
		"application/cybercash": { "source": "iana" },
		"application/dart": { "compressible": true },
		"application/dash+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpd"]
		},
		"application/dash-patch+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpp"]
		},
		"application/dashdelta": { "source": "iana" },
		"application/davmount+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["davmount"]
		},
		"application/dca-rft": { "source": "iana" },
		"application/dcd": { "source": "iana" },
		"application/dec-dx": { "source": "iana" },
		"application/dialog-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/dicom": { "source": "iana" },
		"application/dicom+json": {
			"source": "iana",
			"compressible": true
		},
		"application/dicom+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/dii": { "source": "iana" },
		"application/dit": { "source": "iana" },
		"application/dns": { "source": "iana" },
		"application/dns+json": {
			"source": "iana",
			"compressible": true
		},
		"application/dns-message": { "source": "iana" },
		"application/docbook+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["dbk"]
		},
		"application/dots+cbor": { "source": "iana" },
		"application/dskpp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/dssc+der": {
			"source": "iana",
			"extensions": ["dssc"]
		},
		"application/dssc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xdssc"]
		},
		"application/dvcs": { "source": "iana" },
		"application/ecmascript": {
			"source": "iana",
			"compressible": true,
			"extensions": ["es", "ecma"]
		},
		"application/edi-consent": { "source": "iana" },
		"application/edi-x12": {
			"source": "iana",
			"compressible": false
		},
		"application/edifact": {
			"source": "iana",
			"compressible": false
		},
		"application/efi": { "source": "iana" },
		"application/elm+json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/elm+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.cap+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/emergencycalldata.comment+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.control+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.deviceinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.ecall.msd": { "source": "iana" },
		"application/emergencycalldata.providerinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.serviceinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.subscriberinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.veds+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emma+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["emma"]
		},
		"application/emotionml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["emotionml"]
		},
		"application/encaprtp": { "source": "iana" },
		"application/epp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/epub+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["epub"]
		},
		"application/eshop": { "source": "iana" },
		"application/exi": {
			"source": "iana",
			"extensions": ["exi"]
		},
		"application/expect-ct-report+json": {
			"source": "iana",
			"compressible": true
		},
		"application/express": {
			"source": "iana",
			"extensions": ["exp"]
		},
		"application/fastinfoset": { "source": "iana" },
		"application/fastsoap": { "source": "iana" },
		"application/fdt+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["fdt"]
		},
		"application/fhir+json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/fhir+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/fido.trusted-apps+json": { "compressible": true },
		"application/fits": { "source": "iana" },
		"application/flexfec": { "source": "iana" },
		"application/font-sfnt": { "source": "iana" },
		"application/font-tdpfr": {
			"source": "iana",
			"extensions": ["pfr"]
		},
		"application/font-woff": {
			"source": "iana",
			"compressible": false
		},
		"application/framework-attributes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/geo+json": {
			"source": "iana",
			"compressible": true,
			"extensions": ["geojson"]
		},
		"application/geo+json-seq": { "source": "iana" },
		"application/geopackage+sqlite3": { "source": "iana" },
		"application/geoxacml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/gltf-buffer": { "source": "iana" },
		"application/gml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["gml"]
		},
		"application/gpx+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["gpx"]
		},
		"application/gxf": {
			"source": "apache",
			"extensions": ["gxf"]
		},
		"application/gzip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["gz"]
		},
		"application/h224": { "source": "iana" },
		"application/held+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/hjson": { "extensions": ["hjson"] },
		"application/http": { "source": "iana" },
		"application/hyperstudio": {
			"source": "iana",
			"extensions": ["stk"]
		},
		"application/ibe-key-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ibe-pkg-reply+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ibe-pp-data": { "source": "iana" },
		"application/iges": { "source": "iana" },
		"application/im-iscomposing+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/index": { "source": "iana" },
		"application/index.cmd": { "source": "iana" },
		"application/index.obj": { "source": "iana" },
		"application/index.response": { "source": "iana" },
		"application/index.vnd": { "source": "iana" },
		"application/inkml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ink", "inkml"]
		},
		"application/iotp": { "source": "iana" },
		"application/ipfix": {
			"source": "iana",
			"extensions": ["ipfix"]
		},
		"application/ipp": { "source": "iana" },
		"application/isup": { "source": "iana" },
		"application/its+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["its"]
		},
		"application/java-archive": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"jar",
				"war",
				"ear"
			]
		},
		"application/java-serialized-object": {
			"source": "apache",
			"compressible": false,
			"extensions": ["ser"]
		},
		"application/java-vm": {
			"source": "apache",
			"compressible": false,
			"extensions": ["class"]
		},
		"application/javascript": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["js", "mjs"]
		},
		"application/jf2feed+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jose": { "source": "iana" },
		"application/jose+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jrd+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jscalendar+json": {
			"source": "iana",
			"compressible": true
		},
		"application/json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["json", "map"]
		},
		"application/json-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/json-seq": { "source": "iana" },
		"application/json5": { "extensions": ["json5"] },
		"application/jsonml+json": {
			"source": "apache",
			"compressible": true,
			"extensions": ["jsonml"]
		},
		"application/jwk+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jwk-set+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jwt": { "source": "iana" },
		"application/kpml-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/kpml-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ld+json": {
			"source": "iana",
			"compressible": true,
			"extensions": ["jsonld"]
		},
		"application/lgr+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lgr"]
		},
		"application/link-format": { "source": "iana" },
		"application/load-control+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/lost+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lostxml"]
		},
		"application/lostsync+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/lpf+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/lxf": { "source": "iana" },
		"application/mac-binhex40": {
			"source": "iana",
			"extensions": ["hqx"]
		},
		"application/mac-compactpro": {
			"source": "apache",
			"extensions": ["cpt"]
		},
		"application/macwriteii": { "source": "iana" },
		"application/mads+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mads"]
		},
		"application/manifest+json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["webmanifest"]
		},
		"application/marc": {
			"source": "iana",
			"extensions": ["mrc"]
		},
		"application/marcxml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mrcx"]
		},
		"application/mathematica": {
			"source": "iana",
			"extensions": [
				"ma",
				"nb",
				"mb"
			]
		},
		"application/mathml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mathml"]
		},
		"application/mathml-content+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mathml-presentation+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-associated-procedure-description+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-deregister+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-envelope+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-msk+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-msk-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-protection-description+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-reception-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-register+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-register-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-schedule+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-user-service-description+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbox": {
			"source": "iana",
			"extensions": ["mbox"]
		},
		"application/media-policy-dataset+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpf"]
		},
		"application/media_control+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mediaservercontrol+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mscml"]
		},
		"application/merge-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/metalink+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["metalink"]
		},
		"application/metalink4+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["meta4"]
		},
		"application/mets+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mets"]
		},
		"application/mf4": { "source": "iana" },
		"application/mikey": { "source": "iana" },
		"application/mipc": { "source": "iana" },
		"application/missing-blocks+cbor-seq": { "source": "iana" },
		"application/mmt-aei+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["maei"]
		},
		"application/mmt-usd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["musd"]
		},
		"application/mods+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mods"]
		},
		"application/moss-keys": { "source": "iana" },
		"application/moss-signature": { "source": "iana" },
		"application/mosskey-data": { "source": "iana" },
		"application/mosskey-request": { "source": "iana" },
		"application/mp21": {
			"source": "iana",
			"extensions": ["m21", "mp21"]
		},
		"application/mp4": {
			"source": "iana",
			"extensions": ["mp4s", "m4p"]
		},
		"application/mpeg4-generic": { "source": "iana" },
		"application/mpeg4-iod": { "source": "iana" },
		"application/mpeg4-iod-xmt": { "source": "iana" },
		"application/mrb-consumer+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mrb-publish+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/msc-ivr+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/msc-mixer+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/msword": {
			"source": "iana",
			"compressible": false,
			"extensions": ["doc", "dot"]
		},
		"application/mud+json": {
			"source": "iana",
			"compressible": true
		},
		"application/multipart-core": { "source": "iana" },
		"application/mxf": {
			"source": "iana",
			"extensions": ["mxf"]
		},
		"application/n-quads": {
			"source": "iana",
			"extensions": ["nq"]
		},
		"application/n-triples": {
			"source": "iana",
			"extensions": ["nt"]
		},
		"application/nasdata": { "source": "iana" },
		"application/news-checkgroups": {
			"source": "iana",
			"charset": "US-ASCII"
		},
		"application/news-groupinfo": {
			"source": "iana",
			"charset": "US-ASCII"
		},
		"application/news-transmission": { "source": "iana" },
		"application/nlsml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/node": {
			"source": "iana",
			"extensions": ["cjs"]
		},
		"application/nss": { "source": "iana" },
		"application/oauth-authz-req+jwt": { "source": "iana" },
		"application/oblivious-dns-message": { "source": "iana" },
		"application/ocsp-request": { "source": "iana" },
		"application/ocsp-response": { "source": "iana" },
		"application/octet-stream": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"bin",
				"dms",
				"lrf",
				"mar",
				"so",
				"dist",
				"distz",
				"pkg",
				"bpk",
				"dump",
				"elc",
				"deploy",
				"exe",
				"dll",
				"deb",
				"dmg",
				"iso",
				"img",
				"msi",
				"msp",
				"msm",
				"buffer"
			]
		},
		"application/oda": {
			"source": "iana",
			"extensions": ["oda"]
		},
		"application/odm+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/odx": { "source": "iana" },
		"application/oebps-package+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["opf"]
		},
		"application/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": ["ogx"]
		},
		"application/omdoc+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["omdoc"]
		},
		"application/onenote": {
			"source": "apache",
			"extensions": [
				"onetoc",
				"onetoc2",
				"onetmp",
				"onepkg"
			]
		},
		"application/opc-nodeset+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/oscore": { "source": "iana" },
		"application/oxps": {
			"source": "iana",
			"extensions": ["oxps"]
		},
		"application/p21": { "source": "iana" },
		"application/p21+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/p2p-overlay+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["relo"]
		},
		"application/parityfec": { "source": "iana" },
		"application/passport": { "source": "iana" },
		"application/patch-ops-error+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xer"]
		},
		"application/pdf": {
			"source": "iana",
			"compressible": false,
			"extensions": ["pdf"]
		},
		"application/pdx": { "source": "iana" },
		"application/pem-certificate-chain": { "source": "iana" },
		"application/pgp-encrypted": {
			"source": "iana",
			"compressible": false,
			"extensions": ["pgp"]
		},
		"application/pgp-keys": {
			"source": "iana",
			"extensions": ["asc"]
		},
		"application/pgp-signature": {
			"source": "iana",
			"extensions": ["asc", "sig"]
		},
		"application/pics-rules": {
			"source": "apache",
			"extensions": ["prf"]
		},
		"application/pidf+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/pidf-diff+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/pkcs10": {
			"source": "iana",
			"extensions": ["p10"]
		},
		"application/pkcs12": { "source": "iana" },
		"application/pkcs7-mime": {
			"source": "iana",
			"extensions": ["p7m", "p7c"]
		},
		"application/pkcs7-signature": {
			"source": "iana",
			"extensions": ["p7s"]
		},
		"application/pkcs8": {
			"source": "iana",
			"extensions": ["p8"]
		},
		"application/pkcs8-encrypted": { "source": "iana" },
		"application/pkix-attr-cert": {
			"source": "iana",
			"extensions": ["ac"]
		},
		"application/pkix-cert": {
			"source": "iana",
			"extensions": ["cer"]
		},
		"application/pkix-crl": {
			"source": "iana",
			"extensions": ["crl"]
		},
		"application/pkix-pkipath": {
			"source": "iana",
			"extensions": ["pkipath"]
		},
		"application/pkixcmp": {
			"source": "iana",
			"extensions": ["pki"]
		},
		"application/pls+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["pls"]
		},
		"application/poc-settings+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/postscript": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"ai",
				"eps",
				"ps"
			]
		},
		"application/ppsp-tracker+json": {
			"source": "iana",
			"compressible": true
		},
		"application/problem+json": {
			"source": "iana",
			"compressible": true
		},
		"application/problem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/provenance+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["provx"]
		},
		"application/prs.alvestrand.titrax-sheet": { "source": "iana" },
		"application/prs.cww": {
			"source": "iana",
			"extensions": ["cww"]
		},
		"application/prs.cyn": {
			"source": "iana",
			"charset": "7-BIT"
		},
		"application/prs.hpub+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/prs.nprend": { "source": "iana" },
		"application/prs.plucker": { "source": "iana" },
		"application/prs.rdf-xml-crypt": { "source": "iana" },
		"application/prs.xsf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/pskc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["pskcxml"]
		},
		"application/pvd+json": {
			"source": "iana",
			"compressible": true
		},
		"application/qsig": { "source": "iana" },
		"application/raml+yaml": {
			"compressible": true,
			"extensions": ["raml"]
		},
		"application/raptorfec": { "source": "iana" },
		"application/rdap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/rdf+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rdf", "owl"]
		},
		"application/reginfo+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rif"]
		},
		"application/relax-ng-compact-syntax": {
			"source": "iana",
			"extensions": ["rnc"]
		},
		"application/remote-printing": { "source": "iana" },
		"application/reputon+json": {
			"source": "iana",
			"compressible": true
		},
		"application/resource-lists+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rl"]
		},
		"application/resource-lists-diff+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rld"]
		},
		"application/rfc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/riscos": { "source": "iana" },
		"application/rlmi+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/rls-services+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rs"]
		},
		"application/route-apd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rapd"]
		},
		"application/route-s-tsid+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sls"]
		},
		"application/route-usd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rusd"]
		},
		"application/rpki-ghostbusters": {
			"source": "iana",
			"extensions": ["gbr"]
		},
		"application/rpki-manifest": {
			"source": "iana",
			"extensions": ["mft"]
		},
		"application/rpki-publication": { "source": "iana" },
		"application/rpki-roa": {
			"source": "iana",
			"extensions": ["roa"]
		},
		"application/rpki-updown": { "source": "iana" },
		"application/rsd+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["rsd"]
		},
		"application/rss+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["rss"]
		},
		"application/rtf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rtf"]
		},
		"application/rtploopback": { "source": "iana" },
		"application/rtx": { "source": "iana" },
		"application/samlassertion+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/samlmetadata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sarif+json": {
			"source": "iana",
			"compressible": true
		},
		"application/sarif-external-properties+json": {
			"source": "iana",
			"compressible": true
		},
		"application/sbe": { "source": "iana" },
		"application/sbml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sbml"]
		},
		"application/scaip+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/scim+json": {
			"source": "iana",
			"compressible": true
		},
		"application/scvp-cv-request": {
			"source": "iana",
			"extensions": ["scq"]
		},
		"application/scvp-cv-response": {
			"source": "iana",
			"extensions": ["scs"]
		},
		"application/scvp-vp-request": {
			"source": "iana",
			"extensions": ["spq"]
		},
		"application/scvp-vp-response": {
			"source": "iana",
			"extensions": ["spp"]
		},
		"application/sdp": {
			"source": "iana",
			"extensions": ["sdp"]
		},
		"application/secevent+jwt": { "source": "iana" },
		"application/senml+cbor": { "source": "iana" },
		"application/senml+json": {
			"source": "iana",
			"compressible": true
		},
		"application/senml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["senmlx"]
		},
		"application/senml-etch+cbor": { "source": "iana" },
		"application/senml-etch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/senml-exi": { "source": "iana" },
		"application/sensml+cbor": { "source": "iana" },
		"application/sensml+json": {
			"source": "iana",
			"compressible": true
		},
		"application/sensml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sensmlx"]
		},
		"application/sensml-exi": { "source": "iana" },
		"application/sep+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sep-exi": { "source": "iana" },
		"application/session-info": { "source": "iana" },
		"application/set-payment": { "source": "iana" },
		"application/set-payment-initiation": {
			"source": "iana",
			"extensions": ["setpay"]
		},
		"application/set-registration": { "source": "iana" },
		"application/set-registration-initiation": {
			"source": "iana",
			"extensions": ["setreg"]
		},
		"application/sgml": { "source": "iana" },
		"application/sgml-open-catalog": { "source": "iana" },
		"application/shf+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["shf"]
		},
		"application/sieve": {
			"source": "iana",
			"extensions": ["siv", "sieve"]
		},
		"application/simple-filter+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/simple-message-summary": { "source": "iana" },
		"application/simplesymbolcontainer": { "source": "iana" },
		"application/sipc": { "source": "iana" },
		"application/slate": { "source": "iana" },
		"application/smil": { "source": "iana" },
		"application/smil+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["smi", "smil"]
		},
		"application/smpte336m": { "source": "iana" },
		"application/soap+fastinfoset": { "source": "iana" },
		"application/soap+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sparql-query": {
			"source": "iana",
			"extensions": ["rq"]
		},
		"application/sparql-results+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["srx"]
		},
		"application/spdx+json": {
			"source": "iana",
			"compressible": true
		},
		"application/spirits-event+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sql": { "source": "iana" },
		"application/srgs": {
			"source": "iana",
			"extensions": ["gram"]
		},
		"application/srgs+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["grxml"]
		},
		"application/sru+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sru"]
		},
		"application/ssdl+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["ssdl"]
		},
		"application/ssml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ssml"]
		},
		"application/stix+json": {
			"source": "iana",
			"compressible": true
		},
		"application/swid+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["swidtag"]
		},
		"application/tamp-apex-update": { "source": "iana" },
		"application/tamp-apex-update-confirm": { "source": "iana" },
		"application/tamp-community-update": { "source": "iana" },
		"application/tamp-community-update-confirm": { "source": "iana" },
		"application/tamp-error": { "source": "iana" },
		"application/tamp-sequence-adjust": { "source": "iana" },
		"application/tamp-sequence-adjust-confirm": { "source": "iana" },
		"application/tamp-status-query": { "source": "iana" },
		"application/tamp-status-response": { "source": "iana" },
		"application/tamp-update": { "source": "iana" },
		"application/tamp-update-confirm": { "source": "iana" },
		"application/tar": { "compressible": true },
		"application/taxii+json": {
			"source": "iana",
			"compressible": true
		},
		"application/td+json": {
			"source": "iana",
			"compressible": true
		},
		"application/tei+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["tei", "teicorpus"]
		},
		"application/tetra_isi": { "source": "iana" },
		"application/thraud+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["tfi"]
		},
		"application/timestamp-query": { "source": "iana" },
		"application/timestamp-reply": { "source": "iana" },
		"application/timestamped-data": {
			"source": "iana",
			"extensions": ["tsd"]
		},
		"application/tlsrpt+gzip": { "source": "iana" },
		"application/tlsrpt+json": {
			"source": "iana",
			"compressible": true
		},
		"application/tnauthlist": { "source": "iana" },
		"application/token-introspection+jwt": { "source": "iana" },
		"application/toml": {
			"compressible": true,
			"extensions": ["toml"]
		},
		"application/trickle-ice-sdpfrag": { "source": "iana" },
		"application/trig": {
			"source": "iana",
			"extensions": ["trig"]
		},
		"application/ttml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ttml"]
		},
		"application/tve-trigger": { "source": "iana" },
		"application/tzif": { "source": "iana" },
		"application/tzif-leap": { "source": "iana" },
		"application/ubjson": {
			"compressible": false,
			"extensions": ["ubj"]
		},
		"application/ulpfec": { "source": "iana" },
		"application/urc-grpsheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/urc-ressheet+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rsheet"]
		},
		"application/urc-targetdesc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["td"]
		},
		"application/urc-uisocketdesc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vcard+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vcard+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vemmi": { "source": "iana" },
		"application/vividence.scriptfile": { "source": "apache" },
		"application/vnd.1000minds.decision-model+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["1km"]
		},
		"application/vnd.3gpp-prose+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp-prose-pc3ch+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp-v2x-local-service-information": { "source": "iana" },
		"application/vnd.3gpp.5gnas": { "source": "iana" },
		"application/vnd.3gpp.access-transfer-events+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.bsf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.gmop+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.gtpc": { "source": "iana" },
		"application/vnd.3gpp.interworking-data": { "source": "iana" },
		"application/vnd.3gpp.lpp": { "source": "iana" },
		"application/vnd.3gpp.mc-signalling-ear": { "source": "iana" },
		"application/vnd.3gpp.mcdata-affiliation-command+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-payload": { "source": "iana" },
		"application/vnd.3gpp.mcdata-service-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-signalling": { "source": "iana" },
		"application/vnd.3gpp.mcdata-ue-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-user-profile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-affiliation-command+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-floor-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-location-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-service-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-signed+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-ue-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-ue-init-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-user-profile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-affiliation-command+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-affiliation-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-location-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-service-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-transmission-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-ue-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-user-profile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mid-call+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.ngap": { "source": "iana" },
		"application/vnd.3gpp.pfcp": { "source": "iana" },
		"application/vnd.3gpp.pic-bw-large": {
			"source": "iana",
			"extensions": ["plb"]
		},
		"application/vnd.3gpp.pic-bw-small": {
			"source": "iana",
			"extensions": ["psb"]
		},
		"application/vnd.3gpp.pic-bw-var": {
			"source": "iana",
			"extensions": ["pvb"]
		},
		"application/vnd.3gpp.s1ap": { "source": "iana" },
		"application/vnd.3gpp.sms": { "source": "iana" },
		"application/vnd.3gpp.sms+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.srvcc-ext+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.srvcc-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.state-and-event-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.ussd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp2.bcmcsinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp2.sms": { "source": "iana" },
		"application/vnd.3gpp2.tcap": {
			"source": "iana",
			"extensions": ["tcap"]
		},
		"application/vnd.3lightssoftware.imagescal": { "source": "iana" },
		"application/vnd.3m.post-it-notes": {
			"source": "iana",
			"extensions": ["pwn"]
		},
		"application/vnd.accpac.simply.aso": {
			"source": "iana",
			"extensions": ["aso"]
		},
		"application/vnd.accpac.simply.imp": {
			"source": "iana",
			"extensions": ["imp"]
		},
		"application/vnd.acucobol": {
			"source": "iana",
			"extensions": ["acu"]
		},
		"application/vnd.acucorp": {
			"source": "iana",
			"extensions": ["atc", "acutc"]
		},
		"application/vnd.adobe.air-application-installer-package+zip": {
			"source": "apache",
			"compressible": false,
			"extensions": ["air"]
		},
		"application/vnd.adobe.flash.movie": { "source": "iana" },
		"application/vnd.adobe.formscentral.fcdt": {
			"source": "iana",
			"extensions": ["fcdt"]
		},
		"application/vnd.adobe.fxp": {
			"source": "iana",
			"extensions": ["fxp", "fxpl"]
		},
		"application/vnd.adobe.partial-upload": { "source": "iana" },
		"application/vnd.adobe.xdp+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xdp"]
		},
		"application/vnd.adobe.xfdf": {
			"source": "iana",
			"extensions": ["xfdf"]
		},
		"application/vnd.aether.imp": { "source": "iana" },
		"application/vnd.afpc.afplinedata": { "source": "iana" },
		"application/vnd.afpc.afplinedata-pagedef": { "source": "iana" },
		"application/vnd.afpc.cmoca-cmresource": { "source": "iana" },
		"application/vnd.afpc.foca-charset": { "source": "iana" },
		"application/vnd.afpc.foca-codedfont": { "source": "iana" },
		"application/vnd.afpc.foca-codepage": { "source": "iana" },
		"application/vnd.afpc.modca": { "source": "iana" },
		"application/vnd.afpc.modca-cmtable": { "source": "iana" },
		"application/vnd.afpc.modca-formdef": { "source": "iana" },
		"application/vnd.afpc.modca-mediummap": { "source": "iana" },
		"application/vnd.afpc.modca-objectcontainer": { "source": "iana" },
		"application/vnd.afpc.modca-overlay": { "source": "iana" },
		"application/vnd.afpc.modca-pagesegment": { "source": "iana" },
		"application/vnd.age": {
			"source": "iana",
			"extensions": ["age"]
		},
		"application/vnd.ah-barcode": { "source": "iana" },
		"application/vnd.ahead.space": {
			"source": "iana",
			"extensions": ["ahead"]
		},
		"application/vnd.airzip.filesecure.azf": {
			"source": "iana",
			"extensions": ["azf"]
		},
		"application/vnd.airzip.filesecure.azs": {
			"source": "iana",
			"extensions": ["azs"]
		},
		"application/vnd.amadeus+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.amazon.ebook": {
			"source": "apache",
			"extensions": ["azw"]
		},
		"application/vnd.amazon.mobi8-ebook": { "source": "iana" },
		"application/vnd.americandynamics.acc": {
			"source": "iana",
			"extensions": ["acc"]
		},
		"application/vnd.amiga.ami": {
			"source": "iana",
			"extensions": ["ami"]
		},
		"application/vnd.amundsen.maze+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.android.ota": { "source": "iana" },
		"application/vnd.android.package-archive": {
			"source": "apache",
			"compressible": false,
			"extensions": ["apk"]
		},
		"application/vnd.anki": { "source": "iana" },
		"application/vnd.anser-web-certificate-issue-initiation": {
			"source": "iana",
			"extensions": ["cii"]
		},
		"application/vnd.anser-web-funds-transfer-initiation": {
			"source": "apache",
			"extensions": ["fti"]
		},
		"application/vnd.antix.game-component": {
			"source": "iana",
			"extensions": ["atx"]
		},
		"application/vnd.apache.arrow.file": { "source": "iana" },
		"application/vnd.apache.arrow.stream": { "source": "iana" },
		"application/vnd.apache.thrift.binary": { "source": "iana" },
		"application/vnd.apache.thrift.compact": { "source": "iana" },
		"application/vnd.apache.thrift.json": { "source": "iana" },
		"application/vnd.api+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.aplextor.warrp+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.apothekende.reservation+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.apple.installer+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpkg"]
		},
		"application/vnd.apple.keynote": {
			"source": "iana",
			"extensions": ["key"]
		},
		"application/vnd.apple.mpegurl": {
			"source": "iana",
			"extensions": ["m3u8"]
		},
		"application/vnd.apple.numbers": {
			"source": "iana",
			"extensions": ["numbers"]
		},
		"application/vnd.apple.pages": {
			"source": "iana",
			"extensions": ["pages"]
		},
		"application/vnd.apple.pkpass": {
			"compressible": false,
			"extensions": ["pkpass"]
		},
		"application/vnd.arastra.swi": { "source": "iana" },
		"application/vnd.aristanetworks.swi": {
			"source": "iana",
			"extensions": ["swi"]
		},
		"application/vnd.artisan+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.artsquare": { "source": "iana" },
		"application/vnd.astraea-software.iota": {
			"source": "iana",
			"extensions": ["iota"]
		},
		"application/vnd.audiograph": {
			"source": "iana",
			"extensions": ["aep"]
		},
		"application/vnd.autopackage": { "source": "iana" },
		"application/vnd.avalon+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.avistar+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.balsamiq.bmml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["bmml"]
		},
		"application/vnd.balsamiq.bmpr": { "source": "iana" },
		"application/vnd.banana-accounting": { "source": "iana" },
		"application/vnd.bbf.usp.error": { "source": "iana" },
		"application/vnd.bbf.usp.msg": { "source": "iana" },
		"application/vnd.bbf.usp.msg+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.bekitzur-stech+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.bint.med-content": { "source": "iana" },
		"application/vnd.biopax.rdf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.blink-idb-value-wrapper": { "source": "iana" },
		"application/vnd.blueice.multipass": {
			"source": "iana",
			"extensions": ["mpm"]
		},
		"application/vnd.bluetooth.ep.oob": { "source": "iana" },
		"application/vnd.bluetooth.le.oob": { "source": "iana" },
		"application/vnd.bmi": {
			"source": "iana",
			"extensions": ["bmi"]
		},
		"application/vnd.bpf": { "source": "iana" },
		"application/vnd.bpf3": { "source": "iana" },
		"application/vnd.businessobjects": {
			"source": "iana",
			"extensions": ["rep"]
		},
		"application/vnd.byu.uapi+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cab-jscript": { "source": "iana" },
		"application/vnd.canon-cpdl": { "source": "iana" },
		"application/vnd.canon-lips": { "source": "iana" },
		"application/vnd.capasystems-pg+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cendio.thinlinc.clientconf": { "source": "iana" },
		"application/vnd.century-systems.tcp_stream": { "source": "iana" },
		"application/vnd.chemdraw+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["cdxml"]
		},
		"application/vnd.chess-pgn": { "source": "iana" },
		"application/vnd.chipnuts.karaoke-mmd": {
			"source": "iana",
			"extensions": ["mmd"]
		},
		"application/vnd.ciedi": { "source": "iana" },
		"application/vnd.cinderella": {
			"source": "iana",
			"extensions": ["cdy"]
		},
		"application/vnd.cirpack.isdn-ext": { "source": "iana" },
		"application/vnd.citationstyles.style+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["csl"]
		},
		"application/vnd.claymore": {
			"source": "iana",
			"extensions": ["cla"]
		},
		"application/vnd.cloanto.rp9": {
			"source": "iana",
			"extensions": ["rp9"]
		},
		"application/vnd.clonk.c4group": {
			"source": "iana",
			"extensions": [
				"c4g",
				"c4d",
				"c4f",
				"c4p",
				"c4u"
			]
		},
		"application/vnd.cluetrust.cartomobile-config": {
			"source": "iana",
			"extensions": ["c11amc"]
		},
		"application/vnd.cluetrust.cartomobile-config-pkg": {
			"source": "iana",
			"extensions": ["c11amz"]
		},
		"application/vnd.coffeescript": { "source": "iana" },
		"application/vnd.collabio.xodocuments.document": { "source": "iana" },
		"application/vnd.collabio.xodocuments.document-template": { "source": "iana" },
		"application/vnd.collabio.xodocuments.presentation": { "source": "iana" },
		"application/vnd.collabio.xodocuments.presentation-template": { "source": "iana" },
		"application/vnd.collabio.xodocuments.spreadsheet": { "source": "iana" },
		"application/vnd.collabio.xodocuments.spreadsheet-template": { "source": "iana" },
		"application/vnd.collection+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.collection.doc+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.collection.next+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.comicbook+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.comicbook-rar": { "source": "iana" },
		"application/vnd.commerce-battelle": { "source": "iana" },
		"application/vnd.commonspace": {
			"source": "iana",
			"extensions": ["csp"]
		},
		"application/vnd.contact.cmsg": {
			"source": "iana",
			"extensions": ["cdbcmsg"]
		},
		"application/vnd.coreos.ignition+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cosmocaller": {
			"source": "iana",
			"extensions": ["cmc"]
		},
		"application/vnd.crick.clicker": {
			"source": "iana",
			"extensions": ["clkx"]
		},
		"application/vnd.crick.clicker.keyboard": {
			"source": "iana",
			"extensions": ["clkk"]
		},
		"application/vnd.crick.clicker.palette": {
			"source": "iana",
			"extensions": ["clkp"]
		},
		"application/vnd.crick.clicker.template": {
			"source": "iana",
			"extensions": ["clkt"]
		},
		"application/vnd.crick.clicker.wordbank": {
			"source": "iana",
			"extensions": ["clkw"]
		},
		"application/vnd.criticaltools.wbs+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wbs"]
		},
		"application/vnd.cryptii.pipe+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.crypto-shade-file": { "source": "iana" },
		"application/vnd.cryptomator.encrypted": { "source": "iana" },
		"application/vnd.cryptomator.vault": { "source": "iana" },
		"application/vnd.ctc-posml": {
			"source": "iana",
			"extensions": ["pml"]
		},
		"application/vnd.ctct.ws+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cups-pdf": { "source": "iana" },
		"application/vnd.cups-postscript": { "source": "iana" },
		"application/vnd.cups-ppd": {
			"source": "iana",
			"extensions": ["ppd"]
		},
		"application/vnd.cups-raster": { "source": "iana" },
		"application/vnd.cups-raw": { "source": "iana" },
		"application/vnd.curl": { "source": "iana" },
		"application/vnd.curl.car": {
			"source": "apache",
			"extensions": ["car"]
		},
		"application/vnd.curl.pcurl": {
			"source": "apache",
			"extensions": ["pcurl"]
		},
		"application/vnd.cyan.dean.root+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cybank": { "source": "iana" },
		"application/vnd.cyclonedx+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cyclonedx+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.d2l.coursepackage1p0+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.d3m-dataset": { "source": "iana" },
		"application/vnd.d3m-problem": { "source": "iana" },
		"application/vnd.dart": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dart"]
		},
		"application/vnd.data-vision.rdz": {
			"source": "iana",
			"extensions": ["rdz"]
		},
		"application/vnd.datapackage+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dataresource+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dbf": {
			"source": "iana",
			"extensions": ["dbf"]
		},
		"application/vnd.debian.binary-package": { "source": "iana" },
		"application/vnd.dece.data": {
			"source": "iana",
			"extensions": [
				"uvf",
				"uvvf",
				"uvd",
				"uvvd"
			]
		},
		"application/vnd.dece.ttml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["uvt", "uvvt"]
		},
		"application/vnd.dece.unspecified": {
			"source": "iana",
			"extensions": ["uvx", "uvvx"]
		},
		"application/vnd.dece.zip": {
			"source": "iana",
			"extensions": ["uvz", "uvvz"]
		},
		"application/vnd.denovo.fcselayout-link": {
			"source": "iana",
			"extensions": ["fe_launch"]
		},
		"application/vnd.desmume.movie": { "source": "iana" },
		"application/vnd.dir-bi.plate-dl-nosuffix": { "source": "iana" },
		"application/vnd.dm.delegation+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dna": {
			"source": "iana",
			"extensions": ["dna"]
		},
		"application/vnd.document+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dolby.mlp": {
			"source": "apache",
			"extensions": ["mlp"]
		},
		"application/vnd.dolby.mobile.1": { "source": "iana" },
		"application/vnd.dolby.mobile.2": { "source": "iana" },
		"application/vnd.doremir.scorecloud-binary-document": { "source": "iana" },
		"application/vnd.dpgraph": {
			"source": "iana",
			"extensions": ["dpg"]
		},
		"application/vnd.dreamfactory": {
			"source": "iana",
			"extensions": ["dfac"]
		},
		"application/vnd.drive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ds-keypoint": {
			"source": "apache",
			"extensions": ["kpxx"]
		},
		"application/vnd.dtg.local": { "source": "iana" },
		"application/vnd.dtg.local.flash": { "source": "iana" },
		"application/vnd.dtg.local.html": { "source": "iana" },
		"application/vnd.dvb.ait": {
			"source": "iana",
			"extensions": ["ait"]
		},
		"application/vnd.dvb.dvbisl+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.dvbj": { "source": "iana" },
		"application/vnd.dvb.esgcontainer": { "source": "iana" },
		"application/vnd.dvb.ipdcdftnotifaccess": { "source": "iana" },
		"application/vnd.dvb.ipdcesgaccess": { "source": "iana" },
		"application/vnd.dvb.ipdcesgaccess2": { "source": "iana" },
		"application/vnd.dvb.ipdcesgpdd": { "source": "iana" },
		"application/vnd.dvb.ipdcroaming": { "source": "iana" },
		"application/vnd.dvb.iptv.alfec-base": { "source": "iana" },
		"application/vnd.dvb.iptv.alfec-enhancement": { "source": "iana" },
		"application/vnd.dvb.notif-aggregate-root+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-container+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-generic+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-ia-msglist+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-ia-registration-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-ia-registration-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-init+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.pfr": { "source": "iana" },
		"application/vnd.dvb.service": {
			"source": "iana",
			"extensions": ["svc"]
		},
		"application/vnd.dxr": { "source": "iana" },
		"application/vnd.dynageo": {
			"source": "iana",
			"extensions": ["geo"]
		},
		"application/vnd.dzr": { "source": "iana" },
		"application/vnd.easykaraoke.cdgdownload": { "source": "iana" },
		"application/vnd.ecdis-update": { "source": "iana" },
		"application/vnd.ecip.rlp": { "source": "iana" },
		"application/vnd.eclipse.ditto+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ecowin.chart": {
			"source": "iana",
			"extensions": ["mag"]
		},
		"application/vnd.ecowin.filerequest": { "source": "iana" },
		"application/vnd.ecowin.fileupdate": { "source": "iana" },
		"application/vnd.ecowin.series": { "source": "iana" },
		"application/vnd.ecowin.seriesrequest": { "source": "iana" },
		"application/vnd.ecowin.seriesupdate": { "source": "iana" },
		"application/vnd.efi.img": { "source": "iana" },
		"application/vnd.efi.iso": { "source": "iana" },
		"application/vnd.emclient.accessrequest+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.enliven": {
			"source": "iana",
			"extensions": ["nml"]
		},
		"application/vnd.enphase.envoy": { "source": "iana" },
		"application/vnd.eprints.data+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.epson.esf": {
			"source": "iana",
			"extensions": ["esf"]
		},
		"application/vnd.epson.msf": {
			"source": "iana",
			"extensions": ["msf"]
		},
		"application/vnd.epson.quickanime": {
			"source": "iana",
			"extensions": ["qam"]
		},
		"application/vnd.epson.salt": {
			"source": "iana",
			"extensions": ["slt"]
		},
		"application/vnd.epson.ssf": {
			"source": "iana",
			"extensions": ["ssf"]
		},
		"application/vnd.ericsson.quickcall": { "source": "iana" },
		"application/vnd.espass-espass+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.eszigno3+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["es3", "et3"]
		},
		"application/vnd.etsi.aoc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.asic-e+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.etsi.asic-s+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.etsi.cug+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvcommand+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvdiscovery+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsad-bc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsad-cod+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsad-npvr+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvservice+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsync+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvueprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.mcid+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.mheg5": { "source": "iana" },
		"application/vnd.etsi.overload-control-policy-dataset+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.pstn+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.sci+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.simservs+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.timestamp-token": { "source": "iana" },
		"application/vnd.etsi.tsl+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.tsl.der": { "source": "iana" },
		"application/vnd.eu.kasparian.car+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.eudora.data": { "source": "iana" },
		"application/vnd.evolv.ecig.profile": { "source": "iana" },
		"application/vnd.evolv.ecig.settings": { "source": "iana" },
		"application/vnd.evolv.ecig.theme": { "source": "iana" },
		"application/vnd.exstream-empower+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.exstream-package": { "source": "iana" },
		"application/vnd.ezpix-album": {
			"source": "iana",
			"extensions": ["ez2"]
		},
		"application/vnd.ezpix-package": {
			"source": "iana",
			"extensions": ["ez3"]
		},
		"application/vnd.f-secure.mobile": { "source": "iana" },
		"application/vnd.familysearch.gedcom+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.fastcopy-disk-image": { "source": "iana" },
		"application/vnd.fdf": {
			"source": "iana",
			"extensions": ["fdf"]
		},
		"application/vnd.fdsn.mseed": {
			"source": "iana",
			"extensions": ["mseed"]
		},
		"application/vnd.fdsn.seed": {
			"source": "iana",
			"extensions": ["seed", "dataless"]
		},
		"application/vnd.ffsns": { "source": "iana" },
		"application/vnd.ficlab.flb+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.filmit.zfc": { "source": "iana" },
		"application/vnd.fints": { "source": "iana" },
		"application/vnd.firemonkeys.cloudcell": { "source": "iana" },
		"application/vnd.flographit": {
			"source": "iana",
			"extensions": ["gph"]
		},
		"application/vnd.fluxtime.clip": {
			"source": "iana",
			"extensions": ["ftc"]
		},
		"application/vnd.font-fontforge-sfd": { "source": "iana" },
		"application/vnd.framemaker": {
			"source": "iana",
			"extensions": [
				"fm",
				"frame",
				"maker",
				"book"
			]
		},
		"application/vnd.frogans.fnc": {
			"source": "iana",
			"extensions": ["fnc"]
		},
		"application/vnd.frogans.ltf": {
			"source": "iana",
			"extensions": ["ltf"]
		},
		"application/vnd.fsc.weblaunch": {
			"source": "iana",
			"extensions": ["fsc"]
		},
		"application/vnd.fujifilm.fb.docuworks": { "source": "iana" },
		"application/vnd.fujifilm.fb.docuworks.binder": { "source": "iana" },
		"application/vnd.fujifilm.fb.docuworks.container": { "source": "iana" },
		"application/vnd.fujifilm.fb.jfi+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.fujitsu.oasys": {
			"source": "iana",
			"extensions": ["oas"]
		},
		"application/vnd.fujitsu.oasys2": {
			"source": "iana",
			"extensions": ["oa2"]
		},
		"application/vnd.fujitsu.oasys3": {
			"source": "iana",
			"extensions": ["oa3"]
		},
		"application/vnd.fujitsu.oasysgp": {
			"source": "iana",
			"extensions": ["fg5"]
		},
		"application/vnd.fujitsu.oasysprs": {
			"source": "iana",
			"extensions": ["bh2"]
		},
		"application/vnd.fujixerox.art-ex": { "source": "iana" },
		"application/vnd.fujixerox.art4": { "source": "iana" },
		"application/vnd.fujixerox.ddd": {
			"source": "iana",
			"extensions": ["ddd"]
		},
		"application/vnd.fujixerox.docuworks": {
			"source": "iana",
			"extensions": ["xdw"]
		},
		"application/vnd.fujixerox.docuworks.binder": {
			"source": "iana",
			"extensions": ["xbd"]
		},
		"application/vnd.fujixerox.docuworks.container": { "source": "iana" },
		"application/vnd.fujixerox.hbpl": { "source": "iana" },
		"application/vnd.fut-misnet": { "source": "iana" },
		"application/vnd.futoin+cbor": { "source": "iana" },
		"application/vnd.futoin+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.fuzzysheet": {
			"source": "iana",
			"extensions": ["fzs"]
		},
		"application/vnd.genomatix.tuxedo": {
			"source": "iana",
			"extensions": ["txd"]
		},
		"application/vnd.gentics.grd+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.geo+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.geocube+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.geogebra.file": {
			"source": "iana",
			"extensions": ["ggb"]
		},
		"application/vnd.geogebra.slides": { "source": "iana" },
		"application/vnd.geogebra.tool": {
			"source": "iana",
			"extensions": ["ggt"]
		},
		"application/vnd.geometry-explorer": {
			"source": "iana",
			"extensions": ["gex", "gre"]
		},
		"application/vnd.geonext": {
			"source": "iana",
			"extensions": ["gxt"]
		},
		"application/vnd.geoplan": {
			"source": "iana",
			"extensions": ["g2w"]
		},
		"application/vnd.geospace": {
			"source": "iana",
			"extensions": ["g3w"]
		},
		"application/vnd.gerber": { "source": "iana" },
		"application/vnd.globalplatform.card-content-mgt": { "source": "iana" },
		"application/vnd.globalplatform.card-content-mgt-response": { "source": "iana" },
		"application/vnd.gmx": {
			"source": "iana",
			"extensions": ["gmx"]
		},
		"application/vnd.google-apps.document": {
			"compressible": false,
			"extensions": ["gdoc"]
		},
		"application/vnd.google-apps.presentation": {
			"compressible": false,
			"extensions": ["gslides"]
		},
		"application/vnd.google-apps.spreadsheet": {
			"compressible": false,
			"extensions": ["gsheet"]
		},
		"application/vnd.google-earth.kml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["kml"]
		},
		"application/vnd.google-earth.kmz": {
			"source": "iana",
			"compressible": false,
			"extensions": ["kmz"]
		},
		"application/vnd.gov.sk.e-form+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.gov.sk.e-form+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.gov.sk.xmldatacontainer+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.grafeq": {
			"source": "iana",
			"extensions": ["gqf", "gqs"]
		},
		"application/vnd.gridmp": { "source": "iana" },
		"application/vnd.groove-account": {
			"source": "iana",
			"extensions": ["gac"]
		},
		"application/vnd.groove-help": {
			"source": "iana",
			"extensions": ["ghf"]
		},
		"application/vnd.groove-identity-message": {
			"source": "iana",
			"extensions": ["gim"]
		},
		"application/vnd.groove-injector": {
			"source": "iana",
			"extensions": ["grv"]
		},
		"application/vnd.groove-tool-message": {
			"source": "iana",
			"extensions": ["gtm"]
		},
		"application/vnd.groove-tool-template": {
			"source": "iana",
			"extensions": ["tpl"]
		},
		"application/vnd.groove-vcard": {
			"source": "iana",
			"extensions": ["vcg"]
		},
		"application/vnd.hal+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hal+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["hal"]
		},
		"application/vnd.handheld-entertainment+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["zmm"]
		},
		"application/vnd.hbci": {
			"source": "iana",
			"extensions": ["hbci"]
		},
		"application/vnd.hc+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hcl-bireports": { "source": "iana" },
		"application/vnd.hdt": { "source": "iana" },
		"application/vnd.heroku+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hhe.lesson-player": {
			"source": "iana",
			"extensions": ["les"]
		},
		"application/vnd.hl7cda+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.hl7v2+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.hp-hpgl": {
			"source": "iana",
			"extensions": ["hpgl"]
		},
		"application/vnd.hp-hpid": {
			"source": "iana",
			"extensions": ["hpid"]
		},
		"application/vnd.hp-hps": {
			"source": "iana",
			"extensions": ["hps"]
		},
		"application/vnd.hp-jlyt": {
			"source": "iana",
			"extensions": ["jlt"]
		},
		"application/vnd.hp-pcl": {
			"source": "iana",
			"extensions": ["pcl"]
		},
		"application/vnd.hp-pclxl": {
			"source": "iana",
			"extensions": ["pclxl"]
		},
		"application/vnd.httphone": { "source": "iana" },
		"application/vnd.hydrostatix.sof-data": {
			"source": "iana",
			"extensions": ["sfd-hdstx"]
		},
		"application/vnd.hyper+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hyper-item+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hyperdrive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hzn-3d-crossword": { "source": "iana" },
		"application/vnd.ibm.afplinedata": { "source": "iana" },
		"application/vnd.ibm.electronic-media": { "source": "iana" },
		"application/vnd.ibm.minipay": {
			"source": "iana",
			"extensions": ["mpy"]
		},
		"application/vnd.ibm.modcap": {
			"source": "iana",
			"extensions": [
				"afp",
				"listafp",
				"list3820"
			]
		},
		"application/vnd.ibm.rights-management": {
			"source": "iana",
			"extensions": ["irm"]
		},
		"application/vnd.ibm.secure-container": {
			"source": "iana",
			"extensions": ["sc"]
		},
		"application/vnd.iccprofile": {
			"source": "iana",
			"extensions": ["icc", "icm"]
		},
		"application/vnd.ieee.1905": { "source": "iana" },
		"application/vnd.igloader": {
			"source": "iana",
			"extensions": ["igl"]
		},
		"application/vnd.imagemeter.folder+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.imagemeter.image+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.immervision-ivp": {
			"source": "iana",
			"extensions": ["ivp"]
		},
		"application/vnd.immervision-ivu": {
			"source": "iana",
			"extensions": ["ivu"]
		},
		"application/vnd.ims.imsccv1p1": { "source": "iana" },
		"application/vnd.ims.imsccv1p2": { "source": "iana" },
		"application/vnd.ims.imsccv1p3": { "source": "iana" },
		"application/vnd.ims.lis.v2.result+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolproxy+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolproxy.id+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolsettings+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolsettings.simple+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.informedcontrol.rms+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.informix-visionary": { "source": "iana" },
		"application/vnd.infotech.project": { "source": "iana" },
		"application/vnd.infotech.project+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.innopath.wamp.notification": { "source": "iana" },
		"application/vnd.insors.igm": {
			"source": "iana",
			"extensions": ["igm"]
		},
		"application/vnd.intercon.formnet": {
			"source": "iana",
			"extensions": ["xpw", "xpx"]
		},
		"application/vnd.intergeo": {
			"source": "iana",
			"extensions": ["i2g"]
		},
		"application/vnd.intertrust.digibox": { "source": "iana" },
		"application/vnd.intertrust.nncp": { "source": "iana" },
		"application/vnd.intu.qbo": {
			"source": "iana",
			"extensions": ["qbo"]
		},
		"application/vnd.intu.qfx": {
			"source": "iana",
			"extensions": ["qfx"]
		},
		"application/vnd.iptc.g2.catalogitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.conceptitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.knowledgeitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.newsitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.newsmessage+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.packageitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.planningitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ipunplugged.rcprofile": {
			"source": "iana",
			"extensions": ["rcprofile"]
		},
		"application/vnd.irepository.package+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["irp"]
		},
		"application/vnd.is-xpr": {
			"source": "iana",
			"extensions": ["xpr"]
		},
		"application/vnd.isac.fcs": {
			"source": "iana",
			"extensions": ["fcs"]
		},
		"application/vnd.iso11783-10+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.jam": {
			"source": "iana",
			"extensions": ["jam"]
		},
		"application/vnd.japannet-directory-service": { "source": "iana" },
		"application/vnd.japannet-jpnstore-wakeup": { "source": "iana" },
		"application/vnd.japannet-payment-wakeup": { "source": "iana" },
		"application/vnd.japannet-registration": { "source": "iana" },
		"application/vnd.japannet-registration-wakeup": { "source": "iana" },
		"application/vnd.japannet-setstore-wakeup": { "source": "iana" },
		"application/vnd.japannet-verification": { "source": "iana" },
		"application/vnd.japannet-verification-wakeup": { "source": "iana" },
		"application/vnd.jcp.javame.midlet-rms": {
			"source": "iana",
			"extensions": ["rms"]
		},
		"application/vnd.jisp": {
			"source": "iana",
			"extensions": ["jisp"]
		},
		"application/vnd.joost.joda-archive": {
			"source": "iana",
			"extensions": ["joda"]
		},
		"application/vnd.jsk.isdn-ngn": { "source": "iana" },
		"application/vnd.kahootz": {
			"source": "iana",
			"extensions": ["ktz", "ktr"]
		},
		"application/vnd.kde.karbon": {
			"source": "iana",
			"extensions": ["karbon"]
		},
		"application/vnd.kde.kchart": {
			"source": "iana",
			"extensions": ["chrt"]
		},
		"application/vnd.kde.kformula": {
			"source": "iana",
			"extensions": ["kfo"]
		},
		"application/vnd.kde.kivio": {
			"source": "iana",
			"extensions": ["flw"]
		},
		"application/vnd.kde.kontour": {
			"source": "iana",
			"extensions": ["kon"]
		},
		"application/vnd.kde.kpresenter": {
			"source": "iana",
			"extensions": ["kpr", "kpt"]
		},
		"application/vnd.kde.kspread": {
			"source": "iana",
			"extensions": ["ksp"]
		},
		"application/vnd.kde.kword": {
			"source": "iana",
			"extensions": ["kwd", "kwt"]
		},
		"application/vnd.kenameaapp": {
			"source": "iana",
			"extensions": ["htke"]
		},
		"application/vnd.kidspiration": {
			"source": "iana",
			"extensions": ["kia"]
		},
		"application/vnd.kinar": {
			"source": "iana",
			"extensions": ["kne", "knp"]
		},
		"application/vnd.koan": {
			"source": "iana",
			"extensions": [
				"skp",
				"skd",
				"skt",
				"skm"
			]
		},
		"application/vnd.kodak-descriptor": {
			"source": "iana",
			"extensions": ["sse"]
		},
		"application/vnd.las": { "source": "iana" },
		"application/vnd.las.las+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.las.las+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lasxml"]
		},
		"application/vnd.laszip": { "source": "iana" },
		"application/vnd.leap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.liberty-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.llamagraphics.life-balance.desktop": {
			"source": "iana",
			"extensions": ["lbd"]
		},
		"application/vnd.llamagraphics.life-balance.exchange+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lbe"]
		},
		"application/vnd.logipipe.circuit+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.loom": { "source": "iana" },
		"application/vnd.lotus-1-2-3": {
			"source": "iana",
			"extensions": ["123"]
		},
		"application/vnd.lotus-approach": {
			"source": "iana",
			"extensions": ["apr"]
		},
		"application/vnd.lotus-freelance": {
			"source": "iana",
			"extensions": ["pre"]
		},
		"application/vnd.lotus-notes": {
			"source": "iana",
			"extensions": ["nsf"]
		},
		"application/vnd.lotus-organizer": {
			"source": "iana",
			"extensions": ["org"]
		},
		"application/vnd.lotus-screencam": {
			"source": "iana",
			"extensions": ["scm"]
		},
		"application/vnd.lotus-wordpro": {
			"source": "iana",
			"extensions": ["lwp"]
		},
		"application/vnd.macports.portpkg": {
			"source": "iana",
			"extensions": ["portpkg"]
		},
		"application/vnd.mapbox-vector-tile": {
			"source": "iana",
			"extensions": ["mvt"]
		},
		"application/vnd.marlin.drm.actiontoken+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.marlin.drm.conftoken+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.marlin.drm.license+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.marlin.drm.mdcf": { "source": "iana" },
		"application/vnd.mason+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.maxar.archive.3tz+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.maxmind.maxmind-db": { "source": "iana" },
		"application/vnd.mcd": {
			"source": "iana",
			"extensions": ["mcd"]
		},
		"application/vnd.medcalcdata": {
			"source": "iana",
			"extensions": ["mc1"]
		},
		"application/vnd.mediastation.cdkey": {
			"source": "iana",
			"extensions": ["cdkey"]
		},
		"application/vnd.meridian-slingshot": { "source": "iana" },
		"application/vnd.mfer": {
			"source": "iana",
			"extensions": ["mwf"]
		},
		"application/vnd.mfmp": {
			"source": "iana",
			"extensions": ["mfm"]
		},
		"application/vnd.micro+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.micrografx.flo": {
			"source": "iana",
			"extensions": ["flo"]
		},
		"application/vnd.micrografx.igx": {
			"source": "iana",
			"extensions": ["igx"]
		},
		"application/vnd.microsoft.portable-executable": { "source": "iana" },
		"application/vnd.microsoft.windows.thumbnail-cache": { "source": "iana" },
		"application/vnd.miele+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.mif": {
			"source": "iana",
			"extensions": ["mif"]
		},
		"application/vnd.minisoft-hp3000-save": { "source": "iana" },
		"application/vnd.mitsubishi.misty-guard.trustweb": { "source": "iana" },
		"application/vnd.mobius.daf": {
			"source": "iana",
			"extensions": ["daf"]
		},
		"application/vnd.mobius.dis": {
			"source": "iana",
			"extensions": ["dis"]
		},
		"application/vnd.mobius.mbk": {
			"source": "iana",
			"extensions": ["mbk"]
		},
		"application/vnd.mobius.mqy": {
			"source": "iana",
			"extensions": ["mqy"]
		},
		"application/vnd.mobius.msl": {
			"source": "iana",
			"extensions": ["msl"]
		},
		"application/vnd.mobius.plc": {
			"source": "iana",
			"extensions": ["plc"]
		},
		"application/vnd.mobius.txf": {
			"source": "iana",
			"extensions": ["txf"]
		},
		"application/vnd.mophun.application": {
			"source": "iana",
			"extensions": ["mpn"]
		},
		"application/vnd.mophun.certificate": {
			"source": "iana",
			"extensions": ["mpc"]
		},
		"application/vnd.motorola.flexsuite": { "source": "iana" },
		"application/vnd.motorola.flexsuite.adsi": { "source": "iana" },
		"application/vnd.motorola.flexsuite.fis": { "source": "iana" },
		"application/vnd.motorola.flexsuite.gotap": { "source": "iana" },
		"application/vnd.motorola.flexsuite.kmr": { "source": "iana" },
		"application/vnd.motorola.flexsuite.ttc": { "source": "iana" },
		"application/vnd.motorola.flexsuite.wem": { "source": "iana" },
		"application/vnd.motorola.iprm": { "source": "iana" },
		"application/vnd.mozilla.xul+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xul"]
		},
		"application/vnd.ms-3mfdocument": { "source": "iana" },
		"application/vnd.ms-artgalry": {
			"source": "iana",
			"extensions": ["cil"]
		},
		"application/vnd.ms-asf": { "source": "iana" },
		"application/vnd.ms-cab-compressed": {
			"source": "iana",
			"extensions": ["cab"]
		},
		"application/vnd.ms-color.iccprofile": { "source": "apache" },
		"application/vnd.ms-excel": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"xls",
				"xlm",
				"xla",
				"xlc",
				"xlt",
				"xlw"
			]
		},
		"application/vnd.ms-excel.addin.macroenabled.12": {
			"source": "iana",
			"extensions": ["xlam"]
		},
		"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
			"source": "iana",
			"extensions": ["xlsb"]
		},
		"application/vnd.ms-excel.sheet.macroenabled.12": {
			"source": "iana",
			"extensions": ["xlsm"]
		},
		"application/vnd.ms-excel.template.macroenabled.12": {
			"source": "iana",
			"extensions": ["xltm"]
		},
		"application/vnd.ms-fontobject": {
			"source": "iana",
			"compressible": true,
			"extensions": ["eot"]
		},
		"application/vnd.ms-htmlhelp": {
			"source": "iana",
			"extensions": ["chm"]
		},
		"application/vnd.ms-ims": {
			"source": "iana",
			"extensions": ["ims"]
		},
		"application/vnd.ms-lrm": {
			"source": "iana",
			"extensions": ["lrm"]
		},
		"application/vnd.ms-office.activex+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-officetheme": {
			"source": "iana",
			"extensions": ["thmx"]
		},
		"application/vnd.ms-opentype": {
			"source": "apache",
			"compressible": true
		},
		"application/vnd.ms-outlook": {
			"compressible": false,
			"extensions": ["msg"]
		},
		"application/vnd.ms-package.obfuscated-opentype": { "source": "apache" },
		"application/vnd.ms-pki.seccat": {
			"source": "apache",
			"extensions": ["cat"]
		},
		"application/vnd.ms-pki.stl": {
			"source": "apache",
			"extensions": ["stl"]
		},
		"application/vnd.ms-playready.initiator+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-powerpoint": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"ppt",
				"pps",
				"pot"
			]
		},
		"application/vnd.ms-powerpoint.addin.macroenabled.12": {
			"source": "iana",
			"extensions": ["ppam"]
		},
		"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
			"source": "iana",
			"extensions": ["pptm"]
		},
		"application/vnd.ms-powerpoint.slide.macroenabled.12": {
			"source": "iana",
			"extensions": ["sldm"]
		},
		"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
			"source": "iana",
			"extensions": ["ppsm"]
		},
		"application/vnd.ms-powerpoint.template.macroenabled.12": {
			"source": "iana",
			"extensions": ["potm"]
		},
		"application/vnd.ms-printdevicecapabilities+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-printing.printticket+xml": {
			"source": "apache",
			"compressible": true
		},
		"application/vnd.ms-printschematicket+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-project": {
			"source": "iana",
			"extensions": ["mpp", "mpt"]
		},
		"application/vnd.ms-tnef": { "source": "iana" },
		"application/vnd.ms-windows.devicepairing": { "source": "iana" },
		"application/vnd.ms-windows.nwprinting.oob": { "source": "iana" },
		"application/vnd.ms-windows.printerpairing": { "source": "iana" },
		"application/vnd.ms-windows.wsd.oob": { "source": "iana" },
		"application/vnd.ms-wmdrm.lic-chlg-req": { "source": "iana" },
		"application/vnd.ms-wmdrm.lic-resp": { "source": "iana" },
		"application/vnd.ms-wmdrm.meter-chlg-req": { "source": "iana" },
		"application/vnd.ms-wmdrm.meter-resp": { "source": "iana" },
		"application/vnd.ms-word.document.macroenabled.12": {
			"source": "iana",
			"extensions": ["docm"]
		},
		"application/vnd.ms-word.template.macroenabled.12": {
			"source": "iana",
			"extensions": ["dotm"]
		},
		"application/vnd.ms-works": {
			"source": "iana",
			"extensions": [
				"wps",
				"wks",
				"wcm",
				"wdb"
			]
		},
		"application/vnd.ms-wpl": {
			"source": "iana",
			"extensions": ["wpl"]
		},
		"application/vnd.ms-xpsdocument": {
			"source": "iana",
			"compressible": false,
			"extensions": ["xps"]
		},
		"application/vnd.msa-disk-image": { "source": "iana" },
		"application/vnd.mseq": {
			"source": "iana",
			"extensions": ["mseq"]
		},
		"application/vnd.msign": { "source": "iana" },
		"application/vnd.multiad.creator": { "source": "iana" },
		"application/vnd.multiad.creator.cif": { "source": "iana" },
		"application/vnd.music-niff": { "source": "iana" },
		"application/vnd.musician": {
			"source": "iana",
			"extensions": ["mus"]
		},
		"application/vnd.muvee.style": {
			"source": "iana",
			"extensions": ["msty"]
		},
		"application/vnd.mynfc": {
			"source": "iana",
			"extensions": ["taglet"]
		},
		"application/vnd.nacamar.ybrid+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ncd.control": { "source": "iana" },
		"application/vnd.ncd.reference": { "source": "iana" },
		"application/vnd.nearst.inv+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nebumind.line": { "source": "iana" },
		"application/vnd.nervana": { "source": "iana" },
		"application/vnd.netfpx": { "source": "iana" },
		"application/vnd.neurolanguage.nlu": {
			"source": "iana",
			"extensions": ["nlu"]
		},
		"application/vnd.nimn": { "source": "iana" },
		"application/vnd.nintendo.nitro.rom": { "source": "iana" },
		"application/vnd.nintendo.snes.rom": { "source": "iana" },
		"application/vnd.nitf": {
			"source": "iana",
			"extensions": ["ntf", "nitf"]
		},
		"application/vnd.noblenet-directory": {
			"source": "iana",
			"extensions": ["nnd"]
		},
		"application/vnd.noblenet-sealer": {
			"source": "iana",
			"extensions": ["nns"]
		},
		"application/vnd.noblenet-web": {
			"source": "iana",
			"extensions": ["nnw"]
		},
		"application/vnd.nokia.catalogs": { "source": "iana" },
		"application/vnd.nokia.conml+wbxml": { "source": "iana" },
		"application/vnd.nokia.conml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.iptv.config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.isds-radio-presets": { "source": "iana" },
		"application/vnd.nokia.landmark+wbxml": { "source": "iana" },
		"application/vnd.nokia.landmark+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.landmarkcollection+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.n-gage.ac+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ac"]
		},
		"application/vnd.nokia.n-gage.data": {
			"source": "iana",
			"extensions": ["ngdat"]
		},
		"application/vnd.nokia.n-gage.symbian.install": {
			"source": "iana",
			"extensions": ["n-gage"]
		},
		"application/vnd.nokia.ncd": { "source": "iana" },
		"application/vnd.nokia.pcd+wbxml": { "source": "iana" },
		"application/vnd.nokia.pcd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.radio-preset": {
			"source": "iana",
			"extensions": ["rpst"]
		},
		"application/vnd.nokia.radio-presets": {
			"source": "iana",
			"extensions": ["rpss"]
		},
		"application/vnd.novadigm.edm": {
			"source": "iana",
			"extensions": ["edm"]
		},
		"application/vnd.novadigm.edx": {
			"source": "iana",
			"extensions": ["edx"]
		},
		"application/vnd.novadigm.ext": {
			"source": "iana",
			"extensions": ["ext"]
		},
		"application/vnd.ntt-local.content-share": { "source": "iana" },
		"application/vnd.ntt-local.file-transfer": { "source": "iana" },
		"application/vnd.ntt-local.ogw_remote-access": { "source": "iana" },
		"application/vnd.ntt-local.sip-ta_remote": { "source": "iana" },
		"application/vnd.ntt-local.sip-ta_tcp_stream": { "source": "iana" },
		"application/vnd.oasis.opendocument.chart": {
			"source": "iana",
			"extensions": ["odc"]
		},
		"application/vnd.oasis.opendocument.chart-template": {
			"source": "iana",
			"extensions": ["otc"]
		},
		"application/vnd.oasis.opendocument.database": {
			"source": "iana",
			"extensions": ["odb"]
		},
		"application/vnd.oasis.opendocument.formula": {
			"source": "iana",
			"extensions": ["odf"]
		},
		"application/vnd.oasis.opendocument.formula-template": {
			"source": "iana",
			"extensions": ["odft"]
		},
		"application/vnd.oasis.opendocument.graphics": {
			"source": "iana",
			"compressible": false,
			"extensions": ["odg"]
		},
		"application/vnd.oasis.opendocument.graphics-template": {
			"source": "iana",
			"extensions": ["otg"]
		},
		"application/vnd.oasis.opendocument.image": {
			"source": "iana",
			"extensions": ["odi"]
		},
		"application/vnd.oasis.opendocument.image-template": {
			"source": "iana",
			"extensions": ["oti"]
		},
		"application/vnd.oasis.opendocument.presentation": {
			"source": "iana",
			"compressible": false,
			"extensions": ["odp"]
		},
		"application/vnd.oasis.opendocument.presentation-template": {
			"source": "iana",
			"extensions": ["otp"]
		},
		"application/vnd.oasis.opendocument.spreadsheet": {
			"source": "iana",
			"compressible": false,
			"extensions": ["ods"]
		},
		"application/vnd.oasis.opendocument.spreadsheet-template": {
			"source": "iana",
			"extensions": ["ots"]
		},
		"application/vnd.oasis.opendocument.text": {
			"source": "iana",
			"compressible": false,
			"extensions": ["odt"]
		},
		"application/vnd.oasis.opendocument.text-master": {
			"source": "iana",
			"extensions": ["odm"]
		},
		"application/vnd.oasis.opendocument.text-template": {
			"source": "iana",
			"extensions": ["ott"]
		},
		"application/vnd.oasis.opendocument.text-web": {
			"source": "iana",
			"extensions": ["oth"]
		},
		"application/vnd.obn": { "source": "iana" },
		"application/vnd.ocf+cbor": { "source": "iana" },
		"application/vnd.oci.image.manifest.v1+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oftn.l10n+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.contentaccessdownload+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.contentaccessstreaming+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.cspg-hexbinary": { "source": "iana" },
		"application/vnd.oipf.dae.svg+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.dae.xhtml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.mippvcontrolmessage+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.pae.gem": { "source": "iana" },
		"application/vnd.oipf.spdiscovery+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.spdlist+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.ueprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.userprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.olpc-sugar": {
			"source": "iana",
			"extensions": ["xo"]
		},
		"application/vnd.oma-scws-config": { "source": "iana" },
		"application/vnd.oma-scws-http-request": { "source": "iana" },
		"application/vnd.oma-scws-http-response": { "source": "iana" },
		"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.drm-trigger+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.imd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.ltkm": { "source": "iana" },
		"application/vnd.oma.bcast.notification+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.provisioningtrigger": { "source": "iana" },
		"application/vnd.oma.bcast.sgboot": { "source": "iana" },
		"application/vnd.oma.bcast.sgdd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.sgdu": { "source": "iana" },
		"application/vnd.oma.bcast.simple-symbol-container": { "source": "iana" },
		"application/vnd.oma.bcast.smartcard-trigger+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.sprov+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.stkm": { "source": "iana" },
		"application/vnd.oma.cab-address-book+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-feature-handler+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-pcc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-subs-invite+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-user-prefs+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.dcd": { "source": "iana" },
		"application/vnd.oma.dcdc": { "source": "iana" },
		"application/vnd.oma.dd2+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dd2"]
		},
		"application/vnd.oma.drm.risd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.group-usage-list+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.lwm2m+cbor": { "source": "iana" },
		"application/vnd.oma.lwm2m+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.lwm2m+tlv": { "source": "iana" },
		"application/vnd.oma.pal+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.detailed-progress-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.final-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.groups+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.invocation-descriptor+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.optimized-progress-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.push": { "source": "iana" },
		"application/vnd.oma.scidm.messages+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.xcap-directory+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.omads-email+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.omads-file+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.omads-folder+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.omaloc-supl-init": { "source": "iana" },
		"application/vnd.onepager": { "source": "iana" },
		"application/vnd.onepagertamp": { "source": "iana" },
		"application/vnd.onepagertamx": { "source": "iana" },
		"application/vnd.onepagertat": { "source": "iana" },
		"application/vnd.onepagertatp": { "source": "iana" },
		"application/vnd.onepagertatx": { "source": "iana" },
		"application/vnd.openblox.game+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["obgx"]
		},
		"application/vnd.openblox.game-binary": { "source": "iana" },
		"application/vnd.openeye.oeb": { "source": "iana" },
		"application/vnd.openofficeorg.extension": {
			"source": "apache",
			"extensions": ["oxt"]
		},
		"application/vnd.openstreetmap.data+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["osm"]
		},
		"application/vnd.opentimestamps.ots": { "source": "iana" },
		"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawing+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
			"source": "iana",
			"compressible": false,
			"extensions": ["pptx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slide": {
			"source": "iana",
			"extensions": ["sldx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
			"source": "iana",
			"extensions": ["ppsx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.template": {
			"source": "iana",
			"extensions": ["potx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
			"source": "iana",
			"compressible": false,
			"extensions": ["xlsx"]
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
			"source": "iana",
			"extensions": ["xltx"]
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.theme+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.vmldrawing": { "source": "iana" },
		"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
			"source": "iana",
			"compressible": false,
			"extensions": ["docx"]
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
			"source": "iana",
			"extensions": ["dotx"]
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-package.core-properties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-package.relationships+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oracle.resource+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.orange.indata": { "source": "iana" },
		"application/vnd.osa.netdeploy": { "source": "iana" },
		"application/vnd.osgeo.mapguide.package": {
			"source": "iana",
			"extensions": ["mgp"]
		},
		"application/vnd.osgi.bundle": { "source": "iana" },
		"application/vnd.osgi.dp": {
			"source": "iana",
			"extensions": ["dp"]
		},
		"application/vnd.osgi.subsystem": {
			"source": "iana",
			"extensions": ["esa"]
		},
		"application/vnd.otps.ct-kip+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oxli.countgraph": { "source": "iana" },
		"application/vnd.pagerduty+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.palm": {
			"source": "iana",
			"extensions": [
				"pdb",
				"pqa",
				"oprc"
			]
		},
		"application/vnd.panoply": { "source": "iana" },
		"application/vnd.paos.xml": { "source": "iana" },
		"application/vnd.patentdive": { "source": "iana" },
		"application/vnd.patientecommsdoc": { "source": "iana" },
		"application/vnd.pawaafile": {
			"source": "iana",
			"extensions": ["paw"]
		},
		"application/vnd.pcos": { "source": "iana" },
		"application/vnd.pg.format": {
			"source": "iana",
			"extensions": ["str"]
		},
		"application/vnd.pg.osasli": {
			"source": "iana",
			"extensions": ["ei6"]
		},
		"application/vnd.piaccess.application-licence": { "source": "iana" },
		"application/vnd.picsel": {
			"source": "iana",
			"extensions": ["efif"]
		},
		"application/vnd.pmi.widget": {
			"source": "iana",
			"extensions": ["wg"]
		},
		"application/vnd.poc.group-advertisement+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.pocketlearn": {
			"source": "iana",
			"extensions": ["plf"]
		},
		"application/vnd.powerbuilder6": {
			"source": "iana",
			"extensions": ["pbd"]
		},
		"application/vnd.powerbuilder6-s": { "source": "iana" },
		"application/vnd.powerbuilder7": { "source": "iana" },
		"application/vnd.powerbuilder7-s": { "source": "iana" },
		"application/vnd.powerbuilder75": { "source": "iana" },
		"application/vnd.powerbuilder75-s": { "source": "iana" },
		"application/vnd.preminet": { "source": "iana" },
		"application/vnd.previewsystems.box": {
			"source": "iana",
			"extensions": ["box"]
		},
		"application/vnd.proteus.magazine": {
			"source": "iana",
			"extensions": ["mgz"]
		},
		"application/vnd.psfs": { "source": "iana" },
		"application/vnd.publishare-delta-tree": {
			"source": "iana",
			"extensions": ["qps"]
		},
		"application/vnd.pvi.ptid1": {
			"source": "iana",
			"extensions": ["ptid"]
		},
		"application/vnd.pwg-multiplexed": { "source": "iana" },
		"application/vnd.pwg-xhtml-print+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.qualcomm.brew-app-res": { "source": "iana" },
		"application/vnd.quarantainenet": { "source": "iana" },
		"application/vnd.quark.quarkxpress": {
			"source": "iana",
			"extensions": [
				"qxd",
				"qxt",
				"qwd",
				"qwt",
				"qxl",
				"qxb"
			]
		},
		"application/vnd.quobject-quoxdocument": { "source": "iana" },
		"application/vnd.radisys.moml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-conf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-conn+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-dialog+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-stream+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-conf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-base+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-fax-detect+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-group+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-speech+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-transform+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.rainstor.data": { "source": "iana" },
		"application/vnd.rapid": { "source": "iana" },
		"application/vnd.rar": {
			"source": "iana",
			"extensions": ["rar"]
		},
		"application/vnd.realvnc.bed": {
			"source": "iana",
			"extensions": ["bed"]
		},
		"application/vnd.recordare.musicxml": {
			"source": "iana",
			"extensions": ["mxl"]
		},
		"application/vnd.recordare.musicxml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["musicxml"]
		},
		"application/vnd.renlearn.rlprint": { "source": "iana" },
		"application/vnd.resilient.logic": { "source": "iana" },
		"application/vnd.restful+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.rig.cryptonote": {
			"source": "iana",
			"extensions": ["cryptonote"]
		},
		"application/vnd.rim.cod": {
			"source": "apache",
			"extensions": ["cod"]
		},
		"application/vnd.rn-realmedia": {
			"source": "apache",
			"extensions": ["rm"]
		},
		"application/vnd.rn-realmedia-vbr": {
			"source": "apache",
			"extensions": ["rmvb"]
		},
		"application/vnd.route66.link66+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["link66"]
		},
		"application/vnd.rs-274x": { "source": "iana" },
		"application/vnd.ruckus.download": { "source": "iana" },
		"application/vnd.s3sms": { "source": "iana" },
		"application/vnd.sailingtracker.track": {
			"source": "iana",
			"extensions": ["st"]
		},
		"application/vnd.sar": { "source": "iana" },
		"application/vnd.sbm.cid": { "source": "iana" },
		"application/vnd.sbm.mid2": { "source": "iana" },
		"application/vnd.scribus": { "source": "iana" },
		"application/vnd.sealed.3df": { "source": "iana" },
		"application/vnd.sealed.csf": { "source": "iana" },
		"application/vnd.sealed.doc": { "source": "iana" },
		"application/vnd.sealed.eml": { "source": "iana" },
		"application/vnd.sealed.mht": { "source": "iana" },
		"application/vnd.sealed.net": { "source": "iana" },
		"application/vnd.sealed.ppt": { "source": "iana" },
		"application/vnd.sealed.tiff": { "source": "iana" },
		"application/vnd.sealed.xls": { "source": "iana" },
		"application/vnd.sealedmedia.softseal.html": { "source": "iana" },
		"application/vnd.sealedmedia.softseal.pdf": { "source": "iana" },
		"application/vnd.seemail": {
			"source": "iana",
			"extensions": ["see"]
		},
		"application/vnd.seis+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.sema": {
			"source": "iana",
			"extensions": ["sema"]
		},
		"application/vnd.semd": {
			"source": "iana",
			"extensions": ["semd"]
		},
		"application/vnd.semf": {
			"source": "iana",
			"extensions": ["semf"]
		},
		"application/vnd.shade-save-file": { "source": "iana" },
		"application/vnd.shana.informed.formdata": {
			"source": "iana",
			"extensions": ["ifm"]
		},
		"application/vnd.shana.informed.formtemplate": {
			"source": "iana",
			"extensions": ["itp"]
		},
		"application/vnd.shana.informed.interchange": {
			"source": "iana",
			"extensions": ["iif"]
		},
		"application/vnd.shana.informed.package": {
			"source": "iana",
			"extensions": ["ipk"]
		},
		"application/vnd.shootproof+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.shopkick+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.shp": { "source": "iana" },
		"application/vnd.shx": { "source": "iana" },
		"application/vnd.sigrok.session": { "source": "iana" },
		"application/vnd.simtech-mindmapper": {
			"source": "iana",
			"extensions": ["twd", "twds"]
		},
		"application/vnd.siren+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.smaf": {
			"source": "iana",
			"extensions": ["mmf"]
		},
		"application/vnd.smart.notebook": { "source": "iana" },
		"application/vnd.smart.teacher": {
			"source": "iana",
			"extensions": ["teacher"]
		},
		"application/vnd.snesdev-page-table": { "source": "iana" },
		"application/vnd.software602.filler.form+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["fo"]
		},
		"application/vnd.software602.filler.form-xml-zip": { "source": "iana" },
		"application/vnd.solent.sdkm+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sdkm", "sdkd"]
		},
		"application/vnd.spotfire.dxp": {
			"source": "iana",
			"extensions": ["dxp"]
		},
		"application/vnd.spotfire.sfs": {
			"source": "iana",
			"extensions": ["sfs"]
		},
		"application/vnd.sqlite3": { "source": "iana" },
		"application/vnd.sss-cod": { "source": "iana" },
		"application/vnd.sss-dtf": { "source": "iana" },
		"application/vnd.sss-ntf": { "source": "iana" },
		"application/vnd.stardivision.calc": {
			"source": "apache",
			"extensions": ["sdc"]
		},
		"application/vnd.stardivision.draw": {
			"source": "apache",
			"extensions": ["sda"]
		},
		"application/vnd.stardivision.impress": {
			"source": "apache",
			"extensions": ["sdd"]
		},
		"application/vnd.stardivision.math": {
			"source": "apache",
			"extensions": ["smf"]
		},
		"application/vnd.stardivision.writer": {
			"source": "apache",
			"extensions": ["sdw", "vor"]
		},
		"application/vnd.stardivision.writer-global": {
			"source": "apache",
			"extensions": ["sgl"]
		},
		"application/vnd.stepmania.package": {
			"source": "iana",
			"extensions": ["smzip"]
		},
		"application/vnd.stepmania.stepchart": {
			"source": "iana",
			"extensions": ["sm"]
		},
		"application/vnd.street-stream": { "source": "iana" },
		"application/vnd.sun.wadl+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wadl"]
		},
		"application/vnd.sun.xml.calc": {
			"source": "apache",
			"extensions": ["sxc"]
		},
		"application/vnd.sun.xml.calc.template": {
			"source": "apache",
			"extensions": ["stc"]
		},
		"application/vnd.sun.xml.draw": {
			"source": "apache",
			"extensions": ["sxd"]
		},
		"application/vnd.sun.xml.draw.template": {
			"source": "apache",
			"extensions": ["std"]
		},
		"application/vnd.sun.xml.impress": {
			"source": "apache",
			"extensions": ["sxi"]
		},
		"application/vnd.sun.xml.impress.template": {
			"source": "apache",
			"extensions": ["sti"]
		},
		"application/vnd.sun.xml.math": {
			"source": "apache",
			"extensions": ["sxm"]
		},
		"application/vnd.sun.xml.writer": {
			"source": "apache",
			"extensions": ["sxw"]
		},
		"application/vnd.sun.xml.writer.global": {
			"source": "apache",
			"extensions": ["sxg"]
		},
		"application/vnd.sun.xml.writer.template": {
			"source": "apache",
			"extensions": ["stw"]
		},
		"application/vnd.sus-calendar": {
			"source": "iana",
			"extensions": ["sus", "susp"]
		},
		"application/vnd.svd": {
			"source": "iana",
			"extensions": ["svd"]
		},
		"application/vnd.swiftview-ics": { "source": "iana" },
		"application/vnd.sycle+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.syft+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.symbian.install": {
			"source": "apache",
			"extensions": ["sis", "sisx"]
		},
		"application/vnd.syncml+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["xsm"]
		},
		"application/vnd.syncml.dm+wbxml": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["bdm"]
		},
		"application/vnd.syncml.dm+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["xdm"]
		},
		"application/vnd.syncml.dm.notification": { "source": "iana" },
		"application/vnd.syncml.dmddf+wbxml": { "source": "iana" },
		"application/vnd.syncml.dmddf+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["ddf"]
		},
		"application/vnd.syncml.dmtnds+wbxml": { "source": "iana" },
		"application/vnd.syncml.dmtnds+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.syncml.ds.notification": { "source": "iana" },
		"application/vnd.tableschema+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.tao.intent-module-archive": {
			"source": "iana",
			"extensions": ["tao"]
		},
		"application/vnd.tcpdump.pcap": {
			"source": "iana",
			"extensions": [
				"pcap",
				"cap",
				"dmp"
			]
		},
		"application/vnd.think-cell.ppttc+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.tmd.mediaflex.api+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.tml": { "source": "iana" },
		"application/vnd.tmobile-livetv": {
			"source": "iana",
			"extensions": ["tmo"]
		},
		"application/vnd.tri.onesource": { "source": "iana" },
		"application/vnd.trid.tpt": {
			"source": "iana",
			"extensions": ["tpt"]
		},
		"application/vnd.triscape.mxs": {
			"source": "iana",
			"extensions": ["mxs"]
		},
		"application/vnd.trueapp": {
			"source": "iana",
			"extensions": ["tra"]
		},
		"application/vnd.truedoc": { "source": "iana" },
		"application/vnd.ubisoft.webplayer": { "source": "iana" },
		"application/vnd.ufdl": {
			"source": "iana",
			"extensions": ["ufd", "ufdl"]
		},
		"application/vnd.uiq.theme": {
			"source": "iana",
			"extensions": ["utz"]
		},
		"application/vnd.umajin": {
			"source": "iana",
			"extensions": ["umj"]
		},
		"application/vnd.unity": {
			"source": "iana",
			"extensions": ["unityweb"]
		},
		"application/vnd.uoml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["uoml"]
		},
		"application/vnd.uplanet.alert": { "source": "iana" },
		"application/vnd.uplanet.alert-wbxml": { "source": "iana" },
		"application/vnd.uplanet.bearer-choice": { "source": "iana" },
		"application/vnd.uplanet.bearer-choice-wbxml": { "source": "iana" },
		"application/vnd.uplanet.cacheop": { "source": "iana" },
		"application/vnd.uplanet.cacheop-wbxml": { "source": "iana" },
		"application/vnd.uplanet.channel": { "source": "iana" },
		"application/vnd.uplanet.channel-wbxml": { "source": "iana" },
		"application/vnd.uplanet.list": { "source": "iana" },
		"application/vnd.uplanet.list-wbxml": { "source": "iana" },
		"application/vnd.uplanet.listcmd": { "source": "iana" },
		"application/vnd.uplanet.listcmd-wbxml": { "source": "iana" },
		"application/vnd.uplanet.signal": { "source": "iana" },
		"application/vnd.uri-map": { "source": "iana" },
		"application/vnd.valve.source.material": { "source": "iana" },
		"application/vnd.vcx": {
			"source": "iana",
			"extensions": ["vcx"]
		},
		"application/vnd.vd-study": { "source": "iana" },
		"application/vnd.vectorworks": { "source": "iana" },
		"application/vnd.vel+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.verimatrix.vcas": { "source": "iana" },
		"application/vnd.veritone.aion+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.veryant.thin": { "source": "iana" },
		"application/vnd.ves.encrypted": { "source": "iana" },
		"application/vnd.vidsoft.vidconference": { "source": "iana" },
		"application/vnd.visio": {
			"source": "iana",
			"extensions": [
				"vsd",
				"vst",
				"vss",
				"vsw"
			]
		},
		"application/vnd.visionary": {
			"source": "iana",
			"extensions": ["vis"]
		},
		"application/vnd.vividence.scriptfile": { "source": "iana" },
		"application/vnd.vsf": {
			"source": "iana",
			"extensions": ["vsf"]
		},
		"application/vnd.wap.sic": { "source": "iana" },
		"application/vnd.wap.slc": { "source": "iana" },
		"application/vnd.wap.wbxml": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["wbxml"]
		},
		"application/vnd.wap.wmlc": {
			"source": "iana",
			"extensions": ["wmlc"]
		},
		"application/vnd.wap.wmlscriptc": {
			"source": "iana",
			"extensions": ["wmlsc"]
		},
		"application/vnd.webturbo": {
			"source": "iana",
			"extensions": ["wtb"]
		},
		"application/vnd.wfa.dpp": { "source": "iana" },
		"application/vnd.wfa.p2p": { "source": "iana" },
		"application/vnd.wfa.wsc": { "source": "iana" },
		"application/vnd.windows.devicepairing": { "source": "iana" },
		"application/vnd.wmc": { "source": "iana" },
		"application/vnd.wmf.bootstrap": { "source": "iana" },
		"application/vnd.wolfram.mathematica": { "source": "iana" },
		"application/vnd.wolfram.mathematica.package": { "source": "iana" },
		"application/vnd.wolfram.player": {
			"source": "iana",
			"extensions": ["nbp"]
		},
		"application/vnd.wordperfect": {
			"source": "iana",
			"extensions": ["wpd"]
		},
		"application/vnd.wqd": {
			"source": "iana",
			"extensions": ["wqd"]
		},
		"application/vnd.wrq-hp3000-labelled": { "source": "iana" },
		"application/vnd.wt.stf": {
			"source": "iana",
			"extensions": ["stf"]
		},
		"application/vnd.wv.csp+wbxml": { "source": "iana" },
		"application/vnd.wv.csp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.wv.ssp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.xacml+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.xara": {
			"source": "iana",
			"extensions": ["xar"]
		},
		"application/vnd.xfdl": {
			"source": "iana",
			"extensions": ["xfdl"]
		},
		"application/vnd.xfdl.webform": { "source": "iana" },
		"application/vnd.xmi+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.xmpie.cpkg": { "source": "iana" },
		"application/vnd.xmpie.dpkg": { "source": "iana" },
		"application/vnd.xmpie.plan": { "source": "iana" },
		"application/vnd.xmpie.ppkg": { "source": "iana" },
		"application/vnd.xmpie.xlim": { "source": "iana" },
		"application/vnd.yamaha.hv-dic": {
			"source": "iana",
			"extensions": ["hvd"]
		},
		"application/vnd.yamaha.hv-script": {
			"source": "iana",
			"extensions": ["hvs"]
		},
		"application/vnd.yamaha.hv-voice": {
			"source": "iana",
			"extensions": ["hvp"]
		},
		"application/vnd.yamaha.openscoreformat": {
			"source": "iana",
			"extensions": ["osf"]
		},
		"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["osfpvg"]
		},
		"application/vnd.yamaha.remote-setup": { "source": "iana" },
		"application/vnd.yamaha.smaf-audio": {
			"source": "iana",
			"extensions": ["saf"]
		},
		"application/vnd.yamaha.smaf-phrase": {
			"source": "iana",
			"extensions": ["spf"]
		},
		"application/vnd.yamaha.through-ngn": { "source": "iana" },
		"application/vnd.yamaha.tunnel-udpencap": { "source": "iana" },
		"application/vnd.yaoweme": { "source": "iana" },
		"application/vnd.yellowriver-custom-menu": {
			"source": "iana",
			"extensions": ["cmp"]
		},
		"application/vnd.youtube.yt": { "source": "iana" },
		"application/vnd.zul": {
			"source": "iana",
			"extensions": ["zir", "zirz"]
		},
		"application/vnd.zzazz.deck+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["zaz"]
		},
		"application/voicexml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["vxml"]
		},
		"application/voucher-cms+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vq-rtcpxr": { "source": "iana" },
		"application/wasm": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wasm"]
		},
		"application/watcherinfo+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wif"]
		},
		"application/webpush-options+json": {
			"source": "iana",
			"compressible": true
		},
		"application/whoispp-query": { "source": "iana" },
		"application/whoispp-response": { "source": "iana" },
		"application/widget": {
			"source": "iana",
			"extensions": ["wgt"]
		},
		"application/winhlp": {
			"source": "apache",
			"extensions": ["hlp"]
		},
		"application/wita": { "source": "iana" },
		"application/wordperfect5.1": { "source": "iana" },
		"application/wsdl+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wsdl"]
		},
		"application/wspolicy+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wspolicy"]
		},
		"application/x-7z-compressed": {
			"source": "apache",
			"compressible": false,
			"extensions": ["7z"]
		},
		"application/x-abiword": {
			"source": "apache",
			"extensions": ["abw"]
		},
		"application/x-ace-compressed": {
			"source": "apache",
			"extensions": ["ace"]
		},
		"application/x-amf": { "source": "apache" },
		"application/x-apple-diskimage": {
			"source": "apache",
			"extensions": ["dmg"]
		},
		"application/x-arj": {
			"compressible": false,
			"extensions": ["arj"]
		},
		"application/x-authorware-bin": {
			"source": "apache",
			"extensions": [
				"aab",
				"x32",
				"u32",
				"vox"
			]
		},
		"application/x-authorware-map": {
			"source": "apache",
			"extensions": ["aam"]
		},
		"application/x-authorware-seg": {
			"source": "apache",
			"extensions": ["aas"]
		},
		"application/x-bcpio": {
			"source": "apache",
			"extensions": ["bcpio"]
		},
		"application/x-bdoc": {
			"compressible": false,
			"extensions": ["bdoc"]
		},
		"application/x-bittorrent": {
			"source": "apache",
			"extensions": ["torrent"]
		},
		"application/x-blorb": {
			"source": "apache",
			"extensions": ["blb", "blorb"]
		},
		"application/x-bzip": {
			"source": "apache",
			"compressible": false,
			"extensions": ["bz"]
		},
		"application/x-bzip2": {
			"source": "apache",
			"compressible": false,
			"extensions": ["bz2", "boz"]
		},
		"application/x-cbr": {
			"source": "apache",
			"extensions": [
				"cbr",
				"cba",
				"cbt",
				"cbz",
				"cb7"
			]
		},
		"application/x-cdlink": {
			"source": "apache",
			"extensions": ["vcd"]
		},
		"application/x-cfs-compressed": {
			"source": "apache",
			"extensions": ["cfs"]
		},
		"application/x-chat": {
			"source": "apache",
			"extensions": ["chat"]
		},
		"application/x-chess-pgn": {
			"source": "apache",
			"extensions": ["pgn"]
		},
		"application/x-chrome-extension": { "extensions": ["crx"] },
		"application/x-cocoa": {
			"source": "nginx",
			"extensions": ["cco"]
		},
		"application/x-compress": { "source": "apache" },
		"application/x-conference": {
			"source": "apache",
			"extensions": ["nsc"]
		},
		"application/x-cpio": {
			"source": "apache",
			"extensions": ["cpio"]
		},
		"application/x-csh": {
			"source": "apache",
			"extensions": ["csh"]
		},
		"application/x-deb": { "compressible": false },
		"application/x-debian-package": {
			"source": "apache",
			"extensions": ["deb", "udeb"]
		},
		"application/x-dgc-compressed": {
			"source": "apache",
			"extensions": ["dgc"]
		},
		"application/x-director": {
			"source": "apache",
			"extensions": [
				"dir",
				"dcr",
				"dxr",
				"cst",
				"cct",
				"cxt",
				"w3d",
				"fgd",
				"swa"
			]
		},
		"application/x-doom": {
			"source": "apache",
			"extensions": ["wad"]
		},
		"application/x-dtbncx+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["ncx"]
		},
		"application/x-dtbook+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["dtb"]
		},
		"application/x-dtbresource+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["res"]
		},
		"application/x-dvi": {
			"source": "apache",
			"compressible": false,
			"extensions": ["dvi"]
		},
		"application/x-envoy": {
			"source": "apache",
			"extensions": ["evy"]
		},
		"application/x-eva": {
			"source": "apache",
			"extensions": ["eva"]
		},
		"application/x-font-bdf": {
			"source": "apache",
			"extensions": ["bdf"]
		},
		"application/x-font-dos": { "source": "apache" },
		"application/x-font-framemaker": { "source": "apache" },
		"application/x-font-ghostscript": {
			"source": "apache",
			"extensions": ["gsf"]
		},
		"application/x-font-libgrx": { "source": "apache" },
		"application/x-font-linux-psf": {
			"source": "apache",
			"extensions": ["psf"]
		},
		"application/x-font-pcf": {
			"source": "apache",
			"extensions": ["pcf"]
		},
		"application/x-font-snf": {
			"source": "apache",
			"extensions": ["snf"]
		},
		"application/x-font-speedo": { "source": "apache" },
		"application/x-font-sunos-news": { "source": "apache" },
		"application/x-font-type1": {
			"source": "apache",
			"extensions": [
				"pfa",
				"pfb",
				"pfm",
				"afm"
			]
		},
		"application/x-font-vfont": { "source": "apache" },
		"application/x-freearc": {
			"source": "apache",
			"extensions": ["arc"]
		},
		"application/x-futuresplash": {
			"source": "apache",
			"extensions": ["spl"]
		},
		"application/x-gca-compressed": {
			"source": "apache",
			"extensions": ["gca"]
		},
		"application/x-glulx": {
			"source": "apache",
			"extensions": ["ulx"]
		},
		"application/x-gnumeric": {
			"source": "apache",
			"extensions": ["gnumeric"]
		},
		"application/x-gramps-xml": {
			"source": "apache",
			"extensions": ["gramps"]
		},
		"application/x-gtar": {
			"source": "apache",
			"extensions": ["gtar"]
		},
		"application/x-gzip": { "source": "apache" },
		"application/x-hdf": {
			"source": "apache",
			"extensions": ["hdf"]
		},
		"application/x-httpd-php": {
			"compressible": true,
			"extensions": ["php"]
		},
		"application/x-install-instructions": {
			"source": "apache",
			"extensions": ["install"]
		},
		"application/x-iso9660-image": {
			"source": "apache",
			"extensions": ["iso"]
		},
		"application/x-iwork-keynote-sffkey": { "extensions": ["key"] },
		"application/x-iwork-numbers-sffnumbers": { "extensions": ["numbers"] },
		"application/x-iwork-pages-sffpages": { "extensions": ["pages"] },
		"application/x-java-archive-diff": {
			"source": "nginx",
			"extensions": ["jardiff"]
		},
		"application/x-java-jnlp-file": {
			"source": "apache",
			"compressible": false,
			"extensions": ["jnlp"]
		},
		"application/x-javascript": { "compressible": true },
		"application/x-keepass2": { "extensions": ["kdbx"] },
		"application/x-latex": {
			"source": "apache",
			"compressible": false,
			"extensions": ["latex"]
		},
		"application/x-lua-bytecode": { "extensions": ["luac"] },
		"application/x-lzh-compressed": {
			"source": "apache",
			"extensions": ["lzh", "lha"]
		},
		"application/x-makeself": {
			"source": "nginx",
			"extensions": ["run"]
		},
		"application/x-mie": {
			"source": "apache",
			"extensions": ["mie"]
		},
		"application/x-mobipocket-ebook": {
			"source": "apache",
			"extensions": ["prc", "mobi"]
		},
		"application/x-mpegurl": { "compressible": false },
		"application/x-ms-application": {
			"source": "apache",
			"extensions": ["application"]
		},
		"application/x-ms-shortcut": {
			"source": "apache",
			"extensions": ["lnk"]
		},
		"application/x-ms-wmd": {
			"source": "apache",
			"extensions": ["wmd"]
		},
		"application/x-ms-wmz": {
			"source": "apache",
			"extensions": ["wmz"]
		},
		"application/x-ms-xbap": {
			"source": "apache",
			"extensions": ["xbap"]
		},
		"application/x-msaccess": {
			"source": "apache",
			"extensions": ["mdb"]
		},
		"application/x-msbinder": {
			"source": "apache",
			"extensions": ["obd"]
		},
		"application/x-mscardfile": {
			"source": "apache",
			"extensions": ["crd"]
		},
		"application/x-msclip": {
			"source": "apache",
			"extensions": ["clp"]
		},
		"application/x-msdos-program": { "extensions": ["exe"] },
		"application/x-msdownload": {
			"source": "apache",
			"extensions": [
				"exe",
				"dll",
				"com",
				"bat",
				"msi"
			]
		},
		"application/x-msmediaview": {
			"source": "apache",
			"extensions": [
				"mvb",
				"m13",
				"m14"
			]
		},
		"application/x-msmetafile": {
			"source": "apache",
			"extensions": [
				"wmf",
				"wmz",
				"emf",
				"emz"
			]
		},
		"application/x-msmoney": {
			"source": "apache",
			"extensions": ["mny"]
		},
		"application/x-mspublisher": {
			"source": "apache",
			"extensions": ["pub"]
		},
		"application/x-msschedule": {
			"source": "apache",
			"extensions": ["scd"]
		},
		"application/x-msterminal": {
			"source": "apache",
			"extensions": ["trm"]
		},
		"application/x-mswrite": {
			"source": "apache",
			"extensions": ["wri"]
		},
		"application/x-netcdf": {
			"source": "apache",
			"extensions": ["nc", "cdf"]
		},
		"application/x-ns-proxy-autoconfig": {
			"compressible": true,
			"extensions": ["pac"]
		},
		"application/x-nzb": {
			"source": "apache",
			"extensions": ["nzb"]
		},
		"application/x-perl": {
			"source": "nginx",
			"extensions": ["pl", "pm"]
		},
		"application/x-pilot": {
			"source": "nginx",
			"extensions": ["prc", "pdb"]
		},
		"application/x-pkcs12": {
			"source": "apache",
			"compressible": false,
			"extensions": ["p12", "pfx"]
		},
		"application/x-pkcs7-certificates": {
			"source": "apache",
			"extensions": ["p7b", "spc"]
		},
		"application/x-pkcs7-certreqresp": {
			"source": "apache",
			"extensions": ["p7r"]
		},
		"application/x-pki-message": { "source": "iana" },
		"application/x-rar-compressed": {
			"source": "apache",
			"compressible": false,
			"extensions": ["rar"]
		},
		"application/x-redhat-package-manager": {
			"source": "nginx",
			"extensions": ["rpm"]
		},
		"application/x-research-info-systems": {
			"source": "apache",
			"extensions": ["ris"]
		},
		"application/x-sea": {
			"source": "nginx",
			"extensions": ["sea"]
		},
		"application/x-sh": {
			"source": "apache",
			"compressible": true,
			"extensions": ["sh"]
		},
		"application/x-shar": {
			"source": "apache",
			"extensions": ["shar"]
		},
		"application/x-shockwave-flash": {
			"source": "apache",
			"compressible": false,
			"extensions": ["swf"]
		},
		"application/x-silverlight-app": {
			"source": "apache",
			"extensions": ["xap"]
		},
		"application/x-sql": {
			"source": "apache",
			"extensions": ["sql"]
		},
		"application/x-stuffit": {
			"source": "apache",
			"compressible": false,
			"extensions": ["sit"]
		},
		"application/x-stuffitx": {
			"source": "apache",
			"extensions": ["sitx"]
		},
		"application/x-subrip": {
			"source": "apache",
			"extensions": ["srt"]
		},
		"application/x-sv4cpio": {
			"source": "apache",
			"extensions": ["sv4cpio"]
		},
		"application/x-sv4crc": {
			"source": "apache",
			"extensions": ["sv4crc"]
		},
		"application/x-t3vm-image": {
			"source": "apache",
			"extensions": ["t3"]
		},
		"application/x-tads": {
			"source": "apache",
			"extensions": ["gam"]
		},
		"application/x-tar": {
			"source": "apache",
			"compressible": true,
			"extensions": ["tar"]
		},
		"application/x-tcl": {
			"source": "apache",
			"extensions": ["tcl", "tk"]
		},
		"application/x-tex": {
			"source": "apache",
			"extensions": ["tex"]
		},
		"application/x-tex-tfm": {
			"source": "apache",
			"extensions": ["tfm"]
		},
		"application/x-texinfo": {
			"source": "apache",
			"extensions": ["texinfo", "texi"]
		},
		"application/x-tgif": {
			"source": "apache",
			"extensions": ["obj"]
		},
		"application/x-ustar": {
			"source": "apache",
			"extensions": ["ustar"]
		},
		"application/x-virtualbox-hdd": {
			"compressible": true,
			"extensions": ["hdd"]
		},
		"application/x-virtualbox-ova": {
			"compressible": true,
			"extensions": ["ova"]
		},
		"application/x-virtualbox-ovf": {
			"compressible": true,
			"extensions": ["ovf"]
		},
		"application/x-virtualbox-vbox": {
			"compressible": true,
			"extensions": ["vbox"]
		},
		"application/x-virtualbox-vbox-extpack": {
			"compressible": false,
			"extensions": ["vbox-extpack"]
		},
		"application/x-virtualbox-vdi": {
			"compressible": true,
			"extensions": ["vdi"]
		},
		"application/x-virtualbox-vhd": {
			"compressible": true,
			"extensions": ["vhd"]
		},
		"application/x-virtualbox-vmdk": {
			"compressible": true,
			"extensions": ["vmdk"]
		},
		"application/x-wais-source": {
			"source": "apache",
			"extensions": ["src"]
		},
		"application/x-web-app-manifest+json": {
			"compressible": true,
			"extensions": ["webapp"]
		},
		"application/x-www-form-urlencoded": {
			"source": "iana",
			"compressible": true
		},
		"application/x-x509-ca-cert": {
			"source": "iana",
			"extensions": [
				"der",
				"crt",
				"pem"
			]
		},
		"application/x-x509-ca-ra-cert": { "source": "iana" },
		"application/x-x509-next-ca-cert": { "source": "iana" },
		"application/x-xfig": {
			"source": "apache",
			"extensions": ["fig"]
		},
		"application/x-xliff+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xlf"]
		},
		"application/x-xpinstall": {
			"source": "apache",
			"compressible": false,
			"extensions": ["xpi"]
		},
		"application/x-xz": {
			"source": "apache",
			"extensions": ["xz"]
		},
		"application/x-zmachine": {
			"source": "apache",
			"extensions": [
				"z1",
				"z2",
				"z3",
				"z4",
				"z5",
				"z6",
				"z7",
				"z8"
			]
		},
		"application/x400-bp": { "source": "iana" },
		"application/xacml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xaml+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xaml"]
		},
		"application/xcap-att+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xav"]
		},
		"application/xcap-caps+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xca"]
		},
		"application/xcap-diff+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xdf"]
		},
		"application/xcap-el+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xel"]
		},
		"application/xcap-error+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xcap-ns+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xns"]
		},
		"application/xcon-conference-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xcon-conference-info-diff+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xenc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xenc"]
		},
		"application/xhtml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xhtml", "xht"]
		},
		"application/xhtml-voice+xml": {
			"source": "apache",
			"compressible": true
		},
		"application/xliff+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xlf"]
		},
		"application/xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"xml",
				"xsl",
				"xsd",
				"rng"
			]
		},
		"application/xml-dtd": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dtd"]
		},
		"application/xml-external-parsed-entity": { "source": "iana" },
		"application/xml-patch+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xmpp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xop+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xop"]
		},
		"application/xproc+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xpl"]
		},
		"application/xslt+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xsl", "xslt"]
		},
		"application/xspf+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xspf"]
		},
		"application/xv+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"mxml",
				"xhvml",
				"xvml",
				"xvm"
			]
		},
		"application/yang": {
			"source": "iana",
			"extensions": ["yang"]
		},
		"application/yang-data+json": {
			"source": "iana",
			"compressible": true
		},
		"application/yang-data+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/yang-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/yang-patch+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/yin+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["yin"]
		},
		"application/zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["zip"]
		},
		"application/zlib": { "source": "iana" },
		"application/zstd": { "source": "iana" },
		"audio/1d-interleaved-parityfec": { "source": "iana" },
		"audio/32kadpcm": { "source": "iana" },
		"audio/3gpp": {
			"source": "iana",
			"compressible": false,
			"extensions": ["3gpp"]
		},
		"audio/3gpp2": { "source": "iana" },
		"audio/aac": { "source": "iana" },
		"audio/ac3": { "source": "iana" },
		"audio/adpcm": {
			"source": "apache",
			"extensions": ["adp"]
		},
		"audio/amr": {
			"source": "iana",
			"extensions": ["amr"]
		},
		"audio/amr-wb": { "source": "iana" },
		"audio/amr-wb+": { "source": "iana" },
		"audio/aptx": { "source": "iana" },
		"audio/asc": { "source": "iana" },
		"audio/atrac-advanced-lossless": { "source": "iana" },
		"audio/atrac-x": { "source": "iana" },
		"audio/atrac3": { "source": "iana" },
		"audio/basic": {
			"source": "iana",
			"compressible": false,
			"extensions": ["au", "snd"]
		},
		"audio/bv16": { "source": "iana" },
		"audio/bv32": { "source": "iana" },
		"audio/clearmode": { "source": "iana" },
		"audio/cn": { "source": "iana" },
		"audio/dat12": { "source": "iana" },
		"audio/dls": { "source": "iana" },
		"audio/dsr-es201108": { "source": "iana" },
		"audio/dsr-es202050": { "source": "iana" },
		"audio/dsr-es202211": { "source": "iana" },
		"audio/dsr-es202212": { "source": "iana" },
		"audio/dv": { "source": "iana" },
		"audio/dvi4": { "source": "iana" },
		"audio/eac3": { "source": "iana" },
		"audio/encaprtp": { "source": "iana" },
		"audio/evrc": { "source": "iana" },
		"audio/evrc-qcp": { "source": "iana" },
		"audio/evrc0": { "source": "iana" },
		"audio/evrc1": { "source": "iana" },
		"audio/evrcb": { "source": "iana" },
		"audio/evrcb0": { "source": "iana" },
		"audio/evrcb1": { "source": "iana" },
		"audio/evrcnw": { "source": "iana" },
		"audio/evrcnw0": { "source": "iana" },
		"audio/evrcnw1": { "source": "iana" },
		"audio/evrcwb": { "source": "iana" },
		"audio/evrcwb0": { "source": "iana" },
		"audio/evrcwb1": { "source": "iana" },
		"audio/evs": { "source": "iana" },
		"audio/flexfec": { "source": "iana" },
		"audio/fwdred": { "source": "iana" },
		"audio/g711-0": { "source": "iana" },
		"audio/g719": { "source": "iana" },
		"audio/g722": { "source": "iana" },
		"audio/g7221": { "source": "iana" },
		"audio/g723": { "source": "iana" },
		"audio/g726-16": { "source": "iana" },
		"audio/g726-24": { "source": "iana" },
		"audio/g726-32": { "source": "iana" },
		"audio/g726-40": { "source": "iana" },
		"audio/g728": { "source": "iana" },
		"audio/g729": { "source": "iana" },
		"audio/g7291": { "source": "iana" },
		"audio/g729d": { "source": "iana" },
		"audio/g729e": { "source": "iana" },
		"audio/gsm": { "source": "iana" },
		"audio/gsm-efr": { "source": "iana" },
		"audio/gsm-hr-08": { "source": "iana" },
		"audio/ilbc": { "source": "iana" },
		"audio/ip-mr_v2.5": { "source": "iana" },
		"audio/isac": { "source": "apache" },
		"audio/l16": { "source": "iana" },
		"audio/l20": { "source": "iana" },
		"audio/l24": {
			"source": "iana",
			"compressible": false
		},
		"audio/l8": { "source": "iana" },
		"audio/lpc": { "source": "iana" },
		"audio/melp": { "source": "iana" },
		"audio/melp1200": { "source": "iana" },
		"audio/melp2400": { "source": "iana" },
		"audio/melp600": { "source": "iana" },
		"audio/mhas": { "source": "iana" },
		"audio/midi": {
			"source": "apache",
			"extensions": [
				"mid",
				"midi",
				"kar",
				"rmi"
			]
		},
		"audio/mobile-xmf": {
			"source": "iana",
			"extensions": ["mxmf"]
		},
		"audio/mp3": {
			"compressible": false,
			"extensions": ["mp3"]
		},
		"audio/mp4": {
			"source": "iana",
			"compressible": false,
			"extensions": ["m4a", "mp4a"]
		},
		"audio/mp4a-latm": { "source": "iana" },
		"audio/mpa": { "source": "iana" },
		"audio/mpa-robust": { "source": "iana" },
		"audio/mpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"mpga",
				"mp2",
				"mp2a",
				"mp3",
				"m2a",
				"m3a"
			]
		},
		"audio/mpeg4-generic": { "source": "iana" },
		"audio/musepack": { "source": "apache" },
		"audio/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"oga",
				"ogg",
				"spx",
				"opus"
			]
		},
		"audio/opus": { "source": "iana" },
		"audio/parityfec": { "source": "iana" },
		"audio/pcma": { "source": "iana" },
		"audio/pcma-wb": { "source": "iana" },
		"audio/pcmu": { "source": "iana" },
		"audio/pcmu-wb": { "source": "iana" },
		"audio/prs.sid": { "source": "iana" },
		"audio/qcelp": { "source": "iana" },
		"audio/raptorfec": { "source": "iana" },
		"audio/red": { "source": "iana" },
		"audio/rtp-enc-aescm128": { "source": "iana" },
		"audio/rtp-midi": { "source": "iana" },
		"audio/rtploopback": { "source": "iana" },
		"audio/rtx": { "source": "iana" },
		"audio/s3m": {
			"source": "apache",
			"extensions": ["s3m"]
		},
		"audio/scip": { "source": "iana" },
		"audio/silk": {
			"source": "apache",
			"extensions": ["sil"]
		},
		"audio/smv": { "source": "iana" },
		"audio/smv-qcp": { "source": "iana" },
		"audio/smv0": { "source": "iana" },
		"audio/sofa": { "source": "iana" },
		"audio/sp-midi": { "source": "iana" },
		"audio/speex": { "source": "iana" },
		"audio/t140c": { "source": "iana" },
		"audio/t38": { "source": "iana" },
		"audio/telephone-event": { "source": "iana" },
		"audio/tetra_acelp": { "source": "iana" },
		"audio/tetra_acelp_bb": { "source": "iana" },
		"audio/tone": { "source": "iana" },
		"audio/tsvcis": { "source": "iana" },
		"audio/uemclip": { "source": "iana" },
		"audio/ulpfec": { "source": "iana" },
		"audio/usac": { "source": "iana" },
		"audio/vdvi": { "source": "iana" },
		"audio/vmr-wb": { "source": "iana" },
		"audio/vnd.3gpp.iufp": { "source": "iana" },
		"audio/vnd.4sb": { "source": "iana" },
		"audio/vnd.audiokoz": { "source": "iana" },
		"audio/vnd.celp": { "source": "iana" },
		"audio/vnd.cisco.nse": { "source": "iana" },
		"audio/vnd.cmles.radio-events": { "source": "iana" },
		"audio/vnd.cns.anp1": { "source": "iana" },
		"audio/vnd.cns.inf1": { "source": "iana" },
		"audio/vnd.dece.audio": {
			"source": "iana",
			"extensions": ["uva", "uvva"]
		},
		"audio/vnd.digital-winds": {
			"source": "iana",
			"extensions": ["eol"]
		},
		"audio/vnd.dlna.adts": { "source": "iana" },
		"audio/vnd.dolby.heaac.1": { "source": "iana" },
		"audio/vnd.dolby.heaac.2": { "source": "iana" },
		"audio/vnd.dolby.mlp": { "source": "iana" },
		"audio/vnd.dolby.mps": { "source": "iana" },
		"audio/vnd.dolby.pl2": { "source": "iana" },
		"audio/vnd.dolby.pl2x": { "source": "iana" },
		"audio/vnd.dolby.pl2z": { "source": "iana" },
		"audio/vnd.dolby.pulse.1": { "source": "iana" },
		"audio/vnd.dra": {
			"source": "iana",
			"extensions": ["dra"]
		},
		"audio/vnd.dts": {
			"source": "iana",
			"extensions": ["dts"]
		},
		"audio/vnd.dts.hd": {
			"source": "iana",
			"extensions": ["dtshd"]
		},
		"audio/vnd.dts.uhd": { "source": "iana" },
		"audio/vnd.dvb.file": { "source": "iana" },
		"audio/vnd.everad.plj": { "source": "iana" },
		"audio/vnd.hns.audio": { "source": "iana" },
		"audio/vnd.lucent.voice": {
			"source": "iana",
			"extensions": ["lvp"]
		},
		"audio/vnd.ms-playready.media.pya": {
			"source": "iana",
			"extensions": ["pya"]
		},
		"audio/vnd.nokia.mobile-xmf": { "source": "iana" },
		"audio/vnd.nortel.vbk": { "source": "iana" },
		"audio/vnd.nuera.ecelp4800": {
			"source": "iana",
			"extensions": ["ecelp4800"]
		},
		"audio/vnd.nuera.ecelp7470": {
			"source": "iana",
			"extensions": ["ecelp7470"]
		},
		"audio/vnd.nuera.ecelp9600": {
			"source": "iana",
			"extensions": ["ecelp9600"]
		},
		"audio/vnd.octel.sbc": { "source": "iana" },
		"audio/vnd.presonus.multitrack": { "source": "iana" },
		"audio/vnd.qcelp": { "source": "iana" },
		"audio/vnd.rhetorex.32kadpcm": { "source": "iana" },
		"audio/vnd.rip": {
			"source": "iana",
			"extensions": ["rip"]
		},
		"audio/vnd.rn-realaudio": { "compressible": false },
		"audio/vnd.sealedmedia.softseal.mpeg": { "source": "iana" },
		"audio/vnd.vmx.cvsd": { "source": "iana" },
		"audio/vnd.wave": { "compressible": false },
		"audio/vorbis": {
			"source": "iana",
			"compressible": false
		},
		"audio/vorbis-config": { "source": "iana" },
		"audio/wav": {
			"compressible": false,
			"extensions": ["wav"]
		},
		"audio/wave": {
			"compressible": false,
			"extensions": ["wav"]
		},
		"audio/webm": {
			"source": "apache",
			"compressible": false,
			"extensions": ["weba"]
		},
		"audio/x-aac": {
			"source": "apache",
			"compressible": false,
			"extensions": ["aac"]
		},
		"audio/x-aiff": {
			"source": "apache",
			"extensions": [
				"aif",
				"aiff",
				"aifc"
			]
		},
		"audio/x-caf": {
			"source": "apache",
			"compressible": false,
			"extensions": ["caf"]
		},
		"audio/x-flac": {
			"source": "apache",
			"extensions": ["flac"]
		},
		"audio/x-m4a": {
			"source": "nginx",
			"extensions": ["m4a"]
		},
		"audio/x-matroska": {
			"source": "apache",
			"extensions": ["mka"]
		},
		"audio/x-mpegurl": {
			"source": "apache",
			"extensions": ["m3u"]
		},
		"audio/x-ms-wax": {
			"source": "apache",
			"extensions": ["wax"]
		},
		"audio/x-ms-wma": {
			"source": "apache",
			"extensions": ["wma"]
		},
		"audio/x-pn-realaudio": {
			"source": "apache",
			"extensions": ["ram", "ra"]
		},
		"audio/x-pn-realaudio-plugin": {
			"source": "apache",
			"extensions": ["rmp"]
		},
		"audio/x-realaudio": {
			"source": "nginx",
			"extensions": ["ra"]
		},
		"audio/x-tta": { "source": "apache" },
		"audio/x-wav": {
			"source": "apache",
			"extensions": ["wav"]
		},
		"audio/xm": {
			"source": "apache",
			"extensions": ["xm"]
		},
		"chemical/x-cdx": {
			"source": "apache",
			"extensions": ["cdx"]
		},
		"chemical/x-cif": {
			"source": "apache",
			"extensions": ["cif"]
		},
		"chemical/x-cmdf": {
			"source": "apache",
			"extensions": ["cmdf"]
		},
		"chemical/x-cml": {
			"source": "apache",
			"extensions": ["cml"]
		},
		"chemical/x-csml": {
			"source": "apache",
			"extensions": ["csml"]
		},
		"chemical/x-pdb": { "source": "apache" },
		"chemical/x-xyz": {
			"source": "apache",
			"extensions": ["xyz"]
		},
		"font/collection": {
			"source": "iana",
			"extensions": ["ttc"]
		},
		"font/otf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["otf"]
		},
		"font/sfnt": { "source": "iana" },
		"font/ttf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ttf"]
		},
		"font/woff": {
			"source": "iana",
			"extensions": ["woff"]
		},
		"font/woff2": {
			"source": "iana",
			"extensions": ["woff2"]
		},
		"image/aces": {
			"source": "iana",
			"extensions": ["exr"]
		},
		"image/apng": {
			"compressible": false,
			"extensions": ["apng"]
		},
		"image/avci": {
			"source": "iana",
			"extensions": ["avci"]
		},
		"image/avcs": {
			"source": "iana",
			"extensions": ["avcs"]
		},
		"image/avif": {
			"source": "iana",
			"compressible": false,
			"extensions": ["avif"]
		},
		"image/bmp": {
			"source": "iana",
			"compressible": true,
			"extensions": ["bmp"]
		},
		"image/cgm": {
			"source": "iana",
			"extensions": ["cgm"]
		},
		"image/dicom-rle": {
			"source": "iana",
			"extensions": ["drle"]
		},
		"image/emf": {
			"source": "iana",
			"extensions": ["emf"]
		},
		"image/fits": {
			"source": "iana",
			"extensions": ["fits"]
		},
		"image/g3fax": {
			"source": "iana",
			"extensions": ["g3"]
		},
		"image/gif": {
			"source": "iana",
			"compressible": false,
			"extensions": ["gif"]
		},
		"image/heic": {
			"source": "iana",
			"extensions": ["heic"]
		},
		"image/heic-sequence": {
			"source": "iana",
			"extensions": ["heics"]
		},
		"image/heif": {
			"source": "iana",
			"extensions": ["heif"]
		},
		"image/heif-sequence": {
			"source": "iana",
			"extensions": ["heifs"]
		},
		"image/hej2k": {
			"source": "iana",
			"extensions": ["hej2"]
		},
		"image/hsj2": {
			"source": "iana",
			"extensions": ["hsj2"]
		},
		"image/ief": {
			"source": "iana",
			"extensions": ["ief"]
		},
		"image/jls": {
			"source": "iana",
			"extensions": ["jls"]
		},
		"image/jp2": {
			"source": "iana",
			"compressible": false,
			"extensions": ["jp2", "jpg2"]
		},
		"image/jpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"jpeg",
				"jpg",
				"jpe"
			]
		},
		"image/jph": {
			"source": "iana",
			"extensions": ["jph"]
		},
		"image/jphc": {
			"source": "iana",
			"extensions": ["jhc"]
		},
		"image/jpm": {
			"source": "iana",
			"compressible": false,
			"extensions": ["jpm"]
		},
		"image/jpx": {
			"source": "iana",
			"compressible": false,
			"extensions": ["jpx", "jpf"]
		},
		"image/jxr": {
			"source": "iana",
			"extensions": ["jxr"]
		},
		"image/jxra": {
			"source": "iana",
			"extensions": ["jxra"]
		},
		"image/jxrs": {
			"source": "iana",
			"extensions": ["jxrs"]
		},
		"image/jxs": {
			"source": "iana",
			"extensions": ["jxs"]
		},
		"image/jxsc": {
			"source": "iana",
			"extensions": ["jxsc"]
		},
		"image/jxsi": {
			"source": "iana",
			"extensions": ["jxsi"]
		},
		"image/jxss": {
			"source": "iana",
			"extensions": ["jxss"]
		},
		"image/ktx": {
			"source": "iana",
			"extensions": ["ktx"]
		},
		"image/ktx2": {
			"source": "iana",
			"extensions": ["ktx2"]
		},
		"image/naplps": { "source": "iana" },
		"image/pjpeg": { "compressible": false },
		"image/png": {
			"source": "iana",
			"compressible": false,
			"extensions": ["png"]
		},
		"image/prs.btif": {
			"source": "iana",
			"extensions": ["btif"]
		},
		"image/prs.pti": {
			"source": "iana",
			"extensions": ["pti"]
		},
		"image/pwg-raster": { "source": "iana" },
		"image/sgi": {
			"source": "apache",
			"extensions": ["sgi"]
		},
		"image/svg+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["svg", "svgz"]
		},
		"image/t38": {
			"source": "iana",
			"extensions": ["t38"]
		},
		"image/tiff": {
			"source": "iana",
			"compressible": false,
			"extensions": ["tif", "tiff"]
		},
		"image/tiff-fx": {
			"source": "iana",
			"extensions": ["tfx"]
		},
		"image/vnd.adobe.photoshop": {
			"source": "iana",
			"compressible": true,
			"extensions": ["psd"]
		},
		"image/vnd.airzip.accelerator.azv": {
			"source": "iana",
			"extensions": ["azv"]
		},
		"image/vnd.cns.inf2": { "source": "iana" },
		"image/vnd.dece.graphic": {
			"source": "iana",
			"extensions": [
				"uvi",
				"uvvi",
				"uvg",
				"uvvg"
			]
		},
		"image/vnd.djvu": {
			"source": "iana",
			"extensions": ["djvu", "djv"]
		},
		"image/vnd.dvb.subtitle": {
			"source": "iana",
			"extensions": ["sub"]
		},
		"image/vnd.dwg": {
			"source": "iana",
			"extensions": ["dwg"]
		},
		"image/vnd.dxf": {
			"source": "iana",
			"extensions": ["dxf"]
		},
		"image/vnd.fastbidsheet": {
			"source": "iana",
			"extensions": ["fbs"]
		},
		"image/vnd.fpx": {
			"source": "iana",
			"extensions": ["fpx"]
		},
		"image/vnd.fst": {
			"source": "iana",
			"extensions": ["fst"]
		},
		"image/vnd.fujixerox.edmics-mmr": {
			"source": "iana",
			"extensions": ["mmr"]
		},
		"image/vnd.fujixerox.edmics-rlc": {
			"source": "iana",
			"extensions": ["rlc"]
		},
		"image/vnd.globalgraphics.pgb": { "source": "iana" },
		"image/vnd.microsoft.icon": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ico"]
		},
		"image/vnd.mix": { "source": "iana" },
		"image/vnd.mozilla.apng": { "source": "iana" },
		"image/vnd.ms-dds": {
			"compressible": true,
			"extensions": ["dds"]
		},
		"image/vnd.ms-modi": {
			"source": "iana",
			"extensions": ["mdi"]
		},
		"image/vnd.ms-photo": {
			"source": "apache",
			"extensions": ["wdp"]
		},
		"image/vnd.net-fpx": {
			"source": "iana",
			"extensions": ["npx"]
		},
		"image/vnd.pco.b16": {
			"source": "iana",
			"extensions": ["b16"]
		},
		"image/vnd.radiance": { "source": "iana" },
		"image/vnd.sealed.png": { "source": "iana" },
		"image/vnd.sealedmedia.softseal.gif": { "source": "iana" },
		"image/vnd.sealedmedia.softseal.jpg": { "source": "iana" },
		"image/vnd.svf": { "source": "iana" },
		"image/vnd.tencent.tap": {
			"source": "iana",
			"extensions": ["tap"]
		},
		"image/vnd.valve.source.texture": {
			"source": "iana",
			"extensions": ["vtf"]
		},
		"image/vnd.wap.wbmp": {
			"source": "iana",
			"extensions": ["wbmp"]
		},
		"image/vnd.xiff": {
			"source": "iana",
			"extensions": ["xif"]
		},
		"image/vnd.zbrush.pcx": {
			"source": "iana",
			"extensions": ["pcx"]
		},
		"image/webp": {
			"source": "apache",
			"extensions": ["webp"]
		},
		"image/wmf": {
			"source": "iana",
			"extensions": ["wmf"]
		},
		"image/x-3ds": {
			"source": "apache",
			"extensions": ["3ds"]
		},
		"image/x-cmu-raster": {
			"source": "apache",
			"extensions": ["ras"]
		},
		"image/x-cmx": {
			"source": "apache",
			"extensions": ["cmx"]
		},
		"image/x-freehand": {
			"source": "apache",
			"extensions": [
				"fh",
				"fhc",
				"fh4",
				"fh5",
				"fh7"
			]
		},
		"image/x-icon": {
			"source": "apache",
			"compressible": true,
			"extensions": ["ico"]
		},
		"image/x-jng": {
			"source": "nginx",
			"extensions": ["jng"]
		},
		"image/x-mrsid-image": {
			"source": "apache",
			"extensions": ["sid"]
		},
		"image/x-ms-bmp": {
			"source": "nginx",
			"compressible": true,
			"extensions": ["bmp"]
		},
		"image/x-pcx": {
			"source": "apache",
			"extensions": ["pcx"]
		},
		"image/x-pict": {
			"source": "apache",
			"extensions": ["pic", "pct"]
		},
		"image/x-portable-anymap": {
			"source": "apache",
			"extensions": ["pnm"]
		},
		"image/x-portable-bitmap": {
			"source": "apache",
			"extensions": ["pbm"]
		},
		"image/x-portable-graymap": {
			"source": "apache",
			"extensions": ["pgm"]
		},
		"image/x-portable-pixmap": {
			"source": "apache",
			"extensions": ["ppm"]
		},
		"image/x-rgb": {
			"source": "apache",
			"extensions": ["rgb"]
		},
		"image/x-tga": {
			"source": "apache",
			"extensions": ["tga"]
		},
		"image/x-xbitmap": {
			"source": "apache",
			"extensions": ["xbm"]
		},
		"image/x-xcf": { "compressible": false },
		"image/x-xpixmap": {
			"source": "apache",
			"extensions": ["xpm"]
		},
		"image/x-xwindowdump": {
			"source": "apache",
			"extensions": ["xwd"]
		},
		"message/cpim": { "source": "iana" },
		"message/delivery-status": { "source": "iana" },
		"message/disposition-notification": {
			"source": "iana",
			"extensions": ["disposition-notification"]
		},
		"message/external-body": { "source": "iana" },
		"message/feedback-report": { "source": "iana" },
		"message/global": {
			"source": "iana",
			"extensions": ["u8msg"]
		},
		"message/global-delivery-status": {
			"source": "iana",
			"extensions": ["u8dsn"]
		},
		"message/global-disposition-notification": {
			"source": "iana",
			"extensions": ["u8mdn"]
		},
		"message/global-headers": {
			"source": "iana",
			"extensions": ["u8hdr"]
		},
		"message/http": {
			"source": "iana",
			"compressible": false
		},
		"message/imdn+xml": {
			"source": "iana",
			"compressible": true
		},
		"message/news": { "source": "iana" },
		"message/partial": {
			"source": "iana",
			"compressible": false
		},
		"message/rfc822": {
			"source": "iana",
			"compressible": true,
			"extensions": ["eml", "mime"]
		},
		"message/s-http": { "source": "iana" },
		"message/sip": { "source": "iana" },
		"message/sipfrag": { "source": "iana" },
		"message/tracking-status": { "source": "iana" },
		"message/vnd.si.simp": { "source": "iana" },
		"message/vnd.wfa.wsc": {
			"source": "iana",
			"extensions": ["wsc"]
		},
		"model/3mf": {
			"source": "iana",
			"extensions": ["3mf"]
		},
		"model/e57": { "source": "iana" },
		"model/gltf+json": {
			"source": "iana",
			"compressible": true,
			"extensions": ["gltf"]
		},
		"model/gltf-binary": {
			"source": "iana",
			"compressible": true,
			"extensions": ["glb"]
		},
		"model/iges": {
			"source": "iana",
			"compressible": false,
			"extensions": ["igs", "iges"]
		},
		"model/mesh": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"msh",
				"mesh",
				"silo"
			]
		},
		"model/mtl": {
			"source": "iana",
			"extensions": ["mtl"]
		},
		"model/obj": {
			"source": "iana",
			"extensions": ["obj"]
		},
		"model/step": { "source": "iana" },
		"model/step+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["stpx"]
		},
		"model/step+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["stpz"]
		},
		"model/step-xml+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["stpxz"]
		},
		"model/stl": {
			"source": "iana",
			"extensions": ["stl"]
		},
		"model/vnd.collada+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dae"]
		},
		"model/vnd.dwf": {
			"source": "iana",
			"extensions": ["dwf"]
		},
		"model/vnd.flatland.3dml": { "source": "iana" },
		"model/vnd.gdl": {
			"source": "iana",
			"extensions": ["gdl"]
		},
		"model/vnd.gs-gdl": { "source": "apache" },
		"model/vnd.gs.gdl": { "source": "iana" },
		"model/vnd.gtw": {
			"source": "iana",
			"extensions": ["gtw"]
		},
		"model/vnd.moml+xml": {
			"source": "iana",
			"compressible": true
		},
		"model/vnd.mts": {
			"source": "iana",
			"extensions": ["mts"]
		},
		"model/vnd.opengex": {
			"source": "iana",
			"extensions": ["ogex"]
		},
		"model/vnd.parasolid.transmit.binary": {
			"source": "iana",
			"extensions": ["x_b"]
		},
		"model/vnd.parasolid.transmit.text": {
			"source": "iana",
			"extensions": ["x_t"]
		},
		"model/vnd.pytha.pyox": { "source": "iana" },
		"model/vnd.rosette.annotated-data-model": { "source": "iana" },
		"model/vnd.sap.vds": {
			"source": "iana",
			"extensions": ["vds"]
		},
		"model/vnd.usdz+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["usdz"]
		},
		"model/vnd.valve.source.compiled-map": {
			"source": "iana",
			"extensions": ["bsp"]
		},
		"model/vnd.vtu": {
			"source": "iana",
			"extensions": ["vtu"]
		},
		"model/vrml": {
			"source": "iana",
			"compressible": false,
			"extensions": ["wrl", "vrml"]
		},
		"model/x3d+binary": {
			"source": "apache",
			"compressible": false,
			"extensions": ["x3db", "x3dbz"]
		},
		"model/x3d+fastinfoset": {
			"source": "iana",
			"extensions": ["x3db"]
		},
		"model/x3d+vrml": {
			"source": "apache",
			"compressible": false,
			"extensions": ["x3dv", "x3dvz"]
		},
		"model/x3d+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["x3d", "x3dz"]
		},
		"model/x3d-vrml": {
			"source": "iana",
			"extensions": ["x3dv"]
		},
		"multipart/alternative": {
			"source": "iana",
			"compressible": false
		},
		"multipart/appledouble": { "source": "iana" },
		"multipart/byteranges": { "source": "iana" },
		"multipart/digest": { "source": "iana" },
		"multipart/encrypted": {
			"source": "iana",
			"compressible": false
		},
		"multipart/form-data": {
			"source": "iana",
			"compressible": false
		},
		"multipart/header-set": { "source": "iana" },
		"multipart/mixed": { "source": "iana" },
		"multipart/multilingual": { "source": "iana" },
		"multipart/parallel": { "source": "iana" },
		"multipart/related": {
			"source": "iana",
			"compressible": false
		},
		"multipart/report": { "source": "iana" },
		"multipart/signed": {
			"source": "iana",
			"compressible": false
		},
		"multipart/vnd.bint.med-plus": { "source": "iana" },
		"multipart/voice-message": { "source": "iana" },
		"multipart/x-mixed-replace": { "source": "iana" },
		"text/1d-interleaved-parityfec": { "source": "iana" },
		"text/cache-manifest": {
			"source": "iana",
			"compressible": true,
			"extensions": ["appcache", "manifest"]
		},
		"text/calendar": {
			"source": "iana",
			"extensions": ["ics", "ifb"]
		},
		"text/calender": { "compressible": true },
		"text/cmd": { "compressible": true },
		"text/coffeescript": { "extensions": ["coffee", "litcoffee"] },
		"text/cql": { "source": "iana" },
		"text/cql-expression": { "source": "iana" },
		"text/cql-identifier": { "source": "iana" },
		"text/css": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["css"]
		},
		"text/csv": {
			"source": "iana",
			"compressible": true,
			"extensions": ["csv"]
		},
		"text/csv-schema": { "source": "iana" },
		"text/directory": { "source": "iana" },
		"text/dns": { "source": "iana" },
		"text/ecmascript": { "source": "iana" },
		"text/encaprtp": { "source": "iana" },
		"text/enriched": { "source": "iana" },
		"text/fhirpath": { "source": "iana" },
		"text/flexfec": { "source": "iana" },
		"text/fwdred": { "source": "iana" },
		"text/gff3": { "source": "iana" },
		"text/grammar-ref-list": { "source": "iana" },
		"text/html": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"html",
				"htm",
				"shtml"
			]
		},
		"text/jade": { "extensions": ["jade"] },
		"text/javascript": {
			"source": "iana",
			"compressible": true
		},
		"text/jcr-cnd": { "source": "iana" },
		"text/jsx": {
			"compressible": true,
			"extensions": ["jsx"]
		},
		"text/less": {
			"compressible": true,
			"extensions": ["less"]
		},
		"text/markdown": {
			"source": "iana",
			"compressible": true,
			"extensions": ["markdown", "md"]
		},
		"text/mathml": {
			"source": "nginx",
			"extensions": ["mml"]
		},
		"text/mdx": {
			"compressible": true,
			"extensions": ["mdx"]
		},
		"text/mizar": { "source": "iana" },
		"text/n3": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["n3"]
		},
		"text/parameters": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/parityfec": { "source": "iana" },
		"text/plain": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"txt",
				"text",
				"conf",
				"def",
				"list",
				"log",
				"in",
				"ini"
			]
		},
		"text/provenance-notation": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/prs.fallenstein.rst": { "source": "iana" },
		"text/prs.lines.tag": {
			"source": "iana",
			"extensions": ["dsc"]
		},
		"text/prs.prop.logic": { "source": "iana" },
		"text/raptorfec": { "source": "iana" },
		"text/red": { "source": "iana" },
		"text/rfc822-headers": { "source": "iana" },
		"text/richtext": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rtx"]
		},
		"text/rtf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rtf"]
		},
		"text/rtp-enc-aescm128": { "source": "iana" },
		"text/rtploopback": { "source": "iana" },
		"text/rtx": { "source": "iana" },
		"text/sgml": {
			"source": "iana",
			"extensions": ["sgml", "sgm"]
		},
		"text/shaclc": { "source": "iana" },
		"text/shex": {
			"source": "iana",
			"extensions": ["shex"]
		},
		"text/slim": { "extensions": ["slim", "slm"] },
		"text/spdx": {
			"source": "iana",
			"extensions": ["spdx"]
		},
		"text/strings": { "source": "iana" },
		"text/stylus": { "extensions": ["stylus", "styl"] },
		"text/t140": { "source": "iana" },
		"text/tab-separated-values": {
			"source": "iana",
			"compressible": true,
			"extensions": ["tsv"]
		},
		"text/troff": {
			"source": "iana",
			"extensions": [
				"t",
				"tr",
				"roff",
				"man",
				"me",
				"ms"
			]
		},
		"text/turtle": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["ttl"]
		},
		"text/ulpfec": { "source": "iana" },
		"text/uri-list": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"uri",
				"uris",
				"urls"
			]
		},
		"text/vcard": {
			"source": "iana",
			"compressible": true,
			"extensions": ["vcard"]
		},
		"text/vnd.a": { "source": "iana" },
		"text/vnd.abc": { "source": "iana" },
		"text/vnd.ascii-art": { "source": "iana" },
		"text/vnd.curl": {
			"source": "iana",
			"extensions": ["curl"]
		},
		"text/vnd.curl.dcurl": {
			"source": "apache",
			"extensions": ["dcurl"]
		},
		"text/vnd.curl.mcurl": {
			"source": "apache",
			"extensions": ["mcurl"]
		},
		"text/vnd.curl.scurl": {
			"source": "apache",
			"extensions": ["scurl"]
		},
		"text/vnd.debian.copyright": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/vnd.dmclientscript": { "source": "iana" },
		"text/vnd.dvb.subtitle": {
			"source": "iana",
			"extensions": ["sub"]
		},
		"text/vnd.esmertec.theme-descriptor": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/vnd.familysearch.gedcom": {
			"source": "iana",
			"extensions": ["ged"]
		},
		"text/vnd.ficlab.flt": { "source": "iana" },
		"text/vnd.fly": {
			"source": "iana",
			"extensions": ["fly"]
		},
		"text/vnd.fmi.flexstor": {
			"source": "iana",
			"extensions": ["flx"]
		},
		"text/vnd.gml": { "source": "iana" },
		"text/vnd.graphviz": {
			"source": "iana",
			"extensions": ["gv"]
		},
		"text/vnd.hans": { "source": "iana" },
		"text/vnd.hgl": { "source": "iana" },
		"text/vnd.in3d.3dml": {
			"source": "iana",
			"extensions": ["3dml"]
		},
		"text/vnd.in3d.spot": {
			"source": "iana",
			"extensions": ["spot"]
		},
		"text/vnd.iptc.newsml": { "source": "iana" },
		"text/vnd.iptc.nitf": { "source": "iana" },
		"text/vnd.latex-z": { "source": "iana" },
		"text/vnd.motorola.reflex": { "source": "iana" },
		"text/vnd.ms-mediapackage": { "source": "iana" },
		"text/vnd.net2phone.commcenter.command": { "source": "iana" },
		"text/vnd.radisys.msml-basic-layout": { "source": "iana" },
		"text/vnd.senx.warpscript": { "source": "iana" },
		"text/vnd.si.uricatalogue": { "source": "iana" },
		"text/vnd.sosi": { "source": "iana" },
		"text/vnd.sun.j2me.app-descriptor": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["jad"]
		},
		"text/vnd.trolltech.linguist": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/vnd.wap.si": { "source": "iana" },
		"text/vnd.wap.sl": { "source": "iana" },
		"text/vnd.wap.wml": {
			"source": "iana",
			"extensions": ["wml"]
		},
		"text/vnd.wap.wmlscript": {
			"source": "iana",
			"extensions": ["wmls"]
		},
		"text/vtt": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["vtt"]
		},
		"text/x-asm": {
			"source": "apache",
			"extensions": ["s", "asm"]
		},
		"text/x-c": {
			"source": "apache",
			"extensions": [
				"c",
				"cc",
				"cxx",
				"cpp",
				"h",
				"hh",
				"dic"
			]
		},
		"text/x-component": {
			"source": "nginx",
			"extensions": ["htc"]
		},
		"text/x-fortran": {
			"source": "apache",
			"extensions": [
				"f",
				"for",
				"f77",
				"f90"
			]
		},
		"text/x-gwt-rpc": { "compressible": true },
		"text/x-handlebars-template": { "extensions": ["hbs"] },
		"text/x-java-source": {
			"source": "apache",
			"extensions": ["java"]
		},
		"text/x-jquery-tmpl": { "compressible": true },
		"text/x-lua": { "extensions": ["lua"] },
		"text/x-markdown": {
			"compressible": true,
			"extensions": ["mkd"]
		},
		"text/x-nfo": {
			"source": "apache",
			"extensions": ["nfo"]
		},
		"text/x-opml": {
			"source": "apache",
			"extensions": ["opml"]
		},
		"text/x-org": {
			"compressible": true,
			"extensions": ["org"]
		},
		"text/x-pascal": {
			"source": "apache",
			"extensions": ["p", "pas"]
		},
		"text/x-processing": {
			"compressible": true,
			"extensions": ["pde"]
		},
		"text/x-sass": { "extensions": ["sass"] },
		"text/x-scss": { "extensions": ["scss"] },
		"text/x-setext": {
			"source": "apache",
			"extensions": ["etx"]
		},
		"text/x-sfv": {
			"source": "apache",
			"extensions": ["sfv"]
		},
		"text/x-suse-ymp": {
			"compressible": true,
			"extensions": ["ymp"]
		},
		"text/x-uuencode": {
			"source": "apache",
			"extensions": ["uu"]
		},
		"text/x-vcalendar": {
			"source": "apache",
			"extensions": ["vcs"]
		},
		"text/x-vcard": {
			"source": "apache",
			"extensions": ["vcf"]
		},
		"text/xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xml"]
		},
		"text/xml-external-parsed-entity": { "source": "iana" },
		"text/yaml": {
			"compressible": true,
			"extensions": ["yaml", "yml"]
		},
		"video/1d-interleaved-parityfec": { "source": "iana" },
		"video/3gpp": {
			"source": "iana",
			"extensions": ["3gp", "3gpp"]
		},
		"video/3gpp-tt": { "source": "iana" },
		"video/3gpp2": {
			"source": "iana",
			"extensions": ["3g2"]
		},
		"video/av1": { "source": "iana" },
		"video/bmpeg": { "source": "iana" },
		"video/bt656": { "source": "iana" },
		"video/celb": { "source": "iana" },
		"video/dv": { "source": "iana" },
		"video/encaprtp": { "source": "iana" },
		"video/ffv1": { "source": "iana" },
		"video/flexfec": { "source": "iana" },
		"video/h261": {
			"source": "iana",
			"extensions": ["h261"]
		},
		"video/h263": {
			"source": "iana",
			"extensions": ["h263"]
		},
		"video/h263-1998": { "source": "iana" },
		"video/h263-2000": { "source": "iana" },
		"video/h264": {
			"source": "iana",
			"extensions": ["h264"]
		},
		"video/h264-rcdo": { "source": "iana" },
		"video/h264-svc": { "source": "iana" },
		"video/h265": { "source": "iana" },
		"video/iso.segment": {
			"source": "iana",
			"extensions": ["m4s"]
		},
		"video/jpeg": {
			"source": "iana",
			"extensions": ["jpgv"]
		},
		"video/jpeg2000": { "source": "iana" },
		"video/jpm": {
			"source": "apache",
			"extensions": ["jpm", "jpgm"]
		},
		"video/jxsv": { "source": "iana" },
		"video/mj2": {
			"source": "iana",
			"extensions": ["mj2", "mjp2"]
		},
		"video/mp1s": { "source": "iana" },
		"video/mp2p": { "source": "iana" },
		"video/mp2t": {
			"source": "iana",
			"extensions": ["ts"]
		},
		"video/mp4": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"mp4",
				"mp4v",
				"mpg4"
			]
		},
		"video/mp4v-es": { "source": "iana" },
		"video/mpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"mpeg",
				"mpg",
				"mpe",
				"m1v",
				"m2v"
			]
		},
		"video/mpeg4-generic": { "source": "iana" },
		"video/mpv": { "source": "iana" },
		"video/nv": { "source": "iana" },
		"video/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": ["ogv"]
		},
		"video/parityfec": { "source": "iana" },
		"video/pointer": { "source": "iana" },
		"video/quicktime": {
			"source": "iana",
			"compressible": false,
			"extensions": ["qt", "mov"]
		},
		"video/raptorfec": { "source": "iana" },
		"video/raw": { "source": "iana" },
		"video/rtp-enc-aescm128": { "source": "iana" },
		"video/rtploopback": { "source": "iana" },
		"video/rtx": { "source": "iana" },
		"video/scip": { "source": "iana" },
		"video/smpte291": { "source": "iana" },
		"video/smpte292m": { "source": "iana" },
		"video/ulpfec": { "source": "iana" },
		"video/vc1": { "source": "iana" },
		"video/vc2": { "source": "iana" },
		"video/vnd.cctv": { "source": "iana" },
		"video/vnd.dece.hd": {
			"source": "iana",
			"extensions": ["uvh", "uvvh"]
		},
		"video/vnd.dece.mobile": {
			"source": "iana",
			"extensions": ["uvm", "uvvm"]
		},
		"video/vnd.dece.mp4": { "source": "iana" },
		"video/vnd.dece.pd": {
			"source": "iana",
			"extensions": ["uvp", "uvvp"]
		},
		"video/vnd.dece.sd": {
			"source": "iana",
			"extensions": ["uvs", "uvvs"]
		},
		"video/vnd.dece.video": {
			"source": "iana",
			"extensions": ["uvv", "uvvv"]
		},
		"video/vnd.directv.mpeg": { "source": "iana" },
		"video/vnd.directv.mpeg-tts": { "source": "iana" },
		"video/vnd.dlna.mpeg-tts": { "source": "iana" },
		"video/vnd.dvb.file": {
			"source": "iana",
			"extensions": ["dvb"]
		},
		"video/vnd.fvt": {
			"source": "iana",
			"extensions": ["fvt"]
		},
		"video/vnd.hns.video": { "source": "iana" },
		"video/vnd.iptvforum.1dparityfec-1010": { "source": "iana" },
		"video/vnd.iptvforum.1dparityfec-2005": { "source": "iana" },
		"video/vnd.iptvforum.2dparityfec-1010": { "source": "iana" },
		"video/vnd.iptvforum.2dparityfec-2005": { "source": "iana" },
		"video/vnd.iptvforum.ttsavc": { "source": "iana" },
		"video/vnd.iptvforum.ttsmpeg2": { "source": "iana" },
		"video/vnd.motorola.video": { "source": "iana" },
		"video/vnd.motorola.videop": { "source": "iana" },
		"video/vnd.mpegurl": {
			"source": "iana",
			"extensions": ["mxu", "m4u"]
		},
		"video/vnd.ms-playready.media.pyv": {
			"source": "iana",
			"extensions": ["pyv"]
		},
		"video/vnd.nokia.interleaved-multimedia": { "source": "iana" },
		"video/vnd.nokia.mp4vr": { "source": "iana" },
		"video/vnd.nokia.videovoip": { "source": "iana" },
		"video/vnd.objectvideo": { "source": "iana" },
		"video/vnd.radgamettools.bink": { "source": "iana" },
		"video/vnd.radgamettools.smacker": { "source": "iana" },
		"video/vnd.sealed.mpeg1": { "source": "iana" },
		"video/vnd.sealed.mpeg4": { "source": "iana" },
		"video/vnd.sealed.swf": { "source": "iana" },
		"video/vnd.sealedmedia.softseal.mov": { "source": "iana" },
		"video/vnd.uvvu.mp4": {
			"source": "iana",
			"extensions": ["uvu", "uvvu"]
		},
		"video/vnd.vivo": {
			"source": "iana",
			"extensions": ["viv"]
		},
		"video/vnd.youtube.yt": { "source": "iana" },
		"video/vp8": { "source": "iana" },
		"video/vp9": { "source": "iana" },
		"video/webm": {
			"source": "apache",
			"compressible": false,
			"extensions": ["webm"]
		},
		"video/x-f4v": {
			"source": "apache",
			"extensions": ["f4v"]
		},
		"video/x-fli": {
			"source": "apache",
			"extensions": ["fli"]
		},
		"video/x-flv": {
			"source": "apache",
			"compressible": false,
			"extensions": ["flv"]
		},
		"video/x-m4v": {
			"source": "apache",
			"extensions": ["m4v"]
		},
		"video/x-matroska": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"mkv",
				"mk3d",
				"mks"
			]
		},
		"video/x-mng": {
			"source": "apache",
			"extensions": ["mng"]
		},
		"video/x-ms-asf": {
			"source": "apache",
			"extensions": ["asf", "asx"]
		},
		"video/x-ms-vob": {
			"source": "apache",
			"extensions": ["vob"]
		},
		"video/x-ms-wm": {
			"source": "apache",
			"extensions": ["wm"]
		},
		"video/x-ms-wmv": {
			"source": "apache",
			"compressible": false,
			"extensions": ["wmv"]
		},
		"video/x-ms-wmx": {
			"source": "apache",
			"extensions": ["wmx"]
		},
		"video/x-ms-wvx": {
			"source": "apache",
			"extensions": ["wvx"]
		},
		"video/x-msvideo": {
			"source": "apache",
			"extensions": ["avi"]
		},
		"video/x-sgi-movie": {
			"source": "apache",
			"extensions": ["movie"]
		},
		"video/x-smv": {
			"source": "apache",
			"extensions": ["smv"]
		},
		"x-conference/x-cooltalk": {
			"source": "apache",
			"extensions": ["ice"]
		},
		"x-shader/x-fragment": { "compressible": true },
		"x-shader/x-vertex": { "compressible": true }
	};
}));
//#endregion
//#region node_modules/mime-db/index.js
var require_mime_db = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/*!
	* mime-db
	* Copyright(c) 2014 Jonathan Ong
	* Copyright(c) 2015-2022 Douglas Christopher Wilson
	* MIT Licensed
	*/
	/**
	* Module exports.
	*/
	module.exports = (init_db(), __toCommonJS(db_exports).default);
}));
/*!
* mime-types
* Copyright(c) 2014 Jonathan Ong
* Copyright(c) 2015 Douglas Christopher Wilson
* MIT Licensed
*/
//#endregion
//#region node_modules/jira.js/dist/esm/paramSerializer.mjs
var import_mime_types = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Module dependencies.
	* @private
	*/
	var db = require_mime_db();
	var extname = __require("path").extname;
	/**
	* Module variables.
	* @private
	*/
	var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
	var TEXT_TYPE_REGEXP = /^text\//i;
	/**
	* Module exports.
	* @public
	*/
	exports.charset = charset;
	exports.charsets = { lookup: charset };
	exports.contentType = contentType;
	exports.extension = extension;
	exports.extensions = Object.create(null);
	exports.lookup = lookup;
	exports.types = Object.create(null);
	populateMaps(exports.extensions, exports.types);
	/**
	* Get the default charset for a MIME type.
	*
	* @param {string} type
	* @return {boolean|string}
	*/
	function charset(type) {
		if (!type || typeof type !== "string") return false;
		var match = EXTRACT_TYPE_REGEXP.exec(type);
		var mime = match && db[match[1].toLowerCase()];
		if (mime && mime.charset) return mime.charset;
		if (match && TEXT_TYPE_REGEXP.test(match[1])) return "UTF-8";
		return false;
	}
	/**
	* Create a full Content-Type header given a MIME type or extension.
	*
	* @param {string} str
	* @return {boolean|string}
	*/
	function contentType(str) {
		if (!str || typeof str !== "string") return false;
		var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
		if (!mime) return false;
		if (mime.indexOf("charset") === -1) {
			var charset = exports.charset(mime);
			if (charset) mime += "; charset=" + charset.toLowerCase();
		}
		return mime;
	}
	/**
	* Get the default extension for a MIME type.
	*
	* @param {string} type
	* @return {boolean|string}
	*/
	function extension(type) {
		if (!type || typeof type !== "string") return false;
		var match = EXTRACT_TYPE_REGEXP.exec(type);
		var exts = match && exports.extensions[match[1].toLowerCase()];
		if (!exts || !exts.length) return false;
		return exts[0];
	}
	/**
	* Lookup the MIME type for a file path/extension.
	*
	* @param {string} path
	* @return {boolean|string}
	*/
	function lookup(path) {
		if (!path || typeof path !== "string") return false;
		var extension = extname("x." + path).toLowerCase().substr(1);
		if (!extension) return false;
		return exports.types[extension] || false;
	}
	/**
	* Populate the extensions and types maps.
	* @private
	*/
	function populateMaps(extensions, types) {
		var preference = [
			"nginx",
			"apache",
			void 0,
			"iana"
		];
		Object.keys(db).forEach(function forEachMimeType(type) {
			var mime = db[type];
			var exts = mime.extensions;
			if (!exts || !exts.length) return;
			extensions[type] = exts;
			for (var i = 0; i < exts.length; i++) {
				var extension = exts[i];
				if (types[extension]) {
					var from = preference.indexOf(db[types[extension]].source);
					var to = preference.indexOf(mime.source);
					if (types[extension] !== "application/octet-stream" && (from > to || from === to && types[extension].substr(0, 12) === "application/")) continue;
				}
				types[extension] = type;
			}
		});
	}
})))(), 1);
function paramSerializer(key, values) {
	if (values === void 0 || values === null) return void 0;
	if (Array.isArray(values)) {
		if (values.length === 0) return void 0;
		return values.map((v, i) => i === 0 ? String(v) : `${key}=${String(v)}`).join("&");
	}
	return encodeURIComponent(String(values));
}
//#endregion
//#region node_modules/jira.js/dist/esm/version3/models/projectId.mjs
/** Project ID details. */
var ProjectIdSchema = strictObject({ 
/** The ID of the project. */
id: string() });
//#endregion
//#region node_modules/jira.js/dist/esm/version3/models/projectIssueTypes.mjs
/**
* Use the optional `workflows.usages` expand instead to get information about the projects and issue types associated
* with the requested workflows.
*
* @deprecated See the deprecation notice: https://developer.atlassian.com/cloud/jira/platform/changelog/#CHANGE-2298
*/
var ProjectIssueTypesSchema = object({
	project: ProjectIdSchema.optional(),
	issueTypes: array(string()).optional()
});
//#endregion
//#region node_modules/jira.js/dist/esm/version3/models/statusScope.mjs
/** The scope of the status. */
var StatusScopeSchema = strictObject({
	/** The scope of the status. `GLOBAL` for company-managed projects and `PROJECT` for team-managed projects. */
	type: _enum(["GLOBAL", "PROJECT"]),
	project: ProjectIdSchema.optional()
});
//#endregion
//#region node_modules/jira.js/dist/esm/version3/models/jiraStatus.mjs
/** Details of a status. */
var JiraStatusSchema = strictObject({
	/** The ID of the status. */
	id: string(),
	/** The name of the status. */
	name: string(),
	/** The description of the status. */
	description: string(),
	scope: StatusScopeSchema,
	/** The category of the status. */
	statusCategory: _enum([
		"TODO",
		"IN_PROGRESS",
		"DONE"
	]),
	/**
	* @deprecated See the [deprecation
	*   notice](https://developer.atlassian.com/cloud/jira/platform/changelog/#CHANGE-2298) for details.
	*
	*   Projects and issue types where the status is used. Only available if the `usages` expand is requested.
	*/
	usages: ProjectIssueTypesSchema.optional()
});
//#endregion
//#region node_modules/jira.js/dist/esm/version3/announcementBanner.mjs
var AnnouncementBanner = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getBanner(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/announcementBanner",
			method: "GET"
		}, callback);
	}
	async setBanner(parameters, callback) {
		const config = {
			url: "/rest/api/3/announcementBanner",
			method: "PUT",
			data: {
				isDismissible: parameters?.isDismissible,
				isEnabled: parameters?.isEnabled,
				message: parameters?.message,
				visibility: parameters?.visibility
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/api.mjs
var Api = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getWorklogsByIssueIdAndWorklogId(parameters, callback) {
		const config = {
			url: "/rest/internal/api/latest/worklog/bulk",
			method: "POST",
			data: { requests: parameters.requests }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/appDataPolicies.mjs
var AppDataPolicies = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getPolicy(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/data-policy",
			method: "GET"
		}, callback);
	}
	async getPolicies(parameters, callback) {
		const config = {
			url: "/rest/api/3/data-policy/project",
			method: "GET",
			params: { ids: typeof parameters.ids === "string" ? parameters.ids : parameters.ids.join(",") }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/applicationRoles.mjs
var ApplicationRoles = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllApplicationRoles(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/applicationrole",
			method: "GET"
		}, callback);
	}
	async getApplicationRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/applicationrole/${typeof parameters === "string" ? parameters : parameters.key}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/appMigration.mjs
var AppMigration = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async updateIssueFields(parameters, callback) {
		const config = {
			url: "/rest/atlassian-connect/1/migration/field",
			method: "PUT",
			headers: {
				"Atlassian-Account-Id": parameters.accountId,
				"Atlassian-Transfer-Id": parameters.transferId
			},
			data: { updateValueList: parameters.updateValueList }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateEntityPropertiesValue(parameters, callback) {
		const config = {
			url: `/rest/atlassian-connect/1/migration/properties/${parameters.entityType}`,
			method: "PUT",
			headers: {
				"Atlassian-Account-Id": parameters.accountId,
				"Atlassian-Transfer-Id": parameters.transferId,
				"Content-Type": "application/json"
			},
			data: parameters.entities
		};
		return this.client.sendRequest(config, callback);
	}
	async workflowRuleSearch(parameters, callback) {
		const config = {
			url: "/rest/atlassian-connect/1/migration/workflow/rule/search",
			method: "POST",
			headers: { "Atlassian-Transfer-Id": parameters.transferId },
			data: {
				expand: parameters.expand,
				ruleIds: parameters.ruleIds,
				workflowEntityId: parameters.workflowEntityId
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/appProperties.mjs
var AppProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAddonProperties(parameters, callback) {
		const config = {
			url: `/rest/atlassian-connect/1/addons/${typeof parameters === "string" ? parameters : parameters.addonKey}/properties`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAddonProperty(parameters, callback) {
		const config = {
			url: `/rest/atlassian-connect/1/addons/${parameters.addonKey}/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async putAddonProperty(parameters, callback) {
		const config = {
			url: `/rest/atlassian-connect/1/addons/${parameters.addonKey}/properties/${parameters.propertyKey}`,
			method: "PUT",
			data: parameters.propertyValue
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteAddonProperty(parameters, callback) {
		const config = {
			url: `/rest/atlassian-connect/1/addons/${parameters.addonKey}/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getForgeAppPropertyKeys(callback) {
		return this.client.sendRequest({
			url: "/rest/forge/1/app/properties",
			method: "GET"
		}, callback);
	}
	async getForgeAppProperty(parameters, callback) {
		const config = {
			url: `/rest/forge/1/app/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async putAppProperty(parameters, callback) {
		const config = {
			url: `/rest/forge/1/app/properties/${parameters.propertyKey}`,
			method: "PUT",
			data: parameters.propertyValue
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteAppProperty(parameters, callback) {
		const config = {
			url: `/rest/forge/1/app/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/auditRecords.mjs
var AuditRecords = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAuditRecords(parameters, callback) {
		const config = {
			url: "/rest/api/3/auditing/record",
			method: "GET",
			params: {
				offset: parameters?.offset,
				limit: parameters?.limit,
				filter: parameters?.filter,
				from: parameters?.from,
				to: parameters?.to
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/avatars.mjs
var Avatars = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllSystemAvatars(parameters, callback) {
		const config = {
			url: `/rest/api/3/avatar/${typeof parameters === "string" ? parameters : parameters.type}/system`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAvatars(parameters, callback) {
		const config = {
			url: `/rest/api/3/universal_avatar/type/${parameters.type}/owner/${parameters.entityId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async storeAvatar(parameters, callback) {
		const config = {
			url: `/rest/api/3/universal_avatar/type/${parameters.type}/owner/${parameters.entityId}`,
			method: "POST",
			headers: {
				"X-Atlassian-Token": "no-check",
				"Content-Type": parameters.mimeType
			},
			params: {
				x: parameters.x,
				y: parameters.y,
				size: parameters.size ?? 0
			},
			data: parameters.avatar
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteAvatar(parameters, callback) {
		const config = {
			url: `/rest/api/3/universal_avatar/type/${parameters.type}/owner/${parameters.owningObjectId}/avatar/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAvatarImageByType(parameters, callback) {
		const config = {
			url: `/rest/api/3/universal_avatar/view/type/${typeof parameters === "string" ? parameters : parameters.type}`,
			method: "GET",
			responseType: "arraybuffer",
			params: {
				size: typeof parameters !== "string" ? parameters.size : void 0,
				format: typeof parameters !== "string" ? parameters.format : void 0
			}
		};
		const { data: avatar, headers: { "content-type": contentTypeWithEncoding } } = await this.client.sendRequestFullResponse(config);
		const contentType = contentTypeWithEncoding.split(";")[0].trim();
		return this.client.handleSuccessResponse({
			contentType,
			avatar
		}, callback);
	}
	async getAvatarImageByID(parameters, callback) {
		const config = {
			url: `/rest/api/3/universal_avatar/view/type/${parameters.type}/avatar/${parameters.id}`,
			method: "GET",
			responseType: "arraybuffer",
			params: {
				size: parameters.size,
				format: parameters.format
			}
		};
		const { data: avatar, headers: { "content-type": contentTypeWithEncoding } } = await this.client.sendRequestFullResponse(config);
		const contentType = contentTypeWithEncoding.split(";")[0].trim();
		return this.client.handleSuccessResponse({
			contentType,
			avatar
		}, callback);
	}
	async getAvatarImageByOwner(parameters, callback) {
		const config = {
			url: `/rest/api/3/universal_avatar/view/type/${parameters.type}/owner/${parameters.entityId}`,
			method: "GET",
			responseType: "arraybuffer",
			params: {
				size: parameters.size,
				format: parameters.format
			}
		};
		const { data: avatar, headers: { "content-type": contentTypeWithEncoding } } = await this.client.sendRequestFullResponse(config);
		const contentType = contentTypeWithEncoding.split(";")[0].trim();
		return this.client.handleSuccessResponse({
			contentType,
			avatar
		}, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/classificationLevels.mjs
var ClassificationLevels = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllUserDataClassificationLevels(parameters, callback) {
		const config = {
			url: "/rest/api/3/classification-levels",
			method: "GET",
			params: {
				status: parameters?.status,
				orderBy: parameters?.orderBy
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/dashboards.mjs
var Dashboards = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllDashboards(parameters, callback) {
		const config = {
			url: "/rest/api/3/dashboard",
			method: "GET",
			params: {
				filter: parameters?.filter,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createDashboard(parameters, callback) {
		const config = {
			url: "/rest/api/3/dashboard",
			method: "POST",
			params: { extendAdminPermissions: parameters.extendAdminPermissions },
			data: {
				description: parameters.description,
				editPermissions: parameters.editPermissions,
				name: parameters.name,
				sharePermissions: parameters.sharePermissions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkEditDashboards(parameters, callback) {
		const config = {
			url: "/rest/api/3/dashboard/bulk/edit",
			method: "PUT",
			data: {
				action: parameters.action,
				changeOwnerDetails: parameters.changeOwnerDetails,
				entityIds: parameters.entityIds,
				extendAdminPermissions: parameters.extendAdminPermissions,
				permissionDetails: parameters.permissionDetails
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllAvailableDashboardGadgets(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/dashboard/gadgets",
			method: "GET"
		}, callback);
	}
	async getDashboardsPaginated(parameters, callback) {
		const config = {
			url: "/rest/api/3/dashboard/search",
			method: "GET",
			params: {
				dashboardName: parameters?.dashboardName,
				accountId: parameters?.accountId,
				groupname: parameters?.groupname,
				groupId: parameters?.groupId,
				projectId: parameters?.projectId,
				orderBy: parameters?.orderBy,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				status: parameters?.status,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllGadgets(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${typeof parameters === "string" ? parameters : parameters.dashboardId}/gadget`,
			method: "GET",
			params: {
				moduleKey: typeof parameters !== "string" && parameters.moduleKey,
				uri: typeof parameters !== "string" && parameters.uri,
				gadgetId: typeof parameters !== "string" && parameters.gadgetId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async addGadget(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.dashboardId}/gadget`,
			method: "POST",
			data: {
				color: parameters.color,
				ignoreUriAndModuleKeyValidation: parameters.ignoreUriAndModuleKeyValidation,
				moduleKey: parameters.moduleKey,
				position: parameters.position,
				title: parameters.title,
				uri: parameters.uri
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateGadget(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.dashboardId}/gadget/${parameters.gadgetId}`,
			method: "PUT",
			data: {
				color: parameters.color,
				position: parameters.position,
				title: parameters.title
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeGadget(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.dashboardId}/gadget/${parameters.gadgetId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getDashboardItemPropertyKeys(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.dashboardId}/items/${parameters.itemId}/properties`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getDashboardItemProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.dashboardId}/items/${parameters.itemId}/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setDashboardItemProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.dashboardId}/items/${parameters.itemId}/properties/${parameters.propertyKey}`,
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			data: parameters.propertyValue
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteDashboardItemProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.dashboardId}/items/${parameters.itemId}/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getDashboard(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateDashboard(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.id}`,
			method: "PUT",
			params: { extendAdminPermissions: parameters.extendAdminPermissions },
			data: {
				description: parameters.description,
				editPermissions: parameters.editPermissions,
				name: parameters.name,
				sharePermissions: parameters.sharePermissions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteDashboard(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async copyDashboard(parameters, callback) {
		const config = {
			url: `/rest/api/3/dashboard/${parameters.id}/copy`,
			method: "POST",
			params: { extendAdminPermissions: parameters.extendAdminPermissions },
			data: {
				description: parameters.description,
				editPermissions: parameters.editPermissions,
				name: parameters.name,
				sharePermissions: parameters.sharePermissions
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/dynamicModules.mjs
var DynamicModules = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getModules(callback) {
		return this.client.sendRequest({
			url: "/rest/atlassian-connect/1/app/module/dynamic",
			method: "GET"
		}, callback);
	}
	async registerModules(parameters, callback) {
		const config = {
			url: "/rest/atlassian-connect/1/app/module/dynamic",
			method: "POST",
			data: { modules: parameters?.modules }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeModules(parameters, callback) {
		const config = {
			url: "/rest/atlassian-connect/1/app/module/dynamic",
			method: "DELETE",
			params: { moduleKey: parameters?.moduleKey }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/fieldSchemes.mjs
var FieldSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getFieldAssociationSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes",
			method: "GET",
			params: {
				projectId: parameters?.projectId,
				query: parameters?.query,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createFieldAssociationScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateFieldsAssociatedWithSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes/fields",
			method: "PUT",
			data: parameters
		};
		return this.client.sendRequest(config, callback);
	}
	async removeFieldsAssociatedWithSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes/fields",
			method: "DELETE",
			data: parameters
		};
		return this.client.sendRequest(config, callback);
	}
	async updateFieldAssociationSchemeItemParameters(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes/fields/parameters",
			method: "PUT",
			data: parameters
		};
		return this.client.sendRequest(config, callback);
	}
	async removeFieldAssociationSchemeItemParameters(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes/fields/parameters",
			method: "DELETE",
			data: parameters
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectsWithFieldSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes/projects",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				projectId: parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async associateProjectsToFieldAssociationSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/config/fieldschemes/projects",
			method: "PUT",
			data: parameters
		};
		return this.client.sendRequest(config, callback);
	}
	async getFieldAssociationSchemeById(parameters, callback) {
		const config = {
			url: `/rest/api/3/config/fieldschemes/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateFieldAssociationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/config/fieldschemes/${parameters.id}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteFieldAssociationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/config/fieldschemes/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async searchFieldAssociationSchemeFields(parameters, callback) {
		const config = {
			url: `/rest/api/3/config/fieldschemes/${parameters.id}/fields`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				fieldId: parameters.fieldId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFieldAssociationSchemeItemParameters(parameters, callback) {
		const config = {
			url: `/rest/api/3/config/fieldschemes/${parameters.id}/fields/${parameters.fieldId}/parameters`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async searchFieldAssociationSchemeProjects(parameters, callback) {
		const config = {
			url: `/rest/api/3/config/fieldschemes/${parameters.id}/projects`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				projectId: parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/filters.mjs
var Filters = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async createFilter(parameters, callback) {
		const config = {
			url: "/rest/api/3/filter",
			method: "POST",
			params: {
				expand: parameters.expand,
				overrideSharePermissions: parameters.overrideSharePermissions
			},
			data: {
				approximateLastUsed: parameters.approximateLastUsed,
				description: parameters.description,
				editPermissions: parameters.editPermissions,
				favourite: parameters.favourite,
				favouritedCount: parameters.favouritedCount,
				id: parameters.id,
				jql: parameters.jql,
				name: parameters.name,
				owner: parameters.owner,
				searchUrl: parameters.searchUrl,
				self: parameters.self,
				sharePermissions: parameters.sharePermissions,
				sharedUsers: parameters.sharedUsers,
				subscriptions: parameters.subscriptions,
				viewUrl: parameters.viewUrl
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFavouriteFilters(parameters, callback) {
		const config = {
			url: "/rest/api/3/filter/favourite",
			method: "GET",
			params: { expand: parameters?.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async getMyFilters(parameters, callback) {
		const config = {
			url: "/rest/api/3/filter/my",
			method: "GET",
			params: {
				expand: parameters?.expand,
				includeFavourites: parameters?.includeFavourites
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFiltersPaginated(parameters, callback) {
		const config = {
			url: "/rest/api/3/filter/search",
			method: "GET",
			params: {
				filterName: parameters?.filterName,
				accountId: parameters?.accountId,
				groupname: parameters?.groupname,
				groupId: parameters?.groupId,
				projectId: parameters?.projectId,
				id: parameters?.id,
				orderBy: parameters?.orderBy,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				expand: parameters?.expand,
				overrideSharePermissions: parameters?.overrideSharePermissions,
				isSubstringMatch: parameters?.isSubstringMatch
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFilter(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET",
			params: {
				expand: typeof parameters !== "string" && parameters.expand,
				overrideSharePermissions: typeof parameters !== "string" && parameters.overrideSharePermissions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateFilter(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${parameters.id}`,
			method: "PUT",
			params: {
				expand: parameters.expand,
				overrideSharePermissions: parameters.overrideSharePermissions
			},
			data: {
				name: parameters.name,
				description: parameters.description,
				jql: parameters.jql,
				favourite: parameters.favourite,
				sharePermissions: parameters.sharePermissions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteFilter(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getColumns(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${typeof parameters === "string" ? parameters : parameters.id}/columns`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setColumns(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${parameters.id}/columns`,
			method: "PUT",
			data: parameters.columns
		};
		return this.client.sendRequest(config, callback);
	}
	async resetColumns(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${typeof parameters === "string" ? parameters : parameters.id}/columns`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async setFavouriteForFilter(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${typeof parameters === "string" ? parameters : parameters.id}/favourite`,
			method: "PUT",
			params: { expand: typeof parameters !== "string" && parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteFavouriteForFilter(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${typeof parameters === "string" ? parameters : parameters.id}/favourite`,
			method: "DELETE",
			params: { expand: typeof parameters !== "string" && parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async changeFilterOwner(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${parameters.id}/owner`,
			method: "PUT",
			data: { accountId: parameters.accountId }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/filterSharing.mjs
var FilterSharing = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getDefaultShareScope(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/filter/defaultShareScope",
			method: "GET"
		}, callback);
	}
	async setDefaultShareScope(parameters, callback) {
		const config = {
			url: "/rest/api/3/filter/defaultShareScope",
			method: "PUT",
			data: { scope: typeof parameters === "string" ? parameters : parameters.scope }
		};
		return this.client.sendRequest(config, callback);
	}
	async getSharePermissions(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${typeof parameters === "string" ? parameters : parameters.id}/permission`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async addSharePermission(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${parameters.id}/permission`,
			method: "POST",
			data: {
				accountId: parameters.accountId,
				groupId: parameters.groupId,
				groupname: parameters.groupname,
				projectId: parameters.projectId,
				projectRoleId: parameters.projectRoleId,
				rights: parameters.rights,
				type: parameters.type
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getSharePermission(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${parameters.id}/permission/${parameters.permissionId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteSharePermission(parameters, callback) {
		const config = {
			url: `/rest/api/3/filter/${parameters.id}/permission/${parameters.permissionId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/groupAndUserPicker.mjs
var GroupAndUserPicker = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async findUsersAndGroups(parameters, callback) {
		const config = {
			url: "/rest/api/3/groupuserpicker",
			method: "GET",
			params: {
				query: parameters.query,
				maxResults: parameters.maxResults,
				showAvatar: parameters.showAvatar,
				fieldId: parameters.fieldId,
				projectId: parameters.projectId,
				issueTypeId: parameters.issueTypeId,
				avatarSize: parameters.avatarSize,
				caseInsensitive: parameters.caseInsensitive,
				excludeConnectAddons: parameters.excludeConnectAddons
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/groups.mjs
var Groups = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async createGroup(parameters, callback) {
		const config = {
			url: "/rest/api/3/group",
			method: "POST",
			data: parameters
		};
		return this.client.sendRequest(config, callback);
	}
	async removeGroup(parameters, callback) {
		const config = {
			url: "/rest/api/3/group",
			method: "DELETE",
			params: {
				groupname: parameters.groupname,
				groupId: parameters.groupId,
				swapGroup: parameters.swapGroup,
				swapGroupId: parameters.swapGroupId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkGetGroups(parameters, callback) {
		const config = {
			url: "/rest/api/3/group/bulk",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				groupId: parameters?.groupId,
				groupName: parameters?.groupName,
				accessType: parameters?.accessType,
				applicationKey: parameters?.applicationKey
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getUsersFromGroup(parameters, callback) {
		const config = {
			url: "/rest/api/3/group/member",
			method: "GET",
			params: {
				groupname: parameters.groupname,
				groupId: parameters.groupId,
				includeInactiveUsers: parameters.includeInactiveUsers,
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async addUserToGroup(parameters, callback) {
		const config = {
			url: "/rest/api/3/group/user",
			method: "POST",
			params: {
				groupname: parameters.groupname,
				groupId: parameters.groupId
			},
			data: {
				accountId: parameters.accountId,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeUserFromGroup(parameters, callback) {
		const config = {
			url: "/rest/api/3/group/user",
			method: "DELETE",
			params: {
				groupname: parameters.groupname,
				groupId: parameters.groupId,
				username: parameters.username,
				accountId: parameters.accountId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findGroups(parameters, callback) {
		const config = {
			url: "/rest/api/3/groups/picker",
			method: "GET",
			params: {
				query: parameters?.query,
				exclude: parameters?.exclude,
				excludeId: parameters?.excludeId,
				maxResults: parameters?.maxResults,
				caseInsensitive: parameters?.caseInsensitive
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/instanceInformation.mjs
var InstanceInformation = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getLicense(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/instance/license",
			method: "GET"
		}, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueAttachments.mjs
var IssueAttachments = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAttachmentContent(parameters, callback) {
		const config = {
			url: `/rest/api/3/attachment/content/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET",
			params: { redirect: typeof parameters !== "string" && parameters.redirect },
			responseType: "arraybuffer"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAttachmentMeta(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/attachment/meta",
			method: "GET"
		}, callback);
	}
	async getAttachmentThumbnail(parameters, callback) {
		const config = {
			url: `/rest/api/3/attachment/thumbnail/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET",
			params: {
				redirect: typeof parameters !== "string" && parameters.redirect,
				fallbackToDefault: typeof parameters !== "string" && parameters.fallbackToDefault,
				width: typeof parameters !== "string" && parameters.width,
				height: typeof parameters !== "string" && parameters.height
			},
			responseType: "arraybuffer"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAttachment(parameters, callback) {
		const config = {
			url: `/rest/api/3/attachment/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async removeAttachment(parameters, callback) {
		const config = {
			url: `/rest/api/3/attachment/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async expandAttachmentForHumans(parameters, callback) {
		const config = {
			url: `/rest/api/3/attachment/${typeof parameters === "string" ? parameters : parameters.id}/expand/human`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async expandAttachmentForMachines(parameters, callback) {
		const config = {
			url: `/rest/api/3/attachment/${typeof parameters === "string" ? parameters : parameters.id}/expand/raw`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async addAttachment(parameters, callback) {
		const formData = new FormData();
		const attachments = Array.isArray(parameters.attachment) ? parameters.attachment : [parameters.attachment];
		let Readable;
		if (typeof window === "undefined") {
			const { Readable: NodeReadable } = await import("node:stream");
			Readable = NodeReadable;
		}
		for (const attachment of attachments) {
			const file = await this._convertToFile(attachment, Readable);
			if (!(file instanceof File || file instanceof Blob)) throw new Error(`Unsupported file type for attachment: ${typeof file}`);
			formData.append("file", file, attachment.filename);
		}
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/attachments`,
			method: "POST",
			headers: {
				"X-Atlassian-Token": "no-check",
				"Content-Type": "multipart/form-data"
			},
			data: formData,
			maxBodyLength: Infinity,
			maxContentLength: Infinity
		};
		return this.client.sendRequest(config, callback);
	}
	async _convertToFile(attachment, Readable) {
		const mergeChunks = (chunks) => {
			const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
			const merged = new Uint8Array(totalLength);
			let offset = 0;
			for (const c of chunks) {
				merged.set(c, offset);
				offset += c.byteLength;
			}
			return merged;
		};
		const toUint8ArrayCopy = (input) => {
			if (ArrayBuffer.isView(input)) {
				const view = input;
				const src = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
				const copy = new Uint8Array(src.byteLength);
				copy.set(src);
				return copy;
			}
			const src = new Uint8Array(input);
			const copy = new Uint8Array(src.byteLength);
			copy.set(src);
			return copy;
		};
		const mimeType = attachment.mimeType ?? (import_mime_types.lookup(attachment.filename) || void 0);
		if (attachment.file instanceof Blob || attachment.file instanceof File) return attachment.file;
		if (typeof attachment.file === "string") return new File([attachment.file], attachment.filename, { type: mimeType });
		if (Readable && attachment.file instanceof Readable) return this._streamToBlob(attachment.file, attachment.filename, mimeType);
		if (attachment.file instanceof ReadableStream) return this._streamToBlob(attachment.file, attachment.filename, mimeType);
		if (ArrayBuffer.isView(attachment.file) || attachment.file instanceof ArrayBuffer) {
			const merged = mergeChunks([toUint8ArrayCopy(attachment.file)]);
			const blob = new Blob([merged], { type: mimeType });
			return new File([blob], attachment.filename, { type: mimeType });
		}
		throw new Error("Unsupported attachment file type.");
	}
	async _streamToBlob(stream, filename, mimeType) {
		const mergeChunks = (chunks) => {
			const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
			const merged = new Uint8Array(totalLength);
			let offset = 0;
			for (const c of chunks) {
				merged.set(c, offset);
				offset += c.byteLength;
			}
			return merged;
		};
		if (typeof window === "undefined" && stream instanceof (await import("node:stream")).Readable) return new Promise((resolve, reject) => {
			const chunks = [];
			stream.on("data", (chunk) => {
				chunks.push(new Uint8Array(chunk));
			});
			stream.on("end", () => {
				const merged = mergeChunks(chunks);
				const blob = new Blob([merged], { type: mimeType });
				resolve(new File([blob], filename, { type: mimeType }));
			});
			stream.on("error", reject);
		});
		if (stream instanceof ReadableStream) {
			const reader = stream.getReader();
			const chunks = [];
			let done = false;
			while (!done) {
				const { value, done: streamDone } = await reader.read();
				if (value) chunks.push(new Uint8Array(value));
				done = streamDone;
			}
			const merged = mergeChunks(chunks);
			const blob = new Blob([merged], { type: mimeType });
			return new File([blob], filename, { type: mimeType });
		}
		throw new Error("Unsupported stream type.");
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueBulkOperations.mjs
var IssueBulkOperations = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async submitBulkDelete(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/delete",
			method: "POST",
			data: {
				selectedIssueIdsOrKeys: parameters.selectedIssueIdsOrKeys,
				sendBulkNotification: parameters.sendBulkNotification
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getBulkEditableFields(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/fields",
			method: "GET",
			params: {
				issueIdsOrKeys: parameters.issueIdsOrKeys,
				searchText: parameters.searchText,
				endingBefore: parameters.endingBefore,
				startingAfter: parameters.startingAfter
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async submitBulkEdit(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/fields",
			method: "POST",
			data: {
				editedFieldsInput: parameters.editedFieldsInput,
				selectedActions: parameters.selectedActions,
				selectedIssueIdsOrKeys: parameters.selectedIssueIdsOrKeys,
				sendBulkNotification: parameters.sendBulkNotification
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async submitBulkMove(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/move",
			method: "POST",
			data: {
				sendBulkNotification: parameters.sendBulkNotification,
				targetToSourcesMapping: parameters.targetToSourcesMapping
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAvailableTransitions(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/transition",
			method: "GET",
			params: {
				issueIdsOrKeys: parameters.issueIdsOrKeys,
				endingBefore: parameters.endingBefore,
				startingAfter: parameters.startingAfter
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async submitBulkTransition(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/transition",
			method: "POST",
			data: {
				bulkTransitionInputs: parameters.bulkTransitionInputs,
				sendBulkNotification: parameters.sendBulkNotification
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async submitBulkUnwatch(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/unwatch",
			method: "POST",
			data: { selectedIssueIdsOrKeys: parameters.selectedIssueIdsOrKeys }
		};
		return this.client.sendRequest(config, callback);
	}
	async submitBulkWatch(parameters, callback) {
		const config = {
			url: "/rest/api/3/bulk/issues/watch",
			method: "POST",
			data: { selectedIssueIdsOrKeys: parameters.selectedIssueIdsOrKeys }
		};
		return this.client.sendRequest(config, callback);
	}
	async getBulkOperationProgress(parameters, callback) {
		const config = {
			url: `/rest/api/3/bulk/queue/${parameters.taskId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueCommentProperties.mjs
var IssueCommentProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getCommentPropertyKeys(parameters, callback) {
		const config = {
			url: `/rest/api/3/comment/${typeof parameters === "string" ? parameters : parameters.commentId}/properties`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getCommentProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/comment/${parameters.commentId}/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setCommentProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/comment/${parameters.commentId}/properties/${parameters.propertyKey}`,
			method: "PUT",
			data: parameters.property
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteCommentProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/comment/${parameters.commentId}/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueComments.mjs
var IssueComments = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getCommentsByIds(parameters, callback) {
		const config = {
			url: "/rest/api/3/comment/list",
			method: "POST",
			params: { expand: parameters.expand },
			data: { ids: parameters.ids }
		};
		return this.client.sendRequest(config, callback);
	}
	async getComments(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${typeof parameters === "string" ? parameters : parameters.issueIdOrKey}/comment`,
			method: "GET",
			params: {
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults,
				orderBy: typeof parameters !== "string" && parameters.orderBy,
				expand: typeof parameters !== "string" && parameters.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async addComment(parameters, callback) {
		const body = typeof parameters.comment === "string" ? {
			type: "doc",
			version: 1,
			content: [{
				type: "paragraph",
				content: [{
					type: "text",
					text: parameters.comment
				}]
			}]
		} : parameters.comment;
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/comment`,
			method: "POST",
			params: { expand: parameters.expand },
			data: {
				author: parameters.author,
				body,
				created: parameters.created,
				id: parameters.id,
				jsdAuthorCanSeeRequest: parameters.jsdAuthorCanSeeRequest,
				jsdPublic: parameters.jsdPublic,
				parentId: parameters.parentId,
				properties: parameters.properties,
				renderedBody: parameters.renderedBody,
				self: parameters.self,
				updateAuthor: parameters.updateAuthor,
				updated: parameters.updated,
				visibility: parameters.visibility
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getComment(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/comment/${parameters.id}`,
			method: "GET",
			params: { expand: parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateComment(parameters, callback) {
		const body = typeof parameters.body === "string" ? {
			type: "doc",
			version: 1,
			content: [{
				type: "paragraph",
				content: [{
					type: "text",
					text: parameters.body
				}]
			}]
		} : parameters.body;
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/comment/${parameters.id}`,
			method: "PUT",
			params: {
				notifyUsers: parameters.notifyUsers,
				overrideEditableFlag: parameters.overrideEditableFlag,
				expand: parameters.expand
			},
			data: {
				body,
				visibility: parameters.visibility,
				properties: parameters.properties
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteComment(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/comment/${parameters.id}`,
			method: "DELETE",
			params: { parentId: parameters.parentId }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueCustomFieldAssociations.mjs
var IssueCustomFieldAssociations = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async createAssociations(parameters, callback) {
		const config = {
			url: "/rest/api/3/field/association",
			method: "PUT",
			data: {
				associationContexts: parameters.associationContexts,
				fields: parameters.fields
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeAssociations(parameters, callback) {
		const config = {
			url: "/rest/api/3/field/association",
			method: "DELETE",
			data: {
				associationContexts: parameters.associationContexts,
				fields: parameters.fields
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueCustomFieldConfigurationApps.mjs
var IssueCustomFieldConfigurationApps = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getCustomFieldsConfigurations(parameters, callback) {
		const config = {
			url: "/rest/api/3/app/field/context/configuration/list",
			method: "POST",
			params: {
				id: parameters?.id,
				fieldContextId: paramSerializer("fieldContextId", parameters?.fieldContextId),
				issueId: parameters?.issueId,
				projectKeyOrId: parameters?.projectKeyOrId,
				issueTypeId: parameters?.issueTypeId,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			},
			data: { fieldIdsOrKeys: parameters?.fieldIdsOrKeys }
		};
		return this.client.sendRequest(config, callback);
	}
	async getCustomFieldConfiguration(parameters, callback) {
		const config = {
			url: `/rest/api/3/app/field/${typeof parameters === "string" ? parameters : parameters.fieldIdOrKey}/context/configuration`,
			method: "GET",
			params: {
				id: typeof parameters !== "string" && parameters.id,
				fieldContextId: typeof parameters !== "string" && parameters.fieldContextId,
				issueId: typeof parameters !== "string" && parameters.issueId,
				projectKeyOrId: typeof parameters !== "string" && parameters.projectKeyOrId,
				issueTypeId: typeof parameters !== "string" && parameters.issueTypeId,
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateCustomFieldConfiguration(parameters, callback) {
		const config = {
			url: `/rest/api/3/app/field/${parameters.fieldIdOrKey}/context/configuration`,
			method: "PUT",
			data: { configurations: parameters.configurations }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueCustomFieldContexts.mjs
var IssueCustomFieldContexts = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getContextsForField(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldId}/context`,
			method: "GET",
			params: {
				isAnyIssueType: typeof parameters !== "string" && parameters.isAnyIssueType,
				isGlobalContext: typeof parameters !== "string" && parameters.isGlobalContext,
				contextId: typeof parameters !== "string" && parameters.contextId,
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createCustomFieldContext(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context`,
			method: "POST",
			data: {
				description: parameters.description,
				id: parameters.id,
				issueTypeIds: parameters.issueTypeIds,
				name: parameters.name,
				projectIds: parameters.projectIds
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getDefaultValues(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldId}/context/defaultValue`,
			method: "GET",
			params: {
				contextId: typeof parameters !== "string" && parameters.contextId,
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async setDefaultValues(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/defaultValue`,
			method: "PUT",
			data: { defaultValues: parameters.defaultValues }
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueTypeMappingsForContexts(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldId}/context/issuetypemapping`,
			method: "GET",
			params: {
				contextId: typeof parameters !== "string" && parameters.contextId,
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getCustomFieldContextsForProjectsAndIssueTypes(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/mapping`,
			method: "POST",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			},
			data: { mappings: parameters.mappings }
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectContextMapping(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldId}/context/projectmapping`,
			method: "GET",
			params: {
				contextId: typeof parameters !== "string" && parameters.contextId,
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateCustomFieldContext(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteCustomFieldContext(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async addIssueTypesToContext(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/issuetype`,
			method: "PUT",
			data: { issueTypeIds: parameters.issueTypeIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeIssueTypesFromContext(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/issuetype/remove`,
			method: "POST",
			data: { issueTypeIds: parameters.issueTypeIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async assignProjectsToCustomFieldContext(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/project`,
			method: "PUT",
			data: { projectIds: parameters.projectIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeCustomFieldContextFromProjects(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/project/remove`,
			method: "POST",
			data: { projectIds: parameters.projectIds }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueCustomFieldOptions.mjs
var IssueCustomFieldOptions = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getCustomFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/customFieldOption/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getOptionsForContext(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/option`,
			method: "GET",
			params: {
				optionId: parameters.optionId,
				onlyOptions: parameters.onlyOptions,
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createCustomFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/option`,
			method: "POST",
			data: { options: parameters.options }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateCustomFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/option`,
			method: "PUT",
			data: { options: parameters.options }
		};
		return this.client.sendRequest(config, callback);
	}
	async reorderCustomFieldOptions(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/option/move`,
			method: "PUT",
			data: {
				after: parameters.after,
				customFieldOptionIds: parameters.customFieldOptionIds,
				position: parameters.position
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteCustomFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/option/${parameters.optionId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async replaceCustomFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}/context/${parameters.contextId}/option/${parameters.optionId}/issue`,
			method: "DELETE",
			params: {
				replaceWith: parameters.replaceWith,
				jql: parameters.jql
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueCustomFieldOptionsApps.mjs
var IssueCustomFieldOptionsApps = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllIssueFieldOptions(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldKey}/option`,
			method: "GET",
			params: {
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createIssueFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldKey}/option`,
			method: "POST",
			data: {
				config: parameters.config,
				properties: parameters.properties,
				value: parameters.value
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getSelectableIssueFieldOptions(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldKey}/option/suggestions/edit`,
			method: "GET",
			params: {
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults,
				projectId: typeof parameters !== "string" && parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getVisibleIssueFieldOptions(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldKey}/option/suggestions/search`,
			method: "GET",
			params: {
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults,
				projectId: typeof parameters !== "string" && parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldKey}/option/${parameters.optionId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateIssueFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldKey}/option/${parameters.optionId}`,
			method: "PUT",
			data: {
				config: parameters.config,
				id: parameters.id,
				properties: parameters.properties,
				value: parameters.value
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldKey}/option/${parameters.optionId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async replaceIssueFieldOption(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldKey}/option/${parameters.optionId}/issue`,
			method: "DELETE",
			params: {
				replaceWith: parameters.replaceWith,
				jql: parameters.jql,
				overrideScreenSecurity: parameters.overrideScreenSecurity,
				overrideEditableFlag: parameters.overrideEditableFlag
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueCustomFieldValuesApps.mjs
var IssueCustomFieldValuesApps = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async updateMultipleCustomFieldValues(parameters, callback) {
		const config = {
			url: "/rest/api/3/app/field/value",
			method: "POST",
			params: { generateChangelog: parameters.generateChangelog },
			data: { updates: parameters.updates }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateCustomFieldValue(parameters, callback) {
		const config = {
			url: `/rest/api/3/app/field/${parameters.fieldIdOrKey}/value`,
			method: "PUT",
			params: { generateChangelog: parameters.generateChangelog },
			data: { updates: parameters.updates }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueFieldConfigurations.mjs
var IssueFieldConfigurations = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllFieldConfigurations(parameters, callback) {
		const config = {
			url: "/rest/api/3/fieldconfiguration",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				isDefault: parameters?.isDefault,
				query: parameters?.query
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createFieldConfiguration(parameters, callback) {
		const config = {
			url: "/rest/api/3/fieldconfiguration",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateFieldConfiguration(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfiguration/${parameters.id}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteFieldConfiguration(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfiguration/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getFieldConfigurationItems(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfiguration/${parameters.id}/fields`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateFieldConfigurationItems(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfiguration/${parameters.id}/fields`,
			method: "PUT",
			data: { fieldConfigurationItems: parameters.fieldConfigurationItems }
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllFieldConfigurationSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/fieldconfigurationscheme",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createFieldConfigurationScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/fieldconfigurationscheme",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFieldConfigurationSchemeMappings(parameters, callback) {
		const config = {
			url: "/rest/api/3/fieldconfigurationscheme/mapping",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				fieldConfigurationSchemeId: parameters?.fieldConfigurationSchemeId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFieldConfigurationSchemeProjectMapping(parameters, callback) {
		const config = {
			url: "/rest/api/3/fieldconfigurationscheme/project",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				projectId: parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async assignFieldConfigurationSchemeToProject(parameters, callback) {
		const config = {
			url: "/rest/api/3/fieldconfigurationscheme/project",
			method: "PUT",
			data: {
				fieldConfigurationSchemeId: parameters?.fieldConfigurationSchemeId,
				projectId: parameters?.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateFieldConfigurationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfigurationscheme/${parameters.id}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteFieldConfigurationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfigurationscheme/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async setFieldConfigurationSchemeMapping(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfigurationscheme/${parameters.id}/mapping`,
			method: "PUT",
			data: { mappings: parameters.mappings }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeIssueTypesFromGlobalFieldConfigurationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/fieldconfigurationscheme/${parameters.id}/mapping/delete`,
			method: "POST",
			data: { issueTypeIds: parameters.issueTypeIds }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueFields.mjs
var IssueFields = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getFields(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/field",
			method: "GET"
		}, callback);
	}
	async createCustomField(parameters, callback) {
		const config = {
			url: "/rest/api/3/field",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name,
				searcherKey: parameters.searcherKey,
				type: parameters.type
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFieldsPaginated(parameters, callback) {
		const config = {
			url: "/rest/api/3/field/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				type: parameters?.type,
				id: parameters?.id,
				query: parameters?.query,
				orderBy: parameters?.orderBy,
				expand: parameters?.expand,
				projectIds: parameters?.projectIds
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getTrashedFieldsPaginated(parameters, callback) {
		const config = {
			url: "/rest/api/3/field/search/trashed",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				query: parameters?.query,
				expand: parameters?.expand,
				orderBy: parameters?.orderBy
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateCustomField(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.fieldId}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name,
				searcherKey: parameters.searcherKey
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteCustomField(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async restoreCustomField(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.id}/restore`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
	async trashCustomField(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${parameters.id}/trash`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectFields(parameters, callback) {
		const config = {
			url: "/rest/api/3/projects/fields",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				projectId: parameters.projectId,
				workTypeId: parameters.workTypeId,
				fieldId: parameters.fieldId
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueLinks.mjs
var IssueLinks = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async linkIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/issueLink",
			method: "POST",
			data: {
				comment: parameters.comment,
				inwardIssue: parameters.inwardIssue,
				outwardIssue: parameters.outwardIssue,
				type: parameters.type
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueLink(parameters, callback) {
		const config = {
			url: `/rest/api/3/issueLink/${parameters.linkId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueLink(parameters, callback) {
		const config = {
			url: `/rest/api/3/issueLink/${parameters.linkId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueLinkTypes.mjs
var IssueLinkTypes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueLinkTypes(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/issueLinkType",
			method: "GET"
		}, callback);
	}
	async createIssueLinkType(parameters, callback) {
		const config = {
			url: "/rest/api/3/issueLinkType",
			method: "POST",
			data: {
				id: parameters.id,
				inward: parameters.inward,
				name: parameters.name,
				outward: parameters.outward,
				self: parameters.self
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueLinkType(parameters, callback) {
		const config = {
			url: `/rest/api/3/issueLinkType/${parameters.issueLinkTypeId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateIssueLinkType(parameters, callback) {
		const config = {
			url: `/rest/api/3/issueLinkType/${parameters.issueLinkTypeId}`,
			method: "PUT",
			data: {
				id: parameters.id,
				inward: parameters.inward,
				name: parameters.name,
				outward: parameters.outward,
				self: parameters.self
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueLinkType(parameters, callback) {
		const config = {
			url: `/rest/api/3/issueLinkType/${parameters.issueLinkTypeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueNavigatorSettings.mjs
var IssueNavigatorSettings = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueNavigatorDefaultColumns(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/settings/columns",
			method: "GET"
		}, callback);
	}
	async setIssueNavigatorDefaultColumns(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/settings/columns",
			method: "PUT"
		}, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueNotificationSchemes.mjs
var IssueNotificationSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getNotificationSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/notificationscheme",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				projectId: parameters?.projectId,
				onlyDefault: parameters?.onlyDefault,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createNotificationScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/notificationscheme",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name,
				notificationSchemeEvents: parameters.notificationSchemeEvents
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getNotificationSchemeToProjectMappings(parameters, callback) {
		const config = {
			url: "/rest/api/3/notificationscheme/project",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				notificationSchemeId: parameters?.notificationSchemeId,
				projectId: parameters?.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getNotificationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/notificationscheme/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET",
			params: { expand: typeof parameters !== "string" && parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateNotificationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/notificationscheme/${parameters.id}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async addNotifications(parameters, callback) {
		const config = {
			url: `/rest/api/3/notificationscheme/${parameters.id}/notification`,
			method: "PUT",
			data: { notificationSchemeEvents: parameters.notificationSchemeEvents }
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteNotificationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/notificationscheme/${parameters.notificationSchemeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async removeNotificationFromNotificationScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/notificationscheme/${parameters.notificationSchemeId}/notification/${parameters.notificationId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issuePriorities.mjs
var IssuePriorities = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getPriorities(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/priority",
			method: "GET"
		}, callback);
	}
	async createPriority(parameters, callback) {
		const config = {
			url: "/rest/api/3/priority",
			method: "POST",
			data: {
				avatarId: parameters.avatarId,
				description: parameters.description,
				iconUrl: parameters.iconUrl,
				name: parameters.name,
				statusColor: parameters.statusColor
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async setDefaultPriority(parameters, callback) {
		const config = {
			url: "/rest/api/3/priority/default",
			method: "PUT",
			data: { id: parameters?.id }
		};
		return this.client.sendRequest(config, callback);
	}
	async movePriorities(parameters, callback) {
		const config = {
			url: "/rest/api/3/priority/move",
			method: "PUT",
			data: {
				after: parameters.after,
				ids: parameters.ids,
				position: parameters.position
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchPriorities(parameters, callback) {
		const config = {
			url: "/rest/api/3/priority/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				projectId: paramSerializer("projectId", parameters?.projectId),
				priorityName: parameters?.priorityName,
				onlyDefault: parameters?.onlyDefault,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getPriority(parameters, callback) {
		const config = {
			url: `/rest/api/3/priority/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updatePriority(parameters, callback) {
		const config = {
			url: `/rest/api/3/priority/${parameters.id}`,
			method: "PUT",
			data: {
				avatarId: parameters.avatarId,
				description: parameters.description,
				iconUrl: parameters.iconUrl,
				name: parameters.name,
				statusColor: parameters.statusColor
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deletePriority(parameters, callback) {
		const config = {
			url: `/rest/api/3/priority/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueProperties.mjs
var IssueProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async bulkSetIssuesProperties(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/properties",
			method: "POST",
			data: {
				entitiesIds: parameters?.entitiesIds,
				properties: parameters?.properties
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkSetIssuePropertiesByIssue(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/properties/multi",
			method: "POST",
			data: { issues: parameters?.issues }
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkSetIssueProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/properties/${parameters.propertyKey}`,
			method: "PUT",
			data: {
				expression: parameters.expression,
				filter: parameters.filter,
				value: parameters.value
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkDeleteIssueProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/properties/${parameters.propertyKey}`,
			method: "DELETE",
			data: {
				currentValue: parameters.currentValue,
				entityIds: parameters.entityIds
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssuePropertyKeys(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/properties`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setIssueProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/properties/${parameters.propertyKey}`,
			method: "PUT",
			data: parameters.propertyValue
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueRedaction.mjs
var IssueRedaction = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async redact(parameters, callback) {
		const config = {
			url: "/rest/api/3/redact",
			method: "POST",
			data: { redactions: parameters.redactions }
		};
		return this.client.sendRequest(config, callback);
	}
	async getRedactionStatus(parameters, callback) {
		const config = {
			url: `/rest/api/3/redact/status/${parameters.jobId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueRemoteLinks.mjs
var IssueRemoteLinks = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getRemoteIssueLinks(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/remotelink`,
			method: "GET",
			params: { globalId: parameters.globalId }
		};
		return this.client.sendRequest(config, callback);
	}
	async createOrUpdateRemoteIssueLink(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/remotelink`,
			method: "POST",
			data: {
				application: parameters.application,
				globalId: parameters.globalId,
				object: parameters.object,
				relationship: parameters.relationship
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteRemoteIssueLinkByGlobalId(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/remotelink`,
			method: "DELETE",
			params: { globalId: parameters.globalId }
		};
		return this.client.sendRequest(config, callback);
	}
	async getRemoteIssueLinkById(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/remotelink/${parameters.linkId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateRemoteIssueLink(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/remotelink/${parameters.linkId}`,
			method: "PUT",
			data: {
				application: parameters.application,
				globalId: parameters.globalId,
				object: parameters.object,
				relationship: parameters.relationship
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteRemoteIssueLinkById(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/remotelink/${parameters.linkId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueResolutions.mjs
var IssueResolutions = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getResolutions(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/resolution",
			method: "GET"
		}, callback);
	}
	async createResolution(parameters, callback) {
		const config = {
			url: "/rest/api/3/resolution",
			method: "POST",
			data: parameters
		};
		return this.client.sendRequest(config, callback);
	}
	async setDefaultResolution(parameters, callback) {
		const config = {
			url: "/rest/api/3/resolution/default",
			method: "PUT",
			data: { id: parameters.id }
		};
		return this.client.sendRequest(config, callback);
	}
	async moveResolutions(parameters, callback) {
		const config = {
			url: "/rest/api/3/resolution/move",
			method: "PUT",
			data: {
				after: parameters.after,
				ids: parameters.ids,
				position: parameters.position
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchResolutions(parameters, callback) {
		const config = {
			url: "/rest/api/3/resolution/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				onlyDefault: parameters?.onlyDefault
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getResolution(parameters, callback) {
		const config = {
			url: `/rest/api/3/resolution/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateResolution(parameters, callback) {
		const config = {
			url: `/rest/api/3/resolution/${parameters.id}`,
			method: "PUT",
			data: {
				...parameters,
				name: parameters.name,
				description: parameters.description,
				id: void 0
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteResolution(parameters, callback) {
		const config = {
			url: `/rest/api/3/resolution/${parameters.id}`,
			method: "DELETE",
			params: { replaceWith: parameters.replaceWith }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issues.mjs
var Issues = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getBulkChangelogs(parameters, callback) {
		const config = {
			url: "/rest/api/3/changelog/bulkfetch",
			method: "POST",
			data: {
				fieldIds: parameters.fieldIds,
				issueIdsOrKeys: parameters.issueIdsOrKeys,
				maxResults: parameters.maxResults,
				nextPageToken: parameters.nextPageToken
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getEvents(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/events",
			method: "GET"
		}, callback);
	}
	async createIssue(parameters, callback) {
		if (typeof parameters.fields.description === "string") parameters.fields.description = {
			type: "doc",
			version: 1,
			content: [{
				type: "paragraph",
				content: [{
					text: parameters.fields.description,
					type: "text"
				}]
			}]
		};
		const config = {
			url: "/rest/api/3/issue",
			method: "POST",
			params: { updateHistory: parameters.updateHistory },
			data: {
				fields: parameters.fields,
				historyMetadata: parameters.historyMetadata,
				properties: parameters.properties,
				transition: parameters.transition,
				update: parameters.update
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async archiveIssuesAsync(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/archive",
			method: "POST",
			data: { jql: parameters.jql }
		};
		return this.client.sendRequest(config, callback);
	}
	async archiveIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/archive",
			method: "PUT",
			data: { issueIdsOrKeys: parameters.issueIdsOrKeys }
		};
		return this.client.sendRequest(config, callback);
	}
	async createIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/bulk",
			method: "POST",
			data: { issueUpdates: parameters?.issueUpdates }
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkFetchIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/bulkfetch",
			method: "POST",
			data: {
				expand: parameters.expand,
				fields: parameters.fields,
				fieldsByKeys: parameters.fieldsByKeys,
				issueIdsOrKeys: parameters.issueIdsOrKeys,
				properties: parameters.properties
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getCreateIssueMeta(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/createmeta",
			method: "GET",
			params: {
				projectIds: parameters?.projectIds,
				projectKeys: parameters?.projectKeys,
				issuetypeIds: parameters?.issuetypeIds,
				issuetypeNames: parameters?.issuetypeNames,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getCreateIssueMetaIssueTypes(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/createmeta/${parameters.projectIdOrKey}/issuetypes`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getCreateIssueMetaIssueTypeId(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/createmeta/${parameters.projectIdOrKey}/issuetypes/${parameters.issueTypeId}`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueLimitReport(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/limit/report",
			method: "GET",
			params: { isReturningKeys: parameters?.isReturningKeys },
			data: { issuesApproachingLimitParams: parameters?.issuesApproachingLimitParams }
		};
		return this.client.sendRequest(config, callback);
	}
	async unarchiveIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/unarchive",
			method: "PUT",
			data: { issueIdsOrKeys: parameters.issueIdsOrKeys }
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssue(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}`,
			method: "GET",
			params: {
				fields: parameters.fields,
				fieldsByKeys: parameters.fieldsByKeys,
				expand: parameters.expand,
				properties: parameters.properties,
				updateHistory: parameters.updateHistory,
				failFast: parameters.failFast
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async editIssue(parameters, callback) {
		if (parameters.fields?.description && typeof parameters.fields.description === "string") {
			const { fields: { description } } = await this.getIssue({ issueIdOrKey: parameters.issueIdOrKey });
			parameters.fields.description = {
				type: "doc",
				version: description?.version ?? 1,
				content: [{
					type: "paragraph",
					content: [{
						text: parameters.fields.description,
						type: "text"
					}]
				}]
			};
		}
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}`,
			method: "PUT",
			params: {
				notifyUsers: parameters.notifyUsers,
				overrideScreenSecurity: parameters.overrideScreenSecurity,
				overrideEditableFlag: parameters.overrideEditableFlag,
				returnIssue: parameters.returnIssue,
				expand: parameters.expand
			},
			data: {
				fields: parameters.fields,
				historyMetadata: parameters.historyMetadata,
				properties: parameters.properties,
				transition: parameters.transition,
				update: parameters.update
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssue(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}`,
			method: "DELETE",
			params: { deleteSubtasks: parameters.deleteSubtasks }
		};
		return this.client.sendRequest(config, callback);
	}
	async assignIssue(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/assignee`,
			method: "PUT",
			data: {
				accountId: parameters.accountId,
				accountType: parameters.accountType,
				active: parameters.active,
				appType: parameters.appType,
				applicationRoles: parameters.applicationRoles,
				avatarUrls: parameters.avatarUrls,
				displayName: parameters.displayName,
				emailAddress: parameters.emailAddress,
				expand: parameters.expand,
				groups: parameters.groups,
				key: parameters.key,
				locale: parameters.locale,
				name: parameters.name,
				self: parameters.self,
				timeZone: parameters.timeZone
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getChangeLogs(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/changelog`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getChangeLogsByIds(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/changelog/list`,
			method: "POST",
			data: { changelogIds: parameters.changelogIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async getEditIssueMeta(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/editmeta`,
			method: "GET",
			params: {
				overrideScreenSecurity: parameters.overrideScreenSecurity,
				overrideEditableFlag: parameters.overrideEditableFlag
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async notify(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/notify`,
			method: "POST",
			data: {
				htmlBody: parameters.htmlBody,
				restrict: parameters.restrict,
				subject: parameters.subject,
				textBody: parameters.textBody,
				to: parameters.to
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getTransitions(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/transitions`,
			method: "GET",
			params: {
				expand: parameters.expand,
				transitionId: parameters.transitionId,
				skipRemoteOnlyCondition: parameters.skipRemoteOnlyCondition,
				includeUnavailableTransitions: parameters.includeUnavailableTransitions,
				sortByOpsBarAndStatus: parameters.sortByOpsBarAndStatus
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async doTransition(parameters, callback) {
		if (parameters.fields?.description && typeof parameters.fields.description === "string") parameters.fields.description = {
			type: "doc",
			version: 1,
			content: [{
				type: "paragraph",
				content: [{
					text: parameters.fields.description,
					type: "text"
				}]
			}]
		};
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/transitions`,
			method: "POST",
			data: {
				fields: parameters.fields,
				historyMetadata: parameters.historyMetadata,
				properties: parameters.properties,
				transition: parameters.transition,
				update: parameters.update
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async exportArchivedIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/issues/archive/export",
			method: "PUT",
			data: {
				archivedBy: parameters?.archivedBy,
				archivedDateRange: parameters?.archivedDateRange,
				issueTypes: parameters?.issueTypes,
				projects: parameters?.projects,
				reporters: parameters?.reporters
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueSearch.mjs
var IssueSearch = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssuePickerResource(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/picker",
			method: "GET",
			params: {
				query: parameters?.query,
				currentJQL: parameters?.currentJQL,
				currentIssueKey: parameters?.currentIssueKey,
				currentProjectId: parameters?.currentProjectId,
				showSubTasks: parameters?.showSubTasks,
				showSubTaskParent: parameters?.showSubTaskParent
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async matchIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/match",
			method: "POST",
			data: {
				issueIds: parameters.issueIds,
				jqls: parameters.jqls
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchForIssuesUsingJql(parameters, callback) {
		const config = {
			url: "/rest/api/3/search",
			method: "GET",
			params: {
				jql: parameters.jql,
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				validateQuery: parameters.validateQuery,
				fields: parameters.fields,
				expand: parameters.expand,
				properties: parameters.properties,
				fieldsByKeys: parameters.fieldsByKeys,
				failFast: parameters.failFast
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchForIssuesUsingJqlPost(parameters, callback) {
		const config = {
			url: "/rest/api/3/search",
			method: "POST",
			data: {
				expand: parameters?.expand,
				fields: parameters?.fields,
				fieldsByKeys: parameters?.fieldsByKeys,
				jql: parameters?.jql,
				maxResults: parameters?.maxResults,
				properties: parameters?.properties,
				startAt: parameters?.startAt,
				validateQuery: parameters?.validateQuery
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async countIssues(parameters, callback) {
		const config = {
			url: "/rest/api/3/search/approximate-count",
			method: "POST",
			data: { jql: parameters.jql }
		};
		return this.client.sendRequest(config, callback);
	}
	async searchForIssuesIds(parameters, callback) {
		const config = {
			url: "/rest/api/3/search/id",
			method: "POST",
			data: {
				jql: parameters.jql,
				maxResults: parameters.maxResults,
				nextPageToken: parameters.nextPageToken
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchForIssuesUsingJqlEnhancedSearch(parameters, callback) {
		const config = {
			url: "/rest/api/3/search/jql",
			method: "GET",
			params: {
				jql: parameters.jql,
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults,
				fields: parameters.fields,
				expand: parameters.expand,
				properties: parameters.properties,
				fieldsByKeys: parameters.fieldsByKeys,
				failFast: parameters.failFast,
				reconcileIssues: parameters.reconcileIssues
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchForIssuesUsingJqlEnhancedSearchPost(parameters, callback) {
		const config = {
			url: "/rest/api/3/search/jql",
			method: "POST",
			data: {
				expand: parameters.expand,
				fields: parameters.fields,
				fieldsByKeys: parameters.fieldsByKeys,
				jql: parameters.jql,
				maxResults: parameters.maxResults,
				nextPageToken: parameters.nextPageToken,
				properties: parameters.properties,
				reconcileIssues: parameters.reconcileIssues
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueSecurityLevel.mjs
var IssueSecurityLevel = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueSecurityLevelMembers(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.issueSecuritySchemeId}/members`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				issueSecurityLevelId: parameters.issueSecurityLevelId,
				expand: parameters.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueSecurityLevel(parameters, callback) {
		const config = {
			url: `/rest/api/3/securitylevel/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueSecuritySchemes.mjs
var IssueSecuritySchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueSecuritySchemes(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/issuesecurityschemes",
			method: "GET"
		}, callback);
	}
	async createIssueSecurityScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuesecurityschemes",
			method: "POST",
			data: {
				description: parameters.description,
				levels: parameters.levels,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getSecurityLevels(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuesecurityschemes/level",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				schemeId: parameters?.schemeId,
				onlyDefault: parameters?.onlyDefault
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async setDefaultLevels(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuesecurityschemes/level/default",
			method: "PUT",
			data: { defaultValues: parameters?.defaultValues }
		};
		return this.client.sendRequest(config, callback);
	}
	async getSecurityLevelMembers(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuesecurityschemes/level/member",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				schemeId: parameters?.schemeId,
				levelId: parameters?.levelId,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchProjectsUsingSecuritySchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuesecurityschemes/project",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				issueSecuritySchemeId: parameters?.issueSecuritySchemeId,
				projectId: parameters?.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async associateSchemesToProjects(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuesecurityschemes/project",
			method: "PUT",
			data: {
				oldToNewSecurityLevelMappings: parameters.oldToNewSecurityLevelMappings,
				projectId: parameters.projectId,
				schemeId: parameters.schemeId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchSecuritySchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuesecurityschemes/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				projectId: parameters?.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueSecurityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateIssueSecurityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.id}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteSecurityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.schemeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async addSecurityLevel(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.schemeId}/level`,
			method: "PUT",
			data: { levels: parameters.levels }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateSecurityLevel(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.schemeId}/level/${parameters.levelId}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeLevel(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.schemeId}/level/${parameters.levelId}`,
			method: "DELETE",
			params: { replaceWith: parameters.replaceWith }
		};
		return this.client.sendRequest(config, callback);
	}
	async addSecurityLevelMembers(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.schemeId}/level/${parameters.levelId}/member`,
			method: "PUT",
			data: { members: parameters.members }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeMemberFromSecurityLevel(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuesecurityschemes/${parameters.schemeId}/level/${parameters.levelId}/member/${parameters.memberId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueTypeProperties.mjs
var IssueTypeProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueTypePropertyKeys(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.issueTypeId}/properties`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueTypeProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.issueTypeId}/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setIssueTypeProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.issueTypeId}/properties/${parameters.propertyKey}`,
			method: "PUT"
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueTypeProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.issueTypeId}/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueTypes.mjs
var IssueTypes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueAllTypes(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/issuetype",
			method: "GET"
		}, callback);
	}
	async createIssueType(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetype",
			method: "POST",
			data: {
				description: parameters.description,
				hierarchyLevel: parameters.hierarchyLevel ?? 0,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueTypesForProject(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetype/project",
			method: "GET",
			params: {
				projectId: parameters.projectId,
				level: parameters.level
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.id}`,
			method: "PUT",
			data: {
				avatarId: parameters.avatarId,
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.id}`,
			method: "DELETE",
			params: { alternativeIssueTypeId: parameters.alternativeIssueTypeId }
		};
		return this.client.sendRequest(config, callback);
	}
	async getAlternativeIssueTypes(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.id}/alternatives`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async createIssueTypeAvatar(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetype/${parameters.id}/avatar2`,
			method: "POST",
			headers: {
				"X-Atlassian-Token": "no-check",
				"Content-Type": parameters.mimeType
			},
			params: {
				x: parameters.x,
				y: parameters.y,
				size: parameters.size ?? 0
			},
			data: parameters.avatar
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueTypeSchemes.mjs
var IssueTypeSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllIssueTypeSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescheme",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				orderBy: parameters?.orderBy,
				expand: parameters?.expand,
				queryString: parameters?.queryString
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createIssueTypeScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescheme",
			method: "POST",
			data: {
				defaultIssueTypeId: parameters.defaultIssueTypeId,
				description: parameters.description,
				issueTypeIds: parameters.issueTypeIds,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueTypeSchemesMapping(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescheme/mapping",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				issueTypeSchemeId: parameters?.issueTypeSchemeId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueTypeSchemeForProjects(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescheme/project",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				projectId: parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async assignIssueTypeSchemeToProject(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescheme/project",
			method: "PUT",
			data: {
				issueTypeSchemeId: parameters.issueTypeSchemeId,
				projectId: parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateIssueTypeScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescheme/${parameters.issueTypeSchemeId}`,
			method: "PUT",
			data: {
				defaultIssueTypeId: parameters.defaultIssueTypeId,
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueTypeScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescheme/${parameters.issueTypeSchemeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async addIssueTypesToIssueTypeScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescheme/${parameters.issueTypeSchemeId}/issuetype`,
			method: "PUT",
			data: { issueTypeIds: parameters.issueTypeIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async reorderIssueTypesInIssueTypeScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescheme/${parameters.issueTypeSchemeId}/issuetype/move`,
			method: "PUT",
			data: {
				after: parameters.after,
				issueTypeIds: parameters.issueTypeIds,
				position: parameters.position
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeIssueTypeFromIssueTypeScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescheme/${parameters.issueTypeSchemeId}/issuetype/${parameters.issueTypeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueTypeScreenSchemes.mjs
var IssueTypeScreenSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueTypeScreenSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescreenscheme",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				queryString: parameters?.queryString,
				orderBy: parameters?.orderBy,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createIssueTypeScreenScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescreenscheme",
			method: "POST",
			data: {
				description: parameters.description,
				issueTypeMappings: parameters.issueTypeMappings,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueTypeScreenSchemeMappings(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescreenscheme/mapping",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				issueTypeScreenSchemeId: parameters?.issueTypeScreenSchemeId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueTypeScreenSchemeProjectAssociations(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescreenscheme/project",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				projectId: parameters.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async assignIssueTypeScreenSchemeToProject(parameters, callback) {
		const config = {
			url: "/rest/api/3/issuetypescreenscheme/project",
			method: "PUT",
			data: {
				issueTypeScreenSchemeId: parameters?.issueTypeScreenSchemeId,
				projectId: parameters?.projectId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateIssueTypeScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescreenscheme/${parameters.issueTypeScreenSchemeId}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteIssueTypeScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescreenscheme/${parameters.issueTypeScreenSchemeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async appendMappingsForIssueTypeScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescreenscheme/${parameters.issueTypeScreenSchemeId}/mapping`,
			method: "PUT",
			data: { issueTypeMappings: parameters.issueTypeMappings }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateDefaultScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescreenscheme/${parameters.issueTypeScreenSchemeId}/mapping/default`,
			method: "PUT",
			data: { screenSchemeId: parameters.screenSchemeId }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeMappingsFromIssueTypeScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescreenscheme/${parameters.issueTypeScreenSchemeId}/mapping/remove`,
			method: "POST",
			data: { issueTypeIds: parameters.issueTypeIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectsForIssueTypeScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/issuetypescreenscheme/${parameters.issueTypeScreenSchemeId}/project`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				query: parameters.query
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueVotes.mjs
var IssueVotes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getVotes(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/votes`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async addVote(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/votes`,
			method: "POST",
			headers: { "Content-Type": "application/json" }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeVote(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/votes`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueWatchers.mjs
var IssueWatchers = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIsWatchingIssueBulk(parameters, callback) {
		const config = {
			url: "/rest/api/3/issue/watching",
			method: "POST",
			data: { issueIds: parameters?.issueIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async getIssueWatchers(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/watchers`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async addWatcher(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/watchers`,
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: parameters.accountId
		};
		return this.client.sendRequest(config, callback);
	}
	async removeWatcher(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/watchers`,
			method: "DELETE",
			params: {
				username: parameters.username,
				accountId: parameters.accountId
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueWorklogProperties.mjs
var IssueWorklogProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getWorklogPropertyKeys(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/${parameters.worklogId}/properties`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorklogProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/${parameters.worklogId}/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setWorklogProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/${parameters.worklogId}/properties/${parameters.propertyKey}`,
			method: "PUT"
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorklogProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/${parameters.worklogId}/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/issueWorklogs.mjs
var IssueWorklogs = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getIssueWorklog(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				startedAfter: parameters.startedAfter,
				startedBefore: parameters.startedBefore,
				expand: parameters.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async addWorklog(parameters, callback) {
		let comment;
		if (typeof parameters.comment === "string") comment = {
			type: "doc",
			version: 1,
			content: [{
				type: "paragraph",
				content: [{
					type: "text",
					text: parameters.comment
				}]
			}]
		};
		else comment = parameters.comment;
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog`,
			method: "POST",
			params: {
				notifyUsers: parameters.notifyUsers,
				adjustEstimate: parameters.adjustEstimate,
				newEstimate: parameters.newEstimate,
				reduceBy: parameters.reduceBy,
				expand: parameters.expand,
				overrideEditableFlag: parameters.overrideEditableFlag
			},
			data: {
				author: parameters.author,
				comment,
				created: parameters.created,
				id: parameters.id,
				issueId: parameters.issueId,
				properties: parameters.properties,
				self: parameters.self,
				started: parameters.started,
				timeSpent: parameters.timeSpent,
				timeSpentSeconds: parameters.timeSpentSeconds,
				updateAuthor: parameters.updateAuthor,
				updated: parameters.updated,
				visibility: parameters.visibility
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkDeleteWorklogs(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog`,
			method: "DELETE",
			params: {
				adjustEstimate: parameters.adjustEstimate,
				overrideEditableFlag: parameters.overrideEditableFlag
			},
			data: { ids: parameters.ids }
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkMoveWorklogs(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/move`,
			method: "POST",
			params: {
				adjustEstimate: parameters.adjustEstimate,
				overrideEditableFlag: parameters.overrideEditableFlag
			},
			data: parameters.worklogs
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorklog(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/${parameters.id}`,
			method: "GET",
			params: { expand: parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorklog(parameters, callback) {
		let comment;
		if (typeof parameters.comment === "string") comment = {
			type: "doc",
			version: 1,
			content: [{
				type: "paragraph",
				content: [{
					type: "text",
					text: parameters.comment
				}]
			}]
		};
		else comment = parameters.comment;
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/${parameters.id}`,
			method: "PUT",
			params: {
				notifyUsers: parameters.notifyUsers,
				adjustEstimate: parameters.adjustEstimate,
				newEstimate: parameters.newEstimate,
				expand: parameters.expand,
				overrideEditableFlag: parameters.overrideEditableFlag
			},
			data: {
				comment,
				visibility: parameters.visibility,
				started: parameters.started,
				timeSpent: parameters.timeSpent,
				timeSpentSeconds: parameters.timeSpentSeconds,
				properties: parameters.properties
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorklog(parameters, callback) {
		const config = {
			url: `/rest/api/3/issue/${parameters.issueIdOrKey}/worklog/${parameters.id}`,
			method: "DELETE",
			params: {
				notifyUsers: parameters.notifyUsers,
				adjustEstimate: parameters.adjustEstimate,
				newEstimate: parameters.newEstimate,
				increaseBy: parameters.increaseBy,
				overrideEditableFlag: parameters.overrideEditableFlag
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getIdsOfWorklogsDeletedSince(parameters, callback) {
		const config = {
			url: "/rest/api/3/worklog/deleted",
			method: "GET",
			params: { since: parameters?.since }
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorklogsForIds(parameters, callback) {
		const config = {
			url: "/rest/api/3/worklog/list",
			method: "POST",
			params: { expand: parameters?.expand },
			data: { ids: parameters?.ids }
		};
		return this.client.sendRequest(config, callback);
	}
	async getIdsOfWorklogsModifiedSince(parameters, callback) {
		const config = {
			url: "/rest/api/3/worklog/updated",
			method: "GET",
			params: {
				since: parameters?.since,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/jiraExpressions.mjs
var JiraExpressions = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async analyseExpression(parameters, callback) {
		const config = {
			url: "/rest/api/3/expression/analyse",
			method: "POST",
			params: { check: parameters?.check },
			data: {
				contextVariables: parameters?.contextVariables,
				expressions: parameters?.expressions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async evaluateJiraExpression(parameters, callback) {
		const config = {
			url: "/rest/api/3/expression/eval",
			method: "POST",
			params: { expand: parameters.expand },
			data: {
				context: parameters.context,
				expression: parameters.expression
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async evaluateJiraExpressionUsingEnhancedSearch(parameters, callback) {
		const config = {
			url: "/rest/api/3/expression/evaluate",
			method: "POST",
			params: { expand: parameters.expand },
			data: {
				context: parameters.context,
				expression: parameters.expression
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/jiraSettings.mjs
var JiraSettings = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getApplicationProperty(parameters, callback) {
		const config = {
			url: "/rest/api/3/application-properties",
			method: "GET",
			params: {
				key: parameters?.key,
				permissionLevel: parameters?.permissionLevel,
				keyFilter: parameters?.keyFilter
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAdvancedSettings(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/application-properties/advanced-settings",
			method: "GET"
		}, callback);
	}
	async setApplicationProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/application-properties/${parameters.id}`,
			method: "PUT",
			data: parameters.body
		};
		return this.client.sendRequest(config, callback);
	}
	async getConfiguration(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/configuration",
			method: "GET"
		}, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/jQL.mjs
var JQL = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAutoComplete(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/jql/autocompletedata",
			method: "GET"
		}, callback);
	}
	async getAutoCompletePost(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/autocompletedata",
			method: "POST",
			data: {
				includeCollapsedFields: parameters?.includeCollapsedFields,
				projectIds: parameters?.projectIds
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getFieldAutoCompleteForQueryString(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/autocompletedata/suggestions",
			method: "GET",
			params: {
				fieldName: parameters?.fieldName,
				fieldValue: parameters?.fieldValue,
				predicateName: parameters?.predicateName,
				predicateValue: parameters?.predicateValue
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async parseJqlQueries(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/parse",
			method: "POST",
			params: { validation: parameters.validation },
			data: { queries: parameters.queries }
		};
		return this.client.sendRequest(config, callback);
	}
	async migrateQueries(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/pdcleaner",
			method: "POST",
			data: { queryStrings: parameters?.queryStrings }
		};
		return this.client.sendRequest(config, callback);
	}
	async sanitiseJqlQueries(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/sanitize",
			method: "POST",
			data: { queries: parameters?.queries }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/jqlFunctionsApps.mjs
var JqlFunctionsApps = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getPrecomputations(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/function/computation",
			method: "GET",
			params: {
				functionKey: parameters?.functionKey,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				orderBy: parameters?.orderBy,
				filter: parameters?.filter
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updatePrecomputations(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/function/computation",
			method: "POST",
			params: { skipNotFoundPrecomputations: parameters.skipNotFoundPrecomputations },
			data: { values: parameters.values }
		};
		return this.client.sendRequest(config, callback);
	}
	async getPrecomputationsByID(parameters, callback) {
		const config = {
			url: "/rest/api/3/jql/function/computation/search",
			method: "POST",
			params: { orderBy: parameters.orderBy },
			data: { precomputationIDs: parameters.precomputationIDs }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/labels.mjs
var Labels = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllLabels(parameters, callback) {
		const config = {
			url: "/rest/api/3/label",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/licenseMetrics.mjs
var LicenseMetrics = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getLicense(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/instance/license",
			method: "GET"
		}, callback);
	}
	async getApproximateLicenseCount(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/license/approximateLicenseCount",
			method: "GET"
		}, callback);
	}
	async getApproximateApplicationLicenseCount(applicationKey, callback) {
		const config = {
			url: `/rest/api/3/license/approximateLicenseCount/product/${applicationKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/migrationOfConnectModulesToForge.mjs
var MigrationOfConnectModulesToForge = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async fetchMigrationTask(parameters, callback) {
		const config = {
			url: `/rest/atlassian-connect/1/migration/${parameters.connectKey}/${parameters.jiraIssueFieldsKey}/task`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/myself.mjs
var Myself = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getPreference(parameters, callback) {
		const config = {
			url: "/rest/api/3/mypreferences",
			method: "GET",
			params: { key: parameters.key }
		};
		return this.client.sendRequest(config, callback);
	}
	async setPreference(parameters, callback) {
		const config = {
			url: "/rest/api/3/mypreferences",
			method: "PUT",
			params: { key: parameters.key }
		};
		return this.client.sendRequest(config, callback);
	}
	async removePreference(parameters, callback) {
		const config = {
			url: "/rest/api/3/mypreferences",
			method: "DELETE",
			params: { key: parameters.key }
		};
		return this.client.sendRequest(config, callback);
	}
	async getLocale(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/mypreferences/locale",
			method: "GET"
		}, callback);
	}
	async getCurrentUser(parameters, callback) {
		const config = {
			url: "/rest/api/3/myself",
			method: "GET",
			params: { expand: parameters?.expand }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/permissions.mjs
var Permissions = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getMyPermissions(parameters, callback) {
		const config = {
			url: "/rest/api/3/mypermissions",
			method: "GET",
			params: {
				projectKey: parameters?.projectKey,
				projectId: parameters?.projectId,
				issueKey: parameters?.issueKey,
				issueId: parameters?.issueId,
				permissions: parameters?.permissions,
				projectUuid: parameters?.projectUuid,
				projectConfigurationUuid: parameters?.projectConfigurationUuid,
				commentId: parameters?.commentId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllPermissions(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/permissions",
			method: "GET"
		}, callback);
	}
	async getBulkPermissions(parameters, callback) {
		const config = {
			url: "/rest/api/3/permissions/check",
			method: "POST",
			data: {
				accountId: parameters?.accountId,
				globalPermissions: parameters?.globalPermissions,
				projectPermissions: parameters?.projectPermissions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getPermittedProjects(parameters, callback) {
		const config = {
			url: "/rest/api/3/permissions/project",
			method: "POST",
			data: { permissions: parameters?.permissions }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/permissionSchemes.mjs
var PermissionSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllPermissionSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/permissionscheme",
			method: "GET",
			params: { expand: parameters?.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async createPermissionScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/permissionscheme",
			method: "POST",
			params: { expand: parameters?.expand },
			data: {
				...parameters,
				expand: void 0
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getPermissionScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/permissionscheme/${parameters.schemeId}`,
			method: "GET",
			params: { expand: parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async updatePermissionScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/permissionscheme/${parameters.schemeId}`,
			method: "PUT",
			params: { expand: parameters.expand },
			data: {
				...parameters,
				schemeId: void 0,
				expand: void 0
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deletePermissionScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/permissionscheme/${parameters.schemeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getPermissionSchemeGrants(parameters, callback) {
		const config = {
			url: `/rest/api/3/permissionscheme/${parameters.schemeId}/permission`,
			method: "GET",
			params: { expand: parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async createPermissionGrant(parameters, callback) {
		const config = {
			url: `/rest/api/3/permissionscheme/${parameters.schemeId}/permission`,
			method: "POST",
			params: { expand: parameters.expand },
			data: {
				holder: parameters.holder,
				id: parameters.id,
				permission: parameters.permission,
				self: parameters.self
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getPermissionSchemeGrant(parameters, callback) {
		const config = {
			url: `/rest/api/3/permissionscheme/${parameters.schemeId}/permission/${parameters.permissionId}`,
			method: "GET",
			params: { expand: parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async deletePermissionSchemeEntity(parameters, callback) {
		const config = {
			url: `/rest/api/3/permissionscheme/${parameters.schemeId}/permission/${parameters.permissionId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/plans.mjs
var Plans = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getPlans(parameters, callback) {
		const config = {
			url: "/rest/api/3/plans/plan",
			method: "GET",
			params: {
				includeTrashed: parameters?.includeTrashed,
				includeArchived: parameters?.includeArchived,
				cursor: parameters?.cursor,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createPlan(parameters, callback) {
		const config = {
			url: "/rest/api/3/plans/plan",
			method: "POST",
			params: { useGroupId: parameters.useGroupId },
			data: {
				crossProjectReleases: parameters.crossProjectReleases,
				customFields: parameters.customFields,
				exclusionRules: parameters.exclusionRules,
				issueSources: parameters.issueSources,
				leadAccountId: parameters.leadAccountId,
				name: parameters.name,
				permissions: parameters.permissions,
				scheduling: parameters.scheduling
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getPlan(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}`,
			method: "GET",
			params: { useGroupId: parameters.useGroupId }
		};
		return this.client.sendRequest(config, callback);
	}
	async updatePlan(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}`,
			method: "PUT",
			params: { useGroupId: parameters.useGroupId },
			data: {
				crossProjectReleases: parameters.crossProjectReleases,
				customFields: parameters.customFields,
				exclusionRules: parameters.exclusionRules,
				issueSources: parameters.issueSources,
				leadAccountId: parameters.leadAccountId,
				name: parameters.name,
				permissions: parameters.permissions,
				scheduling: parameters.scheduling
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async archivePlan(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/archive`,
			method: "PUT"
		};
		return this.client.sendRequest(config, callback);
	}
	async duplicatePlan(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/duplicate`,
			method: "POST",
			data: { name: parameters.name }
		};
		return this.client.sendRequest(config, callback);
	}
	async trashPlan(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/trash`,
			method: "PUT"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/prioritySchemes.mjs
var PrioritySchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getPrioritySchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/priorityscheme",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				priorityId: paramSerializer("priorityId", parameters?.priorityId),
				schemeId: paramSerializer("schemeId", parameters?.schemeId),
				schemeName: parameters?.schemeName,
				onlyDefault: parameters?.onlyDefault,
				orderBy: parameters?.orderBy,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createPriorityScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/priorityscheme",
			method: "POST",
			data: {
				defaultPriorityId: parameters.defaultPriorityId,
				description: parameters.description,
				mappings: parameters.mappings,
				name: parameters.name,
				priorityIds: parameters.priorityIds,
				projectIds: parameters.projectIds
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async suggestedPrioritiesForMappings(parameters, callback) {
		const config = {
			url: "/rest/api/3/priorityscheme/mappings",
			method: "POST",
			data: {
				maxResults: parameters?.maxResults,
				priorities: parameters?.priorities,
				projects: parameters?.projects,
				schemeId: parameters?.schemeId,
				startAt: parameters?.startAt
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAvailablePrioritiesByPriorityScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/priorityscheme/priorities/available",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				query: parameters.query,
				schemeId: parameters.schemeId,
				exclude: parameters.exclude
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updatePriorityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/priorityscheme/${parameters.schemeId}`,
			method: "PUT",
			data: {
				defaultPriorityId: parameters.defaultPriorityId,
				description: parameters.description,
				mappings: parameters.mappings,
				name: parameters.name,
				priorities: parameters.priorities,
				projects: parameters.projects
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deletePriorityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/priorityscheme/${parameters.schemeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getPrioritiesByPriorityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/priorityscheme/${parameters.schemeId}/priorities`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectsByPriorityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/priorityscheme/${parameters.schemeId}/projects`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				projectId: paramSerializer("projectId", parameters.projectId),
				query: parameters.query
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectAvatars.mjs
var ProjectAvatars = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async updateProjectAvatar(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/avatar`,
			method: "PUT",
			data: {
				fileName: parameters.fileName,
				id: parameters.id,
				isDeletable: parameters.isDeletable,
				isSelected: parameters.isSelected,
				isSystemAvatar: parameters.isSystemAvatar,
				owner: parameters.owner,
				urls: parameters.urls
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteProjectAvatar(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/avatar/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async createProjectAvatar(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/avatar2`,
			method: "POST",
			headers: {
				"X-Atlassian-Token": "no-check",
				"Content-Type": parameters.mimeType
			},
			params: {
				x: parameters.x,
				y: parameters.y,
				size: parameters.size ?? 0
			},
			data: parameters.avatar
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllProjectAvatars(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/avatars`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectCategories.mjs
var ProjectCategories = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllProjectCategories(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/projectCategory",
			method: "GET"
		}, callback);
	}
	async createProjectCategory(parameters, callback) {
		const config = {
			url: "/rest/api/3/projectCategory",
			method: "POST",
			data: {
				description: parameters.description,
				id: parameters.id,
				name: parameters.name,
				self: parameters.self
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectCategoryById(parameters, callback) {
		const config = {
			url: `/rest/api/3/projectCategory/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateProjectCategory(parameters, callback) {
		const config = {
			url: `/rest/api/3/projectCategory/${parameters.id}`,
			method: "PUT",
			data: {
				name: parameters.name,
				description: parameters.description
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeProjectCategory(parameters, callback) {
		const config = {
			url: `/rest/api/3/projectCategory/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectClassificationLevels.mjs
var ProjectClassificationLevels = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getDefaultProjectClassification(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/classification-level/default`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateDefaultProjectClassification(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/classification-level/default`,
			method: "PUT",
			data: { id: parameters.id }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeDefaultProjectClassification(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/classification-level/default`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectComponents.mjs
var ProjectComponents = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async findComponentsForProjects(parameters, callback) {
		const config = {
			url: "/rest/api/3/component",
			method: "GET",
			params: {
				projectIdsOrKeys: parameters.projectIdsOrKeys,
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				orderBy: parameters.orderBy,
				query: parameters.query
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createComponent(parameters, callback) {
		const config = {
			url: "/rest/api/3/component",
			method: "POST",
			data: {
				ari: parameters.ari,
				assignee: parameters.assignee,
				assigneeType: parameters.assigneeType,
				description: parameters.description,
				id: parameters.id,
				isAssigneeTypeValid: parameters.isAssigneeTypeValid,
				lead: parameters.lead,
				leadAccountId: parameters.leadAccountId,
				leadUserName: parameters.leadUserName,
				metadata: parameters.metadata,
				name: parameters.name,
				project: parameters.project,
				projectId: parameters.projectId,
				realAssignee: parameters.realAssignee,
				realAssigneeType: parameters.realAssigneeType,
				self: parameters.self
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getComponent(parameters, callback) {
		const config = {
			url: `/rest/api/3/component/${parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateComponent(parameters, callback) {
		const config = {
			url: `/rest/api/3/component/${parameters.id}`,
			method: "PUT",
			data: {
				name: parameters.name,
				description: parameters.description,
				leadUserName: parameters.leadUserName,
				leadAccountId: parameters.leadAccountId,
				assigneeType: parameters.assigneeType,
				project: parameters.project
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteComponent(parameters, callback) {
		const config = {
			url: `/rest/api/3/component/${parameters.id}`,
			method: "DELETE",
			params: { moveIssuesTo: parameters.moveIssuesTo }
		};
		return this.client.sendRequest(config, callback);
	}
	async getComponentRelatedIssues(parameters, callback) {
		const config = {
			url: `/rest/api/3/component/${parameters.id}/relatedIssueCounts`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectComponentsPaginated(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/component`,
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				orderBy: parameters.orderBy,
				componentSource: parameters.componentSource,
				query: parameters.query
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectComponents(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/components`,
			method: "GET",
			params: { componentSource: parameters.componentSource }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectEmail.mjs
var ProjectEmail = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getProjectEmail(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectId}/email`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateProjectEmail(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectId}/email`,
			method: "PUT",
			data: {
				emailAddress: parameters.emailAddress,
				emailAddressStatus: parameters.emailAddressStatus
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectFeatures.mjs
var ProjectFeatures = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getFeaturesForProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/features`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async toggleFeatureForProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/features/${parameters.featureKey}`,
			method: "PUT",
			data: { state: parameters.state }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectKeyAndNameValidation.mjs
var ProjectKeyAndNameValidation = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async validateProjectKey(parameters, callback) {
		const config = {
			url: "/rest/api/3/projectvalidate/key",
			method: "GET",
			params: { key: typeof parameters === "string" ? parameters : parameters?.key }
		};
		return this.client.sendRequest(config, callback);
	}
	async getValidProjectKey(parameters, callback) {
		const config = {
			url: "/rest/api/3/projectvalidate/validProjectKey",
			method: "GET",
			params: { key: typeof parameters === "string" ? parameters : parameters?.key }
		};
		return this.client.sendRequest(config, callback);
	}
	async getValidProjectName(parameters, callback) {
		const config = {
			url: "/rest/api/3/projectvalidate/validProjectName",
			method: "GET",
			params: { name: typeof parameters === "string" ? parameters : parameters.name }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectPermissionSchemes.mjs
var ProjectPermissionSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getProjectIssueSecurityScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectKeyOrId}/issuesecuritylevelscheme`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAssignedPermissionScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectKeyOrId}/permissionscheme`,
			method: "GET",
			params: { expand: typeof parameters !== "string" && parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async assignPermissionScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectKeyOrId}/permissionscheme`,
			method: "PUT",
			params: { expand: parameters.expand },
			data: { id: parameters.id }
		};
		return this.client.sendRequest(config, callback);
	}
	async getSecurityLevelsForProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectKeyOrId}/securitylevel`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectProperties.mjs
var ProjectProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getProjectPropertyKeys(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/properties`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/properties/${parameters.propertyKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setProjectProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/properties/${parameters.propertyKey}`,
			method: "PUT",
			data: parameters.propertyValue
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteProjectProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/properties/${parameters.propertyKey}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectRoleActors.mjs
var ProjectRoleActors = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async addActorUsers(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/role/${parameters.id}`,
			method: "POST",
			data: {
				group: parameters.group,
				groupId: parameters.groupId,
				user: parameters.user
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async setActors(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/role/${parameters.id}`,
			method: "PUT",
			data: { categorisedActors: parameters.categorisedActors }
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteActor(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/role/${parameters.id}`,
			method: "DELETE",
			params: {
				user: parameters.user,
				group: parameters.group,
				groupId: parameters.groupId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectRoleActorsForRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/role/${typeof parameters === "string" ? parameters : parameters.id}/actors`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async addProjectRoleActorsToRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/role/${parameters.id}/actors`,
			method: "POST",
			data: {
				group: parameters.group,
				groupId: parameters.groupId,
				user: parameters.user
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteProjectRoleActorsFromRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/role/${parameters.id}/actors`,
			method: "DELETE",
			params: {
				user: parameters.user,
				groupId: parameters.groupId,
				group: parameters.group
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectRoles.mjs
var ProjectRoles = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getProjectRoles(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/role`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}/role/${parameters.id}`,
			method: "GET",
			params: { excludeInactiveUsers: parameters.excludeInactiveUsers }
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectRoleDetails(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/roledetails`,
			method: "GET",
			params: {
				currentMember: typeof parameters !== "string" && parameters.currentMember,
				excludeConnectAddons: typeof parameters !== "string" && parameters.excludeConnectAddons
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllProjectRoles(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/role",
			method: "GET"
		}, callback);
	}
	async createProjectRole(parameters, callback) {
		const config = {
			url: "/rest/api/3/role",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectRoleById(parameters, callback) {
		const config = {
			url: `/rest/api/3/role/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async partialUpdateProjectRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/role/${parameters.id}`,
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async fullyUpdateProjectRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/role/${parameters.id}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteProjectRole(parameters, callback) {
		const config = {
			url: `/rest/api/3/role/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "DELETE",
			params: { swap: typeof parameters !== "string" && parameters.swap }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projects.mjs
var Projects = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async createProject(parameters, callback) {
		const config = {
			url: "/rest/api/3/project",
			method: "POST",
			data: {
				assigneeType: parameters.assigneeType,
				avatarId: parameters.avatarId,
				categoryId: parameters.categoryId,
				description: parameters.description,
				fieldConfigurationScheme: parameters.fieldConfigurationScheme,
				issueSecurityScheme: parameters.issueSecurityScheme,
				issueTypeScheme: parameters.issueTypeScheme,
				issueTypeScreenScheme: parameters.issueTypeScreenScheme,
				key: parameters.key,
				leadAccountId: parameters.leadAccountId,
				name: parameters.name,
				notificationScheme: parameters.notificationScheme,
				permissionScheme: parameters.permissionScheme,
				projectTemplateKey: parameters.projectTemplateKey,
				projectTypeKey: parameters.projectTypeKey,
				url: parameters.url,
				workflowScheme: parameters.workflowScheme
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getRecent(parameters, callback) {
		const config = {
			url: "/rest/api/3/project/recent",
			method: "GET",
			params: {
				expand: parameters?.expand,
				properties: parameters?.properties
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchProjects(parameters, callback) {
		const config = {
			url: "/rest/api/3/project/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				orderBy: parameters?.orderBy,
				id: parameters?.id,
				keys: parameters?.keys,
				query: parameters?.query,
				typeKey: parameters?.typeKey,
				categoryId: parameters?.categoryId,
				action: parameters?.action,
				expand: parameters?.expand,
				status: parameters?.status,
				properties: parameters?.properties,
				propertyQuery: parameters?.propertyQuery
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}`,
			method: "GET",
			params: {
				expand: typeof parameters !== "string" && parameters.expand,
				properties: typeof parameters !== "string" && parameters.properties
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectIdOrKey}`,
			method: "PUT",
			params: { expand: parameters.expand },
			data: {
				assigneeType: parameters.assigneeType,
				avatarId: parameters.avatarId,
				categoryId: parameters.categoryId,
				description: parameters.description,
				issueSecurityScheme: parameters.issueSecurityScheme,
				key: parameters.key,
				leadAccountId: parameters.leadAccountId,
				name: parameters.name,
				notificationScheme: parameters.notificationScheme,
				permissionScheme: parameters.permissionScheme,
				projectTemplateKey: parameters.projectTemplateKey,
				projectTypeKey: parameters.projectTypeKey,
				releasedProjectKeys: parameters.releasedProjectKeys,
				url: parameters.url
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}`,
			method: "DELETE",
			params: { enableUndo: typeof parameters !== "string" && parameters.enableUndo }
		};
		return this.client.sendRequest(config, callback);
	}
	async archiveProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/archive`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteProjectAsynchronously(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/delete`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
	async restore(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/restore`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllStatuses(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/statuses`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getHierarchy(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectId}/hierarchy`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getNotificationSchemeForProject(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${parameters.projectKeyOrId}/notificationscheme`,
			method: "GET",
			params: { expand: parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectTemplates.mjs
var ProjectTemplates = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async createProjectWithCustomTemplate(parameters, callback) {
		const config = {
			url: "/rest/api/3/project-template",
			method: "POST",
			data: {
				details: parameters.details,
				template: parameters.template
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async editTemplate(parameters, callback) {
		const config = {
			url: "/rest/api/3/project-template/edit-template",
			method: "PUT",
			data: {
				templateDescription: parameters.templateDescription,
				templateGenerationOptions: parameters.templateGenerationOptions,
				templateKey: parameters.templateKey,
				templateName: parameters.templateName
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async liveTemplate(parameters, callback) {
		const config = {
			url: "/rest/api/3/project-template/live-template",
			method: "GET",
			params: {
				projectId: parameters.projectId,
				templateKey: parameters.templateKey
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeTemplate(parameters, callback) {
		const config = {
			url: "/rest/api/3/project-template/remove-template",
			method: "DELETE",
			params: { templateKey: parameters.templateKey }
		};
		return this.client.sendRequest(config, callback);
	}
	async saveTemplate(parameters, callback) {
		const config = {
			url: "/rest/api/3/project-template/save-template",
			method: "POST",
			data: {
				templateDescription: parameters.templateDescription,
				templateFromProjectRequest: parameters.templateFromProjectRequest,
				templateName: parameters.templateName
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectTypes.mjs
var ProjectTypes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllProjectTypes(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/project/type",
			method: "GET"
		}, callback);
	}
	async getAllAccessibleProjectTypes(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/project/type/accessible",
			method: "GET"
		}, callback);
	}
	async getProjectTypeByKey(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/type/${typeof parameters === "string" ? parameters : parameters.projectTypeKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAccessibleProjectTypeByKey(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/type/${typeof parameters === "string" ? parameters : parameters.projectTypeKey}/accessible`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/projectVersions.mjs
var ProjectVersions = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getProjectVersionsPaginated(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/version`,
			method: "GET",
			params: {
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults,
				orderBy: typeof parameters !== "string" && parameters.orderBy,
				query: typeof parameters !== "string" && parameters.query,
				status: typeof parameters !== "string" && parameters.status,
				expand: typeof parameters !== "string" && parameters.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectVersions(parameters, callback) {
		const config = {
			url: `/rest/api/3/project/${typeof parameters === "string" ? parameters : parameters.projectIdOrKey}/versions`,
			method: "GET",
			params: { expand: typeof parameters !== "string" && parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async createVersion(parameters, callback) {
		const config = {
			url: "/rest/api/3/version",
			method: "POST",
			data: {
				approvers: parameters.approvers,
				archived: parameters.archived,
				description: parameters.description,
				driver: parameters.driver,
				expand: parameters.expand,
				id: parameters.id,
				issuesStatusForFixVersion: parameters.issuesStatusForFixVersion,
				moveUnfixedIssuesTo: parameters.moveUnfixedIssuesTo,
				name: parameters.name,
				operations: parameters.operations,
				overdue: parameters.overdue,
				projectId: parameters.projectId,
				releaseDate: parameters.releaseDate,
				released: parameters.released,
				self: parameters.self,
				startDate: parameters.startDate,
				userReleaseDate: parameters.userReleaseDate,
				userStartDate: parameters.userStartDate
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getVersion(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET",
			params: { expand: typeof parameters !== "string" && parameters.expand }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateVersion(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.id}`,
			method: "PUT",
			data: {
				approvers: parameters.approvers,
				driver: parameters.driver,
				expand: parameters.expand,
				description: parameters.description,
				name: parameters.name,
				archived: parameters.archived,
				released: parameters.released,
				startDate: parameters.startDate,
				releaseDate: parameters.releaseDate,
				projectId: parameters.projectId,
				moveUnfixedIssuesTo: parameters.moveUnfixedIssuesTo
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async mergeVersions(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.id}/mergeto/${parameters.moveIssuesTo}`,
			method: "PUT"
		};
		return this.client.sendRequest(config, callback);
	}
	async moveVersion(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.id}/move`,
			method: "POST",
			data: {
				after: parameters.after,
				position: parameters.position
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getVersionRelatedIssues(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${typeof parameters === "string" ? parameters : parameters.id}/relatedIssueCounts`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async getRelatedWork(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.id}/relatedwork`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async createRelatedWork(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.id}/relatedwork`,
			method: "POST",
			data: {
				category: parameters.category,
				issueId: parameters.issueId,
				relatedWorkId: parameters.relatedWorkId,
				title: parameters.title,
				url: parameters.url
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateRelatedWork(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.id}/relatedwork`,
			method: "PUT",
			data: {
				category: parameters.category,
				issueId: parameters.issueId,
				relatedWorkId: parameters.relatedWorkId,
				title: parameters.title,
				url: parameters.url
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteAndReplaceVersion(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.id}/removeAndSwap`,
			method: "POST",
			data: {
				customFieldReplacementList: parameters.customFieldReplacementList,
				moveAffectedIssuesTo: parameters.moveAffectedIssuesTo,
				moveFixIssuesTo: parameters.moveFixIssuesTo
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getVersionUnresolvedIssues(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${typeof parameters === "string" ? parameters : parameters.id}/unresolvedIssueCount`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteRelatedWork(parameters, callback) {
		const config = {
			url: `/rest/api/3/version/${parameters.versionId}/relatedwork/${parameters.relatedWorkId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/screens.mjs
var Screens = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getScreensForField(parameters, callback) {
		const config = {
			url: `/rest/api/3/field/${typeof parameters === "string" ? parameters : parameters.fieldId}/screens`,
			method: "GET",
			params: {
				startAt: typeof parameters !== "string" && parameters.startAt,
				maxResults: typeof parameters !== "string" && parameters.maxResults,
				expand: typeof parameters !== "string" && parameters.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getScreens(parameters, callback) {
		const config = {
			url: "/rest/api/3/screens",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				queryString: parameters?.queryString,
				scope: parameters?.scope,
				orderBy: parameters?.orderBy
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createScreen(parameters, callback) {
		const config = {
			url: "/rest/api/3/screens",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async addFieldToDefaultScreen(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/addToDefault/${typeof parameters === "string" ? parameters : parameters.fieldId}`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateScreen(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteScreen(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${typeof parameters === "string" ? parameters : parameters.screenId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getAvailableScreenFields(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${typeof parameters === "string" ? parameters : parameters.screenId}/availableFields`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/screenSchemes.mjs
var ScreenSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getScreenSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/screenscheme",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				id: parameters?.id,
				expand: parameters?.expand,
				queryString: parameters?.queryString,
				orderBy: parameters?.orderBy
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createScreenScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/screenscheme",
			method: "POST",
			data: {
				name: typeof parameters === "string" ? parameters : parameters.name,
				description: typeof parameters !== "string" && parameters.description,
				screens: typeof parameters !== "string" && parameters.screens
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/screenscheme/${parameters.screenSchemeId}`,
			method: "PUT",
			data: {
				description: parameters.description,
				name: parameters.name,
				screens: parameters.screens
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteScreenScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/screenscheme/${typeof parameters === "string" ? parameters : parameters.screenSchemeId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/screenTabFields.mjs
var ScreenTabFields = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllScreenTabFields(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs/${parameters.tabId}/fields`,
			method: "GET",
			params: { projectKey: parameters.projectKey }
		};
		return this.client.sendRequest(config, callback);
	}
	async addScreenTabField(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs/${parameters.tabId}/fields`,
			method: "POST",
			data: { fieldId: parameters.fieldId }
		};
		return this.client.sendRequest(config, callback);
	}
	async removeScreenTabField(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs/${parameters.tabId}/fields/${parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async moveScreenTabField(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs/${parameters.tabId}/fields/${parameters.id}/move`,
			method: "POST",
			data: {
				after: parameters.after,
				position: parameters.position
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/screenTabs.mjs
var ScreenTabs = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getBulkScreenTabs(parameters, callback) {
		const config = {
			url: "/rest/api/3/screens/tabs",
			method: "GET",
			params: {
				screenId: paramSerializer("screenId", parameters?.screenId),
				tabId: parameters?.tabId,
				startAt: parameters?.startAt,
				maxResult: parameters?.maxResult
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllScreenTabs(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${typeof parameters === "string" ? parameters : parameters.screenId}/tabs`,
			method: "GET",
			params: { projectKey: typeof parameters !== "string" && parameters.projectKey }
		};
		return this.client.sendRequest(config, callback);
	}
	async addScreenTab(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs`,
			method: "POST",
			data: {
				id: parameters.id,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async renameScreenTab(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs/${parameters.tabId}`,
			method: "PUT",
			data: {
				id: parameters.id,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteScreenTab(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs/${parameters.tabId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async moveScreenTab(parameters, callback) {
		const config = {
			url: `/rest/api/3/screens/${parameters.screenId}/tabs/${parameters.tabId}/move/${parameters.pos}`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/serverInfo.mjs
var ServerInfo = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getServerInfo(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/serverInfo",
			method: "GET"
		}, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/serviceRegistry.mjs
var ServiceRegistry = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async services(parameters, callback) {
		const config = {
			url: "/rest/atlassian-connect/1/service-registry",
			method: "GET",
			params: { serviceIds: parameters.serviceIds }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/schemas/pageSchema.mjs
var PageSchema = (valueSchema) => strictObject({
	values: valueSchema.array(),
	/** The index of the first item returned. */
	startAt: int(),
	/** The maximum number of items that could be returned. */
	maxResults: int(),
	/** The number of items returned. */
	total: int(),
	/** Whether this is the last page. */
	isLast: boolean(),
	self: url()
});
//#endregion
//#region node_modules/jira.js/dist/esm/version3/status.mjs
var Status = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getStatusesById(parameters, callback) {
		const config = {
			url: "/rest/api/3/statuses",
			method: "GET",
			params: {
				id: typeof parameters === "string" ? parameters : parameters.id,
				expand: typeof parameters !== "string" ? parameters.expand : void 0
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createStatuses(parameters, callback) {
		const config = {
			url: "/rest/api/3/statuses",
			method: "POST",
			data: {
				scope: parameters.scope,
				statuses: parameters.statuses
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateStatuses(parameters, callback) {
		const config = {
			url: "/rest/api/3/statuses",
			method: "PUT",
			data: { statuses: parameters.statuses }
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteStatusesById(parameters, callback) {
		const config = {
			url: "/rest/api/3/statuses",
			method: "DELETE",
			params: { id: typeof parameters === "string" ? parameters : parameters.id }
		};
		return this.client.sendRequest(config, callback);
	}
	async getStatusesByName(parameters, callback) {
		const config = {
			url: "/rest/api/3/statuses/byNames",
			method: "GET",
			params: {
				name: paramSerializer("name", parameters.name),
				projectId: parameters.projectId
			}
		};
		const statuses = await this.client.sendRequest(config, callback);
		return JiraStatusSchema.array().parse(statuses);
	}
	async search(parameters, callback) {
		const config = {
			url: "/rest/api/3/statuses/search",
			method: "GET",
			params: {
				expand: parameters?.expand,
				projectId: parameters?.projectId,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				searchString: parameters?.searchString,
				statusCategory: parameters?.statusCategory
			}
		};
		const statuses = await this.client.sendRequest(config, callback);
		return PageSchema(JiraStatusSchema).parse(statuses);
	}
	async getProjectIssueTypeUsagesForStatus(parameters, callback) {
		const config = {
			url: `/rest/api/3/statuses/${parameters.statusId}/project/${parameters.projectId}/issueTypeUsages`,
			method: "GET",
			params: {
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectUsagesForStatus(parameters, callback) {
		const config = {
			url: `/rest/api/3/statuses/${parameters.statusId}/projectUsages`,
			method: "GET",
			params: {
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowUsagesForStatus(parameters, callback) {
		const config = {
			url: `/rest/api/3/statuses/${parameters.statusId}/workflowUsages`,
			method: "GET",
			params: {
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/tasks.mjs
var Tasks = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getTask(parameters, callback) {
		const config = {
			url: `/rest/api/3/task/${typeof parameters === "string" ? parameters : parameters.taskId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async cancelTask(parameters, callback) {
		const config = {
			url: `/rest/api/3/task/${typeof parameters === "string" ? parameters : parameters.taskId}/cancel`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/teamsInPlan.mjs
var TeamsInPlan = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getTeams(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team`,
			method: "GET",
			params: {
				cursor: parameters.cursor,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async addAtlassianTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/atlassian`,
			method: "POST",
			data: {
				capacity: parameters.capacity,
				id: parameters.id,
				issueSourceId: parameters.issueSourceId,
				planningStyle: parameters.planningStyle,
				sprintLength: parameters.sprintLength
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAtlassianTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/atlassian/${parameters.atlassianTeamId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateAtlassianTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/atlassian/${parameters.atlassianTeamId}`,
			method: "PUT"
		};
		return this.client.sendRequest(config, callback);
	}
	async removeAtlassianTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/atlassian/${parameters.atlassianTeamId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async createPlanOnlyTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/planonly`,
			method: "POST",
			data: {
				capacity: parameters.capacity,
				issueSourceId: parameters.issueSourceId,
				memberAccountIds: parameters.memberAccountIds,
				name: parameters.name,
				planningStyle: parameters.planningStyle,
				sprintLength: parameters.sprintLength
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getPlanOnlyTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/planonly/${parameters.planOnlyTeamId}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updatePlanOnlyTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/planonly/${parameters.planOnlyTeamId}`,
			method: "PUT"
		};
		return this.client.sendRequest(config, callback);
	}
	async deletePlanOnlyTeam(parameters, callback) {
		const config = {
			url: `/rest/api/3/plans/plan/${parameters.planId}/team/planonly/${parameters.planOnlyTeamId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/timeTracking.mjs
var TimeTracking = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getSelectedTimeTrackingImplementation(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/configuration/timetracking",
			method: "GET"
		}, callback);
	}
	async selectTimeTrackingImplementation(parameters, callback) {
		const config = {
			url: "/rest/api/3/configuration/timetracking",
			method: "PUT",
			data: {
				key: parameters?.key,
				name: parameters?.name,
				url: parameters?.url
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAvailableTimeTrackingImplementations(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/configuration/timetracking/list",
			method: "GET"
		}, callback);
	}
	async getSharedTimeTrackingConfiguration(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/configuration/timetracking/options",
			method: "GET"
		}, callback);
	}
	async setSharedTimeTrackingConfiguration(parameters, callback) {
		const config = {
			url: "/rest/api/3/configuration/timetracking/options",
			method: "PUT",
			data: {
				defaultUnit: parameters.defaultUnit,
				timeFormat: parameters.timeFormat,
				workingDaysPerWeek: parameters.workingDaysPerWeek,
				workingHoursPerDay: parameters.workingHoursPerDay
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/uIModificationsApps.mjs
var UIModificationsApps = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getUiModifications(parameters, callback) {
		const config = {
			url: "/rest/api/3/uiModifications",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				expand: parameters?.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createUiModification(parameters, callback) {
		const config = {
			url: "/rest/api/3/uiModifications",
			method: "POST",
			data: {
				name: parameters.name,
				description: parameters.description,
				data: parameters.data,
				contexts: parameters.contexts
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateUiModification(parameters, callback) {
		const config = {
			url: `/rest/api/3/uiModifications/${parameters.uiModificationId}`,
			method: "PUT",
			data: {
				contexts: parameters.contexts,
				data: parameters.data,
				description: parameters.description,
				name: parameters.name
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteUiModification(parameters, callback) {
		const config = {
			url: `/rest/api/3/uiModifications/${typeof parameters === "string" ? parameters : parameters.uiModificationId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/userNavProperties.mjs
var UserNavProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getUserNavProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/user/nav4-opt-property/${parameters.propertyKey}`,
			method: "GET",
			params: { accountId: parameters.accountId }
		};
		return this.client.sendRequest(config, callback);
	}
	async setUserNavProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/user/nav4-opt-property/${parameters.propertyKey}`,
			method: "PUT",
			params: { accountId: parameters.accountId }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/userProperties.mjs
var UserProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getUserPropertyKeys(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/properties",
			method: "GET",
			params: {
				accountId: parameters?.accountId,
				userKey: parameters?.userKey,
				username: parameters?.username
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getUserProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/user/properties/${parameters.propertyKey}`,
			method: "GET",
			params: {
				accountId: parameters.accountId,
				userKey: parameters.userKey,
				username: parameters.username
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async setUserProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/user/properties/${parameters.propertyKey}`,
			method: "PUT",
			params: { accountId: parameters.accountId },
			data: parameters.propertyValue
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteUserProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/user/properties/${parameters.propertyKey}`,
			method: "DELETE",
			params: {
				accountId: parameters.accountId,
				userKey: parameters.userKey,
				username: parameters.username
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/users.mjs
var Users = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getUser(parameters, callback) {
		const config = {
			url: "/rest/api/3/user",
			method: "GET",
			params: {
				accountId: parameters.accountId,
				username: parameters.username,
				key: parameters.key,
				expand: parameters.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createUser(parameters, callback) {
		const config = {
			url: "/rest/api/3/user",
			method: "POST",
			data: {
				emailAddress: parameters.emailAddress,
				products: parameters.products ? parameters.products : [
					"jira-core",
					"jira-servicedesk",
					"jira-product-discovery",
					"jira-software"
				],
				self: parameters.self
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async removeUser(parameters, callback) {
		const config = {
			url: "/rest/api/3/user",
			method: "DELETE",
			params: {
				accountId: parameters.accountId,
				username: parameters.username,
				key: parameters.key
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkGetUsers(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/bulk",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				accountId: paramSerializer("accountId", parameters.accountId)
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async bulkGetUsersMigration(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/bulk/migration",
			method: "GET",
			params: {
				key: paramSerializer("key", parameters.key),
				maxResults: parameters.maxResults,
				startAt: parameters.startAt,
				username: paramSerializer("username", parameters.username)
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getUserDefaultColumns(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/columns",
			method: "GET",
			params: { accountId: parameters?.accountId }
		};
		return this.client.sendRequest(config, callback);
	}
	async setUserColumns(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/columns",
			method: "PUT",
			params: { accountId: parameters.accountId },
			data: parameters.columns
		};
		return this.client.sendRequest(config, callback);
	}
	async resetUserColumns(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/columns",
			method: "DELETE",
			params: {
				accountId: parameters.accountId,
				username: parameters.username
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getUserEmail(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/email",
			method: "GET",
			params: { accountId: typeof parameters === "string" ? parameters : parameters.accountId }
		};
		return this.client.sendRequest(config, callback);
	}
	async getUserEmailBulk(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/email/bulk",
			method: "GET",
			params: { accountId: typeof parameters === "string" ? parameters : parameters.accountId }
		};
		return this.client.sendRequest(config, callback);
	}
	async getUserGroups(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/groups",
			method: "GET",
			params: { accountId: parameters.accountId }
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllUsersDefault(parameters, callback) {
		const config = {
			url: "/rest/api/3/users",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getAllUsers(parameters, callback) {
		const config = {
			url: "/rest/api/3/users/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/userSearch.mjs
var UserSearch = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async findBulkAssignableUsers(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/assignable/multiProjectSearch",
			method: "GET",
			params: {
				query: parameters.query,
				username: parameters.username,
				accountId: parameters.accountId,
				projectKeys: parameters.projectKeys,
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findAssignableUsers(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/assignable/search",
			method: "GET",
			params: {
				query: parameters?.query,
				sessionId: parameters?.sessionId,
				username: parameters?.username,
				accountId: parameters?.accountId,
				project: parameters?.project,
				issueKey: parameters?.issueKey,
				issueId: parameters?.issueId,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				actionDescriptorId: parameters?.actionDescriptorId,
				recommend: parameters?.recommend
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findUsersWithAllPermissions(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/permission/search",
			method: "GET",
			params: {
				query: parameters.query,
				username: parameters.username,
				accountId: parameters.accountId,
				permissions: parameters.permissions,
				issueKey: parameters.issueKey,
				projectKey: parameters.projectKey,
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findUsersForPicker(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/picker",
			method: "GET",
			params: {
				query: parameters.query,
				maxResults: parameters.maxResults,
				showAvatar: parameters.showAvatar,
				excludeAccountIds: paramSerializer("excludeAccountIds", parameters.excludeAccountIds),
				avatarSize: parameters.avatarSize,
				excludeConnectUsers: parameters.excludeConnectUsers
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findUsers(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/search",
			method: "GET",
			params: {
				query: parameters?.query,
				username: parameters?.username,
				accountId: parameters?.accountId,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				property: parameters?.property
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findUsersByQuery(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/search/query",
			method: "GET",
			params: {
				query: parameters.query,
				startAt: parameters.startAt,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findUserKeysByQuery(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/search/query/key",
			method: "GET",
			params: {
				query: parameters.query,
				startAt: parameters.startAt,
				maxResult: parameters.maxResult || parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async findUsersWithBrowsePermission(parameters, callback) {
		const config = {
			url: "/rest/api/3/user/viewissue/search",
			method: "GET",
			params: {
				query: parameters?.query,
				username: parameters?.username,
				accountId: parameters?.accountId,
				issueKey: parameters?.issueKey,
				projectKey: parameters?.projectKey,
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/webhooks.mjs
var Webhooks = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getDynamicWebhooksForApp(parameters, callback) {
		const config = {
			url: "/rest/api/3/webhook",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async registerDynamicWebhooks(parameters, callback) {
		const config = {
			url: "/rest/api/3/webhook",
			method: "POST",
			data: {
				url: parameters.url,
				webhooks: parameters.webhooks
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWebhookById(parameters, callback) {
		const config = {
			url: "/rest/api/3/webhook",
			method: "DELETE",
			data: { webhookIds: parameters.webhookIds }
		};
		return this.client.sendRequest(config, callback);
	}
	async getFailedWebhooks(parameters, callback) {
		const config = {
			url: "/rest/api/3/webhook/failed",
			method: "GET",
			params: {
				maxResults: parameters?.maxResults,
				after: parameters?.after
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async refreshWebhooks(parameters, callback) {
		const config = {
			url: "/rest/api/3/webhook/refresh",
			method: "PUT",
			data: { webhookIds: parameters.webhookIds }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflows.mjs
var Workflows = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async createWorkflow(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflow",
			method: "POST",
			data: {
				description: parameters.description,
				name: parameters.name,
				statuses: parameters.statuses,
				transitions: parameters.transitions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async readWorkflowFromHistory(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflow/history",
			method: "POST",
			data: {
				version: parameters.version,
				workflowId: parameters.workflowId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async listWorkflowHistory(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflow/history/list",
			method: "POST",
			params: { expand: parameters.expand },
			data: { workflowId: parameters.workflowId }
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowsPaginated(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflow/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				workflowName: paramSerializer("workflowName", parameters?.workflowName),
				expand: parameters?.expand,
				queryString: parameters?.queryString,
				orderBy: parameters?.orderBy,
				isActive: parameters?.isActive
			}
		};
		return this.client.sendRequest(config, callback);
	}
	/**
	* Deletes a workflow.
	*
	* The workflow cannot be deleted if it is:
	*
	* - An active workflow.
	* - A system workflow.
	* - Associated with any workflow scheme.
	* - Associated with any draft workflow scheme.
	*
	* **[Permissions](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#permissions) required:**
	* _Administer Jira_ [global permission](https://confluence.atlassian.com/x/x4dKLg).
	*/
	async deleteInactiveWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/${typeof parameters === "string" ? parameters : parameters.entityId}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowProjectIssueTypeUsages(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/${parameters.workflowId}/project/${parameters.projectId}/issueTypeUsages`,
			method: "GET",
			params: {
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectUsagesForWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/${parameters.workflowId}/projectUsages`,
			method: "GET",
			params: {
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowSchemeUsagesForWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/${parameters.workflowId}/workflowSchemes`,
			method: "GET",
			params: {
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async readWorkflows(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows",
			method: "POST",
			params: {
				useTransitionLinksFormat: parameters?.useTransitionLinksFormat,
				useApprovalConfiguration: parameters?.useApprovalConfiguration
			},
			data: {
				projectAndIssueTypes: parameters?.projectAndIssueTypes,
				workflowIds: parameters?.workflowIds,
				workflowNames: parameters?.workflowNames
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async workflowCapabilities(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows/capabilities",
			method: "GET",
			params: {
				workflowId: parameters?.workflowId,
				projectId: parameters?.projectId,
				issueTypeId: parameters?.issueTypeId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createWorkflows(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows/create",
			method: "POST",
			data: {
				scope: parameters.scope,
				statuses: parameters.statuses,
				workflows: parameters.workflows
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async validateCreateWorkflows(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows/create/validation",
			method: "POST",
			data: {
				payload: parameters.payload,
				validationOptions: parameters.validationOptions
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getDefaultEditor(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/workflows/defaultEditor",
			method: "GET"
		}, callback);
	}
	async readWorkflowPreviews(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows/preview",
			method: "POST",
			data: {
				issueTypeIds: parameters.issueTypeIds,
				projectId: parameters.projectId,
				workflowIds: parameters.workflowIds,
				workflowNames: parameters.workflowNames
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async searchWorkflows(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows/search",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults,
				expand: parameters?.expand,
				queryString: parameters?.queryString,
				orderBy: parameters?.orderBy,
				scope: parameters?.scope,
				isActive: parameters?.isActive
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorkflows(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows/update",
			method: "POST",
			params: { expand: parameters.expand },
			data: {
				statuses: parameters.statuses,
				workflows: parameters.workflows
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async validateUpdateWorkflows(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflows/update/validation",
			method: "POST",
			data: {
				payload: parameters.payload,
				validationOptions: parameters.validationOptions
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflowSchemeDrafts.mjs
var WorkflowSchemeDrafts = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async createWorkflowSchemeDraftFromParent(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/createdraft`,
			method: "POST"
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowSchemeDraft(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/draft`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorkflowSchemeDraft(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft`,
			method: "PUT",
			data: {
				name: parameters.name,
				description: parameters.description,
				defaultWorkflow: parameters.defaultWorkflow,
				issueTypeMappings: parameters.issueTypeMappings,
				updateDraftIfNeeded: parameters.updateDraftIfNeeded
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorkflowSchemeDraft(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/draft`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getDraftDefaultWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/draft/default`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async updateDraftDefaultWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft/default`,
			method: "PUT",
			data: {
				updateDraftIfNeeded: parameters.updateDraftIfNeeded,
				workflow: parameters.workflow
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteDraftDefaultWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/draft/default`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowSchemeDraftIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft/issuetype/${parameters.issueType}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
	async setWorkflowSchemeDraftIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft/issuetype/${parameters.issueType}`,
			method: "PUT",
			data: parameters.details
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorkflowSchemeDraftIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft/issuetype/${parameters.issueType}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async publishDraftWorkflowScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/draft/publish`,
			method: "POST",
			params: { validateOnly: typeof parameters !== "string" && parameters.validateOnly },
			data: { statusMappings: typeof parameters !== "string" && parameters.statusMappings }
		};
		return this.client.sendRequest(config, callback);
	}
	async getDraftWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft/workflow`,
			method: "GET",
			params: { workflowName: parameters.workflowName }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateDraftWorkflowMapping(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft/workflow`,
			method: "PUT",
			params: { workflowName: parameters.workflowName },
			data: {
				defaultMapping: parameters.defaultMapping,
				issueTypes: parameters.issueTypes,
				updateDraftIfNeeded: parameters.updateDraftIfNeeded,
				workflow: parameters.workflow
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteDraftWorkflowMapping(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/draft/workflow`,
			method: "DELETE",
			params: { workflowName: parameters.workflowName }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflowSchemeProjectAssociations.mjs
var WorkflowSchemeProjectAssociations = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getWorkflowSchemeProjectAssociations(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme/project",
			method: "GET",
			params: { projectId: paramSerializer("projectId", parameters.projectId) }
		};
		return this.client.sendRequest(config, callback);
	}
	async assignSchemeToProject(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme/project",
			method: "PUT",
			data: {
				projectId: parameters.projectId,
				workflowSchemeId: parameters.workflowSchemeId
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflowSchemes.mjs
var WorkflowSchemes = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getAllWorkflowSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme",
			method: "GET",
			params: {
				startAt: parameters?.startAt,
				maxResults: parameters?.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createWorkflowScheme(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme",
			method: "POST",
			data: {
				defaultWorkflow: parameters.defaultWorkflow,
				description: parameters.description,
				draft: parameters.draft,
				id: parameters.id,
				issueTypeMappings: parameters.issueTypeMappings,
				issueTypes: parameters.issueTypes,
				lastModified: parameters.lastModified,
				lastModifiedUser: parameters.lastModifiedUser,
				name: parameters.name,
				originalDefaultWorkflow: parameters.originalDefaultWorkflow,
				originalIssueTypeMappings: parameters.originalIssueTypeMappings,
				self: parameters.self,
				updateDraftIfNeeded: parameters.updateDraftIfNeeded
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async switchWorkflowSchemeForProject(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme/project/switch",
			method: "POST",
			data: {
				mappingsByIssueTypeOverride: parameters.mappingsByIssueTypeOverride,
				projectId: parameters.projectId,
				targetSchemeId: parameters.targetSchemeId
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async readWorkflowSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme/read",
			method: "POST",
			data: {
				projectIds: parameters.projectIds,
				workflowSchemeIds: parameters.workflowSchemeIds
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateSchemes(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme/update",
			method: "POST",
			data: {
				defaultWorkflowId: parameters.defaultWorkflowId,
				description: parameters.description,
				id: parameters.id,
				name: parameters.name,
				statusMappingsByIssueTypeOverride: parameters.statusMappingsByIssueTypeOverride,
				statusMappingsByWorkflows: parameters.statusMappingsByWorkflows,
				version: parameters.version,
				workflowsForIssueTypes: parameters.workflowsForIssueTypes
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorkflowSchemeMappings(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflowscheme/update/mappings",
			method: "POST",
			data: {
				defaultWorkflowId: parameters.defaultWorkflowId,
				id: parameters.id,
				workflowsForIssueTypes: parameters.workflowsForIssueTypes
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "GET",
			params: { returnDraftIfExists: typeof parameters !== "string" && parameters.returnDraftIfExists }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorkflowScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}`,
			method: "PUT",
			data: {
				name: parameters.name,
				description: parameters.description,
				defaultWorkflow: parameters.defaultWorkflow,
				issueTypeMappings: parameters.issueTypeMappings,
				updateDraftIfNeeded: parameters.updateDraftIfNeeded
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorkflowScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}`,
			method: "DELETE"
		};
		return this.client.sendRequest(config, callback);
	}
	async getDefaultWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/default`,
			method: "GET",
			params: { returnDraftIfExists: typeof parameters !== "string" && parameters.returnDraftIfExists }
		};
		return this.client.sendRequest(config, callback);
	}
	async updateDefaultWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/default`,
			method: "PUT",
			data: {
				updateDraftIfNeeded: parameters.updateDraftIfNeeded,
				workflow: parameters.workflow
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteDefaultWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/default`,
			method: "DELETE",
			params: { updateDraftIfNeeded: typeof parameters !== "string" && parameters.updateDraftIfNeeded }
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflowSchemeIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/issuetype/${parameters.issueType}`,
			method: "GET",
			params: { returnDraftIfExists: parameters.returnDraftIfExists }
		};
		return this.client.sendRequest(config, callback);
	}
	async setWorkflowSchemeIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/issuetype/${parameters.issueType}`,
			method: "PUT",
			data: parameters.details
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorkflowSchemeIssueType(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/issuetype/${parameters.issueType}`,
			method: "DELETE",
			params: { updateDraftIfNeeded: parameters.updateDraftIfNeeded }
		};
		return this.client.sendRequest(config, callback);
	}
	async getWorkflow(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/workflow`,
			method: "GET",
			params: {
				workflowName: typeof parameters !== "string" && parameters.workflowName,
				returnDraftIfExists: typeof parameters !== "string" && parameters.returnDraftIfExists
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorkflowMapping(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.id}/workflow`,
			method: "PUT",
			params: { workflowName: parameters.workflowName },
			data: {
				defaultMapping: parameters.defaultMapping,
				issueTypes: parameters.issueTypes,
				updateDraftIfNeeded: parameters.updateDraftIfNeeded,
				workflow: parameters.workflow
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorkflowMapping(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${typeof parameters === "string" ? parameters : parameters.id}/workflow`,
			method: "DELETE",
			params: {
				workflowName: typeof parameters !== "string" && parameters.workflowName,
				updateDraftIfNeeded: typeof parameters !== "string" && parameters.updateDraftIfNeeded
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async getProjectUsagesForWorkflowScheme(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflowscheme/${parameters.workflowSchemeId}/projectUsages`,
			method: "GET",
			params: {
				nextPageToken: parameters.nextPageToken,
				maxResults: parameters.maxResults
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflowStatusCategories.mjs
var WorkflowStatusCategories = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getStatusCategories(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/statuscategory",
			method: "GET"
		}, callback);
	}
	async getStatusCategory(parameters, callback) {
		const config = {
			url: `/rest/api/3/statuscategory/${typeof parameters === "string" ? parameters : parameters.idOrKey}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflowStatuses.mjs
var WorkflowStatuses = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getStatuses(callback) {
		return this.client.sendRequest({
			url: "/rest/api/3/status",
			method: "GET"
		}, callback);
	}
	async getStatus(parameters, callback) {
		const config = {
			url: `/rest/api/3/status/${typeof parameters === "string" ? parameters : parameters.idOrName}`,
			method: "GET"
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflowTransitionProperties.mjs
var WorkflowTransitionProperties = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getWorkflowTransitionProperties(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/transitions/${parameters.transitionId}/properties`,
			method: "GET",
			params: {
				includeReservedKeys: parameters.includeReservedKeys,
				key: parameters.key,
				workflowName: parameters.workflowName,
				workflowMode: parameters.workflowMode
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async createWorkflowTransitionProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/transitions/${parameters.transitionId}/properties`,
			method: "POST",
			params: {
				key: parameters.key,
				workflowName: parameters.workflowName,
				workflowMode: parameters.workflowMode
			},
			data: {
				...parameters,
				transitionId: void 0,
				key: void 0,
				workflowName: void 0,
				workflowMode: void 0
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorkflowTransitionProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/transitions/${parameters.transitionId}/properties`,
			method: "PUT",
			params: {
				key: parameters.key,
				workflowName: parameters.workflowName,
				workflowMode: parameters.workflowMode
			},
			data: {
				...parameters,
				transitionId: void 0,
				key: void 0,
				workflowName: void 0,
				workflowMode: void 0
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorkflowTransitionProperty(parameters, callback) {
		const config = {
			url: `/rest/api/3/workflow/transitions/${parameters.transitionId}/properties`,
			method: "DELETE",
			params: {
				key: parameters.key,
				workflowName: parameters.workflowName,
				workflowMode: parameters.workflowMode
			}
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/workflowTransitionRules.mjs
var WorkflowTransitionRules = class {
	client;
	constructor(client) {
		this.client = client;
	}
	async getWorkflowTransitionRuleConfigurations(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflow/rule/config",
			method: "GET",
			params: {
				startAt: parameters.startAt,
				maxResults: parameters.maxResults,
				types: parameters.types,
				keys: parameters.keys,
				workflowNames: parameters.workflowNames,
				withTags: parameters.withTags,
				draft: parameters.draft,
				expand: parameters.expand
			}
		};
		return this.client.sendRequest(config, callback);
	}
	async updateWorkflowTransitionRuleConfigurations(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflow/rule/config",
			method: "PUT",
			data: { workflows: parameters.workflows }
		};
		return this.client.sendRequest(config, callback);
	}
	async deleteWorkflowTransitionRuleConfigurations(parameters, callback) {
		const config = {
			url: "/rest/api/3/workflow/rule/config/delete",
			method: "PUT",
			data: { workflows: parameters?.workflows }
		};
		return this.client.sendRequest(config, callback);
	}
};
//#endregion
//#region node_modules/jira.js/dist/esm/version3/client/version3Client.mjs
var Version3Client = class extends BaseClient {
	announcementBanner = new AnnouncementBanner(this);
	api = new Api(this);
	appDataPolicies = new AppDataPolicies(this);
	applicationRoles = new ApplicationRoles(this);
	appMigration = new AppMigration(this);
	appProperties = new AppProperties(this);
	auditRecords = new AuditRecords(this);
	avatars = new Avatars(this);
	classificationLevels = new ClassificationLevels(this);
	dashboards = new Dashboards(this);
	dynamicModules = new DynamicModules(this);
	fieldSchemes = new FieldSchemes(this);
	filters = new Filters(this);
	filterSharing = new FilterSharing(this);
	groupAndUserPicker = new GroupAndUserPicker(this);
	groups = new Groups(this);
	instanceInformation = new InstanceInformation(this);
	issueAttachments = new IssueAttachments(this);
	issueBulkOperations = new IssueBulkOperations(this);
	issueCommentProperties = new IssueCommentProperties(this);
	issueComments = new IssueComments(this);
	issueCustomFieldAssociations = new IssueCustomFieldAssociations(this);
	issueCustomFieldConfigurationApps = new IssueCustomFieldConfigurationApps(this);
	issueCustomFieldContexts = new IssueCustomFieldContexts(this);
	issueCustomFieldOptions = new IssueCustomFieldOptions(this);
	issueCustomFieldOptionsApps = new IssueCustomFieldOptionsApps(this);
	issueCustomFieldValuesApps = new IssueCustomFieldValuesApps(this);
	issueFieldConfigurations = new IssueFieldConfigurations(this);
	issueFields = new IssueFields(this);
	issueLinks = new IssueLinks(this);
	issueLinkTypes = new IssueLinkTypes(this);
	issueNavigatorSettings = new IssueNavigatorSettings(this);
	issueNotificationSchemes = new IssueNotificationSchemes(this);
	issuePriorities = new IssuePriorities(this);
	issueProperties = new IssueProperties(this);
	issueRedaction = new IssueRedaction(this);
	issueRemoteLinks = new IssueRemoteLinks(this);
	issueResolutions = new IssueResolutions(this);
	issues = new Issues(this);
	issueSearch = new IssueSearch(this);
	issueSecurityLevel = new IssueSecurityLevel(this);
	issueSecuritySchemes = new IssueSecuritySchemes(this);
	issueTypeProperties = new IssueTypeProperties(this);
	issueTypes = new IssueTypes(this);
	issueTypeSchemes = new IssueTypeSchemes(this);
	issueTypeScreenSchemes = new IssueTypeScreenSchemes(this);
	issueVotes = new IssueVotes(this);
	issueWatchers = new IssueWatchers(this);
	issueWorklogProperties = new IssueWorklogProperties(this);
	issueWorklogs = new IssueWorklogs(this);
	jiraExpressions = new JiraExpressions(this);
	jiraSettings = new JiraSettings(this);
	jql = new JQL(this);
	jqlFunctionsApps = new JqlFunctionsApps(this);
	labels = new Labels(this);
	licenseMetrics = new LicenseMetrics(this);
	migrationOfConnectModulesToForge = new MigrationOfConnectModulesToForge(this);
	myself = new Myself(this);
	permissions = new Permissions(this);
	permissionSchemes = new PermissionSchemes(this);
	plans = new Plans(this);
	prioritySchemes = new PrioritySchemes(this);
	projectAvatars = new ProjectAvatars(this);
	projectCategories = new ProjectCategories(this);
	projectClassificationLevels = new ProjectClassificationLevels(this);
	projectComponents = new ProjectComponents(this);
	projectEmail = new ProjectEmail(this);
	projectFeatures = new ProjectFeatures(this);
	projectKeyAndNameValidation = new ProjectKeyAndNameValidation(this);
	projectPermissionSchemes = new ProjectPermissionSchemes(this);
	projectProperties = new ProjectProperties(this);
	projectRoleActors = new ProjectRoleActors(this);
	projectRoles = new ProjectRoles(this);
	projects = new Projects(this);
	projectTemplates = new ProjectTemplates(this);
	projectTypes = new ProjectTypes(this);
	projectVersions = new ProjectVersions(this);
	screens = new Screens(this);
	screenSchemes = new ScreenSchemes(this);
	screenTabFields = new ScreenTabFields(this);
	screenTabs = new ScreenTabs(this);
	serverInfo = new ServerInfo(this);
	serviceRegistry = new ServiceRegistry(this);
	status = new Status(this);
	tasks = new Tasks(this);
	teamsInPlan = new TeamsInPlan(this);
	timeTracking = new TimeTracking(this);
	uiModificationsApps = new UIModificationsApps(this);
	userNavProperties = new UserNavProperties(this);
	userProperties = new UserProperties(this);
	users = new Users(this);
	userSearch = new UserSearch(this);
	webhooks = new Webhooks(this);
	workflows = new Workflows(this);
	workflowSchemeDrafts = new WorkflowSchemeDrafts(this);
	workflowSchemeProjectAssociations = new WorkflowSchemeProjectAssociations(this);
	workflowSchemes = new WorkflowSchemes(this);
	workflowStatusCategories = new WorkflowStatusCategories(this);
	workflowStatuses = new WorkflowStatuses(this);
	workflowTransitionProperties = new WorkflowTransitionProperties(this);
	workflowTransitionRules = new WorkflowTransitionRules(this);
};
//#endregion
export { Version3Client };

//# sourceMappingURL=esm.mjs.map