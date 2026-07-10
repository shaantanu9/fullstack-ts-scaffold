#!/usr/bin/env node
/**
 * scaffold.mjs — regenerate the full-stack TS take-home boilerplate from the
 * skill's own frozen `template/` snapshot, then verify it green.
 *
 * Usage:
 *   node scaffold.mjs <target-dir> [--name my-app] [--only sql|mongo|supabase]
 *                     [--fast] [--budget 20] [--no-install] [--no-verify] [--no-db]
 *                     [--keep-changelogs]
 *
 * Speed: default runs the full gate (lint·tsc·test·build per backend + client) and
 * prints per-phase timings + a ≤20-min budget check. `--fast` runs lint·tsc·build
 * only (skips the DB-backed test step — the slowest, most contention-sensitive part)
 * for a guaranteed-quick, still-runnable build; run `pnpm test` afterward for full
 * verification. See SKILL.md "Reliable setup in under 20 minutes".
 *
 * Self-contained: reads only from `template/` next to this file. Never touches
 * the reference repo at runtime. Mirrors the repo's proven-green CI recipe
 * (.github/workflows/ci.yml) against local Docker.
 */
import {
  cpSync, existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, 'template');

// ---- args ---------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = new Set();
const opt = {};
let target = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--name') opt.name = argv[++i];
  else if (a === '--only') opt.only = argv[++i];
  else if (a === '--budget') opt.budget = Number(argv[++i]);
  else if (a.startsWith('--')) flags.add(a);
  else if (!target) target = a;
}
if (!target) die('Usage: node scaffold.mjs <target-dir> [--name x] [--only sql|mongo|supabase] [--fast] [--budget 20] [--no-install] [--no-verify] [--no-db]');
if (opt.only && !['sql', 'mongo', 'supabase'].includes(opt.only)) die(`--only must be "sql", "mongo", or "supabase" (got "${opt.only}")`);
if (opt.budget !== undefined && (!Number.isFinite(opt.budget) || opt.budget <= 0)) die(`--budget must be a positive number of minutes (got "${opt.budget}")`);
if (!existsSync(TEMPLATE)) die(`Bundled template missing at ${TEMPLATE}. Re-run the "refresh template" step in SKILL.md.`);

const DEST = resolve(target);
const NAME = opt.name || basename(DEST);
const FAST = flags.has('--fast');            // lint · type-check · build only (skip DB-backed tests)
const BUDGET_MIN = opt.budget || 20;         // soft time target; warn if the run exceeds it
if (existsSync(DEST) && readdirSync(DEST).length) die(`Target "${DEST}" exists and is not empty.`);

const t0 = Date.now();
log(`\n▸ Scaffolding "${NAME}" → ${DEST}`);
log(`  backends: ${opt.only ? opt.only + ' only' : 'sql + mongo + supabase'}${FAST ? ' · ⚡ fast' : ''} · target ≤ ${BUDGET_MIN}m\n`);

// ---- 1. copy frozen snapshot -------------------------------------------
mkdirSync(DEST, { recursive: true });
cpSync(TEMPLATE, DEST, { recursive: true });
log('✓ copied frozen template snapshot');

// ---- 2. freshen (drop reference-repo history noise) --------------------
if (!flags.has('--keep-changelogs')) {
  const cl = join(DEST, 'changelogs');
  if (existsSync(cl)) { rmSync(cl, { recursive: true, force: true }); mkdirSync(cl); writeFileSync(join(cl, 'README.md'), '# Changelogs\n\nOne entry per change: `YYYY-MM-DD_NN_short-description.md`.\n'); }
}
rmSync(join(DEST, 'docs', 'superpowers'), { recursive: true, force: true });

