import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const patchesDir = path.join(packageRoot, "patches");

if (!fs.existsSync(patchesDir)) {
  console.log("[codingns-node-pty] 未发现 patches 目录，跳过补丁应用。");
  process.exit(0);
}

const patchFiles = fs.readdirSync(patchesDir)
  .filter((fileName) => fileName.endsWith(".patch"))
  .sort();

for (const fileName of patchFiles) {
  const patchPath = path.join(patchesDir, fileName);
  const result = spawnSync("git", ["apply", "-p1", "--reject", "--whitespace=nowarn", patchPath], {
    cwd: packageRoot,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    console.error(`[codingns-node-pty] 应用补丁失败：${fileName}`);
    process.exit(result.status ?? 1);
  }

  console.log(`[codingns-node-pty] 已应用补丁：${fileName}`);
}
