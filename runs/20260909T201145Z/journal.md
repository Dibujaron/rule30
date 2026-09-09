## Vernier on connector-1 — 2026-09-09T20:38:42Z

Dib — Vernier, connector, on the P1 frontier from the T-function vantage.

The reformulation handed to me this afternoon is real and it travels. Rule 30's row map, written as an integer operation, is T(r) = 4r XOR (2r OR r) — three machine instructions, no carries. That is exactly a "T-function": bit i of the output reads only bits i, i−1, i−2, so it descends to a map on n-bit words for every n. Kernel-checked dictionary rows (explorer/vernier_scratch_tfunc.lean, accepted): the centre column is bit_t of T^t(1), and left diagonal k is bit_k of the orbit delayed by k. So the residual reads, with no automaton in it: every column of this map's orbit matrix is eventually periodic — is the diagonal?

Fields sighted: 13. Connections built: 6. Died in translation: 13.

The negative first, because it is the vantage's main finding and it is cheap to state. The T-function field's whole decision apparatus returns NO for this map in two bits: T is the identity mod 2 (so never a single cycle) and T(1) ≡ T(3) mod 4 (so never invertible). Anashin's Theorem 5.2, which I fetched and quoted, says measure-preservation IS bijectivity mod 2^n and ergodicity IS transitivity mod 2^n — so every criterion in that literature, including the 2011 van der Put ones, is vacuous here. Both normal forms die by measurement too: the algebraic normal form of the t-step centre bit has maximal degree at 21 of 23 depths with monomial density 0.53, and the Mahler expansion is dense (255 nonzero of the first 257) sitting at the extreme edge of what a 1-Lipschitz map is allowed. Klimov and Shamir's own generator has a three-term Mahler expansion, which is precisely why their machinery computes on it and not on this. That answers the brief's third question in the negative, twice, with data.

Two things the vantage does give, and both are for a theorist.

First, the onset wall becomes a statement about the depth of a finite graph — and the strengthened version, quantified over every start rather than the seed, is true and comfortable. Worst tail 39 where 60 is allowed, exhaustive over all 2^31 starts, no violation. The naive induction is already dead in writing: maxTail(n+1) ≤ maxTail(n) + 2 fails at n = 18 → 19, so any proof has to be amortized. That is obstruction 6's failure seen in a setting where a retreat costs nothing, which is a different shape of induction to try.

Second, and this is the one I would show first: NKS p. 871's doubling positions 3, 8, 29, 400, 87867 are first-appearance moduli. a(d)+1 is the least n at which T mod 2^n has a cycle of length 2^d, and at that n the cycle is unique. I made that prediction from n ≤ 29 — where the attractor had been growing by exactly one 4-cycle per level for twenty levels — and it held: at n = 30, and not before, a single 8-cycle appeared and the 4-cycle count stopped. n = 30 is k = 29, the third doubling. The attractor grows by exactly the current cycle length per level, exception-free for 5 ≤ n ≤ 31.

On "is this map already in the literature", asked plainly as the brief instructs: the rows-as-integers sequence is OEIS A110240 in the mirror bit order (verified through MathWorld's citation), the centre column is A051023, and eight web searches found no paper treating rule 30's row map as a T-function, a 1-Lipschitz map on the 2-adics, or an n-bit word operation with a cycle structure. That is a negative search result and I have written it as one, not as a novelty claim. OEIS itself returned 403 to two fetches, so I could not read A110240's own comment lines — marked UNVERIFIED in the document, as is NKS p. 871 itself, which the project holds only in quotation.

Two places I corrected myself rather than smoothing over. The brief's "constant return period of 16" is a plateau of a step function, not a constant — it becomes 32 at k = 87867, and the kernel file shows period 4 working to k = 28 and failing exactly at 29. And the attractor's size, 4n − 18, breaks at n = 30, where it jumps to 106; the growth law that survives is the one about the cycle length, not the linear formula.

What I would spend a theorist's session on is the first of the two: the all-starts tail bound. It implies the onset wall, mentions no seed and no damage front, and has a computable falsifier at every n.

