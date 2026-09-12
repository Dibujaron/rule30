# Sources held in plain text

The directory `sources/` holds plain-text copies of the papers this project
has read, for theorist and seeder sessions to grep. The texts are not ours
to redistribute, so the directory is gitignored and only this index is
committed; a fresh checkout has to be given the texts by hand (Rowan holds
them). Every text is an OCR or PDF extraction, so a failed search for a
phrase is weak evidence: search for a distinctive word, then read around
it. Two of the files are the same paper from two extractions for exactly
that reason.

A novelty claim in an attack document names one of these by its file
name, with the result number where the paper has one, or names the files
searched and the terms used.

| File | What it is | What it settles for us |
|---|---|---|
| `rowland-2006-local-nested-structure.txt` | Eric Rowland, *Local nested structure in rule 30*, Complex Systems 16 (2006); arXiv extraction. | Right diagonals periodic with period exactly `2^k` from the start (his Lemma 2 / Theorem 1); left diagonals eventually periodic with the period-doubling criterion (Proposition 2, Lemma 3); the rightmost run of row `t` as a function of `ord_2(t+1)` (§1, §3). Our diagonal tier is this paper. |
| `rowland-2006-local-nested-structure-alt-ocr.txt` | The same paper, journal OCR. | Use when a phrase is not found in the other. |
| `jen-1990-la-ur-90-761.txt` | Erica Jen, Los Alamos report LA-UR-90-761 (1990), OCR of the OSTI scan. | The sandwich lemma: two columns both eventually periodic force everything between them; Proposition 3 for arbitrary finite initial conditions; the origin of "no two columns of rule 30 are both eventually periodic". Our `isEventuallyPeriodic_column_unique` and the strip lemmas are this. |
| `kopra-2022-natural-class.txt` | Johan Kopra, *A natural class of cellular automata containing…*, arXiv:2202.13809 (2022). | The width-2 trace theorem: adjacent column pairs are never eventually periodic, for any configuration white far to the left. The strongest published statement near P1. |
| `kurka-topological-dynamics-1d-ca.txt` | Petr Kůrka, *Topological dynamics of one-dimensional cellular automata*, lecture notes. | Left-permutivity and its consequences; the right Lyapunov exponent is exactly 1 (§5); pre-injectivity (Prop. 22); the general theory our configuration tier states in Lean. |
| `boyle-kitchens-periodic-points-onto-ca.txt` | Mike Boyle and Bruce Kitchens, *Periodic points for onto cellular automata*. | Pre-injectivity and periodic-point density for surjective automata; the abstract setting of crystal 4. |
| `fuks-2013-sequences-of-preimages.txt` | Henryk Fukś, *Sequences of preimages in elementary cellular automata* (2013 preprint, dated 2021 in the extraction). | Preimage counts for elementary rules, including the four-preimages fact for rule 30 that `window_count_half` is the finite form of. |
| `schule-stoop-2012-topological-classification.txt` | Schüle and Stoop, *A full computation-relevant topological dynamics classification of elementary cellular automata* (2012). | Surjectivity of rule 30 on `ℤ` (Prop. 15) and its place in the classification. |
| `spencer-2013-ca-cryptographic-generators.txt` | Jason Spencer, *Cellular automata in cryptographic random generators*, thesis, DePaul (2013). | The cryptographic literature's view of the centre column; period and statistics of rule 30 on rings. Empirical mostly. |
| `wolfram-1986-random-sequence-generation.txt` | Stephen Wolfram, *Random sequence generation by cellular automata*, Adv. Appl. Math. 7 (1986). | The original statistics of the centre column; the four-preimages count (§4); fixed points and periodic configurations on `ℤ`; the source of most of NKS p. 871 and p. 1087. |
| `martinez-adamatzky-hoffmann-rule22.txt` | Martínez, Adamatzky, Hoffmann, Désérable, Zelinka, *On patterns and dynamics of rule 22 cellular automaton*. | Not rule 30. Held because its methods (gliders, de Bruijn diagrams) are the ones a theorist might reach for; results do not transfer. |
| `oeis-a363346-left-diagonal-transients.txt` | OEIS A363346 b-file: transient lengths of the left diagonals. | The measured onsets that `leftDiagonal_onset_le` is about, as an independent computation to compare the engine against. |

