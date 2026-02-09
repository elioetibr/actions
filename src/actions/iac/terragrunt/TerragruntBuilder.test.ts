import { TerragruntBuilder } from './TerragruntBuilder';
import { TerragruntBuilderFactory } from './TerragruntBuilderFactory';

describe('TerragruntBuilder', () => {
  describe('static factory methods', () => {
    test('create() creates an empty builder', () => {
      const builder = TerragruntBuilder.create();
      expect(() => builder.build()).toThrow('Terragrunt command is required');
    });

    test('create(command) creates a builder with command', () => {
      const builder = TerragruntBuilder.create('plan');
      const service = builder.build();
      expect(service.command).toBe('plan');
    });

    test('forInit() creates init builder', () => {
      const service = TerragruntBuilder.forInit().build();
      expect(service.command).toBe('init');
    });

    test('forPlan() creates plan builder', () => {
      const service = TerragruntBuilder.forPlan().build();
      expect(service.command).toBe('plan');
    });

    test('forApply() creates apply builder', () => {
      const service = TerragruntBuilder.forApply().build();
      expect(service.command).toBe('apply');
    });

    test('forDestroy() creates destroy builder', () => {
      const service = TerragruntBuilder.forDestroy().build();
      expect(service.command).toBe('destroy');
    });

    test('forHclFmt() creates hclfmt builder', () => {
      const service = TerragruntBuilder.forHclFmt().build();
      expect(service.command).toBe('hclfmt');
    });

    test('forRunAllPlan() creates run-all plan builder', () => {
      const service = TerragruntBuilder.forRunAllPlan().build();
      expect(service.command).toBe('plan');
      expect(service.runAll).toBe(true);
    });

    test('forRunAllApply() creates run-all apply builder', () => {
      const service = TerragruntBuilder.forRunAllApply().build();
      expect(service.command).toBe('apply');
      expect(service.runAll).toBe(true);
    });

    test('forRunAllDestroy() creates run-all destroy builder', () => {
      const service = TerragruntBuilder.forRunAllDestroy().build();
      expect(service.command).toBe('destroy');
      expect(service.runAll).toBe(true);
    });

    test('forValidate() creates validate builder', () => {
      const service = TerragruntBuilder.forValidate().build();
      expect(service.command).toBe('validate');
    });

    test('forFmt() creates fmt builder', () => {
      const service = TerragruntBuilder.forFmt().build();
      expect(service.command).toBe('fmt');
    });

    test('forOutput() creates output builder', () => {
      const service = TerragruntBuilder.forOutput().build();
      expect(service.command).toBe('output');
    });

    test('forGraphDependencies() creates graph-dependencies builder', () => {
      const service = TerragruntBuilder.forGraphDependencies().build();
      expect(service.command).toBe('graph-dependencies');
    });

    test('forValidateInputs() creates validate-inputs builder', () => {
      const service = TerragruntBuilder.forValidateInputs().build();
      expect(service.command).toBe('validate-inputs');
    });
  });

  describe('terragrunt-specific configuration', () => {
    test('withTerragruntConfig sets config path', () => {
      const service = TerragruntBuilder.forPlan().withTerragruntConfig('./terragrunt.hcl').build();
      expect(service.terragruntConfig).toBe('./terragrunt.hcl');
    });

    test('withRunAll enables run-all mode', () => {
      const service = TerragruntBuilder.forPlan().withRunAll().build();
      expect(service.runAll).toBe(true);
    });

    test('withNoAutoInit disables auto-init', () => {
      const service = TerragruntBuilder.forPlan().withNoAutoInit().build();
      expect(service.noAutoInit).toBe(true);
    });

    test('withNoAutoRetry disables auto-retry', () => {
      const service = TerragruntBuilder.forPlan().withNoAutoRetry().build();
      expect(service.noAutoRetry).toBe(true);
    });

    test('withNonInteractive enables non-interactive mode', () => {
      const service = TerragruntBuilder.forPlan().withNonInteractive().build();
      expect(service.nonInteractive).toBe(true);
    });

    test('withTerragruntParallelism sets terragrunt parallelism', () => {
      const service = TerragruntBuilder.forPlan().withRunAll().withTerragruntParallelism(5).build();
      expect(service.terragruntParallelism).toBe(5);
    });

    test('withIncludeDir adds include directory', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withIncludeDir('./modules/vpc')
        .build();
      expect(service.includeDirs).toContain('./modules/vpc');
    });

    test('withExcludeDir adds exclude directory', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withExcludeDir('./modules/deprecated')
        .build();
      expect(service.excludeDirs).toContain('./modules/deprecated');
    });

    test('withIgnoreDependencyErrors enables ignore dependency errors', () => {
      const service = TerragruntBuilder.forPlan().withRunAll().withIgnoreDependencyErrors().build();
      expect(service.ignoreDependencyErrors).toBe(true);
    });

    test('withTerragruntSource sets source override', () => {
      const service = TerragruntBuilder.forPlan().withTerragruntSource('./local-modules').build();
      expect(service.terragruntSource).toBe('./local-modules');
    });

    test('withSourceMap adds source map entry', () => {
      const service = TerragruntBuilder.forPlan()
        .withSourceMap('git::https://example.com/modules.git', './local')
        .build();
      expect(service.sourceMap.get('git::https://example.com/modules.git')).toBe('./local');
    });

    test('withIamRole sets IAM role', () => {
      const service = TerragruntBuilder.forPlan()
        .withIamRole('arn:aws:iam::123456789012:role/TerraformRole')
        .build();
      expect(service.iamRole).toBe('arn:aws:iam::123456789012:role/TerraformRole');
    });

    test('withIamRoleAndSession sets both role and session', () => {
      const service = TerragruntBuilder.forPlan()
        .withIamRoleAndSession('arn:aws:iam::123456789012:role/TerraformRole', 'terragrunt-session')
        .build();
      expect(service.iamRole).toBe('arn:aws:iam::123456789012:role/TerraformRole');
      expect(service.iamRoleSessionName).toBe('terragrunt-session');
    });
  });

  describe('terraform configuration methods', () => {
    test('withEnvironmentVariables sets multiple environment variables', () => {
      const service = TerragruntBuilder.forPlan()
        .withEnvironmentVariables({ TF_LOG: 'DEBUG', AWS_REGION: 'us-east-1' })
        .build();
      expect(service.environment.get('TF_LOG')).toBe('DEBUG');
      expect(service.environment.get('AWS_REGION')).toBe('us-east-1');
    });

    test('withEnvironmentVariable sets single environment variable', () => {
      const service = TerragruntBuilder.forPlan()
        .withEnvironmentVariable('TF_LOG', 'DEBUG')
        .build();
      expect(service.environment.get('TF_LOG')).toBe('DEBUG');
    });

    test('withParallelism sets parallelism level', () => {
      const service = TerragruntBuilder.forPlan().withParallelism(10).build();
      expect(service.parallelism).toBe(10);
    });

    test('withParallelism throws for level < 1', () => {
      expect(() => TerragruntBuilder.forPlan().withParallelism(0)).toThrow(
        'Parallelism level must be at least 1',
      );
    });

    test('withTerragruntParallelism throws for level < 1', () => {
      expect(() => TerragruntBuilder.forPlan().withTerragruntParallelism(0)).toThrow(
        'Terragrunt parallelism level must be at least 1',
      );
    });

    test('withoutRefresh disables refresh', () => {
      const service = TerragruntBuilder.forPlan().withoutRefresh().build();
      expect(service.refresh).toBe(false);
    });

    test('withRefresh re-enables refresh after disabling', () => {
      const service = TerragruntBuilder.forPlan().withoutRefresh().withRefresh().build();
      expect(service.refresh).toBe(true);
    });

    test('withDryRun enables dry run', () => {
      const service = TerragruntBuilder.forPlan().withDryRun().build();
      expect(service.dryRun).toBe(true);
    });

    test('withNoColor enables no-color', () => {
      const service = TerragruntBuilder.forPlan().withNoColor().build();
      expect(service.noColor).toBe(true);
    });

    test('withCompactWarnings enables compact warnings', () => {
      const service = TerragruntBuilder.forPlan().withCompactWarnings().build();
      expect(service.compactWarnings).toBe(true);
    });

    test('withLockTimeout sets lock timeout', () => {
      const service = TerragruntBuilder.forPlan().withLockTimeout('10s').build();
      expect(service.lockTimeout).toBe('10s');
    });

    test('withReconfigure enables reconfigure', () => {
      const service = TerragruntBuilder.forInit().withReconfigure().build();
      expect(service.reconfigure).toBe(true);
    });

    test('withMigrateState enables migrate state', () => {
      const service = TerragruntBuilder.forInit().withMigrateState().build();
      expect(service.migrateState).toBe(true);
    });

    test('withPlanFile sets plan file', () => {
      const service = TerragruntBuilder.forApply().withPlanFile('plan.out').build();
      expect(service.planFile).toBe('plan.out');
    });

    test('withOutFile sets output file', () => {
      const service = TerragruntBuilder.forPlan().withOutFile('plan.out').build();
      expect(service.outFile).toBe('plan.out');
    });

    test('withVarFile adds var file', () => {
      const service = TerragruntBuilder.forPlan().withVarFile('vars.tfvars').build();
      expect(service.varFiles).toContain('vars.tfvars');
    });

    test('withVarFiles adds multiple var files', () => {
      const service = TerragruntBuilder.forPlan().withVarFiles(['a.tfvars', 'b.tfvars']).build();
      expect(service.varFiles).toContain('a.tfvars');
      expect(service.varFiles).toContain('b.tfvars');
    });

    test('withVarFile deduplicates', () => {
      const service = TerragruntBuilder.forPlan()
        .withVarFile('vars.tfvars')
        .withVarFile('vars.tfvars')
        .build();
      expect(service.varFiles.filter(f => f === 'vars.tfvars')).toHaveLength(1);
    });

    test('withBackendConfig adds backend config', () => {
      const service = TerragruntBuilder.forInit().withBackendConfig('bucket', 'my-bucket').build();
      expect(service.backendConfig.get('bucket')).toBe('my-bucket');
    });

    test('withBackendConfigs adds multiple configs', () => {
      const service = TerragruntBuilder.forInit()
        .withBackendConfigs({ bucket: 'b', key: 'k' })
        .build();
      expect(service.backendConfig.get('bucket')).toBe('b');
      expect(service.backendConfig.get('key')).toBe('k');
    });

    test('withTarget deduplicates', () => {
      const service = TerragruntBuilder.forPlan()
        .withTarget('module.vpc')
        .withTarget('module.vpc')
        .build();
      expect(service.targets.filter(t => t === 'module.vpc')).toHaveLength(1);
    });
  });

  describe('terragrunt-specific advanced methods', () => {
    test('withTerragruntWorkingDir sets working directory', () => {
      const service = TerragruntBuilder.forPlan().withTerragruntWorkingDir('./modules').build();
      expect(service.terragruntWorkingDir).toBe('./modules');
    });

    test('withIncludeDirs adds multiple include dirs', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withIncludeDirs(['./a', './b'])
        .build();
      expect(service.includeDirs).toContain('./a');
      expect(service.includeDirs).toContain('./b');
    });

    test('withIncludeDir deduplicates', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withIncludeDir('./a')
        .withIncludeDir('./a')
        .build();
      expect(service.includeDirs.filter(d => d === './a')).toHaveLength(1);
    });

    test('withExcludeDirs adds multiple exclude dirs', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withExcludeDirs(['./x', './y'])
        .build();
      expect(service.excludeDirs).toContain('./x');
      expect(service.excludeDirs).toContain('./y');
    });

    test('withExcludeDir deduplicates', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withExcludeDir('./x')
        .withExcludeDir('./x')
        .build();
      expect(service.excludeDirs.filter(d => d === './x')).toHaveLength(1);
    });

    test('withIgnoreExternalDependencies', () => {
      const service = TerragruntBuilder.forPlan().withIgnoreExternalDependencies().build();
      expect(service.ignoreExternalDependencies).toBe(true);
    });

    test('withIncludeExternalDependencies', () => {
      const service = TerragruntBuilder.forPlan().withIncludeExternalDependencies().build();
      expect(service.includeExternalDependencies).toBe(true);
    });

    test('withSourceMaps adds multiple source maps', () => {
      const service = TerragruntBuilder.forPlan()
        .withSourceMaps({ 'git::a': './a', 'git::b': './b' })
        .build();
      expect(service.sourceMap.get('git::a')).toBe('./a');
      expect(service.sourceMap.get('git::b')).toBe('./b');
    });

    test('withDownloadDir sets download directory', () => {
      const service = TerragruntBuilder.forPlan().withDownloadDir('/tmp/tg').build();
      expect(service.downloadDir).toBe('/tmp/tg');
    });

    test('withStrictInclude enables strict include', () => {
      const service = TerragruntBuilder.forPlan().withStrictInclude().build();
      expect(service.strictInclude).toBe(true);
    });

    test('withTerragruntMajorVersion sets version', () => {
      const service = TerragruntBuilder.forPlan().withTerragruntMajorVersion(1).build();
      expect(service.terragruntMajorVersion).toBe(1);
    });

    test('terragruntMajorVersion defaults to 0', () => {
      const service = TerragruntBuilder.forPlan().build();
      expect(service.terragruntMajorVersion).toBe(0);
    });
  });

  describe('reset', () => {
    test('resets all properties to defaults', () => {
      const builder = TerragruntBuilder.forPlan()
        .withWorkingDirectory('./infra')
        .withVariable('env', 'prod')
        .withEnvironmentVariable('TF_LOG', 'DEBUG')
        .withVarFile('vars.tfvars')
        .withBackendConfig('bucket', 'b')
        .withTarget('module.vpc')
        .withAutoApprove()
        .withDryRun()
        .withNoColor()
        .withCompactWarnings()
        .withoutRefresh()
        .withReconfigure()
        .withMigrateState()
        .withPlanFile('plan.out')
        .withOutFile('out.tfplan')
        .withParallelism(10)
        .withLockTimeout('5s')
        .withTerragruntConfig('./tg.hcl')
        .withTerragruntWorkingDir('./tgwd')
        .withRunAll()
        .withNoAutoInit()
        .withNoAutoRetry()
        .withNonInteractive()
        .withTerragruntParallelism(3)
        .withIncludeDir('./inc')
        .withExcludeDir('./exc')
        .withIgnoreDependencyErrors()
        .withIgnoreExternalDependencies()
        .withIncludeExternalDependencies()
        .withTerragruntSource('./src')
        .withSourceMap('a', 'b')
        .withDownloadDir('/tmp')
        .withIamRoleAndSession('arn:role', 'session')
        .withStrictInclude()
        .withTerragruntMajorVersion(1);

      builder.reset();

      expect(() => builder.build()).toThrow('Terragrunt command is required');
    });

    test('reset allows reuse with new command', () => {
      const builder = TerragruntBuilder.forPlan().withVariable('env', 'prod');

      builder.reset();
      builder.withCommand('apply');

      const service = builder.build();
      expect(service.command).toBe('apply');
      expect(service.variables.size).toBe(0);
    });
  });

  describe('validation', () => {
    test('withCommand rejects invalid command', () => {
      expect(() => TerragruntBuilder.create().withCommand('invalid-cmd' as any)).toThrow(
        'Invalid Terragrunt command',
      );
    });
  });

  describe('build with environment variables', () => {
    test('transfers environment variables to service', () => {
      const service = TerragruntBuilder.forPlan()
        .withEnvironmentVariable('TF_LOG', 'DEBUG')
        .withEnvironmentVariable('AWS_REGION', 'us-east-1')
        .build();
      expect(service.environment.get('TF_LOG')).toBe('DEBUG');
      expect(service.environment.get('AWS_REGION')).toBe('us-east-1');
    });
  });

  describe('command generation', () => {
    test('generates basic terragrunt plan command', () => {
      const service = TerragruntBuilder.forPlan().build();
      const command = service.buildCommand();
      expect(command).toEqual(['terragrunt', 'plan']);
    });

    test('generates run-all plan command', () => {
      const service = TerragruntBuilder.forPlan().withRunAll().build();
      const command = service.buildCommand();
      expect(command[0]).toBe('terragrunt');
      expect(command[1]).toBe('run-all');
      expect(command[2]).toBe('plan');
    });

    test('generates command with terragrunt flags', () => {
      const service = TerragruntBuilder.forPlan().withNonInteractive().withNoAutoInit().build();
      const command = service.buildCommand();
      expect(command).toContain('--terragrunt-non-interactive');
      expect(command).toContain('--terragrunt-no-auto-init');
    });

    test('generates command with include/exclude dirs', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withIncludeDir('./modules/vpc')
        .withExcludeDir('./modules/deprecated')
        .build();
      const command = service.buildCommand();
      expect(command).toContain('--terragrunt-include-dir');
      expect(command).toContain('./modules/vpc');
      expect(command).toContain('--terragrunt-exclude-dir');
      expect(command).toContain('./modules/deprecated');
    });

    test('generates command with terraform variables', () => {
      const service = TerragruntBuilder.forPlan().withVariable('environment', 'prod').build();
      const command = service.buildCommand();
      expect(command).toContain('-var');
      expect(command).toContain('environment=prod');
    });

    test('generates apply command with auto-approve', () => {
      const service = TerragruntBuilder.forApply().withAutoApprove().build();
      const command = service.buildCommand();
      expect(command).toContain('-auto-approve');
    });

    test('generates destroy command with targets', () => {
      const service = TerragruntBuilder.forDestroy()
        .withTargets(['module.vpc', 'aws_instance.web'])
        .withAutoApprove()
        .build();
      const command = service.buildCommand();
      expect(command).toContain('-target');
      expect(command).toContain('module.vpc');
    });

    test('v1: generates run --all plan instead of run-all plan', () => {
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withTerragruntMajorVersion(1)
        .build();
      const command = service.buildCommand();
      expect(command[0]).toBe('terragrunt');
      expect(command[1]).toBe('run');
      expect(command[2]).toBe('--all');
      expect(command[3]).toBe('plan');
    });

    test('v1: generates --non-interactive instead of --terragrunt-non-interactive', () => {
      const service = TerragruntBuilder.forPlan()
        .withNonInteractive()
        .withTerragruntMajorVersion(1)
        .build();
      const command = service.buildCommand();
      expect(command).toContain('--non-interactive');
      expect(command).not.toContain('--terragrunt-non-interactive');
    });

    test('v1: hclfmt becomes hcl fmt', () => {
      const service = TerragruntBuilder.forHclFmt().withTerragruntMajorVersion(1).build();
      const command = service.buildCommand();
      expect(command).toEqual(['terragrunt', 'hcl', 'fmt']);
    });
  });

  describe('clone', () => {
    test('clone creates a copy with same configuration', () => {
      const original = TerragruntBuilder.forPlan()
        .withWorkingDirectory('./infra')
        .withVariable('env', 'prod')
        .withRunAll()
        .withNonInteractive()
        .build();

      const cloned = original.clone();

      expect(cloned.command).toBe(original.command);
      expect(cloned.workingDirectory).toBe(original.workingDirectory);
      expect(cloned.variables.get('env')).toBe('prod');
      expect(cloned.runAll).toBe(true);
      expect(cloned.nonInteractive).toBe(true);
    });

    test('clone creates independent instance', () => {
      const original = TerragruntBuilder.forPlan().withVariable('env', 'prod').build();

      const cloned = original.clone();
      cloned.addVariable('region', 'us-east-1');

      expect(original.variables.has('region')).toBe(false);
      expect(cloned.variables.has('region')).toBe(true);
    });
  });
});

