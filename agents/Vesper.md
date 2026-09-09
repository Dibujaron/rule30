# Vesper

I'm Vesper, and I hold the edges of Rule 30's light cone — the diagonal boundaries past which no cell's value can propagate, and the near-boundary bands where the automaton, for reasons that are actually provable rather than merely observed, settles into strict periodicity. If the center column is where the chaos lives, my region is where it doesn't: I want clean statements of exactly how far in from an edge the pattern is forced to repeat, and clean proofs of why. I think of a theorem here the way I'd think of a type signature in Kotlin — the statement in `Rule30/Statements.lean` is the contract, and my job in `Rule30/Proofs/` is to actually construct a value of that type, no `sorry`s left as unfulfilled promises. I expect a lot of my proofs to be inductions on the distance from the edge, since that's usually where periodicity arguments actually bite. This notebook is where I keep what I've learned about that boundary from session to session, since I won't remember on my own.

## 2026-09-05T22:24:51Z — named for P1

P1 lives at the boundary of the light cone — the line past which a cell's history can no longer reach, and the region just inside it where Rule 30 stops looking chaotic and locks into a provably periodic pattern. That's a dusk line: chaos on one side, order settling in on the other, repeating night after night. "Vesper" names the evening star and the hour it rises in — the fixed point you can set a clock by even while everything else churns. It's a real word-turned-name, not a living person, and not a job title, and it points straight at the geometry I'm here to own: edges, and the periodicity that provably holds along them.

## 2026-09-05T22:46:24Z — evolve_eq_false_of_outside_cone (sonnet, proved)

Two gotchas worth remembering for anyone in P1 touching `|i|` on ℤ:

1. `import Rule30.Basic` alone (which only pulls in `Mathlib.Data.Int.Notation`) is NOT enough to even *parse* `|i|` — the abs notation macro isn't in scope, giving a bare "unexpected token '|'" parse error that looks like nothing to do with abs. `import Mathlib.Algebra.Order.Ring.Int` fixes both the notation and gives the full `LinearOrderedCommRing ℤ` instance (so `abs_of_nonneg`, `abs_of_nonpos`, `le_total`, `omega` on ℤ, etc. all work). Cheaper imports (`Mathlib.Algebra.Order.Group.Unbundled.Abs`, `Mathlib.Data.Int.Order.Basic`) each solve only half the problem (notation xor instances) — don't bother trying to be minimal here, just pull in `Mathlib.Algebra.Order.Ring.Int`.

2. `omega` does NOT understand `abs`/`|·|` directly (unlike `Int.natAbs`, which it does special-case). The working pattern is: case-split on the sign with `le_total 0 i`, rewrite `|i|` to `i` or `-i` via `abs_of_nonneg`/`abs_of_nonpos` (supplied via `by omega : 0 ≤ i - 1` etc. once the sign is fixed), *then* call `omega` on the now-linear goal. `le_or_lt` is not the right name to reach for in this Mathlib snapshot (unknown identifier) — `le_total` is the one that resolves.

Proof shape for anyone doing the sibling edge lemmas (`evolve_left_edge`, `evolve_right_edge`, etc.): induction on `t` (or `generalizing i` where needed), `rw [evolve_succ, rule30_eq]` to expose the three-neighbour xor/or formula, then discharge each neighbour's cone/edge membership with the induction hypothesis. `centerColumn_zero` is already served and importable if useful (shows initialConfig gives true at 0, dual to the false-outside-cone case here).

## 2026-09-06T01:01:42Z — chose a colour

Colour: #2b3a67 — A deep twilight indigo — vesper is the evening prayer at dusk, and dusk is the calm, settled edge of the day the way my periodic bands are the calm, settled edge of the light cone.

## 2026-09-06T01:07:18Z — evolve_left_edge (sonnet, proved)

## evolve_left_edge (sonnet, proved)

Straightforward induction on `t`, mirroring `evolve_eq_false_of_outside_cone`'s shape but simpler since there's no case split on the sign of `i` — the edge is always negative.

- Base case: goal is `evolve 0 (-(↑(0:ℕ):ℤ)) = true`. `simp only [Nat.cast_zero, neg_zero]` turns `-(↑0)` into `0`, then `exact centerColumn_zero` closes it directly — `centerColumn 0` is defeq to `evolve 0 0` (plain `def`, not `abbrev`, but `exact` unfolds it fine at default transparency). No need to `unfold centerColumn` explicitly.
- Successor case: `push_cast` first to turn `-(↑(n+1):ℤ)` into `-(↑n + 1)` so later `have`s' LHS syntactically matches what `rule30_eq` will produce. Then `rw [evolve_succ, rule30_eq]` exposes `xor (evolve n (X-1)) (evolve n X || evolve n (X+1))` with `X = -(↑n+1)`. Two `have`s proved by `ring` rewrite `X-1` to `-(↑n+2)` and `X+1` to `-↑n`. Then: `evolve_eq_false_of_outside_cone` kills the left neighbour (`n < |-(↑n+2)| = n+2`), and `ih : evolve n (-↑n) = true` handles the right neighbour, which alone forces the `||` to `true`; `simp` closes `xor false true = true`.

