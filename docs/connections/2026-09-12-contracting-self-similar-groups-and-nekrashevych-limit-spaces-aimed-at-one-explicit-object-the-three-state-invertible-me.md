# Sighting: contracting self-similar groups and Nekrashevych limit spaces

**Problem.** `centerColumn_other_isEventuallyPeriodic_of_center` — equivalently,
by the board's own note, Prize 1: the centre column of rule 30 is not
eventually periodic.

**Vantage.** Contracting self-similar groups, aimed at one explicit object: the
three-state invertible Mealy automaton `E` over two letters that generates the
right-diagonal tower, `q0 = (q0,q2)`, `q1 = σ(q0,q2)`, `q2 = σ(q1,q2)`.

**Connector.** Portage, 2026-09-12. Third sighting; it answers the bounded
question the second one handed on, and the answer is **no**.

**The short version.** The group is *not* contracting, so there is no nucleus,
no limit space, and no iterated-monodromy reading of rule 30's edge — the
certificate is that the nucleus contains at least 526,563 elements, every one
of them a section of a single explicit element, "the map that generates the
left half of row 20". Two premises the brief handed me are wrong and are
corrected here: the group is **not** `Z` (it is non-abelian with growth ratio
`≈ 4.15`), and the automaton **is** identifiable in the published enumeration —
it is number **5002** (symmetry-orbit minimum 2369), by a formula I fetched and
checked against two worked examples. The one thing of value that came out is
not in the vantage at all: the number of distinct sections of `E^t` is
`3, 7, 16, 35, 71, 141, 272, 517, …`, which is **exactly** obstruction 21's
reachable-row automaton size at all 20 values computed — the same machine seen
twice — which resolves the 517-against-532 discrepancy those two obstructions
left open, and makes obstructions 11 and 21 one obstruction.

Scripts, all under `explorer/` and all run:
`portage10_nucleus.mjs` (validation, the group, the nucleus closure),
`portage10_powers.mjs` (sections of `E^t`, strong connectivity),
`portage10_sections.mjs` (the section walk, length-8 words, relations, level images),
`portage10_relations.mjs` (involutions, the `t ≥ 1` identities, growth),
`portage10_family.mjs` (the same statistic across the family `X_b`),
`portage10_number.mjs` (the enumeration number),
`portage10_recur.mjs` (linear recurrence: none).

---

## 1. The problem, seen from outside

Take the set of infinite binary words `w = w_0 w_1 w_2 …` and the map

```
T(w)_k = w_k XOR (w_{k-1} OR w_{k-2}),      w_{-1} = w_{-2} = 0.
```

Digit `k` of the output depends only on digits `≤ k`, and on digit `k`
invertibly, so `T` is a bijection preserving every prefix length: an
automorphism of the infinite binary rooted tree. It is *finite-state* — the map
it induces below a vertex depends only on the last two letters of that vertex —
so three states suffice. Let `δ = 1 0 0 0 …`. The object in question is the
**diagonal of the orbit of `δ`**:

```
c(t) = (T^t δ)_t .
```

Every fixed digit is periodic in `t`, with period a power of two dividing `2^k`
and no transient at all, and those periods grow without bound. The diagonal
reads digit `t` at time `t`, so it steps out of every period it meets.
Measured to `10^7` terms, `c` is a fair coin by every statistic anyone has
tried. The open statement is that `c` is not eventually periodic.

*In the vantage's own terms.* `T` is the automorphism given by the three-state
invertible Mealy automaton `E` over `X = {0,1}` with wreath recursion
`q0 = (q0,q2)`, `q1 = σ(q0,q2)`, `q2 = σ(q1,q2)` and `T = q0`. Let
`G = ⟨q0,q1,q2⟩ ≤ Aut(X*)` be the self-similar group it generates, `g|_v` the
section of `g` at the vertex `v`, and `χ(g) ∈ Z/2` the root permutation. Then

```
c(t) = χ( q0^t |_{δ|_t} )        for every t ≥ 1
```

— the root label of the section of `q0^t` at the length-`t` prefix of `δ` —
and P1 asks whether that sequence of labels is eventually periodic. Rule 30's
picture is the orbit portrait of one element of `G` at one boundary point, and
P1 is a question about the diagonal of that portrait. (Verified: 0 failures
over `t = 1..17`, `explorer/portage10_relations.mjs` §2. At `t = 0` it fails and
must, because `δ_0 = 1`; the general form is `c(t) = δ_t XOR χ(s_t)`.)

