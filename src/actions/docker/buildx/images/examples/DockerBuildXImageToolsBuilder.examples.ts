// Example usage of DockerBuildXImageToolsService
import { DockerBuildXImageToolsService } from '../index';
import { DockerBuildXImageToolsBuilderFactoryExamples } from './DockerBuildXImageToolsBuilderFactory.examples';

function main(): void {
  console.log('=== Docker BuildX ImageTools Demo ===\n');

  // Create a new instance
  const imageTools = new DockerBuildXImageToolsService('create', false);

  console.log('1. Initial state:');
  console.log(imageTools.toString());
  console.log();

  // Add some metadata
  imageTools
    .addMetaData('--tag', 'myapp:latest')
    .addMetaData('--tag', 'myapp:v1.0.0')
    .addMetaData('--file', 'Dockerfile')
    .addMetaData('', '.') // context directory (no key)
    .addMetaData('--platform', 'linux/amd64')
    .addMetaData('--platform', 'linux/arm64');

  console.log('2. After adding metadata:');
  console.log(imageTools.toString());
  console.log();

  // Show command array
  console.log('3. Command array:');
  console.log(imageTools.buildCommand());
  console.log();

  // Show multi-line command
  console.log('4. Multi-line command:');
  console.log(imageTools.toStringMultiLineCommand());
  console.log();

  // Test with string list format
  const stringListTools = new DockerBuildXImageToolsService('inspect', true);
  stringListTools.addMetaData('--format', '{{.Name}}').addMetaData('', 'nginx:latest');

  console.log('5. String list format:');
  console.log(stringListTools.toString());
  console.log();

  console.log('6. String list command:');
  console.log(stringListTools.toStringMultiLineCommand());
  console.log();

  // Demonstrate metadata operations
  console.log('7. Metadata operations:');
  console.log('Tags before:', imageTools.getMetaData('--tag'));

  imageTools.setMetaData('--tag', 'myapp:final');
  console.log('Tags after setMetaData:', imageTools.getMetaData('--tag'));

  console.log('First platform:', imageTools.getFirstMetaData('--platform'));

  imageTools.removeMetaData('--platform');
  console.log('Platforms after removal:', imageTools.getMetaData('--platform'));
  console.log();

  console.log('8. DockerBuildXImageToolsExamples:');
  console.log(
    DockerBuildXImageToolsBuilderFactoryExamples.createMultiPlatformManifest().toStringMultiLineCommand(),
  );
  console.log(DockerBuildXImageToolsBuilderFactoryExamples.inspectImageVerbose().toString());
  console.log(DockerBuildXImageToolsBuilderFactoryExamples.createWithMetadata().toString());
  console.log(DockerBuildXImageToolsBuilderFactoryExamples.dryRunCreate().toString());

  console.log('9. Final state:');
  console.log(imageTools.toString());
}

// Error handling example
function errorExample(): void {
  console.log('\n=== Error Handling Demo ===\n');

  const tools = new DockerBuildXImageToolsService('build');

  try {
    // This should throw an error
    tools.addMetaData('valid-key', null as any);
  } catch (error) {
    console.log('Caught expected error:', (error as Error).message);
  }

  try {
    // This should also throw an error
    tools.addMetaData(undefined as any, 'valid-value');
  } catch (error) {
    console.log('Caught expected error:', (error as Error).message);
  }
}

// Run the examples
if (require.main === module) {
  main();
  errorExample();
}
