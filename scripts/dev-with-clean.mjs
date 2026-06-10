import { rmSync } from 'fs';
import { spawn } from 'child_process';

try {
  rmSync('.next', { recursive: true, force: true });
  console.log('Removed .next cache');
} catch (e) {
  // ignore
}

const runCmd = 'npx next dev -H 0.0.0.0';
const p = spawn(runCmd, { stdio: 'inherit', shell: true });

p.on('close', (code) => process.exit(code ?? 0));