**Gotcha for anyone in P1**: `Mathlib.Algebra.Order.Ring.Int` (needed for `abs`/`omega` per [[evolve-eq-false-of-outside-cone]]'s notes) does NOT bring in the `ring` or `linarith` tactics. Got "unknown tactic" + cascading "unsolved goals" errors that looked unrelated to the actual missing import. Fix: explicitly `import Mathlib.Tactic.Ring` and `import Mathlib.Tactic.Linarith` alongside it. Don't assume any single Mathlib import pulls in the tactics you'd expect — the algebra/order imports and the tactic imports are separate axes.

Reused `abs_of_nonpos` + `linarith`/`omega` pattern from the outside-cone proof for the `|-(↑n+2)| = ↑n+2` fact — that pattern (case on sign, rewrite abs, then close linear goal) is the reusable idiom for this whole region.

## 2026-09-06T01:53:41Z — evolve_left_second_diagonal (sonnet, proved)

This one was already fully written by attempt 1 before it hit the 5-hour rate limit; I just re-ran `lake build Rule30.Proofs.EvolveLeftSecondDiagonal` against the untouched file and it built clean on the first try. No changes needed. Worth noting for future P1 work: the harness's Bash guard rejects `cd <dir> && lake build ...` as a shell-operator violation — just run the bare `lake build <module>` command directly; the working directory is already correct.

Proof shape, one level shallower than `evolve_left_edge`'s induction — no induction needed here, just one `rw [evolve_succ, rule30_eq]` at `i = -(t:ℤ)` to expose `xor (evolve t (-(t:ℤ)-1)) (evolve t (-(t:ℤ)) || evolve t (-(t:ℤ)+1))`, then:
- `h1 : evolve t (-(t:ℤ) - 1) = false` via `evolve_eq_false_of_outside_cone`, using `abs_of_nonpos` + `linarith` to show `|-(t:ℤ)-1| = t+1 > t` (same case-on-sign-then-linarith idiom as the other P1 lemmas).
- `h2 : evolve t (-(t:ℤ)) = true` is exactly `evolve_left_edge t`, served — no need to reprove the edge fact.
- `rw [h1, h2]; simp` closes `xor false (true || _) = true` — simp knows `true || x = true` and `xor false true = true` without any hints.

This confirms the reusable P1 idiom is now three-deep: outside-cone (induction), left-edge (induction using outside-cone), second-diagonal (no induction, just one unfold using both served lemmas). The next diagonal out (third diagonal, distance 2 from edge) will likely need an actual induction again since the direct neighbour argument won't fully collapse — worth checking whether it needs a two-step unfold or an induction on t with a stronger IH.

## 2026-09-06T14:49:46Z — evolve_left_third_diagonal (sonnet, proved)

One-step unfold, no induction — same shallow shape as second-diagonal, one level further out.

Key insight: `t + 2` is not syntactically `?n + 1`, so `rw [evolve_succ]` won't match it directly — first rewrite with `have heq : t + 2 = t + 1 + 1 := by omega; rw [heq, ...]`. (Defeq might actually let `show`/`rw` see through numeral `2` vs `1+1` for `Nat`, but I didn't risk it — the explicit `heq` via `omega` is cheap and unambiguous, worth doing by default whenever a served lemma's `+1` shape needs to line up with a `+2` or higher goal.)

After `rw [heq, evolve_succ, rule30_eq]` at `i = -(t:ℤ)`, goal is `xor (evolve (t+1) (-(t:ℤ)-1)) (evolve (t+1) (-(t:ℤ)) || evolve (t+1) (-(t:ℤ)+1)) = false`. The trick: you never need the right-neighbour term at all.
- Left neighbour: `-(t:ℤ) - 1 = -((t+1:ℕ):ℤ)` (via `push_cast; ring`), so it's exactly `evolve_left_edge (t+1)` = `true`.
- Centre: exactly `evolve_left_second_diagonal t` = `true` (that lemma's statement is literally `evolve (t+1) (-(t:ℤ)) = true`, no massaging needed).
- `true || x = true` regardless of the right neighbour, and `xor true true = false` — `simp` closes it after `rw [h1, h2]` with zero hints.

So the pattern for the *next* diagonal out (4th, distance 3) is probably: the two innermost neighbours (left-edge-shifted and second-diagonal-shifted) will likely both resolve via served lemmas, but check whether `true || _` is still enough to collapse the `xor`, or whether the right-neighbour term (now one step further from the edge, possibly not `false` yet) actually needs pinning down. Worth checking `evolve_eq_false_of_outside_cone` doesn't apply that far in yet — distance from edge matters more than distance from origin here.

General reusable fact for P1: whenever a goal's Nat step-count is `t + k` for `k ≥ 2`, do `have heq : t + k = t + (k-1) + 1 := by omega; rw [heq, ...]` before `evolve_succ` — don't rely on defeq matching numerals through `rw`.

## 2026-09-06T15:18:09Z — evolve_left_diagonal_recurrence (haiku, proved)

Simplest possible proof shape: rewrite the Nat sum, then unfold the rule, then let `ring` handle the integer arithmetic inside function arguments.

The one gotcha: `Mathlib.Tactic.Ring` is a separate import from `Mathlib.Algebra.Order.Ring.Int` — the algebra imports don't bring in the tactic, so a bare `ring` or `ring_nf` gave "unknown tactic" until I added it. (Learned this again the hard way on `evolve_left_edge`, but forgot to save it before this proof — important to repeat: the algebra/order and tactic import axes are orthogonal in this version of Mathlib.)

The proof structure should anchor later diagonal lemmas: instead of re-deriving `-(i+1) - 1 = -(i+2)` each time, cite this lemma's arithmetic verification via `show ... from by ring`. This is the coordinate-shift dictionary.

Goal after `rw [show i+m+3 = (i+m+2)+1 from by omega, evolve_succ, rule30_eq]`:
```
(evolve (i + m + 2) (-(↑i + 1) - 1) ^^ (evolve (i + m + 2) (-(↑i + 1)) || evolve (i + m + 2) (-(↑i + 1) + 1))) =
  (evolve (i + m + 2) (-(↑i + 2)) ^^ (evolve (i + m + 2) (-(↑i + 1)) || evolve (i + m + 2) (-↑i)))
```

After `simp only [show -(↑i + 1 : ℤ) - 1 = -(↑i + 2 : ℤ) from by ring, show -(↑i + 1 : ℤ) + 1 = -(↑i : ℤ) from by ring]`, Lean sees both sides are syntactically identical and closes.

## 2026-09-06T15:22:05Z — evolve_left_fourth_diagonal (sonnet, proved)

First genuine induction in P1's diagonal series — the recurrence lemma `evolve_left_diagonal_recurrence` finally earns its keep as the "coordinate-shift dictionary" it was built to be.

**Finding the right (m, i) instantiation is the whole trick.** The recurrence's shape is `evolve (i+m+3) (-(i+1)) = xor (evolve (i+m+2) (-(i+2))) (evolve (i+m+2) (-(i+1)) || evolve (i+m+2) (-i))`. To land on the successor goal `evolve ((n+1)+3) (-(n+1))`, solve `i+1 = n+1` and `i+m+3 = (n+1)+3` simultaneously: i = n, m = 1. Once you plug that in, the three RHS terms are *exactly* the second diagonal (at n+2), third diagonal (at n+1), and fourth diagonal (at n, i.e. the induction hypothesis) — no residual arithmetic needed beyond `omega`-provable Nat reassociations (`n+1+2 = (n+2)+1` etc.) to align each served lemma's own `+1`/`+2` shape with the recurrence's `i+m+2` form, plus one `push_cast; ring` cast lemma per side to convert `-((k:ℕ):ℤ)` into `-((n:ℤ)+k)` form so `rw` can match syntactically. Same idiom as the third-diagonal proof, just three copies of it instead of one.

**Base case (t=0) used `decide` directly** on the raw, un-simplified goal `evolve (0+3) (-(↑(0:ℕ))) = decide (0 % 2 = 0)` — no `simp`/`norm_num` preprocessing needed. `decide` doesn't care about surface syntax (`0+3` vs `3`, `↑0` vs `0`); it just needs a `Decidable` instance for the whole equality (trivial: both sides are `Bool`), then the kernel evaluates everything by computation. Worth remembering as a shortcut for any base case that's a small concrete numeral — building the 7-cell-wide light cone for `evolve 3 0` by hand (nested `xor`/`||` over `initialConfig` at -3..3) is tedious and unnecessary when the numbers are this small; `decide` reduces it in under a second and adds no axioms (verified no `Native.decide` — it's ordinary kernel reduction, safe under the propext/Classical.choice/Quot.sound axiom cap).

**Closing the parity arithmetic**: after the recurrence collapses to `xor true (false || decide (n % 2 = 0)) = decide ((n+1) % 2 = 0)`, don't hand-simplify `xor`/`||` yourself — `rcases Nat.mod_two_eq_zero_or_one n with h | h <;> simp [h, Nat.add_mod]` closes both branches in one shot. `simp` uses `h : n % 2 = 0` (or `= 1`) as a rewrite rule wherever `n % 2` appears (including inside `decide (n % 2 = 0)` and, via `Nat.add_mod`, inside `(n+1) % 2`), then its built-in numeral simprocs finish the arithmetic and the `decide` reduction. `Nat.mod_two_eq_zero_or_one : ∀ n, n % 2 = 0 ∨ n % 2 = 1` resolved fine in this Mathlib snapshot — no import beyond what's already pulled in by `Rule30.Basic` + the diagonal lemma files was needed.

No new import gotchas this round — the combination of imports from `EvolveLeftThirdDiagonal` + `EvolveLeftDiagonalRecurrence` (`Rule30.Basic`, the three diagonal proof files, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring`) was sufficient; `omega` on ℕ and `Nat.mod_two_eq_zero_or_one` both came along for free, confirming [[evolve-left-edge]]'s note that `omega` itself doesn't need a separate import (core Lean), only the ℤ-specific instances/notation do.

This closes the "first non-constant diagonal" node. Next diagonal out (fifth, distance 4) will likely need the recurrence again but should reuse *this* lemma as one of its three RHS terms instead of `ih` directly on the third diagonal — worth checking whether the parity pattern continues or breaks into a longer period once a fourth distinct diagonal value enters the mix.

## 2026-09-06T15:35:17Z — evolve_left_fourth_diagonal_isEventuallyPeriodic (haiku, proved)

`IsEventuallyPeriodic` is the **first inhabited instance** of the aperiodicity predicate that Rule30/Prize defines for the conjecture. It does not touch the center column; it proves the *predicate itself* is satisfiable by a sequence in the project — in this case, the fourth left diagonal, which provably alternates with period 2.

The definition: `∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p) = f n` — three existentials, all of which must be provided.

**Proof shape**: straight instantiation.
- `use 2` for period, then `omega` to discharge `2 > 0`.
- `use 0` for the starting point (the pattern holds from n=0 onward, no prefix needed).
- For each n ≥ 0, show `f(n+2) = f(n)` via:
  - `have h1 : evolve ((n + 2) + 3) (-(↑(n + 2) : ℤ)) = decide ((n + 2) % 2 = 0) := evolve_left_fourth_diagonal (n + 2)`
  - `have h2 : evolve (n + 3) (-(↑n : ℤ)) = decide (n % 2 = 0) := evolve_left_fourth_diagonal n`
  - Rewrite both sides via these lemmas, then `omega` closes `(n + 2) % 2 = n % 2`.

**Reusable fact for P1**: When the goal is two function applications with shifted indices, avoid trying to rewrite the function head directly — instead `have` the closed form at each index, `rw` both sides, then the parity/arithmetic goal becomes independent and lightweight. This is cleaner than exposing the three-cell rule or nested `evolve_succ`/`rule30_eq` unfolding.

Imports: `Rule30.Prize` for `IsEventuallyPeriodic`, `Rule30.Proofs.EvolveLeftFourthDiagonal` for the closed form. Axioms: propext, Classical.choice, Quot.sound (all inherited).

## 2026-09-06T16:57:27Z — bool_map_iterate_three (sonnet, proved)

bool_map_iterate_three: the brief's suggested `by decide` does NOT work directly — `decide` fails with "Expected type must not contain free variables" because `f` is a bound parameter, not a closed term. `revert f; decide` also fails: `failed to synthesize Decidable (∀ (f : Bool → Bool), f^[3] = f)` — no DecidableEq/Fintype-Pi instance for `Bool → Bool` is in scope from `Rule30.Basic`'s imports (just `Mathlib.Data.Int.Notation` + `Mathlib.Logic.Function.Iterate`), and pulling in `Mathlib.Data.Fintype.Pi` felt like overkill for an S-sized node.

What worked instead, using only what `Rule30.Basic` already imports: `funext x`, then `simp only [Function.iterate_succ_apply', Function.iterate_zero_apply]` to unfold `f^[3] x` to `f (f (f x))`, then `rcases hft : f true with _ | _ <;> rcases hff : f false with _ | _ <;> cases x <;> simp_all`. The insight: a function out of `Bool` is fully pinned down by its two output values, so case-splitting on `f true` and `f false` (4 cases) plus the input `x` (2 cases, collapsed by `<;>`) leaves fully concrete goals that `simp_all` closes using `hft`/`hff` as rewrite rules — including through the nested applications, since simp iterates to a fixpoint.

`Function.iterate_succ_apply'` / `Function.iterate_zero_apply` are the named lemmas for unfolding `f^[n+1] x` to `f (f^[n] x)` form (apply-the-fresh-application-outermost, matching how nested nesting reads) — worth remembering for anyone else in the DAG who needs to unfold a small literal `Function.iterate` by hand rather than relying on defeq/`show`.

This node had a stale attempt already sitting in the file (from a prior session that hit `budget_exhausted`) using `simp [Function.funext_iff]; intro x; decide` — `Function.funext_iff` is not a valid identifier in this Mathlib snapshot (got "unknown identifier"), so that attempt was dead on arrival. Good reminder to always re-verify a file's existing content against a real build rather than trusting it was left in a working state.

## 2026-09-06T17:04:53Z — bool_driven_eventually_two_periodic (sonnet, proved)

The captain's route worked exactly as specced, with two private helpers (`stepMap`, `iterMap`) doing the load-bearing work — first time P1 has needed helper defs alongside the theorem, and nothing in the harness objected to a file with more than one declaration.

**`iterMap` as a manual fold, not `Function.iterate`.** Since the update at index `i+k` is a *different* function of `a`/`b` than at `i`, you can't just use `f^[n]` — you need the composition `stepMap(i+n-1) ∘ ... ∘ stepMap(i)`. Built it as a plain structurally-recursive `def ... : ℕ → Bool → Bool | 0 => id | n+1 => stepMap a b (i+n) ∘ iterMap a b i n`. Equation lemmas for a pattern-matched `def` are NOT needed here — every unfold in the proof went through `rfl` (for the `n=0` case) or `show <unfolded form>` (for the `n+1` case) rather than `simp [iterMap]`, since `show` just needs defeq and pattern-match compilation gives you that for free. Cheaper than fighting with equation-lemma names.

**`set` tactic is unavailable from `Rule30.Basic`'s import surface.** Tried `set j := i - p with hj_def` to name a substitution; got "unknown tactic" at that exact line with a cascading "unsolved goals" one line up (the actual parse failure reports on the *next* line, which was confusing at first). `set` lives in a Mathlib tactic file not pulled in transitively. Fix: don't reach for `set` at all — `obtain ⟨j, hij⟩ : ∃ j, i = j + p := ⟨i - p, by omega⟩` does the same job (name a value, get an equation for it) using only core tactics (`obtain`, `omega`), and reads better besides since `hij : i = j + p` is exactly the substitution you want instead of a reversed subtraction equation.

**The `f^[3] x = f(f(f x))` unfold, reused a third time now** (after `bool_map_iterate_three` itself and presumably others): `congrFun (bool_map_iterate_three g) (x j)` turns the function equality `g^[3] = g` into a pointwise one at the exact argument needed, then `simpa [Function.iterate_succ_apply', Function.iterate_zero_apply] using this` unfolds `g^[3] (x j)` to `g (g (g (x j)))` on the fly inside the `simpa`, avoiding a separate `hexpand` lemma. Cleaner than proving the unfold as its own `have` first.

**Shape of the three-fold gluing.** With `j := i - p` (so the goal's `i` is `j + p`), the three applications of `iter_eq` at basepoints `j`, `j+p`, `j+2p` each advancing by `p` give `x(j+p)`, `x(j+2p)`, `x(j+3p)` in terms of nested `iterMap a b j p` applications once `iter_shift` (proved for `i ≥ N` by induction on the step count, bottoming out in `stepMap_shift` which just cites `ha`/`hb` at the right index) collapses every basepoint back to `j`. The chain of `rw [...] at hB/hC` — substituting each `have` into the next — reads like manual equational reasoning; there's probably a slicker way to thread these through `calc`, but the `rw`-at-hypothesis chain was fast to get right and never fought me.

No axiom surprises — only `propext`, `Classical.choice`, `Quot.sound`, all inherited, none introduced.

## 2026-09-06T17:08:57Z — evolve_left_diagonal_isEventuallyPeriodic_step (sonnet, proved)

The captain's route (a i = d m (i+2), b i = d (m+1) (i+1), x i = d (m+2) i, feed into `bool_driven_eventually_two_periodic`) worked exactly as specced, first try, no dead ends.

**Key simplification: don't name `a`/`b`/`x` as separate `have`-bound locals.** A `have f : T := ...` makes `f` opaque to defeq (it behaves like an `intro`, not a `let`), so later unification against `f`'s *body* fails silently in confusing ways. Instead I never introduced names for them at all — I wrote the exact same lambda literal everywhere it was needed (in `ha`'s statement, in `hb`'s statement, inside `hrec`'s statement, and again as the explicit `a b x` arguments to `bool_driven_eventually_two_periodic`). Repetition, but every occurrence stays fully transparent to `exact`/defeq, so `isEventuallyPeriodic_shift (fun j => ...) 2 h0` closes `ha`'s goal directly via beta reduction with no `rw`/`show` massaging needed at all — Lean beta-reduces `(fun j' => body) (i+2)` to the substituted form automatically when checking defeq against the stated `have` type.

**Coordinate alignment is a single `rw [show ... from by omega, show ... from by push_cast; ring, ...]` chain.** With `a i := evolve (i+2+m) (-((i+2:ℕ):ℤ))`, `b i := evolve (i+1+(m+1)) (-((i+1:ℕ):ℤ))`, `x i := evolve (i+(m+2)) (-(i:ℤ))`, the needed recurrence `x(i+1) = xor (a i) (b i || x i)` is *exactly* `evolve_left_diagonal_recurrence m i` after six ground rewrites (three Nat-sum reassociations via `omega`, two cast-of-sum-to-sum-of-casts via `push_cast; ring`, one trivial Nat reassociation). `rw` with a fully concrete (no metavariables) equation rewrites every matching occurrence in the goal at once, so each cast rewrite only needs to be stated once even though it appears twice (once in the LHS's `x(i+1)` term, once in the `b i` term that shares the same `i+1` cast).

Reusable idiom for the rest of P1's induction-step family (if there are more `_step` nodes for other diagonal offsets): write `a`, `b`, `x` as raw lambda literals throughout rather than binding them, and the six-rewrite alignment chain is copy-pasteable with the offsets adjusted.

**Import set that sufficed:** `Rule30.Basic`, the four served-lemma modules named in the brief, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring` — same set `EvolveLeftFourthDiagonal.lean` uses, confirming (again) that `push_cast` rides in on one of those two imports rather than needing its own; no separate `Mathlib.Tactic.PushCast`/`NormCast` import was needed.

No axiom surprises — `lake env lean` on the file gave no errors/warnings, and every lemma cited is already vetted to the standard three axioms.

## 2026-09-06T17:11:17Z — evolve_left_diagonals_isEventuallyPeriodic (sonnet, proved)

Transcription job exactly as the brief promised — the captain had already proved this end to end against a sorry'd step lemma, so there was nothing to discover, only to type correctly. First try, no build failures at all.

**`match k, ih with | 0, _ => ... | 1, _ => ... | m + 2, ih => ...` as a tactic** works cleanly after `induction k using Nat.strong_induction_on with | _ k ih =>`. The goal mentions `k`, and `ih : ∀ m, m < k → motive m`, so matching on `(k, ih)` together (not just `k` alone) lets the `m + 2` branch bind a correctly-specialized-but-still-general `ih : ∀ j, j < m + 2 → ...` to feed `ih m (by omega)` and `ih (m+1) (by omega)`. `Nat.strong_induction_on` (the name the brief specified) resolved fine in this Mathlib snapshot — no import beyond what `EvolveLeftDiagonalIsEventuallyPeriodicStep`'s own transitive imports already pulled in (`Rule30.Basic`, `Rule30.Prize` for `IsEventuallyPeriodic`, the served step/edge/second-diagonal modules).

**The base-case friction was exactly as billed.** For `k = 0`, the goal after `intro n _; simp only []` (beta-reduction only, no rewriting) is `evolve (n + 1 + 0) (-((n+1:ℕ):ℤ)) = evolve (n + 0) (-(n:ℤ))`. `evolve_left_edge` is stated at bare `t`/`t+1`, not `t + 0`/`t + 1 + 0`, so a direct `exact`/`rw` won't match syntactically even though `n + 0` is defeq to `n`. Fix: state a `have` at *exactly* the goal's shape, `rw [show n + 1 + 0 = n + 1 from by omega]` to align the index inside that `have`'s own proof, then cite the served lemma — never try to `simp` the cast first, since normalizing `-((n+1:ℕ):ℤ)` into `-(↑n + 1)` form makes it stop matching the served lemma's own `-((t:ℕ):ℤ)` statement shape.

For `k = 1`, no rewriting was even needed — `evolve_left_second_diagonal (n+1) : evolve ((n+1)+1) (-((n+1:ℕ):ℤ)) = true` matches the goal's `n + 1 + 1` shape exactly as written (associativity of `+` on numerals/variables here is already left-to-right so `(n+1)+1` and `n+1+1` are syntactically identical, unlike the `k=0` case's `n+1+0` vs `n+1` mismatch which needed the explicit `omega` bridge).

Confirms [[evolve-left-fourth-diagonal-isEventuallyPeriodic]]'s idiom (have the closed form at each shifted index, then `rw` both into the goal) generalizes cleanly to the strong-induction base cases too — the pattern is: never fight the index shape with `simp`, just state a `have` matching it precisely and bridge with a small `omega`-proved index equation when the served lemma's own shape doesn't happen to line up syntactically.

This closes the top-level "every left diagonal is eventually periodic" goal for P1's left side. The right side (evolve_right_edge, evolve_right_second_diagonal already served) presumably wants the mirror-image family next, if not already underway by a peer.

## 2026-09-06T21:14:47Z — evolve_sub_one_eq_xor (haiku, proved)



## 2026-09-06T21:29:25Z — evolve_period_sub_one (haiku, proved)

**evolve_sub_one_eq_xor as the workhorse**: The lemma `evolve t (i - 1) = xor (evolve (t + 1) i) (evolve t i || evolve t (i + 1))` directly expresses how each cell on the left is determined by three cells to its right, spanning times t and t+1. This is the key to the proof: rewrite both sides of the periodicity goal with this lemma at different times, then the hypotheses h0/h1 collapse everything to reflexivity.

**Rewrite order matters**: Applying `evolve_sub_one_eq_xor (t + p) i` and then `evolve_sub_one_eq_xor t i` in sequence leaves a goal whose left side has terms at time (t+p+1), (t+p), and right side at (t+1), (t). Then `ring` to rewrite `t + p + 1 = t + 1 + p`, and h0/h1 at t and t+1 collapse all four terms to syntactic identity.

**Arithmetic on Nat subtraction not needed**: Unlike earlier P1 nodes where we had to worry about `t - 1` and whether `t + p - 1 + 1 = t + p`, here we avoid subtraction entirely. evolve_sub_one_eq_xor is stated in forward time (`t` and `t+1`), not in the backwards form we initially tried, so the proof never computes `t - 1` or `t + p - 1` as natural numbers.

## 2026-09-06T21:30:46Z — evolve_period_sub (sonnet, proved)

Went exactly as the brief specced — first-try build, no dead ends. The route: prove a stronger conjunctive statement by induction on k, `key : ∀ k, (col (i-k) periodic) ∧ (col (i-k+1) periodic)`, then project `.1` for the actual goal. Carrying the pair is essential because `evolve_period_sub_one` needs *both* a column and its right neighbour to conclude the column one further left.

Base case `k = 0`: `simpa using ⟨h0, h1⟩` — simp normalizes `i - (↑(0:ℕ))` to `i` and `i - 0 + 1` to `i + 1` (via `Nat.cast_zero`/`sub_zero`/etc.) automatically, no manual cast lemma needed there.

Step case: `evolve_period_sub_one (i - (k:ℤ)) p N ih.1 ih.2` gives periodicity of column `(i-k)-1`, exactly what's needed for the new "first" component after re-expressing `i - ((k+1:ℕ):ℤ)` as `i - (k:ℤ) - 1`. The second (right-neighbour) component of the new pair is just `ih.1` again after the matching rewrite `i - ((k+1:ℕ):ℤ) + 1 = i - (k:ℤ)` — no new lemma needed, just re-threading the previous "current column" into the new "right neighbour" slot.

Both cast identities close with `by push_cast; ring` exactly as the brief promised — `push_cast` turns `((k+1:ℕ):ℤ)` into `(k:ℤ) + 1` and then `ring` handles the rest. `rw [show ... from by push_cast; ring]` (rewriting the goal's LHS index expression to the shape `evolve_period_sub_one`'s output already has) rather than trying to rewrite `hstep`'s statement — cheaper to align the goal to the served term than vice versa.

Confirms the reusable idiom from [[evolve-period-sub-one]] and the diagonal family: when an induction's Nat-indexed goal has a `+1`/`-1` shape mismatch against a served lemma, a targeted `rw [show <bridge equation> from by push_cast; ring]` is the standard fix — cheaper than trying to get `simp` to normalize both sides into agreement, which risks over-normalizing past the point where the served lemma's own statement still matches syntactically.

This closes another node in the periodicity-propagation family that presumably feeds toward comparing whole regions of the light cone for eventual periodicity, mirroring the left-diagonal `IsEventuallyPeriodic` work but for adjacent-column pairs rather than a single diagonal sequence.

## 2026-09-06T21:33:04Z — not_evolve_period_adjacent (sonnet, proved)

First try, no dead ends — the captain's route in the brief was exact and needed zero adjustment. Worth recording as the reusable idiom for this last node's shape (a global-contradiction proof rather than an induction), since it's a different shape from every other P1 node so far.

**The `∃ m, m = ...` / `obtain` idiom beats naming with `let`/`set` here.** Rather than binding `m := N + p + (-i).toNat + 1` and `k := (i + m).toNat` as `let`s (risking the `set`-tactic import trap [[bool-driven-eventually-two-periodic]] hit), I used `obtain ⟨m, hm⟩ : ∃ m : ℕ, m = ... := ⟨_, rfl⟩` twice. This keeps `hm`/`hk` as ordinary equations in context that `omega` can see and use, with no defeq-transparency subtlety at all — cleaner than `let` for this purpose since every later step is pure arithmetic omega can close outright.

**`omega` closes `Int.toNat` reasoning directly, no manual case-split needed.** The load-bearing fact `i - (k:ℤ) = -(m:ℤ)` (with `hk : k = (i + (m:ℤ)).toNat` in context) needs `i + m ≥ 0` to know `(k:ℤ) = i + m` (via `Int.toNat_of_nonneg`), and that nonneg fact itself depends on unfolding `(-i).toNat` inside `hm`. I expected to need `Int.toNat_of_nonneg`/`Int.le_toNat`/case-splits by hand, but `omega` swallowed the whole thing in one call given just `hm` and `hk` in context — confirms omega's Int.toNat special-casing (mentioned in passing in earlier P1 notes but never actually exercised until this node) is real and doesn't need any manual bridging lemma. Same for `hmp : p ≤ m` and `htN : m - p ≥ N` — both closed by bare `omega` from `hm` alone.

**`Nat.abs_cast` is a real lemma name in this Mathlib snapshot** — `|(n:ℤ)| = n` for `n : ℕ`, used after `abs_neg` to turn `|-(m:ℤ)|` into `(m:ℤ)` directly. Chain was `rw [abs_neg, Nat.abs_cast]` exactly as the brief specified, then `exact_mod_cast (by omega : m - p < m)` for the final numeral inequality — no surprises.

**Import set**: `Rule30.Basic`, `Rule30.Proofs.EvolvePeriodSub`, `Rule30.Proofs.EvolveLeftEdge`, `Rule30.Proofs.EvolveEqFalseOfOutsideCone`, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring` — the last two turned out unnecessary in the end (no bare `ring`/abs-sign-splitting was needed once `omega` swallowed everything), but harmless to leave in since they were already pulled in transitively by the served-lemma imports anyway. Next time a similar all-omega proof comes up in P1, worth trying with a narrower import list first since `ring`/`Order.Ring.Int` may not be needed at all when `omega` is doing all the arithmetic.

This appears to close the last currently-open node in the P1 seeded spine (the "no two adjacent columns share a period" node was the final piece connecting the diagonal/periodicity family into a usable contradiction). Worth checking with Rowan/the dispatcher whether a new tier is queued next.

## 2026-09-06T21:38:18Z — not_isEventuallyPeriodic_adjacent (haiku, proved)

The route was exactly as the captain specified in the brief. After unpacking the conjunction of the two eventually-periodic hypotheses with `rintro`, apply `isEventuallyPeriodic_common_period` with the two function literals `fun t => evolve t i` and `fun t => evolve t (i + 1)` as explicit arguments (the lemma needs the actual functions passed in, not just the proofs). The lemma returns a common period `p`, proof `hp : 0 < p`, starting time `N`, and the periodicity conditions `h0` and `h1` for both columns. Thread these directly into `not_evolve_period_adjacent i p N hp h0 h1`, which yields False.

No friction — the proof built first try once the function arguments were passed explicitly to the common-period lemma. The three-heading proof note follows the taught pattern: what it says (boundary fact about the automaton), why it's true (periodicity propagates contradictorily), where the work is (none — just lemma threading).

Uses only the standard three axioms (propext, Classical.choice, Quot.sound), inherited from served lemmas.

## 2026-09-06T21:43:21Z — centerColumn_right_not_both_isEventuallyPeriodic (haiku, proved)

**Direct application of served lemma.** `centerColumn` unfolds to `fun t => evolve t 0` by definition. The served lemma `not_isEventuallyPeriodic_adjacent i` states that columns i and i+1 cannot both be eventually periodic. At i=0, this gives exactly what we need after unfolding centerColumn and letting simpa handle the `0 + 1 = 1` arithmetic. No induction, no proof search — just definitional unfolding and lemma threading.

## 2026-09-06T21:44:24Z — centerColumn_not_eventually_periodic_of_right (haiku, proved)

**Bridge lemmas are transparent:** When a hypothesis has the form "if X then Y", applying it to a proof of X and feeding the result to a contradiction lemma (via a pair or tuple) reads as the direct encoding of "X is impossible" — no intermediate steps or names needed. This pattern appears three times now in the P1 region: here, in `not_isEventuallyPeriodic_adjacent`, and in the driven-sequence node. For anyone building a final contradiction from eventually-periodic neighbors, the shape is always `intro hc; exact not_isEventuallyPeriodic_adjacent i ⟨hc, h hc⟩` where `h` is the propagation rule and `i` is the coordinate pair.

## 2026-09-06T23:23:03Z — isEventuallyPeriodic_of_periodic_step (opus, abandoned)

**THE BIG ONE — the `type_of%` check cannot handle `{α : Type} [C α]` statements, and no worker-side fix exists.** Proof is correct and builds clean; the harness verdict came back FAILED twice, identically:

```
checks/isEventuallyPeriodic_of_periodic_step.lean:3:33: error: typeclass instance problem is stuck
  Fintype ?m.1
checks/...:4:14: error: Unknown constant `harness_check`
```

Column 33 of line 3 is exactly where the statement's name starts (`theorem harness_check : type_of% ` = 33 chars), so the error is on the Statements side, before the proof is consulted. The statement opens `{S : Type} [Fintype S]`; naming it bare in term position inserts `?S` and then asks for `Fintype ?S`, which Lean refuses to attempt while the type argument is a metavariable. `type_of%` gives no expected type, so `?S` is never determined. Second error is just `#print axioms` failing on a declaration line 3 never produced.

**How to prove this kind of thing from inside a worker's cage — the reusable trick.** I could not read the check file usefully or edit it, so I reproduced its *shape* inside my own proof file, aimed at my own theorem, with `Rule30.Statements` neither imported nor involved:

```lean
private theorem diag_bare :
    type_of% isEventuallyPeriodic_of_periodic_step :=
  isEventuallyPeriodic_of_periodic_step

private theorem diag_at :
    type_of% @isEventuallyPeriodic_of_periodic_step :=
  @isEventuallyPeriodic_of_periodic_step
```

`diag_bare` reproduced the error character for character (col 13, exactly where the bare identifier begins after `    type_of% `). `diag_at` produced nothing. Same theorem, same file, opposite outcomes ⇒ cause is the line's shape, not the statement file and not my proof. Then delete both and rebuild. **Generalize: when you suspect the harness rather than yourself, build the harness's construct locally against your own theorem. It converts "I argued" into "I measured", costs one build, and is the difference between a bug report that gets actioned and one that gets doubted.** This is the CLAUDE.md "distrust a result you dislike as hard as one you like" rule with an actual method attached — my first report reasoned to the right answer with no evidence, which was luck.

**Fix filed:** emit `type_of% @Statements.foo := @foo`. `@` suppresses implicit insertion so the full `∀ {S} [inst], ...` comes back with nothing to synthesize. Note it makes the check *stricter* (compares whole quantified types incl. binder structure), so it cannot admit a weakened restatement.

**The road not taken, and do not take it.** A `@[default_instance]` `Fintype` instance would let Lean fill `?S` with an arbitrary type and the check would go green — for a *specialised* statement that is not the one asked for. That is fabricating a pass, forbidden by the exact-type rule, and it would pollute instance resolution for every downstream file. It was available and it would have looked like success. Name it and refuse it.

**Watch for the quieter sibling.** Implicit *value* params under `type_of%` do not get stuck — they instantiate silently and check a type that is not the stated one. That fails *open*, which is worse. Same `@` fix.

---

Proof content, for the record:

**Found the file already complete.** Attempt 1 (sonnet) wrote a full correct proof, then reported `budget_exhausted` before verification. Built first try untouched. Second time in P1 (see [[evolve-left-second-diagonal]]). But [[bool-map-iterate-three]] is the counter-case — an inherited attempt dead on arrival with an unknown identifier. **Build the inherited file before either trusting or distrusting it; the build is the only thing that settles which case you are in.**

**No Rule30 content at all.** Pure finite-state-machine lemma. `import Rule30.Basic` + `import Mathlib.Tactic` is the whole import list, no served lemma cited. P1's served-lemma list can be entirely irrelevant to a node.

**A helper with an ordering hypothesis beats `wlog`.** Brief specced `wlog hlt : (x:ℕ) < y generalizing x y`. Better: prove `have core : ∀ a b : ℕ, a < b → s (N + a*p) = s (N + b*p) → <goal>` once, then `rcases lt_or_gt_of_ne (Fin.val_injective.ne hxy) with hlt | hlt` and close both branches with `core x y hlt hfxy` / `core y x hlt hfxy.symm`. One proof, both orderings, no `wlog` side-goal bookkeeping. `Fin.val_injective.ne` gets `(x:ℕ) ≠ (y:ℕ)` from `x ≠ y` on `Fin n`.

**The omega-atom trap is real; the brief's fix is exact.** `omega` treats `a * p`, `b * p`, `(b - a) * p` as three unrelated atoms — variable×variable is nonlinear. Hoist `have hmul : a * p + (b - a) * p = b * p := by rw [← Nat.add_mul]; congr 1; omega` into context first; then every later index-shuffle closes by bare `omega`. (`rw [← Nat.add_mul]` gives `(a + (b - a)) * p`; `congr 1` reduces to the linear `a + (b - a) = b`.) **General rule: when omega must relate `f x` and `f y` for nonlinear `f`, hand it one hypothesis equating the atoms and it does the surrounding linear arithmetic itself.**

**`positivity` cannot prove `0 < (b - a) * p`** — needs `a < b` plus truncated Nat subtraction. Use `Nat.mul_pos (by omega) hp`.

**Pigeonhole idiom (first in P1):** `Fintype.exists_ne_map_eq_of_card_lt (fun k : Fin (Fintype.card S + 1) => s (N + (k:ℕ) * p)) (by simp)`. Indexing by `Fin (card S + 1)` makes the side condition `card S < card (Fin (card S + 1))`, closed by `simp` via `Fintype.card_fin`. Returns `⟨x, y, hxy, hfxy⟩`.

**Note repair.** The inherited note said the argument chains "cell by cell" — borrowed from the neighbouring diagonal proofs, meaningless in a lemma with no cells and no automaton — and ran nine lines against the six-line ceiling. Rewrote both.

## 2026-09-06T23:35:20Z — isEventuallyPeriodic_of_periodic_step (sonnet, proved)

Second attempt at this exact node — the first (opus, recorded above) was correct but was wrongly failed by a harness bug in the verifier's check theorem, since fixed at commit 5a9e3ae (the `@` fix on both sides of `type_of%`). This attempt reused that route verbatim from the notebook and it built clean, confirming the earlier diagnosis was right.

One direction slip worth flagging for the next person citing `hstep_mul`: its statement is `step (t + m*p) = step t` — the *shifted* time on the left, the *base* time on the right. When you need `step base = step (base + k*p)` (base on the left, as `hprop`'s induction step does after rewriting the goal with `hshift`), you need `.symm` — Lean's type mismatch error names the two sides explicitly when this is flipped, so it's a one-line fix once you see it, but easy to get backwards when writing the proof forward from the recurrence in your head rather than from the goal as stated after `rw`.

Otherwise every piece of the captain's route and the abandoned attempt's notes (the `hmul` atom-hoisting trick for omega, `Nat.mul_pos` in place of `positivity`, the `Fintype.exists_ne_map_eq_of_card_lt` pigeonhole, avoiding `wlog` with an explicit `core` helper plus `lt_or_gt_of_ne (Fin.val_injective.ne hxy)`) worked exactly as documented, first try after the one `.symm` fix. Import list `Rule30.Basic` + `Mathlib.Tactic` was sufficient, no Rule30 automaton content at all.

`lake env lean` on the file gave no output (clean, no warnings) — standard three axioms expected, consistent with every other node in this family.

## 2026-09-06T23:36:19Z — strip_eventuallyPeriodic (haiku, proved)

**Strip-and-schedule pattern.** This node shows the cleanest application yet of `isEventuallyPeriodic_of_periodic_step`: the schedule of update maps is determined entirely by two boundary cells (via `stripStep`), so when those cells are eventually periodic with the same period, the update schedule is too, and the orbit (the strip itself) is eventually periodic with a doubled period. The captain's route was exact and needed no adjustment — `refine ... ?_ ?_`, then two trivial subgoals: `simp only [ha, hc]` for the schedule periodicity and `exact strip_succ` for the step equation. The note's phrasing — "the update rule depends only on the two boundary cells" — is the key insight that makes this whole proof disappear.

No new import gotchas (all served lemmas resolved cleanly) and no new Mathlib patterns beyond what prior nodes in P1 established.

## 2026-09-06T23:41:26Z — evolve_isEventuallyPeriodic_of_between (haiku, proved)

**Lemma threading pattern confirmed.** When a served lemma returns a structure of witnesses (like `isEventuallyPeriodic_common_period` returning period, bound, time, and two periodicity proofs), `obtain` unpacks them cleanly and they feed directly into the next lemma. No special handling needed — the types align as the brief specifies.

**`congrFun` on structural equality.** When a hypothesis `hM : strip i w = strip i w` (or in this case, the functional equality after periodicity) is applied at a specific index via `congrFun hM ⟨0, by omega⟩`, it yields the value at that index. Then `simpa [strip]` unfolds the `strip` definition to reveal the underlying `evolve` term, letting `simp` close the goal by unification.

**The served lemmas were exactly right.** `isEventuallyPeriodic_common_period` takes explicit function arguments (the captain's note applies here too — pass the lambdas, not just the proofs), and `strip_eventuallyPeriodic` immediately produces the result needed. No friction.

## 2026-09-06T23:42:49Z — not_isEventuallyPeriodic_pair (sonnet, proved)

First try, no dead ends — the captain's route in the brief was exact and needed zero adjustment, closing P1's headline node (Jen's theorem: no two distinct columns are both eventually periodic, for any gap, not just adjacent ones).

**Shape**: `rintro ⟨hi, hj⟩`, reduce to the adjacent case via `apply not_isEventuallyPeriodic_adjacent i; refine ⟨hi, ?_⟩`, then `rcases eq_or_lt_of_le (show i + 1 ≤ j by omega) with h | h` splits on whether j is literally i+1 (trivial, `rw [h]; exact hj`) or strictly further (the real case).

**The strict case is pure index bookkeeping, no new proof idea.** `evolve_isEventuallyPeriodic_of_between (i+1) w ha hc` wants `ha` at `evolve t (i+1-1)` and `hc` at `evolve t (i+1+w+1)`, so picking `w = (j-i-2).toNat` makes the right boundary land exactly on `j`. The bridging equation `e : i + 1 + ((j-i-2).toNat : ℤ) + 1 = j` needs `Int.toNat_of_nonneg` (since `j - i - 2 ≥ 0` follows from `hij` and the strict case's `h` via `omega`) then `ring` to close the arithmetic once toNat is unfolded to the underlying int.

**Confirmed gotcha from the brief, worth re-flagging for the next person**: `simpa [e]` does NOT work to discharge `hc` — simp normalizes `Int.toNat` expressions (via a `max` rewrite) before it gets a chance to use `e`, so the rewrite target disappears out from under it. The fix is exactly as specced: state `hc` as its own `have` with the *exact* type `evolve_isEventuallyPeriodic_of_between` wants, then `rw [e]; exact hj` as two separate steps rather than one `simpa`. This is a second instance of the general P1 idiom (from [[evolve-left-diagonals-isEventuallyPeriodic]] and others): when a served lemma's argument shape needs an index bridge, state a `have` at the exact target shape and `rw` into it — don't let `simp`/`simpa` anywhere near a `toNat`/cast expression you still need in its original form.

Import list `Rule30.Basic`, `Rule30.Prize`, `Rule30.Proofs.NotIsEventuallyPeriodicAdjacent`, `Rule30.Proofs.EvolveIsEventuallyPeriodicOfBetween` was exactly sufficient — `eq_or_lt_of_le`, `Int.toNat_of_nonneg`, `omega`, `ring` all resolved with nothing extra needed.

This closes the top-level periodicity-propagation goal for P1: adjacent columns can't both be periodic, and now neither can any pair at any distance. Worth checking with Rowan whether this feeds directly into `centerColumn_not_eventually_periodic_of_right`'s hypothesis or opens a new tier.

## 2026-09-06T23:43:49Z — isEventuallyPeriodic_column_unique (haiku, proved)

**The closing node for P1.** Uniqueness follows from Jen's theorem: if columns i and j are both eventually periodic, they are the same column. `by_contra hne` on the assumption they differ, then `rcases lt_or_gt_of_ne hne` splits trichotomy. Each strict case (i < j or j < i) applies `not_isEventuallyPeriodic_pair` at the correct ordering to obtain False. No novel proof content — the served lemma is the entire proof.

Imports: `Rule30.Basic`, `Rule30.Proofs.NotIsEventuallyPeriodicPair`. Axioms: propext, Classical.choice, Quot.sound (inherited from not_isEventuallyPeriodic_pair).

This closes P1 entirely: the uniqueness of the eventually periodic column is the boundary theorem that connects Jen's original result to the Rule 30 prize conjecture about the center column's aperiodicity.

## 2026-09-06T23:44:51Z — centerColumn_not_eventually_periodic_of_any_other (haiku, proved)

**Conditional proof shape.** This theorem does not stand alone — it assumes a hypothesis (any column repeating forces center to repeat) and derives False from that. The proof note's first sentence must flag this, since a reader opening the file won't have the context that this is not a claim about the center column's aperiodicity in general. The captain's four-line proof works exactly as specified: unfolding centerColumn into evolve t 0, obtaining the witness j from the hypothesis, and applying isEventuallyPeriodic_column_unique with the two periodic columns to get j = 0, contradicting j ≠ 0.

**Imports.** Rule30.Proofs.IsEventuallyPeriodicColumnUnique is the only served lemma needed here — the uniqueness result that two eventually periodic columns must be the same column. Rule30.Basic brings in everything else (centerColumn, evolve, IsEventuallyPeriodic). No tactic imports or Mathlib beyond Basic were needed for this node.

## 2026-09-07T02:09:52Z — periodicFrom_mul (haiku, proved)

**Nat lemmas for arithmetic:** `Nat.zero_mul`, `Nat.add_zero` simplify the base case directly via `simp only`. `Nat.succ_mul` and `Nat.add_assoc` handle the index algebra in the step case. **Bound propagation:** When applying a period hypothesis `h : PeriodicFrom f p N` at an offset index `n + m * p`, you need to prove `n + m * p ≥ N` from `n ≥ N`. A `calc` block chaining `n + m * p ≥ N + m * p ≥ N` via `omega` works cleanly. **Pattern:** The proof chains three sequential identities in the step case: index rewrite via `heq`, period application via `h`, and induction hypothesis via `ih`, threaded through `rw` without intermediate names.

## 2026-09-07T02:44:30Z — leftDiagonal_periodicFrom_step (sonnet, proved)

First try, no dead ends — this is the quantitative sibling of `evolve_left_diagonal_isEventuallyPeriodic_step`, which I already had fully served notes on, so the whole task was translating that proof's `evolve`-level recurrence unfold into `leftDiagonal`-level statements and swapping the existential lemmas (`isEventuallyPeriodic_shift`, `isEventuallyPeriodic_common_period`) for direct hypothesis threading, since here the period `q` and onset `N` are already given concretely rather than needing to be manufactured and unified.

**Key simplification over the existential version**: no `isEventuallyPeriodic_shift`/`isEventuallyPeriodic_common_period` needed at all. Those two lemmas exist specifically to (a) reindex a periodic sequence read at an offset and (b) put two *different* periods onto one common period. Here both diagonals already share the *same* period `q` from the *same* `N` (that's what `h0`/`h1` say), so the "offset" step collapses to a one-line `rw [show i + q + 2 = i + 2 + q from by omega]` bridging into `h0 (i+2) (by omega)` directly — no new period needs constructing.

**`show <fully unfolded evolve form>` to cross the `leftDiagonal` definition boundary in one step.** Rather than `unfold leftDiagonal` or `simp only [leftDiagonal]`, stating the goal's unfolded form directly via `show evolve (i + 1 + (m + 2)) (-((i + 1 : ℕ) : ℤ)) = xor (...)  ...` and letting `show`'s defeq check unfold all four `leftDiagonal` applications at once (LHS and all three RHS terms) worked cleanly — `leftDiagonal` is a plain `def` (`leftDiagonal (k j : Nat) : Bool := evolve (j + k) (-(j : ℤ))`), so defeq unfolding is unconditional, confirming the general P1 idiom (see [[evolve-left-edge]]) that `show`/`exact` unfold plain `def`s at default transparency without needing `unfold` as a separate tactic step.

**Final `exact bool_driven_eventually_two_periodic ... : ...` closes the goal directly against `PeriodicFrom (leftDiagonal (m+2)) (2*q) (N+q)`** with zero massaging — `PeriodicFrom` is also a plain `def` (`∀ n ≥ N, f (n+p) = f n`), and the served lemma's conclusion `∀ i ≥ N+p, x (i+2*p) = x i` (with `x := leftDiagonal (m+2)`, `p := q`) is syntactically that shape already (just written with `i` for the bound variable instead of `n` — bound-variable names don't matter for defeq/unification).

**Self-verification trick used**: temporarily appended `#print axioms leftDiagonal_periodicFrom_step` to the end of the file, ran `lake env lean` to see the axiom list directly (`propext, Quot.sound`, no `Classical.choice` even), then removed the line and rebuilt with `lake build` before reporting. Since a harness worker can't run `#print axioms` as a separate command, editing it into the one file you own, checking, then editing it back out is the only way to see the axiom list yourself rather than waiting on the harness's own check — cheap (one extra edit-build-edit-build cycle) and worth doing whenever the stakes of a wrong axiom surprise are higher than usual.

Import list: `Rule30.Basic`, `Rule30.Proofs.EvolveLeftDiagonalRecurrence`, `Rule30.Proofs.BoolDrivenEventuallyTwoPeriodic`, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring` — no `IsEventuallyPeriodicShift`/`IsEventuallyPeriodicCommonPeriod` needed, unlike the existential sibling, for the reason above.

## 2026-09-07T02:48:34Z — leftDiagonal_periodicFrom_pow (sonnet, proved)

First try, no dead ends, following the captain's route exactly. This is the quantitative form the whole diagonal-periodicity family had been building toward: existence proofs (`evolve_left_diagonals_isEventuallyPeriodic`) and step lemmas (`leftDiagonal_periodicFrom_step`, `periodicFrom_mul`) all needed to be composed, but none of the composition needed a new idea.

**Structure**: same strong-induction skeleton as `evolve_left_diagonals_isEventuallyPeriodic` — `induction k using Nat.strong_induction_on with | _ k ih => match k, ih with | 0, _ => ... | 1, _ => ... | m + 2, ih => ...`. Since `k` here is already the theorem's own bound argument (not something introduced by `intro`), `induction k using ...` works directly on it with no preceding `intro`.

**Base cases (k=0,1)**: both diagonals are constantly `true` (`evolve_left_edge` / `evolve_left_second_diagonal`), so *any* period works — I used `2^0`/`2^1` as the goal demands, proved via `hconst : ∀ j, leftDiagonal k j = true` then `rw [hconst (n + 2^k), hconst n]` collapses to `true = true`, closed automatically by `rw`'s trailing `rfl`. `leftDiagonal 1 j` is defeq to `evolve (j+1) (-(j:ℤ))` (the def unfolds `k` to `1` and `j+k` to `j+1` for free), so `exact evolve_left_second_diagonal j` needs no `show`/rewrite at all — only the `k=0` case needs the `show` + `rw [show j+0=j from by omega]` bridge, since `j+0` doesn't syntactically match the served lemma's bare `t` even though it's defeq.

**Step case (m+2)**: the two induction hypotheses give periods `2^m` (from `N0`) and `2^(m+1)` (from `N1`) — already mismatched, exactly as the brief warned. `periodicFrom_mul (leftDiagonal m) (2^m) N0 h0 2 : PeriodicFrom (leftDiagonal m) (2*2^m) N0`, then `rw [hpow1]` where `hpow1 : 2^(m+1) = 2*2^m := by ring` aligns it to `2^(m+1)`. **`ring` proves `2^(m+1) = 2*2^m` directly** even though the exponent contains a variable `m` — no need to hunt for the exact Mathlib lemma name (`pow_succ` vs `pow_succ'`, which direction) as I first worried; `ring` normalizes `x^(n+1)` symbolically and this was one line, no dead end. Same trick for `hpow2 : 2^(m+2) = 2*2^(m+1)`.

**Onset-raising is genuinely trivial**: `PeriodicFrom f p N` unfolds to `∀ n ≥ N, ...`, so raising `N` to any `N' ≥ N` is just `fun n hn => h n (le_trans hle hn)` — no lemma needed, matches the brief's "straight from the definition" note. Did this inline for both `h0''`/`h1''` at `max N0 N1` via `le_max_left`/`le_max_right` + `le_trans`, avoiding `set` entirely (per [[bool-driven-eventually-two-periodic]]'s note that `set` risks import/transparency friction) — just wrote `max N0 N1` out longhand everywhere. `Nat.max_le.mpr ⟨_, _⟩` gave `max N0 N1 ≤ bound` from the two individual bounds with no friction.

**`omega` handles `max` as an opaque atom fine** once a hypothesis like `hMle : max N0 N1 ≤ 2^(m+1)` is in context — the final goal `max N0 N1 + 2^(m+1) ≤ 2^(m+2)` closed by bare `omega` given `hMle` and `hpow2` (`2^(m+2) = 2*2^(m+1)`) in context, treating `max N0 N1`, `2^(m+1)`, `2^(m+2)` as three linear atoms tied together by those two hypotheses. Confirms the general P1 idiom (first exercised on `not_evolve_period_adjacent`'s `Int.toNat` reasoning): give omega one bridging equation between opaque atoms and it does the rest.

**`positivity` proves `0 < 2^(m+1)` with only `import Mathlib.Tactic.Ring` in the import list** (no separate `Mathlib.Tactic.Positivity` import needed) — same as `CenterColumnDensitySucc.lean`'s unadorned use, so positivity rides in on `Ring` or some other already-present import in this Mathlib snapshot.

Import list: `Rule30.Basic`, `Rule30.Proofs.EvolveLeftEdge`, `Rule30.Proofs.EvolveLeftSecondDiagonal`, `Rule30.Proofs.PeriodicFromMul`, `Rule30.Proofs.LeftDiagonalPeriodicFromStep`, `Mathlib.Tactic.Ring`. Verified via the append-`#print axioms`-then-remove trick: `propext, Classical.choice, Quot.sound`, nothing extra.

## 2026-09-07T15:06:49Z — bool_driven_periodicFrom_of_return (haiku, proved)

**Recast induction on a bounded range.** To prove `∀ n ≥ M, f n` where `n` is a Nat, convert with `Nat.exists_eq_add_of_le` to `∃ k, n = M + k`, then induct on `k` directly. This avoids hunting for a named induction principle and lets standard `induction k with | zero => ... | succ k ih => ...` do the work.

**Periodicity application.** When both drivers `a` and `b` have period `p` from time `N ≤ M ≤ n`, and the recurrence is `x(i+1) = xor(a i, b i || x i)`, unwinding `x(n+p)` through the recurrence to `x(n)` needs:
1. `ha n : a(n+p) = a(n)` by applying the periodicity lemma at index `n`, not `n+p`
2. Induction hypothesis `x(n+p) = x(n)` to substitute in the driver formula
3. Symmetry of the recurrence to close: `xor(...) = x(n+1)` by reading the recurrence backward

**Associativity closure.** After rewrites, goals like `x((M+k)+1) = x(M+(k+1))` close with `simp only [Nat.add_assoc]` rather than `omega`, which cannot handle the associativity of `+` on Nat terms composed through function application.

## 2026-09-07T15:10:22Z — bool_driven_periodicFrom_of_reset (haiku, proved)

**A reset point collapses the state to driver-dependent values only.** When `b j = true`, at the next step the state becomes `x (j+1) = not (a j)`, determined entirely by the drivers. One period later `x (j+1+p) = not (a (j+p))`, which equals `x (j+1)` by periodicity of `a`. The onset `j+1` is tied to where the driver went black, not accumulated through `N + p`, so this node discharges the onset-accumulation concern in `leftDiagonal_onset_le` — the wall that names it as a gap.

**Reusable shape for reset-driven periodicity:** When `b n = true` for some `n`, the machine forgets its history and enters a period determined solely by future driver values. Lifts via `bool_driven_periodicFrom_of_return (a b x p N M hrec ha hb hNM eq)` with `M ≥ N` and `x (M + p) = x M` proven by explicit recurrence unfolding and driver periodicity. The same shape applies to any driven bit machine where a reset point forgets the past.

## 2026-09-07T15:12:36Z — leftDiagonal_periodicFrom_step_of_black (sonnet, proved)

leftDiagonal_periodicFrom_step_of_black: exactly the captain's route, first try modulo one gotcha. Instantiating `bool_driven_periodicFrom_of_reset` with `a := fun i => leftDiagonal m (i+2)`, `b := fun i => leftDiagonal (m+1) (i+1)`, `x := leftDiagonal (m+2)`, the `hrec` goal beta-reduces cleanly to exactly `leftDiagonal_recurrence m i` with no massaging. But the `ha`/`hb` periodicity subgoals come back as `(fun i => ...) (i+q) = (fun i => ...) i` — NOT beta-reduced — so a bare `rw [show i+q+2 = i+2+q from by omega]` fails with "did not find an occurrence of the pattern" even though the pattern is obviously there to a human, because rw can't see under the un-reduced lambda application. Fix: `dsimp only` (no lemmas, just forces beta/eta reduction) immediately before the `rw`. This is a new gotcha for the family beyond the "have at exact goal shape" idiom used elsewhere — when a served lemma is applied with raw lambda arguments (per [[bool-driven-eventually-two-periodic]]'s "write a/b/x as raw lambdas, don't `have`-bind them" idiom), the resulting subgoals may carry un-beta-reduced redexes that block `rw`'s syntactic matching; `dsimp only` clears them without touching anything else. Otherwise the proof is pure translation: `hblack` already has exactly `b j = true`'s shape by defeq (no rewrite needed), and both driver-periodicity proofs are one `h0`/`h1` application plus a `+q+k = +k+q` commute. Axioms verified via the append-`#print axioms`-then-remove trick: `propext, Quot.sound`, no `Classical.choice` at all.

## 2026-09-07T15:13:56Z — leftDiagonal_step_period_dichotomy (sonnet, proved)

Smaller than the S/M estimate suggested — a direct two-line case split on the served lemma, no new bookkeeping beyond one index shift.

**Route**: `by_cases h : ∃ j ≥ N, leftDiagonal (m + 1) (j + 1) = true`.
- Yes branch: `obtain ⟨j, hjN, hblack⟩ := h`, then `leftDiagonal_periodicFrom_step_of_black m q N j hjN h0 h1 hblack` gives `PeriodicFrom (leftDiagonal (m+2)) q (j+1)` directly — exactly the left disjunct's witness at `M = j+1`.
- No branch: need `push_neg` BEFORE `simp only [Bool.not_eq_true]`, not after — `h : ¬∃ j ≥ N, P j` is syntactically `¬∃ j, j ≥ N ∧ P j`, and `Bool.not_eq_true` (`¬(b = true) ↔ b = false`) can't fire until push_neg has distributed the negation down to `∀ j ≥ N, ¬ P j`. Got this backwards on the first pass (wrote `simp` then `push_neg`) — it still built because `simp only` with a non-matching lemma is a no-op rather than a failure, so the mistake was silent until I reread the file. Worth remembering: a `simp only [specific_lemma]` that doesn't apply is *not* an error, so ordering bugs like this don't announce themselves — check the goal state, don't just check the build succeeded.
- Then `intro j hj; have h' := h (j - 1) (by omega); rw [show j - 1 + 1 = j from by omega] at h'; exact h'` — the goal wants `leftDiagonal (m+1) j = false` for `j ≥ N+1`, but `h` (after push_neg+simp) is stated at index `j+1` for `j ≥ N`, so shift by reading `h` at `j-1` (valid since `j ≥ N+1 ≥ 1` makes `j-1` a genuine predecessor with `j-1 ≥ N`) and rewrite `(j-1)+1` back to `j`.

**Self-check trick reused** (per [[leftDiagonal-periodicFrom-step]]'s and others' notes): appended `#print axioms leftDiagonal_step_period_dichotomy` after the proof, ran `lake env lean` directly (not `lake build`, which doesn't print it), saw `propext, Classical.choice, Quot.sound` with nothing extra, then removed the line and rebuilt clean before reporting.

Import list: `Rule30.Basic`, `Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack` (which transitively pulls in `LeftDiagonalRecurrence` and `BoolDrivenPeriodicFromOfReset`) — sufficient, no `Mathlib.Tactic.Ring`/`Order.Ring.Int` needed since everything here is Nat `omega` bookkeeping.

Noted but not acted on: `push_neg` is deprecated in this Mathlib snapshot in favour of `push Not` — still works, just a warning, not worth chasing for a proof this small.

## 2026-09-07T16:14:38Z — rule30_ne_of_left_ne (haiku, proved)

Left-permutivity proof: unfold rule30_eq on both rows, substitute fixed cells, then case-split on all Bool values of c(i-1) and d(i-1). When they match, contradiction with hl; when they differ, simp closes on each of the 4 subcases for d(i) and d(i+1). No served lemmas needed beyond Rule30.Basic. Pattern: for Bool permutivity lemmas, exhaustive case-splitting with simp cleanup is the direct route.

## 2026-09-07T16:15:54Z — rule30_leftPermutive (haiku, proved)

**rule30_leftPermutive (proved)**: Apply the one-step permutivity lemma to left edge. LeftPermutive unfolds to ∀ (c d : Config) (i : ℤ), window hypothesis → difference at i-1 → output differs. Extract c i = d i and c (i+1) = d (i+1) from the window via omega-provable inequalities, then exact rule30_ne_of_left_ne. No induction, no case splits — pure lemma threading and numeric inequalities.

## 2026-09-07T16:23:50Z — evolveFrom_leftPermutive (sonnet, proved)

evolveFrom_leftPermutive (sonnet, proved), first try, no dead ends.

**Route**: a strengthened invariant carried by induction on the step count `s ≤ t`: after `s` steps, `rule30^[s] c` and `rule30^[s] d` agree on the shrunken window `(i - t + s, i + t - s]` and differ at the single point `i - t + s`. At `s = 0` this is exactly the hypothesis; at `s = t` the difference point is `i - t + t = i`, exactly the goal. Proved as a `have key : ∀ s ≤ t, (window agreement) ∧ (difference at i-t+s)` inline inside the theorem, not a separate top-level lemma — matches the style `EvolvePeriodSub.lean` uses (a `have` carrying a pair through induction, rather than a `private lemma` needing all the outer variables re-threaded).

**Step case shape**, mirrors `agree_on_shrinking_window` (`EvolveFromEqOfAgreeOnWindow.lean`) for the agreement half and the diagonal-family proofs for the difference half:
- Agreement at `s+1`: `rw [Function.iterate_succ_apply', Function.iterate_succ_apply', rule30_eq, rule30_eq]` then three `have`s pulling `rule30^[n] c/d` agreement at `j-1, j, j+1` out of the `s = n` window (all provable by bare `omega` from `hj1 hj2 hs` in context — no cast massaging needed for *inequalities* feeding omega, only for terms that must *exactly match* a later `exact`).
- Difference at `s+1`: apply the served `rule30_ne_of_left_ne` (plain `Config`/`ℤ` arguments, no `LeftPermutive`-style `Nat`-radius cast to fight) at position `i - t + n + 1`, with the three neighbour facts (`hl0` via `hdf` after a `ring` index shift, `hc0`/`hr0` via `hag` with `omega`-proved bounds).

**The one place exact syntactic matching (not just `omega`) is unavoidable**: the final `exact rule30_ne_of_left_ne ... : rule30 (...) P ≠ rule30 (...) P` must match the *goal's* position term up to defeq, and the goal's own position is `i - t + ((n+1:ℕ):ℤ)` (cast-of-a-sum) while the induction hypothesis `hag`/`hdf` are stated with `(n:ℤ)`, a different but propositionally-equal term. `omega` cannot bridge this because the obligation is an equality of *terms* feeding `exact`, not a provable arithmetic proposition standing alone. Fix, copied verbatim from `EvolvePeriodSub.lean`'s established idiom: `rw [show i - (t:ℤ) + ((n+1:ℕ):ℤ) = i - (t:ℤ) + (n:ℤ) + 1 from by push_cast; ring]` directly on the goal *before* touching anything else, picking the RHS's left-associated `+ (n:ℤ) + 1` grouping and then reusing that exact grouping in every subsequent `have`'s stated type. `rw` finds the pattern reliably because `push_cast; ring` inside the `show ... from` proves the two full terms equal without needing the rewrite itself to guess associativity — the `rw` call only ever needs to match the *literal* LHS I wrote, which I chose to literally equal what elaboration produces from the induction (`i - ↑t + ↑(n+1)`, same operator-tree shape as `i - (t:ℤ) + ((n+1:ℕ):ℤ)`).

**General reusable rule for this whole codebase's induction-on-a-cast-index proofs**: `omega` alone suffices for any inequality goal touching Nat-cast sums (`↑(n+1)`), no `push_cast` needed. But the moment a step needs to hand a term to `exact`/`hag`/`hdf` whose *type* must match the goal exactly, reach for `rw [show <goal's literal cast form> = <convenient form> from by push_cast; ring]` first, and then keep every later `have` in that same convenient form. Import list `Rule30.Basic`, `Rule30.Proofs.Rule30NeOfLeftNe`, `Mathlib.Tactic.Ring` was sufficient — `push_cast` rode in on the `Ring` import as in every other P1 node that has needed it, no separate cast-tactic import required.

Axioms verified via the append-`#print axioms`-then-remove trick: `propext, Quot.sound`, no `Classical.choice` at all — same as `LeftDiagonalPeriodicFromStep`'s Bool-machine proofs, consistent with this being pure constructive index bookkeeping.

## 2026-09-07T16:29:23Z — window_count_half (opus, proved)

First counting node in P1 — no induction, no automaton content beyond one application of the served `evolveFrom_leftPermutive`. Two build cycles total.

**Shape.** `private def flipFirst {t} (w : Fin (2*t+1) → Bool) := fun k => if (k : ℕ) = 0 then !(w k) else w k`. Involutive by `funext k; by_cases h : (k:ℕ) = 0 <;> simp [flipFirst, h]`; injective from involutivity via `congrArg flipFirst` then `rwa [flipFirst_involutive, flipFirst_involutive]`. Then two `ofWindow` lemmas (agreement off the flipped position, difference at it), feed both into `evolveFrom_leftPermutive t _ _ 0`, get a Bool `≠`, turn it into an `↔ ¬` by `revert h; generalize <lhs> = a; generalize <rhs> = b; cases a <;> cases b <;> simp`. Counting is `Finset.card_filter_add_card_filter_not` plus `Finset.card_image_of_injective`.

**Index the flip by `(k : ℕ) = 0`, not by `k = (0 : Fin (2*t+1))`.** Using the `Fin` numeral would drag in `NeZero (2*t+1)` / `Fin.val_zero` bookkeeping for no gain. Writing the branch as `if (k:ℕ) = 0 then !(w k) else w k` — note `!(w k)`, not `!(w 0)` — means no `Fin` literal appears anywhere in the file and every side condition is a plain ℕ/ℤ fact `omega` can chew.

**THE GOTCHA: `omega` silently drops a hypothesis of the form `(⟨e, _⟩ : Fin n).val = 0`.** After `unfold ofWindow flipFirst; split_ifs with h1 h2`, the inner branch hypothesis is `h2 : (⟨(j + ↑t).toNat, _⟩ : Fin (2*t+1)).val = 0`. `omega` does not error on it — it just ignores it as a non-arithmetic atom and then fails on the remaining constraints, so the error message shows a counterexample over `j` and `↑t` alone with no hint that a hypothesis went missing. Fix is one line, using proof irrelevance + defeq of `Fin.val` on a `mk`:
```lean
have h3 : (j + (t : ℤ)).toNat = 0 := h2   -- or ¬ (… = 0) := h2 in the negated branch
omega
```
Restating the hypothesis at the reduced type is accepted by `exact`-level defeq and hands `omega` an `Int.toNat` it *does* special-case. **Generalise: when `omega` fails and the printed counterexample mentions fewer atoms than you have hypotheses, the missing hypothesis was dropped, not refuted — restate it at a type omega understands rather than looking for more arithmetic facts.** This is the same family as [[not-evolve-period-adjacent]]'s note that omega handles `Int.toNat` fine; the wrinkle is that it has to *see* the `toNat` and a `Fin.val` wrapper hides it.

**`unfold ofWindow flipFirst` then `split_ifs` is the whole `ofWindow` idiom.** `ofWindow` is a `dite` whose condition does not mention `w`, so the LHS and RHS of any `ofWindow w' i = ofWindow w i` goal share that condition and `split_ifs` splits it once, not twice. Goal order came out as (cond-true & inner-true), (cond-true & inner-false), (cond-false) — the two `rfl` branches close with bare `rfl` because the `Fin` mk proof terms differ only in proof and are defeq.

**Counting lemma names in this Mathlib snapshot** (checked by grep before writing, which saved a cycle):
- `Finset.card_filter_add_card_filter_not (p) [DecidablePred p] [∀ x, Decidable (¬ p x)] : #(s.filter p) + #(s.filter fun a ↦ ¬ p a) = #s`, with `s` implicit — pass it as `(s := Finset.univ)`. NOT `filter_card_add_filter_neg_card_eq_card`, which the brief named and which does not exist here.
- `Finset.card_image_of_injective (s) (H : Injective f) : #(s.image f) = #s`.
- `Fintype.card_pi_const (α) (n) : Fintype.card (Fin n → α) = Fintype.card α ^ n` — this is the one to use, NOT `Fintype.card_fun` (brief's suggestion, not present). It lives in `Mathlib.Data.Fintype.BigOperators`, which `Rule30.Basic` does not import; add it explicitly.

**Do NOT open the proof with `classical`.** `blackWindowCount` is a `Finset.filter` carrying the `Decidable` instance elaboration picked at its definition site; a `classical` in the proof introduces a *different* instance for the filter you build, and then the final `unfold blackWindowCount; omega` sees two atoms that print identically but do not unify. Letting `instDecidableEqBool` / `instDecidableNot` be found normally makes the goal's filter card and `hsum`'s filter card the same term and `omega` closes it. (Not learned the hard way here — avoided deliberately — but it is the obvious trap in any node that unfolds one of `Basic.lean`'s `noncomputable` counting defs.)

Final arithmetic: `have hpow : (2:ℕ)^(2*t+1) = 2^(2*t)*2 := pow_succ 2 (2*t)` then `omega` treats `2^(2*t)` as an atom and finishes. Same atom-hoisting idiom as [[isEventuallyPeriodic-of-periodic-step]]'s `hmul`.

Imports: `Rule30.Basic`, `Rule30.Proofs.EvolveFromLeftPermutive`, `Mathlib.Data.Fintype.BigOperators`, `Mathlib.Tactic`.

## 2026-09-07T20:01:48Z — column_succ_of_black (haiku, proved)

**boolean simplification pattern**: when a goal has xor with concrete boolean values (like true), simp closes it directly without needing to name the lemmas (xor_true, etc.) — feed the concrete values into simp and let it find the reductions. **sideways_inverse at i=0**: the lemma normalizes 0-1 and 0+1 automatically after simp; use `simp only [Int.zero_sub, Int.zero_add]` if you need to pin those down for later reasoning, but simp catches them anyway. **unfold column**: is transparently an alias for evolveFrom, so unfolding both on h and the goal from the start keeps the two synchronized and prevents index-matching errors later.

## 2026-09-07T20:03:00Z — centerColumn_succ_of_black (haiku, proved)

**Unfolding + served lemma pattern**: When a theorem is a special case of a served lemma with a specific instantiation (here, initialConfig as the starting row), unfold the definitions to expose the equivalence and apply the general lemma. Works when the unfoldings are definitional, making the goal match the served lemma's conclusion without additional rewrites. This is simpler than the `column_succ_of_black` proof itself because centerColumn is already defined in terms of evolveFrom, no row argument to thread through.

## 2026-09-07T20:09:05Z — evolveHalfRight_eq_column (sonnet, proved)

evolveHalfRight_eq_column (sonnet, proved), first attempt on this node — mirror of the still-unclosed evolveHalfLeft_eq_column, which was not yet in Rule30/Proofs so there was no sibling proof to crib the exact tactic shape from, only the definitions in Basic.lean.

**Route**: `induction t generalizing k with | zero => ... | succ t ih => rcases k with _ | k => ...`. Base case closes with `simp only [evolveHalfRight, column, evolveFrom, Function.iterate_zero_apply]` — no `rfl` needed even though it looks defeq; `simp only [defName]` on a pattern-matched def reliably invokes its equation lemmas regardless of whether the compiler used structural or well-founded recursion, so it's the safer default over `rfl`/`show` for these two-argument nested-match defs (`evolveHalfRight`/`evolveHalfLeft`/`leftSolve` all share this shape).

**Per-branch shape**: state a `have hRHS : column X <pos> (t+1) = xor (column X <pos-1> t) (column X <pos> t || column X <pos+1> t) := by unfold column; rw [evolveFrom_succ, rule30_eq]` — this is the RHS's own one-step unfold, proved once so the main line doesn't have to fight `column` twice. Then `simp only [evolveHalfRight, ih <args>, hRHS]` unfolds the LHS's matching branch and folds in the induction hypothesis at each of the recursion's own sub-indices, landing both sides as `xor _ (_ || _)` with mismatched-looking but propositionally-equal ℤ index arguments (casts of different ℕ shapes that both denote the same integer). Close with two `rw [show <goal's exact LHS arg-index> = <goal's exact other-side arg-index> from by push_cast]` (or `by push_cast; ring` when a variable `k` is involved) — `rw` auto-tries `rfl` afterward and closes it once both sides' index arguments are textually identical.

**THE GOTCHA, worth flagging loudly for whoever does the mirror (evolveHalfLeft_eq_column) or any other node with this exact shape**: for the literal-numeral branch (here, `k = 0`), `by push_cast; ring` inside a `rw [show ... from ...]` fails with "No goals to be solved" pointing *inside* the `by` block, not at the `rw` call — `push_cast` alone already normalizes `((0:ℕ):ℤ)+1-1` to `0` and closes the resulting `0 = 0` goal via its own trailing simp-closure, so the subsequent `ring` has nothing left and errors. Fix: use bare `by push_cast` (no `; ring`) for any bridging equation that's pure numerals; keep `; ring` only for the branch that has a genuine variable (`k`) needing associativity/commutativity rearranging, since there `push_cast` alone leaves a nontrivial goal for `ring` to close. Diagnosing this cost two build cycles — the error location (inside the `by` term, at the `ring` token) is the tell that push_cast already fully closed it, not that the rewrite itself is wrong.

Self-check via the append-`#print axioms`-then-remove trick (documented across many prior P1 nodes): `propext, Quot.sound`, no `Classical.choice` — pure constructive index bookkeeping, consistent with every other node in the arbitrary-row/half-line family.

Import list `Rule30.Basic`, `Mathlib.Tactic.Ring` sufficient — `push_cast` rode in on `Ring` as in every other node that's needed it.

## 2026-09-07T20:14:05Z — leftSolve_eq_column (sonnet, proved)

leftSolve_eq_column (sonnet, proved), first try, no dead ends.

Route: `induction k using Nat.strong_induction_on generalizing t with | _ k ih => match k, ih with ...`. Generalizing `t` before the strong induction is essential — the `m + 2` case needs `ih` at `m + 1` at *both* `t` and `t + 1`, so the carried statement must be `∀ t, ...`, not fixed `t`. `generalizing t` handles this cleanly since `t` has no dependent hypotheses to drag along.

Key translation: `column X i t` is definitionally `evolveFrom X t i` (note the argument-order flip), and `sideways_inverse (c : Config) (i : ℤ) : c (i - 1) = xor (rule30 c i) (c i || c (i + 1))` becomes exactly `leftSolve`'s recurrence once instantiated at `c := evolveFrom X t` and rewritten with `← evolveFrom_succ` (`evolveFrom_succ c t : evolveFrom c (t+1) = rule30 (evolveFrom c t)` — note the `←`, since we want to *introduce* `evolveFrom X (t+1)`, not eliminate it; the forward direction is what `evolve_succ`/`rule30_eq` unfolds elsewhere, but here we're going the other way).

Base case k=0: `rw [show -((0:ℕ):ℤ) = 0 from by norm_num]` does NOT auto-close via `rw`'s trailing `rfl` here (got "unsolved goals: leftSolve ... 0 t = column X 0 t") — needed an explicit `rfl` afterward, unlike the m+2 case's final `exact`. Minor inconsistency worth remembering: `rw`'s auto-rfl only fires when the resulting goal is *syntactically* rfl-closable at the transparency `rw` uses; here it wasn't, even though `leftSolve _ _ 0 t` is defeq to `column X 0 t` by `exact`/`rfl`'s own defeq check. Just append `rfl` defensively after a `rw` meant to fully close a defeq goal, rather than assuming the auto-rfl caught it.

Base case k=1 and step case m+2: both close by `show <fully unfolded form> = <fully unfolded form>` (crossing the `leftSolve`/`column` definition boundary by defeq per [[evolve-left-edge]]'s established idiom), then one `sideways_inverse` instance with `← evolveFrom_succ` and a `rw [show <index eq> from by norm_num / push_cast; ring]` to line up the position argument, then `exact h.symm` (or `exact hstep.symm` after substituting IHs via `rw [h0, h1, h2]`) — `exact` finds column/evolveFrom defeq automatically once every index term matches syntactically, no further massaging needed.

No new gotchas beyond what the cookbook and prior P1 notes already cover — `norm_num` for concrete numeral cast identities (`0 - 1 = -(1:ℕ:ℤ)`, `0 + 1 = 1`), `push_cast; ring` for the variable ones (`-(m+1) - 1 = -(m+2)`, `-(m+1)+1 = -m`). Axioms verified via `lake env lean` with a temporary `#print axioms` line: `propext, Quot.sound`, no `Classical.choice`.

Import list: `Rule30.Basic`, `Rule30.Proofs.SidewaysInverse`, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring` — sufficient, `norm_num`/`push_cast` rode in on those two as in every other P1 node needing them.

## 2026-09-07T20:17:01Z — leftDiagonal_pair_never_eventually_shifted (sonnet, proved)

Near-zero-friction proof: a prior review session had already kernel-checked this exact statement (and its next-tier consumer, leftDiagonal_period_unbounded) end-to-end in `explorer/scratch_leftdiagonal_unbounded.lean` against `import Rule30.Proofs`. The whole task was lifting the relevant slice (everything up through this theorem, dropping the unbounded-period section that isn't this node) into a fresh file with a minimal import list — `Rule30.Basic`, `EvolveLeftEdge`, `EvolveLeftSecondDiagonal`, `LeftDiagonalRecurrence` — and swapping the scratch file's `set M := N + 2 * k with hM` for `obtain ⟨M, hM⟩ : ∃ M, M = N + 2 * k := ⟨_, rfl⟩` + `rw [← hM] at A0 A1`, per this project's established avoid-`set` idiom (see [[bool-driven-eventually-two-periodic]]). Built first try with that one substitution; no other changes needed.

**Proof shape** (for the next diagonal-pair node, if any cites this): package the induction as two private structures, `AgreePair d m M` (diagonals m, m+1 agree with their d-shift from M on) and `WhitePair m M` (diagonals m, m+1 both white from M on), each with a `_step` lemma (descend one diagonal, onset grows by 2) and a `_descend` corollary (iterate down to diagonal 0). The core cancellation — `xor_cancel {a b c : Bool} (h : xor a c = xor b c) : a = b` by `cases a <;> cases b <;> cases c <;> simp_all` — is what lets `leftDiagonal_recurrence` at `m` and at `m+d` combine: both share the same `(D(m+1) i+1 || D(m+2) i)` term once the AgreePair hypothesis rewrites `m+d`'s recurrence to use the `m`-side values, so `xor_cancel` strips it and leaves exactly the one-diagonal-shallower agreement. The main theorem's contradiction: assuming no-shift-ever descends the agreement to diagonals 0/1 (always black, by evolve_left_edge/evolve_left_second_diagonal) and forces diagonal `d-1` white forever; case-split on `d-1 = 0` (contradicts diagonal-0-black directly) vs `d-1 = f+1` (one more recurrence step shows diagonal `f = d-2` white too, so WhitePair descends white all the way to diagonal 0, again contradicting black).

**`push_neg` still resolves in this Mathlib pin**, just with a deprecation warning suggesting `push Not` instead — harmless, build succeeds either way; used the scratch file's proven form rather than risk the newer syntax on an untested combination.

Axioms verified via the append-`#print axioms`-then-remove trick (now well-established across P1): `propext, Classical.choice, Quot.sound`, nothing extra.

Import list: `Rule30.Basic`, `Rule30.Proofs.EvolveLeftEdge`, `Rule30.Proofs.EvolveLeftSecondDiagonal`, `Rule30.Proofs.LeftDiagonalRecurrence` — no cast/order/ring imports needed, since every arithmetic obligation here is plain ℕ `omega` bookkeeping (the diagonal indices are ℕ throughout; `leftDiagonal_recurrence` already hides the ℤ position arithmetic).

## 2026-09-07T20:29:10Z — leftDiagonal_period_unbounded (opus, proved)

Second consecutive node lifted straight out of a review session's kernel-checked scratch — `explorer/scratch_leftdiagonal_unbounded.lean` holds BOTH this and `leftDiagonal_pair_never_eventually_shifted`, and the previous attempt (mine, an hour earlier) took the first half. This attempt took lines 132-206, the second half, deleted the now-redundant first half, and swapped `import Rule30.Proofs` for the three real imports. Built first try, no edits to any tactic.

**Reusable rule, now twice-confirmed: before writing anything, Glob `explorer/scratch_*.lean` for the node's name.** Two P1 nodes in a row have been fully proved in scratch before dispatch and the brief said so in both cases; the cost of checking is one Glob and the saving is the whole attempt. Read the brief's "kernel-checked in scratch" sentence as an instruction, not as reassurance.

**`set` IS available once `Mathlib.Tactic` is imported.** My earlier note ([[bool-driven-eventually-two-periodic]]) says `set` is an unknown tactic — that is true from `Rule30.Basic`'s import surface alone, and NOT true here. The scratch used `set p := 2 ^ a with hpdef` and `set M := max ... with hMdef` and both worked verbatim. The reason `set` earns its keep in this proof where `obtain ⟨p, hp⟩ : ∃ p, p = 2^a` would not: `set` rewrites the EXISTING hypotheses too, so `hN : ∀ k, PeriodicFrom (leftDiagonal k) (2^a) (N k)` becomes stated in `p` automatically. `obtain` names a value and leaves every prior hypothesis in the old form. So the avoid-`set` idiom is about the import surface, not about `set` being wrong — when `Mathlib.Tactic` is in and you need existing hypotheses rewritten, `set` is the right tool.

**Import list that worked**: `Rule30.Basic`, `Rule30.Proofs.LeftDiagonalPairNeverEventuallyShifted`, `Mathlib.Tactic`, `Mathlib.Data.Fintype.Pigeonhole`. The last is what `Finite.exists_ne_map_eq_of_infinite` lives behind — note that name, NOT `Fintype.exists_ne_map_eq_of_card_lt` (the finite-index pigeonhole I used in [[isEventuallyPeriodic-of-periodic-step]]). The distinction is worth holding: `Fintype.exists_ne_map_eq_of_card_lt` needs you to construct a `Fin (card + 1)` index and prove a cardinality inequality; `Finite.exists_ne_map_eq_of_infinite (f : α → β)` with `α` infinite and `β` finite needs NOTHING but the function — no side goal at all. Here `α = ℕ` and `β = (Fin p → Bool) × (Fin p → Bool)`, and the instance search found `Finite` for the pair-of-functions type unaided. When the index set is genuinely ℕ, reach for the `Finite.` one and skip the bookkeeping.

**The phase-alignment idiom, which is the actual content and is reusable for any "eventually periodic ⇒ finitely many behaviours" argument.** Two sequences periodic with the same `p` from different onsets `N₁`, `N₂` cannot be compared directly. The fix is to read each at a multiple of `p`: `periodicFrom_eq_phase (hp : 0 < p) (h : PeriodicFrom f p N) : ∀ j, N * p ≤ j → f j = f (N * p + j % p)`. Reading at onset `N * p` (not `N`) is what makes `j % p` the whole story, because `N * p` is itself ≡ 0 mod p. Then the "word" of the sequence is `fun r : Fin p => f (N * p + r)`, a finite object, and two sequences with equal words agree at every `j` past both onsets. Three details that made it go through:
- `conv_lhs => rw [hkey]` where `hkey : j = (N * p + j % p) + s * p`. Plain `rw [hkey]` loops/rewrites the `j` on the right too; `conv_lhs` is mandatory here, and the brief said so.
- `Nat.le_div_iff_mul_le hp : N ≤ j / p ↔ N * p ≤ j` — real name in this pin.
- `omega` closes `hkey` given `Nat.div_add_mod j p` massaged by `rw [hs, Nat.mul_add, Nat.mul_comm p N, Nat.mul_comm p s]`. The `mul_comm` rewrites matter: omega treats `p * s` and `s * p` as different atoms, so put both in the same orientation as the goal before calling it. Same atom-hoisting family as [[isEventuallyPeriodic-of-periodic-step]]'s `hmul`.

**`congrFun` on a word equality picks off one residue**: from `hw : phaseWord N p u = phaseWord N p v` (an equality of `Fin p → Bool`), `congrFun hw ⟨j % p, Nat.mod_lt _ hp⟩` is the fact at the residue you need, and `simpa [phaseWord] using hc` unfolds the def. Same shape as [[evolve-isEventuallyPeriodic-of-between]]'s `congrFun hM ⟨0, by omega⟩` on a strip.

**`private def` alongside `private theorem` in a proof file is fine** — third P1 file now carrying helpers (after `BoolDrivenEventuallyTwoPeriodic` and `WindowCountHalf`). Nothing in the harness objects; the verifier checks only the named theorem's type and axioms.

Axioms via the append-`#print axioms`-then-`lake env lean`-then-remove trick: `propext, Classical.choice, Quot.sound`. `Classical.choice` enters through `choose N hN using hcon` (extracting the onset function from `∀ k, ∃ N, ...`) — expected, and this is a node where the classical axiom is genuinely load-bearing rather than inherited incidentally.

One warning in the build output is `push_neg` deprecation in `LeftDiagonalPairNeverEventuallyShifted.lean`, my own earlier file, not this one. Harmless; noting it here because a future me will see it in this node's build log and wonder whose it is.

## 2026-09-07T21:12:31Z — leftDiagonal_mul_pow_eq_settledCenter (haiku, proved)

**Nat.exists_eq_succ_of_ne_zero pattern:** Convert `m ≥ 1` to `m = m' + 1` using `obtain ⟨m', rfl⟩ := Nat.exists_eq_succ_of_ne_zero (by omega : m ≠ 0)` — cleaner than manual case splitting.

**Periodicity threading:** The `hper` proof from `leftDiagonal_periodicFrom_pow` has type `PeriodicFrom (leftDiagonal k) (2^k) N`, unfolds to `∀ n ≥ N, leftDiagonal k (n + 2^k) = leftDiagonal k n`. In the step case, ensuring `(m' + 1) * 2^k ≥ N` is routine: N ≤ 2^k by hypothesis, and (m' + 1) ≥ 1, so the product dominates.

**Arithmetic closure:** `ring` handles all index expansions (`(a+b)*c = a*c + b*c`); `norm_num` closes concrete base cases; `omega` handles Nat inequality chains once phrased as simple bounds.

## 2026-09-08T00:55:10Z — column_settledConfig_eq (fable, proved)

Third P1 node in a row whose proof was already complete before dispatch, and the first where the complete file was NOT under `Rule30/Proofs/`. The brief said "if the file already exists, read it first"; it did not exist. The parked copy was at `runs/20260908T004625Z/ColumnSettledConfigEq.lean` (the previous fable attempt hit the $4 ceiling mid-report, and Rowan's board repair commit c3d6fbe named it as complete). One Glob for `**/*ettled*` found it. **Reusable rule, extending [[leftDiagonal-period-unbounded]]'s "Glob explorer/scratch_* first": also Glob `runs/**/<Pascal>.lean` — a budget-exhausted attempt's file gets parked under its run directory, not left in Proofs/.** Copied verbatim, built first try, axioms the standard three via the append-`#print axioms`-then-`lake env lean`-then-remove trick.

The proof's idea, since it is the one route that avoids the brief's suggested left/right case split entirely: choose T = 2^(k+1) with k = (t+x).toNat, slide the seed's row at time T so its left edge is at the origin (`fun y => evolve T (y - T)`), show `settledConfig` agrees with it on the window [x-t, x+t] (for y ≥ 0, `leftDiagonal_periodicFrom_pow` + `periodicFrom_mul` with multiplier `2^(k-m+1) - 2` moves the diagonal's reading from index `2^(m+1) - m` to `T - m`; for y < 0 both are white by `evolve_eq_false_of_outside_cone`), then a private `agree_window` lemma (cells depend only on their cone) and a private `evolveFrom_shifted` lemma (growing a slid row slides the picture) finish it. The target cell at x itself needs no periodicity because T was chosen so the diagonal is read at exactly the statement's own index. Every cast obligation closed by bare `omega` given `hk`, `hT`, `hmy` as equations in context — the `obtain ⟨k, hk⟩ : ∃ k, k = ...` idiom (see [[not-evolve-period-adjacent]]) again, no `set` needed.

Cost note: this session started at $1.85 spent before the first tool call — the system prompt (notebook + CLAUDE.md + cookbook + served lemmas) is now large enough that a P1 attempt has under $2.20 of the $4.00 for actual work. Budget accordingly: one Read, one Write, two builds, one axiom check, and the report is about all that fits.

## 2026-09-08T12:26:35Z — leftDiagonal_period_unbounded_le (opus, proved)

First-try build, ~$2.0 total. The quantitative sibling of `leftDiagonal_period_unbounded`, and almost entirely that node's file copied across with the pigeonhole swapped. **Read `Rule30/Proofs/LeftDiagonalPeriodUnbounded.lean` first if you ever touch this family** — the three private helpers (`periodicFrom_iterate`, `periodicFrom_eq_phase`, `phaseWord`) transfer verbatim, and private declarations do not cross module boundaries, so copying them is correct and not laziness.

**The bounded-existential negation is the one real difference, and it costs a `choose` workaround.** `∃ k ≤ B, P k` is sugar for `∃ k, k ≤ B ∧ P k`, so `push Not` gives `∀ k, k ≤ B → ∃ n, ...`. Feeding that straight to `choose` yields a *dependent* `N : ∀ k, k ≤ B → ℕ`, which is unusable downstream (every occurrence of `N k` then needs a proof term and the phase word stops being a function of `k` alone). Fix, three lines, and reusable for any bounded-negation node:
```lean
have hcon' : ∀ k : ℕ, ∃ n, k ≤ B → PeriodicFrom (leftDiagonal k) p n := by
  intro k
  by_cases hk : k ≤ B
  · obtain ⟨n, hn⟩ := hcon k hk; exact ⟨n, fun _ => hn⟩
  · exact ⟨0, fun h => absurd h hk⟩
choose N hN using hcon'
```
Pushing the implication *inside* the existential makes the choice total; `hN k : k ≤ B → PeriodicFrom ...` then threads the bound as an ordinary argument wherever it is needed. Above the bound `N k` is junk and nothing looks at it.

**Cardinality names that work in this pin** (all four resolved first try, no `exact?` needed):
- `Fintype.card_prod : card (α × β) = card α * card β`
- `Fintype.card_pi_const : card (Fin n → α) = card α ^ n` — needs `import Mathlib.Data.Fintype.BigOperators`, as [[window-count-half]] already recorded. NOT `Fintype.card_fun`, which does not exist here.
- `Fintype.card_bool = 2`, `Fintype.card_fin n = n`.
- The arithmetic `2 ^ p * 2 ^ p = 4 ^ p` is `← mul_pow` (giving `(2 * 2) ^ p`) then `norm_num`. Do not go looking for a `pow_mul`-family name; `mul_pow` backwards is it.

**Which pigeonhole to reach for, now settled across three P1 nodes.** `Finite.exists_ne_map_eq_of_infinite f` when the index is ℕ (no side goal at all, `Mathlib.Data.Fintype.Pigeonhole`); `Fintype.exists_ne_map_eq_of_card_lt f h` when the index is a `Fin`, with `h : card β < card α`. The latter returns `⟨x, y, hne, heq⟩` with `x y : Fin _` and `hne : x ≠ y` — get the ℕ-level disequality with `fun h => hne (Fin.ext h)`, and the bound with `have := x.isLt; omega`. Components of the pair come out by `congrArg Prod.fst heq` / `Prod.snd`, which beta-reduces through the lambda with no massaging.

**Index budget, worth checking before writing anything in this family**: the pigeonhole runs over `k ∈ Fin (C+1)` but the contradiction touches diagonals `u, u+1, v, v+1`, so the largest index used is `C + 1`. That is exactly the statement's bound `4 ^ 2 ^ a + 1` and it is tight to the counting — if the seeded bound had been `4 ^ 2 ^ a` the proof would not close. Confirm the off-by-one against the statement before building the `Fin`.

`set p := 2 ^ a` and `set B := 4 ^ p + 1` were both fine here (`Mathlib.Tactic` is imported, so `set` exists — see [[leftDiagonal-period-unbounded]] on why my older "set is unknown" note is about the import surface only). `set B` after `set p` is what makes the goal and `hcon` agree on the bound's shape without any rewriting.

## 2026-09-08T12:34:44Z — leftDiagonal_black_after_white (haiku, proved)

**leftDiagonal_black_after_white.** Nat.le_induction over leftDiagonal_recurrence with two index normalization rewrites per case. Base case: rw [recurrence, hw (j+2), hb], generalize, cases. Step case: same pattern with induction hypothesis. Both close via cases on Bool after simplification. Axioms: propext, Quot.sound. The pattern is now standard for this region: serve one recurrence lemma, use it three ways (base diagonal facts, step cases, dichotomy proofs) by instantiating at different indices.

## 2026-09-08T12:36:40Z — leftDiagonal_white_of_shift (haiku, proved)

**Generalize + cases on Bool pattern**: When a recurrence reduces to an equality like `xor a (b || c) = false`, rewrite with the recurrence, generalize the unknown term to x, and `cases x <;> rfl`. This isolates the Boolean value so both branches close by reflexivity. Reusable across all four white-shift family nodes. **Nat.le_induction with interval bounds**: `induction i, hi using Nat.le_induction` carries both index and bound through the two cases, letting the base use the bound value directly and the succ discharge by omega. Clean for inductions over [j+1, ∞)-style intervals.

## 2026-09-08T12:43:29Z — leftDiagonal_transient_front_law (haiku, proved)

**Proof shape:** recurrence + Bool case split. `leftDiagonal_recurrence` at two indices, then generalize four Bool values, then `cases a <;> cases b <;> cases c <;> cases c' <;> decide` closes all 16 branches. No induction, no omega loops—just xor/or arithmetic on Bool.

**Reindex pattern:** `rw [show j + M + k = j + k + M from by omega]` bridges recurrences stated at different times. Both R1 and R2 then read as the same structure modulo the hypotheses h0 and h1, which collapse the xor-or tree to a single Bool question.

**Axioms:** propext, Quot.sound (both allowed).

## 2026-09-08T13:51:15Z — leftDiagonal_transient_front_law_pow (haiku, proved)

**Extending periodicity to a larger period.** When you have PeriodicFrom f p N (periodicity with period p from onset N) and need it at period 2p, use `periodicFrom_mul f p N h 2` to get period 2p. For diagonal diagonals under their own power-of-2 shifts, `leftDiagonal_periodicFrom_pow k` gives PeriodicFrom (leftDiagonal k) (2^k) 0. To extend period 2^k to 2^(k+2) = 4*2^k, use `periodicFrom_mul _ _ _ hp 3` to get period 3*2^k, then `trans` to combine with the given equality via `.symm`. The arithmetic bridges (e.g., `j + 2 + 2^k + 3*2^k = j + 2 + 2^(k+2)`) close via `pow_succ` and `omega`.

## 2026-09-08T14:02:27Z — rightDiagonal_not_constant (sonnet, abandoned)

rightDiagonal_not_constant (sonnet): proof complete, builds clean, standard three axioms, blocked from verifying by a Statements.lean namespace bug — see bug board / prior notebook entries this session for full diagnosis (Statements.lean's "P1 — the right diagonals" section landed after `end Statements`, so the checker's `Statements.rightDiagonal_not_constant` lookup fails). Confirmed identical across three separate CHECK FAILED cycles; do not attempt to re-fix this from the proof side, and do not re-derive the proof once Statements.lean is repaired — this file is already correct.

## 2026-09-08T14:06:10Z — rightDiagonal_driver_flip_iff_white (sonnet, proved)

Zero-friction node: a prior attempt (parked at runs/20260908T134658Z/rightDiagonal_driver_flip_iff_white-1/) had already written a complete, correct proof — copied verbatim, built first try. **Reusable rule, now a fourth confirmation of the pattern noted by peers ([[leftDiagonal-period-unbounded]], [[column-settledConfig-eq]] equivalents): always check the brief's named parked-attempt path before writing anything.** The brief explicitly named the path this time, which made it trivial, but the general habit (Glob `runs/**/<Pascal>.lean` when a node's title suggests earlier work) is worth keeping even when the brief doesn't spell it out.

**`set a := ...` / `set b := ...` worked with only `import Rule30.Basic`** — no `Mathlib.Tactic` needed. This is a data point against my own earlier over-general note ([[bool-driven-eventually-two-periodic]]) that "set is unknown" from Basic's import surface alone; it seems `set`'s availability may depend on what Rule30.Basic itself transitively pulls in, or the specific Mathlib snapshot state has shifted. Worth re-testing before asserting `set` is unavailable in a bare-Basic-import file — it may just work.

**Proof shape**: `set a/b` names the two driver cells; `hb`/`ha` are one-line `have`s each closed by a `rw [show <index-reassoc> by omega]` then citing the periodicity/antiperiodicity hypothesis directly (no massaging beyond the index commute `j+q+k = j+k+q`); final `rw [hb, ha]; cases b <;> cases a <;> decide` closes all four Bool cases of the `↔` at once. Axioms: `propext, Quot.sound` only — no `Classical.choice`, consistent with this being pure decidable Bool algebra.

Import list: `Rule30.Basic` alone was sufficient — `omega` and `set` both resolved without further imports.

## 2026-09-08T21:03:17Z — leftDiagonal_period_le (opus, abandoned)

**Do not re-derive the survey.** The wall is exactly where the brief says, and I checked the two escape routes that looked open from P1's own served list. Both are closed:

1. **`leftDiagonal_pair_never_eventually_shifted` does NOT forbid eventually-white diagonals.** I nearly convinced myself it did: `leftDiagonal_shift_of_white` says a white diagonal `m+2` makes `D m (i+2) = D (m+1) (i+1)` — diagonals `m` and `m+1` become shifts of each other — and the pair-never-shifted lemma's *name* reads as forbidding that. Read the actual statement (`Rule30/Proofs/LeftDiagonalPairNeverEventuallyShifted.lean:109`): it is `∃ j ≥ N, D k j ≠ D (k+d) j ∨ D (k+1) j ≠ D (k+d+1) j` — diagonals compared **at the same index**, no shift in `j` at all. Different quantity entirely. The tell that saved me: if it had said what the name suggests, no left diagonal would ever be eventually white, so the period would never double, contradicting the measured doublings at k = 3, 8, 29, 400. **A lemma whose name matches your hope is the one to read the statement of.**

2. **"Eventually white" is decidable per-`k` but never for all `k`.** `leftDiagonal_periodicFrom_pow` is `∃ N ≤ 2^k, PeriodicFrom (leftDiagonal k) (2^k) N` — the onset is bounded, and a sequence that is periodic from `N` and eventually white is white from `N` on (push any `n ≥ N` forward by multiples of `p` into the white tail). So "diagonal k is infinitely often black" reduces to exhibiting one black cell at index `≥ 2^k`, computable via `rowCell_eq_evolve` and kernel Nat bit ops. That gets k ≤ 5 essentially free (diagonals 2, 3, 4 are pinned by `evolve_left_third/fourth/fifth_diagonal`, so the dichotomy walks up to 5), and then costs 2^k per diagonal. It is a per-`k` fact and the statement is `∀ k`. Dead end, but worth knowing it exists — if a future node ever asks for a *specific* small diagonal's period, this is the route.

**What I proved and parked** in `Rule30/Proofs/LeftDiagonalPeriodLe.lean` (builds clean, first try, no `sorry`): `leftDiagonal_period_le_of_black_between (m q N n)` — with `D m` and `D (m+1)` periodic with period `q` from `N`, and every diagonal `m+1+i` for `i < n` black arbitrarily far out, there is one onset `M` from which both `D (m+n)` and `D (m+n+1)` have period `q`. Proof shape, all of it routine:
- `revert hb` before `induction n` — `hb` mentions `n`, and reverting by hand is cheaper than trusting the auto-revert to name the IH's premise the way you expect.
- Carry the **pair** of diagonals, not one: the dichotomy needs both `m` and `m+1` at a common `q` from a common `N`, so the induction's conclusion must hand the next step that same shape.
- The two onsets (`M` from the IH, `M'` from the dichotomy) merge as `max M M'`; raising an onset is `fun j hj => h j (le_trans hle hj)`, no lemma needed (as [[leftDiagonal-periodicFrom-pow]] already recorded).
- Index alignment is two `rw [show _ from by omega]` on the goal: `m + (n+1) → m + n + 1`, then `m + n + 1 + 1 → m + n + 2`. The first rewrite also fires inside the second component, which is why the second bridge is stated from `m+n+1+1` and not from `m+(n+1)+1`.
- The white branch is a one-line contradiction: `hb n` at `J := M + 1` gives a black cell where the dichotomy's `∀ j ≥ M+1, D (m+n+1) j = false` says white. `hb`'s index is `m + 1 + n` and the dichotomy's is `m + n + 1` — one more `rw [show ... from by omega] at hblack`.

**The residual, stated honestly**: with this lemma, `leftDiagonal_period_le` is "at most `log₂ (k+1)` of the first `k` left diagonals are eventually white". That is a statement about *where diagonals are black*, not about periods, which is a better-shaped question than the one the wall poses — but it is no nearer proved, and `leftDiagonal_step_period_dichotomy`'s own docstring already flagged this residual ("the eventually-white left diagonals are sparse") as measured and unproved. Do not dispatch this node again expecting the reduction to be the missing piece; it is not, and it is now on disk.

**Cost note, continuing [[column-settledConfig-eq]]'s**: this session started at $1.22 spent before the first tool call. Two Reads/Greps, one Write, one build, and the report was the whole budget. On a wall node, decide within two tool calls whether to survey or to build something small and provable — there is no room for both.

## 2026-09-08T21:09:21Z — leftDiagonal_period_le_of_black_between (sonnet, proved)

leftDiagonal_period_le_of_black_between (sonnet, proved) — zero-friction transcription of a proof I (Vesper, opus) had already written and kernel-checked in a prior abandoned attempt at the still-open `leftDiagonal_period_le` wall, parked at runs/20260908T205802Z/leftDiagonal_period_le-1/LeftDiagonalPeriodLe.lean. Copied verbatim (imports `Rule30.Basic`, `Rule30.Proofs.LeftDiagonalStepPeriodDichotomy`), built first try, axioms confirmed standard three via the append-`#print axioms`-then-remove trick.

Reconfirms the now well-established rule across this whole family ([[leftDiagonal-period-unbounded]], [[column-settledConfig-eq]], [[rightDiagonal-driver-flip-iff-white]]): **always Glob `runs/**/<Pascal>.lean` for a node's name before writing anything new** — a budget-exhausted or wall-abandoned attempt's file lands under its run directory, not in Proofs/, and this project has now had at least four nodes close by simple retrieval rather than fresh proof.

Proof shape, for the record (see full text in the file): induction on `n`, carrying the *pair* (diagonal m+n, diagonal m+n+1) rather than a single diagonal, since `leftDiagonal_step_period_dichotomy` needs both to advance one step. The dichotomy's white branch is ruled out by the `hb` hypothesis (a black cell arbitrarily far out contradicts eventual whiteness), and the black-preserving branch just merges the two onsets via `max`. Note this proof does NOT close `leftDiagonal_period_le` itself — it reduces that wall to the separate, still-open claim that at most log2(k+1) of the first k left diagonals are eventually white, which is a statement about where diagonals are black rather than about periods. That residual is unaffected by this node closing.

## 2026-09-08T21:23:27Z — leftDiagonal_eq_rowNat_testBit (haiku, proved)

**leftDiagonal_eq_rowNat_testBit.** The bridge theorem connecting diagonal coordinates to the row-packing model. Proves that `leftDiagonal k j = (rowNat (j + k)).testBit k` by unfolding definitions and normalizing indices. No induction needed — pure definitional reasoning with `omega` for Nat arithmetic.

**Route used:** Unfold `leftDiagonal` to `evolve`, rewrite with `rowCell_eq_evolve`, unfold `rowCell` to expose the `testBit` call, dispatch the guard condition `if_pos` with `constructor <;> omega` (the bounds are automatic from the definition), then `congr` to align index expressions and `omega` to close the remaining Nat equality.

**Parked source:** Selvage, runs/20260908T124200Z/leftDiagonal_onset_le-2, described as "compiles clean with no sorry against f2b2daf" — verified to build on current tree.

## 2026-09-08T21:28:17Z — centerColumn_other_of_cohomologous_column (sonnet, proved)

centerColumn_other_of_cohomologous_column (sonnet, proved), first try modulo one false start.

No parked proof existed for this node — only explorer/portage_scratch_evendriver.lean's sorry'd type-check, which is not a proof, just confirmation the signature elaborates. Built the proof fresh.

**The whole idea is xor-cancellation on a common period, and it needs no ℤ/cast bookkeeping at all** — a pleasant surprise given how much of P1's diagonal family is cast arithmetic. `x : ℤ` never participates in any arithmetic here; only the ℕ time-indices (`t`, `j`, `p`, `N`) do, and every obligation on those closes with bare `omega`.

**Route**: `isEventuallyPeriodic_common_period centerColumn (fun t => xor (centerColumn t) (evolve (t + j) x)) hc hd` puts both hypotheses on one period `p` from one onset `N` (accepted directly since `hc`/`hd`'s stated type `∃ p > 0, ∃ N, PeriodicFrom f p N` is defeq to `IsEventuallyPeriodic f`, no unfold needed). Then for `n ≥ N`: `h0 n : centerColumn (n+p) = centerColumn n` and `h1 n : xor (centerColumn (n+p)) (evolve (n+p+j) x) = xor (centerColumn n) (evolve (n+j) x)`. `rw [e0] at e1` substitutes the LHS's `centerColumn (n+p)` with `centerColumn n`, leaving `xor (centerColumn n) A = xor (centerColumn n) B`; a two-line private lemma `xor_cancel_left {a b c} (h : xor a b = xor a c) : b = c := by cases a <;> cases b <;> cases c <;> simp_all` (the left-handed mirror of the already-documented `xor_cancel` from [[leftDiagonal-pair-never-eventually-shifted]], which cancels on the *right*) strips it to `evolve (n+p+j) x = evolve (n+j) x`.

**The one false start**: tried `dsimp only at e1` before the `rw`, expecting an un-beta-reduced lambda application per [[leftDiagonal-periodicFrom-step-of-black]]'s documented gotcha (`bool_driven_periodicFrom_of_reset`-family calls leave redexes that block `rw`). Got "`dsimp` made no progress" — here `h1`'s type, obtained directly from `isEventuallyPeriodic_common_period`'s own conclusion (itself stated as `∀ n ≥ N, g (n+p) = g n` with `g` the literal lambda argument), comes back **already beta-reduced** by the time `have e1 := h1 (m-j) hnN` elaborates. So the redex-survives-application gotcha is not universal — it seems to depend on how the lambda arrives at the call site (as a bound `g` inside a general lemma statement, vs. raw lambda literals threaded through multiple `have`s as in the `bool_driven_*` family). **Lesson: try the `rw` first, add `dsimp only` only if it fails to match — don't apply the workaround defensively, since an unnecessary `dsimp only` is a hard error ("no progress"), not a no-op.**

**Unshifting a periodicity fact by a constant `j` is free**, and is the mirror image of [[isEventuallyPeriodic-shift]] (which *adds* a read-offset). Given `PeriodicFrom (fun t => evolve (t+j) x) p N` in substance (here inlined rather than named as its own `have`), the goal `PeriodicFrom (fun t => evolve t x) p (N+j)` unfolds to `∀ m ≥ N+j, evolve (m+p) x = evolve m x`; reading it at `n := m - j` (valid since `m ≥ N+j` gives `m - j ≥ N`, then `n+j = m` and `n+p+j = m+p` by `omega`) recovers exactly the shifted fact at `m`. Two `rw [show ... from by omega]` calls on `key`'s two index expressions close it — same idiom as everywhere else in this project's ℕ-index bookkeeping.

Import list: `Rule30.Basic`, `Rule30.Proofs.IsEventuallyPeriodicCommonPeriod` — sufficient, no cast/order/ring imports needed since there is no ℤ arithmetic at all in this proof, only ℕ `omega`.

Axioms verified via the append-`#print axioms`-then-`lake env lean`-then-remove trick (now standard across the whole P1 family): `propext, Classical.choice, Quot.sound` — the `Classical.choice` presumably rides in transitively through `isEventuallyPeriodic_common_period`'s own dependency chain, since this proof itself is fully constructive (no classical reasoning, no `by_contra`, no `choose`).

This is the "enabling half" of the coboundary/cohomology reading of the P1 residual that Portage (connector) surfaced — worth remembering that its *unconditional* companion (is any such xor-difference eventually periodic at all?) is deliberately NOT on the board, measured false empirically, and belongs to a theorist rather than a prover.</notebook>


## 2026-09-08T22:36:46Z — rightDiagonal_period_unbounded (opus, proved)

rightDiagonal_period_unbounded (opus, proved) — zero-friction retrieval, ~$0.7 of work on top of the ~$1.25 the system prompt costs before the first tool call. The brief named `explorer/scratch_rightunbounded_proof.lean` as Sextant's kernel-checked route; it was there, complete, 157 lines including two `#print axioms`. Copied verbatim, marked the four helpers `private`, dropped the diagnostics, wrote the note. Built first try, no tactic changed.

**The retrieval habit now has a fifth confirmation and a first failure mode.** My notebook has been accumulating this rule since [[leftDiagonal-period-unbounded]]: before writing anything, look for a parked file — `explorer/scratch_*.lean` for a theorist's route, `runs/**/<Pascal>.lean` for a budget-exhausted or wall-abandoned attempt. This node is the fifth to close that way. But note what made it work here: **the brief named the path**. This session had NO Glob and NO Grep — both die on `ENOENT ... uv_spawn 'rg'`, ripgrep is not installed — and the guard rightly denies `find`/`ls`/`grep` through Bash. So the habit was only executable because someone else had already done the search. If a future attempt of mine hits a node where the brief does not name a path, and Glob is still broken, I cannot search at all: the only move left is to read a path I can guess exactly (`explorer/scratch_<something>.lean` is guessable, `runs/<timestamp>/<node>-<n>/` is not). Filed as friction. Guess the scratch path from the node name and Read it directly — that is the one workaround, and it costs one failed Read.

**Statement shape worth remembering for the right side.** `PeriodicFrom (rightDiagonal k) p 0` — onset 0, not an existential onset. The right diagonals have no transients (`rightDiagonal_periodicFrom_pow` gives period 2^k from index 0), which is why this statement is cleaner than its left-side twin `leftDiagonal_period_unbounded`: no `∀ N`, and it quantifies over every `p > 0` rather than powers of two. The extra generality is free — for odd `p` it already fails at `rightDiagonal 1`, which alternates.

**The route, and why it needs no pigeonhole at all.** This is the striking contrast with the left side. `leftDiagonal_period_unbounded` cost an L and ran on phase alignment plus `Finite.exists_ne_map_eq_of_infinite` over words in `Fin p → Bool`. The right side needs none of that machinery — it is pure cone geometry:
- `B := fun x => evolve p (x + p)` is row `p` slid left by `p`.
- `B` agrees with `initialConfig` everywhere right of `-m`, where `m` is the distance from row `p`'s right edge to the nearest black cell: white right of the origin by `evolve_eq_false_of_outside_cone`, black AT the origin by `evolve_right_edge` (matching `initialConfig 0 = true`), white strictly between `-m` and `0` by the minimality of `m`.
- `B` differs from `initialConfig` at `-m` (black vs white).
- `rightmost_difference_moves_right` then puts the difference at `-m + t` at time `t`, so it hits the origin at exactly `t = m` and nowhere earlier — which is `evolve (m+p) p ≠ evolve m 0`, i.e. diagonal `m` fails `p`-periodicity, while every shallower diagonal passes.
The lemma even proves the sharp two-sided statement (all `t < m` agree, `t = m` differs); only the second half is needed here. **Generalise: on the right side, reach for the cone and the difference-front lemmas before reaching for a counting argument. The left side needs pigeonhole because its diagonals have transients; the right side does not.**

**Three private helpers worth knowing exist, since they are private and invisible outside this file.** If a later right-side node needs them, they must be re-proved or seeded: `rule30_translate` (one step commutes with a spatial shift, 4 lines: `simp only [rule30_eq]` then two `ring` index bridges), `evolveFrom_translate` (the same for the whole evolution, induction on `t` generalizing `i`, with the induction hypothesis packaged as `funext ih` so `rw` can use it as a function equality), and `evolveFrom_evolve : evolveFrom (evolve p) t = evolve (t + p)`, which is one `simp [evolveFrom, evolve, Function.iterate_add_apply]`. That last one is the cheapest and most reusable — `Function.iterate_add_apply` is the name that makes "grow from row p" and "read p rows later" the same thing, and I had not used it before in this region.

**`Nat.find` for a minimal witness, with the pattern that closes the minimality side.** `exists_agreement_length` needs the *nearest* black cell, so: prove existence with an explicit crude witness (`d = 2*p`, black because `p - 2p = -p` is the left edge, via `evolve_left_edge` after `push_cast; ring`), then `Nat.find hex` with `Nat.find_spec` for the two positive facts and `Nat.find_min hex hdm` for minimality. The minimality branch needs `simp only [not_and] at this` to turn `¬(0 < d ∧ ... = true)` into an implication, then `cases h : evolve ... with | false => rfl | true => exact absurd h (this hd0)` — the `cases h :` form (naming the equation) is what lets the `true` branch cite `h` against the negation. Cheaper than `by_contra` here.

**`simp [initialConfig]` then `omega` — do not "clean up" the trailing omega.** Several branches end with `simp [initialConfig]` followed by a bare `omega`. It looks redundant (simp usually closes these) but `initialConfig j = decide (j = 0)` leaves an integer disequality goal that simp normalises but does not discharge. Conversely one branch (the origin, after `subst`) ends with `simp [initialConfig]` and NO omega, because there the goal really does close. Related to [[evolveHalfRight-eq-column]]'s gotcha in reverse: there `push_cast; ring` failed with "no goals" because push_cast already closed it. Same lesson both ways — **a tactic pair where the first sometimes closes the goal is position-dependent; copy the working combination exactly rather than regularising it.**

Imports: `Rule30.Basic`, `Rule30.Proofs.RightmostDifferenceMovesRight`, `Rule30.Proofs.EvolveEqFalseOfOutsideCone`, `Rule30.Proofs.EvolveRightEdge`, `Rule30.Proofs.EvolveLeftEdge` — the scratch's own list, unchanged. `ring`, `push_cast`, `omega` and `abs_of_pos` all rode in transitively; no `Mathlib.Tactic.Ring` or `Mathlib.Algebra.Order.Ring.Int` line was needed, which is a first for a P1 file of mine that uses `abs`. `RightmostDifferenceMovesRight` presumably pulls them.

Axioms via the append-`#print axioms`-then-`lake env lean`-then-remove trick: `propext, Classical.choice, Quot.sound`. `Classical.choice` enters through `Nat.find`'s decidability (`classical` is invoked in `exists_agreement_length`), so it is genuinely load-bearing rather than inherited.

NOVELTY, unverified by me: the brief records Sextant's claim that this fact is Rowland's introductory sentence with no proof in his paper and no statement in the held sources — Sextant's own search, not independently checked. I did not check it either and have no evidence bearing on it. Do not repeat the claim as settled.

## 2026-09-08T22:50:44Z — rule30_translate (haiku, proved)

**The proof shape**: Unfold `rule30_eq` to expose the three-cell structure `rule30 c i = (c (i-1)) ^^ (c i || c (i+1))`. When applied to the shifted config `fun x => c (x + s)`, the indices in the xor/or expression shift uniformly by `s`. Two `ring` calls align the arithmetic: `i - 1 + s = i + s - 1` and `i + 1 + s = i + s + 1`.

**Import note**: `Mathlib.Tactic.Ring` is required; it does not ride in transitively on `Rule30.Basic`.

**Reusable pattern**: Equivariance proofs over integer indices with polynomial rearrangement benefit from a single `simp only [rule30_eq]` followed by `ring` on each index position, rather than trying to massage the goal with casts or `omega`.


## 2026-09-08T22:52:34Z — evolveFrom_translate (haiku, proved)

Proof pattern for lifting equivariance from a single step through an iteration: establish function equality via funext on the inductive hypothesis, then apply the one-step lemma. Generalizing the step parameter in induction is essential when the one-step result needs to hold pointwise for all indices.

## 2026-09-08T23:51:37Z — centerColumn_not_isEventuallyPeriodic_of_cohomologous (haiku, proved)

**Cohomologous column condition (Prize 1 sufficient, not achieved).** The XOR of centerColumn with any nonzero column being eventually periodic is sufficient to prove aperiodicity—if centerColumn were periodic, both it and the other column would be, contradicting uniqueness. Measured with 0 survivors over 38,700 pairs (Sextant). The proof is pure lemma application: assume periodic, apply centerColumn_other_of_cohomologous_column to get the paired column periodic, apply isEventuallyPeriodic_column_unique to conclude x = 0, contradicting x ≠ 0. Kernel-checked in explorer/sextant_scratch_coboundary.lean; axioms propext, Classical.choice, Quot.sound.

## 2026-09-09T00:05:57Z — exists_config_same_centerColumn (opus, proved)

exists_config_same_centerColumn (opus, proved) — first try, no dead ends, ~$0.9 of work on top of the ~$1.3 the system prompt costs before the first tool call. Sixth node in a row to close by retrieval rather than by fresh proof, and the brief named the path (`explorer/sextant_scratch_shield_general.lean`), so the whole attempt was one Read, one Write, two builds, one axiom check.

**Glob works again in this session.** My last entry ([[rightDiagonal-period-unbounded]]) recorded Glob and Grep both dying on `ENOENT ... uv_spawn 'rg'` — ripgrep missing. Not so here: `Glob **/ExistsConfigSameCenterColumn.lean` ran and correctly returned "No files found". So that outage was transient (or fixed), and the retrieval habit is executable again without the brief naming a path. Do not carry the "search is broken, guess the path" workaround forward as a standing fact — try Glob first.

**Turning a scratch file into a proof file: four mechanical edits, and one of them is a judgement call.** (1) Swap `import Rule30.Proofs` for `import Rule30.Basic` plus what the tactics need — here `Mathlib.Algebra.Order.Ring.Int` (for `lt_trichotomy` and the ℤ order instances) and `Mathlib.Tactic.Ring` (for `ring`, with `push_cast` riding in on it, as always). This scratch cited NO served lemma at all — `shieldGen_outside` and `shieldGen_edge` are proved locally rather than reaching for `evolve_eq_false_of_outside_cone`/`evolve_left_edge`, because those are about the single seed and this is about an arbitrary finite row. So the import list was Basic + two tactic modules and nothing else. (2) Mark every helper `private`. (3) Drop the `#print axioms` diagnostics at the bottom. (4) The judgement call: the scratch proved `shieldGen_*` for `addRight` (one cell out) AND `shieldGen2_*` for `addRight2` (two cells out), plus `chainCfg_injective`. Only the `addRight2` half and the shape/centre-column lemmas are on the path to this existential — `addRight` and injectivity are dead weight in the proof file. Deleted them. **A scratch file is a theorist's whole exploration; a proof file is the one path through it. Prune before you paste, or you carry helpers that the node does not need and that a later reader has to work out are unreachable.**

**`shieldGen_outside`/`shieldGen_edge` stay even though `addRight` went.** They are used by `shieldGen2_invariant` (as `out` and `edge` inside the successor case), not only by the `addRight` half. Check what each helper is actually cited by before pruning — the two families interleave.

**The invariant is five-fold, not four-fold, and that is the whole content.** `shieldGen2_invariant` carries: agreement everywhere strictly left of `r + t`; the exact value at `r + t` (the complement of the old row's cell at `r + t - 1`); the exact value at `r + t + 1` (equal to that same old cell); black at `r + t + 2`; and white beyond. You cannot weaken any of the middle three to an existential or drop one — each of the three edge cells feeds the next row's edge cells, so the induction closes only if all three are pinned to named values in terms of the ORIGINAL row. My proof note calls it four facts (agreement plus three edge cells), which is the same five conjuncts counted as the reader sees them.

**The proof-note discipline bit worth repeating**: the honest "where the work is" here was not a tactic — it was *why the invariant has to be that wide*. When a proof's difficulty is the SHAPE of the induction hypothesis rather than any single step, say that; it is the one thing a reader cannot reconstruct from the statement.

**One lint warning, worth fixing rather than ignoring.** `(by push_cast; omega)` on a goal `0 < 2 * n + t` (pure ℕ, no casts) drew `Unused tactic linter: push_cast does nothing`. Bare `by omega` is correct. This is the mirror of [[evolveHalfRight-eq-column]]'s gotcha (where `push_cast; ring` errored because push_cast had already closed the goal): copied-in tactic pairs carry the previous context's needs, and the linter is the cheap detector. `lake build` reports it as a warning, not an error, so it does not fail the node — but a warning in a proof file is noise the next reader has to adjudicate. Fix it.

**Statement shape note for anyone reading this node later**: the theorem is stated existentially, deliberately, so it needs no new definition in `Basic` — `chainCfg` lives private inside the proof file and is invisible outside it. That means the "distinct k give distinct configurations" half of Sextant's result (`chainCfg_injective`) is NOT on the board and cannot be cited: the existential gives you a configuration whose rightmost black cell is at 2k, and distinctness follows from that (different rightmost black cells ⇒ different configurations) but is a one-line argument the caller has to redo. If a later node wants infinitude as a Lean statement, it needs its own seed, not this one.

Axioms via the append-`#print axioms`-then-`lake env lean`-then-remove trick (standard across P1 now): `propext, Classical.choice, Quot.sound`. `Classical.choice` is inherited rather than load-bearing — nothing here is by_contra or choose.

**This node is about Prize 3, not Prize 1**, and that is unusual for P1 — my region has been the cone's edges and periodicity throughout. Worth knowing the boundary work has a second consumer.

## 2026-09-09T17:09:33Z — leftDiagonal_onset_le (fable, abandoned)

**Retrieval first, sixth confirmation.** `Rule30/Proofs/LeftDiagonalOnsetLe.lean` did not exist; the brief named `runs/20260908T224923Z/leftDiagonal_onset_le-3/LeftDiagonalOnsetLe.lean` and it built untouched — 77s cold (the `decide +kernel` to depth 5000 is most of it), ~20s on rebuilds. Copy verbatim, build, then think; the build was the first thing I paid for and it settled what I was inheriting.

**The wall, read as a particle.** This is the clearest form I have found and it is worth not re-deriving. Align every row so the left edge is at 0: bit `i` of `rowNat t` is `leftDiagonal i (t - i)`. The low `n` bits are autonomous (attempt 3's `rowNat_succ_mod_two_pow_congr`), so "settled to depth n at time t" is a property that can only grow. Let `n(t)` be the settled depth against the eventual period. The frontier law, from `leftDiagonal_recurrence` with the two settled neighbours substituted: `n(t+1) ≥ n(t)+1` iff bit `n-1` at time `t` is black (or the unsettled bit happens to agree, which only helps); while bit `n-1` is white the difference at bit `n` persists exactly, because the update is then an XOR with a settled value. In the actual picture the settled wedge is `[-t, n(t) - t)` and its right boundary `f(t) = n(t) - t` is a particle that holds position when the cell to its lower left is black and slides one left when it is white. **The wall `N ≤ k` is exactly `f(t) ≥ -t/2`: the particle slides at most half the time.** Measured onsets (ratio ≤ 0.479) mean it slides about a third of the time, so there is a factor-of-1.5 slack, and it is real slack.

**Onset recursion in these terms.** With `τ_n` the time the frontier reaches depth `n`: `τ_{n+1} ≤ τ_n + w_n + 1` where `w_n` is the white run of diagonal `n-1` starting at the moment the frontier arrives. That is `leftDiagonal_periodicFrom_step_of_black` in time coordinates. So the wall is `Σ_{n≤k} w_n ≲ k`: average white run at arrival ≤ 1. Measured average ≈ 0.3. The crude bound `w_n ≤ P_{n-1} - 1` (a non-eventually-white periodic diagonal is black within one period) gives ≤ 15 for most depths — off by a factor of ~15, so no period-based argument reaches the wall even with the period wall granted.

**What a white run is made of** — the two lemmas now in the file, both one recurrence rewrite plus a Bool case split. `leftDiagonal_white_succ_iff`: a white cell on `D(m+2)` at `i` is followed by white at `i+1` iff `D m (i+2) = D (m+1) (i+1)`. `leftDiagonal_agree_succ_iff`: that agreement persists one cell iff (agreed value black ∧ `D m (i+4) = D (m+1) (i+3)`) ∨ (agreed value white ∧ `D m (i+4) = false`). So a white run of length `w` on one diagonal is a chain of conditions reaching `2w` diagonals shallower. I checked whether the chain bottoms out in a contradiction at the fixed low bits (bit 0 = 1, bit 1 = 1, bit 2 = 0, bit 3 alternating, bit 4 = 1): it does not — bits 0 and 1 agree for ever, so the chain is satisfiable all the way down. **No bound on `w_n` comes from the cascade alone.** The arrival itself gives one free fact: the frontier reached `n` because bit `n-2` was black at `τ_n - 1`, so bit `n-1` at `τ_n` is the complement of bit `n-3` at `τ_n - 1`; the run is empty iff that shallower cell is white. I could not turn this into amortisation.

**Dead ends not to repeat.** (1) Bounding onset via the period: `onset_k ≤ Σ P_i`, and `P_i ≤ 2^i` is all that is proved, so this is the 2^k bound again. (2) Bounding the count of eventually-white diagonals (which is where the period doubles) — nothing on the board bounds it; `leftDiagonal_pair_never_eventually_shifted` compares diagonals at the SAME index and says nothing about shifts, as I already recorded at [[leftDiagonal-period-le]]. (3) Extending the kernel check past 5000: cost grows like k³ and the evidence is already seven times past the seeder's range; not worth a build.

**Tactic notes.** `generalize leftDiagonal (m + 2) (i + 2) = a at h ⊢` then `cases a <;> cases … <;> decide` closed the 8-way Bool split in `leftDiagonal_agree_succ_iff` first try — `generalize … at h ⊢` is the way to name a repeated Bool subterm so `cases` can hit it in both the hypothesis and the goal at once, and after `rw [r1, r2, ← h]` every occurrence of `D (m+3) (i+1)` had already been rewritten to `D (m+2) (i+2)`, so one `generalize` covered everything. Index alignment for the two recurrence instances was four `rw [show … by omega] at r1/r2` lines, the usual idiom.

## 2026-09-09T17:14:17Z — leftDiagonal_agree_succ_iff (sonnet, proved)

leftDiagonal_agree_succ_iff (sonnet, proved), first try, no dead ends.

Route: two instances of `leftDiagonal_recurrence` (from `Rule30.Proofs.LeftDiagonalRecurrence`) — one at `(m, i+2)` giving `leftDiagonal (m+2) (i+3) = xor (leftDiagonal m (i+4)) (leftDiagonal (m+1)(i+3) || leftDiagonal (m+2)(i+2))`, one at `(m+1, i+1)` giving `leftDiagonal (m+3)(i+2) = xor (leftDiagonal(m+1)(i+3)) (leftDiagonal(m+2)(i+2) || leftDiagonal(m+3)(i+1))`. Both need index-alignment rewrites first: the second instantiation produces FOUR distinct patterns to bridge (`m+1+2=m+3`, `i+1+1=i+2` [appears twice], `i+1+2=i+3`, `m+1+1=m+2`) — one `rw [show ... from by omega, ...]` block with all four in one call handles it, since the patterns are syntactically disjoint and each `rw` step rewrites every occurrence of its own pattern before the next fires.

After `rw [R1, R2, ← h]` (the `← h` step turns `leftDiagonal(m+3)(i+1)` into `leftDiagonal(m+2)(i+2)` EVERYWHERE in the goal, including inside the iff's own disjunction — this is intentional and harmless since h says they're equal, and it collapses the goal to a statement about exactly three Bools: `a := leftDiagonal m (i+4)`, `b := leftDiagonal(m+1)(i+3)`, `c := leftDiagonal(m+2)(i+2)`), the goal is `xor a (b||c) = xor b (c||c) ↔ (c=true ∧ a=b) ∨ (c=false ∧ a=false)`. Three `generalize` calls then `cases a <;> cases b <;> cases c <;> decide` closes all eight cases — no need to hand-verify the boolean identity myself, `decide` handles it.

Hand-check for anyone reading this proof shape again: the identity is `xor a (b||c) = xor b (c||c)` (note RHS is `c||c` post-rewrite, not `c||d` — this looks odd but is correct and decide doesn't care). The two disjuncts correspond exactly to: c=true collapses `b||c` and `c||c` both to `true`, so the equation becomes `¬a = ¬b` i.e. `a=b`; c=false collapses `b||c` to `b` and `c||c` to `false`, so the equation becomes `xor a b = false` i.e. `a=false` (independent of b).

No new gotchas — this is now a well-worn pattern in the diagonal family (see leftDiagonal_transient_front_law/mask_law in explorer/scratch_masking.lean, which I read first and confirms the same recurrence-instantiate-then-generalize-then-decide shape, though that file solves a different pair of lemmas and wasn't directly reusable here). Import list `Rule30.Basic`, `Rule30.Proofs.LeftDiagonalRecurrence` sufficient — no cast/order/ring imports needed since every index obligation was plain ℕ `omega`.

Axioms via the append-`#print axioms`-then-`lake env lean`-then-remove trick: `propext, Quot.sound`, no `Classical.choice` — matches the brief's stated expectation exactly.

## 2026-09-09T17:28:41Z — rowNat_return_succ_iff (sonnet, proved)

rowNat_return_succ_iff (sonnet, proved) — seventh confirmation of the retrieval habit this notebook has been tracking since [[leftDiagonal-period-unbounded]]. Glob `runs/**/RowNatReturnSuccIff.lean` found nothing, but `runs/**/leftDiagonal_onset_le-5/*.lean` found Cadence's parked file (`runs/20260909T171155Z/leftDiagonal_onset_le-5/LeftDiagonalOnsetLe.lean`), which contains this exact theorem verbatim along with three other results that were not this node's job. **When the exact node filename doesn't turn up, widen the Glob to the parent attempt's directory name** (guessed from the brief's "Proved by X at Y attempt N" sentence) rather than giving up after one miss.

**Pruning a multi-theorem wall-attempt file down to one node.** The source file had five private helpers (`rowStep`, `rowNat_succ_eq`, `testBit_rowStep`, `mod_two_pow_eq_iff`, `rowStep_mod_two_pow`, `rowNat_succ_mod_two_pow_congr`) plus four theorems (`rowNat_mod_two_pow_eq_of_eq`, `leftDiagonal_periodicFrom_of_rowNat_return`, `leftDiagonal_onset_le_of_le_5000` with its `decide +kernel` computation, `rowNat_return_succ_iff`, `leftDiagonal_white_succ_iff`). Only `rowNat_return_succ_iff` was this node's job. Traced its actual dependency chain by hand: it cites `mod_two_pow_eq_iff`, `rowNat_succ_mod_two_pow_congr` (which needs `rowNat_succ_eq` and `rowStep_mod_two_pow`, which needs `testBit_rowStep`, which needs `rowStep`) — nothing else. Dropped `rowNat_mod_two_pow_eq_of_eq`, `leftDiagonal_periodicFrom_of_rowNat_return`, the kernel-decide wall check, and `leftDiagonal_white_succ_iff` entirely, along with the imports they needed (`Rule30.Proofs.LeftDiagonalEqRowNatTestBit`, `Rule30.Proofs.LeftDiagonalOnsetLeIffRowNatReturn`, `Rule30.Proofs.LeftDiagonalRecurrence`) — this node needs only `Rule30.Basic` and `Mathlib.Tactic`. Built clean first try after the prune, confirming the traced dependency set was complete and nothing was silently needed from the dropped code.

**Proof shape, for the record.** `rowStep r := (4*r) ^^^ ((2*r) ||| r)` is one step of the packed-row model as a bare Nat function (`rowNat (t+1) = rowStep (rowNat t)` by `rfl`). `testBit_rowStep` reads off bit `i` of `rowStep r` via `Nat.testBit_xor`/`Nat.testBit_or`/`Nat.testBit_two_pow_mul` after rewriting `4 = 2^2`, `2 = 2^1`. `mod_two_pow_eq_iff` is the general "mod 2^m agreement iff low-m-bits agreement" bridge via `Nat.testBit_mod_two_pow`/`Nat.eq_of_testBit_eq`. The main theorem's `hbit` sub-lemma pins down bit `n+1` of the successor as a Boolean expression in four bits (`a,b,c,d`), generalizes them, and `cases a <;> cases b <;> cases c <;> cases d <;> decide` closes all sixteen. The outer `↔` then splits on `mod_two_pow_eq_iff` at `n+2` vs `n+1`, isolating exactly the new bit `n+1` as the only thing not already known from `h`.

Axioms verified via the append-`#print axioms`-then-`lake env lean`-then-remove trick (now standard across this whole family): `propext, Classical.choice, Quot.sound`, nothing extra.

Note this closes a piece of `leftDiagonal_onset_le_iff_rowNat_return`'s arithmetic form but not the wall itself — the brief is explicit that this is the recursion the return-property obeys, not a bound on how often it stalls.

## 2026-09-09T17:32:07Z — rule30_run_boundary (haiku, proved)

**Rule 30 case-analysis pattern**: When a Bool predicate on a configuration reduces to a small finite case split (here, 8 cases from three Booleans), the tactic chain `cases a <;> cases b <;> cases c <;> decide` is fast and reliable. `decide` handles each concrete Boolean combination; `<;>` chains the tactic across all branches. This pattern appears in rule30_ne_of_left_ne and similar permutivity lemmas. **Run-boundary reading**: The statement makes explicit what the XOR definition obscures: Rule 30 selects for cells at edges of monochromatic runs (patterns where a cell differs from a neighbor). This framing, noted in the brief as absent from prior proofs of aperiodicity, is the bridge Meridian's work established between the automaton's definition and statements about repetition.
