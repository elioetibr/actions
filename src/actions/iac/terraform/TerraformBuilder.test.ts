import { TerraformBuilder } from './TerraformBuilder';
import { TerraformBuilderFactory } from './TerraformBuilderFactory';

describe('TerraformBuilder', () => {
  describe('static factory methods', () => {
    test('create() creates an empty builder', () => {
      const builder = TerraformBuilder.create();
      expect(() => builder.build()).toThrow('Terraform command is required');
    });

    test('create(command) creates a builder with command', () => {
      const builder = TerraformBuilder.create('plan');
      const service = builder.build();
      expect(service.command).toBe('plan');
    });

    test('forInit() creates init builder', () => {
      const service = TerraformBuilder.forInit().build();
      expect(service.command).toBe('init');
    });

    test('forValidate() creates validate builder', () => {
      const service = TerraformBuilder.forValidate().build();
      expect(service.command).toBe('validate');
    });

    test('forFmt() creates fmt builder', () => {
      const service = TerraformBuilder.forFmt().build();
      expect(service.command).toBe('fmt');
    });

    test('forPlan() creates plan builder', () => {
      const service = TerraformBuilder.forPlan().build();
      expect(service.command).toBe('plan');
    });

    test('forApply() creates apply builder', () => {
      const service = TerraformBuilder.forApply().build();
      expect(service.command).toBe('apply');
    });

    test('forDestroy() creates destroy builder', () => {
      const service = TerraformBuilder.forDestroy().build();
      expect(service.command).toBe('destroy');
    });
  });

  describe('fluent configuration', () => {
    test('withWorkingDirectory sets working directory', () => {
      const service = TerraformBuilder.forPlan()
        .withWorkingDirectory('./infrastructure')
        .build();
      expect(service.workingDirectory).toBe('./infrastructure');
    });

    test('withVariable adds a variable', () => {
      const service = TerraformBuilder.forPlan()
        .withVariable('environment', 'production')
        .build();
      expect(service.variables.get('environment')).toBe('production');
    });

    test('withVariables adds multiple variables', () => {
      const service = TerraformBuilder.forPlan()
        .withVariables({
          environment: 'production',
          region: 'us-east-1',
        })
        .build();
      expect(service.variables.get('environment')).toBe('production');
      expect(service.variables.get('region')).toBe('us-east-1');
    });

    test('withVarFile adds a var file', () => {
      const service = TerraformBuilder.forPlan()
        .withVarFile('./production.tfvars')
        .build();
      expect(service.varFiles).toContain('./production.tfvars');
    });

    test('withTarget adds a target', () => {
      const service = TerraformBuilder.forPlan()
        .withTarget('module.vpc')
        .build();
      expect(service.targets).toContain('module.vpc');
    });

    test('withTargets adds multiple targets', () => {
      const service = TerraformBuilder.forPlan()
        .withTargets(['module.vpc', 'aws_instance.web'])
        .build();
      expect(service.targets).toContain('module.vpc');
      expect(service.targets).toContain('aws_instance.web');
    });

    test('withAutoApprove enables auto-approve', () => {
      const service = TerraformBuilder.forApply().withAutoApprove().build();
      expect(service.autoApprove).toBe(true);
    });

    test('withOutFile sets output file', () => {
      const service = TerraformBuilder.forPlan()
        .withOutFile('./plan.tfplan')
        .build();
      expect(service.outFile).toBe('./plan.tfplan');
    });

    test('withPlanFile sets plan file', () => {
      const service = TerraformBuilder.forApply()
        .withPlanFile('./plan.tfplan')
        .build();
      expect(service.planFile).toBe('./plan.tfplan');
    });

    test('withNoColor enables no-color', () => {
      const service = TerraformBuilder.forPlan().withNoColor().build();
      expect(service.noColor).toBe(true);
    });

    test('withParallelism sets parallelism', () => {
      const service = TerraformBuilder.forPlan().withParallelism(10).build();
      expect(service.parallelism).toBe(10);
    });

    test('withLockTimeout sets lock timeout', () => {
      const service = TerraformBuilder.forPlan()
        .withLockTimeout('30s')
        .build();
      expect(service.lockTimeout).toBe('30s');
    });

    test('withoutRefresh disables refresh', () => {
      const service = TerraformBuilder.forPlan().withoutRefresh().build();
      expect(service.refresh).toBe(false);
    });

    test('withReconfigure enables reconfigure', () => {
      const service = TerraformBuilder.forInit().withReconfigure().build();
      expect(service.reconfigure).toBe(true);
    });

    test('withMigrateState enables migrate-state', () => {
      const service = TerraformBuilder.forInit().withMigrateState().build();
      expect(service.migrateState).toBe(true);
    });

    test('withBackendConfig adds backend config', () => {
      const service = TerraformBuilder.forInit()
        .withBackendConfig('bucket', 'my-bucket')
        .build();
      expect(service.backendConfig.get('bucket')).toBe('my-bucket');
    });
  });

  describe('command generation', () => {
    test('generates basic plan command', () => {
      const service = TerraformBuilder.forPlan().build();
      const command = service.buildCommand();
      expect(command).toEqual(['terraform', 'plan']);
    });

    test('generates plan command with variables', () => {
      const service = TerraformBuilder.forPlan()
        .withVariable('environment', 'prod')
        .build();
      const command = service.buildCommand();
      expect(command).toContain('-var');
      expect(command).toContain('environment=prod');
    });

    test('generates plan command with output file', () => {
      const service = TerraformBuilder.forPlan()
        .withOutFile('./plan.tfplan')
        .build();
      const command = service.buildCommand();
      expect(command).toContain('-out');
      expect(command).toContain('./plan.tfplan');
    });

    test('generates apply command with auto-approve', () => {
      const service = TerraformBuilder.forApply().withAutoApprove().build();
      const command = service.buildCommand();
      expect(command).toContain('-auto-approve');
    });

    test('generates apply command with plan file', () => {
      const service = TerraformBuilder.forApply()
        .withPlanFile('./plan.tfplan')
        .withAutoApprove()
        .build();
      const command = service.buildCommand();
      expect(command).toContain('./plan.tfplan');
    });

    test('generates destroy command with targets', () => {
      const service = TerraformBuilder.forDestroy()
        .withTargets(['module.vpc', 'aws_instance.web'])
        .withAutoApprove()
        .build();
      const command = service.buildCommand();
      expect(command).toContain('-target');
      expect(command).toContain('module.vpc');
      expect(command).toContain('aws_instance.web');
    });

    test('generates init command with backend config', () => {
      const service = TerraformBuilder.forInit()
        .withBackendConfigs({
          bucket: 'my-bucket',
          key: 'terraform.tfstate',
        })
        .build();
      const command = service.buildCommand();
      expect(command).toContain('-backend-config');
      expect(command).toContain('bucket=my-bucket');
      expect(command).toContain('key=terraform.tfstate');
    });
  });

  describe('validation', () => {
    test('throws error for invalid command', () => {
      expect(() =>
        TerraformBuilder.create().withCommand('invalid' as any)
      ).toThrow('Invalid Terraform command');
    });

    test('throws error for parallelism less than 1', () => {
      expect(() =>
        TerraformBuilder.forPlan().withParallelism(0)
      ).toThrow('Parallelism level must be at least 1');
    });
  });

  describe('reset', () => {
    test('reset clears all configuration', () => {
      const builder = TerraformBuilder.forPlan()
        .withVariable('env', 'prod')
        .withTarget('module.vpc')
        .withAutoApprove();

      builder.reset();

      expect(() => builder.build()).toThrow('Terraform command is required');
    });
  });
});

