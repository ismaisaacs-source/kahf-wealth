import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import esbuild from "esbuild";

const cwd = process.cwd();
const outfile = resolve(cwd, "dist/main.js");

await mkdir(dirname(outfile), { recursive: true });

await esbuild.build({
  entryPoints: [resolve(cwd, "src/main.ts")],
  bundle: true,
  packages: "external",
  platform: "node",
  format: "cjs",
  target: "node20",
  outfile,
  tsconfig: resolve(cwd, "tsconfig.json"),
  external: ["firebase-admin", "firebase-admin/*"],
});

console.log(`Bundled API runtime to ${outfile}`);

