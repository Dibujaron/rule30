/-
# The three Rule 30 Prize conjectures

Stephen Wolfram announced these in October 2019, $10,000 each, all still open:

1. Does the center column always remain non-periodic?
2. Does each colour occur on average equally often in the center column?
3. Does computing the nth cell of the center column require at least
   O(n) computational effort?

Every statement in this file ends in `sorry`, and that is the intended state.
`sorry` is a hole that still typechecks — Kotlin's `TODO()`, except that it
never fails at runtime; it silently yields an unproved theorem. These three are
the *only* `sorry`s the project permits, and `npm run verify` enforces that.

Do not weaken a statement here to make it provable. A formalization that does
not match Wolfram's actual question is worse than none at all, because it
silently misdirects every solver downstream.
-/
import Rule30.Basic
import Mathlib.Analysis.SpecificLimits.Basic
import Mathlib.Data.Finset.Card

/-!
## P1 — Aperiodicity
-/

/-- A `Bool` sequence is **eventually periodic** when, from some point `N`
onwards, it repeats with some fixed period `p > 0`.

Note "eventually": the sequence is allowed an arbitrary finite prefix of
garbage first. This is strictly weaker than plain periodicity, so ruling it out
is strictly stronger — and it is what Wolfram's question asks, since a
center column that settled into a repeating tail after a million steps would
certainly count as "becoming periodic". -/
def IsEventuallyPeriodic (f : ℕ → Bool) : Prop :=
  ∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p) = f n

/-- **Rule 30 Prize, Question 1.**

*In plain English:* does the center column of rule 30 ever become periodic?
Wolfram conjectures no — it never repeats, no matter how far out you go and no
matter how long you are willing to wait for the repetition to start.

Formally: the center column is not eventually periodic. There is no period
`p > 0` and no starting point `N` such that `centerColumn (n + p) =
centerColumn n` for every `n ≥ N`.

Open problem — deliberately left unproved. -/
theorem centerColumn_not_eventually_periodic :
    ¬ IsEventuallyPeriodic centerColumn := by
  sorry

/-!
## P2 — Balance
-/

/-- The fraction of the first `N` center-column cells that are black.

`Finset.range N` is `{0, 1, …, N-1}`, `Finset.filter` keeps the black ones, and
`Finset.card` counts them; the result is cast into `ℝ` and divided by `N`.
`noncomputable` because real division is — Lean's `ℝ` is a genuine Cauchy-real
construction, not a float, so there is no algorithm to run.

At `N = 0` this is `0 / 0 = 0` in Lean (division by zero is *defined* to be
zero, it is not an error). That is harmless: the conjecture below is about the
limit as `N → ∞`, so no finite value affects it. -/
noncomputable def centerColumnDensity (N : ℕ) : ℝ :=
  (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) / (N : ℝ)

/-- **Rule 30 Prize, Question 2.**

*In plain English:* in the center column, does black occur just as often as
white in the long run? Count the black cells among the first `N`, divide by
`N`, and let `N` grow: Wolfram conjectures that ratio converges to exactly 1/2.

Formally: `centerColumnDensity` tends to `1/2` along `Filter.atTop`.
`Filter.Tendsto f atTop (nhds L)` is Mathlib's way of writing "f N → L as
N → ∞" — `atTop` is the filter of eventually-large `N`, `nhds L` the
neighbourhood filter of the limit. It unfolds to the usual ε–N definition.

Note this is a statement about *asymptotic* density only. It says nothing about
how fast the convergence is, and nothing about whether the sequence is
"random" in any stronger sense — normality, equidistribution of blocks, and
statistical independence are all separate (also open) questions.

Open problem — deliberately left unproved. -/
theorem centerColumn_density_tendsto_half :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) := by
  sorry

/-!
## P3 — Computational irreducibility

**READ THIS BEFORE USING THE STATEMENT BELOW.**
-/

/-- An abstract **cost model**: a type of programs, what each program computes,
and what each one costs on each input.

Everything about the model is data supplied by whoever instantiates it. In
particular `cost` is an *annotation*, not something derived from `output` —
nothing in this structure forces the cost of a program to have anything to do
with the work it actually does. That is the crux of the problem described on
`centerColumn_cost_at_least_linear`, and it is why that statement is gated
behind `IsFaithfulCostModel`. -/
structure CostModel where
  /-- The programs of the model. -/
  Program : Type
  /-- The bit that program `p` produces for input `n`. -/
  output : Program → ℕ → Bool
  /-- The effort program `p` spends on input `n`. -/
  cost : Program → ℕ → ℕ

/-- Program `p` is a correct algorithm for the center column: on every input
`n` it returns the `n`th center-column cell. -/
def CostModel.ComputesCenterColumn (M : CostModel) (p : M.Program) : Prop :=
  ∀ n, M.output p n = centerColumn n

/-- The cost of `p` grows at least linearly in the input: there is a constant
`k > 0` with `n ≤ k * cost p n` for all large `n`.