Why this vantage. If `G` is **contracting** — if iterated section-taking pulls
every element into one finite set, the *nucleus* — then `G` has a **limit
space**, a compact metrisable model of the boundary dynamics, and the diagonal
above becomes a curve on an object with a geometry, an object nobody has
attached to rule 30. That is the gate to the whole Nekrashevych machinery, and
whether the gate is open is a finite computation.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Contracting self-similar groups (Nekrashevych) | `G = ⟨q0,q1,q2⟩`, rule 30's edge group | **Not contracting**: the nucleus contains ≥ 526,563 elements, all sections of one element (§3.1) |
| Limit spaces, iterated monodromy groups | `J_G`, a compact model of the boundary action; the centre column a curve on it | Needs a finite nucleus; dead at the first computation |
| The classification of groups generated by 3-state 2-letter automata | `E` is one of the 5832 labelled automata | It is **number 5002**, orbit minimum 2369 (§3.2); *which group* it generates is **UNVERIFIED** — the tables would not fetch |
| Bounded automata (Sidki), polynomial activity | Would force contraction | Every state of `E` is non-trivial, so the activity is `2^n` — the top of the hierarchy, the lamplighter's class |
| Automaton *semigroups*, the dual automaton | The dual of `E` is a 2-state automaton over the 3-letter alphabet `{q0,q1,q2}` | Not invertible (`q0` and `q1` share a section), so no bireversibility and no Aleshin-type freeness — but it is where `m(t)` lives (§6) |
| State complexity / Myhill–Nerode | `m(t)` = number of distinct sections of `E^t` | **`m(t)` is exactly obstruction 21's reachable-row automaton size**, `t = 1..20` (§3.3) |
| Synchronizing automata, Černý | The letter `1` sends all three states of `E` to `q2` — a reset word of length one | That reset **is** the board's black-time law `column_succ_of_black` (§3.1); it forces one cell and no more |
| Profinite groups, closure in `Aut(T_2)` | `⟨q0⟩`-closure procyclic; the orbit closure of `δ` an odometer | A *thin* odometer: order `2^8` at level 14 against an orbit of `64` |
| Hausdorff dimension of closed subgroups of `Aut(T_2)` (Abercrombie, Barnea–Shalev) | How much of the Sylow pro-2 group the edge fills | `|G_n| = 2^1, 2^3, 2^7, 2^13` against `|Aut(T_n)| = 2^1, 2^3, 2^7, 2^15`: full at levels 1–3, index 4 at level 4 |
| Toeplitz sequences, almost 1-1 extensions of odometers | The array `(t,k) ↦ (T^tδ)_k`, periodic in `t` at each fixed `k` | Killed in Portage's second sighting, `0/2000`; the centre column is the diagonal, and a diagonal is not a point |
| Self-similar actions of `Z`, virtual endomorphisms | Would reduce contraction to one integer `m`, contracting iff `|m| < 2` | **`G` is not `Z`** — the brief's own premise, refuted in §4 |
| Garden-of-Eden / preimage counting for CA | The `4^{-t}` sparsity of rows that are `t`-step images (obstruction 21) | Literally the same automaton as the sections of `E^t` (§3.3) |
| Decision problems for automaton groups (order, finiteness) | "Is `g` trivial?", "what is the order of `g`?" | Decidable here by minimisation, undecidable in general — so no generic machinery reaches a rule 30 question |
| Rational generating functions / transfer matrices | Would make `m(t)` satisfy a linear recurrence | None of order `≤ 8` fits, and the ratios *fall* (`1.7559 → 1.7281`): no finite linear system governs the growth (§4) |

---

## 3. Connections

### 3.1 Rule 30's right edge is an explicit non-contracting self-similar group, and the failure is not marginal

**The claim.** The whole right half of rule 30's picture is the orbit portrait
of one element of one explicit 3-state self-similar group; that group is not
contracting; therefore no limit space, no iterated monodromy reading and no
nucleus-driven word problem exists for rule 30's edge, and the certificate is a
single element of the group rather than a search.

**The dictionary.**

