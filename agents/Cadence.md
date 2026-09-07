# Cadence

I'm Cadence. I work the edges of the light cone in Rule 30 — the strip along each boundary where the chaos in the middle hasn't reached yet, and where the pattern is forced to repeat. Periodicity is the one honest promise this automaton makes anywhere, and P1 is where we get to cash it in with an actual proof instead of a conjecture. I'm joining Vesper here, not replacing them — this notebook is mine, but the region and its history are ours. What I care about is precision at the boundary: getting the exact period, the exact offset, and the exact induction that carries a proof from one row to the next, without hand-waving over "eventually" or "for large enough n." If a lemma in Statements.lean is vague about where the edge starts, I'll be the one asking.

## 2026-09-06T14:48:01Z — named for P1

P1 is the region where Rule 30's light cone edges provably repeat — periodicity is the one thing we get to prove outright here, unlike the chaos in the center column. "Cadence" names that: a recurring beat, a return that you can set your clock to. It's a real given name, not a job title, and it doesn't collide with Vesper, Rowan, or Keel. It also sets up a clean teaching anchor for Dib later — periodicity as cadence, the way a repeating rhythm in music is a period you can name and prove will recur.

Colour: #2a6f77 — A steady blue-teal, the color of a horizon line — fitting for a prover who lives at the fixed boundary between the cone's settled edge and its unsettled interior.

## 2026-09-06T14:49:37Z — evolve_right_edge (sonnet, proved)

evolve_right_edge mirrors evolve_left_edge almost exactly — swap which neighbor plays the "just-outside-the-cone" role. At i = n+1: the left neighbor evolve n n is the previous edge (true, from ih), while both evolve n (n+1) and evolve n (n+2) are outside the cone (false, via evolve_eq_false_of_outside_cone) — note it's *two* outside-cone facts here (both the center and right neighbor of the new cell), versus evolve_left_edge which only needed one (its right neighbor was the previous edge, only its left needed outside-cone). Result: xor true (false || false) = true, closed by simp. Order-of-operations note: compute the outside-cone `have`s before `push_cast` — they don't depend on the goal's cast form — then push_cast, then rw [evolve_succ, rule30_eq, e1, e2, hfalse1, hfalse2, ih]; simp. `abs_of_nonneg` (not `abs_of_nonpos`) is the right lemma here since t and t+1, t+2 are all nonneg, unlike the left edge's negative offsets.

## 2026-09-06T15:18:23Z — evolve_right_second_diagonal (sonnet, proved)

evolve_right_second_diagonal (t+1 steps, position t, alternates by parity of t) follows the same induction shape as evolve_right_edge, but the IH itself carries a decide(...) value instead of `true`, so the succ case ends in a Bool-parity goal rather than a pure `simp`.

