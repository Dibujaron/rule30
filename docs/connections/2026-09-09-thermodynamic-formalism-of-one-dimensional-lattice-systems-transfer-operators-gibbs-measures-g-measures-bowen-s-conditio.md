# Sighting — `centerColumn_other_isEventuallyPeriodic_of_center` from the
# thermodynamic formalism of one-dimensional lattice systems

*Parallax, 2026-09-09. Vantage: transfer operators, Gibbs measures, g-measures,
Bowen's condition, the pressure function — and, because the vantage forced it,
algorithmic randomness.*

*Status: in progress. Sections 1 and 2 are current; 3 to 6 are being filled as
dictionaries are built and broken.*

---

## 1. The problem, seen from outside

Take the two-letter alphabet `{0,1}` and the map that sends a bi-infinite row
of letters to a new row by the local rule `new(i) = old(i−1) XOR (old(i) OR
old(i+1))`. Start from the row that is `1` at the origin and `0` everywhere
else, apply the map for ever, and read the letter at the origin at each time.
That gives one specific infinite binary sequence, entirely explicit — a short
program prints any prefix. **The question is whether that sequence is
eventually periodic.** Everything measured says no: the first `10^9` terms
contain no repetition, the sequence passes the standard statistical batteries,
and its factor complexity is near maximal. Nothing proved says no.

The residual as this project's board carries it is an implication — "if the
origin's sequence repeats then some other column's does" — but the board's own
theorem that no two columns can both repeat collapses that implication to its
negated hypothesis. So there is one statement here and no reduction of it: **the
origin's sequence is not eventually periodic.**

**In the vantage's own terms.** The map is a surjective endomorphism of the full
2-shift, so it preserves the unique measure of maximal entropy, the
`(1/2,1/2)` Bernoulli measure `μ` — the Gibbs state of the zero potential at
inverse temperature zero. Under `μ`, the sequence read at the origin is almost
surely not eventually periodic, almost surely normal, almost surely
incompressible: every one of the three prize conjectures is a theorem about the
ensemble, and each is trivial. The object the prize asks about is not a `μ`-typical
point. It is one named point, the delta mass at a configuration of finite
support. **So the question, in this field's language, is: is that one point
*generic* for `μ` — do its Birkhoff averages along the time direction converge
to the integrals against `μ`, and does it avoid the (null, but non-empty, dense,
full-dimensional) set of points where periodicity happens?** The thermodynamic
formalism is the one branch of dynamics whose business is manufacturing
individual-orbit statements out of an ensemble. This document asks whether its
bridges reach this point, and finds — with a proof, not a shrug — that the two
strongest of them provably cannot.

---

## 2. Fields sighted

*(being filled)*

---

## 3. Connections

*(being filled)*

---

## 4. Died in translation

*(being filled)*

---

## 5. What to hand the theorist

*(being filled)*

---

## 6. Next vantage

*(being filled)*