| Rule 30 | Self-similar groups | Checked |
|---|---|---|
| Row `t` read leftward from the right edge of the cone, `e(t)_k = evolve t (t-k)` | A point of the boundary `X^ω` of the binary rooted tree | 0 failures over 120,000 cells against a real triangle |
| The single seed | The boundary point `δ = 1000…` | by definition |
| One step of rule 30 | The tree automorphism `T = q0`, `w ↦ w XOR ((w<<1) OR (w<<2))` | 0 mismatches on all `2^18` words |
| The three-state automaton | `q0 = (q0,q2)`, `q1 = σ(q0,q2)`, `q2 = σ(q1,q2)` | as above; the mirror map fails at 22 of 40 rows |
| Depth `k` of the picture, i.e. `rightDiagonal k` | Level `k+1` of the tree | by definition |
| `rightDiagonal_periodicFrom_pow`: periods divide `2^k`, no transient | `q0` lies in the iterated wreath product `C_2 ≀ … ≀ C_2`, a finite 2-group at each level, and acts bijectively | orbit periods `1 2 2 4 8 8 16 32 32 64 …` |
| `rightDiagonal_period_unbounded` (proved) | `δ` is an **aperiodic point** of `q0`: its orbit is infinite | board theorem |
| **The centre column** `centerColumn t` | `χ(q0^t|_{δ|_t})`, the root label of the section along the seed ray | 0 failures, `t = 1..17` |
| The left half of row `t`, cells at `x ≤ 0` | `s_t(0^ω)` where `s_t = q0^t|_{δ|_t}` | 0 failures over 170 cells |
| The black-time law at the origin, `column_succ_of_black` | The letter `1` is a **reset word**: from every state, reading `1` lands in `q2`, whose root label is `σ` | verified: `q0\|_1 = q1\|_1 = q2\|_1 = q2`; it is why the tails `10` and `11` merge |
| `q1` as an object in its own right | `q0 q1^{-1}` is **exactly** the root transposition `σ`, so `q1 = σ q0` and `σ ∈ G` | verified by minimisation, `portage10_relations.mjs` §0 |
| Left diagonals with their power-of-two periods, the settled region, the seam, the damage front | **No reading.** `E` is built from the right edge inward and the left half of the picture appears only as the *image* `s_t(0^ω)`, never as a coordinate | — |
| Contraction, the nucleus, the limit space | **Absent.** `|nucleus| ≥ m(20) = 526,563` | §"the test" below |

**Seams.** (i) The whole left-hand vocabulary of this project — onsets,
transients, the seam at `0.25t`, the damage front — has no row in this table,
and that is the deepest seam: the vantage sees the picture only from the right.
(ii) `G` is not level-transitive; `δ`'s orbit at level 14 has 64 points while
`q0` has order 256 there, so `q0` is a *thin* element and the odometer one gets
is thin. (iii) The group is a *group*, and the residual is about one orbit read
on its diagonal; no invariant of `G` that I know of sees a diagonal.

**What it leans on.** The definitions, fetched at
<https://arxiv.org/html/2405.17695>: *"A self-similar action (G,A) is called
contracting (or hyperbolic) if there exists a finite set 𝒩⊂G such that for
every g∈G there exists k∈ℕ such that g|v∈𝒩 for all words v∈A\* of
length≥k."*; *"The minimal set with this property is called the nucleus of the
self-similar action… the nucleus is unique and is defined by:
𝒩:=⋃g∈G⋂n≥0{g|v; v∈A\*,|v|≥n}."*; and *"The limit space of the self-similar
action denoted by 𝒥G is the quotient of the topological space A^ω by the
asymptotic equivalence relation ∼."* The same page states that the limit space
has finite topological dimension **iff** the group has a finite non-empty
nucleus, which is why non-contraction closes the route rather than merely
complicating it.

**The test.** `explorer/portage10_powers.mjs`. The nucleus is a union of
*deep* sections, so for any single `g` the states of `g`'s minimal transducer
that lie on a cycle are all in the nucleus. Computed: the minimal transducer of
`E^t` has `m(t) = 3, 7, 16, 35, 71, 141, 272, 517, 971, 1792, 3263, 5873,
10483, 18619, 32885, 57741, 100901, 175680, 304714, 526563` states for
`t = 1..20`, it is **strongly connected at every one of those `t`** (one SCC),
so *every* state is a deep section. Hence `|nucleus| ≥ 526,563`, certified by
the single element `E^20`. Independently, `explorer/portage10_nucleus.mjs` closes the nucleus from
the generators instead: the deep sections of the ball of radius `r` number
`7, 25, 77, 214, 554` for `r = 1..5` — reproducing obstruction 11's
`7 → 25 → 214` at `r = 1, 2, 4` from code that shares nothing with
`nucleus_*.cjs`. **To kill this connection**, exhibit a finite section-closed
set containing all deep sections of `E^t` for every `t`; the computation says
there is none below 526,563, and the growth `≈ 1.73^t` shows no sign of
stopping.

