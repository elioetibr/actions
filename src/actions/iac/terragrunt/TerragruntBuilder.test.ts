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
  });

  describe('terragrunt-specific configuration', () => {
    test('withTerragruntConfig sets config path', () => {
      const service = TerragruntBuilder.forPlan()
        .withTerragruntConfig('./terragrunt.hcl')
        .build();
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
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withTerragruntParallelism(5)
        .build();
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
      const service = TerragruntBuilder.forPlan()
        .withRunAll()
        .withIgnoreDependencyErrors()
        .build();
      expect(service.ignoreDependencyErrors).toBe(true);
    });

    test('withTerragruntSource sets source override', () => {
      const service = TerragruntBuilder.forPlan()
        .withTerragruntSource('./local-modules')
        .build();
      expect(service.terragruntSource).toBe('./local-modules');
    });

    test('withSourceMap adds source map entry', () => {
      const service = TerragruntBuilder.forPlan()
        .withSourceMap('git::https://example.com/modules.git', './local')
        .build();
      expect(
        service.sourceMap.get('git::https://example.com/modules.git')
      ).toBe('./local');
    });

    test('withIamRole sets IAM role', () => {
      const service = TerragruntBuilder.forPlan()
        .withIamRole('arn:aws:iam::123456789012:role/TerraformRole')
        .build();
      expect(service.iamRole).toBe(
        'arn:aws:iam::123456789012:role/TerraformRole'
      );
    });

    test('withIamRoleAndSession sets both role and session', () => {
      const service = TerragruntBuilder.forPlan()
        .withIamRoleAndSession(
          'arn:aws:iam::123456789012:role/TerraformRole',
          'terragrunt-session'
        )
        .build();
      expect(service.iamRole).toBe(
        'arn:aws:iam::123456789012:role/TerraformRole'
      );
      expect(service.iamRoleSessionName).toBe('terragrunt-session');
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
      const service = TerragruntBuilder.forPlan()
        .withNonInteractive()
        .withNoAutoInit()
        .build();
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
      const service = TerragruntBuilder.forPlan()
        .withVariable('environment', 'prod')
        .build();
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
      const original = TerragruntBuilder.forPlan()
        .withVariable('env', 'prod')
        .build();

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
      const service = TerragruntBuilderFactory.planWithTargets('./infra', [
        'module.vpc',
      ]);
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
      const service = TerragruntBuilderFactory.applyWithTargets('./infra', [
        'module.vpc',
      ]);
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
      const service = TerragruntBuilderFactory.destroyWithTargets('./infra', [
        'module.vpc',
      ]);
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
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