Stated this way round because `cost` lands in `ℕ`: `n ≤ k * cost p n` says
`cost p n ≥ n / k`, which is the Ω(n) bound with a constant that is allowed to
be fractional. Writing `c * n ≤ cost p n` with `c : ℕ` would instead demand a
constant of at least 1, which is a different (stronger) claim. -/
def CostModel.IsAtLeastLinear (M : CostModel) (p : M.Program) : Prop :=
  ∃ k > 0, ∃ N, ∀ n ≥ N, n ≤ k * M.cost p n

/-- Whether a cost model is a faithful account of real computational effort.

**Deliberately `opaque`: this predicate has no definition, and none is known.**
`opaque` gives a constant of the right type with no equations, so nothing about
`IsFaithfulCostModel M` can be proved or disproved for any particular `M`. That
is an accurate encoding of the situation — it is exactly the missing piece —
and it is a deliberate choice over the alternatives, both of which are worse:

* Dropping the hypothesis makes the conjecture **false**: instantiate
  `CostModel` with `output := fun _ => centerColumn` and `cost := fun _ _ => 0`
  and the linear lower bound fails immediately. A solver would "close" the node
  in ten minutes having proved nothing about rule 30.
* Making faithfulness a `Prop` *field* of `CostModel` is the same hole, since a
  degenerate model can simply supply `True`.

See `centerColumn_cost_at_least_linear` for what this costs us. -/
opaque IsFaithfulCostModel : CostModel → Prop

/-- **Rule 30 Prize, Question 3 — A FIRST APPROXIMATION ONLY. NOT READY TO BE
DISPATCHED AS A SOLVER GOAL. NEEDS EXPERT REVIEW BEFORE ANY MISSION BUILT ON IT
IS PUBLISHED.**

*In plain English:* is there any shortcut? To learn the `n`th center-column
cell you can always just run the automaton, which costs on the order of `n`
work. Wolfram conjectures you can never do fundamentally better — that rule 30
is *computationally irreducible*, and every correct algorithm needs at least
O(n) effort.

*What this statement says:* fix any cost model `M` that is a faithful account
of computational effort. Then every program of `M` that correctly computes the
center column has cost at least linear in `n`.

**What this formalization does capture.** The shape of the claim: a lower bound
holding uniformly over all correct algorithms, asymptotic, with an unspecified
positive constant. It correctly makes the bound universal over algorithms
rather than about one particular algorithm.

**What it does NOT capture, and this is the whole difficulty.**

1. *There is no machine model.* `CostModel.cost` is an uninterpreted function.
   Real "computational effort" is steps of a Turing machine, or operations of a
   RAM, or gates in a circuit — and the answer genuinely depends on which. The
   entire content of Wolfram's question lives in that choice, and this file
   makes no choice at all; `IsFaithfulCostModel` is a named hole standing where
   the choice belongs.

2. *Consequently the statement is currently vacuous, not open.* Because
   `IsFaithfulCostModel` is opaque, nobody can supply a model satisfying the
   hypothesis, so nobody can attack the conjecture — and equally nobody can
   accidentally trivialise it. It is a placeholder that will not mislead, not a
   working goal.

3. *The input encoding is unfixed and it matters enormously.* "O(n) effort to
   compute the nth cell" is linear in the **value** `n`, while `n` is written
   in only about `log n` bits. So the conjecture asserts a running time
   exponential in the input length. Any machine model chosen in step 1 must
   present `n` in binary or the claim collapses: with `n` in unary, reading the
   input already costs `n` and the bound is trivially true. (This is not
   hypothetical — Mathlib's `Nat.Partrec.Code.evaln` fuel measure has exactly
   this defect, `evaln_bound` forcing `n < k`, which is why it was not used
   here.)

4. *Non-uniformity is a real trap.* A circuit-size model is not a safe
   substitute: a circuit on `log n` input bits can compute *any* function of
   those bits in size `O(n / log n)`, which is below `c * n`, so the analogous
   circuit-size conjecture is outright **false**. Only a uniform, time-based
   model can express what Wolfram means.

5. *"At least O(n)" is Wolfram's informal phrasing for Ω(n)*, which is how it
   is read here. Whether he intends to also exclude, say, `n / log n`
   algorithms is a question for someone who knows the intended reading.

*The honest summary:* faithfully formalizing P3 requires committing to a
concrete uniform machine model with binary input encoding and a step-counted
cost — most plausibly building on Mathlib's `Turing.TM0`/`TM1`. That work has
not been done. Until it is, treat this declaration as documentation of the gap
rather than as a theorem anyone should try to prove.

Open problem — deliberately left unproved. -/
theorem centerColumn_cost_at_least_linear
    (M : CostModel) (hM : IsFaithfulCostModel M)
    (p : M.Program) (hp : M.ComputesCenterColumn p) :
    M.IsAtLeastLinear p := by
  sorry
