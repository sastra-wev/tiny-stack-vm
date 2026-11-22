# Tiny Stack VM

[![Build a tiny stack virtual machine](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![Rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sastra-wev/tiny-stack-vm/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![Reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/sastra-wev/tiny-stack-vm/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)

A small interpreter for make.fun's tiny stack ISA (version 1): 32-bit wrapping
integers, a 256-value data stack, a 64-deep call stack, 256 words of memory,
input/output, and the ten traps with their own exit codes. One run answers a
whole set of 40 programs: for each instance it reads `program.bin` and
`input.bin` and writes `stdout.bin` plus `exit.txt` with the exit code.

## Run it

```sh
node main.ts
```

It reads `MAKEFUN_INPUT_DIR` (default `/input`) and writes
`MAKEFUN_OUTPUT_DIR` (default `/output`). Node 22, standard library only.
