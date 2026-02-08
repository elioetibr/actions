import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Shared Vite configuration for building GitHub Actions tool library.
 *
 * Produces dist/tools/lib.mjs — the central entry point that all action
 * shims (main.mjs) import from. Bundles all npm dependencies (including
 * @actions/core, @actions/exec) so dist/ is self-contained. Only Node.js
 * built-in modules are externalized.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: 'esnext',
    outDir: 'dist/tools',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/tools/lib.ts'),
      fileName: 'lib',
      formats: ['es'],
    },
    rollupOptions: {
      // Only externalize Node.js built-in modules
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
      output: {
        entryFileNames: '[name].mjs',
        chunkFileNames: 'libs/[name].mjs',
        // Code splitting: each tool runner becomes its own chunk
        manualChunks(id) {
          if (id.includes('src/tools/docker/')) return 'docker-buildx-images';
          if (id.includes('src/tools/terraform/')) return 'terraform';
          if (id.includes('src/tools/terragrunt/')) return 'terragrunt';
          if (id.includes('src/tools/common/')) return 'tools';
          if (id.includes('src/agents/')) return 'agents';
        },
      },
    },
    minify: false,
    sourcemap: true,
    // Ensure CommonJS dependencies (@actions/core, etc.) are bundled correctly
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Resolve TypeScript path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Treat as Node.js environment
  ssr: {
    noExternal: true,
  },
  esbuild: {
    target: 'node20',
    platform: 'node',
  },
});
