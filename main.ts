// Tiny stack VM for make.fun tiny-stack-vm-01-run-20261122.
// Implements generator/subject/ISA.md exactly: 32-bit wrapping ints,
// 256-value data stack, 64-deep call stack, 256 words of memory,
// input/output, and traps 2-11 with their own exit codes.
// Usage: MAKEFUN_INPUT_DIR=/input MAKEFUN_OUTPUT_DIR=/output node main.ts
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// [immediate bytes, pops, pushes] per opcode byte.
const T = {
  0: [0, 0, 0], 1: [1, 0, 1], 2: [4, 0, 1], 3: [0, 1, 0], 4: [0, 1, 2],
  5: [0, 2, 2], 6: [0, 2, 3], 7: [0, 3, 3], 23: [0, 1, 1], 27: [0, 1, 1],
  48: [2, 0, 0], 49: [2, 1, 0], 50: [2, 1, 0], 51: [2, 0, 0], 52: [0, 0, 0],
  64: [0, 1, 1], 65: [0, 2, 0], 80: [0, 1, 0], 81: [0, 1, 0], 82: [0, 0, 1],
  83: [0, 1, 0],
};
for (let k = 16; k < 35; k++) if (k !== 31 && !(k in T)) T[k] = [0, 2, 1];

function run(p, q) {
  const D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256);
  const O = new Uint8Array(65536); // output buffer, written in place, no growth
  const L = p.length;
  let s = 0, c = 0, ip = 0, pc = 0, st = 0, n = 0;
  const end = (code) => ({ out: O.subarray(0, n), code });
  for (;;) {
    if (st === 1000000) return end(10);
    if (pc < 0 || pc >= L) return end(9);
    const op = p[pc], t = T[op];
    if (!t) return end(5);
    if (pc + t[0] >= L) return end(9);
    st++;
    const nx = pc + 1 + t[0];
    if (s < t[1]) return end(2);
    if (s - t[1] + t[2] > 256) return end(3);
    pc = nx;
    switch (op) {
      case 0: return end(0);
      case 1: D[s++] = (p[nx - 1] << 24) >> 24; break;
      case 2: D[s++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 3: s--; break;
      case 4: D[s] = D[s - 1]; s++; break;
      case 5: { const x = D[s - 1]; D[s - 1] = D[s - 2]; D[s - 2] = x; break; }
      case 6: D[s] = D[s - 2]; s++; break;
      case 7: { const a = D[s - 3]; D[s - 3] = D[s - 2]; D[s - 2] = D[s - 1]; D[s - 1] = a; break; }
      case 23: D[s - 1] = (-D[s - 1]) | 0; break;
      case 27: D[s - 1] = ~D[s - 1]; break;
      case 48: case 49: case 50: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        if (op === 48) pc = nx + rel;
        else { const v = D[--s]; if ((op === 49) === (v === 0)) pc = nx + rel; }
        break;
      }
      case 51:
        if (c === 64) return end(7);
        C[c++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8);
        break;
      case 52:
        if (c === 0) return end(8);
        pc = C[--c];
        break;
      case 64: {
        const a = D[s - 1];
        if (a < 0 || a > 255) return end(6);
        D[s - 1] = M[a];
        break;
      }
      case 65: {
        const a = D[s - 1], v = D[s - 2];
        if (a < 0 || a > 255) return end(6);
        s -= 2; M[a] = v;
        break;
      }
      case 80: {
        const b = String(D[s - 1]);
        if (n + b.length > 65536) return end(11);
        s--;
        for (let i = 0; i < b.length; i++) O[n++] = b.charCodeAt(i);
        break;
      }
      case 81:
        if (n + 1 > 65536) return end(11);
        O[n++] = D[--s] & 255;
        break;
      case 82: D[s++] = ip < q.length ? q[ip++] : -1; break;
      case 83: return end(D[--s] & 255);
      default: {
        const b = D[s - 1], a = D[s - 2];
        let r;
        if (op === 16) r = (a + b) | 0;
        else if (op === 17) r = (a - b) | 0;
        else if (op === 18) r = Math.imul(a, b);
        else if (op === 19) {
          if (b === 0) return end(4);
          r = a === -2147483648 && b === -1 ? a : (a / b) | 0;
        } else if (op === 20) {
          if (b === 0) return end(4);
          r = b === -1 ? 0 : (a % b) | 0;
        } else if (op === 21) {
          if (b === 0) return end(4);
          r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
        } else if (op === 22) {
          if (b === 0) return end(4);
          r = ((a >>> 0) % (b >>> 0)) | 0;
        } else if (op === 24) r = a & b;
        else if (op === 25) r = a | b;
        else if (op === 26) r = a ^ b;
        else if (op === 28) r = a << (b & 31);
        else if (op === 29) r = a >> (b & 31);
        else if (op === 30) r = (a >>> (b & 31)) | 0;
        else if (op === 32) r = a === b ? 1 : 0;
        else if (op === 33) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        s -= 2; D[s++] = r;
        break;
      }
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin')));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r.out);
  writeFileSync(join(O, id, 'exit.txt'), r.code + '\n');
}
