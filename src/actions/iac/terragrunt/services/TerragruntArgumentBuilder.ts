import {
  AUTO_APPROVE_COMMANDS,
  TARGET_COMMANDS,
  TerraformCommand,
  VARIABLE_COMMANDS,
} from '../../terraform/interfaces';
import { ITerragruntProvider, TerragruntCommand } from '../interfaces';

/**
 * Builds command-line arguments for Terragrunt commands
 * Extends Terraform argument building with Terragrunt-specific options
 */
export class TerragruntArgumentBuilder {
  constructor(private readonly provider: ITerragruntProvider) {}

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
      return [
        this.provider.executor,
        'run-all',
        command,
        ...this.toCommandArgs(),
      ];
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
    if (
      this.provider.runAll &&
      this.provider.terragruntParallelism !== undefined
    ) {
      args.push(
        '--terragrunt-parallelism',
        String(this.provider.terragruntParallelism)
      );
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
      args.push(
        '--terragrunt-iam-role-session-name',
        this.provider.iamRoleSessionName
      );
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

    // Add init-specific arguments
    this.addInitArguments(args, command as TerraformCommand);

    // Add variable arguments
    this.addVariableArguments(args, command as TerraformCommand);

    // Add target arguments
    this.addTargetArguments(args, command as TerraformCommand);

    // Add plan arguments
    this.addPlanArguments(args, command as TerraformCommand);

    // Add apply/destroy arguments
    this.addApplyArguments(args, command as TerraformCommand);

    // Add common arguments
    this.addCommonArguments(args);
  }

  /**
   * Add init-specific arguments
   */
  private addInitArguments(args: string[], command: TerraformCommand): void {
    if (command !== 'init') return;

    // Backend configuration
    for (const [key, value] of this.provider.backendConfig.entries()) {
      args.push('-backend-config', `${key}=${value}`);
    }

    // Reconfigure flag
    if (this.provider.reconfigure) {
      args.push('-reconfigure');
    }

    // Migrate state flag
    if (this.provider.migrateState) {
      args.push('-migrate-state');
    }
  }

  /**
   * Add variable-related arguments
   */
  private addVariableArguments(args: string[], command: TerraformCommand): void {
    if (!this.supportsVariables(command)) return;

    // Variable files
    for (const varFile of this.provider.varFiles) {
      args.push('-var-file', varFile);
    }

    // Individual variables
    for (const [key, value] of this.provider.variables.entries()) {
      args.push('-var', `${key}=${value}`);
    }
  }

  /**
   * Add target-related arguments
   */
  private addTargetArguments(args: string[], command: TerraformCommand): void {
    if (!this.supportsTargets(command)) return;

    for (const target of this.provider.targets) {
      args.push('-target', target);
    }
  }

  /**
   * Add plan-specific arguments
   */
  private addPlanArguments(args: string[], command: TerraformCommand): void {
    if (command !== 'plan') return;

    // Output file
    if (this.provider.outFile) {
      args.push('-out', this.provider.outFile);
    }

    // Refresh control
    if (!this.provider.refresh) {
      args.push('-refresh=false');
    }
  }

  /**
   * Add apply/destroy-specific arguments
   */
  private addApplyArguments(args: string[], command: TerraformCommand): void {
    if (!this.supportsAutoApprove(command)) return;

    // Auto-approve flag
    if (this.provider.autoApprove) {
      args.push('-auto-approve');
    }

    // Refresh control
    if (command === 'apply' || command === 'destroy') {
      if (!this.provider.refresh) {
        args.push('-refresh=false');
      }
    }
  }

  /**
   * Add common arguments
   */
  private addCommonArguments(args: string[]): void {
    // Parallelism (terraform's parallelism, not terragrunt's)
    if (this.provider.parallelism !== undefined) {
      args.push('-parallelism', String(this.provider.parallelism));
    }

    // Lock timeout
    if (this.provider.lockTimeout) {
      args.push('-lock-timeout', this.provider.lockTimeout);
    }

    // No color output
    if (this.provider.noColor) {
      args.push('-no-color');
    }

    // Compact warnings
    if (this.provider.compactWarnings) {
      args.push('-compact-warnings');
    }

    // Plan file for apply command
    if (this.provider.command === 'apply' && this.provider.planFile) {
      args.push(this.provider.planFile);
    }
  }

  /**
   * Check if command is a terraform command
   */
  private isTerraformCommand(command: TerragruntCommand): boolean {
    const terraformCommands: TerraformCommand[] = [
      'init',
      'validate',
      'fmt',
      'plan',
      'apply',
      'destroy',
      'output',
      'show',
      'state',
      'import',
      'refresh',
      'taint',
      'untaint',
      'workspace',
    ];
    return terraformCommands.includes(command as TerraformCommand);
  }

  /**
   * Check if command supports variables
   */
  private supportsVariables(command: TerraformCommand): boolean {
    return VARIABLE_COMMANDS.includes(command);
  }

  /**
   * Check if command supports targets
   */
  private supportsTargets(command: TerraformCommand): boolean {
    return TARGET_COMMANDS.includes(command);
  }

  /**
   * Check if command supports auto-approve
   */
  private supportsAutoApprove(command: TerraformCommand): boolean {
    return AUTO_APPROVE_COMMANDS.includes(command);
  }
}
