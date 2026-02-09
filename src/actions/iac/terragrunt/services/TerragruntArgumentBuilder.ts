import { BaseIacArgumentBuilder } from '../../common/services/BaseIacArgumentBuilder';
import { TerraformCommand, TERRAFORM_COMMANDS } from '../../terraform/interfaces';
import { ITerragruntProvider, TerragruntCommand } from '../interfaces';

/**
 * Builds command-line arguments for Terragrunt commands
 * Extends BaseIacArgumentBuilder with Terragrunt-specific global arguments
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
   * Generate full command array including executor and command
   * @returns Full command array ready for execution
   */
  buildCommand(): string[] {
    const command = this.provider.command;

    // For run-all, the format is: terragrunt run-all <terraform-command>
    if (this.provider.runAll && this.isTerraformCommand(command)) {
      return [this.provider.executor, 'run-all', command, ...this.toCommandArgs()];
    }

    return [this.provider.executor, command, ...this.toCommandArgs()];
  }

  /**
   * Add terragrunt-specific global arguments
   */
  private addTerragruntGlobalArgs(args: string[]): void {
    // Config file
    if (this.provider.terragruntConfig) {
      args.push('--terragrunt-config', this.provider.terragruntConfig);
    }

    // Working directory
    if (this.provider.terragruntWorkingDir) {
      args.push('--terragrunt-working-dir', this.provider.terragruntWorkingDir);
    }

    // Auto-init control
    if (this.provider.noAutoInit) {
      args.push('--terragrunt-no-auto-init');
    }

    // Auto-retry control
    if (this.provider.noAutoRetry) {
      args.push('--terragrunt-no-auto-retry');
    }

    // Non-interactive mode
    if (this.provider.nonInteractive) {
      args.push('--terragrunt-non-interactive');
    }

    // Parallelism for run-all
    if (this.provider.runAll && this.provider.terragruntParallelism !== undefined) {
      args.push('--terragrunt-parallelism', String(this.provider.terragruntParallelism));
    }

    // Include directories
    for (const dir of this.provider.includeDirs) {
      args.push('--terragrunt-include-dir', dir);
    }

    // Exclude directories
    for (const dir of this.provider.excludeDirs) {
      args.push('--terragrunt-exclude-dir', dir);
    }

    // Dependency handling
    if (this.provider.ignoreDependencyErrors) {
      args.push('--terragrunt-ignore-dependency-errors');
    }

    if (this.provider.ignoreExternalDependencies) {
      args.push('--terragrunt-ignore-external-dependencies');
    }

    if (this.provider.includeExternalDependencies) {
      args.push('--terragrunt-include-external-dependencies');
    }

    // Source override
    if (this.provider.terragruntSource) {
      args.push('--terragrunt-source', this.provider.terragruntSource);
    }

    // Source map
    for (const [original, newSource] of this.provider.sourceMap.entries()) {
      args.push('--terragrunt-source-map', `${original}=${newSource}`);
    }

    // Download directory
    if (this.provider.downloadDir) {
      args.push('--terragrunt-download-dir', this.provider.downloadDir);
    }

    // IAM role
    if (this.provider.iamRole) {
      args.push('--terragrunt-iam-role', this.provider.iamRole);
    }

    if (this.provider.iamRoleSessionName) {
      args.push('--terragrunt-iam-role-session-name', this.provider.iamRoleSessionName);
    }

    // Strict include
    if (this.provider.strictInclude) {
      args.push('--terragrunt-strict-include');
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
