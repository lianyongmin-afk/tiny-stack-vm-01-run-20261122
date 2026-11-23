# tiny-stack-vm-01-run-20261122

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/lianyongmin-afk/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/lianyongmin-afk/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack VM for the [make.fun bounty](https://make.fun/bounty/tiny-stack-vm-01-run-20261122): `main.ts` runs every program of the tiny stack ISA and writes its exact output bytes and exit code, including all ten traps (underflow, overflow, division by zero, unknown opcode, bad memory address, call-depth, empty return, bad pc, step limit, output limit).

## Run it

```sh
node main.ts
```

`main.ts` reads every case from `/input/<id>/program.bin` + `input.bin` (or `$MAKEFUN_INPUT_DIR`) and writes `/output/<id>/stdout.bin` and `exit.txt`.
