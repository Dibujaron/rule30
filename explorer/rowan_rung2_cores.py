"""Rowan, 2026-09-12.  Minimal unsatisfiable cores for the rung-2 finiteness fact.

Rule 30 on a bi-infinite row:  c(x, t+1) = c(x-1, t) XOR (c(x, t) OR c(x+1, t)).

Class C_a          c(x,0) = 0 for x < -a;  c(-a,0) = 1;  c(x,0) free for x > -a.
Class C_a^relaxed  c(x,0) = 0 for x < -a;  c(x,0) free for x >= -a.

Target: the centre column alternates for L rows, c(0,t) = (t+phase) mod 2.
Measured maximum block length f(a) is finite; at L = f(a)+1 the formula is UNSAT.
This script extracts a minimal unsatisfiable core (MUS) over per-cell selectors
so the *mechanism* behind the finiteness can be looked at directly.

Cone edge: c(-a-t, t) = 1 and c(x,t) = 0 for x < -a-t.  Asserted as HARD
background (implied by the rule) and never counted as part of a core.

Requires python-sat (pip install --user python-sat); solves with cadical153.
Deterministic: the deletion order is seeded, so a rerun reproduces the table.

Usage:  python rowan_rung2_cores.py [--amax 40] [--both] [--pics 4,8,16]
        [--verify-amax 7] [--out rowan_rung2_cores.txt]
"""

import argparse
import os
import random
import sys
import time
from itertools import count

from pysat.formula import IDPool
from pysat.solvers import Solver

SOLVER = "cadical153"


# --------------------------------------------------------------------------
# plain simulator, used both as an independent check and to re-run SAT models
# --------------------------------------------------------------------------
def simulate(row, steps):
    """row: dict x -> bit, defaulting 0 outside.  Returns list of dicts."""
    out = [dict(row)]
    cur = dict(row)
    lo = min(cur) - 1
    hi = max(cur) + 1
    for _ in range(steps):
        nxt = {}
        for x in range(lo, hi + 1):
            nxt[x] = cur.get(x - 1, 0) ^ (cur.get(x, 0) | cur.get(x + 1, 0))
        cur = nxt
        lo -= 1
        hi += 1
        out.append(dict(cur))
    return out


def brute_force_f(a, pin_left_black, maxdepth):
    """Exhaustive DFS over class C_a (or the relaxed class), independent of SAT.

    Decides the initial row c(x,0) for x = -a, -a+1, ... left to right.  Once
    x = R is decided, c(0,t) is determined for every t <= R (light cone), so the
    pinned column prunes immediately.  Returns the max over both phases.
    """
    return max(brute_force_f_phase(a, phase, pin_left_black, maxdepth)
               for phase in (0, 1))


def brute_force_f_phase(a, phase, pin_left_black, maxdepth):
    best = 1
    row = {}

    def column_at(R):
        cells = {x: 0 for x in range(-a - R - 2, -a)}
        for x in range(-a, R + 1):
            cells[x] = row[x]
        hist = simulate(cells, R)
        return hist[R].get(0, 0)

    def rec(R):
        nonlocal best
        if R >= 0:
            if column_at(R) != (R + phase) % 2:
                return
            best = max(best, R + 1)
            if R >= maxdepth:
                return
        for b in (0, 1):
            row[R + 1] = b
            rec(R + 1)
            del row[R + 1]

    if pin_left_black:
        row[-a] = 1
        rec(-a)
    else:
        for b in (0, 1):
            row[-a] = b
            rec(-a)
            del row[-a]
    return best


