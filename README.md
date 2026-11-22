# Tiny Stack VM

[![Build a tiny stack virtual machine](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![Rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sastra-wev/tiny-stack-vm/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![Reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sastra-wev/tiny-stack-vm/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)

An interpreter for make.fun's tiny stack ISA, written for the [make.fun tiny stack VM bounty](https://make.fun/bounty/tiny-stack-vm-01-run-20261122). One run answers all 40 programs of a set: each program's bytes are executed and its output and exit code are written out.

## The machine

- 32-bit two's-complement values, wrapping arithmetic (`MUL` is the low 32 bits of the exact product)
- A 256-value data stack, a 64-deep call stack, 256 words of memory
- Byte input (`IN` reads -1 once the input is used up), decimal/`PUTC` output
- 1,000,000-step limit and 65,536-byte output limit
- Ten traps, each with its own exit code: underflow (2), overflow (3), division by zero (4), unknown opcode (5), bad memory address (6), call depth (7), empty return (8), bad pc (9), step limit (10), output limit (11)

The hard rules are all honoured: `INT_MIN / -1`, `x % -1`, unsigned `DIVU`/`MODU`/`LTU`, shift counts masked to 5 bits, `SHR` vs `SHRU`, `PUSH8` sign extension, `EXIT`'s low byte, traps keeping the output written before them, and falling off the end of the program.

## Run it

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` is plain TypeScript with erasable syntax only (Node 22 runs it as-is), stdlib only, no dependencies. It reads `/input/<id>/program.bin` and `/input/<id>/input.bin` for every instance and writes `/output/<id>/stdout.bin` and `/output/<id>/exit.txt`.

## Layout

- `main.ts` — the entry: the VM plus the set driver
- `LICENSE` — MIT
