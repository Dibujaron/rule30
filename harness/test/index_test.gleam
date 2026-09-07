import gleam/option.{None}
import harness/dag.{type Node, Dag, Node}
import harness/index.{Signature}

const note = "**What this says.** The left edge is black at every time.
**Why it is true.** Its left neighbour is outside the cone.
**Where the work is.** Nowhere; two rewrites."

pub fn what_it_says_takes_the_first_sentence_of_the_note_test() {
  assert index.what_it_says(note) == Ok("The left edge is black at every time.")
}

pub fn what_it_says_joins_a_wrapped_sentence_onto_one_line_test() {
  let wrapped =
    "**What this says.** A one-bit machine whose drivers
repeat with period `p` itself repeats with period `2p`.
**Why it is true.** One cycle is a self-map of Bool."
  assert index.what_it_says(wrapped)
    == Ok(
      "A one-bit machine whose drivers repeat with period `p` itself repeats with period `2p`.",
    )
}

pub fn what_it_says_is_absent_from_a_note_without_the_heading_test() {
  assert index.what_it_says("Some prose with no headings.") == Error(Nil)
}

const statements = "namespace Statements

/-- **Outside the light cone, nothing happens.** After `t` steps every cell
farther than `t` from the origin is still white. -/
theorem evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : (t : ℤ) < |i|) :
    evolve t i = false := by
  sorry

/-- **The left edge is always black.** -/
theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by
  sorry

theorem undocumented : True := by
  sorry
"

pub fn docstring_lead_is_the_bold_sentence_above_the_declaration_test() {
  assert index.docstring_lead(statements, "evolve_left_edge")
    == Ok("The left edge is always black.")
  assert index.docstring_lead(statements, "evolve_eq_false_of_outside_cone")
    == Ok("Outside the light cone, nothing happens.")
}

pub fn docstring_lead_does_not_borrow_a_neighbours_docstring_test() {
  // `undocumented` has no `/--` block of its own; the one above
  // `evolve_left_edge` must not be read as its lead.
  assert index.docstring_lead(statements, "undocumented") == Error(Nil)
}

pub fn docstring_lead_matches_the_whole_name_test() {
  assert index.docstring_lead(statements, "evolve_left") == Error(Nil)
}

const checked_proof = "import Rule30.Basic

