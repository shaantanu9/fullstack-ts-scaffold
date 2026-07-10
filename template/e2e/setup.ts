import { spawn, ChildProcess } from 'child_process';
import { request } from 'http';
import { createWriteStream } from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';

// Which backend workspace to spawn. Both expose the identical API contract, but
// on distinct ports so they can run side by side: server-sql on 5002, server-mongo
// on 5003. Override with E2E_SERVER_FILTER=server-mongo to run against Mongo.
// Defaults to server-sql (the default DB).
const SERVER_FILTER = process.env.E2E_SERVER_FILTER || 'server-sql';
const SERVER_PORT = SERVER_FILTER === 'server-mongo' ? 5003 : 5002;

export const SERVER_URL = `http://localhost:${SERVER_PORT}`;
export const CLIENT_URL = 'http://localhost:3000';

interface Servers {
  server?: ChildProcess;
  client?: ChildProcess;
}

const servers: Servers = {};

const waitForPort = (port: number, timeout = 120000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (req: ReturnType<typeof request>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      req.destroy();
    };

    const check = () => {
      const req = request({ method: 'GET', hostname: 'localhost', port, path: '/' }, (res) => {
        cleanup(req);
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      });

      req.on('error', () => {
        cleanup(req);
        retry();
      });

      timeoutId = setTimeout(() => {
        cleanup(req);
        retry();
      }, 1000);

      req.end();
    };

    const retry = () => {
      if (Date.now() - start > timeout) {
        reject(new Error(`Timed out waiting for port ${port}`));
        return;
      }
      setTimeout(check, 500);
    };

    check();
  });
};

const isPortInUse = async (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (req: ReturnType<typeof request>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      req.destroy();
    };

    const req = request({ method: 'GET', hostname: 'localhost', port, path: '/' }, (res) => {
      cleanup(req);
      resolve(true);
    });

    req.on('error', () => {
      cleanup(req);
      resolve(false);
    });

    timeoutId = setTimeout(() => {
      cleanup(req);
      resolve(false);
    }, 1000);

    req.end();
  });
};

const spawnProcess = (
  command: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv },
  logFile: string,
): ChildProcess => {
  const log = createWriteStream(logFile, { flags: 'a' });

  const proc = spawn(command, args, {
    ...options,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  proc.stdout?.on('data', (data) => {
    log.write(data);
  });

  proc.stderr?.on('data', (data) => {
    log.write(data);
  });

  proc.on('error', (err) => {
    console.error(`Failed to start ${command} ${args.join(' ')}:`, err);
    log.write(`ERROR: ${err.message}\n`);
  });

  proc.on('exit', (code) => {
    log.write(`EXIT: ${code}\n`);
    log.end();
    if (code !== null && code !== 0) {
      console.warn(`Process ${command} ${args.join(' ')} exited with code ${code}`);
    }
  });

  return proc;
};

export const startServer = async (): Promise<void> => {
  if (await isPortInUse(SERVER_PORT)) {
    console.log(`Server already running on port ${SERVER_PORT}, reusing it`);
    return;
  }

  console.log(`Starting server (${SERVER_FILTER}) on port ${SERVER_PORT}...`);
  servers.server = spawnProcess('pnpm', ['--filter', SERVER_FILTER, 'dev'], {
    cwd: process.cwd(),
    // Force the chosen port so server-sql (5002) and server-mongo (5003) can run
    // side by side regardless of each backend's own .env PORT default.
    env: { ...process.env, FORCE_COLOR: '0', PORT: String(SERVER_PORT) },
  }, '/tmp/e2e-server.log');

  await waitForPort(SERVER_PORT);
  console.log('Server ready');
};

export const startClient = async (): Promise<void> => {
  if (await isPortInUse(3000)) {
    console.log('Client already running on port 3000, reusing it');
    return;
  }

  // In CI, run the already-built client with `next start` (deterministic, fast)
  // instead of `next dev` (on-demand compilation is slow/flaky on CI runners).
  // Set E2E_CLIENT_START=1 after running `pnpm --filter client build`.
  const useProd = process.env.E2E_CLIENT_START === '1';
  const clientArgs = useProd ? ['--filter', 'client', 'start'] : ['--filter', 'client', 'dev'];

  console.log(`Starting client (${useProd ? 'next start' : 'next dev'})...`);
  servers.client = spawnProcess('pnpm', clientArgs, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      // Force the client onto 3000 — next dev/start honor an ambient PORT (CI sets
      // PORT=5002 for the server), which would otherwise put the client on the wrong port.
      PORT: '3000',
      FORCE_COLOR: '0',
      NEXT_PUBLIC_API_BASE_URL: `${SERVER_URL}/api/v1`,
      CHOKIDAR_USEPOLLING: 'true',
      WATCHPACK_POLLING: 'true',
    },
  }, '/tmp/e2e-client.log');

  await waitForPort(3000);
  console.log('Client ready');
};

export const stopServers = async (): Promise<void> => {
  const stopProcess = (proc?: ChildProcess, name?: string): Promise<void> => {
    if (!proc || proc.killed) return Promise.resolve();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        try {
          proc.kill('SIGKILL');
        } catch {
          // ignore
        }
        resolve();
      }, 5000);

      proc.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      try {
        proc.kill('SIGTERM');
      } catch {
        clearTimeout(timeout);
        resolve();
      }
    });
  };

  await stopProcess(servers.server, 'server');
  await stopProcess(servers.client, 'client');
};

export const launchBrowser = async (headless = true): Promise<Browser> => {
  const executablePath = await puppeteer.executablePath('chrome');
  const options = {
    headless,
    executablePath,
    // --disable-dev-shm-usage is required on CI runners: the default /dev/shm is
    // tiny there, which makes a second Chrome launch hang. --disable-gpu is standard
    // for headless CI.
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    // On a contended CI runner, Chrome can take >30s (Puppeteer's default launch
    // timeout) to print its WS endpoint — that flakes the whole e2e suite. Raise
    // the launch timeout and retry once so a slow-starting Chrome doesn't fail CI.
    timeout: 60000,
    protocolTimeout: 120000,
  };
  try {
    return await puppeteer.launch(options);
  } catch {
    return await puppeteer.launch(options);
  }
};

export const createPage = async (browser: Browser): Promise<Page> => {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(20000);
  page.setDefaultTimeout(15000);
  return page;
};