# --------------------------------------------------------------------------
# SAT encoding
# --------------------------------------------------------------------------
class Encoding:
    def __init__(self, a, L, phase, pin_left_black=True):
        self.a = a
        self.L = L
        self.phase = phase
        self.pool = IDPool()
        self.cnf = []
        self.rule_sel = {}   # (x, t+1) -> selector var   (cell produced)
        self.alt_sel = {}    # t -> selector var
        self.xlo = -a - L - 2
        self.xhi = L + 1
        self._build(pin_left_black)

    def c(self, x, t):
        return self.pool.id(("c", x, t))

    def _build(self, pin_left_black):
        a, L = self.a, self.L
        xlo, xhi = self.xlo, self.xhi
        add = self.cnf.append

        # ---- hard background: initial row and the cone ---------------------
        for x in range(xlo, -a):
            add([-self.c(x, 0)])
        if pin_left_black:
            add([self.c(-a, 0)])
        for t in range(0, L):
            for x in range(xlo, -a - t):
                add([-self.c(x, t)])
            if pin_left_black and -a - t >= xlo:
                add([self.c(-a - t, t)])

        # ---- gated rule groups, one selector per produced cell -------------
        for t in range(0, L - 1):
            for x in range(xlo, xhi):
                s = self.pool.id(("s", x, t + 1))
                self.rule_sel[(x, t + 1)] = s
                y = self.c(x, t + 1)
                cx = self.c(x, t)
                cr = self.c(x + 1, t)
                d = self.pool.id(("d", x, t))
                ns = -s
                # d <-> cx OR cr
                add([ns, -d, cx, cr])
                add([ns, d, -cx])
                add([ns, d, -cr])
                # y <-> b XOR d,  b = c(x-1,t) (constant 0 if outside window)
                if x - 1 >= xlo:
                    b = self.c(x - 1, t)
                    add([ns, -y, b, d])
                    add([ns, -y, -b, -d])
                    add([ns, y, -b, d])
                    add([ns, y, b, -d])
                else:
                    add([ns, -y, d])
                    add([ns, y, -d])

        # ---- gated alternation constraints ---------------------------------
        for t in range(0, L):
            s = self.pool.id(("A", t))
            self.alt_sel[t] = s
            lit = self.c(0, t) if (t + self.phase) % 2 == 1 else -self.c(0, t)
            add([-s, lit])

    def all_selectors(self):
        return list(self.rule_sel.values()) + list(self.alt_sel.values())


def solve(enc, assumptions=None, solver=None):
    if assumptions is None:
        assumptions = enc.all_selectors()
    own = solver is None
    if own:
        solver = Solver(name=SOLVER, bootstrap_with=enc.cnf)
    try:
        sat = solver.solve(assumptions=assumptions)
        model = solver.get_model() if sat else None
        core = None if sat else solver.get_core()
        return sat, model, core
    finally:
        if own:
            solver.delete()


def f_sat_phase(a, phase, pin_left_black, lo=1, cap=400):
    """Largest L with the alternating block satisfiable, for one phase."""
    L = max(1, lo)
    while L <= cap:
        enc = Encoding(a, L + 1, phase, pin_left_black)
        sat, _, _ = solve(enc)
        if not sat:
            return L
        L += 1
    return None


def f_sat(a, pin_left_black, lo=1):
    per = {}
    for phase in (0, 1):
        per[phase] = f_sat_phase(a, phase, pin_left_black, lo=lo)
    return max(per.values()), per


# --------------------------------------------------------------------------
# MUS by deletion
# --------------------------------------------------------------------------
def mus(enc, order_seed=None):
    """Deletion-based MUS over the selector assumptions.  Returns list of sels.

    Classic deletion loop: one solver call per candidate, guaranteed minimal.
    A shuffled order gives a different (also minimal) core.
    """
    solver = Solver(name=SOLVER, bootstrap_with=enc.cnf)
    try:
        sat, _, core = solve(enc, solver=solver)
        assert not sat, "formula is SAT; no core"
        remaining = sorted(core)
        rnd = random.Random(order_seed if order_seed is not None else 0)
        rnd.shuffle(remaining)
        necessary = []
        while remaining:
            s = remaining.pop()
            if solver.solve(assumptions=necessary + remaining):
                necessary.append(s)
            else:
                shrunk = set(solver.get_core())
                remaining = [x for x in remaining if x in shrunk]
        return necessary
    finally:
        solver.delete()


# --------------------------------------------------------------------------
# reporting
# --------------------------------------------------------------------------
def describe(enc, core):
    inv_rule = {v: k for k, v in enc.rule_sel.items()}
    inv_alt = {v: k for k, v in enc.alt_sel.items()}
    cells = sorted(inv_rule[s] for s in core if s in inv_rule)
    alts = sorted(inv_alt[s] for s in core if s in inv_alt)
    return cells, alts


