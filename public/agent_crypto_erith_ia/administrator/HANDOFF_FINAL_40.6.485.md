# HANDOFF FINAL — 40.6.485

The architecture is unchanged: HOT Firefox -> authenticated Bridge 8787 -> GitHub COLD.

40.6.485 is a transport-resilience repair only.

R17 / Bridge V1.9.13 corrects:
1. too-short 25 s large GitHub write timeout;
2. cold readback of >1 MiB files through the wrong embedded-content assumption.

New contract:
- small GitHub ops 45 s;
- large blob write 180 s;
- cold readback 120 s;
- one bounded retry;
- object metadata -> Git Blob for large files;
- browser wait 300 s.

Real regression fixture:
- 500 Evidence;
- 4,269,455 JSONL bytes;
- SHA-256 0492dd842d38040854d445d40f51e2030d43d474d6e934d65b8d3aed6871a66f.

R17 EXE SHA-256:
137bd1ac81a3cb8895e18bc1ef15236031f12e15156c676a17e145274c6bd313.

No local deletion, no retention change, no Backend mutation, no generic GitHub browser write.