**What it would give.** It gives a closure, not an advance: it removes the
limit space, the `C*`-algebra, the iterated-monodromy reading and the
contracting word problem from the board's menu. It is also a small *fence*
worth stating positively: the sections of the `t`-step edge map are `1.73^t`
distinct group elements, so **no bounded-memory description of "what rule 30
does below a vertex after `t` steps" exists** — which is the same wall
obstruction 21 hit from the preimage side (§3.3).

---

### 3.2 The automaton has a name in the published enumeration: it is number 5002

**The claim.** Rule 30's right edge is one of the 5832 labelled three-state
two-letter automata that Bondarenko, Grigorchuk, Kravchenko, Muntyan,
Nekrashevych, Savchuk and Šunić classified, and it is number **5002** in their
enumeration — so whatever their tables say about 5002 (or about the smallest
member 2369 of its symmetry orbit) is a published fact about rule 30's edge.

**The dictionary.**

| Rule 30 | The enumeration | Checked |
|---|---|---|
| The edge automaton `E` | The labelled automaton with `a = (a,c)`, `b = σ(a,c)`, `c = σ(b,c)` for `(a,b,c) = (q0,q1,q2)` | §3.1 |
| Its number | `Number = (a₁₂−1) + 3(a₁₃−1) + 9(a₂₂−1) + 27(a₂₃−1) + 81(a₃₂−1) + 243(a₃₃−1) + 729(a₁₁+2a₂₁+4a₃₁) + 1` = `0 + 6 + 0 + 54 + 81 + 486 + 729·6 + 1` = **5002** | formula reproduces automata 739 and 741 exactly |
| Relabelling states, swapping letters, inverting states | The symmetry group of the enumeration | orbit computed: `2369, 2407, 2609, 2625, 2693, 2731, 2771, 2787, 3738, 3756, 3858, 3876, 3904, 3922, 4184, 4202, 4520, 4522, 4664, 4666, 4800, 4804, 4998, 5002`; **minimum 2369** |
| The group `G` | One of the ≤ 122 groups in the classification | **UNVERIFIED** — see below |

**Seams.** The number depends on a labelling, and the letter order `(0,1)`
against `(1,0)` is one of their symmetries, so the honest object is the
24-element orbit above; a reader looking it up should search all 24. And the
number is where the connection stops: it says *where to look*, not what is
there.

**What it leans on.** The formula, fetched at
<https://ar5iv.labs.arxiv.org/html/math/0612178>:
*"Number(𝒜)=(a₁₂−1)+3(a₁₃−1)+9(a₂₂−1)+27(a₂₃−1)+81(a₃₂−1)+243(a₃₃−1)+729(a₁₁+2a₂₁+4a₃₁)+1"*,
with `a_ij ∈ {1,2,3}` for `j ≠ 1` and `a_i1 ∈ {0,1}`; and the worked example on
the same page, *"Automaton 739: a=σ(a,a) b=(b,a) c=(a,a)"*, generating
`C₂⋉(C₂≀ℤ)`. The size of the problem, fetched at
<https://ar5iv.labs.arxiv.org/html/0704.3876>: *"We note that there are
2³×3⁶=5832 different (labeled) automata on three states acting on two letters.
Obvious symmetries such as permutation of states, permutation of letters, and
inversion of states, together with minimization, reduces the number of automata
that needs to be checked to 194"*. The count of groups, fetched at
<https://admjournal.luguniv.edu.ua/index.php/adm/article/view/805>: *"We show
that the class of groups generated by 3-state automata over a 2-letter alphabet
has no more than 122 members."* The classification itself is
<https://arxiv.org/abs/0803.3555>, whose abstract page fetched and whose
**tables did not**: `ar5iv` returns *"Conversion to HTML had a Fatal error"*
for it, and every arXiv PDF returned undecodable binary. So **which** of the
122 groups is number 5002 is **UNVERIFIED**: I searched `arxiv.org` (abs, pdf,
`ar5iv` for `0803.3555`, `0704.3876`, `math/0612178`), the ADM journal page,
and the `AutomGrp` GAP package repository (no classification data file in
`gap/`), and the tables are in none of the readable ones.

