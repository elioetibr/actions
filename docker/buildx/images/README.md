# Docker BuildX ImageTools Manifest Creator

Creates multi-architecture Docker image manifests using Docker BuildX ImageTools.

## Inputs

| Name                      | Description                                 | Required | Default |
|---------------------------|---------------------------------------------|----------|---------|
| `ecrRegistry`             | ECR registry name                           | Yes      | N/A     |
| `ecrRepository`           | ECR repository name                         | Yes      | N/A     |
| `amd64MetaTags`           | AMD64 image tags to include in the manifest | Yes      | N/A     |
| `arm64MetaTags`           | ARM64 image tags to include in the manifest | Yes      | N/A     |
| `manifestMetaTags`        | Image tags for the manifest                 | Yes      | N/A     |
| `manifestMetaAnnotations` | Image annotations for the manifest          | Yes      | N/A     |
| `semVer`                  | Semantic version for the final image        | Yes      | N/A     |
| `dryRun`                  | Dry Run Mode                                | No       | `false` |

## Outputs

| Name                     | Description                                        |
|--------------------------|----------------------------------------------------|
| `amd64MetaTags`          | AMD64 image tags used in the manifest              |
| `archTags`               | Architecture-specific tags for the images           |
| `arm64MetaTags`          | ARM64 image tags used in the manifest              |
| `buildXArgs`             | Arguments passed to Docker BuildX                  |
| `dryRun`                 | Indicates if action was executed in dry run mode   |
| `ecrRegistry`            | ECR registry name used for the images              |
| `ecrRepository`          | ECR repository name used for the images            |
| `fullVersion`            | Complete semantic version with any suffix           |
| `imageUri`               | Complete URI of the created image                  |
| `inspectArgsDefault`     | Default arguments for image inspection             |
| `major`                  | Major version number from semantic version         |
| `manifestMetaAnnotations`| Annotations applied to the manifest                |
| `manifestMetaTags`       | Tags applied to the manifest                       |
| `metaAnnotations`        | Processed annotations for the manifest             |
| `metaTags`               | Processed tags for the manifest                    |
| `minor`                  | Minor version number from semantic version         |
| `patch`                  | Patch version number from semantic version         |
| `version`                | Semantic version without suffix                    |
| `versionSuffix`          | Suffix portion of the semantic version if present  |

## Usage Examples

### Basic Multi-Arch Manifest Creation

```yaml
name: Create Multi-Arch Manifest

on:
  workflow_dispatch:
    inputs:
      semVer:
        description: 'Semantic Version'
        required: true

permissions:
  id-token: write
  contents: read

jobs:
  manifest:
    name: Create Docker Manifest
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Create Multi-Arch Manifest
        id: manifest
        uses: elioetibr/actions/docker/buildx/images@v1
        with:
          ecrRegistry: ${{ steps.ecr-login.outputs.registry }}
          ecrRepository: my-app
          amd64MetaTags: |
            my-app:1.0.0-amd64
            my-app:latest-amd64
          arm64MetaTags: |
            my-app:1.0.0-arm64
            my-app:latest-arm64
          manifestMetaTags: |
            my-app:1.0.0
            my-app:latest
          manifestMetaAnnotations: |
            org.opencontainers.image.title=my-app
            org.opencontainers.image.version=1.0.0
          semVer: ${{ github.event.inputs.semVer }}

      - name: Show Outputs
        run: |
          echo "Image URI: ${{ steps.manifest.outputs.imageUri }}"
          echo "Version: ${{ steps.manifest.outputs.version }}"
          echo "Full Version: ${{ steps.manifest.outputs.fullVersion }}"
```

### Dry Run Mode

Use dry run mode to preview the manifest creation command without executing it.

```yaml
- name: Preview Manifest Creation
  id: preview
  uses: elioetibr/actions/docker/buildx/images@v1
  with:
    ecrRegistry: 123456789.dkr.ecr.us-east-1.amazonaws.com
    ecrRepository: my-app
    amd64MetaTags: |
      my-app:1.0.0-amd64
    arm64MetaTags: |
      my-app:1.0.0-arm64
    manifestMetaTags: |
      my-app:1.0.0
    manifestMetaAnnotations: |
      org.opencontainers.image.title=my-app
    semVer: '1.0.0'
    dryRun: 'true'

- name: Show Preview
  run: |
    echo "BuildX Args: ${{ steps.preview.outputs.buildXArgs }}"
    echo "Dry Run: ${{ steps.preview.outputs.dryRun }}"
```

