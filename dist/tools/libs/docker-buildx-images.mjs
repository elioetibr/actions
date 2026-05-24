import { i as __require, o as __toESM, t as __commonJSMin } from "./rolldown-runtime.mjs";
import { o as require_undici, s as require_tunnel } from "./agents.mjs";
import { a as Octokit, i as restEndpointMethods, l as CONTROL_CHAR_REGEX, o as ValidationUtils, p as RunnerBase, r as paginateRest, u as SIMPLE_SEMVER_REGEX } from "./deployment-gate.mjs";
import { EOL } from "os";
import { existsSync, readFileSync } from "fs";
//#region src/libs/formatters/CommandFormatter.ts
var CommandFormatter = class {
	dockerProvider;
	stringListProvider;
	constructor(dockerProvider, stringListProvider) {
		this.dockerProvider = dockerProvider;
		this.stringListProvider = stringListProvider;
	}
	toStringMultiLineCommand() {
		const lines = this.buildAllLines();
		return this.stringListProvider.useStringList ? lines.join(" ") : lines.join("\n");
	}
	buildAllLines() {
		return [
			this.buildExecutorLine(),
			...this.buildSubCommandLines(),
			this.buildMainCommandLine(),
			...this.buildMetaDataLines()
		];
	}
	buildExecutorLine() {
		return this.stringListProvider.useStringList ? this.dockerProvider.executor : `${this.dockerProvider.executor}\\`;
	}
	buildSubCommandLines() {
		return this.dockerProvider.subCommands.map((subCommand) => this.stringListProvider.useStringList ? subCommand : `  ${subCommand}\\`);
	}
	buildMainCommandLine() {
		return this.stringListProvider.useStringList ? this.dockerProvider.command : `  ${this.dockerProvider.command}\\`;
	}
	buildMetaDataLines() {
		const lines = [];
		for (const [key, values] of this.dockerProvider.metaData) if (key === "") lines.push(...this.buildUnkeyedMetaData(values));
		else lines.push(...this.buildKeyedMetaData(key, values));
		return lines;
	}
	buildUnkeyedMetaData(values) {
		return this.stringListProvider.useStringList ? values : values.map((value) => `  ${value}\\`);
	}
	buildKeyedMetaData(key, values) {
		if (this.stringListProvider.useStringList) return [`${key}=${values.join(",")}`];
		return values.map((value) => `  ${key} ${value}\\`);
	}
};
//#endregion
//#region src/libs/services/version/SemanticVersion.ts
/**
* Enhanced semantic version service with configurable validation
*/
var SemanticVersionService = class {
	versionProvider;
	config;
	cachedSemVerInfo;
	constructor(versionProvider, config = {}) {
		this.versionProvider = versionProvider;
		this.config = config;
		this.parseSemVer();
	}
	get semVerInfo() {
		if (!this.cachedSemVerInfo) this.cachedSemVerInfo = this.parseSemVer();
		return this.cachedSemVerInfo;
	}
	get version() {
		return this.semVerInfo.version;
	}
	get semVer() {
		return this.semVerInfo.semVer;
	}
	get major() {
		return this.semVerInfo.major;
	}
	get majorMinor() {
		return this.semVerInfo.majorMinor;
	}
	get majorMinorPatch() {
		return this.semVerInfo.majorMinorPatch;
	}
	get minor() {
		return this.semVerInfo.minor;
	}
	get patch() {
		return this.semVerInfo.patch;
	}
	get semVerSuffix() {
		return this.semVerInfo.semVerSuffix;
	}
	/**
	* Parse a semantic version string into its components with configurable validation
	*/
	parseSemVer() {
		const versionString = this.versionProvider.version;
		if (versionString === null || versionString === void 0 || versionString === "") throw new Error("Semantic version string cannot be empty");
		const stringInput = String(versionString);
		if (!this.config.allowControlCharacters && /[\x00-\x1f\x7f-\x9f]/.test(stringInput)) throw new Error("Given Semantic Version is not valid");
		const trimmedInput = stringInput.trim();
		if (trimmedInput.length === 0) throw new Error("Semantic version string cannot be empty");
		const maxLength = this.config.maxLength || 256;
		if (trimmedInput.length > maxLength) throw new Error("Given Semantic Version is not valid");
		for (const pattern of [
			/\0/,
			/[\r\n]/,
			/<script/i,
			/\.\./,
			/['";]/,
			/\${/,
			/^\d+$/,
			/^[a-zA-Z]+$/,
			/[^\w.\-+]/
		]) if (pattern.test(trimmedInput)) throw new Error("Given Semantic Version is not valid");
		const cleanInput = trimmedInput.replace(/^v/, "");
		const match = (this.config.customRegex || SIMPLE_SEMVER_REGEX).exec(cleanInput);
		if (!match) throw new Error("Given Semantic Version is not valid");
		const majorStr = match[1] || "";
		const minorStr = match[2] || "";
		const patchStr = match[3] || "";
		const suffix = match[4] || "";
		if (!majorStr || !minorStr || !patchStr) throw new Error("Given Semantic Version is not valid");
		if (!/^\d+$/.test(majorStr) || !/^\d+$/.test(minorStr) || !/^\d+$/.test(patchStr)) throw new Error("Given Semantic Version is not valid");
		const major = parseInt(majorStr, 10);
		const minor = parseInt(minorStr, 10);
		const patch = parseInt(patchStr, 10);
		if (isNaN(major) || isNaN(minor) || isNaN(patch)) throw new Error("Given Semantic Version is not valid");
		const maxVersionNumber = this.config.maxVersionNumber || 999999;
		if (major < 0 || major > maxVersionNumber || minor < 0 || minor > maxVersionNumber || patch < 0 || patch > maxVersionNumber) throw new Error("Given Semantic Version is not valid");
		const version = `${major}.${minor}.${patch}`;
		const majorMinor = `${major}.${minor}`;
		return new SemanticVersionInfo(`${version}${suffix}`, major.toString(), minor.toString(), patch.toString(), version, majorMinor, version, suffix);
	}
};
//#endregion
//#region src/libs/services/version/builders/SemanticVersionBuilder.ts
/**
* Enhanced semantic version info with fluent comparison and manipulation methods
*/
var SemanticVersionInfo = class SemanticVersionInfo {
	semVer;
	major;
	minor;
	patch;
	version;
	majorMinor;
	majorMinorPatch;
	semVerSuffix;
	constructor(semVer, major, minor, patch, version, majorMinor, majorMinorPatch, semVerSuffix) {
		this.semVer = semVer;
		this.major = major;
		this.minor = minor;
		this.patch = patch;
		this.version = version;
		this.majorMinor = majorMinor;
		this.majorMinorPatch = majorMinorPatch;
		this.semVerSuffix = semVerSuffix;
	}
	/**
	* Resolves a version string or provider into an IEnhancedSemanticVersionProvider
	*/
	static resolveVersion(other) {
		return typeof other === "string" ? SemanticVersionBuilder.fromVersion(other).build().semVerInfo : other;
	}
	isGreaterThan(other) {
		const otherInfo = SemanticVersionInfo.resolveVersion(other);
		const [thisMajor, thisMinor, thisPatch] = [
			+this.major,
			+this.minor,
			+this.patch
		];
		const [otherMajor, otherMinor, otherPatch] = [
			+otherInfo.major,
			+otherInfo.minor,
			+otherInfo.patch
		];
		if (thisMajor !== otherMajor) return thisMajor > otherMajor;
		if (thisMinor !== otherMinor) return thisMinor > otherMinor;
		return thisPatch > otherPatch;
	}
	isLessThan(other) {
		return SemanticVersionInfo.resolveVersion(other).isGreaterThan(this);
	}
	isEqualTo(other) {
		const otherInfo = SemanticVersionInfo.resolveVersion(other);
		return this.version === otherInfo.version;
	}
	isCompatibleWith(other) {
		const otherInfo = SemanticVersionInfo.resolveVersion(other);
		return this.major === otherInfo.major;
	}
	incrementMajor() {
		const newMajor = (+this.major + 1).toString();
		return SemanticVersionBuilder.fromVersion(`${newMajor}.0.0${this.semVerSuffix}`).build().semVerInfo;
	}
	incrementMinor() {
		const newMinor = (+this.minor + 1).toString();
		return SemanticVersionBuilder.fromVersion(`${this.major}.${newMinor}.0${this.semVerSuffix}`).build().semVerInfo;
	}
	incrementPatch() {
		const newPatch = (+this.patch + 1).toString();
		return SemanticVersionBuilder.fromVersion(`${this.major}.${this.minor}.${newPatch}${this.semVerSuffix}`).build().semVerInfo;
	}
	withSuffix(suffix) {
		const normalizedSuffix = suffix.startsWith("-") || suffix.startsWith("+") ? suffix : `-${suffix}`;
		return SemanticVersionBuilder.fromVersion(`${this.version}${normalizedSuffix}`).build().semVerInfo;
	}
	withoutSuffix() {
		return SemanticVersionBuilder.fromVersion(this.version).build().semVerInfo;
	}
	isPrerelease() {
		return this.semVerSuffix.includes("-") && !this.semVerSuffix.startsWith("+");
	}
	hasBuildMetadata() {
		return this.semVerSuffix.includes("+");
	}
	toString() {
		return this.semVer;
	}
	toJSON() {
		return {
			semVer: this.semVer,
			major: this.major,
			minor: this.minor,
			patch: this.patch,
			version: this.version,
			majorMinor: this.majorMinor,
			majorMinorPatch: this.majorMinorPatch,
			semVerSuffix: this.semVerSuffix
		};
	}
};
/**
* Fluent services for creating semantic version services
*/
var SemanticVersionBuilder = class SemanticVersionBuilder {
	versionProvider;
	config = {
		maxLength: 256,
		allowControlCharacters: false,
		maxVersionNumber: 999999,
		customRegex: SIMPLE_SEMVER_REGEX
	};
	constructor() {}
	/**
	* Static factory method to start building
	*/
	static create() {
		return new SemanticVersionBuilder();
	}
	/**
	* Static convenience method for quick creation with version string
	*/
	static fromVersion(version) {
		return new SemanticVersionBuilder().withVersion(version);
	}
	/**
	* Static convenience method for creation with provider
	*/
	static fromProvider(provider) {
		return new SemanticVersionBuilder().withVersionProvider(provider);
	}
	/**
	* Set the version provider
	*/
	withVersionProvider(provider) {
		this.versionProvider = provider;
		return this;
	}
	/**
	* Set the version string directly
	*/
	withVersion(version) {
		this.versionProvider = { version };
		return this;
	}
	/**
	* Configure maximum allowed length for version strings
	*/
	withMaxLength(maxLength) {
		this.config.maxLength = maxLength;
		return this;
	}
	/**
	* Configure whether to allow control characters
	*/
	withControlCharacters(allow) {
		this.config.allowControlCharacters = allow;
		return this;
	}
	/**
	* Configure maximum version number for major/minor/patch
	*/
	withMaxVersionNumber(max) {
		this.config.maxVersionNumber = max;
		return this;
	}
	/**
	* Use a custom regex for version validation
	*/
	withCustomRegex(regex) {
		this.config.customRegex = regex;
		return this;
	}
	/**
	* Apply a configuration object
	*/
	withConfig(config) {
		this.config = {
			...this.config,
			...config
		};
		return this;
	}
	/**
	* Build the semantic version service
	*/
	build() {
		if (!this.versionProvider) throw new Error("Version provider is required. Use withVersionProvider() or withVersion()");
		if (this.versionProvider.version === "") throw new Error("Semantic version string cannot be empty");
		if (!this.config.allowControlCharacters && this.versionProvider.version) {
			if (CONTROL_CHAR_REGEX.test(this.versionProvider.version)) throw new Error("Given Semantic Version is not valid");
		}
		return new SemanticVersionService(this.versionProvider, this.config);
	}
};
(class SemanticVersionFactory {
	static {
		new SemanticVersionFactory();
	}
	constructor() {}
	static createDevelopment(version) {
		return SemanticVersionBuilder.fromVersion(version).withMaxLength(500).withControlCharacters(true).build();
	}
	static createProduction(version) {
		return SemanticVersionBuilder.fromVersion(version).withMaxLength(256).withControlCharacters(false).withMaxVersionNumber(999999).build();
	}
	static createStrict(version) {
		return SemanticVersionBuilder.fromVersion(version).withCustomRegex(/^(\d+)\.(\d+)\.(\d+)$/).withMaxVersionNumber(999).build();
	}
});
//#endregion
//#region node_modules/@actions/github/lib/context.js
var Context = class {
	/**
	* Hydrate the context from the environment
	*/
	constructor() {
		var _a, _b, _c;
		this.payload = {};
		if (process.env.GITHUB_EVENT_PATH) if (existsSync(process.env.GITHUB_EVENT_PATH)) this.payload = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }));
		else {
			const path = process.env.GITHUB_EVENT_PATH;
			process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL}`);
		}
		this.eventName = process.env.GITHUB_EVENT_NAME;
		this.sha = process.env.GITHUB_SHA;
		this.ref = process.env.GITHUB_REF;
		this.workflow = process.env.GITHUB_WORKFLOW;
		this.action = process.env.GITHUB_ACTION;
		this.actor = process.env.GITHUB_ACTOR;
		this.job = process.env.GITHUB_JOB;
		this.runAttempt = parseInt(process.env.GITHUB_RUN_ATTEMPT, 10);
		this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
		this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
		this.apiUrl = (_a = process.env.GITHUB_API_URL) !== null && _a !== void 0 ? _a : `https://api.github.com`;
		this.serverUrl = (_b = process.env.GITHUB_SERVER_URL) !== null && _b !== void 0 ? _b : `https://github.com`;
		this.graphqlUrl = (_c = process.env.GITHUB_GRAPHQL_URL) !== null && _c !== void 0 ? _c : `https://api.github.com/graphql`;
	}
	get issue() {
		const payload = this.payload;
		return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
	}
	get repo() {
		if (process.env.GITHUB_REPOSITORY) {
			const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
			return {
				owner,
				repo
			};
		}
		if (this.payload.repository) return {
			owner: this.payload.repository.owner.login,
			repo: this.payload.repository.name
		};
		throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
	}
};
//#endregion
//#region node_modules/@actions/github/node_modules/@actions/http-client/lib/proxy.js
var require_proxy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getProxyUrl = getProxyUrl;
	exports.checkBypass = checkBypass;
	function getProxyUrl(reqUrl) {
		const usingSsl = reqUrl.protocol === "https:";
		if (checkBypass(reqUrl)) return;
		const proxyVar = (() => {
			if (usingSsl) return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
			else return process.env["http_proxy"] || process.env["HTTP_PROXY"];
		})();
		if (proxyVar) try {
			return new DecodedURL(proxyVar);
		} catch (_a) {
			if (!proxyVar.startsWith("http://") && !proxyVar.startsWith("https://")) return new DecodedURL(`http://${proxyVar}`);
		}
		else return;
	}
	function checkBypass(reqUrl) {
		if (!reqUrl.hostname) return false;
		const reqHost = reqUrl.hostname;
		if (isLoopbackAddress(reqHost)) return true;
		const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
		if (!noProxy) return false;
		let reqPort;
		if (reqUrl.port) reqPort = Number(reqUrl.port);
		else if (reqUrl.protocol === "http:") reqPort = 80;
		else if (reqUrl.protocol === "https:") reqPort = 443;
		const upperReqHosts = [reqUrl.hostname.toUpperCase()];
		if (typeof reqPort === "number") upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
		for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) if (upperNoProxyItem === "*" || upperReqHosts.some((x) => x === upperNoProxyItem || x.endsWith(`.${upperNoProxyItem}`) || upperNoProxyItem.startsWith(".") && x.endsWith(`${upperNoProxyItem}`))) return true;
		return false;
	}
	function isLoopbackAddress(host) {
		const hostLower = host.toLowerCase();
		return hostLower === "localhost" || hostLower.startsWith("127.") || hostLower.startsWith("[::1]") || hostLower.startsWith("[0:0:0:0:0:0:0:1]");
	}
	var DecodedURL = class extends URL {
		constructor(url, base) {
			super(url, base);
			this._decodedUsername = decodeURIComponent(super.username);
			this._decodedPassword = decodeURIComponent(super.password);
		}
		get username() {
			return this._decodedUsername;
		}
		get password() {
			return this._decodedPassword;
		}
	};
}));
//#endregion
//#region node_modules/@actions/github/lib/internal/utils.js
var import_lib = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o) {
				var ar = [];
				for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HttpClient = exports.HttpClientResponse = exports.HttpClientError = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
	exports.getProxyUrl = getProxyUrl;
	exports.isHttps = isHttps;
	var http = __importStar(__require("http"));
	var https = __importStar(__require("https"));
	var pm = __importStar(require_proxy());
	var tunnel = __importStar(require_tunnel());
	var undici_1 = require_undici();
	var HttpCodes;
	(function(HttpCodes) {
		HttpCodes[HttpCodes["OK"] = 200] = "OK";
		HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
		HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
		HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
		HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
		HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
		HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
		HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
		HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
		HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
		HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
		HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
		HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
		HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
		HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
		HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
		HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
		HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
		HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
		HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
		HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
		HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
		HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
		HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
		HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
		HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
		HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
	})(HttpCodes || (exports.HttpCodes = HttpCodes = {}));
	var Headers;
	(function(Headers) {
		Headers["Accept"] = "accept";
		Headers["ContentType"] = "content-type";
	})(Headers || (exports.Headers = Headers = {}));
	var MediaTypes;
	(function(MediaTypes) {
		MediaTypes["ApplicationJson"] = "application/json";
	})(MediaTypes || (exports.MediaTypes = MediaTypes = {}));
	/**
	* Returns the proxy URL, depending upon the supplied url and proxy environment variables.
	* @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
	*/
	function getProxyUrl(serverUrl) {
		const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
		return proxyUrl ? proxyUrl.href : "";
	}
	var HttpRedirectCodes = [
		HttpCodes.MovedPermanently,
		HttpCodes.ResourceMoved,
		HttpCodes.SeeOther,
		HttpCodes.TemporaryRedirect,
		HttpCodes.PermanentRedirect
	];
	var HttpResponseRetryCodes = [
		HttpCodes.BadGateway,
		HttpCodes.ServiceUnavailable,
		HttpCodes.GatewayTimeout
	];
	var RetryableHttpVerbs = [
		"OPTIONS",
		"GET",
		"DELETE",
		"HEAD"
	];
	var ExponentialBackoffCeiling = 10;
	var ExponentialBackoffTimeSlice = 5;
	var HttpClientError = class HttpClientError extends Error {
		constructor(message, statusCode) {
			super(message);
			this.name = "HttpClientError";
			this.statusCode = statusCode;
			Object.setPrototypeOf(this, HttpClientError.prototype);
		}
	};
	exports.HttpClientError = HttpClientError;
	var HttpClientResponse = class {
		constructor(message) {
			this.message = message;
		}
		readBody() {
			return __awaiter(this, void 0, void 0, function* () {
				return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
					let output = Buffer.alloc(0);
					this.message.on("data", (chunk) => {
						output = Buffer.concat([output, chunk]);
					});
					this.message.on("end", () => {
						resolve(output.toString());
					});
				}));
			});
		}
		readBodyBuffer() {
			return __awaiter(this, void 0, void 0, function* () {
				return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
					const chunks = [];
					this.message.on("data", (chunk) => {
						chunks.push(chunk);
					});
					this.message.on("end", () => {
						resolve(Buffer.concat(chunks));
					});
				}));
			});
		}
	};
	exports.HttpClientResponse = HttpClientResponse;
	function isHttps(requestUrl) {
		return new URL(requestUrl).protocol === "https:";
	}
	var HttpClient = class {
		constructor(userAgent, handlers, requestOptions) {
			this._ignoreSslError = false;
			this._allowRedirects = true;
			this._allowRedirectDowngrade = false;
			this._maxRedirects = 50;
			this._allowRetries = false;
			this._maxRetries = 1;
			this._keepAlive = false;
			this._disposed = false;
			this.userAgent = this._getUserAgentWithOrchestrationId(userAgent);
			this.handlers = handlers || [];
			this.requestOptions = requestOptions;
			if (requestOptions) {
				if (requestOptions.ignoreSslError != null) this._ignoreSslError = requestOptions.ignoreSslError;
				this._socketTimeout = requestOptions.socketTimeout;
				if (requestOptions.allowRedirects != null) this._allowRedirects = requestOptions.allowRedirects;
				if (requestOptions.allowRedirectDowngrade != null) this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
				if (requestOptions.maxRedirects != null) this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
				if (requestOptions.keepAlive != null) this._keepAlive = requestOptions.keepAlive;
				if (requestOptions.allowRetries != null) this._allowRetries = requestOptions.allowRetries;
				if (requestOptions.maxRetries != null) this._maxRetries = requestOptions.maxRetries;
			}
		}
		options(requestUrl, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
			});
		}
		get(requestUrl, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request("GET", requestUrl, null, additionalHeaders || {});
			});
		}
		del(requestUrl, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request("DELETE", requestUrl, null, additionalHeaders || {});
			});
		}
		post(requestUrl, data, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request("POST", requestUrl, data, additionalHeaders || {});
			});
		}
		patch(requestUrl, data, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request("PATCH", requestUrl, data, additionalHeaders || {});
			});
		}
		put(requestUrl, data, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request("PUT", requestUrl, data, additionalHeaders || {});
			});
		}
		head(requestUrl, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request("HEAD", requestUrl, null, additionalHeaders || {});
			});
		}
		sendStream(verb, requestUrl, stream, additionalHeaders) {
			return __awaiter(this, void 0, void 0, function* () {
				return this.request(verb, requestUrl, stream, additionalHeaders);
			});
		}
		/**
		* Gets a typed object from an endpoint
		* Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
		*/
		getJson(requestUrl_1) {
			return __awaiter(this, arguments, void 0, function* (requestUrl, additionalHeaders = {}) {
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				const res = yield this.get(requestUrl, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		postJson(requestUrl_1, obj_1) {
			return __awaiter(this, arguments, void 0, function* (requestUrl, obj, additionalHeaders = {}) {
				const data = JSON.stringify(obj, null, 2);
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultContentTypeHeader(additionalHeaders, MediaTypes.ApplicationJson);
				const res = yield this.post(requestUrl, data, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		putJson(requestUrl_1, obj_1) {
			return __awaiter(this, arguments, void 0, function* (requestUrl, obj, additionalHeaders = {}) {
				const data = JSON.stringify(obj, null, 2);
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultContentTypeHeader(additionalHeaders, MediaTypes.ApplicationJson);
				const res = yield this.put(requestUrl, data, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		patchJson(requestUrl_1, obj_1) {
			return __awaiter(this, arguments, void 0, function* (requestUrl, obj, additionalHeaders = {}) {
				const data = JSON.stringify(obj, null, 2);
				additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
				additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultContentTypeHeader(additionalHeaders, MediaTypes.ApplicationJson);
				const res = yield this.patch(requestUrl, data, additionalHeaders);
				return this._processResponse(res, this.requestOptions);
			});
		}
		/**
		* Makes a raw http request.
		* All other methods such as get, post, patch, and request ultimately call this.
		* Prefer get, del, post and patch
		*/
		request(verb, requestUrl, data, headers) {
			return __awaiter(this, void 0, void 0, function* () {
				if (this._disposed) throw new Error("Client has already been disposed.");
				const parsedUrl = new URL(requestUrl);
				let info = this._prepareRequest(verb, parsedUrl, headers);
				const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
				let numTries = 0;
				let response;
				do {
					response = yield this.requestRaw(info, data);
					if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
						let authenticationHandler;
						for (const handler of this.handlers) if (handler.canHandleAuthentication(response)) {
							authenticationHandler = handler;
							break;
						}
						if (authenticationHandler) return authenticationHandler.handleAuthentication(this, info, data);
						else return response;
					}
					let redirectsRemaining = this._maxRedirects;
					while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
						const redirectUrl = response.message.headers["location"];
						if (!redirectUrl) break;
						const parsedRedirectUrl = new URL(redirectUrl);
						if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
						yield response.readBody();
						if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
							for (const header in headers) if (header.toLowerCase() === "authorization") delete headers[header];
						}
						info = this._prepareRequest(verb, parsedRedirectUrl, headers);
						response = yield this.requestRaw(info, data);
						redirectsRemaining--;
					}
					if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) return response;
					numTries += 1;
					if (numTries < maxTries) {
						yield response.readBody();
						yield this._performExponentialBackoff(numTries);
					}
				} while (numTries < maxTries);
				return response;
			});
		}
		/**
		* Needs to be called if keepAlive is set to true in request options.
		*/
		dispose() {
			if (this._agent) this._agent.destroy();
			this._disposed = true;
		}
		/**
		* Raw request.
		* @param info
		* @param data
		*/
		requestRaw(info, data) {
			return __awaiter(this, void 0, void 0, function* () {
				return new Promise((resolve, reject) => {
					function callbackForResult(err, res) {
						if (err) reject(err);
						else if (!res) reject(/* @__PURE__ */ new Error("Unknown error"));
						else resolve(res);
					}
					this.requestRawWithCallback(info, data, callbackForResult);
				});
			});
		}
		/**
		* Raw request with callback.
		* @param info
		* @param data
		* @param onResult
		*/
		requestRawWithCallback(info, data, onResult) {
			if (typeof data === "string") {
				if (!info.options.headers) info.options.headers = {};
				info.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
			}
			let callbackCalled = false;
			function handleResult(err, res) {
				if (!callbackCalled) {
					callbackCalled = true;
					onResult(err, res);
				}
			}
			const req = info.httpModule.request(info.options, (msg) => {
				handleResult(void 0, new HttpClientResponse(msg));
			});
			let socket;
			req.on("socket", (sock) => {
				socket = sock;
			});
			req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
				if (socket) socket.end();
				handleResult(/* @__PURE__ */ new Error(`Request timeout: ${info.options.path}`));
			});
			req.on("error", function(err) {
				handleResult(err);
			});
			if (data && typeof data === "string") req.write(data, "utf8");
			if (data && typeof data !== "string") {
				data.on("close", function() {
					req.end();
				});
				data.pipe(req);
			} else req.end();
		}
		/**
		* Gets an http agent. This function is useful when you need an http agent that handles
		* routing through a proxy server - depending upon the url and proxy environment variables.
		* @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
		*/
		getAgent(serverUrl) {
			const parsedUrl = new URL(serverUrl);
			return this._getAgent(parsedUrl);
		}
		getAgentDispatcher(serverUrl) {
			const parsedUrl = new URL(serverUrl);
			const proxyUrl = pm.getProxyUrl(parsedUrl);
			if (!(proxyUrl && proxyUrl.hostname)) return;
			return this._getProxyAgentDispatcher(parsedUrl, proxyUrl);
		}
		_prepareRequest(method, requestUrl, headers) {
			const info = {};
			info.parsedUrl = requestUrl;
			const usingSsl = info.parsedUrl.protocol === "https:";
			info.httpModule = usingSsl ? https : http;
			const defaultPort = usingSsl ? 443 : 80;
			info.options = {};
			info.options.host = info.parsedUrl.hostname;
			info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
			info.options.path = (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
			info.options.method = method;
			info.options.headers = this._mergeHeaders(headers);
			if (this.userAgent != null) info.options.headers["user-agent"] = this.userAgent;
			info.options.agent = this._getAgent(info.parsedUrl);
			if (this.handlers) for (const handler of this.handlers) handler.prepareRequest(info.options);
			return info;
		}
		_mergeHeaders(headers) {
			if (this.requestOptions && this.requestOptions.headers) return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
			return lowercaseKeys(headers || {});
		}
		/**
		* Gets an existing header value or returns a default.
		* Handles converting number header values to strings since HTTP headers must be strings.
		* Note: This returns string | string[] since some headers can have multiple values.
		* For headers that must always be a single string (like Content-Type), use the
		* specialized _getExistingOrDefaultContentTypeHeader method instead.
		*/
		_getExistingOrDefaultHeader(additionalHeaders, header, _default) {
			let clientHeader;
			if (this.requestOptions && this.requestOptions.headers) {
				const headerValue = lowercaseKeys(this.requestOptions.headers)[header];
				if (headerValue) clientHeader = typeof headerValue === "number" ? headerValue.toString() : headerValue;
			}
			const additionalValue = additionalHeaders[header];
			if (additionalValue !== void 0) return typeof additionalValue === "number" ? additionalValue.toString() : additionalValue;
			if (clientHeader !== void 0) return clientHeader;
			return _default;
		}
		/**
		* Specialized version of _getExistingOrDefaultHeader for Content-Type header.
		* Always returns a single string (not an array) since Content-Type should be a single value.
		* Converts arrays to comma-separated strings and numbers to strings to ensure type safety.
		* This was split from _getExistingOrDefaultHeader to provide stricter typing for callers
		* that assign the result to places expecting a string (e.g., additionalHeaders[Headers.ContentType]).
		*/
		_getExistingOrDefaultContentTypeHeader(additionalHeaders, _default) {
			let clientHeader;
			if (this.requestOptions && this.requestOptions.headers) {
				const headerValue = lowercaseKeys(this.requestOptions.headers)[Headers.ContentType];
				if (headerValue) if (typeof headerValue === "number") clientHeader = String(headerValue);
				else if (Array.isArray(headerValue)) clientHeader = headerValue.join(", ");
				else clientHeader = headerValue;
			}
			const additionalValue = additionalHeaders[Headers.ContentType];
			if (additionalValue !== void 0) if (typeof additionalValue === "number") return String(additionalValue);
			else if (Array.isArray(additionalValue)) return additionalValue.join(", ");
			else return additionalValue;
			if (clientHeader !== void 0) return clientHeader;
			return _default;
		}
		_getAgent(parsedUrl) {
			let agent;
			const proxyUrl = pm.getProxyUrl(parsedUrl);
			const useProxy = proxyUrl && proxyUrl.hostname;
			if (this._keepAlive && useProxy) agent = this._proxyAgent;
			if (!useProxy) agent = this._agent;
			if (agent) return agent;
			const usingSsl = parsedUrl.protocol === "https:";
			let maxSockets = 100;
			if (this.requestOptions) maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
			if (proxyUrl && proxyUrl.hostname) {
				const agentOptions = {
					maxSockets,
					keepAlive: this._keepAlive,
					proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && { proxyAuth: `${proxyUrl.username}:${proxyUrl.password}` }), {
						host: proxyUrl.hostname,
						port: proxyUrl.port
					})
				};
				let tunnelAgent;
				const overHttps = proxyUrl.protocol === "https:";
				if (usingSsl) tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
				else tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
				agent = tunnelAgent(agentOptions);
				this._proxyAgent = agent;
			}
			if (!agent) {
				const options = {
					keepAlive: this._keepAlive,
					maxSockets
				};
				agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
				this._agent = agent;
			}
			if (usingSsl && this._ignoreSslError) agent.options = Object.assign(agent.options || {}, { rejectUnauthorized: false });
			return agent;
		}
		_getProxyAgentDispatcher(parsedUrl, proxyUrl) {
			let proxyAgent;
			if (this._keepAlive) proxyAgent = this._proxyAgentDispatcher;
			if (proxyAgent) return proxyAgent;
			const usingSsl = parsedUrl.protocol === "https:";
			proxyAgent = new undici_1.ProxyAgent(Object.assign({
				uri: proxyUrl.href,
				pipelining: !this._keepAlive ? 0 : 1
			}, (proxyUrl.username || proxyUrl.password) && { token: `Basic ${Buffer.from(`${proxyUrl.username}:${proxyUrl.password}`).toString("base64")}` }));
			this._proxyAgentDispatcher = proxyAgent;
			if (usingSsl && this._ignoreSslError) proxyAgent.options = Object.assign(proxyAgent.options.requestTls || {}, { rejectUnauthorized: false });
			return proxyAgent;
		}
		_getUserAgentWithOrchestrationId(userAgent) {
			const baseUserAgent = userAgent || "actions/http-client";
			const orchId = process.env["ACTIONS_ORCHESTRATION_ID"];
			if (orchId) return `${baseUserAgent} actions_orchestration_id/${orchId.replace(/[^a-z0-9_.-]/gi, "_")}`;
			return baseUserAgent;
		}
		_performExponentialBackoff(retryNumber) {
			return __awaiter(this, void 0, void 0, function* () {
				retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
				const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
				return new Promise((resolve) => setTimeout(() => resolve(), ms));
			});
		}
		_processResponse(res, options) {
			return __awaiter(this, void 0, void 0, function* () {
				return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
					const statusCode = res.message.statusCode || 0;
					const response = {
						statusCode,
						result: null,
						headers: {}
					};
					if (statusCode === HttpCodes.NotFound) resolve(response);
					function dateTimeDeserializer(key, value) {
						if (typeof value === "string") {
							const a = new Date(value);
							if (!isNaN(a.valueOf())) return a;
						}
						return value;
					}
					let obj;
					let contents;
					try {
						contents = yield res.readBody();
						if (contents && contents.length > 0) {
							if (options && options.deserializeDates) obj = JSON.parse(contents, dateTimeDeserializer);
							else obj = JSON.parse(contents);
							response.result = obj;
						}
						response.headers = res.message.headers;
					} catch (err) {}
					if (statusCode > 299) {
						let msg;
						if (obj && obj.message) msg = obj.message;
						else if (contents && contents.length > 0) msg = contents;
						else msg = `Failed request: (${statusCode})`;
						const err = new HttpClientError(msg, statusCode);
						err.result = response.result;
						reject(err);
					} else resolve(response);
				}));
			});
		}
	};
	exports.HttpClient = HttpClient;
	var lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
})))(), 1);
var import_undici = require_undici();
var __awaiter = function(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};
function getProxyAgent(destinationUrl) {
	return new import_lib.HttpClient().getAgent(destinationUrl);
}
function getProxyAgentDispatcher(destinationUrl) {
	return new import_lib.HttpClient().getAgentDispatcher(destinationUrl);
}
function getProxyFetch(destinationUrl) {
	const httpDispatcher = getProxyAgentDispatcher(destinationUrl);
	const proxyFetch = (url, opts) => __awaiter(this, void 0, void 0, function* () {
		return (0, import_undici.fetch)(url, Object.assign(Object.assign({}, opts), { dispatcher: httpDispatcher }));
	});
	return proxyFetch;
}
function getApiBaseUrl() {
	return process.env["GITHUB_API_URL"] || "https://api.github.com";
}
new Context();
var baseUrl = getApiBaseUrl();
var defaults = {
	baseUrl,
	request: {
		agent: getProxyAgent(baseUrl),
		fetch: getProxyFetch(baseUrl)
	}
};
Octokit.plugin(restEndpointMethods, paginateRest).defaults(defaults);
new Context();
//#endregion
//#region src/actions/docker/buildx/images/services/MetaDataManager.ts
/**
* Manages metadata operations for Docker BuildX Image Tools
* Following Single Responsibility Principle
*/
var MetaDataManager = class {
	metaData = /* @__PURE__ */ new Map();
	constructor() {}
	/**
	* Add a single key-value pair to metadata
	* @param key - The metadata key (defaults to empty string)
	* @param value - The metadata value
	* @returns this instance for method chaining
	* @throws Error if key or value is invalid
	*/
	addMetaData(key = "", value) {
		ValidationUtils.validateMetaDataInput(key, value);
		const existingValues = this.metaData.get(key) || [];
		existingValues.push(value);
		this.metaData.set(key, existingValues);
		return this;
	}
	/**
	* Set metadata for a key, replacing any existing values
	* @param key - The metadata key
	* @param values - The metadata values (can be single value or array)
	* @returns this instance for method chaining
	*/
	setMetaData(key, values) {
		const valueArray = Array.isArray(values) ? values : [values];
		valueArray.forEach((value) => ValidationUtils.validateMetaDataInput(key, value));
		this.metaData.set(key, valueArray);
		return this;
	}
	/**
	* Get all values for a metadata key
	* @param key - The metadata key
	* @returns Array of values for the key, or empty array if key doesn't exist
	*/
	getMetaData(key) {
		return this.metaData.get(key) || [];
	}
	/**
	* Get the first value for a metadata key
	* @param key - The metadata key
	* @returns First value for the key, or undefined if key doesn't exist
	*/
	getFirstMetaData(key) {
		const values = this.metaData.get(key);
		return values && values.length > 0 ? values[0] : void 0;
	}
	/**
	* Remove all values for a metadata key
	* @param key - The metadata key
	* @returns this instance for method chaining
	*/
	removeMetaData(key) {
		this.metaData.delete(key);
		return this;
	}
	/**
	* Clear all metadata
	* @returns this instance for method chaining
	*/
	clearMetaData() {
		this.metaData.clear();
		return this;
	}
	/**
	* Get all metadata entries
	* @returns Map of all metadata
	*/
	getAllMetaData() {
		return new Map(this.metaData);
	}
	/**
	* Get metadata size
	* @returns Number of metadata entries
	*/
	getSize() {
		return this.metaData.size;
	}
	/**
	* Get metadata entries iterator
	* @returns Iterator for [key, values] pairs
	*/
	entries() {
		return this.metaData.entries();
	}
};
//#endregion
//#region src/actions/docker/buildx/images/services/CommandBuilder.ts
/**
* Builds Docker commands from metadata
* Following Single Responsibility Principle
*/
var CommandBuilder = class {
	executor;
	subCommands;
	command;
	metaDataManager;
	constructor(executor, subCommands, command, metaDataManager) {
		this.executor = executor;
		this.subCommands = subCommands;
		this.command = command;
		this.metaDataManager = metaDataManager;
	}
	/**
	* Convert metadata to command-line arguments
	* @returns Array of command-line arguments
	*/
	toCommandArgs() {
		const args = [];
		for (const [key, values] of this.metaDataManager.entries()) if (key === "") args.push(...values);
		else for (const value of values) args.push(key, value);
		return args;
	}
	/**
	* Build the complete command array
	* @returns Complete command array including executor, subcommands, and arguments
	*/
	buildCommand() {
		return [
			this.executor,
			...this.subCommands,
			this.command,
			...this.toCommandArgs()
		];
	}
};
//#endregion
//#region src/actions/docker/buildx/images/services/StringFormatter.ts
/**
* Handles string formatting for Docker BuildX Image Tools
* Following Single Responsibility Principle
*/
var StringFormatter = class {
	className;
	command;
	executor;
	subCommands;
	useStringList;
	metaDataManager;
	constructor(className, command, executor, subCommands, useStringList, metaDataManager) {
		this.className = className;
		this.command = command;
		this.executor = executor;
		this.subCommands = subCommands;
		this.useStringList = useStringList;
		this.metaDataManager = metaDataManager;
	}
	/**
	* Convert the instance to a readable string representation
	* @returns Formatted string representation of the instance
	*/
	toString() {
		const metaDataStr = this.formatMetaData();
		return `${this.className} {
  command: ${this.escapeString(this.command)}
  executor: ${this.escapeString(this.executor)}
  subCommands: [${this.formatStringArray(this.subCommands)}]
  useStringList: ${this.useStringList}
  metaData: ${metaDataStr}
}`;
	}
	/**
	* Format metadata for string representation
	* @private
	*/
	formatMetaData() {
		if (this.metaDataManager.getSize() === 0) return "Map(0) {}";
		const entries = Array.from(this.metaDataManager.entries()).map(([key, values]) => {
			const displayKey = key === "" ? "(empty)" : key;
			const valueStr = values.length === 1 ? this.escapeString(values[0] ?? "") : `[${this.formatStringArray(values)}]`;
			return `    ${this.escapeString(displayKey)} => ${valueStr}`;
		}).join("\n");
		return `Map(${this.metaDataManager.getSize()}) {\n${entries}\n  }`;
	}
	/**
	* Escape and format a string for display
	* @param str - String to escape
	* @returns Escaped string with quotes
	*/
	escapeString(str) {
		return `"${str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
	}
	/**
	* Format an array of strings for display
	* @param arr - Array of strings to format
	* @returns Comma-separated formatted string
	*/
	formatStringArray(arr) {
		return arr.map((item) => this.escapeString(item)).join(", ");
	}
};
//#endregion
//#region src/actions/docker/buildx/images/services/DockerBuildXImageToolsService.ts
var DockerBuildXImageToolsService = class {
	command;
	executor = "docker";
	subCommands = ["buildx", "imagetools"];
	_useStringList = false;
	metaDataManager;
	commandBuilder;
	stringFormatter;
	constructor(command, useStringList = false) {
		this.command = command;
		this._useStringList = useStringList;
		this.metaDataManager = new MetaDataManager();
		this.commandBuilder = new CommandBuilder(this.executor, this.subCommands, this.command, this.metaDataManager);
		this.stringFormatter = new StringFormatter(this.constructor.name, this.command, this.executor, this.subCommands, this._useStringList, this.metaDataManager);
	}
	get useStringList() {
		return this._useStringList;
	}
	get metaData() {
		return this.metaDataManager.getAllMetaData();
	}
	/**
	* Add a single key-value pair to metadata
	* @param key - The metadata key (defaults to empty string)
	* @param value - The metadata value
	* @returns this instance for method chaining
	* @throws Error if key or value is invalid
	*/
	addMetaData(key = "", value) {
		this.metaDataManager.addMetaData(key, value);
		return this;
	}
	/**
	* Set metadata for a key, replacing any existing values
	* @param key - The metadata key
	* @param values - The metadata values (can be single value or array)
	* @returns this instance for method chaining
	*/
	setMetaData(key, values) {
		this.metaDataManager.setMetaData(key, values);
		return this;
	}
	/**
	* Get all values for a metadata key
	* @param key - The metadata key
	* @returns Array of values for the key, or empty array if key doesn't exist
	*/
	getMetaData(key) {
		return this.metaDataManager.getMetaData(key);
	}
	/**
	* Get the first value for a metadata key
	* @param key - The metadata key
	* @returns First value for the key, or undefined if key doesn't exist
	*/
	getFirstMetaData(key) {
		return this.metaDataManager.getFirstMetaData(key);
	}
	/**
	* Remove all values for a metadata key
	* @param key - The metadata key
	* @returns this instance for method chaining
	*/
	removeMetaData(key) {
		this.metaDataManager.removeMetaData(key);
		return this;
	}
	/**
	* Clear all metadata
	* @returns this instance for method chaining
	*/
	clearMetaData() {
		this.metaDataManager.clearMetaData();
		return this;
	}
	/**
	* Convert metadata to command-line arguments
	* @returns Array of command-line arguments
	*/
	toCommandArgs() {
		return this.commandBuilder.toCommandArgs();
	}
	/**
	* Build the complete command array
	* @returns Complete command array including executor, subcommands, and arguments
	*/
	buildCommand() {
		return this.commandBuilder.buildCommand();
	}
	/**
	* Convert the instance to a readable string representation
	* @returns Formatted string representation of the instance
	*/
	toString() {
		return this.stringFormatter.toString();
	}
	/**
	* Generate command string with backslash line continuation
	* @returns Docker command formatted with backslashes
	*/
	toStringMultiLineCommand() {
		return new CommandFormatter(this, this).toStringMultiLineCommand();
	}
};
//#endregion
//#region src/actions/docker/buildx/images/DockerBuildXImageToolsBuilder.ts
var DockerBuildXImageToolsBuilder = class DockerBuildXImageToolsBuilder {
	command = "";
	useStringList = false;
	metadata = /* @__PURE__ */ new Map();
	constructor() {}
	/**
	* Create a new services instance
	* @param command - Optional initial command
	* @returns New services instance
	*/
	static create(command) {
		const builder = new DockerBuildXImageToolsBuilder();
		if (command) builder.withCommand(command);
		return builder;
	}
	/**
	* Create a services pre-configured for the 'create' command
	* @returns Builder instance configured for create operations
	*/
	static forCreate() {
		return this.create("create");
	}
	/**
	* Create a services pre-configured for the 'inspect' command
	* @returns Builder instance configured for inspect operations
	*/
	static forInspect() {
		return this.create("inspect");
	}
	/**
	* Create a services pre-configured for the 'prune' command
	* @returns Builder instance configured for prune operations
	*/
	static forPrune() {
		return this.create("prune");
	}
	withCommand(command) {
		ValidationUtils.validateCommand(command);
		this.command = command.trim();
		return this;
	}
	withStringListOutput(useStringList) {
		this.useStringList = useStringList;
		return this;
	}
	addMetaData(key = "", value) {
		ValidationUtils.validateMetaDataInput(key, value);
		const existingValues = this.metadata.get(key) || [];
		existingValues.push(value);
		this.metadata.set(key, existingValues);
		return this;
	}
	setMetaData(key, values) {
		const valueArray = Array.isArray(values) ? values : [values];
		valueArray.forEach((value) => ValidationUtils.validateMetaDataInput(key, value));
		this.metadata.set(key, [...valueArray]);
		return this;
	}
	withMetaData(metadata) {
		for (const [key, values] of Object.entries(metadata)) this.setMetaData(key, values);
		return this;
	}
	withTag(tag) {
		return this.addMetaData("--tag", tag);
	}
	withTags(tags) {
		tags.forEach((tag) => this.withTag(tag));
		return this;
	}
	withFile(file) {
		return this.addMetaData("--file", file);
	}
	withOutput(output) {
		return this.addMetaData("--output", output);
	}
	withPlatform(platform) {
		return this.addMetaData("--platform", platform);
	}
	withPlatforms(platforms) {
		platforms.forEach((platform) => this.withPlatform(platform));
		return this;
	}
	withAnnotation(key, value) {
		return this.addMetaData("--annotation", `${key}=${value}`);
	}
	withAnnotations(annotations) {
		for (const [key, value] of Object.entries(annotations)) this.withAnnotation(key, value);
		return this;
	}
	withSource(source) {
		return this.addMetaData("", source);
	}
	withSources(sources) {
		sources.forEach((source) => this.withSource(source));
		return this;
	}
	withDryRun() {
		return this.addMetaData("--dry-run", "");
	}
	withVerbose() {
		return this.addMetaData("--verbose", "");
	}
	reset() {
		this.command = "";
		this.useStringList = false;
		this.metadata.clear();
		return this;
	}
	build() {
		if (!this.command) throw new Error("Command is required. Use withCommand() to set it.");
		const instance = new DockerBuildXImageToolsService(this.command, this.useStringList);
		for (const [key, values] of this.metadata.entries()) instance.setMetaData(key, values);
		return instance;
	}
};
//#endregion
//#region src/tools/docker/imagetools/settings.ts
/**
* Parse comma or newline separated string to array
*/
function parseMultiValue(value) {
	return value.split(/[,\n]/).map((v) => v.trim()).filter((v) => v.length > 0);
}
/**
* Parse annotations string to key-value pairs
* Format: key1=value1,key2=value2 or key1=value1\nkey2=value2
*/
function parseAnnotations(value) {
	const annotations = {};
	const entries = parseMultiValue(value);
	for (const entry of entries) {
		const [key, ...valueParts] = entry.split("=");
		if (key && valueParts.length > 0) annotations[key.trim()] = valueParts.join("=").trim();
	}
	return annotations;
}
/**
* Get settings from agent inputs
*/
function getSettings(agent) {
	return {
		ecrRegistry: agent.getInput("ecrRegistry", true),
		ecrRepository: agent.getInput("ecrRepository", true),
		amd64MetaTags: parseMultiValue(agent.getInput("amd64MetaTags", true)),
		arm64MetaTags: parseMultiValue(agent.getInput("arm64MetaTags", true)),
		manifestMetaTags: parseMultiValue(agent.getInput("manifestMetaTags", true)),
		manifestMetaAnnotations: parseAnnotations(agent.getInput("manifestMetaAnnotations", true)),
		semVer: agent.getInput("semVer", true),
		dryRun: agent.getBooleanInput("dryRun", false)
	};
}
/**
* Build full image URI
*/
function buildImageUri(ecrRegistry, ecrRepository, tag) {
	const baseUri = `${ecrRegistry}/${ecrRepository}`;
	return tag ? `${baseUri}:${tag}` : baseUri;
}
/**
* Build architecture-specific tags
*/
function buildArchTags(ecrRegistry, ecrRepository, tags) {
	return tags.map((tag) => buildImageUri(ecrRegistry, ecrRepository, tag));
}
//#endregion
//#region src/tools/docker/imagetools/runner.ts
/**
* Docker BuildX ImageTools runner
* Handles setup, command generation, and execution for creating multi-arch manifests
*/
var DockerImageToolsRunner = class extends RunnerBase {
	name = "docker/imagetools";
	steps = new Map([
		["setup", this.setup.bind(this)],
		["command", this.command.bind(this)],
		["execute", this.execute.bind(this)]
	]);
	/**
	* Setup step: Validate inputs and parse metadata
	* Outputs: validated, amd64Tags, arm64Tags, manifestTags, annotations, semVer components, imageUri
	*/
	async setup(agent) {
		try {
			const settings = getSettings(agent);
			const versionInfo = this.parseVersion(settings.semVer);
			const imageUri = buildImageUri(settings.ecrRegistry, settings.ecrRepository);
			const amd64Tags = buildArchTags(settings.ecrRegistry, settings.ecrRepository, settings.amd64MetaTags);
			const arm64Tags = buildArchTags(settings.ecrRegistry, settings.ecrRepository, settings.arm64MetaTags);
			const manifestTags = buildArchTags(settings.ecrRegistry, settings.ecrRepository, settings.manifestMetaTags);
			const annotationsStr = Object.entries(settings.manifestMetaAnnotations).map(([key, value]) => `${key}=${value}`).join(",");
			return this.success({
				validated: true,
				ecrRegistry: settings.ecrRegistry,
				ecrRepository: settings.ecrRepository,
				amd64Tags: amd64Tags.join(","),
				arm64Tags: arm64Tags.join(","),
				manifestTags: manifestTags.join(","),
				annotations: annotationsStr,
				imageUri,
				dryRun: settings.dryRun,
				fullVersion: versionInfo.semVer,
				version: versionInfo.version,
				major: versionInfo.major,
				minor: versionInfo.minor,
				patch: versionInfo.patch,
				versionSuffix: versionInfo.semVerSuffix
			});
		} catch (error) {
			return this.failure(error instanceof Error ? error : new Error(String(error)));
		}
	}
	/**
	* Command step: Build the docker buildx imagetools command without executing
	* Outputs: command, commandArray, multilineCommand, buildXArgs
	*/
	async command(agent) {
		try {
			const settings = getSettings(agent);
			const service = this.buildService(settings);
			const commandArray = service.buildCommand();
			const command = commandArray.join(" ");
			const multilineCommand = service.toStringMultiLineCommand();
			const buildXArgs = service.toCommandArgs().join(" ");
			return this.success({
				command,
				commandArray: JSON.stringify(commandArray),
				multilineCommand,
				buildXArgs
			});
		} catch (error) {
			return this.failure(error instanceof Error ? error : new Error(String(error)));
		}
	}
	/**
	* Execute step: Build and run the docker command
	* Outputs: exitCode, stdout, imageUri, command
	*/
	async execute(agent) {
		try {
			const settings = getSettings(agent);
			const service = this.buildService(settings);
			const commandArray = service.buildCommand();
			const [executable, ...args] = commandArray;
			if (!executable) return this.failure("No executable found in command array");
			agent.startGroup("Docker BuildX ImageTools Command");
			agent.info(service.toStringMultiLineCommand());
			agent.endGroup();
			agent.info("Executing docker buildx imagetools create...");
			const result = await agent.exec(executable, args, { ignoreReturnCode: true });
			const imageUri = buildImageUri(settings.ecrRegistry, settings.ecrRepository, settings.manifestMetaTags[0]);
			if (result.exitCode !== 0) {
				agent.error(`Command failed with exit code ${result.exitCode}`);
				if (result.stderr) agent.error(result.stderr);
				return this.failure(/* @__PURE__ */ new Error(`Docker buildx imagetools failed with exit code ${result.exitCode}`), {
					exitCode: result.exitCode,
					stdout: result.stdout,
					stderr: result.stderr,
					imageUri,
					command: commandArray.join(" ")
				});
			}
			agent.info("Docker buildx imagetools create completed successfully");
			return this.success({
				exitCode: result.exitCode,
				stdout: result.stdout,
				imageUri,
				command: commandArray.join(" ")
			});
		} catch (error) {
			return this.failure(error instanceof Error ? error : new Error(String(error)));
		}
	}
	/**
	* Parse version string into components
	*/
	parseVersion(semVer) {
		const service = SemanticVersionBuilder.fromVersion(semVer).build();
		return {
			semVer: service.semVer,
			major: service.major,
			minor: service.minor,
			patch: service.patch,
			version: service.version,
			majorMinor: service.semVerInfo.majorMinor,
			majorMinorPatch: service.semVerInfo.majorMinorPatch,
			semVerSuffix: service.semVerSuffix
		};
	}
	/**
	* Build the Docker BuildX ImageTools service
	*/
	buildService(settings) {
		const builder = DockerBuildXImageToolsBuilder.forCreate().withStringListOutput(true);
		const amd64Tags = buildArchTags(settings.ecrRegistry, settings.ecrRepository, settings.amd64MetaTags);
		const arm64Tags = buildArchTags(settings.ecrRegistry, settings.ecrRepository, settings.arm64MetaTags);
		builder.withSources([...amd64Tags, ...arm64Tags]);
		const manifestTags = buildArchTags(settings.ecrRegistry, settings.ecrRepository, settings.manifestMetaTags);
		builder.withTags(manifestTags);
		builder.withAnnotations(settings.manifestMetaAnnotations);
		if (settings.dryRun) builder.withDryRun();
		return builder.build();
	}
};
/**
* Factory function to create a Docker ImageTools runner
*/
function createDockerImageToolsRunner() {
	return new DockerImageToolsRunner();
}
//#endregion
export { createDockerImageToolsRunner as t };

//# sourceMappingURL=docker-buildx-images.mjs.map