/**
 * Post-processes the emitted `.d.ts` files in `dist/types`.
 *
 * The source code imports files with `.ts`/`.tsx` extensions
 * (`allowImportingTsExtensions`), which TypeScript preserves in declaration
 * output (even with `rewriteRelativeImportExtensions`, which does not apply
 * to `emitDeclarationOnly`). Consumers would fail to resolve those
 * specifiers, so rewrite them to `.js` (resolved to the adjacent `.d.ts` by
 * TypeScript, the standard convention for published packages).
 *
 * Also removes the side-effect `.scss` import from `index.d.ts`: the
 * compiled stylesheet is shipped separately as `dist/styles.css`.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const typesRoot = fileURLToPath(new URL('../dist/types/', import.meta.url));

async function processFile(path) {
  const original = await readFile(path, 'utf8');
  const updated = original
    .replace(/(from\s+['"])(\.{1,2}\/[^'"]+)\.(?:ts|tsx)(['"])/g, '$1$2.js$3')
    .replace(/^\s*import\s+['"][^'"]*\.(?:scss|css|sass)['"];?\s*$/gm, '');

  if (updated !== original) {
    await writeFile(path, updated);
    console.log(`fixed ${path}`);
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.name.endsWith('.d.ts')) {
        await processFile(path);
      }
    }),
  );
}

await walk(typesRoot);
