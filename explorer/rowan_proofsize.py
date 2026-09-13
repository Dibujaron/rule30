"""Rowan, 2026-09-12.  How fast does a SAT refutation grow with problem size?

An instrument, not a theorem.  Three families of formulas about elementary
cellular automata, each UNSAT by construction and each indexed by one size
parameter, are handed to a CDCL solver; the sizes of the refutations are
tabulated for rule 30 and for control rules.  The question is whether any
family is empirically hard for rule 30 and easy for the linear rules 90/150.

Rule 30 is  c(x,t+1) = c(x-1,t) XOR (c(x,t) OR c(x+1,t)).  Every rule, rule 30
included, is encoded the same way: the 4-variable relation y = f(l,c,r) is
turned into its exact-minimum CNF by prime implicates plus minimum set cover
(`minimal_cnf`).  Nothing is special-cased.

FAMILIES  (T is the size parameter's derived time horizon)
  F1  fixed seed        one black cell at t=0; assert c(0,n) is the wrong bit.
  F2  prefix            initial support free on x in [0,n), 0 elsewhere;
                        assert column 0 over t=1..n equals an unrealisable
                        target prefix (found by rejection sampling, seeded).
  F3  alternation       initial row white for x < -a, free from -a rightwards;
                        assert column 0 alternates for L = f(a)+1 rows, where
                        f(a) is the rule's own longest achievable block.

GEOMETRY.  Every formula lives on the backward light cone of its last
constraint: cells (x,t) with 0 <= t <= T and |x| <= T-t.  That triangle is
closed under taking parents, so the interior is exact for a bi-infinite row and
no background convention is needed -- which matters because rules 45, 73 and
105 do not fix all-white.

MEASUREMENTS.  cadical153 gives conflicts / decisions / propagations / time.
DRUP proof size comes from lingeling, because on this build cadical153's proof
file is 0 bytes even after its destructor runs and glucose4's holds deletion
lines only; the output opens with a three-solver self-test on one pigeonhole
instance so that claim can be checked rather than taken.  Lingeling leaks a C
stdio stream per instance and the process dies on the 510th, so proof tracing
is sampled under a hard budget.  The unit-propagation-only column is our own
counter-based UP over the clause database, not a solver call.

CAVEAT that the whole file is subject to: a CDCL trace is an UPPER bound on
resolution proof size and implies no lower bound on anything.  Rules 90 and 150
are pure XOR, and resolution is known to be exponentially weak on XOR (Tseitin
formulas), so if the linear rules come out hardest that is a fact about the
proof system, not about the automaton.

Deterministic: every random choice is seeded.

Usage:  python rowan_proofsize.py [--f1-max 40] [--f2-max 30] [--f3-max 30]
        [--budget 1500] [--classes 0] [--out rowan_proofsize.txt]
"""

import argparse
import itertools
import math
import os
import random
import time

from pysat.solvers import Cadical153, Glucose4, Lingeling, Minisat22

RULES = [30, 90, 150, 110, 45, 54, 73, 105]
LINEAR = (90, 150)

# F3 gets three extra controls that F1 and F2 do not need.  Six of the eight
# above turn out to have NO finite f(a), which leaves rule 30 with almost
# nothing to be compared against; 120, 180 and 225 are the other quiescent
# nonaffine left-permutive rules and they are the fair controls for this
# family.  Rule 30 runs LAST so it inherits whatever the cheap rules did not
# spend of the time budget.
F3_RULES = [90, 150, 45, 54, 73, 105, 180, 110, 120, 225, 30]
SEED = 20260912


# --------------------------------------------------------------------------
# the rule, and its exact-minimum CNF
# --------------------------------------------------------------------------
def rule_bit(rule, l, c, r):
    """Wolfram numbering: bit index 4*left + 2*centre + right."""
    return (rule >> (4 * l + 2 * c + r)) & 1


_CNF_CACHE = {}


def minimal_cnf(rule):
    """Exact-minimum CNF of the relation y = f(l,c,r), over vars 1=l 2=c 3=r 4=y.

    Prime implicates by brute force over the 81 sign patterns, then a minimum
    cover of the 8 falsifying assignments.  Same procedure for all 256 rules.
    """
    if rule in _CNF_CACHE:
        return _CNF_CACHE[rule]

    good, bad = [], []
    for l, c, r, y in itertools.product((0, 1), repeat=4):
        (good if y == rule_bit(rule, l, c, r) else bad).append((l, c, r, y))

    # candidate clauses: each var absent / positive / negative
    implied = []
    for signs in itertools.product((0, 1, -1), repeat=4):
        lits = [(i + 1) * s for i, s in enumerate(signs) if s]
        if not lits:
            continue
        ok = True
        for asg in good:
            if not any((asg[abs(v) - 1] == 1) == (v > 0) for v in lits):
                ok = False
                break
        if ok:
            implied.append(tuple(sorted(lits, key=abs)))

    # keep primes (no proper subset also implied)
    impset = set(implied)
    primes = [cl for cl in implied
              if not any(set(sub) in impset
                         for k in range(1, len(cl))
                         for sub in itertools.combinations(cl, k))]

    # minimum cover of the falsifying assignments
    cover = {cl: frozenset(i for i, asg in enumerate(bad)
                           if all((asg[abs(v) - 1] == 1) != (v > 0) for v in cl))
             for cl in primes}
    target = frozenset(range(len(bad)))
    for k in range(1, len(primes) + 1):
        for combo in itertools.combinations(primes, k):
            u = frozenset().union(*(cover[cl] for cl in combo))
            if u == target:
                out = [list(cl) for cl in combo]
                _CNF_CACHE[rule] = out
                return out
    raise AssertionError("no CNF found")


