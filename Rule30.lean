/-
# Rule 30

Root module. Importing `Rule30` pulls in the whole Lean core of the project:

* `Rule30.Basic` — the 256 elementary cellular automata, rule 30, the center
  column, and the bridging lemma `rule30_eq`. No `sorry`s.
* `Rule30.Prize` — Wolfram's three Rule 30 Prize conjectures. Three `sorry`s,
  by design.
* `Rule30.Statements` — seed lemmas for the harness to dispatch. All `sorry`,
  by design: this file states, `Rule30/Proofs/` proves.

Those two files are the only places a `sorry` is permitted.
-/
import Rule30.Basic
import Rule30.Prize
import Rule30.Statements
