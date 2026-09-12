import Rule30.Basic

/-!
Ephemeris, connector, 2026-09-12. Scratch, not a proposal.

Three things the sighting on `(X_c, σ)` wants in the kernel rather than in a
script.

1. **The occurrence instances are trivial at every fixed length.** For each `n`,
   "every word of length `n` occurs in the centre column" is a finite check, so
   the whole language of `c` below any fixed length is `decide`-able and nothing
   about the subshift is needed to get it. Here at `n = 4`: all sixteen words
   occur among the first 66 terms, and 66 is sharp (the script
   `explorer/ephemeris2_depth.mjs` reports the first depth at each length:
   3, 8, 15, 66, 120, 422, 1229, 1591, 2872).

2. **The board's run bounds forbid no word.** `centerColumn_black_run_lt_start`
   says a black run beginning at `a ≥ 1` has length `< a`. A black run of length
   six beginning at `a = 62` satisfies it with room to spare, so `1^6` lies in
   the language of the centre column; the same happens for every longer run at a
   later start. A bound whose right-hand side grows with the start time is
   vacuous as a statement about which words occur, hence vacuous about the
   subshift.

3. **The check can fail.** The same `decide` over too short a window is proved
   *false*, so the instrument in (1) is not reporting `True` for structural
   reasons.
-/

set_option maxRecDepth 100000

/-- All sixteen words of length four occur in the centre column, starting before
time 63. -/
theorem all_words_four_occur :
    ∀ w : Fin 4 → Bool, ∃ t : Fin 63, ∀ j : Fin 4,
      rowCell ((t : ℕ) + (j : ℕ)) 0 = w j := by
  decide

/-- The mutant: over the first twenty starts the same statement is false. -/
theorem not_all_words_four_occur_early :
    ¬ ∀ w : Fin 4 → Bool, ∃ t : Fin 20, ∀ j : Fin 4,
      rowCell ((t : ℕ) + (j : ℕ)) 0 = w j := by
  decide

/-- Six consecutive black centre cells from time 62, so `1^6` occurs; and
`6 < 62`, so the black-run bound is satisfied while forbidding nothing. -/
theorem black_run_six_from_62 :
    (∀ s : Fin 6, rowCell (62 + (s : ℕ)) 0 = true) ∧ 6 < 62 := by
  refine ⟨by decide, by omega⟩

#print axioms all_words_four_occur
#print axioms not_all_words_four_occur_early
#print axioms black_run_six_from_62
