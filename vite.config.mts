import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';
import tsconfigPaths from 'vite-tsconfig-paths';

// Target runtime is Node 24 (GitHub Actions). Filter out built-in modules
// that only exist in newer Node versions than our target or are optional
// (e.g. node:sqlite is used by undici's SqliteCacheStore but never by our code).
const excludedBuiltins = new Set(['sea', 'sqlite']);
const node24Builtins = builtinModules.filter((m) => !excludedBuiltins.has(m) && !m.includes('sea'));

/**
 * Stub out node:sqlite — undici bundles SqliteCacheStore which imports it
 * at the top level, but our code never uses it.
 *
 * Why a transform hook? Vite uses module.isBuiltin() which returns true for
 * node:sqlite even on Node versions that don't list it in builtinModules.
 * This causes Vite to externalize it before resolve.alias or resolveId hooks
 * can intercept it. The transform hook rewrites the require() call *before*
 * the CJS plugin converts it to an ESM import.
 */
function stubNodeSqlite(): Plugin {
  const sqliteRe = /require\(\s*['"]node:sqlite['"]\s*\)/g;
  return {
    name: 'stub-node-sqlite',
    enforce: 'pre',
    transform(code, id) {
      if (sqliteRe.test(code)) {
        return {
          code: code.replace(sqliteRe, '({})'),
          map: null,
        };
      }
    },
  };
}

/**
 * Shared Vite configuration for building GitHub Actions tool library.
 *
 * Produces dist/tools/lib.mjs — the central entry point that all action
 * shims (main.mjs) import from. Bundles all npm dependencies (including
 * @actions/core, @actions/exec) so dist/ is self-contained. Only Node.js
 * built-in modules are externalized.
 */
export default defineConfig({
  plugins: [stubNodeSqlite(), tsconfigPaths()],
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
      // Only externalize Node 24 built-in modules
      external: [
        ...node24Builtins,
        ...node24Builtins.map((m) => `node:${m}`),
      ],
      plugins: [
        {
          name: 'exclude-examples',
          resolveId(source) {
            if (source.includes('.examples') || source.includes('/examples')) {
              return { id: source, external: true };
            }
            return null;
          },
        },
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
    target: 'node24',
    platform: 'node',
  },
});
