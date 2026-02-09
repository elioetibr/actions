import { TerraformBuilderFactory } from './TerraformBuilderFactory';

describe('TerraformBuilderFactory', () => {
  describe('builder', () => {
    test('creates empty builder without command', () => {
      const builder = TerraformBuilderFactory.builder();
      expect(() => builder.build()).toThrow();
    });

    test('creates builder with command', () => {
      const builder = TerraformBuilderFactory.builder('plan');
      const service = builder.build();
      expect(service.command).toBe('plan');
    });
  });

  describe('init operations', () => {
    test('init without backend config', () => {
      const service = TerraformBuilderFactory.init('./infra');
      expect(service.command).toBe('init');
      expect(service.workingDirectory).toBe('./infra');
    });

    test('init with backend config', () => {
      const service = TerraformBuilderFactory.init('./infra', {
        bucket: 'my-bucket',
        key: 'state.tfstate',
      });
      expect(service.command).toBe('init');
      expect(service.backendConfig.get('bucket')).toBe('my-bucket');
      expect(service.backendConfig.get('key')).toBe('state.tfstate');
    });

    test('initWithReconfigure', () => {
      const service = TerraformBuilderFactory.initWithReconfigure('./infra');
      expect(service.command).toBe('init');
      expect(service.reconfigure).toBe(true);
    });

    test('initWithMigrateState', () => {
      const service = TerraformBuilderFactory.initWithMigrateState('./infra');
      expect(service.command).toBe('init');
      expect(service.migrateState).toBe(true);
    });
  });

  describe('validate and format', () => {
    test('validate', () => {
      const service = TerraformBuilderFactory.validate('./infra');
      expect(service.command).toBe('validate');
    });

    test('fmt', () => {
      const service = TerraformBuilderFactory.fmt('./infra');
      expect(service.command).toBe('fmt');
    });
  });

  describe('plan operations', () => {
    test('plan without variables', () => {
      const service = TerraformBuilderFactory.plan('./infra');
      expect(service.command).toBe('plan');
      expect(service.variables.size).toBe(0);
    });

    test('plan with variables', () => {
      const service = TerraformBuilderFactory.plan('./infra', {
        env: 'prod',
      });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('planWithOutput without variables', () => {
      const service = TerraformBuilderFactory.planWithOutput(
        './infra',
        'plan.out'
      );
      expect(service.command).toBe('plan');
      expect(service.outFile).toBe('plan.out');
      expect(service.variables.size).toBe(0);
    });

    test('planWithOutput with variables', () => {
      const service = TerraformBuilderFactory.planWithOutput(
        './infra',
        'plan.out',
        { env: 'prod' }
      );
      expect(service.outFile).toBe('plan.out');
      expect(service.variables.get('env')).toBe('prod');
    });

    test('planWithTargets without variables', () => {
      const service = TerraformBuilderFactory.planWithTargets('./infra', [
        'module.vpc',
      ]);
      expect(service.targets).toContain('module.vpc');
      expect(service.variables.size).toBe(0);
    });

    test('planWithTargets with variables', () => {
      const service = TerraformBuilderFactory.planWithTargets(
        './infra',
        ['module.vpc'],
        { env: 'staging' }
      );
      expect(service.targets).toContain('module.vpc');
      expect(service.variables.get('env')).toBe('staging');
    });
  });

  describe('apply operations', () => {
    test('apply without variables', () => {
      const service = TerraformBuilderFactory.apply('./infra');
      expect(service.command).toBe('apply');
      expect(service.variables.size).toBe(0);
    });

    test('apply with variables', () => {
      const service = TerraformBuilderFactory.apply('./infra', {
        env: 'prod',
      });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('applyWithAutoApprove without variables', () => {
      const service = TerraformBuilderFactory.applyWithAutoApprove('./infra');
      expect(service.autoApprove).toBe(true);
      expect(service.variables.size).toBe(0);
    });

    test('applyWithAutoApprove with variables', () => {
      const service = TerraformBuilderFactory.applyWithAutoApprove('./infra', {
        env: 'prod',
      });
      expect(service.autoApprove).toBe(true);
      expect(service.variables.get('env')).toBe('prod');
    });

    test('applyPlan', () => {
      const service = TerraformBuilderFactory.applyPlan(
        './infra',
        'plan.out'
      );
      expect(service.command).toBe('apply');
      expect(service.planFile).toBe('plan.out');
      expect(service.autoApprove).toBe(true);
    });

    test('applyWithTargets without variables', () => {
      const service = TerraformBuilderFactory.applyWithTargets('./infra', [
        'module.vpc',
      ]);
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
      expect(service.variables.size).toBe(0);
    });

    test('applyWithTargets with variables', () => {
      const service = TerraformBuilderFactory.applyWithTargets(
        './infra',
        ['module.vpc'],
        { env: 'prod' }
      );
      expect(service.targets).toContain('module.vpc');
      expect(service.variables.get('env')).toBe('prod');
    });
  });

  describe('destroy operations', () => {
    test('destroy without variables', () => {
      const service = TerraformBuilderFactory.destroy('./infra');
      expect(service.command).toBe('destroy');
      expect(service.variables.size).toBe(0);
    });

    test('destroy with variables', () => {
      const service = TerraformBuilderFactory.destroy('./infra', {
        env: 'prod',
      });
      expect(service.variables.get('env')).toBe('prod');
    });

    test('destroyWithAutoApprove without variables', () => {
      const service =
        TerraformBuilderFactory.destroyWithAutoApprove('./infra');
      expect(service.autoApprove).toBe(true);
      expect(service.variables.size).toBe(0);
    });

    test('destroyWithAutoApprove with variables', () => {
      const service = TerraformBuilderFactory.destroyWithAutoApprove(
        './infra',
        { env: 'prod' }
      );
      expect(service.autoApprove).toBe(true);
      expect(service.variables.get('env')).toBe('prod');
    });

    test('destroyWithTargets without variables', () => {
      const service = TerraformBuilderFactory.destroyWithTargets('./infra', [
        'module.vpc',
      ]);
      expect(service.targets).toContain('module.vpc');
      expect(service.autoApprove).toBe(true);
      expect(service.variables.size).toBe(0);
    });

    test('destroyWithTargets with variables', () => {
      const service = TerraformBuilderFactory.destroyWithTargets(
        './infra',
        ['module.vpc'],
        { env: 'prod' }
      );
      expect(service.targets).toContain('module.vpc');
      expect(service.variables.get('env')).toBe('prod');
    });
  });

  describe('other operations', () => {
    test('output', () => {
      const service = TerraformBuilderFactory.output('./infra');
      expect(service.command).toBe('output');
    });

    test('show without plan file', () => {
      const service = TerraformBuilderFactory.show('./infra');
      expect(service.command).toBe('show');
      expect(service.planFile).toBeUndefined();
    });

    test('show with plan file', () => {
      const service = TerraformBuilderFactory.show('./infra', 'plan.out');
      expect(service.command).toBe('show');
      expect(service.planFile).toBe('plan.out');
    });
  });
});