describe('TerragruntBuilderFactory', () => {
  describe('init operations', () => {
    test('init() creates init service', () => {
      const service = TerragruntBuilderFactory.init('./infra');
      expect(service.command).toBe('init');
      expect(service.nonInteractive).toBe(true);
    });

    test('runAllInit() creates run-all init', () => {
      const service = TerragruntBuilderFactory.runAllInit('./infra');
      expect(service.runAll).toBe(true);
    });
  });

  describe('plan operations', () => {
    test('plan() creates plan service', () => {
      const service = TerragruntBuilderFactory.plan('./infra');
      expect(service.command).toBe('plan');
    });

    test('runAllPlan() creates run-all plan', () => {
      const service = TerragruntBuilderFactory.runAllPlan('./infra');
      expect(service.runAll).toBe(true);
    });

    test('planWithTargets() creates plan with targets', () => {
      const service = TerragruntBuilderFactory.planWithTargets('./infra', ['module.vpc']);
      expect(service.targets).toContain('module.vpc');
    });
  });

  describe('apply operations', () => {
    test('apply() creates apply with auto-approve', () => {
      const service = TerragruntBuilderFactory.apply('./infra');
      expect(service.autoApprove).toBe(true);
    });

    test('runAllApply() creates run-all apply', () => {
      const service = TerragruntBuilderFactory.runAllApply('./infra');
      expect(service.runAll).toBe(true);
      expect(service.autoApprove).toBe(true);
    });

    test('applyWithTargets() creates apply with targets', () => {
      const service = TerragruntBuilderFactory.applyWithTargets('./infra', ['module.vpc']);
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
    });
  });

  describe('destroy operations', () => {
    test('destroy() creates destroy with auto-approve', () => {
      const service = TerragruntBuilderFactory.destroy('./infra');
      expect(service.autoApprove).toBe(true);
    });

    test('runAllDestroy() creates run-all destroy', () => {
      const service = TerragruntBuilderFactory.runAllDestroy('./infra');
      expect(service.runAll).toBe(true);
      expect(service.autoApprove).toBe(true);
    });

    test('destroyWithTargets() creates destroy with targets', () => {
      const service = TerragruntBuilderFactory.destroyWithTargets('./infra', ['module.vpc']);
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
    });
  });

  describe('factory with variables (branch coverage)', () => {
    test('plan with variables', () => {
      const service = TerragruntBuilderFactory.plan('./infra', { env: 'prod' });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('runAllPlan with variables', () => {
      const service = TerragruntBuilderFactory.runAllPlan('./infra', { env: 'prod' });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('planWithOutput without variables', () => {
      const service = TerragruntBuilderFactory.planWithOutput('./infra', 'plan.out');
      expect(service.outFile).toBe('plan.out');
      expect(service.variables.size).toBe(0);
    });

    test('planWithOutput with variables', () => {
      const service = TerragruntBuilderFactory.planWithOutput('./infra', 'plan.out', {
        env: 'prod',
      });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('planWithTargets with variables', () => {
      const service = TerragruntBuilderFactory.planWithTargets('./infra', ['module.vpc'], {
        env: 'prod',
      });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('apply with variables', () => {
      const service = TerragruntBuilderFactory.apply('./infra', { env: 'prod' });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('runAllApply with variables', () => {
      const service = TerragruntBuilderFactory.runAllApply('./infra', { env: 'prod' });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('applyPlan', () => {
      const service = TerragruntBuilderFactory.applyPlan('./infra', 'plan.out');
      expect(service.planFile).toBe('plan.out');
      expect(service.autoApprove).toBe(true);
    });

    test('applyWithTargets with variables', () => {
      const service = TerragruntBuilderFactory.applyWithTargets('./infra', ['module.vpc'], {
        env: 'prod',
      });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('destroy with variables', () => {
      const service = TerragruntBuilderFactory.destroy('./infra', { env: 'prod' });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('runAllDestroy with variables', () => {
      const service = TerragruntBuilderFactory.runAllDestroy('./infra', { env: 'prod' });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('destroyWithTargets with variables', () => {
      const service = TerragruntBuilderFactory.destroyWithTargets('./infra', ['module.vpc'], {
        env: 'prod',
      });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('builder without command', () => {
      const builder = TerragruntBuilderFactory.builder();
      expect(() => builder.build()).toThrow();
    });

    test('builder with command', () => {
      const builder = TerragruntBuilderFactory.builder('plan');
      const service = builder.build();
      expect(service.command).toBe('plan');
    });

    test('validate', () => {
      const service = TerragruntBuilderFactory.validate('./infra');
      expect(service.command).toBe('validate');
    });

    test('runAllValidate', () => {
      const service = TerragruntBuilderFactory.runAllValidate('./infra');
      expect(service.command).toBe('validate');
      expect(service.runAll).toBe(true);
    });

    test('fmt', () => {
      const service = TerragruntBuilderFactory.fmt('./infra');
      expect(service.command).toBe('fmt');
    });

    test('output', () => {
      const service = TerragruntBuilderFactory.output('./infra');
      expect(service.command).toBe('output');
    });
  });

  describe('other operations', () => {
    test('hclFmt() creates hclfmt service', () => {
      const service = TerragruntBuilderFactory.hclFmt('./infra');
      expect(service.command).toBe('hclfmt');
    });

    test('graphDependencies() creates graph-dependencies service', () => {
      const service = TerragruntBuilderFactory.graphDependencies('./infra');
      expect(service.command).toBe('graph-dependencies');
    });

    test('validateInputs() creates validate-inputs service', () => {
      const service = TerragruntBuilderFactory.validateInputs('./infra');
      expect(service.command).toBe('validate-inputs');
    });
  });
});
