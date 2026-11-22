// Tiny Stack VM — an interpreter for make.fun's tiny stack ISA (ISA.md v1).
// Written from the ISA spec: 32-bit wrapping ints, a 256-value data stack, a
// 64-deep call stack, 256 words of memory, byte input, byte/decimal output,
// a 1,000,000-step limit, a 65,536-byte output limit and ten traps, each with
// its own exit code. Every instance in the set is answered in one run.
//
// Usage: MAKEFUN_INPUT_DIR=<dir> MAKEFUN_OUTPUT_DIR=<dir> node main.ts
// Defaults match the grader: /input and /output.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Per-opcode facts, indexed by opcode byte. IMM holds the immediate length,
// POPS/PUSHES the stack effect; VALID marks the opcodes the ISA names.
// (Anything else is trap 5, unknown opcode.)
const IMM = new Int8Array(256).fill(-1);
const POPS = new Uint8Array(256);
const PUSHES = new Uint8Array(256);
const VALID = new Uint8Array(256);
function def(op: number, imm: number, pops: number, pushes: number): void {
  IMM[op] = imm;
  POPS[op] = pops;
  PUSHES[op] = pushes;
  VALID[op] = 1;
}
def(0x00, 0, 0, 0); // HALT
def(0x01, 1, 0, 1); // PUSH8
def(0x02, 4, 0, 1); // PUSH32
def(0x03, 0, 1, 0); // POP
def(0x04, 0, 1, 2); // DUP
def(0x05, 0, 2, 2); // SWAP
def(0x06, 0, 2, 3); // OVER
def(0x07, 0, 3, 3); // ROT
def(0x10, 0, 2, 1); // ADD
def(0x11, 0, 2, 1); // SUB
def(0x12, 0, 2, 1); // MUL
def(0x13, 0, 2, 1); // DIV
def(0x14, 0, 2, 1); // MOD
def(0x15, 0, 2, 1); // DIVU
def(0x16, 0, 2, 1); // MODU
def(0x17, 0, 1, 1); // NEG
def(0x18, 0, 2, 1); // AND
def(0x19, 0, 2, 1); // OR
def(0x1a, 0, 2, 1); // XOR
def(0x1b, 0, 1, 1); // NOT
def(0x1c, 0, 2, 1); // SHL
def(0x1d, 0, 2, 1); // SHR
def(0x1e, 0, 2, 1); // SHRU
def(0x20, 0, 2, 1); // EQ
def(0x21, 0, 2, 1); // LT
def(0x22, 0, 2, 1); // LTU
def(0x30, 2, 0, 0); // JMP
def(0x31, 2, 1, 0); // JZ
def(0x32, 2, 1, 0); // JNZ
def(0x33, 2, 0, 0); // CALL
def(0x34, 0, 0, 0); // RET
def(0x40, 0, 1, 1); // LOAD
def(0x41, 0, 2, 0); // STORE
def(0x50, 0, 1, 0); // PRINT
def(0x51, 0, 1, 0); // PUTC
def(0x52, 0, 0, 1); // IN
def(0x53, 0, 1, 0); // EXIT

const STEP_LIMIT = 1000000;
const OUTPUT_MAX = 65536;
const INT_MIN = -2147483648;