Key structure (succ case): rw [evolve_succ, rule30_eq, e1, e2, hright, hout, ih] leaves `xor (decide (n%2=0)) (true || false) = decide ((n+1)%2=0)`. Do NOT try to discharge this with a single `simp [hparity]` where `hparity : (n+1)%2=0 ↔ ¬(n%2=0)` — simp rewrites the RHS decide into a *different* residual (`!decide(n%2=1)` in my case) that doesn't obviously match the LHS, leaving an unsolved goal. Cheapest fix: `rcases Nat.mod_two_eq_zero_or_one n with h | h`, derive `(n+1)%2 = 1` (resp. `0`) with `omega` in each branch, then `simp [h, h']` closes it directly by computation — no cross-decide congruence needed.

Gotcha: `import Mathlib.Tactic.Omega` does NOT exist as a file in this Mathlib pin (build error "no such file or directory" on Mathlib/Tactic/Omega.lean) — yet the `omega` tactic itself works fine with zero extra import, since it's already pulled in transitively (Basic.lean's chain, or core/Batteries). evolve_eq_false_of_outside_cone.lean uses bare `omega` with no Omega import as proof. Just don't add that import line at all.

Also: `apply evolve_eq_false_of_outside_cone` on a goal like `evolve (n+1) ((n:ℤ)+2) = false` leaves a hypothesis goal `(↑(n+1) : ℤ) < |(n:ℤ)+2|` — the cast is on `n+1 : ℕ`, not pre-simplified to `(n:ℤ)+1`. `linarith` alone won't bridge `↑(n+1)` vs `↑n+1`; run `push_cast` first inside that `have` block before `linarith`/`abs_of_nonneg`.

## 2026-09-06T15:35:09Z — evolve_left_fifth_diagonal (sonnet, proved)

evolve_left_fifth_diagonal (t+4 steps, position -t, constant true) — induction on t.

Key shortcut: instantiate evolve_left_diagonal_recurrence with m=2, i=n (not m=1 as fourth-diagonal used with m=1... actually fourth used m unspecified via hn rewrites; the key generalizable fact is: to prove evolve (i+m+3) (-(i+1)) from data at depth i+m+2, pick m so i+m+2 lands on cells you already know). Here m=2 makes the three RHS terms:
  evolve (n+4) (-(n+2)) — third diagonal, = false (evolve_left_third_diagonal (n+2))
  evolve (n+4) (-(n+1)) — fourth diagonal, unknown/unneeded
  evolve (n+4) (-n)     — exactly the IH, = true

Because the recurrence's RHS is `xor A (B || C)`, and C = true (via ih), the middle disjunct B is irrelevant: `B || true = true` regardless of B's value, so you never need to invoke evolve_left_fourth_diagonal at all — one fewer served-lemma dependency than I expected going in. This is the "stays true once true" mentioned in the node description: once the OR'd branch is anchored to true, the whole family is true forever after, independent of what the alternating diagonal is doing.

Gotcha (cost me one build cycle): do NOT close `xor false (X || true) = true` with a bare `simp at hrec`. Generic simp also normalizes the *position* term in the same hypothesis (e.g. turns `-(↑n + 1)` into `-1 + -↑n`), which then no longer syntactically matches the goal's position after your own `push_cast; ring` rewrite, producing a "type mismatch" error even though both sides are mathematically the same integer. Fix: use targeted `rw [Bool.or_true, Bool.false_xor] at hrec` instead of `simp` — these are plain rewrite lemmas that only touch the Bool subterm and leave the ℤ position argument untouched. General lesson for this whole diagonal family: prefer `rw` with named Bool lemmas over `simp` whenever a hypothesis mixes a Bool equation with an ℤ-valued index you still need to pattern-match later.

`Bool.or_true : b || true = true` and `Bool.false_xor : xor false b = b` both exist in this Lean4/Mathlib pin and work directly with `rw`.

## 2026-09-06T16:56:39Z — isEventuallyPeriodic_shift (haiku, proved)

**Proof strategy:** Unfold IsEventuallyPeriodic definition, obtain witnesses p, N from hypothesis, construct the same witnesses for the shifted function. For n ≥ N, we have n + s ≥ N, so the original hypothesis f(n + s + p) = f(n + s) applies by rewriting n + p + s as (n + s) + p via omega. No induction required; the proof is pure witness construction and arithmetic.

**Lean techniques used:** Pattern matching with `obtain` on the existential, `simp only` to reduce lambda applications, `rw [show ... by omega]` to normalize arithmetic, and `exact` for direct term construction. The key insight is that omega can prove `n + p + s = (n + s) + p` (needed for rewriting), even when it cannot directly solve the equality goal.

## 2026-09-06T16:57:55Z — isEventuallyPeriodic_common_period (sonnet, proved)

isEventuallyPeriodic_common_period (haiku-tier size, went sonnet, proved first try): the only non-trivial fact is that a period survives repetition — `h(n+p)=h(n)` for `n≥N` gives `h(n+k*p)=h(n)` for all `k`, by induction on `k`. Proved this as a `private lemma iterate_period` in the same file (not exported, not in Statements, so this is fine — a proof file can carry local helpers alongside its one public theorem). Induction step: `rw [show n + (k+1)*p = n + k*p + p by ring, hp (n+k*p) hnk, ih n hn]` closes it in one line — `ring` handles the Nat arithmetic reshaping, then two rewrites chain `h(n+k*p+p) = h(n+k*p) = h(n)`, and `rw` closes the resulting `h n = h n` by rfl automatically.

Then `p*q` works for both sequences: for `g` take `k=p` directly (`iterate_period g q N2 hN2 p n hnN2 : g(n+p*q)=g(n)` — order matches goal as-is). For `f` take `k=q`, which gives `f(n+q*p)=f(n)`, so the goal needs `rw [show p*q = q*p from mul_comm p q]` first to align the multiplication order before `exact`.

Bookkeeping notes: `omega` proves `n ≥ N1`/`n ≥ N2` directly from `n ≥ max N1 N2` — no need for `le_max_left`/`le_max_right` lemma names, omega already understands `max` on ℕ. Also confirmed (again) that `obtain` cannot destructure `IsEventuallyPeriodic f` directly — it's a `def`, not literally `Exists`, so `unfold IsEventuallyPeriodic at hf hg` is needed first, same pattern as isEventuallyPeriodic_shift used.

## 2026-09-06T23:08:27Z — strip_succ (sonnet, proved)

strip_succ (Rule30.Proofs.StripSucc): route was exactly as the brief described — funext k; simp only [strip, stripStep, evolve_succ, rule30_eq], then two standalone `have`s (hleft, hright) whose LHS/type is written to match the post-simp goal's dependent-if syntactically, each closed by `split_ifs with h <;> congr 1 <;> omega`, then `rw [hleft, hright]`.

One gap in the brief: `split_ifs` is not available from `import Rule30.Strip` alone (Strip imports only Rule30.Basic, which imports Mathlib.Data.Int.Notation and Mathlib.Logic.Function.Iterate — neither brings in tactic-mode extensions). First build attempt failed with "unknown tactic" at the split_ifs line, cascading into two more "unsolved goals" errors on the surrounding `have`s (spurious — those were just fallout from split_ifs not parsing). Fix: add `import Mathlib.Tactic.SplitIfs` explicitly alongside `import Rule30.Strip`. Worth flagging for future strip/stripStep proofs, since this is probably the first node to need dependent-if case splitting on a Fin index.

Also confirms: `omega` closes the Nat-subtraction-cast side conditions (`↑(↑k - 1) = ↑k - 1` given `k ≠ 0`, etc.) after `congr 1` reduces the goal to the ℤ argument equality — no manual push_cast needed here, unlike some earlier diagonal proofs.

## 2026-09-07T02:26:29Z — rightDiagonal_recurrence (haiku, proved)

The key insight for rightDiagonal mirrors evolve_left_diagonal_recurrence: unfold the definition, rewrite time indices to apply evolve_succ, then apply rule30_eq. Importantly, the arithmetic normalization (i + 1 + (m + 1) = i + (m + 2) and i + 2 + m = i + (m + 2)) must be embedded in simp only with explicit show statements using omega, rather than applied as separate rewrites or congruence tactics. The cast normalizations (↑(i+1) - 1 = ↑i and ↑(i+1) + 1 = ↑(i+2)) both require push_cast; omega. No separate Mathlib.Tactic.Ring import is needed for the integer arithmetic (omega handles it).

## 2026-09-07T02:43:42Z — rightDiagonal_periodicFrom_step (sonnet, proved)

rightDiagonal_periodicFrom_step (sonnet, proved, one build cycle after one fix): exactly the shape the brief predicted — apply bool_xor_driven_periodicFrom with c := fun i => rightDiagonal (m+1) (i+1) || rightDiagonal m (i+2), x := rightDiagonal (m+2), p := q. The hrec goal is rightDiagonal_recurrence m i verbatim (no massaging needed — the served lemma's RHS is already exactly `xor (x i) (c i)` in that shape). The hc goal (PeriodicFrom c q N) needs h1 read at n+1 and h0 read at n+2 (both ≥ N since n ≥ N), then two arithmetic rewrites (n+q+1 = n+1+q, n+q+2 = n+2+q) to align with the lemma's output before substituting.

Gotcha (cost one build cycle): after `intro n hn` the goal is a beta-redex `(fun i => ...) (n+q) = (fun i => ...) n`. Tried to eliminate it with `show <lhs-without-parens-around-each-||-clause> = <rhs>` — i.e. `show a || b = c || d` — and Lean parsed it as `a || (b = c) || d` because `=` (prec 50) binds *tighter* than `||` (prec 30) in this Lean4/Mathlib pin, not looser as I'd have guessed from most languages. The error message actually prints the misparsed pattern verbatim (`decide (... = ...)` sitting inside the `||` chain), which is the tell — if a `show` involving `||` and `=` together fails with a `decide (_ = _)` appearing where you expected a bare `=`, it's this precedence trap, not a defeq problem. Fix: parenthesize each side of the top-level `=` explicitly: `show (a || b) = (c || d)`. General lesson for this whole diagonal-periodicity family: whenever `show` restates a goal built from `||`, wrap both `||`-expressions in parens around the outer `=`.

## 2026-09-07T02:46:45Z — rightDiagonal_periodicFrom_pow (sonnet, proved)

rightDiagonal_periodicFrom_pow (sonnet, proved, first build): follows evolve_left_diagonals_isEventuallyPeriodic's exact skeleton (`induction k using Nat.strong_induction_on with | _ k ih => match k, ih with | 0, _ => ... | 1, _ => ... | m + 2, ih => ...`), but landed on real periodicity (`PeriodicFrom`, no eventual/existential), not eventual periodicity, so no `refine ⟨p, hp, N, ?_⟩` step and no offset bookkeeping — `intro n _` on the goal unfolds PeriodicFrom directly since it's a plain `def` to a `∀ n ≥ N, ...` Pi type, exactly like the served step lemma applies `h1 (n+1) (by omega)` without any unfold call first.

Base case k=0: `simp only [rightDiagonal, pow_zero, Nat.add_zero]` normalizes both `(n + 2^0) + 0` and `n + 0` down to bare `n+1`/`n`, landing exactly on evolve_right_edge's LHS shape (`evolve t (t:ℤ)`), so `rw [evolve_right_edge (n+1), evolve_right_edge n]` closes it to `true = true` and rw's trailing rfl finishes automatically. Base case k=1: `simp only [rightDiagonal, pow_one]` similarly lands on evolve_right_second_diagonal's shape (`evolve (t+1) (t:ℤ)`); the residual `decide ((n+2)%2=0) = decide (n%2=0)` is closed by proving `hmod : (n+2)%2 = n%2 := by omega` and `rw`-ing it in directly, rather than fighting `congr` through the `decide` wrapper — cheaper than the parity rcases evolve_right_second_diagonal's own succ case needed, because here both sides are already `decide` of a mod-equality rather than one side being a bare `true`/`false`.

Step case m+2: exactly the brief's recipe. `periodicFrom_mul (rightDiagonal m) (2^m) 0 ihm 2` gives period `2*2^m`; `pow_succ` (`a^(n+1) = a^n * a`) plus `ring` proves `2*2^m = 2^(m+1)` (ring closes the resulting commutativity goal fine with `2^m` as an opaque atom — no need for a `Nat.pow`-specific lemma), then `rw [hq] at hm2` retags the period so it matches `ihm1`'s `2^(m+1)` exactly, letting `rightDiagonal_periodicFrom_step` apply directly. Same `pow_succ; ring` trick closes `2*2^(m+1) = 2^(m+2)` for the conclusion, applied with `rw [← hq2]` on the goal before the final `exact`. No induction-within-induction, no cast juggling anywhere in this file — the whole node is arithmetic bookkeeping around already-served lemmas, as the brief's size estimate (M) suggested.

## 2026-09-07T02:48:42Z — rightDiagonal_isEventuallyPeriodic (haiku, proved)

**rightDiagonal_isEventuallyPeriodic (haiku, proved):** Immediate from rightDiagonal_periodicFrom_pow by unfolding IsEventuallyPeriodic and providing witnesses p = 2^k (proved positive by `positivity`), N = 0. PeriodicFrom unfolds to exactly the property the existential asks for. No real work — pure witness construction from an already-quantitative lemma, same route that evolve_left_diagonals_isEventuallyPeriodic took from its step lemma. The asymmetry of right vs left (this is periodic from the start, left only eventually periodic) is carried at the level of proofs: this one witnesses PeriodicFrom directly where the left side witnesses IsEventuallyPeriodic existentially.

## 2026-09-07T15:06:00Z — leftDiagonal_recurrence (haiku, proved)

**Route:** Unfold leftDiagonal to evolve, rewrite the time index to match evolve_succ form (i + (m + 2) + 1), apply evolve_succ and rule30_eq directly, then simp with four explicit show-statements normalizing casts and arithmetic. No attempt to reuse evolve_left_diagonal_recurrence needed — rightDiagonal_recurrence showed the pattern works: match the goal form via direct `show` rewrites rather than expecting the statement lemma to pattern-match post-unfold. **Gotchas:** Cast negation — the difference between `-↑(i + 1)` and `-((i : ℤ) + 1)` breaks syntactic matching; solved by working with `evolve_succ` + `rule30_eq` (which unfold the recurrence anyway) rather than trying to apply a high-level recurrence lemma. **Size:** Three imports, thirteen lines, correct first try once the approach matched rightDiagonal_recurrence's working skeleton.

## 2026-09-07T16:13:11Z — sideways_inverse (haiku, proved)

**sideways_inverse (haiku, proved):** The three-line proof mirrors evolve_sub_one_eq_xor — rw [rule30_eq], then cases on c(i-1), c(i), c(i+1), then simp closes all 8 goals. The only subtlety is understanding that rule30_eq gives the forward direction, and xor self-inverse means the backward direction is provable by the same case split. Single import of Rule30.Basic suffices.

## 2026-09-07T16:19:52Z — rowCell_eq_evolve (opus, proved)

The whole node is three private lemmas plus a two-line induction. Decomposition that worked, in order:

1. `testBit_rowNat_succ (t b : ℕ) : (rowNat (t+1)).testBit b = xor (decide (2 ≤ b) && (rowNat t).testBit (b-2)) ((decide (1 ≤ b) && (rowNat t).testBit (b-1)) || (rowNat t).testBit b)`. Route: `rw [show rowNat (t+1) = (4 * rowNat t) ^^^ ((2 * rowNat t) ||| rowNat t) from rfl, h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul, Nat.testBit_two_pow_mul]` where `h4 : 4 * rowNat t = 2^2 * rowNat t := by norm_num` and `h2` likewise for `2^1`. The `rw` chain CLOSES THE GOAL BY ITSELF — my trailing `simp only [ge_iff_le]` was the only error in the first build ("No goals to be solved"). So `decide (b ≥ 2)` and `decide (2 ≤ b)` are already syntactically identical here (`GE.ge` is reducible enough for `rfl` after `rw`); do not add a normalisation step for it.

2. `testBit_rowNat_of_ge : ∀ t b, 2*t+1 ≤ b → (rowNat t).testBit b = false`, by induction on t. Base: `rw [show rowNat 0 = 1 from rfl]; apply Nat.testBit_lt_two_pow` then a `calc (1:ℕ) < 2^1 ≤ 2^b` with `Nat.pow_le_pow_right`. Step: `rw [testBit_rowNat_succ, ih b (by omega), ih (b-1) (by omega), ih (b-2) (by omega)]; simp` — omega handles the Nat-subtraction side conditions with no help.

3. `rowCell_eq_testBit t x : rowCell t x = (decide (-(t:ℤ) ≤ x) && (rowNat t).testBit (x + (t:ℤ)).toNat)`. This is the key simplification and I would reach for it again: it drops the RIGHT half of `rowCell`'s cone test, because past the right edge the number has no bit there anyway (lemma 2). It leaves only ONE `decide` per cell instead of a conjunction, which is what makes the step lemma tractable. The LEFT half is not redundant — bit 0 of `rowNat t` is the left edge and is `true`, so `testBit` alone would give the wrong answer left of the cone.

4. `rowCell_succ t x : rowCell (t+1) x = xor (rowCell t (x-1)) (rowCell t x || rowCell t (x+1))`. `simp only [rowCell_eq_testBit, Nat.cast_add, Nat.cast_one]` first — including `Nat.cast_add, Nat.cast_one` is what makes the goal shape PREDICTABLE, turning `↑(t+1)` into `↑t + 1` so I could write `have`s that match syntactically without ever reading the goal off a build error. Then `by_cases hx : -((t:ℤ)+1) ≤ x`, and in the in-cone branch six `have`s stated against `B := (x + ((t:ℤ)+1)).toNat`: `(x-1+↑t).toNat = B-2`, `(x+↑t).toNat = B-1`, `(x+1+↑t).toNat = B`, all `by omega`; and the three `decide`s converted with `decide_eq_decide.mpr (by omega)` / `decide_eq_true` / `decide_eq_false`. Then `rw [...]; simp`.

**The habit worth keeping: rewrite `decide p = decide q` with `decide_eq_decide.mpr (by omega)`, never by rewriting a `Prop` equality obtained from `propext`.** Rewriting the proposition inside `decide` changes the `Decidable` instance argument too and generally dies on "motive is not type correct". `decide_eq_true : p → decide p = true` and `decide_eq_false : ¬p → decide p = false` are the other two shapes and both exist in core. All three give Bool equalities, which `rw` eats without complaint.

`omega` understands `Int.toNat` and `Nat.cast` of a variable, so every index fact above was one `omega` with no `push_cast`. Confirms the notebook entry from evolve_right_second_diagonal from the other direction: push_cast is needed when the cast sits on a compound Nat like `↑(n+1)`, not when it sits on a bare variable.

Main theorem: `induction t generalizing x`. Base is `have hE : evolve 0 x = decide (x = 0) := rfl` (evolve 0 is initialConfig definitionally, `rule30^[0] = id` by rfl), then `by_cases hx : x = 0`; the `x = 0` branch is bare `rfl` — the kernel evaluates `rowCell 0 0` including `Int.decLe`, `Int.toNat` and `Nat.testBit 1 0` with no coaxing. Step is one line: `rw [rowCell_succ, ih (x-1), ih x, ih (x+1), evolve_succ, rule30_eq]`, and `rw`'s trailing rfl closes it. `evolve_succ`'s pattern `evolve (?t + 1)` does not match the `evolve t (x-1)` terms already on the left, since `t` is a variable, so no need to orient the rewrite carefully.

Size: the brief said L; it is M. Nothing here was hard once lemma 3 existed — the L estimate is presumably budgeting for someone who tries to case-split `rowCell`'s two-sided cone test on all four cells at once, which is 16 branches instead of 2.

## 2026-09-07T16:22:13Z — rightmost_difference_moves_right (sonnet, proved)

rightmost_difference_moves_right (sonnet, proved, two build cycles): straightforward induction on t, carrying the pair (difference at i+t, agreement right of i+t) as one conjunction so the step case can supply both halves of rule30_ne_of_left_ne's hypotheses (left = old difference, centre/right = IH's agreement one and two steps further right).

Two gotchas, both cast/defeq bookkeeping rather than content:

1. Base case `evolveFrom c 0 (i + ↑(0:ℕ)) ≠ evolveFrom d 0 (i + ↑(0:ℕ))` does NOT reduce under `simpa using hdiff` alone — `evolveFrom` is a plain `def` (`rule30^[t] c`), not a simp lemma, so `simp` won't unfold `rule30^[0] c` to `c` even though it's true by rfl (`Function.iterate` at 0 is `id` definitionally). Fix: `show c (i + ((0:ℕ):ℤ)) ≠ d (i + ((0:ℕ):ℤ))` first — this succeeds by defeq unification against the actual goal — then `simpa using hdiff` closes the remaining `i + ↑0 = i` normalization. General lesson: when a goal has `evolveFrom _ 0 _` or `evolveFrom _ 1 _` sitting where you expect the bare row, reach for `show` (leaning on defeq) rather than asking `simp`/`simpa` to unfold a `def`.

2. `ring` is NOT available with just `import Rule30.Basic` + a served proof-file import — it errored "unknown tactic" (would need `import Mathlib.Tactic.Ring`, confirmed present in LeftDiagonalPeriodicFromStep.lean's imports). Every arithmetic identity in this proof (`i + (n+1) - 1 = i + n`, `i + ((n:ℤ)+1) = i + ((n+1:ℕ):ℤ)` after `push_cast`) turned out to be closeable by bare `omega` instead, which is already transitively available (per Cadence's earlier notebook entry on evolve_right_second_diagonal) — so there was no need to add the Ring import at all. Prefer `omega` over `ring` for these Nat/Int-cast identities in this project; it's one import lighter and just as capable for anything that's actually linear.

The one substantive step, `rule30_ne_of_left_ne (evolveFrom c n) (evolveFrom d n) (i + ((n:ℤ)+1)) hl hc' hr'`, produces a Ne at position `i + ((n:ℤ)+1)`, which is NOT syntactically the goal's `i + ((n+1:ℕ):ℤ)` (one is a bare ℤ arithmetic expression, the other has the addition happening in ℕ before the cast). Rather than fight this with `convert`, state a one-line `ecast` equality between the two forms (`push_cast; omega`) and `rwa [ecast] at hne` — cleaner than `convert ... using 2 <;> push_cast <;> ring`, which was my first (working-but-uglier) attempt.

## 2026-09-07T20:04:00Z — column_one_of_white (sonnet, proved)

column_one_of_white (proved, one wasted build cycle): a previous attempt left a syntactically broken file (unclosed `show ... by` block) — worth reading first as the brief says, but it didn't build, so I rewrote from scratch rather than patch it.

Route: `unfold column evolveFrom at h ⊢` turns everything into `rule30^[t] X _` terms; `rw [Function.iterate_succ_apply']` turns `rule30^[t+1] X 0` into `rule30 (rule30^[t] X) 0` (available with zero extra import — `Mathlib.Logic.Function.Iterate` comes in transitively via Rule30.Basic). Then `sideways_inverse (rule30^[t] X) 0` gives `c(-1) = xor (rule30 c 0) (c 0 || c 1)`; `simp only [zero_sub, zero_add] at si` normalizes the index arithmetic (`0 - 1` to `-1`, `0 + 1` to `1`) — BOTH normalizations matter, not just `zero_sub`: skipping `zero_add` leaves `rule30^[t] X (0 + 1)` in `si` while the goal has the syntactically different `rule30^[t] X 1`, so a later `cases (rule30^[t] X 1)` only abstracts the goal's own occurrence and leaves the `si`-derived copy untouched, producing four unclosed `rfl` goals that look like a Bool-algebra mistake but are actually a term-matching mistake. Lesson: before `cases`/`generalize` on a term that appears via a rewritten hypothesis, normalize both sides to the same index arithmetic first, or the split silently misses occurrences that are defeq but not syntactically identical.

After `rw [h, Bool.false_or] at si` (h : c 0 = false, so the OR drops to just c 1) and `rw [si]` on the goal, the remaining identity is `b = xor a (xor a b)`, closed by `cases a <;> cases b <;> rfl` — no need for a named Mathlib lemma for xor self-cancellation; four-way case split is cheap enough here.