## Builder API

For TypeScript library consumers, the package exposes a builder pattern and factory for programmatic use.

### DockerBuildXImageToolsBuilder

Use the builder for full control over command construction with method chaining.

```typescript
import { DockerBuildXImageToolsBuilder } from 'elioetibr-actions/actions/docker/buildx/images';

// Create a multi-platform manifest
const service = DockerBuildXImageToolsBuilder.forCreate()
  .withTag('myapp:latest')
  .withSources(['myapp:linux-amd64', 'myapp:linux-arm64'])
  .withAnnotations({
    'org.opencontainers.image.title': 'My Application',
    'org.opencontainers.image.description': 'A multi-platform application',
  })
  .build();

console.log(service.toString());
console.log(service.toStringMultiLineCommand());
```

```typescript
// Inspect an image
const inspector = DockerBuildXImageToolsBuilder.forInspect()
  .withSource('nginx:latest')
  .withVerbose()
  .build();

console.log(inspector.toString());
```

```typescript
// Dry run creation
const dryRun = DockerBuildXImageToolsBuilder.forCreate()
  .withTag('test:latest')
  .withSource('test:base')
  .withDryRun()
  .build();

console.log(dryRun.toString());
```

### DockerBuildXImageToolsFactory

Use the factory for common operations with a simplified API.

```typescript
import { DockerBuildXImageToolsFactory } from 'elioetibr-actions/actions/docker/buildx/images';

// Create a manifest from source images
const manifest = DockerBuildXImageToolsFactory.createManifest(
  'myapp:latest',
  ['myapp:amd64', 'myapp:arm64']
);
console.log(manifest.toString());

// Inspect an image
const inspection = DockerBuildXImageToolsFactory.inspectImage('nginx:latest');
console.log(inspection.toString());

// Prune build cache
const prune = DockerBuildXImageToolsFactory.pruneCache();
console.log(prune.toString());

// Get a builder instance for custom configuration
const custom = DockerBuildXImageToolsFactory.builder('create')
  .withTag('myapp:v1.0.0')
  .withSources(['myapp:amd64', 'myapp:arm64'])
  .withMetaData({
    '--annotation': ['index:org.opencontainers.image.version=1.0.0'],
    '--file': ['manifest.yaml'],
  })
  .withPlatforms(['linux/amd64', 'linux/arm64'])
  .build();

console.log(custom.toString());
```

## Builder Methods

| Method                                  | Description                                          |
|-----------------------------------------|------------------------------------------------------|
| `withCommand(command)`                  | Set the main command (`create`, `inspect`, `prune`)  |
| `withStringListOutput(useStringList)`   | Enable or disable string list output format          |
| `addMetaData(key, value)`               | Add a single metadata entry                          |
| `setMetaData(key, values)`              | Set metadata for a key, replacing existing values    |
| `withMetaData(metadata)`                | Add multiple metadata entries from an object         |
| `withTag(tag)`                          | Add a tag to the command                             |
| `withTags(tags)`                        | Add multiple tags                                    |
| `withFile(file)`                        | Add a file reference                                 |
| `withOutput(output)`                    | Add an output specification                          |
| `withPlatform(platform)`               | Add a platform specification                         |
| `withPlatforms(platforms)`              | Add multiple platform specifications                 |
| `withAnnotation(key, value)`            | Add a single annotation                              |
| `withAnnotations(annotations)`          | Add multiple annotations from an object              |
| `withSource(source)`                    | Add a source image                                   |
| `withSources(sources)`                  | Add multiple source images                           |
| `withDryRun()`                          | Enable dry-run mode                                  |
| `withVerbose()`                         | Enable verbose output                                |
| `reset()`                               | Reset the builder to its initial state               |
| `build()`                               | Build and return the configured service instance     |

### Static Factory Methods

| Method                                         | Description                                     |
|------------------------------------------------|-------------------------------------------------|
| `DockerBuildXImageToolsBuilder.create(command)` | Create a new builder with an optional command   |
| `DockerBuildXImageToolsBuilder.forCreate()`     | Create a builder pre-configured for `create`    |
| `DockerBuildXImageToolsBuilder.forInspect()`    | Create a builder pre-configured for `inspect`   |
| `DockerBuildXImageToolsBuilder.forPrune()`      | Create a builder pre-configured for `prune`     |
