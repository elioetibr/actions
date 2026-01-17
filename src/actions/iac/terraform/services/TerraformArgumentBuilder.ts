import {
  AUTO_APPROVE_COMMANDS,
  ITerraformProvider,
  TARGET_COMMANDS,
  TerraformCommand,
  VARIABLE_COMMANDS,
} from '../interfaces';

/**
 * Builds command-line arguments for Terraform commands
 * Follows single responsibility principle - only handles argument construction
 */
export class TerraformArgumentBuilder {
  constructor(private readonly provider: ITerraformProvider) {}

  /**
   * Generate command arguments based on provider configuration
   * @returns Array of command-line arguments
   */
  toCommandArgs(): string[] {
    const args: string[] = [];
    const command = this.provider.command;

    // Add command-specific arguments
    this.addInitArguments(args, command);
    this.addVariableArguments(args, command);
    this.addTargetArguments(args, command);
    this.addPlanArguments(args, command);
    this.addApplyArguments(args, command);
    this.addCommonArguments(args);

    return args;
  }

  /**
   * Generate full command array including executor and command
   * @returns Full command array ready for execution
   */
  buildCommand(): string[] {
    return [
      this.provider.executor,
      this.provider.command,
      ...this.toCommandArgs(),
    ];
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
   * Add variable-related arguments (-var, -var-file)
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
   * Add target-related arguments (-target)
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

    // Refresh control (for apply/destroy)
    if (command === 'apply' || command === 'destroy') {
      if (!this.provider.refresh) {
        args.push('-refresh=false');
      }
    }

    // Plan file for apply (must be last argument, no flag)
    if (command === 'apply' && this.provider.planFile) {
      // Plan file is added after all flags
    }
  }

  /**
   * Add common arguments applicable to multiple commands
   */
  private addCommonArguments(args: string[]): void {
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
  private supportsVariables(command: TerraformCommand): boolean {
    return VARIABLE_COMMANDS.includes(command);
  }

  /**
   * Check if command supports -target flag
   */
  private supportsTargets(command: TerraformCommand): boolean {
    return TARGET_COMMANDS.includes(command);
  }

  /**
   * Check if command supports -auto-approve flag
   */
  private supportsAutoApprove(command: TerraformCommand): boolean {
    return AUTO_APPROVE_COMMANDS.includes(command);
  }
}
