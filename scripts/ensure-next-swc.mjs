import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const nextDir = path.join(projectRoot, "node_modules", "@next");

if (!existsSync(nextDir)) {
  console.warn("[ensure-next-swc] @next dir not found; run npm install.");
  process.exit(0);
}

const entries = readdirSync(nextDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const hasSwc = entries.some((name) => name.startsWith("swc-"));

if (!hasSwc) {
  console.warn(
    "[ensure-next-swc] No @next/swc-* package found. Re-run npm install to pull optional SWC binaries."
  );
}