/-!
**What this says.** The left edge is black at every time.
**Why it is true.** Its left neighbour is outside the cone.
**Where the work is.** Nowhere.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolve_left_edge (t : ℕ) : evolve t (-↑t) = true
```
-/

theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by
  sorry
"

pub fn checked_type_is_the_fenced_block_under_the_harness_heading_test() {
  assert index.checked_type(checked_proof)
    == Ok("Statements.evolve_left_edge (t : ℕ) : evolve t (-↑t) = true")
}

pub fn checked_type_is_absent_from_an_unannotated_proof_test() {
  assert index.checked_type(
      "import Rule30.Basic\n\n/-!\n**What this says.** x\n-/\n",
    )
    == Error(Nil)
}

pub fn signature_splits_binders_from_the_conclusion_test() {
  assert index.signature(
      "Statements.evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : ↑t < |i|) : evolve t i = false",
    )
    == Signature(
      hypotheses: ["(t : ℕ)", "(i : ℤ)", "(h : ↑t < |i|)"],
      conclusion: "evolve t i = false",
    )
}

pub fn signature_keeps_a_colon_inside_a_binder_out_of_the_split_test() {
  // Lean wraps a long checked signature; the split is on the first `:`
  // at bracket depth zero, not the first `:` anywhere.
  assert index.signature(
      "Statements.bool_driven (a b x : ℕ → Bool) (p N j : ℕ)\n  (hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i))) (hNj : N ≤ j) : PeriodicFrom x p (j + 1)",
    )
    == Signature(
      hypotheses: [
        "(a b x : ℕ → Bool)", "(p N j : ℕ)",
        "(hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i)))", "(hNj : N ≤ j)",
      ],
      conclusion: "PeriodicFrom x p (j + 1)",
    )
}

pub fn signature_of_a_seeded_declaration_drops_the_proof_opener_test() {
  // `seed.declaration_without_proof` yields `theorem name ... := by`; the
  // signature is the same shape once `theorem ` and `:= by` are gone.
  assert index.signature(
      "theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by",
    )
    == Signature(
      hypotheses: ["(t : ℕ)"],
      conclusion: "evolve t (-(t : ℤ)) = true",
    )
}

pub fn signature_with_no_binders_has_no_hypotheses_test() {
  assert index.signature("Statements.harness_probe : True")
    == Signature(hypotheses: [], conclusion: "True")
}

fn node(id: String, deps: List(String), size: dag.Size) -> Node {
  Node(
    id:,
    region: "P1",
    lean_name: id,
    description: "d " <> id,
    deps:,
    status: dag.Proved,
    size:,
    proof_file: None,
    attempts: [],
    verified: None,
    claimed_by: None,
    claimed_at: None,
    claimed_run: None,
    object: None,
  )
}

pub fn imports_of_lists_every_import_line_test() {
  assert index.imports_of(
      "import Rule30.Basic\nimport Rule30.Proofs.EvolveLeftEdge\n\n/-! x -/\ntheorem t : True := by trivial\n",
    )
    == ["Rule30.Basic", "Rule30.Proofs.EvolveLeftEdge"]
}

pub fn cited_by_names_the_nodes_whose_proofs_import_this_one_test() {
  let d =
    Dag([
      node("evolve_left_edge", [], dag.S),
      node("evolve_left_second_diagonal", ["evolve_left_edge"], dag.S),
      node("evolve_left_third_diagonal", ["evolve_left_edge"], dag.S),
    ])
  let proofs = [
    #("EvolveLeftEdge.lean", "import Rule30.Basic\n"),
    #(
      "EvolveLeftSecondDiagonal.lean",
      "import Rule30.Basic\nimport Rule30.Proofs.EvolveLeftEdge\n",
    ),
    #(
      "EvolveLeftThirdDiagonal.lean",
      "import Rule30.Basic\nimport Rule30.Proofs.EvolveLeftEdge\n",
    ),
  ]
  let citers = index.cited_by(d, proofs)
  let assert Ok(edge) = dag.get(d, "evolve_left_edge")
  let assert Ok(second) = dag.get(d, "evolve_left_second_diagonal")
  assert citers(edge)
    == ["evolve_left_second_diagonal", "evolve_left_third_diagonal"]
  assert citers(second) == []
}

pub fn cited_by_ignores_a_dep_that_is_declared_but_not_imported_test() {
  // A citation is an `import` line in a proof file, not an entry in `deps`:
  // the file is what `lake build` checked.
  let d = Dag([node("a", [], dag.S), node("b", ["a"], dag.S)])
  let citers =
    index.cited_by(d, [#("A.lean", ""), #("B.lean", "import Rule30.Basic\n")])
  let assert Ok(a) = dag.get(d, "a")
  assert citers(a) == []
}

pub fn walls_over_lists_the_walls_a_node_sits_under_transitively_test() {
  let d =
    Dag([
      node("leaf", [], dag.S),
      node("middle", ["leaf"], dag.M),
      node("wall_a", ["middle"], dag.Wall),
      node("wall_b", ["leaf"], dag.Wall),
      node("elsewhere", [], dag.S),
    ])
  let walls = index.walls_over(d)
  let assert Ok(leaf) = dag.get(d, "leaf")
  let assert Ok(middle) = dag.get(d, "middle")
  let assert Ok(elsewhere) = dag.get(d, "elsewhere")
  let assert Ok(wall_a) = dag.get(d, "wall_a")
  assert walls(leaf) == ["wall_a", "wall_b"]
  assert walls(middle) == ["wall_a"]
  assert walls(elsewhere) == []
  // A wall does not sit under itself.
  assert walls(wall_a) == []
}
