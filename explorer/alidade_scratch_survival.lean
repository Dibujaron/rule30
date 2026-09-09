import Rule30.Basic

/-!
The front's survival law, as Boolean algebra, checked by the kernel.

Two rows `c` (the picture) and `d` (the settled background) that agree at
`i - 1` and are opposite at `i` — which is exactly the situation at the left
front of the damage band, where `i` is the leftmost disagreement — send their
disagreement at `i` one step down according to a law that reads only three
cells. Written `e = xor (c (i+1)) (d (i+1))` for the band's next cell,

    xor (rule30 c i) (rule30 d i) = xor (! d (i+1)) (d i && e).

Two corollaries fall out and are the ones that matter. If the background's own
cell at `i` is white, or if the band's next cell agrees with the background,
then the survival of the front cell is `! d (i+1)`: it is decided by the
background alone, with no reference to the picture. Measured on the seed
against its settled picture, one of those two holds on 76.9% of rows
(`explorer/alidade_survival.mjs`, 10^6 rows).

Run with `lake env lean explorer/alidade_scratch_survival.lean`.
-/

theorem front_survival (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) :
    xor (rule30 c i) (rule30 d i)
      = xor (! d (i + 1)) (d i && xor (c (i + 1)) (d (i + 1))) := by
  rw [rule30_eq, rule30_eq, hl, hc]
  clear hl hc
  cases d (i - 1) <;> cases d i <;> cases c (i + 1) <;> cases d (i + 1) <;> rfl

/-- If the background is white at `i`, the front cell's fate is the background's
cell at `i + 1`, complemented — the picture is not consulted. -/
theorem front_survival_of_white (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) (h0 : d i = false) :
    xor (rule30 c i) (rule30 d i) = ! d (i + 1) := by
  rw [front_survival c d i hl hc, h0]
  cases d (i + 1) <;> cases c (i + 1) <;> rfl

/-- If the band's next cell agrees with the background — the leading block of
the band has length one — the same conclusion holds whatever the background is
at `i`. -/
theorem front_survival_of_agree (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) (h1 : c (i + 1) = d (i + 1)) :
    xor (rule30 c i) (rule30 d i) = ! d (i + 1) := by
  rw [front_survival c d i hl hc, h1]
  cases d i <;> cases d (i + 1) <;> rfl

#print axioms front_survival
#print axioms front_survival_of_white
#print axioms front_survival_of_agree
