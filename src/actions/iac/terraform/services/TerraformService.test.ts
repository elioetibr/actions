import { TerraformService } from './TerraformService';

describe('TerraformService', () => {
  describe('constructor', () => {
    test('creates service with command', () => {
      const service = new TerraformService('plan');
      expect(service.command).toBe('plan');
      expect(service.workingDirectory).toBe('.');
    });

    test('creates service with command and working directory', () => {
      const service = new TerraformService('apply', './infrastructure');
      expect(service.command).toBe('apply');
      expect(service.workingDirectory).toBe('./infrastructure');
    });

    test('has correct executor', () => {
      const service = new TerraformService('plan');
      expect(service.executor).toBe('terraform');
    });
  });

  describe('ITerraformProvider read-only properties', () => {
    test('environment returns empty map by default', () => {
      const service = new TerraformService('plan');
      expect(service.environment.size).toBe(0);
    });

    test('variables returns empty map by default', () => {
      const service = new TerraformService('plan');
      expect(service.variables.size).toBe(0);
    });

    test('varFiles returns empty array by default', () => {
      const service = new TerraformService('plan');
      expect(service.varFiles).toEqual([]);
    });

    test('backendConfig returns empty map by default', () => {
      const service = new TerraformService('plan');
      expect(service.backendConfig.size).toBe(0);
    });

    test('targets returns empty array by default', () => {
      const service = new TerraformService('plan');
      expect(service.targets).toEqual([]);
    });

    test('autoApprove is false by default', () => {
      const service = new TerraformService('plan');
      expect(service.autoApprove).toBe(false);
    });

    test('dryRun is false by default', () => {
      const service = new TerraformService('plan');
      expect(service.dryRun).toBe(false);
    });

    test('planFile is undefined by default', () => {
      const service = new TerraformService('plan');
      expect(service.planFile).toBeUndefined();
    });

    test('outFile is undefined by default', () => {
      const service = new TerraformService('plan');
      expect(service.outFile).toBeUndefined();
    });

    test('noColor is false by default', () => {
      const service = new TerraformService('plan');
      expect(service.noColor).toBe(false);
    });

    test('compactWarnings is false by default', () => {
      const service = new TerraformService('plan');
      expect(service.compactWarnings).toBe(false);
    });

    test('parallelism is undefined by default', () => {
      const service = new TerraformService('plan');
      expect(service.parallelism).toBeUndefined();
    });

    test('lockTimeout is undefined by default', () => {
      const service = new TerraformService('plan');
      expect(service.lockTimeout).toBeUndefined();
    });

    test('refresh is true by default', () => {
      const service = new TerraformService('plan');
      expect(service.refresh).toBe(true);
    });

    test('reconfigure is false by default', () => {
      const service = new TerraformService('plan');
      expect(service.reconfigure).toBe(false);
    });

    test('migrateState is false by default', () => {
      const service = new TerraformService('plan');
      expect(service.migrateState).toBe(false);
    });
  });

  describe('IStringListProvider implementation', () => {
    test('useStringList returns true', () => {
      const service = new TerraformService('plan');
      expect(service.useStringList).toBe(true);
    });

    test('stringList returns command array', () => {
      const service = new TerraformService('plan');
      expect(service.stringList).toEqual(['terraform', 'plan']);
    });
  });

  describe('setCommand', () => {
    test('sets command and returns this', () => {
      const service = new TerraformService('plan');
      const result = service.setCommand('apply');
      expect(result).toBe(service);
      expect(service.command).toBe('apply');
    });
  });

  describe('setWorkingDirectory', () => {
    test('sets working directory and returns this', () => {
      const service = new TerraformService('plan');
      const result = service.setWorkingDirectory('./new-dir');
      expect(result).toBe(service);
      expect(service.workingDirectory).toBe('./new-dir');
    });
  });

  describe('environment variable management', () => {
    test('addEnvironmentVariable adds variable', () => {
      const service = new TerraformService('plan');
      const result = service.addEnvironmentVariable('TF_LOG', 'DEBUG');
      expect(result).toBe(service);
      expect(service.environment.get('TF_LOG')).toBe('DEBUG');
    });

    test('removeEnvironmentVariable removes variable', () => {
      const service = new TerraformService('plan');
      service.addEnvironmentVariable('TF_LOG', 'DEBUG');
      const result = service.removeEnvironmentVariable('TF_LOG');
      expect(result).toBe(service);
      expect(service.environment.has('TF_LOG')).toBe(false);
    });

    test('clearEnvironmentVariables clears all variables', () => {
      const service = new TerraformService('plan');
      service.addEnvironmentVariable('TF_LOG', 'DEBUG');
      service.addEnvironmentVariable('TF_VAR_region', 'us-east-1');
      const result = service.clearEnvironmentVariables();
      expect(result).toBe(service);
      expect(service.environment.size).toBe(0);
    });
  });

  describe('variable management', () => {
    test('addVariable adds variable', () => {
      const service = new TerraformService('plan');
      const result = service.addVariable('environment', 'production');
      expect(result).toBe(service);
      expect(service.variables.get('environment')).toBe('production');
    });

    test('removeVariable removes variable', () => {
      const service = new TerraformService('plan');
      service.addVariable('environment', 'production');
      const result = service.removeVariable('environment');
      expect(result).toBe(service);
      expect(service.variables.has('environment')).toBe(false);
    });

    test('clearVariables clears all variables', () => {
      const service = new TerraformService('plan');
      service.addVariable('environment', 'production');
      service.addVariable('region', 'us-east-1');
      const result = service.clearVariables();
      expect(result).toBe(service);
      expect(service.variables.size).toBe(0);
    });
  });

  describe('var file management', () => {
    test('addVarFile adds file', () => {
      const service = new TerraformService('plan');
      const result = service.addVarFile('./prod.tfvars');
      expect(result).toBe(service);
      expect(service.varFiles).toContain('./prod.tfvars');
    });

    test('addVarFile does not add duplicates', () => {
      const service = new TerraformService('plan');
      service.addVarFile('./prod.tfvars');
      service.addVarFile('./prod.tfvars');
      expect(service.varFiles.length).toBe(1);
    });

    test('removeVarFile removes file', () => {
      const service = new TerraformService('plan');
      service.addVarFile('./prod.tfvars');
      const result = service.removeVarFile('./prod.tfvars');
      expect(result).toBe(service);
      expect(service.varFiles).not.toContain('./prod.tfvars');
    });

    test('removeVarFile handles non-existent file', () => {
      const service = new TerraformService('plan');
      const result = service.removeVarFile('./nonexistent.tfvars');
      expect(result).toBe(service);
    });

    test('clearVarFiles clears all files', () => {
      const service = new TerraformService('plan');
      service.addVarFile('./prod.tfvars');
      service.addVarFile('./common.tfvars');
      const result = service.clearVarFiles();
      expect(result).toBe(service);
      expect(service.varFiles.length).toBe(0);
    });
  });

  describe('backend config management', () => {
    test('addBackendConfig adds config', () => {
      const service = new TerraformService('init');
      const result = service.addBackendConfig('bucket', 'my-bucket');
      expect(result).toBe(service);
      expect(service.backendConfig.get('bucket')).toBe('my-bucket');
    });

    test('removeBackendConfig removes config', () => {
      const service = new TerraformService('init');
      service.addBackendConfig('bucket', 'my-bucket');
      const result = service.removeBackendConfig('bucket');
      expect(result).toBe(service);
      expect(service.backendConfig.has('bucket')).toBe(false);
    });

    test('clearBackendConfig clears all config', () => {
      const service = new TerraformService('init');
      service.addBackendConfig('bucket', 'my-bucket');
      service.addBackendConfig('key', 'state.tfstate');
      const result = service.clearBackendConfig();
      expect(result).toBe(service);
      expect(service.backendConfig.size).toBe(0);
    });
  });

  describe('target management', () => {
    test('addTarget adds target', () => {
      const service = new TerraformService('plan');
      const result = service.addTarget('module.vpc');
      expect(result).toBe(service);
      expect(service.targets).toContain('module.vpc');
    });

    test('addTarget does not add duplicates', () => {
      const service = new TerraformService('plan');
      service.addTarget('module.vpc');
      service.addTarget('module.vpc');
      expect(service.targets.length).toBe(1);
    });

    test('removeTarget removes target', () => {
      const service = new TerraformService('plan');
      service.addTarget('module.vpc');
      const result = service.removeTarget('module.vpc');
      expect(result).toBe(service);
      expect(service.targets).not.toContain('module.vpc');
    });

    test('removeTarget handles non-existent target', () => {
      const service = new TerraformService('plan');
      const result = service.removeTarget('module.nonexistent');
      expect(result).toBe(service);
    });

    test('clearTargets clears all targets', () => {
      const service = new TerraformService('plan');
      service.addTarget('module.vpc');
      service.addTarget('aws_instance.web');
      const result = service.clearTargets();
      expect(result).toBe(service);
      expect(service.targets.length).toBe(0);
    });
  });

  describe('flag setters', () => {
    test('setAutoApprove sets auto-approve', () => {
      const service = new TerraformService('apply');
      const result = service.setAutoApprove(true);
      expect(result).toBe(service);
      expect(service.autoApprove).toBe(true);
    });

    test('setDryRun sets dry-run', () => {
      const service = new TerraformService('plan');
      const result = service.setDryRun(true);
      expect(result).toBe(service);
      expect(service.dryRun).toBe(true);
    });

    test('setPlanFile sets plan file', () => {
      const service = new TerraformService('apply');
      const result = service.setPlanFile('./plan.tfplan');
      expect(result).toBe(service);
      expect(service.planFile).toBe('./plan.tfplan');
    });

    test('setOutFile sets out file', () => {
      const service = new TerraformService('plan');
      const result = service.setOutFile('./plan.tfplan');
      expect(result).toBe(service);
      expect(service.outFile).toBe('./plan.tfplan');
    });

    test('setNoColor sets no-color', () => {
      const service = new TerraformService('plan');
      const result = service.setNoColor(true);
      expect(result).toBe(service);
      expect(service.noColor).toBe(true);
    });

    test('setCompactWarnings sets compact-warnings', () => {
      const service = new TerraformService('plan');
      const result = service.setCompactWarnings(true);
      expect(result).toBe(service);
      expect(service.compactWarnings).toBe(true);
    });

    test('setParallelism sets parallelism', () => {
      const service = new TerraformService('plan');
      const result = service.setParallelism(10);
      expect(result).toBe(service);
      expect(service.parallelism).toBe(10);
    });

    test('setLockTimeout sets lock-timeout', () => {
      const service = new TerraformService('plan');
      const result = service.setLockTimeout('30s');
      expect(result).toBe(service);
      expect(service.lockTimeout).toBe('30s');
    });

    test('setRefresh sets refresh', () => {
      const service = new TerraformService('plan');
      const result = service.setRefresh(false);
      expect(result).toBe(service);
      expect(service.refresh).toBe(false);
    });

    test('setReconfigure sets reconfigure', () => {
      const service = new TerraformService('init');
      const result = service.setReconfigure(true);
      expect(result).toBe(service);
      expect(service.reconfigure).toBe(true);
    });

    test('setMigrateState sets migrate-state', () => {
      const service = new TerraformService('init');
      const result = service.setMigrateState(true);
      expect(result).toBe(service);
      expect(service.migrateState).toBe(true);
    });
  });

  describe('command generation methods', () => {
    test('toCommandArgs returns command arguments', () => {
      const service = new TerraformService('plan');
      const args = service.toCommandArgs();
      expect(Array.isArray(args)).toBe(true);
    });

    test('buildCommand returns full command', () => {
      const service = new TerraformService('plan');
      const command = service.buildCommand();
      expect(command).toEqual(['terraform', 'plan']);
    });

    test('toString returns command string', () => {
      const service = new TerraformService('plan');
      const str = service.toString();
      expect(str).toBe('terraform plan');
    });

    test('toStringMultiLineCommand returns multi-line command', () => {
      const service = new TerraformService('plan');
      service.setNoColor(true);
      const str = service.toStringMultiLineCommand();
      expect(str).toContain('terraform');
      expect(str).toContain('plan');
    });
  });

  describe('reset', () => {
    test('resets all configuration to defaults', () => {
      const service = new TerraformService('apply', './infrastructure');
      service
        .addEnvironmentVariable('TF_LOG', 'DEBUG')
        .addVariable('env', 'prod')
        .addVarFile('./prod.tfvars')
        .addBackendConfig('bucket', 'my-bucket')
        .addTarget('module.vpc')
        .setAutoApprove(true)
        .setDryRun(true)
        .setNoColor(true)
        .setCompactWarnings(true)
        .setRefresh(false)
        .setReconfigure(true)
        .setMigrateState(true)
        .setPlanFile('./plan.tfplan')
        .setOutFile('./out.tfplan')
        .setParallelism(10)
        .setLockTimeout('30s');

      const result = service.reset();

      expect(result).toBe(service);
      expect(service.environment.size).toBe(0);
      expect(service.variables.size).toBe(0);
      expect(service.varFiles.length).toBe(0);
      expect(service.backendConfig.size).toBe(0);
      expect(service.targets.length).toBe(0);
      expect(service.autoApprove).toBe(false);
      expect(service.dryRun).toBe(false);
      expect(service.noColor).toBe(false);
      expect(service.compactWarnings).toBe(false);
      expect(service.refresh).toBe(true);
      expect(service.reconfigure).toBe(false);
      expect(service.migrateState).toBe(false);
      expect(service.planFile).toBeUndefined();
      expect(service.outFile).toBeUndefined();
      expect(service.parallelism).toBeUndefined();
      expect(service.lockTimeout).toBeUndefined();
      // Command and working directory are NOT reset
      expect(service.command).toBe('apply');
      expect(service.workingDirectory).toBe('./infrastructure');
    });
  });

  describe('clone', () => {
    test('creates independent copy with same configuration', () => {
      const service = new TerraformService('apply', './infrastructure');
      service
        .addEnvironmentVariable('TF_LOG', 'DEBUG')
        .addVariable('env', 'prod')
        .addVarFile('./prod.tfvars')
        .addBackendConfig('bucket', 'my-bucket')
        .addTarget('module.vpc')
        .setAutoApprove(true)
        .setDryRun(true)
        .setNoColor(true)
        .setCompactWarnings(true)
        .setRefresh(false)
        .setReconfigure(true)
        .setMigrateState(true)
        .setPlanFile('./plan.tfplan')
        .setOutFile('./out.tfplan')
        .setParallelism(10)
        .setLockTimeout('30s');

      const cloned = service.clone();

      // Verify all properties are copied
      expect(cloned.command).toBe('apply');
      expect(cloned.workingDirectory).toBe('./infrastructure');
      expect(cloned.environment.get('TF_LOG')).toBe('DEBUG');
      expect(cloned.variables.get('env')).toBe('prod');
      expect(cloned.varFiles).toContain('./prod.tfvars');
      expect(cloned.backendConfig.get('bucket')).toBe('my-bucket');
      expect(cloned.targets).toContain('module.vpc');
      expect(cloned.autoApprove).toBe(true);
      expect(cloned.dryRun).toBe(true);
      expect(cloned.noColor).toBe(true);
      expect(cloned.compactWarnings).toBe(true);
      expect(cloned.refresh).toBe(false);
      expect(cloned.reconfigure).toBe(true);
      expect(cloned.migrateState).toBe(true);
      expect(cloned.planFile).toBe('./plan.tfplan');
      expect(cloned.outFile).toBe('./out.tfplan');
      expect(cloned.parallelism).toBe(10);
      expect(cloned.lockTimeout).toBe('30s');
    });

    test('clone is independent - modifying clone does not affect original', () => {
      const service = new TerraformService('plan');
      service.addVariable('env', 'prod');

      const cloned = service.clone();
      cloned.addVariable('region', 'us-east-1');

      expect(service.variables.has('region')).toBe(false);
      expect(cloned.variables.has('region')).toBe(true);
    });

    test('clone is independent - modifying original does not affect clone', () => {
      const service = new TerraformService('plan');
      service.addVariable('env', 'prod');

      const cloned = service.clone();
      service.addVariable('region', 'us-west-2');

      expect(service.variables.has('region')).toBe(true);
      expect(cloned.variables.has('region')).toBe(false);
    });
  });

  describe('fluent interface', () => {
    test('supports method chaining', () => {
      const service = new TerraformService('apply');
      const result = service
        .setWorkingDirectory('./infra')
        .addVariable('env', 'prod')
        .addVarFile('./prod.tfvars')
        .addTarget('module.vpc')
        .setAutoApprove(true)
        .setNoColor(true);

      expect(result).toBe(service);
      expect(service.workingDirectory).toBe('./infra');
      expect(service.variables.get('env')).toBe('prod');
      expect(service.varFiles).toContain('./prod.tfvars');
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
      expect(service.noColor).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    test('plan command with all options', () => {
      const service = new TerraformService('plan', './infrastructure');
      service
        .addVariable('environment', 'production')
        .addVariable('region', 'us-east-1')
        .addVarFile('./environments/prod.tfvars')
        .addTarget('module.vpc')
        .addTarget('module.rds')
        .setOutFile('./plans/prod.tfplan')
        .setNoColor(true)
        .setParallelism(10)
        .setRefresh(false);

      const command = service.buildCommand();
      const commandString = service.toString();

      expect(command).toContain('terraform');
      expect(command).toContain('plan');
      expect(commandString).toContain('-var');
      expect(commandString).toContain('-target');
      expect(commandString).toContain('-out');
    });

    test('apply command with plan file', () => {
      const service = new TerraformService('apply', './infrastructure');
      service.setPlanFile('./plans/prod.tfplan').setAutoApprove(true);

      const command = service.buildCommand();

      expect(command).toContain('terraform');
      expect(command).toContain('apply');
      expect(command).toContain('-auto-approve');
    });

    test('init command with backend config', () => {
      const service = new TerraformService('init', './infrastructure');
      service
        .addBackendConfig('bucket', 'terraform-state-bucket')
        .addBackendConfig('key', 'prod/terraform.tfstate')
        .addBackendConfig('region', 'us-east-1')
        .setReconfigure(true)
        .setNoColor(true);

      const command = service.buildCommand();

      expect(command).toContain('terraform');
      expect(command).toContain('init');
      expect(command).toContain('-reconfigure');
      expect(command).toContain('-backend-config');
    });

    test('destroy command with targets', () => {
      const service = new TerraformService('destroy', './infrastructure');
      service
        .addTarget('module.old_resources')
        .setAutoApprove(true)
        .setNoColor(true);

      const command = service.buildCommand();

      expect(command).toContain('terraform');
      expect(command).toContain('destroy');
      expect(command).toContain('-auto-approve');
      expect(command).toContain('-target');
    });
  });
});