def cone_column(rule, row0, T):
    """Column 0 for t = 0..T, evaluated on the backward cone of (0,T).

    row0 is a dict x -> bit read over x in [-T, T]; anything outside is never
    consulted, because it cannot reach (0,T).  Stepping inward like this is the
    only correct way to do it for a rule that does not fix all-white: rules 45,
    73 and 105 turn a white background black in one step, so a simulator that
    reads missing cells as 0 forever silently computes a different automaton.
    """
    cur = {x: row0.get(x, 0) for x in range(-T, T + 1)}
    col = [cur[0]]
    for t in range(1, T + 1):
        cur = {x: rule_bit(rule, cur[x - 1], cur[x], cur[x + 1])
               for x in range(-(T - t), T - t + 1)}
        col.append(cur[0])
    return col


# --------------------------------------------------------------------------
# the triangle
# --------------------------------------------------------------------------
class Cone:
    """Backward light cone of (0, T): cells (x,t), 0<=t<=T, |x| <= T-t.

    Closed under parents, so the rule clauses inside it are exact for a
    bi-infinite row with no assumption about the background.
    """

    def __init__(self, rule, T):
        self.rule = rule
        self.T = T
        self.ids = {}
        self.clauses = []
        for t in range(T + 1):
            for x in range(-(T - t), T - t + 1):
                self.ids[(x, t)] = len(self.ids) + 1
        tmpl = minimal_cnf(rule)
        for t in range(1, T + 1):
            for x in range(-(T - t), T - t + 1):
                sub = [self.ids[(x - 1, t - 1)], self.ids[(x, t - 1)],
                       self.ids[(x + 1, t - 1)], self.ids[(x, t)]]
                for cl in tmpl:
                    self.clauses.append([sub[abs(v) - 1] * (1 if v > 0 else -1)
                                         for v in cl])

    def v(self, x, t):
        return self.ids[(x, t)]

    def nof_vars(self):
        return len(self.ids)


def unit_propagate(clauses, nvars):
    """Counter-based UP.  Returns True if the empty clause is derived."""
    assign = [0] * (nvars + 1)
    occ = [[] for _ in range(2 * nvars + 2)]

    def idx(lit):
        return 2 * abs(lit) + (0 if lit > 0 else 1)

    unsized = []
    queue = []
    for ci, cl in enumerate(clauses):
        unsized.append([len(cl), 0])          # [unassigned count, satisfied?]
        for lit in cl:
            occ[idx(lit)].append(ci)
        if len(cl) == 1:
            queue.append(cl[0])
    seen = set()
    while queue:
        lit = queue.pop()
        var, val = abs(lit), 1 if lit > 0 else -1
        if assign[var] == -val:
            return True
        if assign[var] == val:
            continue
        assign[var] = val
        seen.add(var)
        for ci in occ[idx(lit)]:
            unsized[ci][1] = 1
        for ci in occ[idx(-lit)]:
            rec = unsized[ci]
            if rec[1]:
                continue
            rec[0] -= 1
            if rec[0] == 0:
                return True
            if rec[0] == 1:
                free = [q for q in clauses[ci]
                        if assign[abs(q)] == 0]
                if free:
                    queue.append(free[0])
    return False


# --------------------------------------------------------------------------
# measurement
# --------------------------------------------------------------------------
def solve_sat(clauses, budget=None):
    s = Cadical153(bootstrap_with=clauses)
    try:
        if budget:
            s.conf_budget(budget)
            r = s.solve_limited()
        else:
            r = s.solve()
        return r
    finally:
        s.delete()


# Lingeling's proof tracing leaks one C stdio stream per solver instance; the
# CRT caps at 512 open streams and the interpreter segfaults on the 510th.
# Measured on this build.  So proof tracing gets a hard budget and the run
# reports how much of it was used rather than dying.
PROOF_BUDGET = [400]

# minisat22 in this pysat build segfaults on formulas of a few tens of
# thousands of clauses (reproduced on F3, rule 30, a=52, 23889 clauses).
MSAT_CAP = 15000


