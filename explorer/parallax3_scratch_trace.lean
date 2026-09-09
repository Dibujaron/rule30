import Rule30.Basic

/-
Parallax, 2026-09-09, thermodynamic-formalism sighting: a kernel check of the
claim that rule 30's trace measure under the uniform ensemble is EXACTLY
Bernoulli(1/2) at every finite length -- i.e. the joint refinement of the
board's `window_count_half`, which is the marginal at one time.

`colWord n w` is the centre-column word of times 0..n grown from the window `w`
of width 2n+1 (positions -n..n) with white cells outside. Cell 0 at time t
reads only positions -t..t, so for t <= n the word does not depend on the
padding.

Claim: every word of length n+1 has exactly 2^n preimage windows out of the
2^(2n+1) windows. Checked here by the kernel at n = 1, 2, 3.
-/

open Finset

def colWord (n : ℕ) (w : Fin (2 * n + 1) → Bool) : Fin (n + 1) → Bool :=
  fun i => evolveFrom (ofWindow w) (i : ℕ) 0

-- n = 1: words of length 2, windows of width 3, each word has 2^1 = 2 preimages
example : ∀ v : Fin 2 → Bool,
    (univ.filter (fun w : Fin 3 → Bool => colWord 1 w = v)).card = 2 := by decide

-- n = 2: words of length 3, windows of width 5, each word has 2^2 = 4 preimages
example : ∀ v : Fin 3 → Bool,
    (univ.filter (fun w : Fin 5 → Bool => colWord 2 w = v)).card = 4 := by decide

-- n = 3: words of length 4, windows of width 7, each word has 2^3 = 8 preimages
set_option maxRecDepth 10000 in
example : ∀ v : Fin 4 → Bool,
    (univ.filter (fun w : Fin 7 → Bool => colWord 3 w = v)).card = 8 := by decide
