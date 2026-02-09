import { BaseIacArgumentBuilder } from '../../common/services/BaseIacArgumentBuilder';
import { TerraformCommand, TERRAFORM_COMMANDS } from '../../terraform/interfaces';
import { ITerragruntProvider, TerragruntCommand } from '../interfaces';
import { TERRAGRUNT_COMMAND_MAP, REMOVED_V1_COMMANDS, selectFlag } from './TerragruntFlagMapping';

/**
 * Builds command-line arguments for Terragrunt commands.
 * Extends BaseIacArgumentBuilder with Terragrunt-specific global arguments.
 *
 * Version-aware: uses `provider.terragruntMajorVersion` to emit the correct
 * flag format (v0.x `--terragrunt-*` or v1.x short flags) and to translate
 * commands that were renamed in the CLI redesign.
 */
export class TerragruntArgumentBuilder extends BaseIacArgumentBuilder {
  protected override readonly provider: ITerragruntProvider;

  constructor(provider: ITerragruntProvider) {
    super(provider);
    this.provider = provider;
  }

  /**
   * Generate command arguments based on provider configuration
   * @returns Array of command-line arguments
   */
  toCommandArgs(): string[] {
    const args: string[] = [];

    // Add terragrunt-specific arguments first
    this.addTerragruntGlobalArgs(args);

    // Add terraform command arguments
    this.addTerraformArgs(args);

    return args;
  }

  /**
   * Generate full command array including executor and command.
   *
   * Handles version-aware command translation:
   * - run-all: v0.x `run-all <cmd>` → v1.x `run --all <cmd>`
   * - Renamed commands: v0.x `hclfmt` → v1.x `hcl fmt`, etc.
   * - Removed commands: throws an error with a clear message
   *
   * @returns Full command array ready for execution
   */
  buildCommand(): string[] {
    const command = this.provider.command;
    const isV1 = this.provider.terragruntMajorVersion >= 1;
    const args = this.toCommandArgs();

    // Handle run-all mode for terraform commands
    if (this.provider.runAll && this.isTerraformCommand(command)) {
      if (isV1) {
        // v1.x: terragrunt run --all <terraform-command> [args]
        return [this.provider.executor, 'run', '--all', command, ...args];
      }
      // v0.x: terragrunt run-all <terraform-command> [args]
      return [this.provider.executor, 'run-all', command, ...args];
    }

    // Handle removed commands in v1.x
    if (isV1 && REMOVED_V1_COMMANDS.includes(command)) {
      throw new Error(`Command '${command}' was removed in Terragrunt v1.x and has no equivalent.`);
    }

    // Handle terragrunt-native commands that were renamed in v1.x
    if (isV1 && command in TERRAGRUNT_COMMAND_MAP) {
      const v1Tokens = TERRAGRUNT_COMMAND_MAP[command]!;
      return [this.provider.executor, ...v1Tokens, ...args];
    }

    // Standard command (same in both versions)
    return [this.provider.executor, command, ...args];
  }

  /**
   * Add terragrunt-specific global arguments.
   * Uses selectFlag() to emit the correct flag format for the detected version.
   */
  private addTerragruntGlobalArgs(args: string[]): void {
    const v = this.provider.terragruntMajorVersion;

    // Config file
    if (this.provider.terragruntConfig) {
      args.push(selectFlag('config', v), this.provider.terragruntConfig);
    }

    // Working directory
    if (this.provider.terragruntWorkingDir) {
      args.push(selectFlag('workingDir', v), this.provider.terragruntWorkingDir);
    }

    // Auto-init control
    if (this.provider.noAutoInit) {
      args.push(selectFlag('noAutoInit', v));
    }

    // Auto-retry control
    if (this.provider.noAutoRetry) {
      args.push(selectFlag('noAutoRetry', v));
    }

    // Non-interactive mode
    if (this.provider.nonInteractive) {
      args.push(selectFlag('nonInteractive', v));
    }

    // Parallelism for run-all
    if (this.provider.runAll && this.provider.terragruntParallelism !== undefined) {
      args.push(selectFlag('parallelism', v), String(this.provider.terragruntParallelism));
    }

    // Include directories
    for (const dir of this.provider.includeDirs) {
      args.push(selectFlag('includeDir', v), dir);
    }

    // Exclude directories
    for (const dir of this.provider.excludeDirs) {
      args.push(selectFlag('excludeDir', v), dir);
    }

    // Dependency handling
    if (this.provider.ignoreDependencyErrors) {
      args.push(selectFlag('ignoreDependencyErrors', v));
    }

    if (this.provider.ignoreExternalDependencies) {
      args.push(selectFlag('ignoreExternalDeps', v));
    }

    if (this.provider.includeExternalDependencies) {
      args.push(selectFlag('includeExternalDeps', v));
    }

    // Source override
    if (this.provider.terragruntSource) {
      args.push(selectFlag('source', v), this.provider.terragruntSource);
    }

    // Source map
    for (const [original, newSource] of this.provider.sourceMap.entries()) {
      args.push(selectFlag('sourceMap', v), `${original}=${newSource}`);
    }

    // Download directory
    if (this.provider.downloadDir) {
      args.push(selectFlag('downloadDir', v), this.provider.downloadDir);
    }

    // IAM role
    if (this.provider.iamRole) {
      args.push(selectFlag('iamRole', v), this.provider.iamRole);
    }

    if (this.provider.iamRoleSessionName) {
      args.push(selectFlag('iamRoleSessionName', v), this.provider.iamRoleSessionName);
    }

    // Strict include
    if (this.provider.strictInclude) {
      args.push(selectFlag('strictInclude', v));
    }
  }

  /**
   * Add terraform-related arguments
   */
  private addTerraformArgs(args: string[]): void {
    const command = this.provider.command;

    // Only add terraform args for terraform commands
    if (!this.isTerraformCommand(command)) {
      return;
    }

    this.addAllSharedArguments(args, command as TerraformCommand);
  }

  /**
   * Check if command is a terraform command
   */
  private isTerraformCommand(command: TerragruntCommand): boolean {
    return TERRAFORM_COMMANDS.includes(command as TerraformCommand);
  }
}
