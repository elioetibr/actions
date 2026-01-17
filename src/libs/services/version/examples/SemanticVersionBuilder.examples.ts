// noinspection JSUnusedGlobalSymbols

import { SemanticVersionBuilder } from '../builders';
import { IEnhancedSemanticVersionProvider } from '../providers';

const service = SemanticVersionBuilder.fromVersion('1.2.3-alpha.1').build();
const semVerInfo = service.semVerInfo;

// All properties available directly on semVerInfo
console.log(semVerInfo.major); // "1"
console.log(semVerInfo.minor); // "2"
console.log(semVerInfo.patch); // "3"
console.log(semVerInfo.semVerSuffix); // "-alpha.1"
console.log(semVerInfo.version); // "1.2.3"
console.log(semVerInfo.semVer); // "1.2.3-alpha.1"

// Example 2: Fluent comparison methods
const version1 = SemanticVersionBuilder.fromVersion('2.1.0').build().semVerInfo;
const version2 = SemanticVersionBuilder.fromVersion('1.9.5').build().semVerInfo;

console.log(version1.isGreaterThan(version2)); // true
console.log(version1.isGreaterThan('1.5.0')); // true (can compare with string)
console.log(version1.isCompatibleWith('2.0.0')); // true (same major version)
console.log(version1.isEqualTo('2.1.0')); // true

// Example 3: Fluent version manipulation
const baseVersion = SemanticVersionBuilder.fromVersion('1.0.0').build().semVerInfo;

const majorIncrement = baseVersion.incrementMajor(); // "2.0.0"
const minorIncrement = baseVersion.incrementMinor(); // "1.1.0"
const patchIncrement = baseVersion.incrementPatch(); // "1.0.1"

console.log(majorIncrement.semVer); // "2.0.0"
console.log(minorIncrement.semVer); // "1.1.0"
console.log(patchIncrement.semVer); // "1.0.1"

// Example 4: Working with suffixes
const releaseVersion = SemanticVersionBuilder.fromVersion('1.0.0').build().semVerInfo;

const alphaVersion = releaseVersion.withSuffix('alpha.1'); // "1.0.0-alpha.1"
const betaVersion = releaseVersion.withSuffix('-beta.2'); // "1.0.0-beta.2"
const buildVersion = releaseVersion.withSuffix('+build.123'); // "1.0.0+build.123"

console.log(alphaVersion.semVer); // "1.0.0-alpha.1"
console.log(betaVersion.semVer); // "1.0.0-beta.2"
console.log(buildVersion.semVer); // "1.0.0+build.123"

// Remove suffix
const cleanVersion = alphaVersion.withoutSuffix(); // "1.0.0"
console.log(cleanVersion.semVer); // "1.0.0"

// Example 5: Utility methods for version analysis
const prereleaseVersion =
  SemanticVersionBuilder.fromVersion('2.0.0-rc.1+build.456').build().semVerInfo;

console.log(prereleaseVersion.isPrerelease()); // true
console.log(prereleaseVersion.hasBuildMetadata()); // true

const stableVersion = SemanticVersionBuilder.fromVersion('2.0.0').build().semVerInfo;

console.log(stableVersion.isPrerelease()); // false
console.log(stableVersion.hasBuildMetadata()); // false

// Example 6: Chain operations for complex version management
const complexVersion = SemanticVersionBuilder.fromVersion('1.0.0')
  .build()
  .semVerInfo.incrementMinor() // "1.1.0"
  .incrementPatch() // "1.1.1"
  .withSuffix('beta.1'); // "1.1.1-beta.1"

console.log(complexVersion.semVer); // "1.1.1-beta.1"

// Example 7: Version comparison workflows
function checkVersionCompatibility(currentVersion: string, requiredVersion: string): string {
  const current = SemanticVersionBuilder.fromVersion(currentVersion).build().semVerInfo;
  const required = SemanticVersionBuilder.fromVersion(requiredVersion).build().semVerInfo;

  if (current.isGreaterThan(required)) {
    return `✅ Current version ${current.semVer} is newer than required ${required.semVer}`;
  } else if (current.isCompatibleWith(required)) {
    return `⚠️  Current version ${current.semVer} is compatible with ${required.semVer}`;
  } else {
    return `❌ Current version ${current.semVer} is incompatible with ${required.semVer}`;
  }
}

console.log(checkVersionCompatibility('2.1.0', '2.0.5'));
console.log(checkVersionCompatibility('1.9.0', '2.0.0'));

// Example 8: JSON serialization and easy debugging
const versionForApi = SemanticVersionBuilder.fromVersion('3.2.1-rc.1+build.789').build().semVerInfo;

// Easy serialization
const jsonVersion = versionForApi.toJSON();
console.log(JSON.stringify(jsonVersion, null, 2));

// String representation
console.log(`Version: ${versionForApi}`); // Uses toString() automatically

// Example 9: Simplified service implementation using semVerInfo delegation
class ApiVersionService {
  private versionInfo: IEnhancedSemanticVersionProvider;

  constructor(version: string) {
    this.versionInfo = SemanticVersionBuilder.fromVersion(version).build().semVerInfo;
  }

  // Delegate everything to semVerInfo - much cleaner implementation!
  get major() {
    return this.versionInfo.major;
  }

  get minor() {
    return this.versionInfo.minor;
  }

  get patch() {
    return this.versionInfo.patch;
  }

  get version() {
    return this.versionInfo.version;
  }

  get semVer() {
    return this.versionInfo.semVer;
  }

  // Business logic methods can use semVerInfo fluent methods
  isBreakingChangeFrom(otherVersion: string): boolean {
    const other = SemanticVersionBuilder.fromVersion(otherVersion).build().semVerInfo;
    return +this.versionInfo.major > +other.major;
  }

  getNextPatchVersion(): string {
    return this.versionInfo.incrementPatch().semVer;
  }

  getNextMinorVersion(): string {
    return this.versionInfo.incrementMinor().semVer;
  }

  getNextMajorVersion(): string {
    return this.versionInfo.incrementMajor().semVer;
  }
}

// Usage of simplified service
const apiService = new ApiVersionService('2.1.0');
console.log(apiService.getNextMinorVersion()); // "2.2.0"
console.log(apiService.isBreakingChangeFrom('1.5.0')); // true

// Example 10: Batch version operations
const versions = ['1.0.0', '1.2.0', '2.0.0-alpha', '2.1.0', '1.1.5'];

const parsedVersions = versions
  .map(v => SemanticVersionBuilder.fromVersion(v).build().semVerInfo)
  .sort((a, b) => {
    if (a.isGreaterThan(b)) return 1;
    if (a.isLessThan(b)) return -1;
    return 0;
  });

console.log('Sorted versions:');
parsedVersions.forEach(v => console.log(v.semVer));

// Find latest stable version (no prerelease)
const latestStable = parsedVersions.filter(v => !v.isPrerelease()).pop();

console.log('Latest stable:', latestStable?.semVer);

// export {
//   SemanticVersionBuilder,
//   SemanticVersionInfo,
//   IEnhancedSemanticVersionProvider,
//   ApiVersionService,
//   checkVersionCompatibility
// };
