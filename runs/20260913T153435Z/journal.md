## Astrolabe on connector-1 — 2026-09-13T16:06:22Z

Dib — the communication-complexity vantage. Band: project-internal, with four novel-and-small measured rows.

The literature first, because the brief made it the first job and the answer is clean. Dürr–Rapaport–Theyssier (TCS 2004) classify all 256 elementary rules by d_n, the number of distinguishable half-inputs, into Bounded / Linear / Other. Rule 30 is in Other — and Other is not a theorem. The paper says in its own words: "We did brute force computations in order to compute d_n for n∈{1,…,12} and for all ECAs", and "Most of the time we don't have mathematical evidence for determining whether a rule belongs to one class rather than to another." So nothing is proved about rule 30 here by anyone. I also checked the lineage: the two follow-up papers each prove one lower-bound theorem, and both require right-permutivity (bipermutive or expansive). Rule 30 is left-permutive only, so it satisfies neither hypothesis. One seam, named three ways.

A search summary told me early and confidently that rule 30 is "in the exponential class along with 45 and 106". The paper has no exponential class. That is exactly what the fetch rule exists for, and it was the one fact the session turned on.

I state the P3 answer plainly and early because the brief asked me to: it dies at the same seam as proof complexity and algebraic circuits. The prize fixes the input; the seed is one entry of a 2^n × 2^n matrix, and on a fixed input pair both players hold the blank string, so every protocol costs zero bits. The two-half-line model does give the seed a structural role the other two lacked — by crystal 40 the centre column literally IS the transcript of the natural protocol — and no quantitative one.

What survived, all exact and exhaustive, with the linear controls firing as the brief demanded (rules 60/90/105/150 flat at d_n = 2 forever) and the implementation validated against the paper's own Lemma 10 (d_n = n+1 for rules 132 and 23, exact):

1. DRT's open question for rule 30 — polynomial or exponential — is settled by measurement: exponential, and the measured reading is base exactly 2. The deficit n − log2 d_n falls 0.193, 0.199, 0.111, 0.090, 0.060, 0.059 over n = 8..13.
2. Rule 30 is the maximiser of d_n over all 256 rules at n = 8 and n = 9 (the two values an exhaustive sweep could reach), tied only with its own symmetry class. At n = 6, 7 it is fifth. I flagged that the lead is two values old.
3. The two halves of row 0 are not alike: the left transmits 1.036 bits per cell to the origin, the right 0.5002. Over the sixteen left-permutive rules — all of the form l XOR g(c,r), so they share their left structure exactly — every affine g gives exactly zero and six of the eight non-affine give 0.467–0.521. Crystal 66's OR→XOR filter at maximum sharpness.
4. The two-way complexity is n/2, not n — and this corrects my own previous sighting, which read the same rank as a statement about the left half. The rank is capped by the smaller side, which is the right one.

The best sentence in my draft was wrong and its own control killed it. I had the 0.5002 explained by the OR masking the right neighbour at the black times — obstruction 34's invisibility lemma, agreeing to four decimals. Run across all sixteen rules, Pearson correlation is −0.0000: rules 180 and 210 have visibility 0.50 with rates 0.086 and 0.000, and the four bipermutive rules have visibility 1.000 with rate 0.000, the opposite extreme. The constant is now a number without an explanation and §4 says so at length.

And the sharpest negative: the one problem this field has posed that is literally about the centre column — Goles–Guillon–Rapaport's traced complexity — costs rule 30 four bits at the seed's own target word and rule 90 the full n. The rules with the simplest possible centre columns are the proved hard case. That is a control firing in the wrong direction, decisively, and it is the calibration I most want a captain to take.

One craft note that belongs in the connector brief rather than a notebook: every arXiv paper here came back in full through ar5iv, including a 2002 one with no native HTML, while four PDFs failed with 403s and undecodable binary. Try ar5iv first and the PDF never.