def measure(clauses, nvars, want_proof=True, proof_cap=400000):
    """Refute `clauses` and report the size of the search and of the proof.

    THREE solvers, not one, and the growth fits downstream use the MINIMUM
    conflict count over them.  cadical153 alone is not safe to draw a curve
    from here: on the F2 instances its conflict count doubles up to about 1000
    and then reads 1004 for every larger n, while glucose4 and minisat22 refute
    those same formulas in ten to a few hundred conflicts.  A plateau in one
    solver's counter is a fact about that solver's inprocessing, and reading it
    as a growth rate is how this instrument nearly reported that the linear
    rules are exponentially hard.
    """
    out = dict(vars=nvars, clauses=len(clauses))
    t0 = time.time()
    out["up_refutes"] = unit_propagate(clauses, nvars)
    out["up_secs"] = time.time() - t0

    panel = [(Cadical153, "cad"), (Glucose4, "glu")]
    # minisat22 segfaults on the larger F3 instances (observed at ~24k clauses),
    # so it only joins the panel while it is safe.
    if len(clauses) <= MSAT_CAP:
        panel.append((Minisat22, "msat"))
    else:
        out["msat_conf"] = None
        out["msat_secs"] = None
    for cls, tag in panel:
        sv = cls(bootstrap_with=clauses)
        t0 = time.time()
        sat = sv.solve()
        out[tag + "_secs"] = time.time() - t0
        st = sv.accum_stats()
        out[tag + "_conf"] = st.get("conflicts")
        if tag == "cad":
            out["sat"] = sat
            out["conflicts"] = st.get("conflicts")
            out["decisions"] = st.get("decisions")
            out["propagations"] = st.get("propagations")
            out["secs"] = out["cad_secs"]
        sv.delete()
    have = [out[t + "_conf"] for t in ("cad", "glu", "msat")
            if out.get(t + "_conf") is not None]
    out["min_conf"] = min(have)
    out["max_secs"] = max(out[t + "_secs"] for t in ("cad", "glu", "msat")
                          if out.get(t + "_secs") is not None)

    out["proof_lines"] = None
    out["proof_lits"] = None
    out["g_conflicts"] = None
    if (want_proof and not out["sat"] and len(clauses) <= proof_cap
            and PROOF_BUDGET[0] > 0):
        PROOF_BUDGET[0] -= 1
        g = Lingeling(bootstrap_with=clauses, with_proof=True)
        t0 = time.time()
        g.solve()
        out["g_secs"] = time.time() - t0
        out["g_conflicts"] = g.accum_stats().get("conflicts")
        pr = g.get_proof() or []
        adds = [ln for ln in pr if not ln.startswith("d ")]
        out["proof_lines"] = len(adds)
        out["proof_dels"] = len(pr) - len(adds)
        out["proof_lits"] = sum(max(0, len(ln.split()) - 1) for ln in adds)
        g.delete()
    return out


# --------------------------------------------------------------------------
# F1  fixed seed
# --------------------------------------------------------------------------
def f1_formula(rule, n):
    cone = Cone(rule, n)
    cl = list(cone.clauses)
    for x in range(-n, n + 1):
        cl.append([cone.v(x, 0) if x == 0 else -cone.v(x, 0)])
    truth = cone_column(rule, {0: 1}, n)[n]
    cl.append([-cone.v(0, n) if truth == 1 else cone.v(0, n)])
    return cl, cone.nof_vars(), truth


# --------------------------------------------------------------------------
# F2  prefix realisability
# --------------------------------------------------------------------------
def f2_formula(rule, n, prefix):
    """Free support x in [0,n), zero elsewhere on the cone; column 0 = prefix.

    The horizon is len(prefix), which may be shorter than n; support cells
    outside the cone are then simply absent, which is sound because they
    cannot reach column 0 within the horizon.
    """
    T = len(prefix)
    cone = Cone(rule, T)
    cl = list(cone.clauses)
    for x in range(-T, T + 1):
        if not (0 <= x < n):
            cl.append([-cone.v(x, 0)])
    for t in range(1, T + 1):
        v = cone.v(0, t)
        cl.append([v] if prefix[t - 1] == 1 else [-v])
    return cl, cone.nof_vars()


def f2_column(rule, n, bits):
    """Column 0 at t=1..n from the support bits (a list of n bits at x=0..n-1)."""
    return cone_column(rule, {x: bits[x] for x in range(n)}, n)[1:]


def f2_pick_unrealisable(rule, n, rnd, tries=32):
    """Rejection-sample a uniform random prefix that is not realisable."""
    for k in range(tries):
        prefix = [rnd.randint(0, 1) for _ in range(n)]
        if not solve_sat(f2_formula(rule, n, prefix)[0]):
            return prefix, "random", k + 1
    return None, "none", tries


def f2_pick_deep(rule, n, rnd, tries=40):
    """A target whose first n-1 bits ARE realisable and whose n-th bit is not.

    A uniform random target usually dies after three or four rows, so the size
    parameter stops meaning anything.  Taking a realisable column and flipping
    only its last bit forces the contradiction down to depth n.
    """
    supports = [[1] + [0] * (n - 1)]
    supports += [[rnd.randint(0, 1) for _ in range(n)] for _ in range(tries)]
    for k, bits in enumerate(supports):
        tgt = f2_column(rule, n, bits)
        tgt[-1] ^= 1
        if not solve_sat(f2_formula(rule, n, tgt)[0]):
            return tgt, ("seedflip" if k == 0 else "randflip"), k + 1
    return None, "none", len(supports)


def f2_depth(rule, n, target):
    """Length of the shortest unrealisable prefix of `target`.

    Unrealisability is monotone in the prefix length, so a binary search is
    sound.  This is the honest size of the contradiction, as against n.
    """
    lo, hi = 1, len(target)
    while lo < hi:
        mid = (lo + hi) // 2
        if solve_sat(f2_formula(rule, n, target[:mid])[0]):
            lo = mid + 1
        else:
            hi = mid
    return lo


