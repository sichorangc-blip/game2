#!/usr/bin/env node

const net = require("net");
const { spawn } = require("child_process");

const CANDIDATE_PORTS = [8080, 8081, 8082, 3000, 5173];

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

async function pickPort() {
  for (const port of CANDIDATE_PORTS) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortAvailable(port)) return port;
  }
  return 0;
}

async function main() {
  const port = await pickPort();
  const displayPort = port === 0 ? "자동 할당(랜덤)" : port;
  console.log(`[serve] 사용할 포트: ${displayPort}`);

  const child = spawn(
    "npx",
    ["http-server", ".", "-p", String(port), "-c-1"],
    { stdio: "inherit", shell: true }
  );

  child.on("exit", (code) => process.exit(code ?? 0));
  child.on("error", (err) => {
    console.error("[serve] 서버 실행 실패:", err.message);
    process.exit(1);
  });
}

main();
