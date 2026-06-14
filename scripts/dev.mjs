import { spawn } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";

let server = null;
let client = null;
let serverRestartTimer = null;
let stopping = false;
const expectedExits = new WeakSet();

const run = (name, command, args) => {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env
  });

  child.on("exit", (code, signal) => {
    if (expectedExits.has(child)) return;
    if (stopping || signal === "SIGTERM" || signal === "SIGKILL") return;

    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exit(code);
    }
  });

  return child;
};

const startServer = () => {
  server = run("server", "tsx", ["server/index.ts"]);
};

const restartServer = () => {
  if (serverRestartTimer) clearTimeout(serverRestartTimer);

  serverRestartTimer = setTimeout(() => {
    console.log("[server] change detected. Restarting...");
    const oldServer = server;
    server = null;

    if (!oldServer || oldServer.killed) {
      startServer();
      return;
    }

    let restarted = false;
    const forceKillTimer = setTimeout(() => {
      if (!oldServer.killed) oldServer.kill("SIGKILL");
    }, 1200);

    oldServer.once("exit", () => {
      clearTimeout(forceKillTimer);
      if (restarted || stopping) return;
      restarted = true;
      startServer();
    });

    expectedExits.add(oldServer);
    oldServer.kill("SIGTERM");
  }, 180);
};

const startClient = () => {
  client = run("client", "vite", ["--host", "0.0.0.0"]);
};

startServer();
startClient();

const serverWatcher = watch(path.resolve("server"), { recursive: true }, (_event, filename) => {
  if (!filename) return;
  if (filename.endsWith(".ts")) restartServer();
});

const stop = () => {
  stopping = true;
  if (serverRestartTimer) clearTimeout(serverRestartTimer);
  serverWatcher.close();
  server?.kill("SIGTERM");
  client?.kill("SIGTERM");
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