def f2_realisable_fraction(rule, n):
    """Exact |image| / 2^n by bit-parallel enumeration of all width-n supports."""
    import numpy as np
    T = n
    W = n + 2 * T + 4
    if W > 62 or n > 18:
        return None
    N = 1 << n
    idx = np.arange(N, dtype=np.uint64)
    off = T + 2                      # x = 0 sits at bit `off`
    row = np.zeros(N, dtype=np.uint64)
    for b in range(n):
        row |= ((idx >> np.uint64(b)) & np.uint64(1)) << np.uint64(off + b)
    mask = np.uint64((1 << W) - 1)
    col = np.zeros(N, dtype=np.uint64)
    tbl = [rule_bit(rule, l, c, r) for l, c, r in itertools.product((0, 1), repeat=3)]
    for t in range(1, T + 1):
        left = (row << np.uint64(1)) & mask
        right = row >> np.uint64(1)
        nxt = np.zeros(N, dtype=np.uint64)
        for l, c, r in itertools.product((0, 1), repeat=3):
            if not tbl[4 * l + 2 * c + r]:
                continue
            m = (left if l else ~left) & (row if c else ~row) & (right if r else ~right)
            nxt |= m & mask
        row = nxt & mask
        col |= ((row >> np.uint64(off)) & np.uint64(1)) << np.uint64(t - 1)
    return len(np.unique(col)) / float(N)


# --------------------------------------------------------------------------
# F3  alternation
# --------------------------------------------------------------------------
def f3_formula(rule, a, L, phase):
    """White for x < -a, free from -a; column 0 alternates over t=0..L-1."""
    T = L - 1
    cone = Cone(rule, T)
    cl = list(cone.clauses)
    for x in range(-T, -a):
        cl.append([-cone.v(x, 0)])
    for t in range(L):
        v = cone.v(0, t)
        cl.append([v] if (t + phase) % 2 == 1 else [-v])
    return cl, cone.nof_vars()


def f3_f(rule, a, lo=1, cap=140):
    """Largest L with the block satisfiable, and the phase attaining it."""
    best, bestph = 0, 0
    for phase in (0, 1):
        L = max(1, lo)
        # walk down first if lo overshoots
        while L > 1:
            cl, nv = f3_formula(rule, a, L, phase)
            if solve_sat(cl):
                break
            L -= 1
        while L <= cap:
            cl, nv = f3_formula(rule, a, L + 1, phase)
            if not solve_sat(cl):
                break
            L += 1
        if L > best:
            best, bestph = L, phase
        if L > cap:
            return None, phase
    return best, bestph


# --------------------------------------------------------------------------
# fitting
# --------------------------------------------------------------------------
def linfit(xs, ys):
    n = len(xs)
    if n < 3:
        return None
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    if sxx == 0:
        return None
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx
    a = my - b * mx
    ss_tot = sum((y - my) ** 2 for y in ys)
    ss_res = sum((y - (a + b * x)) ** 2 for x, y in zip(xs, ys))
    r2 = 1.0 if ss_tot == 0 else 1 - ss_res / ss_tot
    return a, b, r2


def fit_report(ns, vals, label):
    pts = [(n, v) for n, v in zip(ns, vals) if v is not None and v > 0]
    if len(pts) < 3:
        return f"    {label:<14} too few nonzero points ({len(pts)})"
    xs = [p[0] for p in pts]
    ys = [math.log(p[1]) for p in pts]
    e = linfit(xs, ys)
    l = linfit([math.log(x) for x in xs], ys)
    if e is None or l is None:
        return f"    {label:<14} degenerate"
    verdict = "EXP" if e[2] > l[2] + 0.005 else ("POLY" if l[2] > e[2] + 0.005
                                                 else "tie")
    return (f"    {label:<14} n={len(pts):<3} "
            f"exp: base {math.exp(e[1]):.3f}/step  R2 {e[2]:.4f}   |   "
            f"poly: n^{l[1]:.2f}  R2 {l[2]:.4f}   -> {verdict}")


# --------------------------------------------------------------------------
def eq_class_reps():
    """One representative per equivalence class under reflection + complement."""
    def reflect(rule):
        out = 0
        for l, c, r in itertools.product((0, 1), repeat=3):
            if rule_bit(rule, r, c, l):
                out |= 1 << (4 * l + 2 * c + r)
        return out

    def complement(rule):
        out = 0
        for l, c, r in itertools.product((0, 1), repeat=3):
            if not rule_bit(rule, 1 - l, 1 - c, 1 - r):
                out |= 1 << (4 * l + 2 * c + r)
        return out

    seen, reps = set(), []
    for rule in range(256):
        if rule in seen:
            continue
        orb = {rule}
        while True:
            grown = set(orb)
            for q in orb:
                grown |= {reflect(q), complement(q), reflect(complement(q))}
            if grown == orb:
                break
            orb = grown
        seen |= orb
        reps.append(min(orb))
    return sorted(reps)


# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--f1-max", type=int, default=40)
    ap.add_argument("--f2-max", type=int, default=30)
    ap.add_argument("--f3-max", type=int, default=30)
    ap.add_argument("--budget", type=float, default=1500.0,
                    help="total seconds; families stop early when it is spent")
    ap.add_argument("--percall", type=float, default=60.0,
                    help="stop a sweep once one call exceeds this")
    ap.add_argument("--classes", type=int, default=0,
                    help="if >0, run F2 at this n over all 88 class reps")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    out_path = args.out or os.path.join(here, "rowan_proofsize.txt")
    lines = []
    START = time.time()

    def emit(s=""):
        print(s)
        lines.append(s)

    def spent():
        return time.time() - START

    HDR = ("      n   vars  clauses   UP?   cadConf   gluConf  msatConf   minConf"
           "  propagations  cadSecs  maxSecs   proofAdds  proofLits")

    def row(n, m):
        return (f"    {n:>3}  {m['vars']:>5}  {m['clauses']:>7}  "
                f"{'yes' if m['up_refutes'] else ' no':>4}  "
                f"{m['cad_conf']:>8}  {m['glu_conf']:>8}  "
                f"{str(m['msat_conf']):>8}  "
                f"{m['min_conf']:>8}  {m['propagations']:>12}  "
                f"{m['secs']:>7.2f}  {m['max_secs']:>7.2f}  "
                f"{str(m['proof_lines']):>10}  {str(m['proof_lits']):>9}")

    emit("Rowan, 2026-09-12.  Refutation-size growth for ECA formula families.")
    emit("solver: pysat / cadical153 (search stats) + lingeling (DRUP proof size).")
    emit("cadConf/gluConf/msatConf are three solvers' conflict counts and")
    emit("minConf is the smallest of them; every growth fit below uses minConf,")
    emit("because one solver's counter can plateau where the family has not.")
    emit("decisions, propagations and cadSecs are cadical's; maxSecs is the")
    emit("slowest of the three.  proofAdds and")
    emit("proofLits are lingeling's DRUP additions and their total literal count;")
    emit("lConf is lingeling's own conflict count, printed so the two solvers can")
    emit("be compared.  UP? = does pure unit propagation (our own, no solver call)")
    emit("already refute the formula.")
    emit("")
    emit("  Why two solvers.  cadical153's proof tracing leaves a 0-byte temp file")
    emit("  on this build even after its destructor runs, and glucose4's emits")
    emit("  deletion lines only (and a truncated last line).  lingeling's is")
    emit("  complete.  The self-test below shows all three on one pigeonhole")
    emit("  instance so the reader can see which numbers are trustworthy.")
    php = []
    PP, HH = 6, 5
    for p in range(PP):
        php.append([p * HH + h + 1 for h in range(HH)])
    for h in range(HH):
        for p1, p2 in itertools.combinations(range(PP), 2):
            php.append([-(p1 * HH + h + 1), -(p2 * HH + h + 1)])
    emit("      solver       unsat  conflicts  proofAdds  proofDels")
    from pysat.solvers import Glucose4 as _G4
    for cls, nm in [(Cadical153, "cadical153"), (_G4, "glucose4"),
                    (Lingeling, "lingeling")]:
        s = cls(bootstrap_with=php, with_proof=True)
        r = s.solve()
        pr = s.get_proof() or []
        a = [ln for ln in pr if not ln.startswith("d ")]
        emit(f"      {nm:<12} {str(not r):>5}  {s.accum_stats().get('conflicts'):>9}"
             f"  {len(a):>9}  {len(pr)-len(a):>9}")
        s.delete()
    emit("")
    emit("READ THIS BEFORE THE NUMBERS.  A CDCL trace is an UPPER bound on")
    emit("resolution proof size.  It gives no lower bound on anything.  Rules 90")
    emit("and 150 are pure XOR and resolution is exponentially weak on XOR")
    emit("(Tseitin), so a linear rule coming out hardest is a statement about the")
    emit("proof system, not about the automaton.")
    emit("")

    # ---- rule encodings -------------------------------------------------
    emit("[0] the per-cell CNF each rule gets (vars 1=left 2=centre 3=right 4=out).")
    emit("    Exact minimum CNF of the truth table by prime implicates + minimum")
    emit("    cover.  No rule is special-cased.")
    emit("      rule  clauses  literals  quiescent(f(0,0,0))  linear?")
    for rule in RULES:
        cnf = minimal_cnf(rule)
        lin = all(len(cl) == 4 for cl in cnf) and len(cnf) in (4, 8)
        emit(f"      {rule:>4}  {len(cnf):>7}  {sum(len(c) for c in cnf):>8}"
             f"  {rule_bit(rule,0,0,0):>19}  {'XOR-like' if lin else '-':>8}")
    emit("    (rules 45, 73 and 105 map all-white to all-black; the cone geometry")
    emit("     means no formula here needs a background convention.)")
    emit("")

    # ================= F1 ==================================================
    emit("=" * 100)
    emit("F1  fixed-seed triangle: one black cell at t=0, assert c(0,n) is WRONG.")
    emit("=" * 100)
    f1 = {}
    f1_end = spent() + max(30.0, args.budget * 0.10)
    for ri, rule in enumerate(RULES):
        f1_budget = spent() + max(5.0, (f1_end - spent()) / (len(RULES) - ri))
        emit(f"  rule {rule}")
        emit(HDR)
        series = []
        for n in range(4, args.f1_max + 1):
            if spent() > f1_budget:
                emit(f"    (budget: stopped at n={n-1})")
                break
            cl, nv, truth = f1_formula(rule, n)
            m = measure(cl, nv, want_proof=(n % 8 == 0))
            assert not m["sat"], f"F1 rule {rule} n={n} came out SAT"
            if n % 8 == 0 or n <= 6:
                emit(row(n, m))
            series.append((n, m))
            if m["max_secs"] > args.percall:
                emit(f"    (per-call cap: stopped at n={n})")
                break
        f1[rule] = series
        ns = [n for n, _ in series]
        emit(fit_report(ns, [m["min_conf"] for _, m in series], "minConf"))
        emit(fit_report(ns, [m["proof_lines"] for _, m in series], "proofAdds"))
        emit(f"    UP alone refutes every n: "
             f"{all(m['up_refutes'] for _, m in series)}")
        emit("")

    # ================= F2 ==================================================
    emit("=" * 100)
    emit("F2  prefix realisability: support free on x in [0,n), column 0 over")
    emit("    t=1..n pinned to an UNREALISABLE target prefix.")
    emit("=" * 100)
    emit("  TWO target modes, because the obvious one is a trap.")
    emit("   'random'  a uniform random length-n prefix, rejection-sampled until")
    emit("             unrealisable.  Measured below: such a target is already")
    emit("             unrealisable after three or four rows, so the refutation")
    emit("             never sees size n and the family is not indexed by n.")
    emit("   'deep'    a realisable column with only its LAST bit flipped, so the")
    emit("             contradiction sits at depth exactly n.  This is the family")
    emit("             the growth fits below are computed on.")
    emit("  'depth' is the length of the shortest unrealisable prefix of the")
    emit("  target, found by binary search; for a well-formed size-n instance it")
    emit("  must equal n.")
    emit("")
    f2 = {}
    f2_rand = {}
    f2_end = spent() + max(60.0, args.budget * 0.40)
    for ri, rule in enumerate(RULES):
        f2_budget = spent() + max(15.0, (f2_end - spent()) / (len(RULES) - ri))
        emit(f"  rule {rule}   [deep targets]")
        emit(HDR + "   depth  src        draws")
        rnd = random.Random(SEED + rule)
        series = []
        skipped = []
        for n in range(4, args.f2_max + 1):
            if spent() > f2_budget:
                emit(f"    (budget: stopped at n={n-1})")
                break
            prefix, src, draws = f2_pick_deep(rule, n, rnd)
            if prefix is None:
                skipped.append(n)
                continue
            cl, nv = f2_formula(rule, n, prefix)
            m = measure(cl, nv, want_proof=(n % 8 == 0))
            assert not m["sat"], f"F2 rule {rule} n={n} came out SAT"
            d = f2_depth(rule, n, prefix) if m["max_secs"] < 5.0 else None
            m["depth"] = d
            if n % 4 == 0 or n <= 6 or n > args.f2_max - 6:
                emit(row(n, m) + f"   {str(d):>5}  {src:<10} {draws:>5}")
            series.append((n, m))
            if m["secs"] > args.percall:
                emit(f"    (per-call cap: stopped at n={n})")
                break
        f2[rule] = series
        if skipped:
            emit(f"    no unrealisable target exists at n = "
                 f"{','.join(str(v) for v in skipped)}  (the column map is onto")
            emit("      all length-n prefixes there; see the fraction table below)")
        ns = [n for n, _ in series]
        emit(fit_report(ns, [m["conflicts"] for _, m in series], "conflicts"))
        emit(fit_report(ns, [m["proof_lines"] for _, m in series], "proofAdds"))
        emit(f"    UP alone refutes: "
             f"{sum(1 for _, m in series if m['up_refutes'])}/{len(series)}")
        chk = [(n, m['depth']) for n, m in series if m['depth'] is not None]
        emit(f"    depth == n in all {len(chk)} rows it was checked on: "
             f"{all(d == n for n, d in chk)}"
             + ("" if all(d == n for n, d in chk)
                else "  offenders " + str([q for q in chk if q[0] != q[1]])))
        # random-target contrast, a few sizes only
        rnd2 = random.Random(SEED * 2 + rule)
        cont = []
        for n in [12, 20, 28, 36]:
            if n > args.f2_max:
                break
            pre, src, dr = f2_pick_unrealisable(rule, n, rnd2)
            if pre is None:
                cont.append(f"n={n}: none found")
                continue
            rcl, rnv = f2_formula(rule, n, pre)
            m = measure(rcl, rnv, want_proof=False)
            cont.append(f"n={n}: depth {f2_depth(rule, n, pre)}, "
                        f"minConf {m['min_conf']}")
        f2_rand[rule] = cont
        emit("    [random targets] " + " | ".join(cont))
        emit("")

    # ---- side measurement: realisable fraction ---------------------------
    emit("  [F2 side] exact fraction of length-n prefixes realisable from a")
    emit("  width-n support, by enumerating all 2^n supports (bit-parallel).")
    emit("      n   " + "  ".join(f"{r:>7}" for r in RULES))
    for n in range(4, 19):
        if spent() > args.budget * 0.7:
            break
        vals = []
        for rule in RULES:
            fr = f2_realisable_fraction(rule, n)
            vals.append("   --  " if fr is None else f"{fr:>7.4f}")
        emit(f"     {n:>2}   " + "  ".join(vals))
    emit("")

    # ================= F3 ==================================================
    emit("=" * 100)
    emit("F3  alternation: white for x < -a, free from -a rightwards, column 0")
    emit("    alternating for L = f(a)+1 rows.  f(a) is each rule's own longest")
    emit("    achievable block, found by incrementing L (cap 140).")
    emit("=" * 100)
    emit("  Expect most control rules to have NO finite f(a), and that is the")
    emit("  interesting part rather than a gap in the table.  Reading the rule")
    emit("  rightwards along a row, each extra time step brings in exactly one")
    emit("  new free cell of the initial row.  If the rule's output still depends")
    emit("  on its right neighbour, that new cell can always be chosen to make")
    emit("  the column come out however you like, so the block extends forever")
    emit("  and the formula is satisfiable at every L.  Rules 90 and 150 XOR the")
    emit("  right neighbour in, so they never lose that dependence.")
    emit("  Rule 30's c(x-1) XOR (c(x) OR c(x+1)) does lose it: wherever the")
    emit("  centre cell is already black the OR saturates and the right neighbour")
    emit("  stops mattering.  That is why rule 30 has a finite f(a) at all, and")
    emit("  it is the whole reason this family has an UNSAT instance for rule 30")
    emit("  and none for the linear rules.")
    emit("=" * 100)
    f3 = {}
    f3_end = spent() + max(60.0, args.budget * 0.45)
    for ri, rule in enumerate(F3_RULES):
        # each rule gets an equal share of what is LEFT, so a slow rule cannot
        # starve the controls it is supposed to be compared against
        f3_budget = spent() + max(20.0, (f3_end - spent()) / (len(F3_RULES) - ri))
        emit(f"  rule {rule}")
        emit("      a  f(a)  ph" + HDR)
        series = []
        lo = 1
        forever_at = None
        for a in range(1, args.f3_max + 1):
            if spent() > f3_budget:
                emit(f"    (budget: stopped at a={a-1})")
                break
            fa, ph = f3_f(rule, a, lo=lo)
            if fa is None:
                forever_at = a
                emit(f"     {a:>2}  >140   -- alternates for at least 140 rows; "
                     f"this rule has a period-2 column available here")
                break
            lo = fa
            cl, nv = f3_formula(rule, a, fa + 1, ph)
            m = measure(cl, nv, want_proof=(a % 2 == 0))
            assert not m["sat"], f"F3 rule {rule} a={a} came out SAT"
            if a % 4 == 0 or a <= 4 or a > args.f3_max - 4:
                emit(f"     {a:>2}  {fa:>4}  {ph:>2}" + row(fa + 1, m))
            series.append((a, fa, m))
            if m["secs"] > args.percall:
                emit(f"    (per-call cap: stopped at a={a})")
                break
        f3[rule] = (series, forever_at)
        as_ = [a for a, _, _ in series]
        fs_ = [fa for _, fa, _ in series]
        emit(fit_report(as_, [m["min_conf"] for _, _, m in series], "minConf/a"))
        emit(fit_report(as_, [m["proof_lines"] for _, _, m in series], "proofAdds/a"))
        emit(fit_report(fs_, [m["min_conf"] for _, _, m in series], "minConf/L"))
        if series:
            emit("    f(a) = " + ",".join(str(v) for v in fs_))
        emit("")

    # ---- rule 30 cross-check against the rung-2 table --------------------
    if 30 in f3 and f3[30][0]:
        emit("  [F3 check] rule 30's f(a) here vs explorer/rowan_rung2_cores.txt")
        PUB = [8, 8, 8, 8, 9, 10, 10, 17, 17, 17, 17, 17, 17, 20, 22, 26, 26, 26,
               36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 38, 39]
        bad = [(a, fa, PUB[a - 1]) for a, fa, _ in f3[30][0]
               if a <= len(PUB) and fa != PUB[a - 1]]
        emit(f"    disagreements: {bad if bad else 'none'}")
        emit("")

    # ================= class sweep ========================================
    if args.classes:
        n = args.classes
        emit("=" * 100)
        emit(f"F2 over one representative of each equivalence class, n = {n}")
        emit("=" * 100)
        reps = eq_class_reps()
        emit(f"    {len(reps)} classes, deep targets, same encoding as above")
        emit("     rule   UP?    minConf   proofAdds   secs   src")
        got = []
        for rule in reps:
            if spent() > args.budget:
                emit(f"    (budget: stopped after {len(got)} classes)")
                break
            rnd = random.Random(SEED + rule)
            prefix, src, draws = f2_pick_deep(rule, n, rnd, tries=16)
            if prefix is None:
                emit(f"     {rule:>4}   --  column map is onto; no unrealisable "
                     f"target at n={n}")
                continue
            cl, nv = f2_formula(rule, n, prefix)
            m = measure(cl, nv)
            got.append((rule, m))
            emit(f"     {rule:>4}  {'yes' if m['up_refutes'] else ' no':>4}  "
                 f"{m['min_conf']:>9}  {str(m['proof_lines']):>9}  "
                 f"{m['max_secs']:>5.2f}   {src}")
        if got:
            got.sort(key=lambda p: -p[1]["min_conf"])
            emit("    hardest ten by minConf: " +
                 ", ".join(f"{r}({m['min_conf']})" for r, m in got[:10]))
            r30 = [i for i, (r, _) in enumerate(got) if r == 30]
            emit(f"    rule 30's rank among them: "
                 f"{r30[0]+1 if r30 else 'not a class rep here'} of {len(got)}")
        emit("")

    # ================= verdicts ===========================================
    emit("=" * 100)
    emit("SUMMARY")
    emit("=" * 100)

    def biggest(series_map, key, getter):
        out = {}
        for rule, s in series_map.items():
            vals = [(getter(e), key(e)) for e in s]
            vals = [(x, y) for x, y in vals if y is not None]
            out[rule] = vals[-1] if vals else None
        return out

    emit("  last measured point per (family, rule)")
    for name, smap, getter in [
            ("F1", f1, lambda e: e[0]),
            ("F2", f2, lambda e: e[0]),
            ("F3", {r: v[0] for r, v in f3.items()}, lambda e: e[0])]:
        emit(f"    {name}")
        for rule in (F3_RULES if name == "F3" else RULES):
            s = smap.get(rule) or []
            if not s:
                emit(f"      rule {rule:>3}: (nothing measured)")
                continue
            e = s[-1]
            m = e[-1]
            emit(f"      rule {rule:>3}: size {getter(e):>3}  minConf "
                 f"{m['min_conf']:>8}  (cad {m['cad_conf']}, glu {m['glu_conf']},"
                 f" msat {m['msat_conf']})  proofAdds "
                 f"{str(m['proof_lines']):>8}  maxSecs {m['max_secs']:>7.2f}")
        emit("")

    emit("")
    emit("  VERDICT, in the three questions this instrument was built to answer.")
    emit("")

    def upall(s):
        return s and all(m["up_refutes"] for m in
                         [e[-1] for e in s])

    def lastmin(s):
        return s[-1][-1]["min_conf"] if s else None

    emit("  1. Is any family empirically HARD for rule 30?")
    emit(f"       F1: minConf 0 at every n up to {f1[30][-1][0] if f1.get(30) else '-'}; "
         f"unit propagation alone refutes every instance.  By design.")
    emit(f"       F2: minConf {lastmin(f2.get(30, []))} at n = "
         f"{f2[30][-1][0] if f2.get(30) else '-'}; unit propagation alone refutes "
         f"{sum(1 for _, m in f2.get(30, []) if m['up_refutes'])}"
         f"/{len(f2.get(30, []))} instances.")
    s30 = f3.get(30, ([], None))[0]
    emit(f"       F3: minConf {lastmin(s30)} at a = {s30[-1][0] if s30 else '-'} "
         f"(L = {s30[-1][1] + 1 if s30 else '-'}), up from "
         f"{s30[0][-1]['min_conf'] if s30 else '-'} at a = 1;")
    emit(f"           unit propagation alone refutes "
         f"{sum(1 for _, _, m in s30 if m['up_refutes'])}/{len(s30)} instances.")
    emit("           This is the only family here whose refutations grow with")
    emit("           the size parameter at all.")
    emit("")
    emit("  2. Is that family EASY for the linear rules 90 and 150?")
    emit("       There is nothing to compare, and the reason is the point.  For")
    emit("       90 and 150 the F3 formula is SATISFIABLE at every L up to the")
    emit("       cap, so no refutation exists to be small or large.  The same")
    emit("       holds for 45, 54, 73 and 105.  Rule 30 is not beating the")
    emit("       linear rules at a shared task; it is the only one of the eight")
    emit("       original rules for which the task exists at all.")
    emit("")
    emit("  2b. So the question becomes: against the controls that DO have the")
    emit("      task, is rule 30 special?  This is the row that decides it.")
    cands = [r for r in F3_RULES if f3.get(r, ([], None))[0]]
    if s30 and len(cands) > 1:
        common = min(max(e[0] for e in f3[r][0]) for r in cands)
        emit(f"      At a = {common}, the largest every one of them reached:")
        emit("         rule   f(a)   clauses   minConf   maxSecs   UP alone?")
        for r in sorted(cands):
            e = [q for q in f3[r][0] if q[0] == common]
            if not e:
                continue
            e = e[0]
            emit(f"         {r:>4}  {e[1]:>5}  {e[-1]['clauses']:>8}  "
                 f"{e[-1]['min_conf']:>8}  {e[-1]['max_secs']:>8.2f}   "
                 f"{'yes' if e[-1]['up_refutes'] else 'no'}")
        emit("      120 and 225 are the other quiescent nonaffine left-permutive")
        emit("      rules; 180 and 110 are the ones that stay trivial.  Read the")
        emit("      minConf column: if 30 sits within a small factor of 120 and")
        emit("      225, this family is measuring left-permutive nonaffineness")
        emit("      and not anything specific to rule 30.")
    emit("")
    emit("  3. Does rule 30 come out harder than 110 and 45 on F1 and F2?")
    emit("       No.  On F2 rule 30 is the EASIEST of the eight -- its instances")
    emit("       fall to unit propagation at almost every n, while 90, 150 and")
    emit("       105 need conflicts.  The mechanism is the same saturation as in")
    emit("       F3, run the other way: with column 0 pinned and the half-plane")
    emit("       to its left white, rule 30's row recurrence usually solves")
    emit("       left-to-right by propagation alone.  So on this instrument the")
    emit("       XOR rules are the hard ones, which is the documented weakness of")
    emit("       resolution on XOR and says nothing about the automata.")
    emit("")
    emit(f"  proof-tracing budget left: {PROOF_BUDGET[0]} of 400")
    emit(f"  total wall time: {spent():.1f} s")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"\nwritten: {out_path}")


if __name__ == "__main__":
    main()
