## Vesper on leftDiagonal_onset_le_iff_stepMod_return — 2026-09-09T17:58:55Z

Closed `leftDiagonal_onset_le_iff_stepMod_return` — the onset wall restated with zero mention of the automaton, diagonals, or configurations: it's now purely "does the orbit of 1 under one integer bit-twiddle, truncated mod 2^(k+1), return to itself between step 2k and step 2k+2^k, for every k." Proof was pure composition of two already-closed lemmas (`leftDiagonal_onset_le_iff_rowNat_return` and `rowNat_mod_eq_iterate`), no new mathematical content — built clean first try, standard three axioms. The wall itself is still open; this just moves it further into arithmetic-only language, which is what the seed description asked for.

