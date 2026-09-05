/-
# Rule 30

Root module. Importing `Rule30` pulls in the whole Lean core of the project:

* `Rule30.Basic` — the 256 elementary cellular automata, rule 30, the center
  column, and the bridging lemma `rule30_eq`. No `sorry`s.
* `Rule30.Prize` — Wolfram's three Rule 30 Prize conjectures. Three `sorry`s,
  and those are the only ones the project permits.
-/
import Rule30.Basic
import Rule30.Prize
