import { spawn } from "child_process";
import validator from "validator";

function isValidHost(target: string) {
  if (validator.isIP(target, 4) || validator.isIP(target, 6)) return true;
  const hostnameRegex = /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;
  return hostnameRegex.test(target);
}

export function sanitizeTargets(rawTargets: string | string[]): string[] {
  const arr = Array.isArray(rawTargets) ? rawTargets : rawTargets.split(/\s+/);
  const cleaned = arr
    .map(t => t.trim())
    .filter(t => t.length > 0 && isValidHost(t))
    .slice(0, 25);
  return cleaned;
}

export async function runNmapScan(targets: string[], options: string[] = []) {
  const tlist = sanitizeTargets(targets);
  if (!tlist.length) throw new Error("No valid targets provided for scan.");
  const nmapArgs = ["-oX", "-", "-T3", "--host-timeout", "5m", ...options, ...tlist];
  const dockerArgs = ["run", "--rm", "--network", "host", "instrumentisto/nmap", ...nmapArgs];
  return new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
    const proc = spawn("docker", dockerArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    proc.stdout.on("data", chunk => { stdout += chunk.toString(); });
    proc.stderr.on("data", chunk => { stderr += chunk.toString(); });
    proc.on("error", err => reject(err));
    proc.on("close", code => {
      if (code !== 0 && !stdout.length) return reject(new Error("Nmap failed: " + stderr));
      resolve({ stdout, stderr });
    });
  });
}