Not held, and cited secondhand in `blueprint/crystals.md`: Jen JSP 1986
and CMP 1988 (paywalled), Meier–Staffelbach 1991, Cattaneo et al.
1999/2000, Shereshevsky 1992, and *A New Kind of Science* (the relevant
pages are quoted in crystals.md from the online edition). A novelty claim
that would be settled by one of those has to say so rather than claim the
search was complete.

## Live preprints, not held, checked against our own computation

A paper too new to be refereed is still evidence, and refusing to record it
until someone else vouches is how a project stays four days behind its own
problem. The rule for this section is that a row may only appear once
somebody here has run a check against the paper's own claims and said what
the check covered — a fetch alone is not enough, and neither is an abstract.

| Paper | What it claims | What we checked, and what we did not |
|---|---|---|
| David L. Condrey, *Finite Configurations Cannot Generate a Constant Trace in Rule 30*, [arXiv:2609.09431](https://arxiv.org/abs/2609.09431), submitted 2026-09-08. No affiliation; unrefereed; ships a Lean file `Rule30ZeroTail.lean` among ten ancillary files. | For support radius `w` the sharp maximum constant-prefix length of the central trace is `2⌈w/2⌉+1` when the initial centre is 0 and `2⌊w/2⌋+2` when it is 1, so the maximum over both is `w+2`, attained by exactly `2^w` configurations for even `w` and `2^w − 1` for odd `w`. Hence the zero row is the only finite configuration with a constant trace, and **no column of a nonzero finite rule 30 orbit is eventually constant**. | `explorer/rowan_condrey_check.mjs` reproduces **every one of those quantitative claims exactly for w = 1..10**, by enumerating all `2^(2w+1) − 1` nonzero configurations — none sampled. The `w = 0` centre-0 class is empty, so that one cell is vacuous rather than confirmed. **Not checked:** the step from the finite prefix bound to the infinite "eventually constant" conclusion, which rests on the paper's fiber argument and not on any number we can enumerate. Also unchecked: the shipped Lean file, which nobody here has elaborated. Corroborating but weaker: `explorer/rowan_seed_sweep.mjs` finds no eventually periodic column of period ≤ 500 among 8192 seeds × 61 columns, and eventual period 1 is eventual constancy. |

**The Lean file, adjudicated.** It is `sources/condrey-2609.09431-Rule30ZeroTail.lean`,
215 lines, fetched from the paper's ancillary files. Keel elaborated it on our
own toolchain: `lake env lean` exits 0 with no output at all, so it compiles
exactly as shipped and contains no `sorry` — a `sorry` would emit a warning, so
silence confirms the `grep` independently. `#print axioms` on its three main
theorems gives `[propext, Quot.sound]`, a strict subset of the three this
project permits; it does not even need `Classical.choice`. The definition it
uses is the right automaton: `rule30 l c r := Bool.xor l (c || r)`.

**And it does not prove the paper's headline.** `Classified` is a *hypothesis*
of the final theorem, not a conclusion — it is a disjunction about the shape of
the configuration, and the word "trace" occurs exactly twice in 215 lines, both
inside the docstring, never in a statement. The bridge, "an all-zero central
trace forces `Classified`", is in neither the Lean file nor our enumeration.

**The author is not overclaiming, and that belongs here next to the split.** The
docstring says in its own last line: *"It is not a full formalization of the
zero-trace fiber theorem."* The file is honest, clean, and correctly scoped; the
only misreading available is one a reader supplies. "Ships a Lean formalization"
is true. "Machine-verified" is false. Both subagents that surfaced this paper
reported the Lean file existed and neither opened it.

**Why this one matters to us.** Eventual constancy of the centre column is
exactly the bottom rung of Prize 2 — a column that is eventually constant is
one in which some symbol stops occurring. If Condrey is right, "both symbols
occur infinitely often in the centre column" is no longer open, and it is the
rung this board has repeatedly described as out of reach. It says nothing
about Prize 1: eventual *periodicity* of any period above 1 is untouched, and
the paper says so itself.