// ---- 3. rename ----------------------------------------------------------
editJSON(join(DEST, 'package.json'), (p) => { p.name = NAME; });
const readme = join(DEST, 'README.md');
if (existsSync(readme)) {
  const txt = readFileSync(readme, 'utf8').replace(/^#\s+.*$/m, `# ${NAME}`);
  writeFileSync(readme, txt);
}
// Display name for the UI: turn "my-take-home" into "My Take Home". Every
// user-facing surface (browser title, PWA manifest, navbar, home hero) reads
// from client/src/constants/config.ts, so this one rewrite renames the app
// everywhere.
const DISPLAY = NAME.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const cfg = join(DEST, 'client', 'src', 'constants', 'config.ts');
if (existsSync(cfg)) {
  writeFileSync(cfg, readFileSync(cfg, 'utf8').replace(/name:\s*'[^']*'/, `name: '${DISPLAY}'`));
}
log(`✓ renamed project → ${NAME} (UI name "${DISPLAY}")`);

// ---- 4. prune backend (adaptive) ---------------------------------------
// Three interchangeable backends share one API contract + client + e2e.
// `sql` is the base (its root scripts have no suffix); `mongo`/`supabase`
// carry a `:<name>` suffix. Each backend serves the client on its own port.
const ALL_BACKENDS = ['sql', 'mongo', 'supabase'];
const API_PORT = { sql: 5002, mongo: 5003, supabase: 5004 };
let backends = [...ALL_BACKENDS];
if (opt.only) {
  const drops = ALL_BACKENDS.filter((b) => b !== opt.only);
  backends = [opt.only];
  for (const drop of drops) rmSync(join(DEST, `server-${drop}`), { recursive: true, force: true });
  // remove the dropped backends' workspace lines
  const wsPath = join(DEST, 'pnpm-workspace.yaml');
  writeFileSync(wsPath, readFileSync(wsPath, 'utf8').split('\n').filter((l) => !drops.some((d) => l.includes(`server-${d}`))).join('\n'));
  // promote the chosen backend's script variants to defaults (sql is already
  // the base, so it only needs the dead :mongo/:supabase variants removed).
  editJSON(join(DEST, 'package.json'), (p) => {
    const s = p.scripts;
    if (opt.only !== 'sql') {
      // 1. promote `<x>:<only>` → `<x>` (the chosen backend becomes the default)
      for (const k of Object.keys(s)) {
        const vk = `${k}:${opt.only}`;
        if (s[vk]) s[k] = s[vk];
      }
    }
    // 2. drop every now-redundant/dead `:sql|:mongo|:supabase` variant
    for (const k of Object.keys(s)) if (/:(sql|mongo|supabase)$/.test(k)) delete s[k];
    // 3. rewrite INTERNAL references (e.g. `test:api:ci` calls `pnpm test:api:mongo`)
    //    to the promoted base name, so no script points at a deleted one.
    for (const k of Object.keys(s)) {
      s[k] = s[k].replace(/(pnpm(?: run)? [A-Za-z0-9:_-]+?):(?:sql|mongo|supabase)(?=\s|"|$)/g, '$1');
    }
  });
  // point the client at the chosen backend's API port — the template's client
  // `.env.example` defaults to the SQL port (5002).
  const port = API_PORT[opt.only];
  if (port !== 5002) {
    const clientEnv = join(DEST, 'client', '.env.example');
    if (existsSync(clientEnv)) {
      writeFileSync(clientEnv, readFileSync(clientEnv, 'utf8').replace(/localhost:5002/g, `localhost:${port}`));
    }
  }
  log(`✓ pruned to server-${opt.only} (dropped ${drops.join(', ')})`);
}

// ---- 5. env bootstrap (placeholders; real secrets never in the bundle) --
for (const rel of ['.env.example', 'client/.env.example', ...backends.map((b) => `server-${b}/.env.example`)]) {
  const src = join(DEST, rel);
  if (!existsSync(src)) continue;
  const dst = rel.startsWith('client/') ? src.replace('.env.example', '.env.local') : src.replace('.env.example', '.env');
  if (!existsSync(dst)) writeFileSync(dst, readFileSync(src, 'utf8'));
}
// Give the client a real NextAuth secret — the template's client `.env.example`
// ships a placeholder AUTH_SECRET so `pnpm dev`/`build` work out of the box.
const clientEnvLocal = join(DEST, 'client', '.env.local');
if (existsSync(clientEnvLocal)) {
  const txt = readFileSync(clientEnvLocal, 'utf8');
  if (/AUTH_SECRET=/.test(txt)) {
    writeFileSync(
      clientEnvLocal,
      txt.replace(/AUTH_SECRET=.*/, `AUTH_SECRET=${randomBytes(33).toString('base64')}`),
    );
  }
}
log('✓ seeded .env from examples (real AUTH_SECRET generated; optional integrations 503 when blank)');

// ---- 6. fresh git -------------------------------------------------------
if (run('git', ['init', '-q'], DEST).ok) {
  const gitCommit = (msg) =>
    run('git', ['-c', 'user.email=you@example.com', '-c', 'user.name=You', 'commit', '-q', '-m', msg], DEST);
  const stageAndCommit = (msg, pathspecs) => {
    if (pathspecs.length === 1 && pathspecs[0] === '-A') {
      run('git', ['add', '-A'], DEST); // catch-all for anything not yet committed
    } else {
      // keep magic pathspecs (`:(exclude)…`) as-is; drop positive paths absent
      // in this variant (e.g. the leaner server-supabase has no BullMQ jobs dir)
      // so `git add` doesn't abort on a non-matching pathspec.
      const specs = pathspecs.filter((p) => p.startsWith(':') || existsSync(join(DEST, p)));
      if (specs.some((p) => !p.startsWith(':'))) run('git', ['add', '--', ...specs], DEST);
    }
    // commit only if something is actually staged
    if (run('git', ['diff', '--cached', '--quiet'], DEST).status !== 0) {
      gitCommit(msg);
      log(`  ✓ ${msg}`);
    }
  };

  if (flags.has('--commits')) {
    log('\n▸ committing in logical groups (--commits)');
    const srv = backends.map((b) => `server-${b}`);
    // integration files carved out of the backend/client "core" commits
    const intBackend = srv.flatMap((s) => [
      `${s}/src/jobs`,
      `${s}/tests/unit/jobs`,
      `${s}/src/services/upload.service.ts`,
      `${s}/src/controllers/upload.controller.ts`,
      `${s}/src/routes/upload.routes.ts`,
      `${s}/tests/integration/uploads.test.ts`,
      `${s}/tests/unit/services/upload.service.test.ts`,
    ]);
    const intClient = [
      'client/public/sw.js',
      'client/public/icon.svg',
      'client/src/app/manifest.ts',
      'client/src/app/offline',
      'client/src/components/common/ServiceWorkerRegistrar.tsx',
      'client/tests/components/ServiceWorkerRegistrar.test.tsx',
    ];
    stageAndCommit('docs: add project README, license, and editor config', [
      'README.md', 'LICENSE', 'CONTRIBUTING.md', '.editorconfig', '.nvmrc', '.gitignore', 'TAKEHOME_BEST_PRACTICES.md',
    ]);
    stageAndCommit('chore: set up pnpm workspace, tooling, Husky, and CI', [
      'package.json', 'pnpm-workspace.yaml', 'pnpm-lock.yaml', 'scripts', '.husky', 'commitlint.config.js',
      '.github', '.env.example', '.gitleaks.toml',
    ]);
    stageAndCommit('feat(server): scaffold backend — auth, users, DB, middleware, OpenAPI',
      [...srv, ...intBackend.map((p) => `:(exclude)${p}`), ...intClient.map((p) => `:(exclude)${p}`)]);
    stageAndCommit('feat(client): scaffold Next.js App Router + Tailwind client',
      ['client', ...intClient.map((p) => `:(exclude)${p}`)]);
    stageAndCommit('feat: add integrations — ImageKit uploads, BullMQ worker, and PWA',
      [...intBackend, ...intClient]);
    stageAndCommit('test: add Bruno API contract and Puppeteer e2e suites', ['bruno', 'e2e']);
    stageAndCommit('docs: add SOC 2 compliance, security policy, and changelogs', ['docs', 'SECURITY.md', 'changelogs']);
    stageAndCommit('chore: finalize scaffold', ['-A']); // catch-all for anything not yet committed
    const n = (run('git', ['rev-list', '--count', 'HEAD'], DEST).out || '').trim();
    log(`✓ grouped git history (${n} commits)`);
  } else {
    run('git', ['add', '-A'], DEST);
    gitCommit('chore: scaffold boilerplate');
    log('✓ fresh git history (1 commit)');
  }
}

// ---- 7. install ---------------------------------------------------------
if (!flags.has('--no-install')) {
  log('\n▸ pnpm install (usually the slowest phase — fast on a warm store)…');
  const s = Date.now();
  if (!run('pnpm', ['install'], DEST, true).ok) die('pnpm install failed — is pnpm installed? (npm i -g pnpm)');
  log(`✓ dependencies installed [${fmtDur(Date.now() - s)}]`);
} else log('• skipped install (--no-install)');

// ---- 8. verify (mirror ci.yml against local Docker) --------------------
const results = [];
const record = (name, ok, note = '', ms = 0) => {
  results.push({ name, ok, note, ms });
  log(`${ok === true ? '  ✓' : ok === 'skip' ? '  •' : '  ✗'} ${name}${ms ? ` [${fmtDur(ms)}]` : ''}${note ? ` (${note})` : ''}`);
};
// time a check: run fn (returns true|false|'skip'), record it with its duration
const check = (name, fn, note = '') => { const s = Date.now(); const ok = fn(); record(name, ok, note, Date.now() - s); return ok; };

if (FAST) log('\n⚡ --fast: lint · type-check · build only — DB-backed tests skipped (run `pnpm test` after).');

if (!flags.has('--no-verify') && !flags.has('--no-install')) {
  // --fast never touches Docker (that's the whole point: no DB start, no test load).
  const dockerOK = !FAST && !flags.has('--no-db') && run('docker', ['info'], DEST).ok;
  if (!FAST && !flags.has('--no-db') && !dockerOK) log('\n⚠ Docker not available — DB-dependent tests will be skipped. Start DBs and re-run tests manually.');

  // Docker-load preflight: a heavily loaded Docker VM is the #1 cause of a slow
  // gate (the DB test step thrashes). Warn early and point at the fast path.
  if (dockerOK) {
    const running = (run('docker', ['ps', '-q'], DEST).out || '').trim().split('\n').filter(Boolean).length;
    if (running > 12) log(`\n⚠ ${running} Docker containers running — the DB test step may be slow under contention.\n   For a guaranteed-fast working build re-run with --fast, or stop unused stacks to free the Docker VM.`);
  }

  // supabase's test suite needs the Supabase CLI local stack (`supabase start`),
  // not just docker-compose. Without the CLI its whole suite is skipped (the
  // global test setup connects to the DB, so there is no unit-only subset).
  const supaCliOK = !FAST && run('supabase', ['--version'], DEST).ok;
  if (!FAST && backends.includes('supabase') && dockerOK && !supaCliOK) {
    log('\n⚠ Supabase CLI not found — server-supabase tests will be skipped. Install it (brew install supabase/tap/supabase), run `pnpm db:up` + `supabase start`, then re-run tests.');
  }
  // The bundle ships NO Supabase keys (secret-free). server-supabase tests need
  // the local-stack keys; skip them until the user fills real values (from
  // `supabase status -o env`) into server-supabase/.env.test.example.
  const supaEnv = join(DEST, 'server-supabase', '.env.test.example');
  const supaKeysReady = !backends.includes('supabase') || (existsSync(supaEnv) && !/your-local-(service-role|anon)-key/.test(readFileSync(supaEnv, 'utf8')));
  if (!FAST && backends.includes('supabase') && dockerOK && supaCliOK && !supaKeysReady) {
    log('\n⚠ server-supabase ships placeholder keys — run `supabase status -o env` and paste SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY into server-supabase/.env.test.example, then re-run. Skipping supabase tests for now.');
  }

  for (const b of backends) {
    log(`\n▸ verify server-${b}`);
    const filter = `server-${b}`;
    // bring up DB + redis for this backend (skipped in --fast)
    let dbUp = false;
    const dbReady = dockerOK && (b !== 'supabase' || (supaCliOK && supaKeysReady));
    if (dbReady) {
      // After any `--only`, the chosen backend's scripts are promoted, so its
      // compose becomes `db:up`. In the default (all backends) run, sql is the
      // base `db:up` and the others are `db:up:<name>`.
      const composeScript = opt.only ? 'db:up' : b === 'sql' ? 'db:up' : `db:up:${b}`;
      const s = Date.now();
      dbUp = run('pnpm', ['run', composeScript], DEST, true).ok;
      if (dbUp) waitDb(b);
      log(`  · db:up ${b} [${fmtDur(Date.now() - s)}]`);
    }
    // prisma generate is needed for sql type-check/build even in --fast (no DB);
    // migrate needs a running DB, so it only runs when the DB is up.
    if (b === 'sql') {
      check('sql: prisma generate', () => run('pnpm', ['--filter', 'server-sql', 'run', 'db:generate'], DEST).ok);
      if (dbUp) {
        const env = readEnv(join(DEST, 'server-sql', '.env.test.example'));
        check('sql: migrate test db', () => run('pnpm', ['--filter', 'server-sql', 'run', 'db:deploy'], DEST, false, env).ok);
      }
    }
    check(`${b}: lint`, () => run('pnpm', ['--filter', filter, 'run', 'lint'], DEST).ok);
    check(`${b}: type-check`, () => run('pnpm', ['--filter', filter, 'exec', 'tsc', '--noEmit'], DEST).ok);
    const testNote = FAST ? 'fast: skipped' : dbUp ? '' : (b === 'supabase' && dockerOK && supaCliOK && !supaKeysReady) ? 'set supabase keys (supabase status)' : (b === 'supabase' && dockerOK && !supaCliOK) ? 'no supabase cli' : dockerOK ? 'db start failed' : 'no docker';
    if (dbUp || flags.has('--no-db')) check(`${b}: test`, () => run('pnpm', ['--filter', filter, 'run', 'test'], DEST, true).ok, testNote);
    else record(`${b}: test`, 'skip', testNote);
    check(`${b}: build`, () => run('pnpm', ['--filter', filter, 'run', 'build'], DEST).ok);
  }

  log('\n▸ verify client');
  check('client: lint', () => run('pnpm', ['--filter', 'client', 'run', 'lint'], DEST).ok);
  check('client: type-check', () => run('pnpm', ['--filter', 'client', 'run', 'type-check'], DEST).ok);
  check('client: test', () => run('pnpm', ['--filter', 'client', 'run', 'test'], DEST).ok);
  check('client: build', () => run('pnpm', ['--filter', 'client', 'run', 'build'], DEST, false, { NEXT_PUBLIC_API_BASE_URL: `http://localhost:${API_PORT[backends[0]] || 5002}/api/v1` }).ok);
} else {
  log('• skipped verify');
}

// ---- summary ------------------------------------------------------------
const totalMs = Date.now() - t0;
const failed = results.filter((r) => r.ok !== true && r.ok !== 'skip');
log('\n' + '─'.repeat(60));
for (const r of results) log(`  ${r.ok === true ? 'PASS' : r.ok === 'skip' ? 'SKIP' : 'FAIL'}  ${r.name.padEnd(24)}${r.ms ? fmtDur(r.ms).padStart(7) : ''}${r.note ? `  (${r.note})` : ''}`);
// slowest few checks — where the time actually went
const slow = results.filter((r) => r.ms).sort((a, b) => b.ms - a.ms).slice(0, 3);
if (slow.length) log(`  slowest: ${slow.map((r) => `${r.name} ${fmtDur(r.ms)}`).join(' · ')}`);
log('─'.repeat(60));
log(`  ${results.length ? `${results.filter((r) => r.ok === true).length}/${results.length} checks passed · ` : ''}${fmtDur(totalMs)} elapsed (target ≤ ${BUDGET_MIN}m)`);
if (failed.length) {
  log(`\n✗ NOT READY — ${failed.length} check(s) failed. Fix these before starting the assignment:`);
  for (const r of failed) log(`    - ${r.name}`);
  log(`\n  cd ${DEST}   # investigate, re-run the failing step\n`);
  process.exit(1);
}
// over-budget diagnostics: point at the two real levers (Docker load, fast path)
if (totalMs > BUDGET_MIN * 60000) {
  log(`\n⚠ Setup took ${fmtDur(totalMs)} — over the ${BUDGET_MIN}-min target. Almost always the DB test`);
  log(`  step thrashing on a loaded Docker VM. To get well under ${BUDGET_MIN}m next time:`);
  log(`    • free the Docker VM (stop unused container stacks), then re-run; OR`);
  log(`    • use --fast (lint · type-check · build only) for a quick working build,`);
  log(`      then run \`pnpm test\` once when the machine is quiet.`);
}
log(`\n✓ GREEN${FAST ? ' (fast — DB tests skipped)' : ''}. Next:`);
log(`    cd ${DEST}`);
if (FAST) log(`    pnpm test        # run the full DB-backed suite when ready`);
log(`    open ADAPT.md   # layer the assignment feature on top of this base`);
// After any `--only`, the chosen backend's scripts are promoted, so `pnpm dev`
// runs that stack. Supabase also needs `supabase start` (part of `pnpm db:up`).
const devHint = opt.only
  ? `pnpm dev        # server-${opt.only} + client`
  : 'pnpm dev        # server-sql + client (or: pnpm dev:mongo / pnpm dev:supabase)';
log(`    ${devHint}\n`);

// ---- helpers ------------------------------------------------------------
function run(cmd, args, cwd, inherit = false, extraEnv = {}) {
  const r = spawnSync(cmd, args, { cwd, stdio: inherit ? 'inherit' : 'pipe', env: { ...process.env, ...extraEnv }, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || ''), status: r.status };
}
function waitDb(b) {
  // poll the container until the DB accepts connections (max ~30s). For
  // supabase the Postgres/Auth stack is already up (`supabase start` blocks
  // until ready); we only wait on its redis container.
  const check = b === 'sql'
    ? () => run('docker', ['exec', 'boilerplate_postgres', 'pg_isready', '-U', 'postgres'], DEST).ok
    : b === 'supabase'
      ? () => run('docker', ['exec', 'boilerplate_supabase_redis', 'redis-cli', 'ping'], DEST).ok
      : () => run('docker', ['exec', 'boilerplate_mongodb', 'mongosh', '--quiet', '--eval', 'db.adminCommand("ping")'], DEST).ok;
  for (let i = 0; i < 30; i++) { if (check()) return; sleep(1000); }
}
function readEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}
function editJSON(file, fn) { const j = JSON.parse(readFileSync(file, 'utf8')); fn(j); writeFileSync(file, JSON.stringify(j, null, 2) + '\n'); }
function fmtDur(ms) { const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`; }
function sleep(ms) { const end = Date.now() + ms; while (Date.now() < end) { /* busy wait, no deps */ } }
function log(m) { process.stdout.write(m + '\n'); }
function die(m) { process.stderr.write(`\n✗ ${m}\n\n`); process.exit(1); }
