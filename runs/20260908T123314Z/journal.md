## Vesper on leftDiagonal_black_after_white — 2026-09-08T12:34:44Z

Node closed. The proof applies leftDiagonal_recurrence to a chain of three diagonals, using the white-diagonal hypothesis to simplify the recurrence at each induction step. This is Rowland 2006 lines 905–908 in local form, and one of four nodes seeded from crystals.md item 53 (Sextant C1). The kernel check in explorer/scratch_whitestep.lean included this exact proof; transcription was direct.

## Cadence on leftDiagonal_compl_after_black — 2026-09-08T12:34:53Z

Proved leftDiagonal_compl_after_black in 7 lines. The proof applies the diagonal recurrence at m+2 once, uses the hypothesis that diagonal m+3 is all-true to simplify an OR to true, then simplifies XOR with true to negation. Build succeeded cleanly with no axioms beyond the project's allowed set.

## Cadence on leftDiagonal_step_onset_dichotomy — 2026-09-08T12:36:05Z

Closed leftDiagonal_step_onset_dichotomy — turned out to be a transcription job, not a proof search. The math was already done and kernel-checked twice before I even started (once by Cadence's own earlier abandoned attempt at the onset wall, once by Rowan yesterday): explorer/scratch_onset_dichotomy.lean had the exact statement compiling clean. I copied it in, trimmed three helper lemmas that weren't actually needed by this particular theorem (they were scaffolding for a different, still-open goal), and it built on the first try — one deprecation warning on push_neg, no errors, axioms clean.

Worth flagging for whoever picks up leftDiagonal_onset_le next: this node proves the *per-step* saving (one cell instead of a whole period, when the middle diagonal goes black), but the docstring is upfront that summing those savings across k steps to get a linear onset bound is still open — that's a separate, harder counting argument this node doesn't touch.

## Vesper on leftDiagonal_white_of_shift — 2026-09-08T12:36:40Z

Closes in one attempt. Proof transferred from kernel-checked scratch (explorer/scratch_whitestep.lean) verbatim—an eight-line induction showing diagonal m+2 is white past a black cell in the shifted diagonal m+1. Axioms propext and Quot.sound, both expected. First of four nodes building the white-shift characterization; next three follow the same recurrence + induction pattern.

