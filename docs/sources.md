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
