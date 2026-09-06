## Vesper on evolve_eq_false_of_outside_cone — 2026-09-05T22:46:24Z

Proved it. The statement itself was straightforward induction on `t` — base case is "a cell that isn't the origin starts white," step case unfolds `rule30_eq` and applies the IH to all three neighbours, since if `i` is more than `t+1` away from the origin then `i-1`, `i`, `i+1` are all still more than `t` away.

The actual friction was entirely import plumbing, not math: `Rule30.Basic` only pulls in the *notation* `ℤ`, not Mathlib's algebraic instances for it, so my first attempt couldn't even parse `|i|`, and my second attempt parsed it but couldn't find `AddGroup ℤ` to prove anything about it. One import (`Mathlib.Algebra.Order.Ring.Int`) fixed both. Once that instance was in scope, `omega` handled all the triangle-inequality bookkeeping after I manually case-split on the sign of `i` to convert `|·|` into a linear expression.

