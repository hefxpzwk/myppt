import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIRECTORY = path.resolve(PROJECT_ROOT, 'public');
const SLIDES_DIRECTORY = path.resolve(PUBLIC_DIRECTORY, 'slides');
const THUMBNAILS_DIRECTORY = path.resolve(SLIDES_DIRECTORY, '.thumbnails');
const OUTPUT_FILE = path.resolve(PROJECT_ROOT, 'src/data/slides.generated.ts');

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function formatTitle(fileName) {
  const baseName = fileName.replace(/\.html$/i, '');
  const cleaned = baseName.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return 'Untitled Presentation';
  }

  return cleaned
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.ico':
      return 'image/x-icon';
    case '.woff2':
      return 'font/woff2';
    case '.woff':
      return 'font/woff';
    case '.ttf':
      return 'font/ttf';
    default:
      return 'application/octet-stream';
  }
}

async function collectHtmlFiles(directory) {
  let entries = [];

  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectHtmlFiles(absolutePath);
      }

      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.html')) {
        return [];
      }

      return [absolutePath];
    }),
  );

  return files.flat();
}

function createUniqueId(baseId, idUsage) {
  const safeBaseId = baseId || 'presentation';
  const currentCount = idUsage.get(safeBaseId) ?? 0;
  const nextCount = currentCount + 1;
  idUsage.set(safeBaseId, nextCount);

  if (nextCount === 1) {
    return safeBaseId;
  }

  return `${safeBaseId}-${nextCount}`;
}

async function startStaticServer(rootDirectory) {
  const rootDirectoryWithSeparator = `${rootDirectory}${path.sep}`;

  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const decodedPath = decodeURIComponent(requestUrl.pathname);
      const requestedPath = decodedPath === '/' ? '/index.html' : decodedPath;
      const absolutePath = path.resolve(rootDirectory, `.${requestedPath}`);

      if (absolutePath !== rootDirectory && !absolutePath.startsWith(rootDirectoryWithSeparator)) {
        response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Forbidden');
        return;
      }

      let filePath = absolutePath;
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const buffer = await fs.readFile(filePath);
      response.writeHead(200, {
        'Content-Type': getContentType(filePath),
        'Cache-Control': 'no-store',
      });
      response.end(buffer);
    } catch (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to start local static server for thumbnail generation.');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

async function shouldRegenerateThumbnail(htmlAbsolutePath, thumbnailAbsolutePath) {
  try {
    const [htmlStat, thumbnailStat] = await Promise.all([fs.stat(htmlAbsolutePath), fs.stat(thumbnailAbsolutePath)]);
    return thumbnailStat.mtimeMs < htmlStat.mtimeMs;
  } catch {
    return true;
  }
}

async function generateThumbnails(presentations) {
  if (presentations.length === 0) {
    return;
  }

  let chromium;

  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.warn('Thumbnail generation skipped: playwright is not installed.');
    return;
  }

  let localServer;
  let browser;
  let context;

  try {
    localServer = await startStaticServer(PUBLIC_DIRECTORY);
    try {
      browser = await chromium.launch({ headless: true });
    } catch (error) {
      console.warn(`Thumbnail generation skipped: failed to launch chromium (${String(error)}).`);
      return;
    }
    context = await browser.newContext({ viewport: { width: 1600, height: 900 } });

    for (const presentation of presentations) {
      const mustRegenerate = await shouldRegenerateThumbnail(
        presentation.absolutePath,
        presentation.thumbnailAbsolutePath,
      );

      if (!mustRegenerate) {
        continue;
      }

      await fs.mkdir(path.dirname(presentation.thumbnailAbsolutePath), { recursive: true });

      const page = await context.newPage();
      const thumbnailUrl = `${localServer.origin}${presentation.path}`;

      try {
        await page.goto(thumbnailUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(700);
        await page.screenshot({ path: presentation.thumbnailAbsolutePath, type: 'png' });
      } catch (error) {
        console.warn(`Failed to capture thumbnail for ${presentation.path}: ${String(error)}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    if (context) {
      await context.close();
    }

    if (browser) {
      await browser.close();
    }

    if (localServer) {
      await localServer.close();
    }
  }
}

async function buildPresentations() {
  const htmlFiles = await collectHtmlFiles(SLIDES_DIRECTORY);
  const sortedFiles = htmlFiles.sort((left, right) => left.localeCompare(right));
  const idUsage = new Map();

  const presentations = await Promise.all(
    sortedFiles.map(async (absolutePath) => {
      const relativePath = toPosixPath(path.relative(SLIDES_DIRECTORY, absolutePath));
      const pathWithoutExtension = relativePath.replace(/\.html$/i, '');
      const slugBase = slugify(pathWithoutExtension.replace(/\//g, '-'));
      const id = createUniqueId(slugBase, idUsage);
      const stat = await fs.stat(absolutePath);

      const thumbnailRelativePath = `${pathWithoutExtension}.png`;
      const thumbnailAbsolutePath = path.resolve(THUMBNAILS_DIRECTORY, thumbnailRelativePath);
      const thumbnail = encodeURI(`/slides/.thumbnails/${toPosixPath(thumbnailRelativePath)}`);

      return {
        id,
        title: formatTitle(path.basename(relativePath)),
        path: encodeURI(`/slides/${relativePath}`),
        updatedAt: stat.mtime.toISOString().slice(0, 10),
        thumbnail,
        absolutePath,
        thumbnailAbsolutePath,
      };
    }),
  );

  return presentations;
}

async function finalizePresentations(presentations) {
  const finalized = await Promise.all(
    presentations.map(async (presentation) => {
      try {
        await fs.access(presentation.thumbnailAbsolutePath);
        return {
          id: presentation.id,
          title: presentation.title,
          path: presentation.path,
          updatedAt: presentation.updatedAt,
          thumbnail: presentation.thumbnail,
        };
      } catch {
        return {
          id: presentation.id,
          title: presentation.title,
          path: presentation.path,
          updatedAt: presentation.updatedAt,
        };
      }
    }),
  );

  return finalized;
}

function renderGeneratedFile(presentations) {
  const records = presentations
    .map((presentation) => {
      const lines = [
        '  {',
        `    id: ${JSON.stringify(presentation.id)},`,
        `    title: ${JSON.stringify(presentation.title)},`,
        `    path: ${JSON.stringify(presentation.path)},`,
        `    updatedAt: ${JSON.stringify(presentation.updatedAt)},`,
      ];

      if ('thumbnail' in presentation && presentation.thumbnail) {
        lines.push(`    thumbnail: ${JSON.stringify(presentation.thumbnail)},`);
      }

      lines.push('  },');

      return lines.join('\n');
    })
    .join('\n');

  return [
    '// This file is auto-generated by scripts/generate-presentations.mjs',
    '// Do not edit this file manually.',
    '',
    "import type { PresentationMeta } from './presentation-meta';",
    '',
    'export const generatedPresentations: PresentationMeta[] = [',
    records,
    '];',
    '',
  ].join('\n');
}

async function main() {
  const builtPresentations = await buildPresentations();
  await generateThumbnails(builtPresentations);
  const finalizedPresentations = await finalizePresentations(builtPresentations);
  const fileContent = renderGeneratedFile(finalizedPresentations);

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, fileContent, 'utf8');

  console.log(`Generated ${finalizedPresentations.length} presentation entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
