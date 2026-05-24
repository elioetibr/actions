import { i as __require, o as __toESM, t as __commonJSMin } from "./rolldown-runtime.mjs";
import { o as require_undici, s as require_tunnel } from "./agents.mjs";
import { a as ValidationUtils, c as CONTROL_CHAR_REGEX, f as RunnerBase, i as Octokit, l as SIMPLE_SEMVER_REGEX, r as paginateRest } from "./deployment-gate.mjs";
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
//#endregion
//#region node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/version.js
var VERSION = "17.0.0";
//#endregion
//#region node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/generated/endpoints.js
var endpoints_default = {
	actions: {
		addCustomLabelsToSelfHostedRunnerForOrg: ["POST /orgs/{org}/actions/runners/{runner_id}/labels"],
		addCustomLabelsToSelfHostedRunnerForRepo: ["POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		addRepoAccessToSelfHostedRunnerGroupInOrg: ["PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}"],
		addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
		addSelectedRepoToOrgVariable: ["PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"],
		approveWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"],
		cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
		createEnvironmentVariable: ["POST /repos/{owner}/{repo}/environments/{environment_name}/variables"],
		createHostedRunnerForOrg: ["POST /orgs/{org}/actions/hosted-runners"],
		createOrUpdateEnvironmentSecret: ["PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],
		createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
		createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
		createOrgVariable: ["POST /orgs/{org}/actions/variables"],
		createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
		createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
		createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
		createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
		createRepoVariable: ["POST /repos/{owner}/{repo}/actions/variables"],
		createWorkflowDispatch: ["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],
		deleteActionsCacheById: ["DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}"],
		deleteActionsCacheByKey: ["DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}"],
		deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
		deleteCustomImageFromOrg: ["DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}"],
		deleteCustomImageVersionFromOrg: ["DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}"],
		deleteEnvironmentSecret: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],
		deleteEnvironmentVariable: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],
		deleteHostedRunnerForOrg: ["DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
		deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
		deleteOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}"],
		deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
		deleteRepoVariable: ["DELETE /repos/{owner}/{repo}/actions/variables/{name}"],
		deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
		deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
		deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
		deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
		disableSelectedRepositoryGithubActionsOrganization: ["DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"],
		disableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"],
		downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
		downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
		downloadWorkflowRunAttemptLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs"],
		downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
		enableSelectedRepositoryGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"],
		enableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"],
		forceCancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel"],
		generateRunnerJitconfigForOrg: ["POST /orgs/{org}/actions/runners/generate-jitconfig"],
		generateRunnerJitconfigForRepo: ["POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig"],
		getActionsCacheList: ["GET /repos/{owner}/{repo}/actions/caches"],
		getActionsCacheUsage: ["GET /repos/{owner}/{repo}/actions/cache/usage"],
		getActionsCacheUsageByRepoForOrg: ["GET /orgs/{org}/actions/cache/usage-by-repository"],
		getActionsCacheUsageForOrg: ["GET /orgs/{org}/actions/cache/usage"],
		getAllowedActionsOrganization: ["GET /orgs/{org}/actions/permissions/selected-actions"],
		getAllowedActionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions/selected-actions"],
		getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
		getCustomImageForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}"],
		getCustomImageVersionForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}"],
		getCustomOidcSubClaimForRepo: ["GET /repos/{owner}/{repo}/actions/oidc/customization/sub"],
		getEnvironmentPublicKey: ["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key"],
		getEnvironmentSecret: ["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],
		getEnvironmentVariable: ["GET /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],
		getGithubActionsDefaultWorkflowPermissionsOrganization: ["GET /orgs/{org}/actions/permissions/workflow"],
		getGithubActionsDefaultWorkflowPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions/workflow"],
		getGithubActionsPermissionsOrganization: ["GET /orgs/{org}/actions/permissions"],
		getGithubActionsPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions"],
		getHostedRunnerForOrg: ["GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
		getHostedRunnersGithubOwnedImagesForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/github-owned"],
		getHostedRunnersLimitsForOrg: ["GET /orgs/{org}/actions/hosted-runners/limits"],
		getHostedRunnersMachineSpecsForOrg: ["GET /orgs/{org}/actions/hosted-runners/machine-sizes"],
		getHostedRunnersPartnerImagesForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/partner"],
		getHostedRunnersPlatformsForOrg: ["GET /orgs/{org}/actions/hosted-runners/platforms"],
		getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
		getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
		getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
		getOrgVariable: ["GET /orgs/{org}/actions/variables/{name}"],
		getPendingDeploymentsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
		getRepoPermissions: [
			"GET /repos/{owner}/{repo}/actions/permissions",
			{},
			{ renamed: ["actions", "getGithubActionsPermissionsRepository"] }
		],
		getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
		getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
		getRepoVariable: ["GET /repos/{owner}/{repo}/actions/variables/{name}"],
		getReviewsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"],
		getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
		getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
		getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
		getWorkflowAccessToRepository: ["GET /repos/{owner}/{repo}/actions/permissions/access"],
		getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
		getWorkflowRunAttempt: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}"],
		getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
		getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
		listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
		listCustomImageVersionsForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions"],
		listCustomImagesForOrg: ["GET /orgs/{org}/actions/hosted-runners/images/custom"],
		listEnvironmentSecrets: ["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets"],
		listEnvironmentVariables: ["GET /repos/{owner}/{repo}/environments/{environment_name}/variables"],
		listGithubHostedRunnersInGroupForOrg: ["GET /orgs/{org}/actions/runner-groups/{runner_group_id}/hosted-runners"],
		listHostedRunnersForOrg: ["GET /orgs/{org}/actions/hosted-runners"],
		listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
		listJobsForWorkflowRunAttempt: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs"],
		listLabelsForSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}/labels"],
		listLabelsForSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
		listOrgVariables: ["GET /orgs/{org}/actions/variables"],
		listRepoOrganizationSecrets: ["GET /repos/{owner}/{repo}/actions/organization-secrets"],
		listRepoOrganizationVariables: ["GET /repos/{owner}/{repo}/actions/organization-variables"],
		listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
		listRepoVariables: ["GET /repos/{owner}/{repo}/actions/variables"],
		listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
		listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
		listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
		listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
		listSelectedReposForOrgVariable: ["GET /orgs/{org}/actions/variables/{name}/repositories"],
		listSelectedRepositoriesEnabledGithubActionsOrganization: ["GET /orgs/{org}/actions/permissions/repositories"],
		listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
		listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
		listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
		listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
		listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
		reRunJobForWorkflowRun: ["POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun"],
		reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
		reRunWorkflowFailedJobs: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs"],
		removeAllCustomLabelsFromSelfHostedRunnerForOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}/labels"],
		removeAllCustomLabelsFromSelfHostedRunnerForRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		removeCustomLabelFromSelfHostedRunnerForOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}"],
		removeCustomLabelFromSelfHostedRunnerForRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}"],
		removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
		removeSelectedRepoFromOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"],
		reviewCustomGatesForRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule"],
		reviewPendingDeploymentsForRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
		setAllowedActionsOrganization: ["PUT /orgs/{org}/actions/permissions/selected-actions"],
		setAllowedActionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"],
		setCustomLabelsForSelfHostedRunnerForOrg: ["PUT /orgs/{org}/actions/runners/{runner_id}/labels"],
		setCustomLabelsForSelfHostedRunnerForRepo: ["PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],
		setCustomOidcSubClaimForRepo: ["PUT /repos/{owner}/{repo}/actions/oidc/customization/sub"],
		setGithubActionsDefaultWorkflowPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions/workflow"],
		setGithubActionsDefaultWorkflowPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/workflow"],
		setGithubActionsPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions"],
		setGithubActionsPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions"],
		setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"],
		setSelectedReposForOrgVariable: ["PUT /orgs/{org}/actions/variables/{name}/repositories"],
		setSelectedRepositoriesEnabledGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories"],
		setWorkflowAccessToRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/access"],
		updateEnvironmentVariable: ["PATCH /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],
		updateHostedRunnerForOrg: ["PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"],
		updateOrgVariable: ["PATCH /orgs/{org}/actions/variables/{name}"],
		updateRepoVariable: ["PATCH /repos/{owner}/{repo}/actions/variables/{name}"]
	},
	activity: {
		checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
		deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
		deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
		getFeeds: ["GET /feeds"],
		getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
		getThread: ["GET /notifications/threads/{thread_id}"],
		getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
		listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
		listNotificationsForAuthenticatedUser: ["GET /notifications"],
		listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
		listPublicEvents: ["GET /events"],
		listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
		listPublicEventsForUser: ["GET /users/{username}/events/public"],
		listPublicOrgEvents: ["GET /orgs/{org}/events"],
		listReceivedEventsForUser: ["GET /users/{username}/received_events"],
		listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
		listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
		listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
		listReposStarredByAuthenticatedUser: ["GET /user/starred"],
		listReposStarredByUser: ["GET /users/{username}/starred"],
		listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
		listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
		listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
		listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
		markNotificationsAsRead: ["PUT /notifications"],
		markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
		markThreadAsDone: ["DELETE /notifications/threads/{thread_id}"],
		markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
		setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
		setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
		starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
		unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
	},
	apps: {
		addRepoToInstallation: [
			"PUT /user/installations/{installation_id}/repositories/{repository_id}",
			{},
			{ renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"] }
		],
		addRepoToInstallationForAuthenticatedUser: ["PUT /user/installations/{installation_id}/repositories/{repository_id}"],
		checkToken: ["POST /applications/{client_id}/token"],
		createFromManifest: ["POST /app-manifests/{code}/conversions"],
		createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
		deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
		deleteInstallation: ["DELETE /app/installations/{installation_id}"],
		deleteToken: ["DELETE /applications/{client_id}/token"],
		getAuthenticated: ["GET /app"],
		getBySlug: ["GET /apps/{app_slug}"],
		getInstallation: ["GET /app/installations/{installation_id}"],
		getOrgInstallation: ["GET /orgs/{org}/installation"],
		getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
		getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
		getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
		getUserInstallation: ["GET /users/{username}/installation"],
		getWebhookConfigForApp: ["GET /app/hook/config"],
		getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
		listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
		listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
		listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories"],
		listInstallationRequestsForAuthenticatedApp: ["GET /app/installation-requests"],
		listInstallations: ["GET /app/installations"],
		listInstallationsForAuthenticatedUser: ["GET /user/installations"],
		listPlans: ["GET /marketplace_listing/plans"],
		listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
		listReposAccessibleToInstallation: ["GET /installation/repositories"],
		listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
		listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
		listWebhookDeliveries: ["GET /app/hook/deliveries"],
		redeliverWebhookDelivery: ["POST /app/hook/deliveries/{delivery_id}/attempts"],
		removeRepoFromInstallation: [
			"DELETE /user/installations/{installation_id}/repositories/{repository_id}",
			{},
			{ renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"] }
		],
		removeRepoFromInstallationForAuthenticatedUser: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],
		resetToken: ["PATCH /applications/{client_id}/token"],
		revokeInstallationAccessToken: ["DELETE /installation/token"],
		scopeToken: ["POST /applications/{client_id}/token/scoped"],
		suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
		unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"],
		updateWebhookConfigForApp: ["PATCH /app/hook/config"]
	},
	billing: {
		getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
		getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
		getGithubBillingPremiumRequestUsageReportOrg: ["GET /organizations/{org}/settings/billing/premium_request/usage"],
		getGithubBillingPremiumRequestUsageReportUser: ["GET /users/{username}/settings/billing/premium_request/usage"],
		getGithubBillingUsageReportOrg: ["GET /organizations/{org}/settings/billing/usage"],
		getGithubBillingUsageReportUser: ["GET /users/{username}/settings/billing/usage"],
		getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
		getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
		getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
		getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"]
	},
	campaigns: {
		createCampaign: ["POST /orgs/{org}/campaigns"],
		deleteCampaign: ["DELETE /orgs/{org}/campaigns/{campaign_number}"],
		getCampaignSummary: ["GET /orgs/{org}/campaigns/{campaign_number}"],
		listOrgCampaigns: ["GET /orgs/{org}/campaigns"],
		updateCampaign: ["PATCH /orgs/{org}/campaigns/{campaign_number}"]
	},
	checks: {
		create: ["POST /repos/{owner}/{repo}/check-runs"],
		createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
		get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
		getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
		listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"],
		listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
		listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"],
		listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
		rerequestRun: ["POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"],
		rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"],
		setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences"],
		update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
	},
	codeScanning: {
		commitAutofix: ["POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix/commits"],
		createAutofix: ["POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],
		createVariantAnalysis: ["POST /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses"],
		deleteAnalysis: ["DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"],
		deleteCodeqlDatabase: ["DELETE /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"],
		getAlert: [
			"GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
			{},
			{ renamedParameters: { alert_id: "alert_number" } }
		],
		getAnalysis: ["GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"],
		getAutofix: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],
		getCodeqlDatabase: ["GET /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"],
		getDefaultSetup: ["GET /repos/{owner}/{repo}/code-scanning/default-setup"],
		getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
		getVariantAnalysis: ["GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}"],
		getVariantAnalysisRepoTask: ["GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}/repos/{repo_owner}/{repo_name}"],
		listAlertInstances: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"],
		listAlertsForOrg: ["GET /orgs/{org}/code-scanning/alerts"],
		listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
		listAlertsInstances: [
			"GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
			{},
			{ renamed: ["codeScanning", "listAlertInstances"] }
		],
		listCodeqlDatabases: ["GET /repos/{owner}/{repo}/code-scanning/codeql/databases"],
		listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
		updateAlert: ["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],
		updateDefaultSetup: ["PATCH /repos/{owner}/{repo}/code-scanning/default-setup"],
		uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
	},
	codeSecurity: {
		attachConfiguration: ["POST /orgs/{org}/code-security/configurations/{configuration_id}/attach"],
		attachEnterpriseConfiguration: ["POST /enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach"],
		createConfiguration: ["POST /orgs/{org}/code-security/configurations"],
		createConfigurationForEnterprise: ["POST /enterprises/{enterprise}/code-security/configurations"],
		deleteConfiguration: ["DELETE /orgs/{org}/code-security/configurations/{configuration_id}"],
		deleteConfigurationForEnterprise: ["DELETE /enterprises/{enterprise}/code-security/configurations/{configuration_id}"],
		detachConfiguration: ["DELETE /orgs/{org}/code-security/configurations/detach"],
		getConfiguration: ["GET /orgs/{org}/code-security/configurations/{configuration_id}"],
		getConfigurationForRepository: ["GET /repos/{owner}/{repo}/code-security-configuration"],
		getConfigurationsForEnterprise: ["GET /enterprises/{enterprise}/code-security/configurations"],
		getConfigurationsForOrg: ["GET /orgs/{org}/code-security/configurations"],
		getDefaultConfigurations: ["GET /orgs/{org}/code-security/configurations/defaults"],
		getDefaultConfigurationsForEnterprise: ["GET /enterprises/{enterprise}/code-security/configurations/defaults"],
		getRepositoriesForConfiguration: ["GET /orgs/{org}/code-security/configurations/{configuration_id}/repositories"],
		getRepositoriesForEnterpriseConfiguration: ["GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}/repositories"],
		getSingleConfigurationForEnterprise: ["GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}"],
		setConfigurationAsDefault: ["PUT /orgs/{org}/code-security/configurations/{configuration_id}/defaults"],
		setConfigurationAsDefaultForEnterprise: ["PUT /enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults"],
		updateConfiguration: ["PATCH /orgs/{org}/code-security/configurations/{configuration_id}"],
		updateEnterpriseConfiguration: ["PATCH /enterprises/{enterprise}/code-security/configurations/{configuration_id}"]
	},
	codesOfConduct: {
		getAllCodesOfConduct: ["GET /codes_of_conduct"],
		getConductCode: ["GET /codes_of_conduct/{key}"]
	},
	codespaces: {
		addRepositoryForSecretForAuthenticatedUser: ["PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		checkPermissionsForDevcontainer: ["GET /repos/{owner}/{repo}/codespaces/permissions_check"],
		codespaceMachinesForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}/machines"],
		createForAuthenticatedUser: ["POST /user/codespaces"],
		createOrUpdateOrgSecret: ["PUT /orgs/{org}/codespaces/secrets/{secret_name}"],
		createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
		createOrUpdateSecretForAuthenticatedUser: ["PUT /user/codespaces/secrets/{secret_name}"],
		createWithPrForAuthenticatedUser: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces"],
		createWithRepoForAuthenticatedUser: ["POST /repos/{owner}/{repo}/codespaces"],
		deleteForAuthenticatedUser: ["DELETE /user/codespaces/{codespace_name}"],
		deleteFromOrganization: ["DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}"],
		deleteOrgSecret: ["DELETE /orgs/{org}/codespaces/secrets/{secret_name}"],
		deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
		deleteSecretForAuthenticatedUser: ["DELETE /user/codespaces/secrets/{secret_name}"],
		exportForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/exports"],
		getCodespacesForUserInOrg: ["GET /orgs/{org}/members/{username}/codespaces"],
		getExportDetailsForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}/exports/{export_id}"],
		getForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}"],
		getOrgPublicKey: ["GET /orgs/{org}/codespaces/secrets/public-key"],
		getOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}"],
		getPublicKeyForAuthenticatedUser: ["GET /user/codespaces/secrets/public-key"],
		getRepoPublicKey: ["GET /repos/{owner}/{repo}/codespaces/secrets/public-key"],
		getRepoSecret: ["GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],
		getSecretForAuthenticatedUser: ["GET /user/codespaces/secrets/{secret_name}"],
		listDevcontainersInRepositoryForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/devcontainers"],
		listForAuthenticatedUser: ["GET /user/codespaces"],
		listInOrganization: [
			"GET /orgs/{org}/codespaces",
			{},
			{ renamedParameters: { org_id: "org" } }
		],
		listInRepositoryForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces"],
		listOrgSecrets: ["GET /orgs/{org}/codespaces/secrets"],
		listRepoSecrets: ["GET /repos/{owner}/{repo}/codespaces/secrets"],
		listRepositoriesForSecretForAuthenticatedUser: ["GET /user/codespaces/secrets/{secret_name}/repositories"],
		listSecretsForAuthenticatedUser: ["GET /user/codespaces/secrets"],
		listSelectedReposForOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories"],
		preFlightWithRepoForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/new"],
		publishForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/publish"],
		removeRepositoryForSecretForAuthenticatedUser: ["DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"],
		repoMachinesForAuthenticatedUser: ["GET /repos/{owner}/{repo}/codespaces/machines"],
		setRepositoriesForSecretForAuthenticatedUser: ["PUT /user/codespaces/secrets/{secret_name}/repositories"],
		setSelectedReposForOrgSecret: ["PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories"],
		startForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/start"],
		stopForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/stop"],
		stopInOrganization: ["POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop"],
		updateForAuthenticatedUser: ["PATCH /user/codespaces/{codespace_name}"]
	},
	copilot: {
		addCopilotSeatsForTeams: ["POST /orgs/{org}/copilot/billing/selected_teams"],
		addCopilotSeatsForUsers: ["POST /orgs/{org}/copilot/billing/selected_users"],
		cancelCopilotSeatAssignmentForTeams: ["DELETE /orgs/{org}/copilot/billing/selected_teams"],
		cancelCopilotSeatAssignmentForUsers: ["DELETE /orgs/{org}/copilot/billing/selected_users"],
		copilotMetricsForOrganization: ["GET /orgs/{org}/copilot/metrics"],
		copilotMetricsForTeam: ["GET /orgs/{org}/team/{team_slug}/copilot/metrics"],
		getCopilotOrganizationDetails: ["GET /orgs/{org}/copilot/billing"],
		getCopilotSeatDetailsForUser: ["GET /orgs/{org}/members/{username}/copilot"],
		listCopilotSeats: ["GET /orgs/{org}/copilot/billing/seats"]
	},
	credentials: { revoke: ["POST /credentials/revoke"] },
	dependabot: {
		addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"],
		createOrUpdateOrgSecret: ["PUT /orgs/{org}/dependabot/secrets/{secret_name}"],
		createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
		deleteOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}"],
		deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
		getAlert: ["GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
		getOrgPublicKey: ["GET /orgs/{org}/dependabot/secrets/public-key"],
		getOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}"],
		getRepoPublicKey: ["GET /repos/{owner}/{repo}/dependabot/secrets/public-key"],
		getRepoSecret: ["GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],
		listAlertsForEnterprise: ["GET /enterprises/{enterprise}/dependabot/alerts"],
		listAlertsForOrg: ["GET /orgs/{org}/dependabot/alerts"],
		listAlertsForRepo: ["GET /repos/{owner}/{repo}/dependabot/alerts"],
		listOrgSecrets: ["GET /orgs/{org}/dependabot/secrets"],
		listRepoSecrets: ["GET /repos/{owner}/{repo}/dependabot/secrets"],
		listSelectedReposForOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories"],
		removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"],
		repositoryAccessForOrg: ["GET /organizations/{org}/dependabot/repository-access"],
		setRepositoryAccessDefaultLevel: ["PUT /organizations/{org}/dependabot/repository-access/default-level"],
		setSelectedReposForOrgSecret: ["PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories"],
		updateAlert: ["PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
		updateRepositoryAccessForOrg: ["PATCH /organizations/{org}/dependabot/repository-access"]
	},
	dependencyGraph: {
		createRepositorySnapshot: ["POST /repos/{owner}/{repo}/dependency-graph/snapshots"],
		diffRange: ["GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}"],
		exportSbom: ["GET /repos/{owner}/{repo}/dependency-graph/sbom"]
	},
	emojis: { get: ["GET /emojis"] },
	enterpriseTeamMemberships: {
		add: ["PUT /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"],
		bulkAdd: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/add"],
		bulkRemove: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/remove"],
		get: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"],
		list: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships"],
		remove: ["DELETE /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"]
	},
	enterpriseTeamOrganizations: {
		add: ["PUT /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
		bulkAdd: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/add"],
		bulkRemove: ["POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/remove"],
		delete: ["DELETE /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
		getAssignment: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"],
		getAssignments: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations"]
	},
	enterpriseTeams: {
		create: ["POST /enterprises/{enterprise}/teams"],
		delete: ["DELETE /enterprises/{enterprise}/teams/{team_slug}"],
		get: ["GET /enterprises/{enterprise}/teams/{team_slug}"],
		list: ["GET /enterprises/{enterprise}/teams"],
		update: ["PATCH /enterprises/{enterprise}/teams/{team_slug}"]
	},
	gists: {
		checkIsStarred: ["GET /gists/{gist_id}/star"],
		create: ["POST /gists"],
		createComment: ["POST /gists/{gist_id}/comments"],
		delete: ["DELETE /gists/{gist_id}"],
		deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
		fork: ["POST /gists/{gist_id}/forks"],
		get: ["GET /gists/{gist_id}"],
		getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
		getRevision: ["GET /gists/{gist_id}/{sha}"],
		list: ["GET /gists"],
		listComments: ["GET /gists/{gist_id}/comments"],
		listCommits: ["GET /gists/{gist_id}/commits"],
		listForUser: ["GET /users/{username}/gists"],
		listForks: ["GET /gists/{gist_id}/forks"],
		listPublic: ["GET /gists/public"],
		listStarred: ["GET /gists/starred"],
		star: ["PUT /gists/{gist_id}/star"],
		unstar: ["DELETE /gists/{gist_id}/star"],
		update: ["PATCH /gists/{gist_id}"],
		updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
	},
	git: {
		createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
		createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
		createRef: ["POST /repos/{owner}/{repo}/git/refs"],
		createTag: ["POST /repos/{owner}/{repo}/git/tags"],
		createTree: ["POST /repos/{owner}/{repo}/git/trees"],
		deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
		getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
		getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
		getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
		getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
		getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
		listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
		updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
	},
	gitignore: {
		getAllTemplates: ["GET /gitignore/templates"],
		getTemplate: ["GET /gitignore/templates/{name}"]
	},
	hostedCompute: {
		createNetworkConfigurationForOrg: ["POST /orgs/{org}/settings/network-configurations"],
		deleteNetworkConfigurationFromOrg: ["DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id}"],
		getNetworkConfigurationForOrg: ["GET /orgs/{org}/settings/network-configurations/{network_configuration_id}"],
		getNetworkSettingsForOrg: ["GET /orgs/{org}/settings/network-settings/{network_settings_id}"],
		listNetworkConfigurationsForOrg: ["GET /orgs/{org}/settings/network-configurations"],
		updateNetworkConfigurationForOrg: ["PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id}"]
	},
	interactions: {
		getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
		getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
		getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
		getRestrictionsForYourPublicRepos: [
			"GET /user/interaction-limits",
			{},
			{ renamed: ["interactions", "getRestrictionsForAuthenticatedUser"] }
		],
		removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
		removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
		removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits"],
		removeRestrictionsForYourPublicRepos: [
			"DELETE /user/interaction-limits",
			{},
			{ renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"] }
		],
		setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
		setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
		setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
		setRestrictionsForYourPublicRepos: [
			"PUT /user/interaction-limits",
			{},
			{ renamed: ["interactions", "setRestrictionsForAuthenticatedUser"] }
		]
	},
	issues: {
		addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
		addBlockedByDependency: ["POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by"],
		addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		addSubIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],
		checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
		checkUserCanBeAssignedToIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}"],
		create: ["POST /repos/{owner}/{repo}/issues"],
		createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
		createLabel: ["POST /repos/{owner}/{repo}/labels"],
		createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
		deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
		deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
		deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
		get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
		getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
		getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
		getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
		getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
		getParent: ["GET /repos/{owner}/{repo}/issues/{issue_number}/parent"],
		list: ["GET /issues"],
		listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
		listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
		listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
		listDependenciesBlockedBy: ["GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by"],
		listDependenciesBlocking: ["GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocking"],
		listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
		listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
		listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"],
		listForAuthenticatedUser: ["GET /user/issues"],
		listForOrg: ["GET /orgs/{org}/issues"],
		listForRepo: ["GET /repos/{owner}/{repo}/issues"],
		listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
		listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
		listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
		listSubIssues: ["GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],
		lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
		removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
		removeDependencyBlockedBy: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by/{issue_id}"],
		removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
		removeSubIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue"],
		reprioritizeSubIssue: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority"],
		setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
		unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
		update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
		updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
		updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
		updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
	},
	licenses: {
		get: ["GET /licenses/{license}"],
		getAllCommonlyUsed: ["GET /licenses"],
		getForRepo: ["GET /repos/{owner}/{repo}/license"]
	},
	markdown: {
		render: ["POST /markdown"],
		renderRaw: ["POST /markdown/raw", { headers: { "content-type": "text/plain; charset=utf-8" } }]
	},
	meta: {
		get: ["GET /meta"],
		getAllVersions: ["GET /versions"],
		getOctocat: ["GET /octocat"],
		getZen: ["GET /zen"],
		root: ["GET /"]
	},
	migrations: {
		deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive"],
		deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive"],
		downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive"],
		getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive"],
		getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
		getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
		listForAuthenticatedUser: ["GET /user/migrations"],
		listForOrg: ["GET /orgs/{org}/migrations"],
		listReposForAuthenticatedUser: ["GET /user/migrations/{migration_id}/repositories"],
		listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
		listReposForUser: [
			"GET /user/migrations/{migration_id}/repositories",
			{},
			{ renamed: ["migrations", "listReposForAuthenticatedUser"] }
		],
		startForAuthenticatedUser: ["POST /user/migrations"],
		startForOrg: ["POST /orgs/{org}/migrations"],
		unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock"],
		unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"]
	},
	oidc: {
		getOidcCustomSubTemplateForOrg: ["GET /orgs/{org}/actions/oidc/customization/sub"],
		updateOidcCustomSubTemplateForOrg: ["PUT /orgs/{org}/actions/oidc/customization/sub"]
	},
	orgs: {
		addSecurityManagerTeam: [
			"PUT /orgs/{org}/security-managers/teams/{team_slug}",
			{},
			{ deprecated: "octokit.rest.orgs.addSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#add-a-security-manager-team" }
		],
		assignTeamToOrgRole: ["PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],
		assignUserToOrgRole: ["PUT /orgs/{org}/organization-roles/users/{username}/{role_id}"],
		blockUser: ["PUT /orgs/{org}/blocks/{username}"],
		cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
		checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
		checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
		checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
		convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
		createArtifactStorageRecord: ["POST /orgs/{org}/artifacts/metadata/storage-record"],
		createInvitation: ["POST /orgs/{org}/invitations"],
		createIssueType: ["POST /orgs/{org}/issue-types"],
		createWebhook: ["POST /orgs/{org}/hooks"],
		customPropertiesForOrgsCreateOrUpdateOrganizationValues: ["PATCH /organizations/{org}/org-properties/values"],
		customPropertiesForOrgsGetOrganizationValues: ["GET /organizations/{org}/org-properties/values"],
		customPropertiesForReposCreateOrUpdateOrganizationDefinition: ["PUT /orgs/{org}/properties/schema/{custom_property_name}"],
		customPropertiesForReposCreateOrUpdateOrganizationDefinitions: ["PATCH /orgs/{org}/properties/schema"],
		customPropertiesForReposCreateOrUpdateOrganizationValues: ["PATCH /orgs/{org}/properties/values"],
		customPropertiesForReposDeleteOrganizationDefinition: ["DELETE /orgs/{org}/properties/schema/{custom_property_name}"],
		customPropertiesForReposGetOrganizationDefinition: ["GET /orgs/{org}/properties/schema/{custom_property_name}"],
		customPropertiesForReposGetOrganizationDefinitions: ["GET /orgs/{org}/properties/schema"],
		customPropertiesForReposGetOrganizationValues: ["GET /orgs/{org}/properties/values"],
		delete: ["DELETE /orgs/{org}"],
		deleteAttestationsBulk: ["POST /orgs/{org}/attestations/delete-request"],
		deleteAttestationsById: ["DELETE /orgs/{org}/attestations/{attestation_id}"],
		deleteAttestationsBySubjectDigest: ["DELETE /orgs/{org}/attestations/digest/{subject_digest}"],
		deleteIssueType: ["DELETE /orgs/{org}/issue-types/{issue_type_id}"],
		deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
		disableSelectedRepositoryImmutableReleasesOrganization: ["DELETE /orgs/{org}/settings/immutable-releases/repositories/{repository_id}"],
		enableSelectedRepositoryImmutableReleasesOrganization: ["PUT /orgs/{org}/settings/immutable-releases/repositories/{repository_id}"],
		get: ["GET /orgs/{org}"],
		getImmutableReleasesSettings: ["GET /orgs/{org}/settings/immutable-releases"],
		getImmutableReleasesSettingsRepositories: ["GET /orgs/{org}/settings/immutable-releases/repositories"],
		getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
		getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
		getOrgRole: ["GET /orgs/{org}/organization-roles/{role_id}"],
		getOrgRulesetHistory: ["GET /orgs/{org}/rulesets/{ruleset_id}/history"],
		getOrgRulesetVersion: ["GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id}"],
		getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
		getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
		getWebhookDelivery: ["GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"],
		list: ["GET /organizations"],
		listAppInstallations: ["GET /orgs/{org}/installations"],
		listArtifactStorageRecords: ["GET /orgs/{org}/artifacts/{subject_digest}/metadata/storage-records"],
		listAttestationRepositories: ["GET /orgs/{org}/attestations/repositories"],
		listAttestations: ["GET /orgs/{org}/attestations/{subject_digest}"],
		listAttestationsBulk: ["POST /orgs/{org}/attestations/bulk-list{?per_page,before,after}"],
		listBlockedUsers: ["GET /orgs/{org}/blocks"],
		listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
		listForAuthenticatedUser: ["GET /user/orgs"],
		listForUser: ["GET /users/{username}/orgs"],
		listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
		listIssueTypes: ["GET /orgs/{org}/issue-types"],
		listMembers: ["GET /orgs/{org}/members"],
		listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
		listOrgRoleTeams: ["GET /orgs/{org}/organization-roles/{role_id}/teams"],
		listOrgRoleUsers: ["GET /orgs/{org}/organization-roles/{role_id}/users"],
		listOrgRoles: ["GET /orgs/{org}/organization-roles"],
		listOrganizationFineGrainedPermissions: ["GET /orgs/{org}/organization-fine-grained-permissions"],
		listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
		listPatGrantRepositories: ["GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories"],
		listPatGrantRequestRepositories: ["GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories"],
		listPatGrantRequests: ["GET /orgs/{org}/personal-access-token-requests"],
		listPatGrants: ["GET /orgs/{org}/personal-access-tokens"],
		listPendingInvitations: ["GET /orgs/{org}/invitations"],
		listPublicMembers: ["GET /orgs/{org}/public_members"],
		listSecurityManagerTeams: [
			"GET /orgs/{org}/security-managers",
			{},
			{ deprecated: "octokit.rest.orgs.listSecurityManagerTeams() is deprecated, see https://docs.github.com/rest/orgs/security-managers#list-security-manager-teams" }
		],
		listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
		listWebhooks: ["GET /orgs/{org}/hooks"],
		pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
		redeliverWebhookDelivery: ["POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
		removeMember: ["DELETE /orgs/{org}/members/{username}"],
		removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
		removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
		removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
		removeSecurityManagerTeam: [
			"DELETE /orgs/{org}/security-managers/teams/{team_slug}",
			{},
			{ deprecated: "octokit.rest.orgs.removeSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#remove-a-security-manager-team" }
		],
		reviewPatGrantRequest: ["POST /orgs/{org}/personal-access-token-requests/{pat_request_id}"],
		reviewPatGrantRequestsInBulk: ["POST /orgs/{org}/personal-access-token-requests"],
		revokeAllOrgRolesTeam: ["DELETE /orgs/{org}/organization-roles/teams/{team_slug}"],
		revokeAllOrgRolesUser: ["DELETE /orgs/{org}/organization-roles/users/{username}"],
		revokeOrgRoleTeam: ["DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],
		revokeOrgRoleUser: ["DELETE /orgs/{org}/organization-roles/users/{username}/{role_id}"],
		setImmutableReleasesSettings: ["PUT /orgs/{org}/settings/immutable-releases"],
		setImmutableReleasesSettingsRepositories: ["PUT /orgs/{org}/settings/immutable-releases/repositories"],
		setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
		setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
		unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
		update: ["PATCH /orgs/{org}"],
		updateIssueType: ["PUT /orgs/{org}/issue-types/{issue_type_id}"],
		updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
		updatePatAccess: ["POST /orgs/{org}/personal-access-tokens/{pat_id}"],
		updatePatAccesses: ["POST /orgs/{org}/personal-access-tokens"],
		updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
		updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
	},
	packages: {
		deletePackageForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}"],
		deletePackageForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}"],
		deletePackageForUser: ["DELETE /users/{username}/packages/{package_type}/{package_name}"],
		deletePackageVersionForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		deletePackageVersionForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		deletePackageVersionForUser: ["DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		getAllPackageVersionsForAPackageOwnedByAnOrg: [
			"GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
			{},
			{ renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"] }
		],
		getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
			"GET /user/packages/{package_type}/{package_name}/versions",
			{},
			{ renamed: ["packages", "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"] }
		],
		getAllPackageVersionsForPackageOwnedByAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions"],
		getAllPackageVersionsForPackageOwnedByOrg: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions"],
		getAllPackageVersionsForPackageOwnedByUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions"],
		getPackageForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}"],
		getPackageForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}"],
		getPackageForUser: ["GET /users/{username}/packages/{package_type}/{package_name}"],
		getPackageVersionForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		getPackageVersionForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		getPackageVersionForUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
		listDockerMigrationConflictingPackagesForAuthenticatedUser: ["GET /user/docker/conflicts"],
		listDockerMigrationConflictingPackagesForOrganization: ["GET /orgs/{org}/docker/conflicts"],
		listDockerMigrationConflictingPackagesForUser: ["GET /users/{username}/docker/conflicts"],
		listPackagesForAuthenticatedUser: ["GET /user/packages"],
		listPackagesForOrganization: ["GET /orgs/{org}/packages"],
		listPackagesForUser: ["GET /users/{username}/packages"],
		restorePackageForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/restore{?token}"],
		restorePackageForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"],
		restorePackageForUser: ["POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}"],
		restorePackageVersionForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],
		restorePackageVersionForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],
		restorePackageVersionForUser: ["POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"]
	},
	privateRegistries: {
		createOrgPrivateRegistry: ["POST /orgs/{org}/private-registries"],
		deleteOrgPrivateRegistry: ["DELETE /orgs/{org}/private-registries/{secret_name}"],
		getOrgPrivateRegistry: ["GET /orgs/{org}/private-registries/{secret_name}"],
		getOrgPublicKey: ["GET /orgs/{org}/private-registries/public-key"],
		listOrgPrivateRegistries: ["GET /orgs/{org}/private-registries"],
		updateOrgPrivateRegistry: ["PATCH /orgs/{org}/private-registries/{secret_name}"]
	},
	projects: {
		addItemForOrg: ["POST /orgs/{org}/projectsV2/{project_number}/items"],
		addItemForUser: ["POST /users/{username}/projectsV2/{project_number}/items"],
		deleteItemForOrg: ["DELETE /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
		deleteItemForUser: ["DELETE /users/{username}/projectsV2/{project_number}/items/{item_id}"],
		getFieldForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields/{field_id}"],
		getFieldForUser: ["GET /users/{username}/projectsV2/{project_number}/fields/{field_id}"],
		getForOrg: ["GET /orgs/{org}/projectsV2/{project_number}"],
		getForUser: ["GET /users/{username}/projectsV2/{project_number}"],
		getOrgItem: ["GET /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
		getUserItem: ["GET /users/{username}/projectsV2/{project_number}/items/{item_id}"],
		listFieldsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields"],
		listFieldsForUser: ["GET /users/{username}/projectsV2/{project_number}/fields"],
		listForOrg: ["GET /orgs/{org}/projectsV2"],
		listForUser: ["GET /users/{username}/projectsV2"],
		listItemsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/items"],
		listItemsForUser: ["GET /users/{username}/projectsV2/{project_number}/items"],
		updateItemForOrg: ["PATCH /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
		updateItemForUser: ["PATCH /users/{username}/projectsV2/{project_number}/items/{item_id}"]
	},
	pulls: {
		checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
		create: ["POST /repos/{owner}/{repo}/pulls"],
		createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
		createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
		createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
		deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
		deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
		dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
		get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
		getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
		getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
		list: ["GET /repos/{owner}/{repo}/pulls"],
		listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
		listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
		listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
		listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
		listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
		listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
		listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
		merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
		removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
		requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
		submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
		update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
		updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"],
		updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
		updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
	},
	rateLimit: { get: ["GET /rate_limit"] },
	reactions: {
		createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
		createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
		createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
		createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],
		createForRelease: ["POST /repos/{owner}/{repo}/releases/{release_id}/reactions"],
		createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],
		createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"],
		deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}"],
		deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}"],
		deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}"],
		deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}"],
		deleteForRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}"],
		deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}"],
		deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}"],
		listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
		listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
		listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
		listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],
		listForRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}/reactions"],
		listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],
		listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"]
	},
	repos: {
		acceptInvitation: [
			"PATCH /user/repository_invitations/{invitation_id}",
			{},
			{ renamed: ["repos", "acceptInvitationForAuthenticatedUser"] }
		],
		acceptInvitationForAuthenticatedUser: ["PATCH /user/repository_invitations/{invitation_id}"],
		addAppAccessRestrictions: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
			{},
			{ mapToData: "apps" }
		],
		addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
		addStatusCheckContexts: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
			{},
			{ mapToData: "contexts" }
		],
		addTeamAccessRestrictions: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
			{},
			{ mapToData: "teams" }
		],
		addUserAccessRestrictions: [
			"POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
			{},
			{ mapToData: "users" }
		],
		cancelPagesDeployment: ["POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel"],
		checkAutomatedSecurityFixes: ["GET /repos/{owner}/{repo}/automated-security-fixes"],
		checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
		checkImmutableReleases: ["GET /repos/{owner}/{repo}/immutable-releases"],
		checkPrivateVulnerabilityReporting: ["GET /repos/{owner}/{repo}/private-vulnerability-reporting"],
		checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts"],
		codeownersErrors: ["GET /repos/{owner}/{repo}/codeowners/errors"],
		compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
		compareCommitsWithBasehead: ["GET /repos/{owner}/{repo}/compare/{basehead}"],
		createAttestation: ["POST /repos/{owner}/{repo}/attestations"],
		createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
		createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
		createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
		createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
		createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
		createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
		createDeploymentBranchPolicy: ["POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"],
		createDeploymentProtectionRule: ["POST /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"],
		createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
		createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
		createForAuthenticatedUser: ["POST /user/repos"],
		createFork: ["POST /repos/{owner}/{repo}/forks"],
		createInOrg: ["POST /orgs/{org}/repos"],
		createOrUpdateEnvironment: ["PUT /repos/{owner}/{repo}/environments/{environment_name}"],
		createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
		createOrgRuleset: ["POST /orgs/{org}/rulesets"],
		createPagesDeployment: ["POST /repos/{owner}/{repo}/pages/deployments"],
		createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
		createRelease: ["POST /repos/{owner}/{repo}/releases"],
		createRepoRuleset: ["POST /repos/{owner}/{repo}/rulesets"],
		createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate"],
		createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
		customPropertiesForReposCreateOrUpdateRepositoryValues: ["PATCH /repos/{owner}/{repo}/properties/values"],
		customPropertiesForReposGetRepositoryValues: ["GET /repos/{owner}/{repo}/properties/values"],
		declineInvitation: [
			"DELETE /user/repository_invitations/{invitation_id}",
			{},
			{ renamed: ["repos", "declineInvitationForAuthenticatedUser"] }
		],
		declineInvitationForAuthenticatedUser: ["DELETE /user/repository_invitations/{invitation_id}"],
		delete: ["DELETE /repos/{owner}/{repo}"],
		deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
		deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
		deleteAnEnvironment: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}"],
		deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
		deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
		deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
		deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
		deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
		deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
		deleteDeploymentBranchPolicy: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],
		deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
		deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
		deleteOrgRuleset: ["DELETE /orgs/{org}/rulesets/{ruleset_id}"],
		deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
		deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
		deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
		deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
		deleteRepoRuleset: ["DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
		deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
		disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes"],
		disableDeploymentProtectionRule: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"],
		disableImmutableReleases: ["DELETE /repos/{owner}/{repo}/immutable-releases"],
		disablePrivateVulnerabilityReporting: ["DELETE /repos/{owner}/{repo}/private-vulnerability-reporting"],
		disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts"],
		downloadArchive: [
			"GET /repos/{owner}/{repo}/zipball/{ref}",
			{},
			{ renamed: ["repos", "downloadZipballArchive"] }
		],
		downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
		downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
		enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes"],
		enableImmutableReleases: ["PUT /repos/{owner}/{repo}/immutable-releases"],
		enablePrivateVulnerabilityReporting: ["PUT /repos/{owner}/{repo}/private-vulnerability-reporting"],
		enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts"],
		generateReleaseNotes: ["POST /repos/{owner}/{repo}/releases/generate-notes"],
		get: ["GET /repos/{owner}/{repo}"],
		getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
		getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
		getAllDeploymentProtectionRules: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"],
		getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
		getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
		getAllTopics: ["GET /repos/{owner}/{repo}/topics"],
		getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
		getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
		getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
		getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
		getBranchRules: ["GET /repos/{owner}/{repo}/rules/branches/{branch}"],
		getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
		getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
		getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
		getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
		getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
		getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
		getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
		getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
		getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
		getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
		getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
		getCustomDeploymentProtectionRule: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"],
		getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
		getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
		getDeploymentBranchPolicy: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],
		getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
		getEnvironment: ["GET /repos/{owner}/{repo}/environments/{environment_name}"],
		getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
		getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
		getOrgRuleSuite: ["GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}"],
		getOrgRuleSuites: ["GET /orgs/{org}/rulesets/rule-suites"],
		getOrgRuleset: ["GET /orgs/{org}/rulesets/{ruleset_id}"],
		getOrgRulesets: ["GET /orgs/{org}/rulesets"],
		getPages: ["GET /repos/{owner}/{repo}/pages"],
		getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
		getPagesDeployment: ["GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}"],
		getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
		getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
		getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
		getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
		getReadme: ["GET /repos/{owner}/{repo}/readme"],
		getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
		getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
		getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
		getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
		getRepoRuleSuite: ["GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}"],
		getRepoRuleSuites: ["GET /repos/{owner}/{repo}/rulesets/rule-suites"],
		getRepoRuleset: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
		getRepoRulesetHistory: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history"],
		getRepoRulesetVersion: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id}"],
		getRepoRulesets: ["GET /repos/{owner}/{repo}/rulesets"],
		getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
		getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
		getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
		getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
		getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
		getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
		getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
		getWebhookConfigForRepo: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/config"],
		getWebhookDelivery: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"],
		listActivities: ["GET /repos/{owner}/{repo}/activity"],
		listAttestations: ["GET /repos/{owner}/{repo}/attestations/{subject_digest}"],
		listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
		listBranches: ["GET /repos/{owner}/{repo}/branches"],
		listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head"],
		listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
		listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
		listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
		listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
		listCommits: ["GET /repos/{owner}/{repo}/commits"],
		listContributors: ["GET /repos/{owner}/{repo}/contributors"],
		listCustomDeploymentRuleIntegrations: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps"],
		listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
		listDeploymentBranchPolicies: ["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"],
		listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
		listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
		listForAuthenticatedUser: ["GET /user/repos"],
		listForOrg: ["GET /orgs/{org}/repos"],
		listForUser: ["GET /users/{username}/repos"],
		listForks: ["GET /repos/{owner}/{repo}/forks"],
		listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
		listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
		listLanguages: ["GET /repos/{owner}/{repo}/languages"],
		listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
		listPublic: ["GET /repositories"],
		listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls"],
		listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
		listReleases: ["GET /repos/{owner}/{repo}/releases"],
		listTags: ["GET /repos/{owner}/{repo}/tags"],
		listTeams: ["GET /repos/{owner}/{repo}/teams"],
		listWebhookDeliveries: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"],
		listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
		merge: ["POST /repos/{owner}/{repo}/merges"],
		mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
		pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
		redeliverWebhookDelivery: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
		removeAppAccessRestrictions: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
			{},
			{ mapToData: "apps" }
		],
		removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
		removeStatusCheckContexts: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
			{},
			{ mapToData: "contexts" }
		],
		removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
		removeTeamAccessRestrictions: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
			{},
			{ mapToData: "teams" }
		],
		removeUserAccessRestrictions: [
			"DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
			{},
			{ mapToData: "users" }
		],
		renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
		replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics"],
		requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
		setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
		setAppAccessRestrictions: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
			{},
			{ mapToData: "apps" }
		],
		setStatusCheckContexts: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
			{},
			{ mapToData: "contexts" }
		],
		setTeamAccessRestrictions: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
			{},
			{ mapToData: "teams" }
		],
		setUserAccessRestrictions: [
			"PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
			{},
			{ mapToData: "users" }
		],
		testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
		transfer: ["POST /repos/{owner}/{repo}/transfer"],
		update: ["PATCH /repos/{owner}/{repo}"],
		updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
		updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
		updateDeploymentBranchPolicy: ["PUT /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],
		updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
		updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
		updateOrgRuleset: ["PUT /orgs/{org}/rulesets/{ruleset_id}"],
		updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
		updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
		updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
		updateRepoRuleset: ["PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
		updateStatusCheckPotection: [
			"PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
			{},
			{ renamed: ["repos", "updateStatusCheckProtection"] }
		],
		updateStatusCheckProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
		updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
		updateWebhookConfigForRepo: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"],
		uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", { baseUrl: "https://uploads.github.com" }]
	},
	search: {
		code: ["GET /search/code"],
		commits: ["GET /search/commits"],
		issuesAndPullRequests: ["GET /search/issues"],
		labels: ["GET /search/labels"],
		repos: ["GET /search/repositories"],
		topics: ["GET /search/topics"],
		users: ["GET /search/users"]
	},
	secretScanning: {
		createPushProtectionBypass: ["POST /repos/{owner}/{repo}/secret-scanning/push-protection-bypasses"],
		getAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
		getScanHistory: ["GET /repos/{owner}/{repo}/secret-scanning/scan-history"],
		listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
		listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
		listLocationsForAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations"],
		listOrgPatternConfigs: ["GET /orgs/{org}/secret-scanning/pattern-configurations"],
		updateAlert: ["PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
		updateOrgPatternConfigs: ["PATCH /orgs/{org}/secret-scanning/pattern-configurations"]
	},
	securityAdvisories: {
		createFork: ["POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks"],
		createPrivateVulnerabilityReport: ["POST /repos/{owner}/{repo}/security-advisories/reports"],
		createRepositoryAdvisory: ["POST /repos/{owner}/{repo}/security-advisories"],
		createRepositoryAdvisoryCveRequest: ["POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve"],
		getGlobalAdvisory: ["GET /advisories/{ghsa_id}"],
		getRepositoryAdvisory: ["GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}"],
		listGlobalAdvisories: ["GET /advisories"],
		listOrgRepositoryAdvisories: ["GET /orgs/{org}/security-advisories"],
		listRepositoryAdvisories: ["GET /repos/{owner}/{repo}/security-advisories"],
		updateRepositoryAdvisory: ["PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}"]
	},
	teams: {
		addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
		addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
		checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
		create: ["POST /orgs/{org}/teams"],
		createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
		createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
		deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
		deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
		deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
		getByName: ["GET /orgs/{org}/teams/{team_slug}"],
		getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
		getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
		getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
		list: ["GET /orgs/{org}/teams"],
		listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
		listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
		listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
		listForAuthenticatedUser: ["GET /user/teams"],
		listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
		listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
		listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
		removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
		removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
		updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
		updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
		updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
	},
	users: {
		addEmailForAuthenticated: [
			"POST /user/emails",
			{},
			{ renamed: ["users", "addEmailForAuthenticatedUser"] }
		],
		addEmailForAuthenticatedUser: ["POST /user/emails"],
		addSocialAccountForAuthenticatedUser: ["POST /user/social_accounts"],
		block: ["PUT /user/blocks/{username}"],
		checkBlocked: ["GET /user/blocks/{username}"],
		checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
		checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
		createGpgKeyForAuthenticated: [
			"POST /user/gpg_keys",
			{},
			{ renamed: ["users", "createGpgKeyForAuthenticatedUser"] }
		],
		createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
		createPublicSshKeyForAuthenticated: [
			"POST /user/keys",
			{},
			{ renamed: ["users", "createPublicSshKeyForAuthenticatedUser"] }
		],
		createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
		createSshSigningKeyForAuthenticatedUser: ["POST /user/ssh_signing_keys"],
		deleteAttestationsBulk: ["POST /users/{username}/attestations/delete-request"],
		deleteAttestationsById: ["DELETE /users/{username}/attestations/{attestation_id}"],
		deleteAttestationsBySubjectDigest: ["DELETE /users/{username}/attestations/digest/{subject_digest}"],
		deleteEmailForAuthenticated: [
			"DELETE /user/emails",
			{},
			{ renamed: ["users", "deleteEmailForAuthenticatedUser"] }
		],
		deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
		deleteGpgKeyForAuthenticated: [
			"DELETE /user/gpg_keys/{gpg_key_id}",
			{},
			{ renamed: ["users", "deleteGpgKeyForAuthenticatedUser"] }
		],
		deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
		deletePublicSshKeyForAuthenticated: [
			"DELETE /user/keys/{key_id}",
			{},
			{ renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"] }
		],
		deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
		deleteSocialAccountForAuthenticatedUser: ["DELETE /user/social_accounts"],
		deleteSshSigningKeyForAuthenticatedUser: ["DELETE /user/ssh_signing_keys/{ssh_signing_key_id}"],
		follow: ["PUT /user/following/{username}"],
		getAuthenticated: ["GET /user"],
		getById: ["GET /user/{account_id}"],
		getByUsername: ["GET /users/{username}"],
		getContextForUser: ["GET /users/{username}/hovercard"],
		getGpgKeyForAuthenticated: [
			"GET /user/gpg_keys/{gpg_key_id}",
			{},
			{ renamed: ["users", "getGpgKeyForAuthenticatedUser"] }
		],
		getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
		getPublicSshKeyForAuthenticated: [
			"GET /user/keys/{key_id}",
			{},
			{ renamed: ["users", "getPublicSshKeyForAuthenticatedUser"] }
		],
		getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
		getSshSigningKeyForAuthenticatedUser: ["GET /user/ssh_signing_keys/{ssh_signing_key_id}"],
		list: ["GET /users"],
		listAttestations: ["GET /users/{username}/attestations/{subject_digest}"],
		listAttestationsBulk: ["POST /users/{username}/attestations/bulk-list{?per_page,before,after}"],
		listBlockedByAuthenticated: [
			"GET /user/blocks",
			{},
			{ renamed: ["users", "listBlockedByAuthenticatedUser"] }
		],
		listBlockedByAuthenticatedUser: ["GET /user/blocks"],
		listEmailsForAuthenticated: [
			"GET /user/emails",
			{},
			{ renamed: ["users", "listEmailsForAuthenticatedUser"] }
		],
		listEmailsForAuthenticatedUser: ["GET /user/emails"],
		listFollowedByAuthenticated: [
			"GET /user/following",
			{},
			{ renamed: ["users", "listFollowedByAuthenticatedUser"] }
		],
		listFollowedByAuthenticatedUser: ["GET /user/following"],
		listFollowersForAuthenticatedUser: ["GET /user/followers"],
		listFollowersForUser: ["GET /users/{username}/followers"],
		listFollowingForUser: ["GET /users/{username}/following"],
		listGpgKeysForAuthenticated: [
			"GET /user/gpg_keys",
			{},
			{ renamed: ["users", "listGpgKeysForAuthenticatedUser"] }
		],
		listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
		listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
		listPublicEmailsForAuthenticated: [
			"GET /user/public_emails",
			{},
			{ renamed: ["users", "listPublicEmailsForAuthenticatedUser"] }
		],
		listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
		listPublicKeysForUser: ["GET /users/{username}/keys"],
		listPublicSshKeysForAuthenticated: [
			"GET /user/keys",
			{},
			{ renamed: ["users", "listPublicSshKeysForAuthenticatedUser"] }
		],
		listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
		listSocialAccountsForAuthenticatedUser: ["GET /user/social_accounts"],
		listSocialAccountsForUser: ["GET /users/{username}/social_accounts"],
		listSshSigningKeysForAuthenticatedUser: ["GET /user/ssh_signing_keys"],
		listSshSigningKeysForUser: ["GET /users/{username}/ssh_signing_keys"],
		setPrimaryEmailVisibilityForAuthenticated: [
			"PATCH /user/email/visibility",
			{},
			{ renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"] }
		],
		setPrimaryEmailVisibilityForAuthenticatedUser: ["PATCH /user/email/visibility"],
		unblock: ["DELETE /user/blocks/{username}"],
		unfollow: ["DELETE /user/following/{username}"],
		updateAuthenticated: ["PATCH /user"]
	}
};
//#endregion
//#region node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/endpoints-to-methods.js
var endpointMethodsMap = /* @__PURE__ */ new Map();
for (const [scope, endpoints] of Object.entries(endpoints_default)) for (const [methodName, endpoint] of Object.entries(endpoints)) {
	const [route, defaults, decorations] = endpoint;
	const [method, url] = route.split(/ /);
	const endpointDefaults = Object.assign({
		method,
		url
	}, defaults);
	if (!endpointMethodsMap.has(scope)) endpointMethodsMap.set(scope, /* @__PURE__ */ new Map());
	endpointMethodsMap.get(scope).set(methodName, {
		scope,
		methodName,
		endpointDefaults,
		decorations
	});
}
var handler = {
	has({ scope }, methodName) {
		return endpointMethodsMap.get(scope).has(methodName);
	},
	getOwnPropertyDescriptor(target, methodName) {
		return {
			value: this.get(target, methodName),
			configurable: true,
			writable: true,
			enumerable: true
		};
	},
	defineProperty(target, methodName, descriptor) {
		Object.defineProperty(target.cache, methodName, descriptor);
		return true;
	},
	deleteProperty(target, methodName) {
		delete target.cache[methodName];
		return true;
	},
	ownKeys({ scope }) {
		return [...endpointMethodsMap.get(scope).keys()];
	},
	set(target, methodName, value) {
		return target.cache[methodName] = value;
	},
	get({ octokit, scope, cache }, methodName) {
		if (cache[methodName]) return cache[methodName];
		const method = endpointMethodsMap.get(scope).get(methodName);
		if (!method) return;
		const { endpointDefaults, decorations } = method;
		if (decorations) cache[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
		else cache[methodName] = octokit.request.defaults(endpointDefaults);
		return cache[methodName];
	}
};
function endpointsToMethods(octokit) {
	const newMethods = {};
	for (const scope of endpointMethodsMap.keys()) newMethods[scope] = new Proxy({
		octokit,
		scope,
		cache: {}
	}, handler);
	return newMethods;
}
function decorate(octokit, scope, methodName, defaults, decorations) {
	const requestWithDefaults = octokit.request.defaults(defaults);
	function withDecorations(...args) {
		let options = requestWithDefaults.endpoint.merge(...args);
		if (decorations.mapToData) {
			options = Object.assign({}, options, {
				data: options[decorations.mapToData],
				[decorations.mapToData]: void 0
			});
			return requestWithDefaults(options);
		}
		if (decorations.renamed) {
			const [newScope, newMethodName] = decorations.renamed;
			octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
		}
		if (decorations.deprecated) octokit.log.warn(decorations.deprecated);
		if (decorations.renamedParameters) {
			const options2 = requestWithDefaults.endpoint.merge(...args);
			for (const [name, alias] of Object.entries(decorations.renamedParameters)) if (name in options2) {
				octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);
				if (!(alias in options2)) options2[alias] = options2[name];
				delete options2[name];
			}
			return requestWithDefaults(options2);
		}
		return requestWithDefaults(...args);
	}
	return Object.assign(withDecorations, requestWithDefaults);
}
//#endregion
//#region node_modules/@octokit/plugin-rest-endpoint-methods/dist-src/index.js
function restEndpointMethods(octokit) {
	return { rest: endpointsToMethods(octokit) };
}
restEndpointMethods.VERSION = VERSION;
function legacyRestEndpointMethods(octokit) {
	const api = endpointsToMethods(octokit);
	return {
		...api,
		rest: api
	};
}
legacyRestEndpointMethods.VERSION = VERSION;
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