/** Run one program on its input: the bytes it wrote and the exit code it ended with. */
function run(p: Uint8Array, inp: Uint8Array): { out: Uint8Array; code: number } {
  const n = p.length;
  const D = new Int32Array(256); // data stack
  const C = new Int32Array(64); // call stack
  const M = new Int32Array(256); // memory, all zero at the start
  const out = new Uint8Array(OUTPUT_MAX);
  let sp = 0;
  let csp = 0;
  let olen = 0;
  let ip = 0;
  let pc = 0;
  let steps = 0;
  const end = (code: number): { out: Uint8Array; code: number } => ({
    out: out.subarray(0, olen),
    code,
  });

  for (;;) {
    // 1. Step limit first: a million instructions executed and still running.
    if (steps === STEP_LIMIT) return end(10);
    // 2. pc outside the program (falling off the end included).
    if (pc < 0 || pc >= n) return end(9);
    const op = p[pc];
    // 3. Unknown opcode.
    if (VALID[op] === 0) return end(5);
    const imm = IMM[op];
    // 4. Immediate cut off by the program's end.
    if (pc + imm >= n) return end(9);
    steps++;
    const next = pc + 1 + imm;
    // 5. Stack needs, checked before the instruction's own traps.
    const pops = POPS[op];
    if (sp < pops) return end(2);
    if (sp - pops + PUSHES[op] > 256) return end(3);
    pc = next;
    switch (op) {
      case 0x00: // HALT
        return end(0);
      case 0x01: // PUSH8: the byte as a signed 8-bit number, sign-extended.
        D[sp++] = (p[next - 1] << 24) >> 24;
        break;
      case 0x02: // PUSH32: four bytes, little-endian, signed.
        D[sp++] = p[next - 4] | (p[next - 3] << 8) | (p[next - 2] << 16) | (p[next - 1] << 24);
        break;
      case 0x03: // POP
        sp--;
        break;
      case 0x04: // DUP
        D[sp] = D[sp - 1];
        sp++;
        break;
      case 0x05: { // SWAP
        const t = D[sp - 1];
        D[sp - 1] = D[sp - 2];
        D[sp - 2] = t;
        break;
      }
      case 0x06: // OVER
        D[sp] = D[sp - 2];
        sp++;
        break;
      case 0x07: { // ROT: ( a b c -- b c a )
        const a = D[sp - 3];
        D[sp - 3] = D[sp - 2];
        D[sp - 2] = D[sp - 1];
        D[sp - 1] = a;
        break;
      }
      case 0x17: // NEG: wraps, -INT_MIN stays INT_MIN.
        D[sp - 1] = -D[sp - 1] | 0;
        break;
      case 0x1b: // NOT
        D[sp - 1] = ~D[sp - 1];
        break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15:
      case 0x16: case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d:
      case 0x1e: case 0x20: case 0x21: case 0x22: {
        const b = D[sp - 1];
        const a = D[sp - 2];
        let r: number;
        switch (op) {
          case 0x10: r = (a + b) | 0; break; // ADD, wraps
          case 0x11: r = (a - b) | 0; break; // SUB, wraps
          case 0x12: r = Math.imul(a, b); break; // MUL, low 32 bits of the exact product
          case 0x13: // DIV, truncated toward zero
            if (b === 0) return end(4);
            r = a === INT_MIN && b === -1 ? a : (a / b) | 0;
            break;
          case 0x14: // MOD, sign of the dividend
            if (b === 0) return end(4);
            r = b === -1 ? 0 : (a % b) | 0;
            break;
          case 0x15: // DIVU, unsigned
            if (b === 0) return end(4);
            r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
            break;
          case 0x16: // MODU, unsigned
            if (b === 0) return end(4);
            r = ((a >>> 0) % (b >>> 0)) | 0;
            break;
          case 0x18: r = a & b; break; // AND
          case 0x19: r = a | b; break; // OR
          case 0x1a: r = a ^ b; break; // XOR
          case 0x1c: r = a << (b & 31); break; // SHL, only the low 5 bits count
          case 0x1d: r = a >> (b & 31); break; // SHR, arithmetic
          case 0x1e: r = (a >>> (b & 31)) | 0; break; // SHRU, logical
          case 0x20: r = a === b ? 1 : 0; break; // EQ
          case 0x21: r = a < b ? 1 : 0; break; // LT, signed
          default: r = (a >>> 0) < (b >>> 0) ? 1 : 0; break; // LTU, unsigned
        }
        sp -= 2;
        D[sp++] = r;
        break;
      }
      case 0x30: case 0x31: case 0x32: { // JMP / JZ / JNZ
        const rel = ((p[next - 2] | (p[next - 1] << 8)) << 16) >> 16;
        let take = true;
        if (op !== 0x30) {
          const v = D[--sp];
          take = op === 0x31 ? v === 0 : v !== 0;
        }
        // The target is not checked here: an outside target traps 9 next step.
        if (take) pc = next + rel;
        break;
      }
      case 0x33: // CALL: push the next instruction's address, jump to the immediate.
        if (csp === 64) return end(7);
        C[csp++] = next;
        pc = p[next - 2] | (p[next - 1] << 8);
        break;
      case 0x34: // RET
        if (csp === 0) return end(8);
        pc = C[--csp];
        break;
      case 0x40: { // LOAD
        const addr = D[sp - 1];
        if (addr < 0 || addr >= 256) return end(6);
        D[sp - 1] = M[addr];
        break;
      }
      case 0x41: { // STORE: ( v addr -- )
        const addr = D[sp - 1];
        const v = D[sp - 2];
        if (addr < 0 || addr >= 256) return end(6);
        sp -= 2;
        M[addr] = v;
        break;
      }
      case 0x50: { // PRINT: decimal ASCII, no sign but a leading '-' when negative.
        const s = String(D[sp - 1]);
        if (olen + s.length > OUTPUT_MAX) return end(11); // writes none of its bytes
        sp--;
        for (let i = 0; i < s.length; i++) out[olen++] = s.charCodeAt(i);
        break;
      }
      case 0x51: // PUTC: one byte, v AND 255.
        if (olen + 1 > OUTPUT_MAX) return end(11);
        out[olen++] = D[--sp] & 255;
        break;
      case 0x52: // IN: -1 once the input is used up, and every time after.
        D[sp++] = ip < inp.length ? inp[ip++] : -1;
        break;
      case 0x53: // EXIT: code is the low byte.
        return end(D[--sp] & 255);
      default:
        return end(5); // unreachable: VALID already screened the opcode
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(
    new Uint8Array(readFileSync(join(I, id, 'program.bin'))),
    new Uint8Array(readFileSync(join(I, id, 'input.bin'))),
  );
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r.out);
  writeFileSync(join(O, id, 'exit.txt'), `${r.code}\n`);
}