**The test.** A fingerprint a theorist (or anyone with the paper) can match
against a candidate row, all computed here: `G` is non-abelian; the three
generators pairwise fail to commute; `q0 q1^{-1} = σ` exactly, the root
transposition, so `q1 = σ q0` and `G ∋ σ`; `(q1 q2^{-1})² = 1` while
`q0 q2^{-1}` has order 4; `u = q0q1^{-1}` and `v = q1q2^{-1}` generate a
dihedral group of order 8 (`(uv)⁴ = 1`, `u` and `v` do not commute); the ball
sizes in `{q0^{±1}, q1^{±1}, q2^{±1}}` are `7, 33, 143, 602, 2514, 10454,
43408` (spheres `6, 26, 110, 459, 1912, 7940, 32954`, ratio `→ 4.15`, against
`5` for a free group of rank 3); the level-`n` images have order
`2^1, 2^3, 2^7, 2^13` where `Aut(T_n)` has `2^1, 2^3, 2^7, 2^15`; `G` is not
contracting; `E` is not reversible. **To kill it**: any published property of
automaton 5002 or 2369 that contradicts one of those.

**What it would give.** Nothing about P1 directly. It converts "rule 30's edge
generates some self-similar group" into a citation, so that a theorem in that
literature about this group — amenability, a presentation, the word problem's
complexity — becomes a theorem about rule 30's right edge for free. It is the
cheapest row in the document to check and the only one that connects the
project to a named object in a classified list.

---

### 3.3 The sections of `E^t` and obstruction 21's reachable rows are the same automaton — which settles the board's open 517-against-532

**The claim.** The number of distinct sections of the `t`-step edge map and the
state complexity of "which rows are `t`-step images of a finite configuration"
are the same integer at every `t`; obstruction 11 ("not contracting") and
obstruction 21 ("a finite automaton for each `t`, and no uniform one") are one
obstruction seen from two sides; and the discrepancy sextant9 left open —
its 517 against obstruction 11's 532 at `ℓ = t = 8` — is resolved in favour of
both, because the two numbers count different things.

**The dictionary.**

| Obstruction 21 (preimages) | This vantage (sections) | Checked |
|---|---|---|
| Reading a row right-to-left, carrying `t` backward-solve levels | Reading a vertex `v` letter by letter, carrying the state of `E^t` | the two transition functions are the same map: sextant9's `aNew = aPrev ^ (a \| b)` is rule 30's leftward recursion, and so is the section update |
| The carried state: two cells per level, `t` levels | The section `E^t|_v`: the last two cells of each of the `t` intermediate rows | `3^t` raw states in both, minimising to the same count |
| Minimal DFA size at depth `t`: `3, 7, 16, 35, 71, 141, 272, 517, 971, 1792, 3263, 5873, 10483, 18619, 32885, 57741, 100901, 175680, 304714, 526563` | `m(t)` = states of the minimal transducer of `E^t` | **identical at all 20 values** |
| "No uniform automaton for the reachable set" | "The group is not contracting" | sextant9 conjectured the implication; the two are the *same number* |
| Obstruction 11's `35, 532, 5873, 57741, 175680` at `ℓ = 4, 8, 12, 16, 18` | The **maximum over 12 random words** of length `ℓ` of the deep-section count — not `m(ℓ)` | read from `explorer/nucleus_bound3.cjs`; over 3000 random words of length 8 the counts run `1 … 634` and include `523, 532, 598, 634`, while `E^8` gives `517` |

**Seams.** (i) The two automata are not literally the same object: sextant9's
has an acceptance condition (is the row a `t`-step image of a *finite*
configuration?) and mine has an output bit, and that the two minimisations
agree at 20 consecutive values is measured, not proved. (ii) The identity is an
identity of *complexities*, and neither side is about the centre column.

**What it leans on.** The board's own obstruction 21 and its script, re-run
here for the numbers rather than trusted from the text
(`node explorer/sextant9_automaton2.mjs`: minimal sizes
`3, 7, 16, 35, …, 304714, 526563` at `t = 1..20`), and obstruction 11's script
`explorer/nucleus_bound3.cjs`, read rather than paraphrased — its own header
says it takes the *"best (over 12 random words of each length) number of
distinct DEEP SECTIONS of a single element"*. No outside citation.

**The test.** `explorer/portage10_powers.mjs` computes `m(t)` from the wreath
recursion by product construction and Moore minimisation, sharing no code with
either board script; the two lists agree at `t = 1..20`, `526563` at the far
end on both sides. **To kill it**: a `t` where they differ — the first
untested value is `t = 21`, and both sides are cheap there.

