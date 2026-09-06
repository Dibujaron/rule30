import Rule30.Basic
import Rule30.Proofs.BoolMapIterateThree

/-!
**What this says.** A one-bit machine that updates by `x(i+1) = xor(a i, b i or x i)`,
whose two drivers `a` and `b` both repeat with period `p` from `N` on, itself repeats
with period `2p`, but only once you are `p` steps past where the drivers settled down.
**Why it is true.** One cycle of `p` drivers is a fixed function of `Bool`, and once the
drivers are periodic that function is the same one cycle after cycle; three copies of it
in a row collapse to one copy, because every self-map of `Bool` does.
**Where the work is.** Building that "one cycle" map by hand as a fold over `p` update
steps, since the update at each step is a different function of the drivers there — then
showing the fold shifts by a whole cycle exactly when the drivers do.
-/

/-- One update step, as a function of the running bit, with `a i` and `b i` baked in. -/
private def stepMap (a b : ℕ → Bool) (i : ℕ) : Bool → Bool :=
  fun y => xor (a i) (b i || y)

/-- `n` update steps starting from index `i`, composed into a single function. -/
private def iterMap (a b : ℕ → Bool) (i : ℕ) : ℕ → Bool → Bool
  | 0 => id
  | n + 1 => stepMap a b (i + n) ∘ iterMap a b i n

private lemma iter_eq (a b x : ℕ → Bool)
    (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i)) :
    ∀ i n, x (i + n) = iterMap a b i n (x i) := by
  intro i n
  induction n with
  | zero => rfl
  | succ n ih =>
      show x (i + n + 1) = iterMap a b i (n + 1) (x i)
      have hstep := hrec (i + n)
      show x (i + n + 1) = stepMap a b (i + n) (iterMap a b i n (x i))
      rw [← ih]
      exact hstep

private lemma stepMap_shift (a b : ℕ → Bool) (p N : ℕ)
    (ha : ∀ i ≥ N, a (i + p) = a i) (hb : ∀ i ≥ N, b (i + p) = b i) :
    ∀ i ≥ N, ∀ j, stepMap a b (i + p + j) = stepMap a b (i + j) := by
  intro i hi j
  have hia : a (i + j + p) = a (i + j) := ha (i + j) (by omega)
  have hib : b (i + j + p) = b (i + j) := hb (i + j) (by omega)
  funext y
  show xor (a (i + p + j)) (b (i + p + j) || y) = xor (a (i + j)) (b (i + j) || y)
  rw [show i + p + j = i + j + p by omega, hia, hib]

private lemma iter_shift (a b : ℕ → Bool) (p N : ℕ)
    (ha : ∀ i ≥ N, a (i + p) = a i) (hb : ∀ i ≥ N, b (i + p) = b i) :
    ∀ i ≥ N, ∀ n, iterMap a b (i + p) n = iterMap a b i n := by
  intro i hi n
  induction n with
  | zero => rfl
  | succ n ih =>
      show stepMap a b (i + p + n) ∘ iterMap a b (i + p) n
          = stepMap a b (i + n) ∘ iterMap a b i n
      rw [ih, stepMap_shift a b p N ha hb i hi n]

theorem bool_driven_eventually_two_periodic (a b x : ℕ → Bool) (p N : ℕ)
    (hp : 0 < p) (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : ∀ i ≥ N, a (i + p) = a i) (hb : ∀ i ≥ N, b (i + p) = b i) :
    ∀ i ≥ N + p, x (i + 2 * p) = x i := by
  intro i hi
  obtain ⟨j, hij⟩ : ∃ j, i = j + p := ⟨i - p, by omega⟩
  have hjN : j ≥ N := by omega
  have hA : x (j + p) = iterMap a b j p (x j) := iter_eq a b x hrec j p
  have hB : x (j + p + p) = iterMap a b (j + p) p (x (j + p)) := iter_eq a b x hrec (j + p) p
  have hC : x (j + p + p + p) = iterMap a b (j + p + p) p (x (j + p + p)) :=
    iter_eq a b x hrec (j + p + p) p
  have hshift1 : iterMap a b (j + p) p = iterMap a b j p := iter_shift a b p N ha hb j hjN p
  have hshift2 : iterMap a b (j + p + p) p = iterMap a b j p := by
    have h := iter_shift a b p N ha hb (j + p) (by omega) p
    rw [h, hshift1]
  rw [hshift1] at hB
  rw [hA] at hB
  rw [hshift2] at hC
  rw [hB] at hC
  have h3 : iterMap a b j p (iterMap a b j p (iterMap a b j p (x j))) = iterMap a b j p (x j) := by
    have := congrFun (bool_map_iterate_three (iterMap a b j p)) (x j)
    simpa [Function.iterate_succ_apply', Function.iterate_zero_apply] using this
  rw [h3] at hC
  rw [← hA] at hC
  rw [hij]
  have heq : j + p + 2 * p = j + p + p + p := by omega
  rw [heq]
  exact hC
