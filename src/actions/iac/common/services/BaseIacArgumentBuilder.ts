import {
  AUTO_APPROVE_COMMANDS,
  IIacProvider,
  TARGET_COMMANDS,
  VARIABLE_COMMANDS,
} from '../interfaces';
import { TerraformCommand } from '../../terraform/interfaces/ITerraformProvider';

/**
 * Base argument builder for IaC commands
 * Contains shared argument building logic for Terraform-compatible commands
 */
export abstract class BaseIacArgumentBuilder {
  constructor(protected readonly provider: IIacProvider) {}

  /**
   * Generate command arguments based on provider configuration
   * @returns Array of command-line arguments
   */
  abstract toCommandArgs(): string[];

  /**
   * Generate full command array including executor and command
   * @returns Full command array ready for execution
   */
  abstract buildCommand(): string[];

  /**
   * Add all shared Terraform arguments in sequence
   * Subclasses call this to add the standard terraform argument set
   */
  protected addAllSharedArguments(args: string[], command: TerraformCommand): void {
    this.addInitArguments(args, command);
    this.addVariableArguments(args, command);
    this.addTargetArguments(args, command);
    this.addPlanArguments(args, command);
    this.addApplyArguments(args, command);
    this.addCommonArguments(args);
  }

  /**
   * Add init-specific arguments
   */
  protected addInitArguments(args: string[], command: TerraformCommand): void {
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
   * Add variable-related arguments (-var, -var-file)
   */
  protected addVariableArguments(args: string[], command: TerraformCommand): void {
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
   * Add target-related arguments (-target)
   */
  protected addTargetArguments(args: string[], command: TerraformCommand): void {
    if (!this.supportsTargets(command)) return;

    for (const target of this.provider.targets) {
      args.push('-target', target);
    }
  }

  /**
   * Add plan-specific arguments
   */
  protected addPlanArguments(args: string[], command: TerraformCommand): void {
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
  protected addApplyArguments(args: string[], command: TerraformCommand): void {
    if (!this.supportsAutoApprove(command)) return;

    // Auto-approve flag
    if (this.provider.autoApprove) {
      args.push('-auto-approve');
    }

    // Refresh control (for apply/destroy)
    if (command === 'apply' || command === 'destroy') {
      if (!this.provider.refresh) {
        args.push('-refresh=false');
      }
    }

    // Plan file for apply (must be last argument, no flag)
    if (command === 'apply' && this.provider.planFile) {
      // Plan file is added in addCommonArguments as positional arg
    }
  }

  /**
   * Add common arguments applicable to multiple commands
   */
  protected addCommonArguments(args: string[]): void {
    // Parallelism
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

    // Plan file for apply command (must be positional, not a flag)
    if (this.provider.command === 'apply' && this.provider.planFile) {
      args.push(this.provider.planFile);
    }
  }

  /**
   * Check if command supports -var and -var-file flags
   */
  protected supportsVariables(command: TerraformCommand): boolean {
    return VARIABLE_COMMANDS.includes(command);
  }

  /**
   * Check if command supports -target flag
   */
  protected supportsTargets(command: TerraformCommand): boolean {
    return TARGET_COMMANDS.includes(command);
  }

  /**
   * Check if command supports -auto-approve flag
   */
  protected supportsAutoApprove(command: TerraformCommand): boolean {
    return AUTO_APPROVE_COMMANDS.includes(command);
  }
}
