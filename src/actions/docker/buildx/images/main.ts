import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { DockerBuildXImageToolsBuilder } from './DockerBuildXImageToolsBuilder';
import { SemanticVersionBuilder } from '../../../../libs/services/version/builders';
import { catchErrorAndSetFailed, parseFormattedString } from '../../../../libs/utils';

/**
 * Main action runner for Docker BuildX ImageTools Manifest Creator.
 *
 * Note: This action uses @actions/exec which is the standard GitHub Actions
 * toolkit for command execution. It uses execFile internally (not shell exec)
 * and receives pre-validated arguments from the builder pattern, making it
 * safe from command injection.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const ecrRegistry = core.getInput('ecrRegistry', { required: true });
    const ecrRepository = core.getInput('ecrRepository', { required: true });
    const amd64MetaTagsInput = core.getInput('amd64MetaTags', { required: true });
    const arm64MetaTagsInput = core.getInput('arm64MetaTags', { required: true });
    const manifestMetaTagsInput = core.getInput('manifestMetaTags', { required: true });
    const manifestMetaAnnotationsInput = core.getInput('manifestMetaAnnotations', {
      required: true,
    });
    const semVerInput = core.getInput('semVer', { required: true });
    const dryRun = core.getBooleanInput('dryRun');

    core.info('Starting Docker BuildX ImageTools Manifest Creator...');

    // Parse semantic version
    const semVerService = SemanticVersionBuilder.fromVersion(semVerInput).build();
    const semVerInfo = semVerService.semVerInfo;

    // Parse tags from formatted input
    const amd64MetaTags = await parseFormattedString(amd64MetaTagsInput);
    const arm64MetaTags = await parseFormattedString(arm64MetaTagsInput);
    const manifestMetaTags = await parseFormattedString(manifestMetaTagsInput);
    const manifestMetaAnnotations = await parseFormattedString(manifestMetaAnnotationsInput);

    // Build image URI
    const imageUri = `${ecrRegistry}/${ecrRepository}:${semVerInfo.semVer}`;

    // Build architecture-specific source images
    const archSources = [
      ...amd64MetaTags.map(tag => `${ecrRegistry}/${ecrRepository}:${tag}`),
      ...arm64MetaTags.map(tag => `${ecrRegistry}/${ecrRepository}:${tag}`),
    ];

    // Build manifest tags (fully qualified)
    const fullManifestTags = manifestMetaTags.map(tag => `${ecrRegistry}/${ecrRepository}:${tag}`);

    // Build annotations record
    const annotationsRecord: Record<string, string> = {};
    for (const annotation of manifestMetaAnnotations) {
      const separatorIndex = annotation.indexOf('=');
      if (separatorIndex > 0) {
        const key = annotation.substring(0, separatorIndex);
        const value = annotation.substring(separatorIndex + 1);
        annotationsRecord[key] = value;
      }
    }

    // Build the create command
    const createBuilder = DockerBuildXImageToolsBuilder.forCreate()
      .withTags(fullManifestTags)
      .withSources(archSources);

    if (Object.keys(annotationsRecord).length > 0) {
      createBuilder.withAnnotations(annotationsRecord);
    }

    const createService = createBuilder.build();
    const createCommand = createService.buildCommand();
    const createCommandString = createService.toString();

    // Build the inspect command
    const inspectService = DockerBuildXImageToolsBuilder.forInspect().withSource(imageUri).build();
    const inspectCommand = inspectService.buildCommand();

    core.info(`Create command: ${createCommandString}`);

    // Set outputs - version info
    core.setOutput('major', semVerInfo.major);
    core.setOutput('minor', semVerInfo.minor);
    core.setOutput('patch', semVerInfo.patch);
    core.setOutput('version', semVerInfo.version);
    core.setOutput('fullVersion', semVerInfo.semVer);
    core.setOutput('versionSuffix', semVerInfo.semVerSuffix);

    // Set outputs - registry info
    core.setOutput('ecrRegistry', ecrRegistry);
    core.setOutput('ecrRepository', ecrRepository);
    core.setOutput('imageUri', imageUri);

    // Set outputs - tags
    core.setOutput('amd64MetaTags', JSON.stringify(amd64MetaTags));
    core.setOutput('arm64MetaTags', JSON.stringify(arm64MetaTags));
    core.setOutput('archTags', JSON.stringify([...amd64MetaTags, ...arm64MetaTags]));
    core.setOutput('manifestMetaTags', JSON.stringify(manifestMetaTags));
    core.setOutput('metaTags', JSON.stringify(fullManifestTags));
    core.setOutput('manifestMetaAnnotations', JSON.stringify(manifestMetaAnnotations));
    core.setOutput('metaAnnotations', JSON.stringify(annotationsRecord));

    // Set outputs - commands
    core.setOutput('buildXArgs', JSON.stringify(createCommand));
    core.setOutput('inspectArgsDefault', JSON.stringify(inspectCommand));
    core.setOutput('dryRun', dryRun.toString());

    // Execute if not dry run
    if (dryRun) {
      core.info('Dry run mode - skipping execution');
    } else {
      core.info('Creating multi-architecture manifest...');

      // @actions/exec uses execFile internally (not shell), and arguments
      // come from the validated builder pattern - safe from injection
      const exitCode = await exec(createCommand[0]!, createCommand.slice(1), {
        ignoreReturnCode: true,
      });

      if (exitCode !== 0) {
        core.setFailed(`Docker BuildX ImageTools create failed with exit code ${exitCode}`);
        return;
      }

      core.info('Manifest created successfully. Inspecting...');
      await exec(inspectCommand[0]!, inspectCommand.slice(1), {
        ignoreReturnCode: true,
      });
    }
  } catch (error) {
    catchErrorAndSetFailed(error);
  }
}