**What it would give.** It merges two entries of the obstruction file, and it
tells a future session that improving either one is improving both. It also
fixes a number that would otherwise be cited wrongly: the sequence indexed by
`t` is `m(t)`, and obstruction 11's list is a sample maximum whose `ℓ = 8`
entry is a lucky draw, not a competing measurement of the same quantity.

---

### 3.4 The left half of row `t` is a group element, and its complexity is the same for every configuration

**The claim.** For every configuration white at every `x ≥ 1`, the left half of
row `t` is the image of the all-white ray under an explicit element
`s_t = T^t|_{w|_t}` of `G`, and the centre column is that element's root label;
but the state complexity of `s_t` is `m(t)` for *every* such configuration, so
this whole family of statistics is blind — a fourth death of the shape
obstruction 20 asked for, and this one is an equality rather than a
resemblance.

**The dictionary.**

| Rule 30 | This vantage | Checked |
|---|---|---|
| A configuration white at every `x ≥ 1` (crystal 40's `X_b`) | Its row 0 read leftward, a boundary point `w ∈ X^ω` | by construction |
| Its whole picture | The orbit `T^t w` | the recursion is the rule, `w_{-1} = w_{-2} = 0` is "white outside the cone" |
| Row `t`, positions `t … 1` | The prefix `(T^t w)|_t` | — |
| Row `t`, positions `0, -1, -2, …` | `s_t(w_t w_{t+1} …)` for `s_t = T^t\|_{w\|_t}` — the section applied to what is left of `w`. For the seed that tail is white and it reads `s_t(0^ω)`; for a general configuration it is not | 0 failures over 170 cells (seed) |
| `centerColumn t` | `w_t XOR χ(s_t)` | 0 failures over 18 rows for **each** of nine configurations, and `t = 1..17` for the seed |
| One step down the picture | `s_{t+1} = u_t · (s_t|_{w_t})`, `u_t ∈ {q0,q1,q2}` chosen by `(cell(t,0), cell(t,1))` | 0 failures against `E^{t+1}` rebuilt from scratch, `t ≤ 13` |
| The complexity of row `t`'s left half | `|s_t|`, states of the minimal transducer | `1, 3, 7, 16, 35, …` = `m(t)` |
| **A statistic separating the seed from a periodic centre column** | **None here**: `|s_t|` is `m(t)` for the seed, for `b = 1^∞, (10)^∞, (1000)^∞, (11010)^∞, (1110011000)^∞, (110)^∞, 0^∞` and for a coin boundary — identical, digit for digit, to `t = 18` | `explorer/portage10_family.mjs` |

**Seams.** The blindness has a mechanism, which is why it is a fence and not a
coincidence: the minimal transducer of `E^t` is **strongly connected** (one SCC
at every `t ≤ 20`), so all `m(t)` of its sections are distinct elements and
every one of them has the same minimal transducer — the section at *any*
vertex has `m(t)` states, so `|s_t|` cannot depend on which vertex the
configuration picks out. The second seam: `s_t` itself is not blind — it is a
different group element for different configurations, and it determines the
left half exactly. Only its *size* is constant. The third seam is a warning
about the sweep itself: because every section has `m(t)` states, the nine
identical rows would have come out identical **even if I had built the nine
configurations wrongly**. What rules that out is a separate check, run
alongside — the walk reproduces each boundary, `c(t) = w_t XOR χ(s_t)`, 0
failures over 18 rows for every one of the nine. Without that check the sweep
would have been a measurement of nothing, and it would have looked the same.

**What it leans on.** Nothing outside; the board's crystal 40 (every `Bool`
sequence is the centre column of a configuration white at `x ≥ 1`) is what
makes the family the right one to sweep.

**The test.** `explorer/portage10_family.mjs`: build `X_b` (column 1 from the
right half-line, row 0 from the sideways solve), run the section recursion, print
`|s_t|`. Nine configurations, `t = 1..18`, all identical. **To falsify the
mechanism**: a `t` at which `E^t`'s minimal transducer has more than one
strongly connected component — then sections at different vertices would have
different sizes and the statistic would carry information again.

**What it would give.** It closes a family of proposals in advance. Anyone
proposing "measure the complexity of the map that generates the left half and
show it is smaller when the centre column repeats" is refuted before the
details: that number is `m(t)` for every configuration, including the all-white
one. Obstruction 20 asked for a third death of that shape and got one; this is
the fourth, and unlike the others it is exact.

