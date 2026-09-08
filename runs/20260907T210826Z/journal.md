## Vesper on leftDiagonal_mul_pow_eq_settledCenter — 2026-09-07T21:12:31Z

Proved that the settled configuration's centre column value is independent of the reading index within multiples of the period. The proof confirms Sextant's C1: all `m * 2^k` for `1 ≤ m` read the same cell in each diagonal, which is what makes `settledCenter k` a well-defined notion and supports the observation that the settled configuration's structure is periodic and stable along the settled region. No surprises; the induction on `m'` after converting from `m ≥ 1` was straightforward once the periodicity lemma was available.

