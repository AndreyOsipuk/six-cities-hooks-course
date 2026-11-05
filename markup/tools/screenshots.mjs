// Скриншоты страниц вёрстки во всю высоту: десктоп и телефон.
// Запуск: node markup/tools/screenshots.mjs http://localhost:4173 markup/screenshots
// Нужен установленный Google Chrome и Node.js 22+ (встроенный WebSocket).
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const [base = 'http://localhost:4173', outDir = 'markup/screenshots'] = process.argv.slice(2);

const CHROME = process.env.CHROME_PATH
  ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const PAGES = [
  'main', 'main-empty', 'offer', 'offer-not-logged', 'login',
  'favorites', 'favorites-empty', '404', 'states',
];

const DEVICES = [
  { name: 'desktop', width: 1440, height: 900, mobile: false, scale: 1 },
  { name: 'tablet', width: 768, height: 1024, mobile: true, scale: 1 },
  { name: 'mobile', width: 375, height: 812, mobile: true, scale: 2 },
];

const PORT = 9333;

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${process.env.TMPDIR ?? '/tmp'}/markup-shots-profile`,
  'about:blank',
], { stdio: 'ignore' });

const getJson = async (path) => {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${path}`);
      return await res.json();
    } catch {
      await delay(200);
    }
  }
  throw new Error('Chrome не запустился');
};

const targets = await getJson('/json/list');
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

let id = 0;
const pending = new Map();
const listeners = new Set();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else {
    listeners.forEach((fn) => fn(msg));
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const callId = ++id;
  pending.set(callId, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
  ws.send(JSON.stringify({ id: callId, method, params }));
});
const waitLoad = () => new Promise((resolve) => {
  const fn = (msg) => {
    if (msg.method === 'Page.loadEventFired') {
      listeners.delete(fn);
      resolve();
    }
  };
  listeners.add(fn);
});

await send('Page.enable');
await send('Runtime.enable');
await mkdir(outDir, { recursive: true });

for (const device of DEVICES) {
  for (const name of PAGES) {
    // Сброс: после снимка во всю высоту окно остаётся высоким, и 100vh следующей страницы растягивается
    await send('Emulation.clearDeviceMetricsOverride');
    await send('Emulation.setDeviceMetricsOverride', {
      width: device.width, height: device.height, deviceScaleFactor: device.scale, mobile: device.mobile,
    });
    const loaded = waitLoad();
    await send('Page.navigate', { url: `${base}/${name}.html` });
    await loaded;
    await delay(400);
    const { result } = await send('Runtime.evaluate', {
      expression: 'Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)',
      returnByValue: true,
    });
    const height = Math.max(device.height, result.value);
    const shot = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 80,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: device.width, height, scale: 1 },
    });
    const file = `${outDir}/${name}-${device.name}.jpg`;
    await writeFile(file, Buffer.from(shot.data, 'base64'));
    console.log(file, `${device.width}x${height}`);
  }
}

ws.close();
chrome.kill();