---

## 4. Died in translation

- **The vantage itself: `G` is contracting.** Dead at the first computation:
  the deep sections of balls of radius `1..5` number `7, 25, 77, 214, 554` and
  the deep sections of the single element `E^20` number `526,563`. The nucleus
  is a union of deep sections, so all of those are in it. Seam: every state of
  `E` is non-trivial, so the activity is `2^n` — `E` is as far from Sidki's
  bounded automata as a 3-state automaton gets.
- **`G ≅ Z`** — the brief's "known already and not to be re-derived", and it
  came from my own second sighting, where the claim was about `⟨E⟩`, the cyclic
  group generated by *one* element. `⟨q0,q1,q2⟩` is a different group and it is
  non-abelian: all three commutators are non-trivial, and the ball sizes are
  `7, 33, 143, 602, 2514, 10454, 43408`, growth ratio `≈ 4.15`. Seam: the
  states of an automaton generate a group, and one of them generates another.
  **This is the exact failure my notebook exists to catch, made by me, in a
  handoff I wrote.**
- **The virtual-endomorphism shortcut.** If `G` had been `Z`, the self-similar
  action would be given by one integer `m` (the image of `g²` under
  `h ↦ h|_0`), and contraction would be `|m| < 2` — a two-line answer. Dead
  with the premise. Recorded because it is the right first move *if* a future
  automaton's group is cyclic.
- **A limit space for rule 30.** Dead with contraction, and by the fetched
  equivalence (finite topological dimension of `J_G` **iff** finite nucleus)
  there is no weakened version to fall back on.
- **The dual automaton as a bireversible object.** The dual of `E` is a 2-state
  automaton over `{q0,q1,q2}`, and it is not invertible: from letter `0` both
  `q0` and `q1` have section `q0`. So `E` is not reversible, no Aleshin-type
  free-group machinery applies, and the dual generates a semigroup rather than
  a group. (The semigroup is still where `m(t)` lives — §6.)
- **`m(t)` has a rational generating function.** `explorer/portage10_recur.mjs`:
  no linear recurrence with constant coefficients of order `≤ 8` fits, each
  order tested with two spare equations; and the ratios *fall* steadily,
  `1.7559, 1.7475, 1.7411, 1.7345, 1.7281`, so a clean exponential is itself
  doubtful at this range. Seam: the state set is not generated by a finite
  transfer matrix, which is the same reason the group has no nucleus.
- **The centre column as a statistic of the group.** Every invariant of `G` I
  could compute — growth, relations, level-`n` image orders, the nucleus's
  failure to exist — is an invariant of the *automaton*, and the automaton is
  the same for every configuration white to the right. The residual is about
  which *orbit* and which *diagonal*, and the group cannot see either.
- **`|s_t|` as a separating statistic (§3.4).** Died at nine configurations
  including the all-white one, with the same 18 numbers each.
- **Identifying the group in the classification.** Not dead, *unreached*: the
  formula fetched and the tables did not. Every arXiv PDF returned undecodable
  binary, `ar5iv` fails on `0803.3555` itself with a fatal conversion error,
  OEIS returned `403` to two different query forms, and the GAP `AutomGrp`
  package ships no classification data file. **So the sequence `3, 7, 16, 35,
  71, 141, 272, 517, …` was never checked against OEIS: UNVERIFIED.**
- **The nucleus as a word-problem engine.** In a contracting group the nucleus
  decides the word problem in linear time. Here the word problem is still
  decidable — minimal transducers are canonical, which is what every equality
  in this document rests on — but the cost is the transducer size, and that is
  `1.73^t` for `E^t`. Seam: decidable is not the same as cheap, and this is the
  group-theoretic face of P3's irreducibility question rather than P1's.
