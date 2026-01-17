import { TerragruntService } from './TerragruntService';

describe('TerragruntService', () => {
  describe('constructor', () => {
    test('creates service with command', () => {
      const service = new TerragruntService('plan');
      expect(service.command).toBe('plan');
      expect(service.workingDirectory).toBe('.');
    });

    test('creates service with command and working directory', () => {
      const service = new TerragruntService('apply', './infrastructure');
      expect(service.command).toBe('apply');
      expect(service.workingDirectory).toBe('./infrastructure');
    });

    test('has correct executor', () => {
      const service = new TerragruntService('plan');
      expect(service.executor).toBe('terragrunt');
    });
  });

  describe('ITerragruntProvider read-only properties - Terraform', () => {
    test('environment returns empty map by default', () => {
      const service = new TerragruntService('plan');
      expect(service.environment.size).toBe(0);
    });

    test('variables returns empty map by default', () => {
      const service = new TerragruntService('plan');
      expect(service.variables.size).toBe(0);
    });

    test('varFiles returns empty array by default', () => {
      const service = new TerragruntService('plan');
      expect(service.varFiles).toEqual([]);
    });

    test('backendConfig returns empty map by default', () => {
      const service = new TerragruntService('plan');
      expect(service.backendConfig.size).toBe(0);
    });

    test('targets returns empty array by default', () => {
      const service = new TerragruntService('plan');
      expect(service.targets).toEqual([]);
    });

    test('autoApprove is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.autoApprove).toBe(false);
    });

    test('dryRun is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.dryRun).toBe(false);
    });

    test('planFile is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.planFile).toBeUndefined();
    });

    test('outFile is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.outFile).toBeUndefined();
    });

    test('noColor is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.noColor).toBe(false);
    });

    test('compactWarnings is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.compactWarnings).toBe(false);
    });

    test('parallelism is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.parallelism).toBeUndefined();
    });

    test('lockTimeout is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.lockTimeout).toBeUndefined();
    });

    test('refresh is true by default', () => {
      const service = new TerragruntService('plan');
      expect(service.refresh).toBe(true);
    });

    test('reconfigure is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.reconfigure).toBe(false);
    });

    test('migrateState is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.migrateState).toBe(false);
    });
  });

  describe('ITerragruntProvider read-only properties - Terragrunt specific', () => {
    test('terragruntConfig is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.terragruntConfig).toBeUndefined();
    });

    test('terragruntWorkingDir is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.terragruntWorkingDir).toBeUndefined();
    });

    test('runAll is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.runAll).toBe(false);
    });

    test('noAutoInit is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.noAutoInit).toBe(false);
    });

    test('noAutoRetry is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.noAutoRetry).toBe(false);
    });

    test('nonInteractive is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.nonInteractive).toBe(false);
    });

    test('terragruntParallelism is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.terragruntParallelism).toBeUndefined();
    });

    test('includeDirs returns empty array by default', () => {
      const service = new TerragruntService('plan');
      expect(service.includeDirs).toEqual([]);
    });

    test('excludeDirs returns empty array by default', () => {
      const service = new TerragruntService('plan');
      expect(service.excludeDirs).toEqual([]);
    });

    test('ignoreDependencyErrors is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.ignoreDependencyErrors).toBe(false);
    });

    test('ignoreExternalDependencies is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.ignoreExternalDependencies).toBe(false);
    });

    test('includeExternalDependencies is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.includeExternalDependencies).toBe(false);
    });

    test('terragruntSource is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.terragruntSource).toBeUndefined();
    });

    test('sourceMap returns empty map by default', () => {
      const service = new TerragruntService('plan');
      expect(service.sourceMap.size).toBe(0);
    });

    test('downloadDir is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.downloadDir).toBeUndefined();
    });

    test('iamRole is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.iamRole).toBeUndefined();
    });

    test('iamRoleSessionName is undefined by default', () => {
      const service = new TerragruntService('plan');
      expect(service.iamRoleSessionName).toBeUndefined();
    });

    test('strictInclude is false by default', () => {
      const service = new TerragruntService('plan');
      expect(service.strictInclude).toBe(false);
    });
  });

  describe('IStringListProvider implementation', () => {
    test('useStringList returns true', () => {
      const service = new TerragruntService('plan');
      expect(service.useStringList).toBe(true);
    });

    test('stringList returns command array', () => {
      const service = new TerragruntService('plan');
      expect(service.stringList).toEqual(['terragrunt', 'plan']);
    });
  });

  describe('setCommand', () => {
    test('sets command and returns this', () => {
      const service = new TerragruntService('plan');
      const result = service.setCommand('apply');
      expect(result).toBe(service);
      expect(service.command).toBe('apply');
    });
  });

  describe('setWorkingDirectory', () => {
    test('sets working directory and returns this', () => {
      const service = new TerragruntService('plan');
      const result = service.setWorkingDirectory('./new-dir');
      expect(result).toBe(service);
      expect(service.workingDirectory).toBe('./new-dir');
    });
  });

  describe('environment variable management', () => {
    test('addEnvironmentVariable adds variable', () => {
      const service = new TerragruntService('plan');
      const result = service.addEnvironmentVariable('TF_LOG', 'DEBUG');
      expect(result).toBe(service);
      expect(service.environment.get('TF_LOG')).toBe('DEBUG');
    });

    test('removeEnvironmentVariable removes variable', () => {
      const service = new TerragruntService('plan');
      service.addEnvironmentVariable('TF_LOG', 'DEBUG');
      const result = service.removeEnvironmentVariable('TF_LOG');
      expect(result).toBe(service);
      expect(service.environment.has('TF_LOG')).toBe(false);
    });

    test('clearEnvironmentVariables clears all variables', () => {
      const service = new TerragruntService('plan');
      service.addEnvironmentVariable('TF_LOG', 'DEBUG');
      service.addEnvironmentVariable('TF_VAR_region', 'us-east-1');
      const result = service.clearEnvironmentVariables();
      expect(result).toBe(service);
      expect(service.environment.size).toBe(0);
    });
  });

  describe('variable management', () => {
    test('addVariable adds variable', () => {
      const service = new TerragruntService('plan');
      const result = service.addVariable('environment', 'production');
      expect(result).toBe(service);
      expect(service.variables.get('environment')).toBe('production');
    });

    test('removeVariable removes variable', () => {
      const service = new TerragruntService('plan');
      service.addVariable('environment', 'production');
      const result = service.removeVariable('environment');
      expect(result).toBe(service);
      expect(service.variables.has('environment')).toBe(false);
    });

    test('clearVariables clears all variables', () => {
      const service = new TerragruntService('plan');
      service.addVariable('environment', 'production');
      service.addVariable('region', 'us-east-1');
      const result = service.clearVariables();
      expect(result).toBe(service);
      expect(service.variables.size).toBe(0);
    });
  });

  describe('var file management', () => {
    test('addVarFile adds file', () => {
      const service = new TerragruntService('plan');
      const result = service.addVarFile('./prod.tfvars');
      expect(result).toBe(service);
      expect(service.varFiles).toContain('./prod.tfvars');
    });

    test('addVarFile does not add duplicates', () => {
      const service = new TerragruntService('plan');
      service.addVarFile('./prod.tfvars');
      service.addVarFile('./prod.tfvars');
      expect(service.varFiles.length).toBe(1);
    });

    test('removeVarFile removes file', () => {
      const service = new TerragruntService('plan');
      service.addVarFile('./prod.tfvars');
      const result = service.removeVarFile('./prod.tfvars');
      expect(result).toBe(service);
      expect(service.varFiles).not.toContain('./prod.tfvars');
    });

    test('removeVarFile handles non-existent file', () => {
      const service = new TerragruntService('plan');
      const result = service.removeVarFile('./nonexistent.tfvars');
      expect(result).toBe(service);
    });

    test('clearVarFiles clears all files', () => {
      const service = new TerragruntService('plan');
      service.addVarFile('./prod.tfvars');
      service.addVarFile('./common.tfvars');
      const result = service.clearVarFiles();
      expect(result).toBe(service);
      expect(service.varFiles.length).toBe(0);
    });
  });

  describe('backend config management', () => {
    test('addBackendConfig adds config', () => {
      const service = new TerragruntService('init');
      const result = service.addBackendConfig('bucket', 'my-bucket');
      expect(result).toBe(service);
      expect(service.backendConfig.get('bucket')).toBe('my-bucket');
    });

    test('removeBackendConfig removes config', () => {
      const service = new TerragruntService('init');
      service.addBackendConfig('bucket', 'my-bucket');
      const result = service.removeBackendConfig('bucket');
      expect(result).toBe(service);
      expect(service.backendConfig.has('bucket')).toBe(false);
    });

    test('clearBackendConfig clears all config', () => {
      const service = new TerragruntService('init');
      service.addBackendConfig('bucket', 'my-bucket');
      service.addBackendConfig('key', 'state.tfstate');
      const result = service.clearBackendConfig();
      expect(result).toBe(service);
      expect(service.backendConfig.size).toBe(0);
    });
  });

  describe('target management', () => {
    test('addTarget adds target', () => {
      const service = new TerragruntService('plan');
      const result = service.addTarget('module.vpc');
      expect(result).toBe(service);
      expect(service.targets).toContain('module.vpc');
    });

    test('addTarget does not add duplicates', () => {
      const service = new TerragruntService('plan');
      service.addTarget('module.vpc');
      service.addTarget('module.vpc');
      expect(service.targets.length).toBe(1);
    });

    test('removeTarget removes target', () => {
      const service = new TerragruntService('plan');
      service.addTarget('module.vpc');
      const result = service.removeTarget('module.vpc');
      expect(result).toBe(service);
      expect(service.targets).not.toContain('module.vpc');
    });

    test('removeTarget handles non-existent target', () => {
      const service = new TerragruntService('plan');
      const result = service.removeTarget('module.nonexistent');
      expect(result).toBe(service);
    });

    test('clearTargets clears all targets', () => {
      const service = new TerragruntService('plan');
      service.addTarget('module.vpc');
      service.addTarget('aws_instance.web');
      const result = service.clearTargets();
      expect(result).toBe(service);
      expect(service.targets.length).toBe(0);
    });
  });

  describe('terraform flag setters', () => {
    test('setAutoApprove sets auto-approve', () => {
      const service = new TerragruntService('apply');
      const result = service.setAutoApprove(true);
      expect(result).toBe(service);
      expect(service.autoApprove).toBe(true);
    });

    test('setDryRun sets dry-run', () => {
      const service = new TerragruntService('plan');
      const result = service.setDryRun(true);
      expect(result).toBe(service);
      expect(service.dryRun).toBe(true);
    });

    test('setPlanFile sets plan file', () => {
      const service = new TerragruntService('apply');
      const result = service.setPlanFile('./plan.tfplan');
      expect(result).toBe(service);
      expect(service.planFile).toBe('./plan.tfplan');
    });

    test('setOutFile sets out file', () => {
      const service = new TerragruntService('plan');
      const result = service.setOutFile('./plan.tfplan');
      expect(result).toBe(service);
      expect(service.outFile).toBe('./plan.tfplan');
    });

    test('setNoColor sets no-color', () => {
      const service = new TerragruntService('plan');
      const result = service.setNoColor(true);
      expect(result).toBe(service);
      expect(service.noColor).toBe(true);
    });

    test('setCompactWarnings sets compact-warnings', () => {
      const service = new TerragruntService('plan');
      const result = service.setCompactWarnings(true);
      expect(result).toBe(service);
      expect(service.compactWarnings).toBe(true);
    });

    test('setParallelism sets parallelism', () => {
      const service = new TerragruntService('plan');
      const result = service.setParallelism(10);
      expect(result).toBe(service);
      expect(service.parallelism).toBe(10);
    });

    test('setLockTimeout sets lock-timeout', () => {
      const service = new TerragruntService('plan');
      const result = service.setLockTimeout('30s');
      expect(result).toBe(service);
      expect(service.lockTimeout).toBe('30s');
    });

    test('setRefresh sets refresh', () => {
      const service = new TerragruntService('plan');
      const result = service.setRefresh(false);
      expect(result).toBe(service);
      expect(service.refresh).toBe(false);
    });

    test('setReconfigure sets reconfigure', () => {
      const service = new TerragruntService('init');
      const result = service.setReconfigure(true);
      expect(result).toBe(service);
      expect(service.reconfigure).toBe(true);
    });

    test('setMigrateState sets migrate-state', () => {
      const service = new TerragruntService('init');
      const result = service.setMigrateState(true);
      expect(result).toBe(service);
      expect(service.migrateState).toBe(true);
    });
  });

  describe('terragrunt-specific setters', () => {
    test('setTerragruntConfig sets config path', () => {
      const service = new TerragruntService('plan');
      const result = service.setTerragruntConfig('./custom.hcl');
      expect(result).toBe(service);
      expect(service.terragruntConfig).toBe('./custom.hcl');
    });

    test('setTerragruntWorkingDir sets working dir', () => {
      const service = new TerragruntService('plan');
      const result = service.setTerragruntWorkingDir('./live/prod');
      expect(result).toBe(service);
      expect(service.terragruntWorkingDir).toBe('./live/prod');
    });

    test('setRunAll sets run-all mode', () => {
      const service = new TerragruntService('plan');
      const result = service.setRunAll(true);
      expect(result).toBe(service);
      expect(service.runAll).toBe(true);
    });

    test('setNoAutoInit sets no-auto-init', () => {
      const service = new TerragruntService('plan');
      const result = service.setNoAutoInit(true);
      expect(result).toBe(service);
      expect(service.noAutoInit).toBe(true);
    });

    test('setNoAutoRetry sets no-auto-retry', () => {
      const service = new TerragruntService('plan');
      const result = service.setNoAutoRetry(true);
      expect(result).toBe(service);
      expect(service.noAutoRetry).toBe(true);
    });

    test('setNonInteractive sets non-interactive', () => {
      const service = new TerragruntService('plan');
      const result = service.setNonInteractive(true);
      expect(result).toBe(service);
      expect(service.nonInteractive).toBe(true);
    });

    test('setTerragruntParallelism sets terragrunt parallelism', () => {
      const service = new TerragruntService('plan');
      const result = service.setTerragruntParallelism(5);
      expect(result).toBe(service);
      expect(service.terragruntParallelism).toBe(5);
    });
  });

  describe('include/exclude dirs management', () => {
    test('addIncludeDir adds directory', () => {
      const service = new TerragruntService('plan');
      const result = service.addIncludeDir('./live/prod');
      expect(result).toBe(service);
      expect(service.includeDirs).toContain('./live/prod');
    });

    test('addIncludeDir does not add duplicates', () => {
      const service = new TerragruntService('plan');
      service.addIncludeDir('./live/prod');
      service.addIncludeDir('./live/prod');
      expect(service.includeDirs.length).toBe(1);
    });

    test('removeIncludeDir removes directory', () => {
      const service = new TerragruntService('plan');
      service.addIncludeDir('./live/prod');
      const result = service.removeIncludeDir('./live/prod');
      expect(result).toBe(service);
      expect(service.includeDirs).not.toContain('./live/prod');
    });

    test('removeIncludeDir handles non-existent directory', () => {
      const service = new TerragruntService('plan');
      const result = service.removeIncludeDir('./nonexistent');
      expect(result).toBe(service);
    });

    test('clearIncludeDirs clears all directories', () => {
      const service = new TerragruntService('plan');
      service.addIncludeDir('./live/prod');
      service.addIncludeDir('./live/staging');
      const result = service.clearIncludeDirs();
      expect(result).toBe(service);
      expect(service.includeDirs.length).toBe(0);
    });

    test('addExcludeDir adds directory', () => {
      const service = new TerragruntService('plan');
      const result = service.addExcludeDir('./live/test');
      expect(result).toBe(service);
      expect(service.excludeDirs).toContain('./live/test');
    });

    test('addExcludeDir does not add duplicates', () => {
      const service = new TerragruntService('plan');
      service.addExcludeDir('./live/test');
      service.addExcludeDir('./live/test');
      expect(service.excludeDirs.length).toBe(1);
    });

    test('removeExcludeDir removes directory', () => {
      const service = new TerragruntService('plan');
      service.addExcludeDir('./live/test');
      const result = service.removeExcludeDir('./live/test');
      expect(result).toBe(service);
      expect(service.excludeDirs).not.toContain('./live/test');
    });

    test('removeExcludeDir handles non-existent directory', () => {
      const service = new TerragruntService('plan');
      const result = service.removeExcludeDir('./nonexistent');
      expect(result).toBe(service);
    });

    test('clearExcludeDirs clears all directories', () => {
      const service = new TerragruntService('plan');
      service.addExcludeDir('./live/test');
      service.addExcludeDir('./live/dev');
      const result = service.clearExcludeDirs();
      expect(result).toBe(service);
      expect(service.excludeDirs.length).toBe(0);
    });
  });

  describe('dependency handling setters', () => {
    test('setIgnoreDependencyErrors sets flag', () => {
      const service = new TerragruntService('plan');
      const result = service.setIgnoreDependencyErrors(true);
      expect(result).toBe(service);
      expect(service.ignoreDependencyErrors).toBe(true);
    });

    test('setIgnoreExternalDependencies sets flag', () => {
      const service = new TerragruntService('plan');
      const result = service.setIgnoreExternalDependencies(true);
      expect(result).toBe(service);
      expect(service.ignoreExternalDependencies).toBe(true);
    });

    test('setIncludeExternalDependencies sets flag', () => {
      const service = new TerragruntService('plan');
      const result = service.setIncludeExternalDependencies(true);
      expect(result).toBe(service);
      expect(service.includeExternalDependencies).toBe(true);
    });
  });

  describe('source management', () => {
    test('setTerragruntSource sets source', () => {
      const service = new TerragruntService('plan');
      const result = service.setTerragruntSource('/local/modules');
      expect(result).toBe(service);
      expect(service.terragruntSource).toBe('/local/modules');
    });

    test('addSourceMap adds mapping', () => {
      const service = new TerragruntService('plan');
      const result = service.addSourceMap(
        'git::https://github.com/org/modules.git',
        '/local/modules'
      );
      expect(result).toBe(service);
      expect(service.sourceMap.get('git::https://github.com/org/modules.git')).toBe(
        '/local/modules'
      );
    });

    test('removeSourceMap removes mapping', () => {
      const service = new TerragruntService('plan');
      service.addSourceMap('git::https://github.com/org/modules.git', '/local/modules');
      const result = service.removeSourceMap('git::https://github.com/org/modules.git');
      expect(result).toBe(service);
      expect(service.sourceMap.has('git::https://github.com/org/modules.git')).toBe(false);
    });

    test('clearSourceMap clears all mappings', () => {
      const service = new TerragruntService('plan');
      service.addSourceMap('git::https://github.com/org/modules1.git', '/local/modules1');
      service.addSourceMap('git::https://github.com/org/modules2.git', '/local/modules2');
      const result = service.clearSourceMap();
      expect(result).toBe(service);
      expect(service.sourceMap.size).toBe(0);
    });
  });

  describe('other terragrunt setters', () => {
    test('setDownloadDir sets download directory', () => {
      const service = new TerragruntService('plan');
      const result = service.setDownloadDir('/tmp/terragrunt');
      expect(result).toBe(service);
      expect(service.downloadDir).toBe('/tmp/terragrunt');
    });

    test('setIamRole sets IAM role', () => {
      const service = new TerragruntService('plan');
      const result = service.setIamRole('arn:aws:iam::123456789012:role/TerraformRole');
      expect(result).toBe(service);
      expect(service.iamRole).toBe('arn:aws:iam::123456789012:role/TerraformRole');
    });

    test('setIamRoleSessionName sets session name', () => {
      const service = new TerragruntService('plan');
      const result = service.setIamRoleSessionName('terragrunt-session');
      expect(result).toBe(service);
      expect(service.iamRoleSessionName).toBe('terragrunt-session');
    });

    test('setStrictInclude sets strict include', () => {
      const service = new TerragruntService('plan');
      const result = service.setStrictInclude(true);
      expect(result).toBe(service);
      expect(service.strictInclude).toBe(true);
    });
  });

  describe('command generation methods', () => {
    test('toCommandArgs returns command arguments', () => {
      const service = new TerragruntService('plan');
      const args = service.toCommandArgs();
      expect(Array.isArray(args)).toBe(true);
    });

    test('buildCommand returns full command', () => {
      const service = new TerragruntService('plan');
      const command = service.buildCommand();
      expect(command).toEqual(['terragrunt', 'plan']);
    });

    test('toString returns command string', () => {
      const service = new TerragruntService('plan');
      const str = service.toString();
      expect(str).toBe('terragrunt plan');
    });

    test('toStringMultiLineCommand returns multi-line command', () => {
      const service = new TerragruntService('plan');
      service.setNoColor(true);
      const str = service.toStringMultiLineCommand();
      expect(str).toContain('terragrunt');
      expect(str).toContain('plan');
    });
  });

  describe('reset', () => {
    test('resets all configuration to defaults', () => {
      const service = new TerragruntService('apply', './infrastructure');
      service
        // Terraform config
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
        .setLockTimeout('30s')
        // Terragrunt config
        .setTerragruntConfig('./custom.hcl')
        .setTerragruntWorkingDir('./live/prod')
        .setRunAll(true)
        .setNoAutoInit(true)
        .setNoAutoRetry(true)
        .setNonInteractive(true)
        .setTerragruntParallelism(5)
        .addIncludeDir('./live/prod')
        .addExcludeDir('./live/test')
        .setIgnoreDependencyErrors(true)
        .setIgnoreExternalDependencies(true)
        .setIncludeExternalDependencies(true)
        .setTerragruntSource('/local/modules')
        .addSourceMap('git::https://example.com', '/local')
        .setDownloadDir('/tmp/terragrunt')
        .setIamRole('arn:aws:iam::123456789012:role/TerraformRole')
        .setIamRoleSessionName('session')
        .setStrictInclude(true);

      const result = service.reset();

      expect(result).toBe(service);
      // Terraform config
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
      // Terragrunt config
      expect(service.terragruntConfig).toBeUndefined();
      expect(service.terragruntWorkingDir).toBeUndefined();
      expect(service.runAll).toBe(false);
      expect(service.noAutoInit).toBe(false);
      expect(service.noAutoRetry).toBe(false);
      expect(service.nonInteractive).toBe(false);
      expect(service.terragruntParallelism).toBeUndefined();
      expect(service.includeDirs.length).toBe(0);
      expect(service.excludeDirs.length).toBe(0);
      expect(service.ignoreDependencyErrors).toBe(false);
      expect(service.ignoreExternalDependencies).toBe(false);
      expect(service.includeExternalDependencies).toBe(false);
      expect(service.terragruntSource).toBeUndefined();
      expect(service.sourceMap.size).toBe(0);
      expect(service.downloadDir).toBeUndefined();
      expect(service.iamRole).toBeUndefined();
      expect(service.iamRoleSessionName).toBeUndefined();
      expect(service.strictInclude).toBe(false);
      // Command and working directory are NOT reset
      expect(service.command).toBe('apply');
      expect(service.workingDirectory).toBe('./infrastructure');
    });
  });

  describe('clone', () => {
    test('creates independent copy with same configuration', () => {
      const service = new TerragruntService('apply', './infrastructure');
      service
        // Terraform config
        .addEnvironmentVariable('TF_LOG', 'DEBUG')
        .addVariable('env', 'prod')
        .addVarFile('./prod.tfvars')
        .addBackendConfig('bucket', 'my-bucket')
        .addTarget('module.vpc')
        .setAutoApprove(true)
        .setNoColor(true)
        .setRefresh(false)
        .setReconfigure(true)
        .setMigrateState(true)
        .setPlanFile('./plan.tfplan')
        .setOutFile('./out.tfplan')
        .setParallelism(10)
        .setLockTimeout('30s')
        // Terragrunt config
        .setTerragruntConfig('./custom.hcl')
        .setTerragruntWorkingDir('./live/prod')
        .setRunAll(true)
        .setNoAutoInit(true)
        .setNoAutoRetry(true)
        .setNonInteractive(true)
        .setTerragruntParallelism(5)
        .addIncludeDir('./live/prod')
        .addExcludeDir('./live/test')
        .setIgnoreDependencyErrors(true)
        .setIgnoreExternalDependencies(true)
        .setIncludeExternalDependencies(true)
        .setTerragruntSource('/local/modules')
        .addSourceMap('git::https://example.com', '/local')
        .setDownloadDir('/tmp/terragrunt')
        .setIamRole('arn:aws:iam::123456789012:role/TerraformRole')
        .setIamRoleSessionName('session')
        .setStrictInclude(true);

      const cloned = service.clone();

      // Verify terraform properties are copied
      expect(cloned.command).toBe('apply');
      expect(cloned.workingDirectory).toBe('./infrastructure');
      expect(cloned.environment.get('TF_LOG')).toBe('DEBUG');
      expect(cloned.variables.get('env')).toBe('prod');
      expect(cloned.varFiles).toContain('./prod.tfvars');
      expect(cloned.backendConfig.get('bucket')).toBe('my-bucket');
      expect(cloned.targets).toContain('module.vpc');
      expect(cloned.autoApprove).toBe(true);
      expect(cloned.noColor).toBe(true);
      expect(cloned.refresh).toBe(false);
      expect(cloned.reconfigure).toBe(true);
      expect(cloned.migrateState).toBe(true);
      expect(cloned.planFile).toBe('./plan.tfplan');
      expect(cloned.outFile).toBe('./out.tfplan');
      expect(cloned.parallelism).toBe(10);
      expect(cloned.lockTimeout).toBe('30s');
      // Verify terragrunt properties are copied
      expect(cloned.terragruntConfig).toBe('./custom.hcl');
      expect(cloned.terragruntWorkingDir).toBe('./live/prod');
      expect(cloned.runAll).toBe(true);
      expect(cloned.noAutoInit).toBe(true);
      expect(cloned.noAutoRetry).toBe(true);
      expect(cloned.nonInteractive).toBe(true);
      expect(cloned.terragruntParallelism).toBe(5);
      expect(cloned.includeDirs).toContain('./live/prod');
      expect(cloned.excludeDirs).toContain('./live/test');
      expect(cloned.ignoreDependencyErrors).toBe(true);
      expect(cloned.ignoreExternalDependencies).toBe(true);
      expect(cloned.includeExternalDependencies).toBe(true);
      expect(cloned.terragruntSource).toBe('/local/modules');
      expect(cloned.sourceMap.get('git::https://example.com')).toBe('/local');
      expect(cloned.downloadDir).toBe('/tmp/terragrunt');
      expect(cloned.iamRole).toBe('arn:aws:iam::123456789012:role/TerraformRole');
      expect(cloned.iamRoleSessionName).toBe('session');
      expect(cloned.strictInclude).toBe(true);
    });

    test('clone is independent - modifying clone does not affect original', () => {
      const service = new TerragruntService('plan');
      service.addVariable('env', 'prod');
      service.addIncludeDir('./live/prod');

      const cloned = service.clone();
      cloned.addVariable('region', 'us-east-1');
      cloned.addIncludeDir('./live/staging');

      expect(service.variables.has('region')).toBe(false);
      expect(service.includeDirs).not.toContain('./live/staging');
    });

    test('clone is independent - modifying original does not affect clone', () => {
      const service = new TerragruntService('plan');
      service.addVariable('env', 'prod');

      const cloned = service.clone();
      service.addVariable('region', 'us-west-2');

      expect(cloned.variables.has('region')).toBe(false);
    });
  });

  describe('fluent interface', () => {
    test('supports method chaining', () => {
      const service = new TerragruntService('apply');
      const result = service
        .setWorkingDirectory('./infra')
        .setRunAll(true)
        .addVariable('env', 'prod')
        .addVarFile('./prod.tfvars')
        .addTarget('module.vpc')
        .setAutoApprove(true)
        .setNoColor(true)
        .setNonInteractive(true)
        .addIncludeDir('./live/prod')
        .addExcludeDir('./live/test');

      expect(result).toBe(service);
      expect(service.workingDirectory).toBe('./infra');
      expect(service.runAll).toBe(true);
      expect(service.variables.get('env')).toBe('prod');
      expect(service.includeDirs).toContain('./live/prod');
      expect(service.excludeDirs).toContain('./live/test');
    });
  });

  describe('integration scenarios', () => {
    test('run-all plan command with all options', () => {
      const service = new TerragruntService('plan', './infrastructure');
      service
        .setRunAll(true)
        .addVariable('environment', 'production')
        .addIncludeDir('./live/prod')
        .addExcludeDir('./live/test')
        .setTerragruntParallelism(5)
        .setNonInteractive(true)
        .setNoAutoInit(false)
        .setIgnoreDependencyErrors(true);

      const command = service.buildCommand();
      const commandString = service.toString();

      expect(command).toContain('terragrunt');
      expect(command).toContain('run-all');
      expect(command).toContain('plan');
      expect(commandString).toContain('run-all');
    });

    test('apply command with IAM role', () => {
      const service = new TerragruntService('apply', './infrastructure');
      service
        .setIamRole('arn:aws:iam::123456789012:role/TerraformRole')
        .setIamRoleSessionName('terragrunt-deploy')
        .setAutoApprove(true)
        .setNonInteractive(true);

      const command = service.buildCommand();

      expect(command).toContain('terragrunt');
      expect(command).toContain('apply');
      expect(command).toContain('--terragrunt-iam-role');
    });

    test('init command with source override', () => {
      const service = new TerragruntService('init', './infrastructure');
      service
        .setTerragruntSource('/local/terraform-modules')
        .addSourceMap('git::https://github.com/org/modules.git', '/local/modules')
        .setReconfigure(true);

      const command = service.buildCommand();

      expect(command).toContain('terragrunt');
      expect(command).toContain('init');
      expect(command).toContain('--terragrunt-source');
    });
  });
});
