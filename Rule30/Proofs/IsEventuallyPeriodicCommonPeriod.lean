import Rule30.Basic
import Rule30.Prize

/-!
**What this says.** Any two eventually periodic 0/1 sequences share a single period: pick `p*q`
where `p` and `q` are their own periods, and both settle into that combined rhythm from whichever
starting point is later.
**Why it is true.** A period of a sequence is still a period after you repeat it: if `f` returns
to itself every `p` steps, it also returns to itself every `k*p` steps, for any `k`. Take `k = q`
for `f` and `k = p` for `g`, and both land on the same combined period `p*q`.
**Where the work is.** That repeated-period fact isn't in the statement, so it needs its own
induction on the multiplier `k` — the rest is picking `max N1 N2` as the shared start and
`mul_comm` to line up `p*q` with `q*p`.
-/

private lemma iterate_period (h : ℕ → Bool) (p N : ℕ) (hp : ∀ n ≥ N, h (n + p) = h n) :
    ∀ k n, n ≥ N → h (n + k * p) = h n := by
  intro k
  induction k with
  | zero => intro n _; simp
  | succ k ih =>
    intro n hn
    have hnk : n + k * p ≥ N := by omega
    rw [show n + (k + 1) * p = n + k * p + p by ring, hp (n + k * p) hnk, ih n hn]

theorem isEventuallyPeriodic_common_period (f g : ℕ → Bool)
    (hf : IsEventuallyPeriodic f) (hg : IsEventuallyPeriodic g) :
    ∃ p > 0, ∃ N, (∀ n ≥ N, f (n + p) = f n) ∧ (∀ n ≥ N, g (n + p) = g n) := by
  unfold IsEventuallyPeriodic at hf hg
  obtain ⟨p, hp, N1, hN1⟩ := hf
  obtain ⟨q, hq, N2, hN2⟩ := hg
  refine ⟨p * q, Nat.mul_pos hp hq, max N1 N2, ?_, ?_⟩
  · intro n hn
    have hnN1 : n ≥ N1 := by omega
    rw [show p * q = q * p from mul_comm p q]
    exact iterate_period f p N1 hN1 q n hnN1
  · intro n hn
    have hnN2 : n ≥ N2 := by omega
    exact iterate_period g q N2 hN2 p n hnN2