- **Level-transitivity.** `q0` is not level-transitive (order `2^8` at level 14
  against `δ`'s orbit of 64), so the standard odometer theorems do not apply to
  it, only to its restriction to `δ`'s orbit closure. Confirms my second
  sighting rather than adding to it.
- **Hausdorff dimension as a discriminator.** Computable in principle, and the
  first four levels give `2^1, 2^3, 2^7, 2^13` against `2^1, 2^3, 2^7, 2^15` —
  i.e. `G` is *all* of `Aut(T_n)` for `n ≤ 3`. The level-5 image exceeds
  `3·10^6` and my breadth-first enumeration stops there; a Schreier–Sims
  implementation would push it, and the quantity is an invariant of the group,
  which §4's fifth entry already says cannot see the residual. Left undone on
  purpose.
- **Nothing died for lack of depth**, and two things nearly died for the
  opposite reason: the identical `|s_t|` across nine configurations looked
  exactly like a bug that ignores its input, and was believed only after two
  separate checks — the strong-connectivity count, which *explains* why it must
  be identical, and the boundary check `c(t) = w_t XOR χ(s_t)` (0 failures ×
  nine configurations), which shows the input was not in fact ignored; and
  `m(t)` matching obstruction 21 at
  20 values looked like a transcription error until sextant9's own script was
  re-run and printed the same list.

---

## 5. What to hand the theorist

**Topic 1 — the fence, and it is the one with a proof in reach.** *Every
section of `E^t` has the same minimal transducer size, so no "complexity of the
left half" statistic can separate the seed from a configuration with a periodic
centre column.* The claim to falsify: **the minimal transducer of `E^t` is
strongly connected for every `t`.** In the project's own vocabulary, with no
group theory in it: the state of the leftward recursion over `t` stacked rows
is the pair of last two cells on each row, and the claim is that **any such
`t`-level state can be driven to any other by appending cells** — a
controllability statement about rule 30's own recursion, measured true for
`t ≤ 20` (one SCC, `explorer/portage10_powers.mjs`). The dictionary row it
depends on is §3.4's last two rows. What it buys: obstruction 20's shape gets
its fourth and sharpest death, as a theorem rather than a sweep, and a whole
family of future proposals is refused in advance. Band, stated first as the
project asks: **project-internal** — it says nothing new about rule 30 and it
closes a route.

**Topic 2 — the merge, which costs an hour and not a session.** Obstructions 11
and 21 are the same obstruction: `m(t)`, the section growth of the edge
automaton, *is* the reachable-row automaton's size, at all 20 values computed
and at `t = 20` on both sides. Obstruction 11's `ℓ`-indexed list is a maximum
over 12 random words and its `532` at `ℓ = 8` is not a competing value for
`m(8) = 517` — over 3000 random words I see `523, 532, 598, 634`, so 532 is one
draw among many. Someone with write access to the obstruction file should say
so in both entries; **a future session will otherwise cite 532 as the value of
a function that does not take it.** Band: **project-internal**, a correction to
the record.

**What I would *not* spend a session on.** Anything downstream of the limit
space; the virtual endomorphism; the group's growth, presentation or Hausdorff
dimension. All of them are invariants of the automaton, and the automaton is
shared by every configuration in crystal 40's family, so by §3.4's own argument
none of them can reach P1.

---

## 6. Next vantage

**The dual automaton, and the theory of automaton semigroups.** Everything that
mattered in this document is a statement about `m(t) ≈ 1.73^t`, and `m(t)` is
not naturally a group quantity at all: it is the size of the orbit of the word
`q0^t` under the *dual* automaton of `E` — a 2-state machine over the
three-letter alphabet `{q0,q1,q2}`, acting on words by a right-to-left sweep
that is rule 30 in disguise. Automaton semigroups are a live field with its own
classification of the two-state case, its own decision problems, and its own
growth theory, and the object it would be handed is small, explicit and finite
at every level. The specific questions to carry there: is the orbit-growth
exponent of a two-state automaton semigroup ever known in closed form, and is
there a reason `m(t)` has no linear recurrence? That vantage is one step from
where I stood and I could not take it, because the whole session went into the
group and the group was the wrong object.

**The vantage I could not reach from here** is **amenability and random walks
on `G`** — specifically, Kaimanovich's and Bartholdi–Virág's machinery for
automaton groups, which studies exactly the object §3.4 produces: a walk
`s_{t+1} = u_t·(s_t|_0)` in a self-similar group whose steps are chosen by the
walk's own output. Rule 30's centre column *is* the root-label sequence of a
self-driving walk in an explicit 3-generated group, and the field that studies
walks on such groups has never been pointed at a walk that reads its own
labels. I do not know whether anything there survives the self-driving, which
is exactly why it wants a connector who knows that literature rather than one
who has just met it. Two concrete things to hand them: the recursion above
(verified, 0 failures to `t = 13`), and the fact that the group is *not*
contracting, which is precisely the hypothesis most of that machinery assumes —
so the first question is which of its theorems survive without it.