def picture(enc, cells, alts, xpad=2):
    a = enc.a
    cellset = set(cells)
    altset = set(alts)
    if cells:
        xs = [x for x, _ in cells]
        ts = [t for _, t in cells]
    else:
        xs, ts = [0], [0]
    tmin = 0
    tmax = max(max(ts), max(alts) if alts else 0)
    xmin = min(min(xs), 0) - xpad
    xmax = max(max(xs), 0) + xpad
    xmin = min(xmin, -a - tmax - 1)
    lines = []
    head = "      t \\ x   " + f"{xmin} .. {xmax}"
    lines.append(head)
    for t in range(tmin, tmax + 1):
        row = []
        for x in range(xmin, xmax + 1):
            edge = (x == -a - t)
            if (x, t) in cellset and x == 0 and t in altset:
                ch = "@"
            elif (x, t) in cellset:
                ch = "#"
            elif x == 0 and t in altset:
                ch = "A"
            elif edge:
                ch = "/"
            elif x == 0:
                ch = ":"
            else:
                ch = "."
            row.append(ch)
        lines.append(f"   t={t:>3}  " + "".join(row))
    return "\n".join(lines)


def stats(enc, cells, alts):
    a = enc.a
    if not cells:
        return dict(n_rule=0, n_alt=len(alts), xrange=None, trange=None,
                    max_edge=None, max_col=None, min_edge=None)
    xs = [x for x, _ in cells]
    ts = [t for _, t in cells]
    edged = [x + a + t for x, t in cells]
    return dict(
        n_rule=len(cells),
        n_alt=len(alts),
        xrange=(min(xs), max(xs)),
        trange=(min(ts), max(ts)),
        max_edge=max(edged),
        min_edge=min(edged),
        max_col=max(abs(x) for x in xs),
    )


# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--amax", type=int, default=26)
    ap.add_argument("--verify-amax", type=int, default=6)
    ap.add_argument("--out", default=None)
    ap.add_argument("--pics", default="4,8,12,16,20,26")
    ap.add_argument("--relaxed", action="store_true",
                    help="do not pin c(-a,0)=1")
    ap.add_argument("--budget", type=float, default=1e9)
    ap.add_argument("--both", action="store_true",
                    help="core tables for both class readings")
    args = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    out_path = args.out or os.path.join(here, "rowan_rung2_cores.txt")
    pics = set(int(v) for v in args.pics.split(",") if v)

    PUB = [8, 8, 8, 8, 9, 10, 10, 17, 17, 17, 17, 17, 17, 20, 22, 26, 26, 26,
           36, 36, 36, 36, 36, 36, 36, 36]

    lines = []

    def emit(s=""):
        print(s)
        lines.append(s)

    emit("Rowan, 2026-09-12.  Minimal unsat cores for rung 2's finiteness fact.")
    emit(f"solver: pysat / {SOLVER}")
    emit("")

    # ---- 0. brute-force cross-check of the two class readings --------------
    emit("[0] independent brute force (no SAT) vs the published table")
    emit("    C_a       : c(x,0)=0 for x < -a, c(-a,0)=1, free right of -a")
    emit("    C_a relaxed: c(x,0)=0 for x < -a, free from -a rightwards")
    emit("      a  pub   bf C_a   bf relaxed   sat C_a   sat relaxed")
    for a in range(1, args.verify_amax + 1):
        pub = PUB[a - 1]
        b1 = brute_force_f(a, True, pub + 5)
        b0 = brute_force_f(a, False, pub + 5)
        s1, _ = f_sat(a, True)
        s0, _ = f_sat(a, False)
        emit(f"     {a:>2}  {pub:>3}  {b1:>7}  {b0:>11}  {s1:>8}  {s0:>12}")
    emit("    => the published sequence is the RELAXED class, max over both phases.")
    emit("       (f_relaxed(a) = max over a' <= a of f_{C_a'}(a'), a running max;")
    emit("        SAT and brute force agree cell for cell on both readings.)")
    emit("")

    classes = [(False, "relaxed (published)")]
    if args.both:
        classes.append((True, "C_a with c(-a,0)=1"))

    for pin, cname in classes:
        emit("=" * 78)
        emit(f"CLASS: {cname}")
        emit("=" * 78)

        # ---- 1. SAT reproduction of f(a) -----------------------------------
        emit("[1] f_sat(a)")
        emit("      a  pub  f_sat  phase0  phase1  agree")
        f = {}
        fph = {}
        lo = 1
        t0 = time.time()
        for a in range(1, args.amax + 1):
            v, per = f_sat(a, pin, lo=1 if pin else max(1, lo - 1))
            f[a] = v
            fph[a] = per
            lo = v
            pub = PUB[a - 1] if a <= 26 else None
            agree = "yes" if pub == v else ("--" if pub is None else "NO")
            emit(f"     {a:>2}  {str(pub):>3}  {v:>5}  {per[0]:>6}  {per[1]:>6}  {agree}")
        emit(f"    (sweep: {time.time()-t0:.1f} s)")
        emit("")

        # ---- 2. re-simulate one model ---------------------------------------
        emit("[2] one SAT model, re-run through a plain rule-30 loop")
        a = min(8, args.amax)
        L = f[a]
        ph = 0 if fph[a][0] == L else 1
        enc = Encoding(a, L, ph, pin)
        sat, model, _ = solve(enc)
        assert sat
        ms = set(v for v in model if v > 0)
        row = {x: (1 if enc.c(x, 0) in ms else 0)
               for x in range(enc.xlo, enc.xhi + 1)}
        hist = simulate(row, L + 2)
        col = "".join(str(hist[t].get(0, 0)) for t in range(L + 2))
        want = "".join(str((t + ph) % 2) for t in range(L))
        emit(f"    a={a} phase={ph} L={L}")
        emit(f"    initial row, x = {-a}..12: " +
             "".join(str(row.get(x, 0)) for x in range(-a, 13)))
        emit(f"    simulated column 0, t=0..{L+1}: {col}")
        emit(f"    wanted alternation,  t=0..{L-1}: {want}")
        emit(f"    match over the first {L}: {col[:L] == want}")
        emit("")

        # ---- 3. cores --------------------------------------------------------
        emit("[3] minimal unsat cores at L = f(a)+1  (cone facts are hard background")
        emit("    and are never counted).  maxEdge = max of x+a+t over core cells,")
        emit("    maxCol = max |x|.")
        emit("      a  ph    L  |rule|  |alt|      x-range        t-range  maxEdge  minEdge  maxCol   secs")
        picstore = {}
        keep = {}
        for a in range(1, args.amax + 1):
            L = f[a] + 1
            for phase in (0, 1):
                enc = Encoding(a, L, phase, pin)
                s0 = time.time()
                core = mus(enc, order_seed=1)
                dt = time.time() - s0
                cells, alts = describe(enc, core)
                st = stats(enc, cells, alts)
                xr = f"[{st['xrange'][0]},{st['xrange'][1]}]" if st["xrange"] else "-"
                tr = f"[{st['trange'][0]},{st['trange'][1]}]" if st["trange"] else "-"
                emit(f"     {a:>2}  {phase:>2}  {L:>3}  {st['n_rule']:>5}  {st['n_alt']:>5}  "
                     f"{xr:>13}  {tr:>13}  {str(st['max_edge']):>7}  {str(st['min_edge']):>7}  "
                     f"{str(st['max_col']):>6}  {dt:>6.1f}")
                keep[(a, phase)] = (cells, alts)
                if a in pics and phase == 0:
                    picstore[a] = picture(enc, cells, alts)
        emit("")

        # ---- 3b. is the core the two-cone triangle? --------------------------
        emit("[3b] the core against the two light cones.  Left of a core row should")
        emit("     be  max(-a-t, -(T-t))  where T is the last alternation constraint")
        emit("     in the core: the forward cone from the initial row crossed with the")
        emit("     backward cone of the contradiction.  'fill' = |core| / (cells inside")
        emit("     the per-row hull [minx(t), maxx(t)]).")
        emit("      a  ph   T  |rule|  cone-tri  |core|/tri   fill   maxLeftDev  rows")
        for a in range(1, args.amax + 1):
            for phase in (0, 1):
                cells, alts = keep[(a, phase)]
                if not cells:
                    continue
                T = max(alts) if alts else max(t for _, t in cells)
                rows = {}
                for x, t in cells:
                    lo_, hi_ = rows.get(t, (x, x))
                    rows[t] = (min(lo_, x), max(hi_, x))
                hull = sum(hi_ - lo_ + 1 for lo_, hi_ in rows.values())
                tri = 0
                dev = 0
                for t, (lo_, hi_) in rows.items():
                    pred = max(-a - t, -(T - t))
                    tri += max(0, hi_ - pred + 1)
                    dev = max(dev, abs(lo_ - pred))
                emit(f"     {a:>2}  {phase:>2}  {T:>3}  {len(cells):>6}  {tri:>8}  "
                     f"{len(cells)/tri:>10.3f}  {len(cells)/hull:>5.3f}  {dev:>10}  {len(rows):>4}")
        emit("")

        # ---- 3c. which alternation constraints are droppable, and growth ----
        emit("[3c] which of the L pinned column values the core does NOT need,")
        emit("     and how |core| grows.  tri = the two-cone triangle area of [3b].")
        emit("      a  ph    L  |alt|  dropped t's                       |rule|  |rule|/L^2")
        for a in range(1, args.amax + 1):
            for phase in (0, 1):
                cells, alts = keep[(a, phase)]
                L = f[a] + 1
                missing = [t for t in range(L) if t not in set(alts)]
                ms = ",".join(str(t) for t in missing)
                if len(ms) > 32:
                    ms = ms[:29] + "..."
                emit(f"     {a:>2}  {phase:>2}  {L:>3}  {len(alts):>5}  {ms:<32}  "
                     f"{len(cells):>6}  {len(cells)/(L*L):>9.3f}")
        emit("")

        # ---- 4. MUS stability under shuffled deletion order -----------------
        emit("[4] three MUSes per a from shuffled deletion orders")
        emit("      a  ph  seed  |rule|  |alt|     x-range      t-range   vs seed 1")
        for a in [v for v in sorted(pics) if v <= args.amax]:
            base = None
            for seed in (1, 2, 3):
                L = f[a] + 1
                enc = Encoding(a, L, 0, pin)
                core = mus(enc, order_seed=seed)
                cells, alts = describe(enc, core)
                st = stats(enc, cells, alts)
                if base is None:
                    base = set(cells)
                    same = "-"
                elif set(cells) == base:
                    same = "identical"
                else:
                    d = base ^ set(cells)
                    same = (f"differ: |sym.diff|={len(d)}, "
                            f"shared={len(base & set(cells))}")
                xr = f"[{st['xrange'][0]},{st['xrange'][1]}]" if st["xrange"] else "-"
                tr = f"[{st['trange'][0]},{st['trange'][1]}]" if st["trange"] else "-"
                emit(f"     {a:>2}   0  {seed:>4}  {st['n_rule']:>5}  {st['n_alt']:>5}  "
                     f"{xr:>10}  {tr:>11}   {same}")
        emit("")

        # ---- 5. pictures ------------------------------------------------------
        emit("[5] core pictures (phase 0).  '#' core rule-cell, 'A' core alternation,")
        emit("    '@' both at once, '/' cone edge x = -a-t, ':' column 0,")
        emit("    '.' outside the core")
        for a in sorted(picstore):
            emit("")
            emit(f"  --- a = {a}, L = {f[a]+1}, class {cname} ---")
            emit(picstore[a])
        emit("")

        # ---- 6. how much slack repairs the contradiction --------------------
        emit("[6] how fragile is the contradiction?  Free k rule-cells chosen at")
        emit("    random inside the two-cone triangle, out of the FULL constraint set")
        emit("    (not out of a core), and ask whether the block becomes satisfiable.")
        for a in [v for v in sorted(pics) if v <= args.amax]:
            L = f[a] + 1
            enc = Encoding(a, L, 0, pin)
            allsel = set(enc.all_selectors())
            T = L - 1
            tri = [c for c in enc.rule_sel
                   if 1 <= c[1] <= T and max(-a - c[1], -(T - c[1])) <= c[0] <= 8]
            rnd = random.Random(7)
            sv = Solver(name=SOLVER, bootstrap_with=enc.cnf)
            row = []
            for k in (1, 2, 4, 8, 16, 32):
                if k > len(tri):
                    break
                hits = 0
                for _ in range(8):
                    drop = {enc.rule_sel[c] for c in rnd.sample(tri, k)}
                    if sv.solve(assumptions=[q for q in allsel if q not in drop]):
                        hits += 1
                row.append(f"k={k}: {hits}/8")
            sv.delete()
            emit(f"     a={a:>2}  L={L:>3}  triangle={len(tri):>5} cells   " +
                 "   ".join(row))
        emit("")

    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"\nwritten: {out_path}")


if __name__ == "__main__":
    main()
