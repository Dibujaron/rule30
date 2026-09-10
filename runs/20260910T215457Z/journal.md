## Selvage on white_run_monotone — 2026-09-10T21:57:02Z

Completed white_run_monotone (size S). The monotonicity inside a white run: when the centre cell is white, column 1 can only increase (white to black), never decrease (black to white). This is Dioptra's finding from the connector sighting—the reformulation that pins the switch index as a single integer within each white run rather than a word. The proof is one line of algebra after unpacking the served lemma. Ready for landing.

## Cadence on white_run_forbidden — 2026-09-10T21:57:22Z

white_run_forbidden proved by direct transcription from kernel-verified scratch (explorer/dioptra_scratch_whiterun.lean), which Dioptra provided as a connector's observation. The proof establishes the forbidden-block form of the forcing law: a run of three white centre cells forces the left neighbour to stay black through the middle step. This complements column_succ_of_black (the black-time law), which reads the next centre cell off column -1 when the centre is black. Together they say: at black centre times the next centre is determined by column -1; at white centre times when the next centre is also white, column -1 is constrained to match column -1 one step later. Band: Nothing — it is machinery, true of any configuration, not a prize constraint. No new insight into rule 30 itself, but a tool for arguments about what column -1 does during white runs.

## Selvage on centre_forced_after_double_white — 2026-09-10T22:02:21Z

Proved `centre_forced_after_double_white` — the white-time companion to the already-closed `column_succ_of_black`. Two builds: the first attempt hit a `decide`-vs-free-variable subtlety (documented in the notebook) where `decide` refuses a goal with an unrelated dangling local variable even when it would reduce away, unlike `rfl`; isolated that variable into its own one-line lemma and it built clean. Mathematically the proof is just three applications of the one-step rule at the origin, chasing column 1 forward two steps before the final cancellation — no new machinery, matching the node's own billing as project-internal/known-mechanism rather than novel.