describe('TerraformBuilderFactory', () => {
  describe('init operations', () => {
    test('init() creates init service', () => {
      const service = TerraformBuilderFactory.init('./infra');
      expect(service.command).toBe('init');
      expect(service.workingDirectory).toBe('./infra');
    });

    test('initWithReconfigure() creates init with reconfigure', () => {
      const service = TerraformBuilderFactory.initWithReconfigure('./infra');
      expect(service.reconfigure).toBe(true);
    });

    test('initWithMigrateState() creates init with migrate-state', () => {
      const service = TerraformBuilderFactory.initWithMigrateState('./infra');
      expect(service.migrateState).toBe(true);
    });
  });

  describe('plan operations', () => {
    test('plan() creates plan service', () => {
      const service = TerraformBuilderFactory.plan('./infra');
      expect(service.command).toBe('plan');
    });

    test('planWithOutput() creates plan with output', () => {
      const service = TerraformBuilderFactory.planWithOutput(
        './infra',
        './plan.tfplan'
      );
      expect(service.outFile).toBe('./plan.tfplan');
    });

    test('planWithTargets() creates plan with targets', () => {
      const service = TerraformBuilderFactory.planWithTargets('./infra', [
        'module.vpc',
      ]);
      expect(service.targets).toContain('module.vpc');
    });
  });

  describe('apply operations', () => {
    test('apply() creates apply service', () => {
      const service = TerraformBuilderFactory.apply('./infra');
      expect(service.command).toBe('apply');
    });

    test('applyWithAutoApprove() creates apply with auto-approve', () => {
      const service = TerraformBuilderFactory.applyWithAutoApprove('./infra');
      expect(service.autoApprove).toBe(true);
    });

    test('applyPlan() creates apply from plan file', () => {
      const service = TerraformBuilderFactory.applyPlan(
        './infra',
        './plan.tfplan'
      );
      expect(service.planFile).toBe('./plan.tfplan');
      expect(service.autoApprove).toBe(true);
    });

    test('applyWithTargets() creates apply with targets', () => {
      const service = TerraformBuilderFactory.applyWithTargets('./infra', [
        'module.vpc',
      ]);
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
    });
  });

  describe('destroy operations', () => {
    test('destroy() creates destroy service', () => {
      const service = TerraformBuilderFactory.destroy('./infra');
      expect(service.command).toBe('destroy');
    });

    test('destroyWithAutoApprove() creates destroy with auto-approve', () => {
      const service = TerraformBuilderFactory.destroyWithAutoApprove('./infra');
      expect(service.autoApprove).toBe(true);
    });

    test('destroyWithTargets() creates destroy with targets', () => {
      const service = TerraformBuilderFactory.destroyWithTargets('./infra', [
        'module.vpc',
      ]);
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
    });
  });
});
