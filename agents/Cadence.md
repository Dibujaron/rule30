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
