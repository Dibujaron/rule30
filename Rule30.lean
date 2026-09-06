/-
# Rule 30

Root module. Importing `Rule30` pulls in the whole Lean core of the project:

* `Rule30.Basic` — the 256 elementary cellular automata, rule 30, the center
  column, and the bridging lemma `rule30_eq`. No `sorry`s.
* `Rule30.Prize` — Wolfram's three Rule 30 Prize conjectures. Three `sorry`s,
  by design.
* `Rule30.Strip` — a finite block of adjacent columns as a finite-state
  machine, the definitions behind Jen's theorem. No `sorry`s.
* `Rule30.Statements` — seed lemmas for the harness to dispatch. All `sorry`,
  by design: this file states, `Rule30/Proofs/` proves.
* `Rule30.Proofs` — every closed node's proof, so a root build checks them
  too. The dispatcher maintains that file's import list.

Those two `sorry` files are the only places a `sorry` is permitted.
-/
import Rule30.Basic
import Rule30.Prize
import Rule30.Strip
import Rule30.Statements
import Rule30.Proofs
