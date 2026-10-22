import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(root, 'src', 'data', 'github-cache.json');
const apiBase = 'https://api.github.com';

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'appverse-sync',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const only = (() => {
  const index = process.argv.indexOf('--only');
  return index > -1 ? process.argv[index + 1] : null;
})();
const dryRun = process.argv.includes('--dry-run');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseRepoUrl(url) {
  const match = /^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)/.exec(url);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

/** Find a sha256 checksum in a release body. */
function extractChecksum(body, fileName) {
  if (!body) return null;
  const patterns = [
    new RegExp(`([a-f0-9]{64})[^\\n]*${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
    new RegExp(`${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*([a-f0-9]{64})`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(body);
    if (match) return match[1].toLowerCase();
  }
  return null;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers });
  if (response.status === 404) return { status: 404, data: null };
  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    return { status: response.status, data: null, rateLimited: true, remaining };
  }
  if (!response.ok) {
    return { status: response.status, data: null, error: await response.text().catch(() => '') };
  }
  return { status: response.status, data: await response.json() };
}

/** Extract the configured repository URLs straight from the registry. */
async function readRegistry() {
  const source = await import('node:fs/promises').then((fs) =>
    fs.readFile(resolve(root, 'src', 'data', 'apps.ts'), 'utf8'),
  );
  const entries = [];
  const regex =
    /slug:\s*'([a-z0-9-]+)'((?:(?!\{)[\s\S])*?)repositoryUrl:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    entries.push({ slug: match[1], repositoryUrl: match[3] });
  }
  return entries;
}

async function main() {
  const entries = (await readRegistry()).filter(
    (entry) => (!only || entry.slug === only) && parseRepoUrl(entry.repositoryUrl),
  );

  if (entries.length === 0) {
    console.log('No configured GitHub repositories found — nothing to sync.');
    return;
  }

  console.log(
    `Syncing ${entries.length} configured ${entries.length === 1 ? 'repository' : 'repositories'}…`,
  );
  if (!token) {
    console.log(
      '  (no GITHUB_TOKEN set — using the anonymous rate limit, which is 60 requests/hour)',
    );
  }

  const result = { generatedAt: new Date().toISOString(), repositories: {} };

  for (const entry of entries) {
    const { owner, repo } = parseRepoUrl(entry.repositoryUrl);
    const slug = entry.slug;

    const repoResponse = await fetchJson(`${apiBase}/repos/${owner}/${repo}`);
    if (repoResponse.status === 404) {
      console.log(`  ! ${slug}: repository not found or not public — skipped.`);
      result.repositories[slug] = {
        repositoryUrl: entry.repositoryUrl,
        owner,
        repo,
        available: false,
        reason: 'Repository not found or not publicly visible.',
      };
      continue;
    }
    if (repoResponse.rateLimited) {
      console.log(`  ! ${slug}: GitHub API rate limit reached — stopping the sync.`);
      result.repositories[slug] = {
        repositoryUrl: entry.repositoryUrl,
        owner,
        repo,
        available: false,
        reason: 'GitHub API rate limit reached.',
      };
      break;
    }
    if (!repoResponse.data) {
      console.log(`  ! ${slug}: request failed (${repoResponse.status}) — skipped.`);
      result.repositories[slug] = {
        repositoryUrl: entry.repositoryUrl,
        owner,
        repo,
        available: false,
        reason: `GitHub API returned ${repoResponse.status}.`,
      };
      continue;
    }

    const data = repoResponse.data;
    const record = {
      repositoryUrl: entry.repositoryUrl,
      owner,
      repo,
      available: true,
      fullName: data.full_name,
      description: data.description ?? null,
      homepage: data.homepage || null,
      language: data.language ?? null,
      topics: Array.isArray(data.topics) ? data.topics : [],
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      license: data.license?.spdx_id ?? null,
      defaultBranch: data.default_branch ?? 'main',
      pushedAt: data.pushed_at ?? null,
      updatedAt: data.updated_at ?? null,
      archived: Boolean(data.archived),
      releases: [],
      latestRelease: null,
    };

    const releaseResponse = await fetchJson(`${apiBase}/repos/${owner}/${repo}/releases/latest`);
    if (releaseResponse.data) {
      const release = releaseResponse.data;
      record.latestRelease = {
        tag: release.tag_name,
        name: release.name || release.tag_name,
        publishedAt: release.published_at ?? null,
        url: release.html_url,
        notes: typeof release.body === 'string' ? release.body.slice(0, 4000) : '',
      };
      record.releases = (Array.isArray(release.assets) ? release.assets : []).map((asset) => ({
        name: asset.name,
        url: asset.browser_download_url,
        size: asset.size ?? null,
        contentType: asset.content_type ?? null,
        downloadCount: asset.download_count ?? 0,
        updatedAt: asset.updated_at ?? null,
        checksum:
          extractChecksum(typeof release.body === 'string' ? release.body : '', asset.name) ?? null,
      }));
    }

    result.repositories[slug] = record;
    console.log(
      `  ✓ ${slug}: ${record.fullName}${record.latestRelease ? ` · latest release ${record.latestRelease.tag}` : ' · no releases'}`,
    );
    await sleep(300);
  }

  if (dryRun) {
    console.log('\n--dry-run: nothing written.');
    return;
  }

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${outFile.replace(root, '.')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
