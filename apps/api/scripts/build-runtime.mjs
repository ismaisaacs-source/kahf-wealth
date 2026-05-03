import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const cwd = process.cwd();
const outfile = resolve(cwd, "dist/main.js");
const esbuildBinary = resolve(cwd, "../../node_modules/@esbuild/darwin-arm64/bin/esbuild");

await mkdir(dirname(outfile), { recursive: true });

await execFileAsync(esbuildBinary, [
  resolve(cwd, "src/main.ts"),
  "--bundle",
  "--packages=external",
  "--platform=node",
  "--format=cjs",
  "--target=node20",
  `--outfile=${outfile}`,
  `--tsconfig=${resolve(cwd, "tsconfig.json")}`,
  "--external:firebase-admin",
  "--external:firebase-admin/*",
], {
  cwd,
});

console.log(`Bundled API runtime to ${outfile}`);
